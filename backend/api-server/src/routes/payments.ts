import { Router, type IRouter, type Request } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getAuthenticatedUser, requireAuthenticatedUser } from "../middleware/auth";
import { verifySvixSignature } from "../lib/svix";
import crypto from "crypto";
import * as crc32 from "buffer-crc32";
import https from "https";

import { ordersController } from "../lib/paypal";
import { CheckoutPaymentIntent } from "@paypal/paypal-server-sdk";
import { createRateLimit } from "../middleware/rate-limit";

const router: IRouter = Router();

const USD_PRICES: Record<string, number> = {
  free: 0,
  starter: 1,
  professional: 37,
  agency: 92,
};

type PlanSlug = "free" | "starter" | "professional" | "agency";

function isPaidPlanSlug(value: unknown): value is PlanSlug {
  return value === "free" || value === "starter" || value === "professional" || value === "agency";
}

const paymentWriteRateLimit = createRateLimit({
  key: "payments-write",
  max: 30,
  windowMs: 1000 * 60 * 15,
  failOpen: false,
});

function downloadCertificate(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      })
      .on("error", reject);
  });
}

const certCache = new Map<string, { cert: string; expiresAt: number }>();

async function verifyPayPalSignature({
  body,
  headers,
  webhookId,
}: {
  body: Buffer;
  headers: Record<string, string | string[] | undefined>;
  webhookId: string;
}): Promise<boolean> {
  const transmissionId = headers["paypal-transmission-id"] as string;
  const transmissionTime = headers["paypal-transmission-time"] as string;
  const certUrl = headers["paypal-cert-url"] as string;
  const signature = headers["paypal-transmission-sig"] as string;

  if (!transmissionId || !transmissionTime || !certUrl || !signature) {
    return false;
  }

  const checksum = crc32.unsigned(body).toString();
  const expected = [transmissionId, transmissionTime, webhookId, checksum].join("|");

  let certificate: string;
  const cached = certCache.get(certUrl);
  if (cached && cached.expiresAt > Date.now()) {
    certificate = cached.cert;
  } else {
    certificate = await downloadCertificate(certUrl);
    certCache.set(certUrl, { cert: certificate, expiresAt: Date.now() + 60 * 60 * 1000 });
  }

  const verifier = crypto.createVerify("RSA-SHA256");
  verifier.update(expected);
  verifier.end();

  return verifier.verify(certificate, signature, "base64");
}

router.get("/payments/health", (req, res) => {
  return res.json({ status: "ok", paypalConfigured: !!process.env.PAYPAL_CLIENT_ID });
});

type RequestWithRawBody = Request & {
  rawBody?: Buffer;
};

router.post("/payments/paypal/webhook", async (req, res) => {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID?.trim();
  if (!webhookId) {
    req.log.error("PAYPAL_WEBHOOK_ID is not configured");
    return res.status(500).json({ message: "Webhook ID is not configured" });
  }

  const rawBody = (req as RequestWithRawBody).rawBody;
  if (!rawBody) {
    req.log.warn("PayPal webhook missing raw body");
    return res.status(400).json({ message: "Missing request body" });
  }

  // Verify PayPal webhook signature with proper CRC32 and certificate
  const isValid = await verifyPayPalSignature({
    body: rawBody,
    headers: req.headers,
    webhookId,
  });

  if (!isValid) {
    req.log.warn("PayPal webhook signature verification failed");
    return res.status(400).json({ message: "Invalid webhook signature" });
  }

  const eventType = req.body.event_type;
  if (eventType !== "PAYMENT.CAPTURE.COMPLETED" && eventType !== "PAYMENT.SALE.COMPLETED") {
    return res.json({ received: true, processed: false });
  }

  const purchaseUnits = req.body.resource?.purchase_units;
  if (!purchaseUnits || purchaseUnits.length === 0) {
    req.log.warn("PayPal webhook missing purchase units");
    return res.json({ received: true, processed: false });
  }

  const description = purchaseUnits[0].description;
  const customId = purchaseUnits[0].custom_id;

  // Parse plan from description or custom_id
  let planSlug: string | null = null;
  if (description) {
    if (description.includes("Free")) planSlug = "free";
    else if (description.includes("Starter")) planSlug = "starter";
    else if (description.includes("Professional")) planSlug = "professional";
    else if (description.includes("Agency")) planSlug = "agency";
  }

  if (!planSlug && customId) {
    planSlug = customId;
  }

  if (!planSlug || !isPaidPlanSlug(planSlug)) {
    req.log.warn({ description, customId }, "PayPal webhook missing valid plan");
    return res.json({ received: true, processed: false });
  }

  // Get payer email to find user
  const payerEmail = req.body.payer?.email_address;
  if (!payerEmail) {
    req.log.warn("PayPal webhook missing payer email");
    return res.json({ received: true, processed: false });
  }

  // Find user by email
  const users = await db.select().from(usersTable).where(eq(usersTable.email, payerEmail));
  if (users.length === 0) {
    req.log.warn({ payerEmail }, "PayPal webhook: user not found");
    return res.json({ received: true, processed: false });
  }

  const user = users[0];

  await db
    .update(usersTable)
    .set({
      plan: planSlug,
      updatedAt: new Date(),
    })
    .where(eq(usersTable.id, user.id));

  req.log.info(
    {
      userId: user.id,
      email: payerEmail,
      plan: planSlug,
    },
    "Applied paid PayPal plan from webhook",
  );
  return res.json({ received: true, processed: true });
});

router.post("/payments/paypal/create-order", paymentWriteRateLimit, requireAuthenticatedUser, async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ message: "Authentication required" });

  const planSlug = req.body?.plan;
  if (!isPaidPlanSlug(planSlug)) {
    return res.status(400).json({ message: "Choose a valid plan to continue to payment." });
  }

  const usdPrice = USD_PRICES[planSlug];
  if (usdPrice === undefined) {
    return res.status(400).json({ message: "Invalid plan selected." });
  }

  const priceValue = usdPrice.toFixed(2);

  try {
    const { result } = await ordersController.createOrder({
      body: {
        intent: CheckoutPaymentIntent.Capture,
        purchaseUnits: [
          {
            amount: {
              currencyCode: "USD",
              value: priceValue,
            },
            description: `SEOaxe ${planSlug.charAt(0).toUpperCase() + planSlug.slice(1)} Plan`,
            customId: planSlug,
          },
        ],
      },
    });

    return res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to create PayPal order");
    return res.status(500).json({ message: "Could not start PayPal payment." });
  }
});

router.post("/payments/paypal/capture-order", paymentWriteRateLimit, requireAuthenticatedUser, async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ message: "Authentication required" });

  const { orderId } = req.body;
  if (!orderId) {
    return res.status(400).json({ message: "Order ID is required." });
  }

  try {
    const { result } = await ordersController.captureOrder({
      id: orderId,
    });

    if (result.status === "COMPLETED") {
      const purchaseUnit = result.purchaseUnits?.[0];
      const planSlug = purchaseUnit?.customId;

      if (planSlug && isPaidPlanSlug(planSlug)) {
        await db
          .update(usersTable)
          .set({
            plan: planSlug,
            updatedAt: new Date(),
          })
          .where(eq(usersTable.id, user.id));

        req.log.info({ userId: user.id, plan: planSlug }, "Applied paid PayPal plan after capture");
      }
    }

    return res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to capture PayPal order");
    return res.status(500).json({ message: "Could not complete PayPal payment." });
  }
});

export default router;
