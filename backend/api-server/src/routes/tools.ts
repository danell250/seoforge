import { Router, type IRouter } from "express";
import { isIP } from "node:net";
import { lookup } from "node:dns/promises";

const router: IRouter = Router();

class FetchPageError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = "FetchPageError";
    this.statusCode = statusCode;
  }
}

function isBlockedHostname(hostname: string): boolean {
  const normalized = hostname.trim().toLowerCase();
  return (
    normalized === "localhost" ||
    normalized.endsWith(".localhost") ||
    normalized.endsWith(".local") ||
    normalized === "0.0.0.0"
  );
}

function isPrivateAddress(address: string): boolean {
  if (isIP(address) === 4) {
    const octets = address.split(".").map(Number);
    return (
      octets[0] === 10 ||
      (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
      (octets[0] === 192 && octets[1] === 168)
    );
  }
  if (isIP(address) === 6) {
    return address.startsWith("fd") || address.startsWith("fc") || address === "::1";
  }
  return false;
}

async function lookupWithTimeout(hostname: string, timeoutMs = 3_000) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      lookup(hostname, { all: true, verbatim: true }),
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new FetchPageError("We could not resolve that domain fast enough. Please try again.", 504));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

async function validateUrl(rawUrl: string): Promise<URL> {
  const trimmedUrl = rawUrl.trim();
  let parsed: URL;
  try {
    parsed = new URL(trimmedUrl);
  } catch {
    try {
      parsed = new URL(`https://${trimmedUrl}`);
    } catch {
      throw new FetchPageError("Please enter a valid website URL.", 400);
    }
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new FetchPageError("Only http and https URLs can be fetched.", 400);
  }
  if (parsed.username || parsed.password) {
    throw new FetchPageError("URLs with embedded credentials are not allowed.", 400);
  }
  if (isBlockedHostname(parsed.hostname)) {
    throw new FetchPageError("That URL points to a private or local address and cannot be fetched.", 400);
  }

  let addresses;
  try {
    addresses = await lookupWithTimeout(parsed.hostname);
  } catch (err) {
    if (err instanceof FetchPageError) {
      throw err;
    }
    throw new FetchPageError("We could not resolve that domain.", 422);
  }

  if (addresses.length === 0 || addresses.some((entry) => isPrivateAddress(entry.address))) {
    throw new FetchPageError("That URL points to a private or local address and cannot be fetched.", 400);
  }

  return parsed;
}

async function fetchPage(url: string): Promise<{ html: string; finalUrl: string }> {
  const validatedUrl = await validateUrl(url);
  const userAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

  const tryFetch = async (targetUrl: string): Promise<{ html: string; finalUrl: string }> => {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": userAgent,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    return { html, finalUrl: response.url };
  };

  try {
    return await tryFetch(validatedUrl.href);
  } catch (err) {
    if (validatedUrl.protocol === "https:") {
      try {
        const httpUrl = new URL(validatedUrl.href);
        httpUrl.protocol = "http:";
        return await tryFetch(httpUrl.href);
      } catch {}
    }
    throw new FetchPageError("Failed to fetch the page. Please check the URL.", 502);
  }
}

router.post("/fetch-page", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ message: "URL is required" });
    }
    const { html, finalUrl } = await fetchPage(url);
    return res.json({ html, finalUrl });
  } catch (err) {
    req.log?.error?.({ err }, "Fetch page failed");
    const statusCode = err instanceof FetchPageError ? err.statusCode : 500;
    return res.status(statusCode).json({
      message: err instanceof Error ? err.message : "Failed to fetch page",
    });
  }
});

export default router;
