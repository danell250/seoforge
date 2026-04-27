export function extractMeta(html: string) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const title = doc.querySelector("title")?.textContent || "No Title";
    const desc =
      doc.querySelector('meta[name="description"]')?.getAttribute("content") ||
      "No description provided.";
    const url = "https://example.com/page";
    return { title, desc, url };
  } catch (error) {
    return { title: "Error", desc: "Error parsing HTML", url: "" };
  }
}

export function extractCanonicalUrl(html: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute("href");
    if (canonical) {
      return canonical;
    }
    const ogUrl = doc.querySelector('meta[property="og:url"]')?.getAttribute("content");
    if (ogUrl) {
      return ogUrl;
    }
    return "https://example.com/page";
  } catch (error) {
    return "https://example.com/page";
  }
}

export function generateSitemapXml(url: string): string {
  const today = new Date().toISOString().split("T")[0];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
}

export function generateRobotsTxt(url: string): string {
  const sitemapUrl = url.endsWith("/") ? `${url}sitemap.xml` : `${url}/sitemap.xml`;
  return `User-agent: *
Allow: /

Sitemap: ${sitemapUrl}`;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
