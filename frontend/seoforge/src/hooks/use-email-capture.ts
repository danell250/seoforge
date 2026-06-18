import { useState } from "react";
import { Analytics } from "@/lib/analytics";

type Status = "idle" | "loading" | "success" | "error";

/**
 * Submits an email to the Brevo (Sendinblue) contacts API.
 * Requires VITE_BREVO_API_KEY and VITE_BREVO_LIST_ID to be set.
 * Falls back to a success state in development when keys are missing
 * so the UI still works during local testing.
 */
export function useEmailCapture(source: "footer" | "cta_banner" = "footer") {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const submit = async (email: string) => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setMessage("");

    const apiKey = import.meta.env.VITE_BREVO_API_KEY as string | undefined;
    const listId = Number(import.meta.env.VITE_BREVO_LIST_ID ?? 3);

    // Dev fallback — no key configured
    if (!apiKey) {
      if (import.meta.env.DEV) {
        console.debug("[email-capture] DEV mode — would subscribe:", trimmed, "to list", listId);
        await new Promise((r) => setTimeout(r, 600));
        setStatus("success");
        setMessage("You're on the list!");
        Analytics.emailCaptured(source);
      } else {
        setStatus("error");
        setMessage("Newsletter signup is not configured yet.");
      }
      return;
    }

    try {
      const res = await fetch("https://api.brevo.com/v3/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey,
        },
        body: JSON.stringify({
          email: trimmed,
          listIds: [listId],
          updateEnabled: true,
        }),
      });

      if (res.ok || res.status === 204) {
        setStatus("success");
        setMessage("You're on the list! We'll send you SEO tips and product updates.");
        Analytics.emailCaptured(source);
      } else {
        const body = await res.json().catch(() => ({}));
        const msg = (body as { message?: string }).message ?? "Signup failed. Please try again.";
        // 400 with "Contact already exist" is actually fine
        if (typeof msg === "string" && msg.toLowerCase().includes("already exist")) {
          setStatus("success");
          setMessage("You're already subscribed!");
          Analytics.emailCaptured(source);
        } else {
          setStatus("error");
          setMessage(msg);
        }
      }
    } catch {
      setStatus("error");
      setMessage("Could not connect. Please try again shortly.");
    }
  };

  const reset = () => {
    setStatus("idle");
    setMessage("");
  };

  return { status, message, submit, reset };
}
