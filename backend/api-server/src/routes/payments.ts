import { Router, type IRouter, type Request } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getAuthenticatedUser, requireAuthenticatedUser } from "../middleware/auth";
import {
  STITCH_PAYMENT_PLANS,
  StitchApiError,
  StitchConfigurationError,
  appendConfiguredRedirectUrl,
  buildStitchMerchantReference,
  createStitchPaymentLink,
  isPaidPlanSlug,
  normalizePayerName,
  parseStitchMerchantReference,
} from "../lib/stitch-express";
import { verifySvixSignature } from "../lib/svix";
import crypto from "crypto";
import * as crc32 from "buffer-crc32";
import https from "https";

import { ordersController } from "../lib/paypal";
import { CheckoutPaymentIntent } from "@paypal/paypal-server-sdk";
import { convertFromZar } from "../lib/pricing";
import { createRateLimit } from "../middleware/rate-limit";

const router: IRouter = Router();
const paymentWriteRateLimit = createRateLimit({
  key: "payments-write",
  max: 30,
  windowMs: 1000 * 60 * 15,
  failOpen: false,
});

const ZAR_PRICES: Record<string, number> = {
  free: 0,
  starter: 599,
  agency: 1499,
};

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

function readString(value: unknown, key: string): unknown {
  if (!value || typeof value !== "object") return undefined;
  return (value as Record<string, unknown>)[key];
}

function findMerchantReference(payload: unknown): unknown {
  const directPayment = readString(payload, "payment");
  const data = readString(payload, "data");
  const dataPayment = readString(data, "payment");
  const nestedNode = readString(readString(readString(data, "client"), "paymentInitiationRequests"), "node");

  return (
    readString(directPayment, "merchantReference") ??
    readString(dataPayment, "merchantReference") ??
    readString(data, "merchantReference") ??
    readString(nestedNode, "merchantReference") ??
    readString(nestedNode, "externalReference")
  );
}

function getPaymentStatus(payload: unknown): string | null {
  const directPayment = readString(payload, "payment");
  const data = readString(payload, "data");
  const dataPayment = readString(data, "payment");
  const nestedNode = readString(readString(readString(data, "client"), "paymentInitiationRequests"), "node");
  const nestedState = readString(nestedNode, "state");
  const paymentConfirmation = readString(nestedNode, "paymentConfirmation");

  const status =
    readString(payload, "status") ??
    readString(directPayment, "status") ??
    readString(dataPayment, "status") ??
    readString(data, "status") ??
    readString(nestedState, "__typename") ??
    readString(paymentConfirmation, "__typename");

  return typeof status === "string" ? status : null;
}

function getEventType(payload: unknown): string | null {
  const type = readString(payload, "type") ?? readString(payload, "eventType");
  return typeof type === "string" ? type : null;
}

function isPaidWebhook(payload: unknown): boolean {
  const eventType = getEventType(payload)?.toLowerCase();
  const status = getPaymentStatus(payload)?.toLowerCase();

  return (
    eventType === "payment.paid" ||
    eventType === "payment.settled" ||
    status === "paid" ||
    status === "settled" ||
    status === "paymentinitiationrequestcompleted" ||
    status === "paymentreceived"
  );
}

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

router.post("/payments/stitch/webhook", async (req, res) => {
  const webhookSecret = process.env.STITCH_EXPRESS_WEBHOOK_SECRET?.trim() || process.env.STITCH_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    req.log.error("STITCH_EXPRESS_WEBHOOK_SECRET is not configured");
    return res.status(500).json({ message: "Webhook secret is not configured" });
  }

  const rawBody = (req as RequestWithRawBody).rawBody;
  if (!rawBody || !verifySvixSignature(req.headers, rawBody, webhookSecret)) {
    req.log.warn("Rejected Stitch webhook with invalid Svix signature");
    return res.status(400).json({ message: "Invalid webhook signature" });
  }

  if (!isPaidWebhook(req.body)) {
    return res.json({ received: true, processed: false });
  }

  const merchantReference = findMerchantReference(req.body);
  const parsedReference = parseStitchMerchantReference(merchantReference);
  if (!parsedReference) {
    req.log.warn({ merchantReference }, "Paid Stitch webhook missing a SEOaxe merchant reference");
    return res.json({ received: true, processed: false });
  }

  await db
    .update(usersTable)
    .set({
      plan: parsedReference.plan,
      updatedAt: new Date(),
    })
    .where(eq(usersTable.id, parsedReference.userId));

  req.log.info(
    {
      userId: parsedReference.userId,
      plan: parsedReference.plan,
    },
    "Applied paid Stitch plan from webhook",
  );
  return res.json({ received: true, processed: true });
});

router.post("/payments/stitch/checkout", paymentWriteRateLimit, requireAuthenticatedUser, async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ message: "Authentication required" });

  const planSlug = req.body?.plan;
  if (!isPaidPlanSlug(planSlug)) {
    return res.status(400).json({ message: "Choose a valid plan to continue to payment." });
  }

  const plan = STITCH_PAYMENT_PLANS[planSlug];
  if (user.plan === plan.slug) {
    return res.status(409).json({ message: `This account is already on the ${plan.name} plan.` });
  }

  try {
    const payment = await createStitchPaymentLink({
      amountCents: plan.amountCents,
      merchantReference: buildStitchMerchantReference(plan.slug, user.id),
      payerName: normalizePayerName(user.displayName, user.email),
      payerEmailAddress: user.email,
    });

    return res.json({
      paymentId: payment.id,
      paymentUrl: appendConfiguredRedirectUrl(payment.link, plan.slug),
      merchantReference: payment.merchantReference,
      amountCents: payment.amount,
      status: payment.status,
    });
  } catch (err) {
    if (err instanceof StitchConfigurationError) {
      req.log.error({ err }, "Stitch Express is not configured");
      return res.status(503).json({ message: err.message });
    }

    if (err instanceof StitchApiError) {
      req.log.error({ err, status: err.status }, "Stitch Express API request failed");
      return res.status(502).json({ message: err.message });
    }

    req.log.error({ err }, "Failed to create Stitch Express checkout");
    return res.status(500).json({ message: "Could not start secure payment. Please try again." });
  }
});

router.post("/payments/paypal/create-order", paymentWriteRateLimit, requireAuthenticatedUser, async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ message: "Authentication required" });

  const planSlug = req.body?.plan;
  if (!isPaidPlanSlug(planSlug)) {
    return res.status(400).json({ message: "Choose a valid plan to continue to payment." });
  }

  const zarPrice = ZAR_PRICES[planSlug];
  if (!zarPrice) {
    return res.status(400).json({ message: "Invalid plan selected." });
  }

  // Convert ZAR to USD for PayPal
  const usdPrice = convertFromZar(zarPrice, "USD").toFixed(2);

  try {
    const { result } = await ordersController.createOrder({
      body: {
        intent: CheckoutPaymentIntent.Capture,
        purchaseUnits: [
          {
            amount: {
              currencyCode: "USD",
              value: usdPrice,
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
