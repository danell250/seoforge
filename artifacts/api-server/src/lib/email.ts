import { Resend } from "resend";

let client: Resend | null = null;
function getClient(): Resend | null {
  const key = process.env["RESEND_API_KEY"];
  if (!key) return null;
  if (!client) client = new Resend(key);
  return client;
}

export const FROM_ADDRESS = process.env["RESEND_FROM"] || "SEOForge <onboarding@resend.dev>";

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; error?: string }> {
  const c = getClient();
  if (!c) return { ok: false, error: "RESEND_API_KEY not configured" };
  try {
    const { error } = await c.emails.send({
      from: FROM_ADDRESS,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export function renderReportEmail(opts: {
  domain: string;
  summary: string;
  pagesScanned: number;
  regressions: number;
  newGaps: number;
  diffs: Array<{
    url: string;
    title: string;
    status: string;
    scoreDelta: number;
    previousScore: number | null;
    currentScore: number | null;
    currentGaps: number;
    newGapQuestions: string[];
  }>;
  appUrl: string;
}): string {
  const interesting = opts.diffs
    .filter((d) => d.status !== "unchanged")
    .sort((a, b) => Math.abs(b.scoreDelta) - Math.abs(a.scoreDelta))
    .slice(0, 12);

  const rows = interesting
    .map((d) => {
      const colour =
        d.status === "regressed"
          ? "#dc2626"
          : d.status === "improved"
            ? "#16a34a"
            : d.status === "new"
              ? "#2563eb"
              : d.status === "removed"
                ? "#6b7280"
                : "#0f172a";
      const deltaText =
        d.previousScore != null && d.currentScore != null
          ? `${d.previousScore} &rarr; ${d.currentScore} (${d.scoreDelta > 0 ? "+" : ""}${d.scoreDelta})`
          : d.status === "new"
            ? "new page"
            : d.status === "removed"
              ? "removed"
              : "—";
      const gapsList = d.newGapQuestions.length
        ? `<ul style="margin:6px 0 0;padding-left:18px;color:#475569;font-size:13px;">${d.newGapQuestions
            .slice(0, 4)
            .map((q) => `<li>${escapeHtml(q)}</li>`)
            .join("")}</ul>`
        : "";
      return `
        <tr>
          <td style="padding:12px 8px;border-bottom:1px solid #e2e8f0;vertical-align:top;">
            <div style="font-weight:600;color:#0f172a;font-size:14px;">${escapeHtml(d.title || d.url)}</div>
            <div style="color:#64748b;font-size:12px;word-break:break-all;">${escapeHtml(d.url)}</div>
            ${gapsList}
          </td>
          <td style="padding:12px 8px;border-bottom:1px solid #e2e8f0;vertical-align:top;text-align:right;">
            <div style="display:inline-block;padding:3px 8px;border-radius:6px;background:${colour}1a;color:${colour};font-size:12px;font-weight:600;text-transform:uppercase;">${d.status}</div>
            <div style="color:#0f172a;font-size:13px;margin-top:6px;">${deltaText}</div>
            ${d.currentGaps ? `<div style="color:#7c3aed;font-size:12px;margin-top:4px;">+${d.currentGaps} new gaps</div>` : ""}
          </td>
        </tr>`;
    })
    .join("");

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,Segoe UI,Roboto,sans-serif;">
  <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <div style="padding:24px 28px;background:#2563eb;color:#fff;">
        <div style="font-size:14px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.85;">SEOForge Weekly Report</div>
        <div style="font-size:22px;font-weight:700;margin-top:6px;">${escapeHtml(opts.domain)}</div>
      </div>
      <div style="padding:24px 28px;">
        <div style="display:flex;gap:12px;margin-bottom:20px;">
          <div style="flex:1;padding:14px;background:#f1f5f9;border-radius:8px;">
            <div style="font-size:11px;text-transform:uppercase;color:#64748b;letter-spacing:0.06em;">Pages scanned</div>
            <div style="font-size:24px;font-weight:700;color:#0f172a;margin-top:4px;">${opts.pagesScanned}</div>
          </div>
          <div style="flex:1;padding:14px;background:#fef2f2;border-radius:8px;">
            <div style="font-size:11px;text-transform:uppercase;color:#991b1b;letter-spacing:0.06em;">Regressions</div>
            <div style="font-size:24px;font-weight:700;color:#dc2626;margin-top:4px;">${opts.regressions}</div>
          </div>
          <div style="flex:1;padding:14px;background:#faf5ff;border-radius:8px;">
            <div style="font-size:11px;text-transform:uppercase;color:#6b21a8;letter-spacing:0.06em;">New gaps</div>
            <div style="font-size:24px;font-weight:700;color:#7c3aed;margin-top:4px;">${opts.newGaps}</div>
          </div>
        </div>
        <p style="color:#334155;line-height:1.6;font-size:14px;margin:0 0 16px;">${escapeHtml(opts.summary)}</p>
        <table style="width:100%;border-collapse:collapse;margin-top:8px;">
          <thead>
            <tr>
              <th style="text-align:left;padding:8px;font-size:11px;text-transform:uppercase;color:#64748b;border-bottom:2px solid #e2e8f0;">Page</th>
              <th style="text-align:right;padding:8px;font-size:11px;text-transform:uppercase;color:#64748b;border-bottom:2px solid #e2e8f0;">Change</th>
            </tr>
          </thead>
          <tbody>${rows || `<tr><td colspan="2" style="padding:24px;text-align:center;color:#64748b;font-size:14px;">No notable changes this week.</td></tr>`}</tbody>
        </table>
        <div style="margin-top:24px;text-align:center;">
          <a href="${opts.appUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:11px 22px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Open SEOForge dashboard</a>
        </div>
      </div>
    </div>
    <div style="text-align:center;color:#94a3b8;font-size:12px;margin-top:16px;">You receive this because you subscribed ${escapeHtml(opts.domain)} to SEOForge monitoring.</div>
  </div>
</body></html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
