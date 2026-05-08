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

const router: IRouter = Router();

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

router.post("/payments/stitch/checkout", requireAuthenticatedUser, async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ message: "Authentication required" });

  const planSlug = req.body?.plan;
  if (!isPaidPlanSlug(planSlug)) {
    return res.status(400).json({ message: "Choose Starter or Agency to continue to payment." });
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

export default router;
