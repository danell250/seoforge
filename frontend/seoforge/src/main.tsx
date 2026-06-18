import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

// Initialize API base URL from environment variable
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
setBaseUrl(apiUrl);

// Initialize PostHog analytics (opt-in — only loads when key is configured)
const posthogKey = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const posthogHost = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? "https://app.posthog.com";

if (posthogKey) {
  import("posthog-js").then(({ default: posthog }) => {
    posthog.init(posthogKey, {
      api_host: posthogHost,
      capture_pageview: true,
      capture_pageleave: true,
      persistence: "localStorage",
      autocapture: false, // we fire explicit events only
    });
    // Expose on window so our analytics wrapper can reach it
    (window as Window & { posthog?: typeof posthog }).posthog = posthog;
  }).catch(() => {
    // PostHog failed to load — silently continue
  });
}

createRoot(document.getElementById("root")!).render(<App />);
