const DEFAULT_MODEL_HTML_CHARS = 120_000;

export function prepareHtmlForModel(html: string, maxChars = DEFAULT_MODEL_HTML_CHARS): string {
  const cleaned = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<template\b[^>]*>[\s\S]*?<\/template>/gi, " ")
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, " ")
    .replace(/<canvas\b[^>]*>[\s\S]*?<\/canvas>/gi, " ")
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, " ")
    .replace(/\s{3,}/g, " ")
    .trim();

  if (cleaned.length <= maxChars) {
    return cleaned;
  }

  const headMatch = cleaned.match(/<head\b[^>]*>[\s\S]*?<\/head>/i);
  const bodyMatch = cleaned.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  const head = headMatch?.[0] ?? "<head></head>";
  const body = (bodyMatch?.[1] ?? cleaned).trim();
  const wrapperOverhead = "<!doctype html><html></html><body></body>".length;
  const bodyBudget = Math.max(20_000, maxChars - head.length - wrapperOverhead);

  return `<!doctype html>
<html>
${head}
<body>
${truncateHtml(body, bodyBudget)}
</body>
</html>`;
}

function truncateHtml(html: string, limit: number): string {
  if (html.length <= limit) {
    return html;
  }

  const slice = html.slice(0, limit);
  const lastClosedTag = slice.lastIndexOf(">");
  if (lastClosedTag > limit * 0.5) {
    return slice.slice(0, lastClosedTag + 1).trim();
  }

  return slice.replace(/<[^>]*$/, "").trim();
}
