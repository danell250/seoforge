const STITCH_BASE_URL = process.env.STITCH_EXPRESS_BASE_URL?.replace(/\/+$/, "") ?? "https://express.stitch.money";
const TOKEN_SCOPE = "client_paymentrequest";
const TOKEN_REFRESH_SKEW_MS = 1000 * 60;
const TOKEN_TTL_MS = 1000 * 60 * 15;

type StitchTokenResponse = {
  success?: boolean;
  data?: {
    accessToken?: string;
  };
};

type StitchPaymentLink = {
  id: string;
  amount: number;
  status: string;
  link: string;
  merchantReference: string;
  expireAt?: string;
  paidAt?: string | null;
};

type StitchPaymentLinkResponse = {
  success?: boolean;
  data?: {
    payment?: StitchPaymentLink;
  };
};

type TokenCache = {
  accessToken: string;
  expiresAt: number;
};

export type PaidPlanSlug = "free" | "starter" | "agency";

export type StitchPaymentPlan = {
  slug: PaidPlanSlug;
  name: string;
  amountCents: number;
};

export type CreateStitchPaymentLinkInput = {
  amountCents: number;
  merchantReference: string;
  payerName: string;
  payerEmailAddress: string;
};

export class StitchConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StitchConfigurationError";
  }
}

export class StitchApiError extends Error {
  readonly status: number;
  readonly data: unknown;

  constructor(status: number, message: string, data: unknown) {
    super(message);
    this.name = "StitchApiError";
    this.status = status;
    this.data = data;
  }
}

let tokenCache: TokenCache | null = null;

export const STITCH_PAYMENT_PLANS: Record<PaidPlanSlug, StitchPaymentPlan> = {
  free: {
    slug: "free",
    name: "Free",
    amountCents: 1638,
  },
  starter: {
    slug: "starter",
    name: "Starter",
    amountCents: 29900,
  },
  agency: {
    slug: "agency",
    name: "Agency",
    amountCents: 99900,
  },
};

function getCredentials() {
  const clientId = process.env.STITCH_EXPRESS_CLIENT_ID?.trim() || process.env.STITCH_CLIENT_ID?.trim();
  const clientSecret = process.env.STITCH_EXPRESS_CLIENT_SECRET || process.env.STITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new StitchConfigurationError(
      "STITCH_EXPRESS_CLIENT_ID and STITCH_EXPRESS_CLIENT_SECRET must be set before creating Stitch payments.",
    );
  }

  return { clientId, clientSecret };
}

async function parseStitchResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text.trim()) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function describeStitchError(status: number, data: unknown): string {
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    const message =
      typeof record.message === "string"
        ? record.message
        : typeof record.detail === "string"
          ? record.detail
          : typeof record.error === "string"
            ? record.error
            : undefined;
    if (message) return message;
  }

  return `Stitch Express request failed with HTTP ${status}.`;
}

async function requestAccessToken(): Promise<string> {
  const { clientId, clientSecret } = getCredentials();
  const response = await fetch(`${STITCH_BASE_URL}/api/v1/token`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      clientId,
      clientSecret,
      scope: TOKEN_SCOPE,
    }),
  });
  const data = (await parseStitchResponse(response)) as StitchTokenResponse;

  if (!response.ok) {
    throw new StitchApiError(response.status, describeStitchError(response.status, data), data);
  }

  const accessToken = data.data?.accessToken;
  if (!accessToken) {
    throw new StitchApiError(response.status, "Stitch Express did not return an access token.", data);
  }

  tokenCache = {
    accessToken,
    expiresAt: Date.now() + TOKEN_TTL_MS - TOKEN_REFRESH_SKEW_MS,
  };
  return accessToken;
}

async function getAccessToken(forceRefresh = false): Promise<string> {
  if (!forceRefresh && tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache.accessToken;
  }

  return requestAccessToken();
}

async function stitchFetch(path: string, init: RequestInit, retry = true): Promise<unknown> {
  const token = await getAccessToken(!retry);
  const headers = new Headers(init.headers);
  headers.set("authorization", `Bearer ${token}`);
  headers.set("accept", "application/json");
  if (init.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const response = await fetch(`${STITCH_BASE_URL}${path}`, {
    ...init,
    headers,
  });
  const data = await parseStitchResponse(response);

  if (response.status === 401 && retry) {
    tokenCache = null;
    return stitchFetch(path, init, false);
  }

  if (!response.ok) {
    throw new StitchApiError(response.status, describeStitchError(response.status, data), data);
  }

  return data;
}

export function isPaidPlanSlug(value: unknown): value is PaidPlanSlug {
  return value === "free" || value === "starter" || value === "agency";
}

export function buildStitchMerchantReference(plan: PaidPlanSlug, userId: number): string {
  return `SEOaxe ${plan} u${userId} ${Date.now().toString(36)}`.slice(0, 50);
}

export function parseStitchMerchantReference(reference: unknown): { plan: PaidPlanSlug; userId: number } | null {
  if (typeof reference !== "string") return null;

  const match = /^SEOaxe\s+(free|starter|agency)\s+u(\d+)\b/i.exec(reference.trim());
  if (!match) return null;

  const plan = match[1]?.toLowerCase();
  const userId = Number(match[2]);
  if (!isPaidPlanSlug(plan) || !Number.isInteger(userId) || userId <= 0) return null;

  return { plan, userId };
}

export function normalizePayerName(displayName: string | null | undefined, email: string): string {
  const fallback = email.split("@")[0]?.replace(/[._-]+/g, " ") || "SEOaxe Customer";
  const cleaned = (displayName?.trim() || fallback).replace(/\s+/g, " ");
  const trimmed = cleaned.slice(0, 40).trim();

  if (trimmed.length >= 3) return trimmed;
  return "SEOaxe Customer";
}

export function appendConfiguredRedirectUrl(paymentUrl: string, plan: PaidPlanSlug): string {
  const configuredRedirect =
    process.env.STITCH_EXPRESS_REDIRECT_URL?.trim() ||
    process.env.STITCH_REDIRECT_URL?.trim();
  if (!configuredRedirect) return paymentUrl;

  try {
    const redirect = new URL(configuredRedirect);
    redirect.searchParams.set("plan", plan);
    const url = new URL(paymentUrl);
    url.searchParams.set("redirect_url", redirect.toString());
    return url.toString();
  } catch {
    return paymentUrl;
  }
}

export async function createStitchPaymentLink(input: CreateStitchPaymentLinkInput): Promise<StitchPaymentLink> {
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();
  const data = (await stitchFetch("/api/v1/payment-links", {
    method: "POST",
    body: JSON.stringify({
      amount: input.amountCents,
      merchantReference: input.merchantReference,
      expiresAt,
      payerName: input.payerName,
      payerEmailAddress: input.payerEmailAddress,
      collectDeliveryDetails: false,
      skipCheckoutPage: false,
    }),
  })) as StitchPaymentLinkResponse;

  const payment = data.data?.payment;
  if (!payment?.id || !payment.link) {
    throw new StitchApiError(502, "Stitch Express did not return a usable payment link.", data);
  }

  return payment;
}
