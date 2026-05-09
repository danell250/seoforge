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

const BREVO_API_KEY = process.env["BREVO_API_KEY"];
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

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

/**
 * Render email HTML template based on notification type
 */
function renderEmailTemplate(type: NotificationType, data: Record<string, unknown>): string {
  // TODO: Implement actual HTML email templates
  // For now, return a simple template
  return `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="padding: 20px;">
          <h1 style="color: #333;">${notificationTemplates[type].subject}</h1>
          <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
            ${JSON.stringify(data, null, 2)}
          </pre>
          <p style="margin-top: 20px;">
            <a href="https://www.seoaxe.site" style="color: #2563eb;">Go to SEOaxe</a>
          </p>
        </div>
      </body>
    </html>
  `;
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
