import { createHmac, timingSafeEqual } from "node:crypto";
import type { IncomingHttpHeaders } from "node:http";

const SIGNATURE_TOLERANCE_SECONDS = 60 * 5;

function readHeader(headers: IncomingHttpHeaders, name: string): string | null {
  const value = headers[name.toLowerCase()];
  if (Array.isArray(value)) return value[0] ?? null;
  return typeof value === "string" ? value : null;
}

function parseSignatureHeader(value: string): string[] {
  return value
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [, signature] = part.split(",", 2);
      return signature;
    })
    .filter((signature): signature is string => Boolean(signature));
}

function safeCompare(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function verifySvixSignature(headers: IncomingHttpHeaders, rawBody: Buffer, secret: string): boolean {
  const svixId = readHeader(headers, "svix-id");
  const svixTimestamp = readHeader(headers, "svix-timestamp");
  const svixSignature = readHeader(headers, "svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) return false;

  const timestamp = Number(svixTimestamp);
  if (!Number.isFinite(timestamp)) return false;
  if (Math.abs(Date.now() / 1000 - timestamp) > SIGNATURE_TOLERANCE_SECONDS) return false;

  const secretPart = secret.startsWith("whsec_") ? secret.split("_")[1] : secret;
  if (!secretPart) return false;

  const signedContent = `${svixId}.${svixTimestamp}.${rawBody.toString("utf8")}`;
  const expected = createHmac("sha256", Buffer.from(secretPart, "base64"))
    .update(signedContent)
    .digest("base64");

  return parseSignatureHeader(svixSignature).some((signature) => safeCompare(signature, expected));
}
