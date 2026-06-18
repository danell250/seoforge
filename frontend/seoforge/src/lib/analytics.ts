/**
 * Lightweight analytics wrapper.
 *
 * Uses PostHog when VITE_POSTHOG_KEY is set, otherwise falls back to
 * console.debug so events are still visible during local development.
 *
 * Usage:
 *   import { track } from "@/lib/analytics";
 *   track("audit_completed", { score: 82, url: "https://..." });
 */

declare global {
  interface Window {
    posthog?: {
      capture: (event: string, properties?: Record<string, unknown>) => void;
      identify: (id: string, properties?: Record<string, unknown>) => void;
    };
  }
}

function isPosthogLoaded(): boolean {
  return typeof window !== "undefined" && typeof window.posthog?.capture === "function";
}

export function track(event: string, properties?: Record<string, unknown>): void {
  if (isPosthogLoaded()) {
    window.posthog!.capture(event, properties);
  } else if (import.meta.env.DEV) {
    console.debug("[analytics]", event, properties ?? {});
  }
}

export function identify(userId: string, properties?: Record<string, unknown>): void {
  if (isPosthogLoaded()) {
    window.posthog!.identify(userId, properties);
  }
}

// ── Named event helpers ────────────────────────────────────────────────────────
export const Analytics = {
  signedUp(email: string) {
    track("signed_up", { email });
  },
  loggedIn(email: string) {
    track("logged_in", { email });
  },
  firstAuditRun(url: string) {
    track("first_audit_run", { url });
  },
  auditCompleted(url: string, score: number, plan: string) {
    track("audit_completed", { url, score, plan });
  },
  planUpgraded(fromPlan: string, toPlan: string, amountUsd: number) {
    track("plan_upgraded", { from_plan: fromPlan, to_plan: toPlan, amount_usd: amountUsd });
  },
  demoAuditRun(url: string) {
    track("demo_audit_run", { url });
  },
  emailCaptured(source: "footer" | "cta_banner") {
    track("email_captured", { source });
  },
  changelogViewed() {
    track("changelog_viewed");
  },
};
