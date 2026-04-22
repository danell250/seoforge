import { Router, type IRouter } from "express";
import { CrawlSiteBody, CrawlSiteResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const DEFAULT_MAX_PAGES = 15;
const HARD_MAX_PAGES = 50;
const FETCH_TIMEOUT_MS = 12000;
const MAX_BYTES_PER_PAGE = 400_000;

const SKIP_EXT = /\.(pdf|zip|rar|7z|tar|gz|jpg|jpeg|png|gif|webp|svg|ico|css|js|mjs|mp4|mp3|wav|woff2?|ttf|otf|xml|json|csv|xlsx?|docx?|pptx?)(\?|#|$)/i;

function normalizeUrl(raw: string): string {
  let s = raw.trim();
  if (!/^https?:\/\//i.test(s)) s = "https://" + s;
  return s;
}

async function fetchHtml(url: string): Promise<string | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; SEOForgeBot/1.0; +https://seoforge.app)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("html")) return null;
    const text = await res.text();
    return text.slice(0, MAX_BYTES_PER_PAGE);
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function extractTitle(html: string): string {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m && m[1] ? m[1].replace(/\s+/g, " ").trim().slice(0, 200) : "";
}

function extractLinks(html: string, baseUrl: string, origin: string): string[] {
  const out: string[] = [];
  const re = /<a\b[^>]*href\s*=\s*["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const href = m[1];
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) continue;
    try {
      const abs = new URL(href, baseUrl);
      if (abs.origin !== origin) continue;
      if (SKIP_EXT.test(abs.pathname)) continue;
      abs.hash = "";
      out.push(abs.toString());
    } catch {
      // ignore
    }
  }
  return out;
}

function pathToFilename(u: string): string {
  try {
    const parsed = new URL(u);
    let p = parsed.pathname.replace(/^\/+|\/+$/g, "");
    if (!p) return "index.html";
    p = p.replace(/[^a-zA-Z0-9._/-]/g, "-").replace(/\//g, "_");
    if (!/\.html?$/i.test(p)) p = p + ".html";
    return p.slice(0, 120);
  } catch {
    return "page.html";
  }
}

router.post("/crawl-site", async (req, res) => {
  const parsed = CrawlSiteBody.safeParse({
    ...req.body,
    url: typeof req.body?.url === "string" ? normalizeUrl(req.body.url) : req.body?.url,
  });
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request body" });
  }

  const { url } = parsed.data;
  const maxPages = Math.min(parsed.data.maxPages ?? DEFAULT_MAX_PAGES, HARD_MAX_PAGES);

  let origin: string;
  try {
    origin = new URL(url).origin;
  } catch {
    return res.status(400).json({ message: "Invalid URL" });
  }

  const visited = new Set<string>();
  const queue: string[] = [url];
  const pages: { url: string; filename: string; html: string; title: string }[] = [];
  const usedFilenames = new Set<string>();

  while (queue.length > 0 && pages.length < maxPages) {
    const next = queue.shift()!;
    if (visited.has(next)) continue;
    visited.add(next);

    const html = await fetchHtml(next);
    if (!html) continue;

    let filename = pathToFilename(next);
    let i = 1;
    while (usedFilenames.has(filename)) {
      filename = filename.replace(/(\.html?)$/i, `_${i}$1`);
      i++;
    }
    usedFilenames.add(filename);

    pages.push({
      url: next,
      filename,
      html,
      title: extractTitle(html),
    });

    if (pages.length + queue.length < maxPages * 2) {
      const links = extractLinks(html, next, origin);
      for (const l of links) {
        if (!visited.has(l) && !queue.includes(l)) {
          queue.push(l);
        }
      }
    }
  }

  if (pages.length === 0) {
    return res.status(500).json({
      message: "We couldn't crawl that site, please try again.",
    });
  }

  const safe = CrawlSiteResponse.parse({ domain: origin, pages });
  return res.json(safe);
});

export default router;
