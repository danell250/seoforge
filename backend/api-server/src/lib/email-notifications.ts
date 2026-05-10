/**
 * Email Notification Service for SEOaxe - BREVO (Sendinblue)
 * 
 * Types of notifications users want:
 * 1. Site Monitor Alerts - SEO score drops on monitored sites
 * 2. Competitor Alerts - Competitor makes significant changes
 * 3. Weekly SEO Reports - Summary of all monitored sites
 * 4. Content Gap Opportunities - New topics to cover
 * 5. Blog Generation Complete - Batch generation finished
 * 6. Plan Usage Warnings - Approaching monthly limits
 */

import { renderReportEmail, renderLowScoreAlertEmail, escapeHtml as escapeHtmlBase } from "./email";

const BREVO_API_KEY = process.env["BREVO_API_KEY"];
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const APP_URL = process.env["APP_URL"] || "https://www.seoaxe.site";

export interface EmailConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

export interface NotificationPayload {
  userId: number;
  userEmail: string;
  type: NotificationType;
  subject: string;
  data: Record<string, unknown>;
}

export type NotificationType =
  | "site_score_drop"
  | "competitor_changed"
  | "weekly_report"
  | "content_gap_alert"
  | "blog_generation_complete"
  | "plan_usage_warning"
  | "site_monitor_complete";

// Notification templates
export const notificationTemplates: Record<NotificationType, { subject: string; priority: "high" | "normal" | "low" }> = {
  site_score_drop: {
    subject: "🚨 SEO Score Drop Alert: {{siteUrl}}",
    priority: "high",
  },
  competitor_changed: {
    subject: "👀 Competitor Alert: {{competitorUrl}} updated their page",
    priority: "normal",
  },
  weekly_report: {
    subject: "📊 Your Weekly SEO Report - {{date}}",
    priority: "normal",
  },
  content_gap_alert: {
    subject: "💡 New Content Opportunities Found for {{keyword}}",
    priority: "low",
  },
  blog_generation_complete: {
    subject: "✅ Blog Generation Complete - {{count}} articles ready",
    priority: "normal",
  },
  plan_usage_warning: {
    subject: "⚠️ Plan Usage: {{percent}}% of optimizations used",
    priority: "high",
  },
  site_monitor_complete: {
    subject: "🔍 Site Scan Complete - {{siteUrl}}",
    priority: "normal",
  },
};

/**
 * Example notification payloads:
 */

// Site Score Drop Alert
export interface SiteScoreDropPayload {
  siteUrl: string;
  pageUrl: string;
  oldScore: number;
  newScore: number;
  dropPercentage: number;
  issuesFound: string[];
  scanDate: string;
}

// Competitor Change Alert
export interface CompetitorChangePayload {
  competitorUrl: string;
  yourPageUrl: string;
  changesDetected: string[];
  theirNewScore: number;
  yourCurrentScore: number;
  recommendations: string[];
}

// Weekly SEO Report
export interface WeeklyReportPayload {
  date: string;
  sitesMonitored: number;
  totalPages: number;
  averageScoreChange: number;
  topIssues: string[];
  opportunities: string[];
  siteBreakdown: Array<{
    url: string;
    score: number;
    change: number;
    status: "improved" | "declined" | "stable";
  }>;
}

// Content Gap Alert
export interface ContentGapPayload {
  keyword: string;
  competitorUrl: string;
  questionsYoureMissing: string[];
  topicsToCover: string[];
  estimatedTrafficGain: string;
}

// Blog Generation Complete
export interface BlogGenerationCompletePayload {
  count: number;
  keywords: string[];
  totalWordCount: number;
  averageSeoScore: number;
  downloadLink: string;
}

// Plan Usage Warning
export interface PlanUsagePayload {
  percent: number;
  used: number;
  limit: number;
  planName: string;
  renewDate: string;
}

/**
 * Send email using Brevo (Sendinblue) API
 */
export async function sendEmailWithBrevo(
  config: EmailConfig,
  payload: NotificationPayload
): Promise<void> {
  const apiKey = config.apiKey || BREVO_API_KEY;
  
  if (!apiKey) {
    throw new Error("BREVO_API_KEY not configured");
  }

  const template = notificationTemplates[payload.type];
  const htmlContent = renderEmailTemplate(payload.type, payload.data);
  
  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: config.fromName,
        email: config.fromEmail,
      },
      to: [
        {
          email: payload.userEmail,
        },
      ],
      subject: template.subject,
      htmlContent: htmlContent,
      tags: [payload.type, "seoaxe"],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Brevo API error (${response.status}): ${errorText}`);
  }
}

/**
 * Queue notification for sending
 * Implementation would use a job queue like Bull/BullMQ for production
 */
export async function queueNotification(
  config: EmailConfig,
  payload: NotificationPayload
): Promise<void> {
  await sendEmailWithBrevo(config, payload);
  console.log(`[Brevo Email] ${payload.type} notification sent to ${payload.userEmail}`);
}

const escapeHtml = escapeHtmlBase;

function renderCompetitorChangedEmail(data: CompetitorChangePayload): string {
  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f0f9ff;font-family:-apple-system,Segoe UI,Roboto,sans-serif;">
  <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
    <div style="background:#fff;border:1px solid #bae6fd;border-radius:12px;overflow:hidden;">
      <div style="padding:24px 28px;background:#0ea5e9;color:#fff;">
        <div style="font-size:14px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.85;">👀 Competitor Alert</div>
        <div style="font-size:22px;font-weight:700;margin-top:6px;">${escapeHtml(data.competitorUrl)}</div>
      </div>
      <div style="padding:24px 28px;">
        <div style="margin-bottom:20px;">
          <div style="font-size:12px;text-transform:uppercase;color:#64748b;letter-spacing:0.06em;margin-bottom:4px;">Your Page</div>
          <div style="font-size:16px;font-weight:600;color:#0f172a;">${escapeHtml(data.yourPageUrl)}</div>
        </div>
        <div style="margin-bottom:20px;">
          <div style="font-size:12px;text-transform:uppercase;color:#64748b;letter-spacing:0.06em;margin-bottom:4px;">Changes Detected</div>
          <ul style="margin:0;padding-left:18px;color:#0f172a;font-size:14px;">
            ${data.changesDetected.map((c) => `<li style="margin-bottom:4px;">${escapeHtml(c)}</li>`).join("")}
          </ul>
        </div>
        <div style="display:flex;gap:12px;margin-bottom:20px;">
          <div style="flex:1;padding:14px;background:#fef3c7;border-radius:8px;">
            <div style="font-size:11px;text-transform:uppercase;color:#92400e;letter-spacing:0.06em;">Their New Score</div>
            <div style="font-size:24px;font-weight:700;color:#d97706;margin-top:4px;">${data.theirNewScore}/100</div>
          </div>
          <div style="flex:1;padding:14px;background:#dbeafe;border-radius:8px;">
            <div style="font-size:11px;text-transform:uppercase;color:#1e40af;letter-spacing:0.06em;">Your Score</div>
            <div style="font-size:24px;font-weight:700;color:#2563eb;margin-top:4px;">${data.yourCurrentScore}/100</div>
          </div>
        </div>
        <div style="margin-bottom:20px;">
          <div style="font-size:12px;text-transform:uppercase;color:#64748b;letter-spacing:0.06em;margin-bottom:4px;">Recommendations</div>
          <ul style="margin:0;padding-left:18px;color:#0f172a;font-size:14px;">
            ${data.recommendations.map((r) => `<li style="margin-bottom:4px;">${escapeHtml(r)}</li>`).join("")}
          </ul>
        </div>
        <div style="margin-top:24px;text-align:center;">
          <a href="${APP_URL}" style="display:inline-block;background:#0ea5e9;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">View Competitor Analysis</a>
        </div>
      </div>
    </div>
    <div style="text-align:center;color:#94a3b8;font-size:12px;margin-top:16px;">You receive this because you subscribed to competitor monitoring.</div>
  </div>
</body></html>`;
}

function renderContentGapAlertEmail(data: ContentGapPayload): string {
  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#faf5ff;font-family:-apple-system,Segoe UI,Roboto,sans-serif;">
  <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
    <div style="background:#fff;border:1px solid #e9d5ff;border-radius:12px;overflow:hidden;">
      <div style="padding:24px 28px;background:#7c3aed;color:#fff;">
        <div style="font-size:14px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.85;">💡 Content Opportunity</div>
        <div style="font-size:22px;font-weight:700;margin-top:6px;">${escapeHtml(data.keyword)}</div>
      </div>
      <div style="padding:24px 28px;">
        <div style="margin-bottom:20px;">
          <div style="font-size:12px;text-transform:uppercase;color:#64748b;letter-spacing:0.06em;margin-bottom:4px;">Competitor URL</div>
          <div style="font-size:16px;font-weight:600;color:#0f172a;">${escapeHtml(data.competitorUrl)}</div>
        </div>
        <div style="margin-bottom:20px;">
          <div style="font-size:12px;text-transform:uppercase;color:#64748b;letter-spacing:0.06em;margin-bottom:4px;">Questions You're Missing</div>
          <ul style="margin:0;padding-left:18px;color:#0f172a;font-size:14px;">
            ${data.questionsYoureMissing.map((q) => `<li style="margin-bottom:4px;">${escapeHtml(q)}</li>`).join("")}
          </ul>
        </div>
        <div style="margin-bottom:20px;">
          <div style="font-size:12px;text-transform:uppercase;color:#64748b;letter-spacing:0.06em;margin-bottom:4px;">Topics to Cover</div>
          <ul style="margin:0;padding-left:18px;color:#0f172a;font-size:14px;">
            ${data.topicsToCover.map((t) => `<li style="margin-bottom:4px;">${escapeHtml(t)}</li>`).join("")}
          </ul>
        </div>
        <div style="margin-bottom:20px;">
          <div style="font-size:12px;text-transform:uppercase;color:#64748b;letter-spacing:0.06em;margin-bottom:4px;">Estimated Traffic Gain</div>
          <div style="font-size:24px;font-weight:700;color:#7c3aed;">${escapeHtml(data.estimatedTrafficGain)}</div>
        </div>
        <div style="margin-top:24px;text-align:center;">
          <a href="${APP_URL}" style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Explore Content Gaps</a>
        </div>
      </div>
    </div>
    <div style="text-align:center;color:#94a3b8;font-size:12px;margin-top:16px;">You receive this because you subscribed to content gap monitoring.</div>
  </div>
</body></html>`;
}

function renderBlogGenerationCompleteEmail(data: BlogGenerationCompletePayload): string {
  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f0fdf4;font-family:-apple-system,Segoe UI,Roboto,sans-serif;">
  <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
    <div style="background:#fff;border:1px solid #bbf7d0;border-radius:12px;overflow:hidden;">
      <div style="padding:24px 28px;background:#16a34a;color:#fff;">
        <div style="font-size:14px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.85;">✅ Blog Generation Complete</div>
        <div style="font-size:22px;font-weight:700;margin-top:6px;">${data.count} Articles Ready</div>
      </div>
      <div style="padding:24px 28px;">
        <div style="display:flex;gap:12px;margin-bottom:20px;">
          <div style="flex:1;padding:14px;background:#dcfce7;border-radius:8px;">
            <div style="font-size:11px;text-transform:uppercase;color:#166534;letter-spacing:0.06em;">Total Words</div>
            <div style="font-size:24px;font-weight:700;color:#16a34a;margin-top:4px;">${data.totalWordCount.toLocaleString()}</div>
          </div>
          <div style="flex:1;padding:14px;background:#fef9c3;border-radius:8px;">
            <div style="font-size:11px;text-transform:uppercase;color:#854d0e;letter-spacing:0.06em;">Avg SEO Score</div>
            <div style="font-size:24px;font-weight:700;color:#ca8a04;margin-top:4px;">${data.averageSeoScore}/100</div>
          </div>
        </div>
        <div style="margin-bottom:20px;">
          <div style="font-size:12px;text-transform:uppercase;color:#64748b;letter-spacing:0.06em;margin-bottom:4px;">Keywords Generated</div>
          <ul style="margin:0;padding-left:18px;color:#0f172a;font-size:14px;">
            ${data.keywords.slice(0, 10).map((k) => `<li style="margin-bottom:4px;">${escapeHtml(k)}</li>`).join("")}
            ${data.keywords.length > 10 ? `<li style="margin-bottom:4px;">...and ${data.keywords.length - 10} more</li>` : ""}
          </ul>
        </div>
        <div style="margin-top:24px;text-align:center;">
          <a href="${data.downloadLink}" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Download All Articles</a>
        </div>
      </div>
    </div>
    <div style="text-align:center;color:#94a3b8;font-size:12px;margin-top:16px;">You receive this because you started a blog generation batch.</div>
  </div>
</body></html>`;
}

function renderPlanUsageWarningEmail(data: PlanUsagePayload): string {
  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#fffbeb;font-family:-apple-system,Segoe UI,Roboto,sans-serif;">
  <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
    <div style="background:#fff;border:1px solid #fde68a;border-radius:12px;overflow:hidden;">
      <div style="padding:24px 28px;background:#d97706;color:#fff;">
        <div style="font-size:14px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.85;">⚠️ Plan Usage Warning</div>
        <div style="font-size:22px;font-weight:700;margin-top:6px;">${data.percent}% Used</div>
      </div>
      <div style="padding:24px 28px;">
        <div style="margin-bottom:20px;">
          <div style="font-size:12px;text-transform:uppercase;color:#64748b;letter-spacing:0.06em;margin-bottom:4px;">Plan</div>
          <div style="font-size:16px;font-weight:600;color:#0f172a;">${escapeHtml(data.planName)}</div>
        </div>
        <div style="display:flex;gap:12px;margin-bottom:20px;">
          <div style="flex:1;padding:14px;background:#fef3c7;border-radius:8px;">
            <div style="font-size:11px;text-transform:uppercase;color:#92400e;letter-spacing:0.06em;">Used</div>
            <div style="font-size:24px;font-weight:700;color:#d97706;margin-top:4px;">${data.used}</div>
          </div>
          <div style="flex:1;padding:14px;background:#f3f4f6;border-radius:8px;">
            <div style="font-size:11px;text-transform:uppercase;color:#6b7280;letter-spacing:0.06em;">Limit</div>
            <div style="font-size:24px;font-weight:700;color:#374151;margin-top:4px;">${data.limit}</div>
          </div>
        </div>
        <div style="margin-bottom:20px;">
          <div style="font-size:12px;text-transform:uppercase;color:#64748b;letter-spacing:0.06em;margin-bottom:4px;">Renewal Date</div>
          <div style="font-size:16px;font-weight:600;color:#0f172a;">${escapeHtml(data.renewDate)}</div>
        </div>
        <p style="color:#334155;line-height:1.6;font-size:14px;margin:0 0 16px;">
          You're approaching your monthly optimization limit. Consider upgrading your plan to avoid interruptions.
        </p>
        <div style="margin-top:24px;text-align:center;">
          <a href="${APP_URL}" style="display:inline-block;background:#d97706;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Upgrade Plan</a>
        </div>
      </div>
    </div>
    <div style="text-align:center;color:#94a3b8;font-size:12px;margin-top:16px;">You receive this because you're on the ${escapeHtml(data.planName)} plan.</div>
  </div>
</body></html>`;
}

function renderSiteMonitorCompleteEmail(data: { siteUrl: string; pagesScanned: number; averageScore: number }): string {
  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#eff6ff;font-family:-apple-system,Segoe UI,Roboto,sans-serif;">
  <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
    <div style="background:#fff;border:1px solid #bfdbfe;border-radius:12px;overflow:hidden;">
      <div style="padding:24px 28px;background:#2563eb;color:#fff;">
        <div style="font-size:14px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.85;">🔍 Site Scan Complete</div>
        <div style="font-size:22px;font-weight:700;margin-top:6px;">${escapeHtml(data.siteUrl)}</div>
      </div>
      <div style="padding:24px 28px;">
        <div style="display:flex;gap:12px;margin-bottom:20px;">
          <div style="flex:1;padding:14px;background:#dbeafe;border-radius:8px;">
            <div style="font-size:11px;text-transform:uppercase;color:#1e40af;letter-spacing:0.06em;">Pages Scanned</div>
            <div style="font-size:24px;font-weight:700;color:#2563eb;margin-top:4px;">${data.pagesScanned}</div>
          </div>
          <div style="flex:1;padding:14px;background:#dcfce7;border-radius:8px;">
            <div style="font-size:11px;text-transform:uppercase;color:#166534;letter-spacing:0.06em;">Average Score</div>
            <div style="font-size:24px;font-weight:700;color:#16a34a;margin-top:4px;">${data.averageScore}/100</div>
          </div>
        </div>
        <div style="margin-top:24px;text-align:center;">
          <a href="${APP_URL}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">View Scan Results</a>
        </div>
      </div>
    </div>
    <div style="text-align:center;color:#94a3b8;font-size:12px;margin-top:16px;">You receive this because you started a site scan.</div>
  </div>
</body></html>`;
}

/**
 * Render email HTML template based on notification type
 */
function renderEmailTemplate(type: NotificationType, data: Record<string, unknown>): string {
  switch (type) {
    case "site_score_drop":
      return renderLowScoreAlertEmail({
        domain: (data as any).siteUrl,
        pageUrl: (data as any).pageUrl,
        pageTitle: (data as any).pageUrl,
        score: (data as any).newScore,
        previousScore: (data as any).oldScore,
        appUrl: APP_URL,
      });
    case "weekly_report":
      return renderReportEmail({
        domain: "Your Monitored Sites",
        summary: "Your weekly SEO report is ready!",
        pagesScanned: (data as any).totalPages,
        regressions: ((data as any).siteBreakdown || []).filter((s: any) => s.status === "declined").length,
        newGaps: ((data as any).topIssues || []).length,
        diffs: ((data as any).siteBreakdown || []).map((s: any) => ({
          url: s.url,
          title: s.url,
          status: s.status,
          scoreDelta: s.change,
          previousScore: s.score - s.change,
          currentScore: s.score,
          currentGaps: 0,
          newGapQuestions: [],
        })),
        appUrl: APP_URL,
      });
    case "competitor_changed":
      return renderCompetitorChangedEmail(data as any);
    case "content_gap_alert":
      return renderContentGapAlertEmail(data as any);
    case "blog_generation_complete":
      return renderBlogGenerationCompleteEmail(data as any);
    case "plan_usage_warning":
      return renderPlanUsageWarningEmail(data as any);
    case "site_monitor_complete":
      return renderSiteMonitorCompleteEmail(data as any);
    default:
      return `
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="padding: 20px;">
              <h1 style="color: #333;">${notificationTemplates[type as keyof typeof notificationTemplates].subject}</h1>
              <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
                ${JSON.stringify(data, null, 2)}
              </pre>
              <p style="margin-top: 20px;">
                <a href="${APP_URL}" style="color: #2563eb;">Go to SEOaxe</a>
              </p>
            </div>
          </body>
        </html>
      `;
  }
}

/**
 * Notification triggers - call these when events happen
 */

export async function notifySiteScoreDrop(
  config: EmailConfig,
  userId: number,
  userEmail: string,
  data: SiteScoreDropPayload
): Promise<void> {
  await queueNotification(config, {
    userId,
    userEmail,
    type: "site_score_drop",
    subject: notificationTemplates.site_score_drop.subject.replace("{{siteUrl}}", data.siteUrl),
    data: data as unknown as Record<string, unknown>,
  });
}

export async function notifyWeeklyReport(
  config: EmailConfig,
  userId: number,
  userEmail: string,
  data: WeeklyReportPayload
): Promise<void> {
  await queueNotification(config, {
    userId,
    userEmail,
    type: "weekly_report",
    subject: notificationTemplates.weekly_report.subject.replace("{{date}}", data.date),
    data: data as unknown as Record<string, unknown>,
  });
}

export async function notifyBlogGenerationComplete(
  config: EmailConfig,
  userId: number,
  userEmail: string,
  data: BlogGenerationCompletePayload
): Promise<void> {
  await queueNotification(config, {
    userId,
    userEmail,
    type: "blog_generation_complete",
    subject: notificationTemplates.blog_generation_complete.subject.replace("{{count}}", String(data.count)),
    data: data as unknown as Record<string, unknown>,
  });
}

export async function notifyPlanUsageWarning(
  config: EmailConfig,
  userId: number,
  userEmail: string,
  data: PlanUsagePayload
): Promise<void> {
  await queueNotification(config, {
    userId,
    userEmail,
    type: "plan_usage_warning",
    subject: notificationTemplates.plan_usage_warning.subject.replace("{{percent}}", String(data.percent)),
    data: data as unknown as Record<string, unknown>,
  });
}
