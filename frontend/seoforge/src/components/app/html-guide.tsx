import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  FileCode,
  Globe,
  HelpCircle,
  MessageCircle,
  Monitor,
  X,
} from "lucide-react";

type OptionKey = "live" | "cms" | "file";
type BrowserTab = "win" | "mac" | "mobile";
type CmsTab = "wp" | "shopify" | "other";

const STORAGE_KEY = "seoforge:single-page-html-guide-dismissed";

interface HtmlGuideProps {
  sendPrompt: (prompt: string) => void;
  onUploadClick: () => void;
  hasHtml: boolean;
}

export function HtmlGuide({ sendPrompt, onUploadClick, hasHtml }: HtmlGuideProps) {
  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }
    return window.localStorage.getItem(STORAGE_KEY) !== "1";
  });
  const [option, setOption] = useState<OptionKey>("live");
  const [browserTab, setBrowserTab] = useState<BrowserTab>("win");
  const [cmsTab, setCmsTab] = useState<CmsTab>("wp");

  const dismissGuide = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "1");
    }
    setOpen(false);
  };

  const conversationPrompt =
    option === "live"
      ? `I am on the SEOaxe one-page optimizer and I need help getting the full HTML from a live website. Please walk me through it for ${browserLabel(browserTab)}.`
      : option === "cms"
        ? `I am on the SEOaxe one-page optimizer and I need help getting the full HTML from ${cmsLabel(cmsTab)}. Please give me the exact steps.`
        : "I already have an HTML file but I am not sure if it is the right file for SEOaxe. Please help me confirm what to upload.";

  return (
    <div className="mb-4 overflow-hidden rounded-lg border border-primary/15 bg-primary/[0.03]">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex flex-1 items-center gap-3 text-left"
        >
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/15">
            <HelpCircle className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-foreground">How do I get my page HTML?</div>
            <div className="text-xs text-muted-foreground">
              Pick where your page lives and follow the fastest path.
            </div>
          </div>
        </button>
        <div className="flex items-center gap-1">
          {open && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground"
              onClick={dismissGuide}
            >
              <X className="h-3.5 w-3.5" />
              Hide
            </Button>
          )}
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen((value) => !value)}>
            {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="space-y-4 border-t border-primary/10 px-4 pb-4 pt-3">
          {hasHtml && (
            <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-800 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-200">
              Your HTML is already loaded. You can optimize now or keep this open as a reference.
            </div>
          )}

          <div className="grid gap-2 sm:grid-cols-3">
            <OptionCard
              active={option === "live"}
              onClick={() => setOption("live")}
              icon={<Globe className="h-4 w-4" />}
              label="Live website"
              sub="Any published page in a browser"
            />
            <OptionCard
              active={option === "cms"}
              onClick={() => setOption("cms")}
              icon={<Monitor className="h-4 w-4" />}
              label="WordPress / Shopify"
              sub="Your site lives in a CMS"
            />
            <OptionCard
              active={option === "file"}
              onClick={() => setOption("file")}
              icon={<FileCode className="h-4 w-4" />}
              label="Existing HTML file"
              sub="You already have a .html file"
            />
          </div>

          {option === "live" && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {(["win", "mac", "mobile"] as BrowserTab[]).map((tab) => (
                  <TabPill
                    key={tab}
                    active={browserTab === tab}
                    onClick={() => setBrowserTab(tab)}
                    label={browserLabel(tab)}
                  />
                ))}
              </div>

              {browserTab === "win" && (
                <Steps
                  items={[
                    <>Open the page you want to improve in <strong>Chrome</strong> or <strong>Firefox</strong>.</>,
                    <>Press <Kbd>Ctrl + U</Kbd> to open the page source in a new tab.</>,
                    <>Press <Kbd>Ctrl + A</Kbd>, then <Kbd>Ctrl + C</Kbd> to copy the full HTML.</>,
                    <>Come back here and paste it into the box below.</>,
                  ]}
                  tip="If the new tab starts with view-source:, that is exactly what you want."
                />
              )}

              {browserTab === "mac" && (
                <Steps
                  items={[
                    <>Open the page in <strong>Chrome</strong> or <strong>Safari</strong>.</>,
                    <>Press <Kbd>Cmd + Option + U</Kbd> in Chrome, or use <Kbd>Develop → Show Page Source</Kbd> in Safari.</>,
                    <>Press <Kbd>Cmd + A</Kbd>, then <Kbd>Cmd + C</Kbd> to copy everything.</>,
                    <>Paste the full HTML into the box below.</>,
                  ]}
                  tip="If Safari does not show the Develop menu yet, enable it in Safari Settings → Advanced."
                />
              )}

              {browserTab === "mobile" && (
                <Steps
                  items={[
                    <>The easiest path is to do this on a laptop or desktop.</>,
                    <>If you only have your phone, save the page to Files and use <strong>Upload HTML</strong> below.</>,
                    <>You can also try adding <Kbd>view-source:</Kbd> before the URL in Chrome, but desktop is more reliable.</>,
                  ]}
                  tip="SEOaxe works best with the full page source, including the head tags."
                />
              )}
            </div>
          )}

          {option === "cms" && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {(["wp", "shopify", "other"] as CmsTab[]).map((tab) => (
                  <TabPill
                    key={tab}
                    active={cmsTab === tab}
                    onClick={() => setCmsTab(tab)}
                    label={cmsLabel(tab)}
                  />
                ))}
              </div>

              {cmsTab === "wp" && (
                <div className="grid gap-2 sm:grid-cols-2">
                  <CmsCard
                    title="Fastest path"
                    steps={[
                      "Open the published page on your site.",
                      "Use page source: Ctrl+U on Windows or Cmd+Option+U on Mac.",
                      "Copy the full HTML.",
                      "Paste it here.",
                    ]}
                  />
                  <CmsCard
                    title="Inside WordPress"
                    steps={[
                      "Open the page in the editor.",
                      "Use the top-right menu.",
                      "Switch to Code editor.",
                      "Copy the HTML block content.",
                    ]}
                  />
                  <div className="sm:col-span-2">
                    <Tip>The live page method usually gives better results because it includes your theme, metadata, and schema output.</Tip>
                  </div>
                </div>
              )}

              {cmsTab === "shopify" && (
                <div className="grid gap-2 sm:grid-cols-2">
                  <CmsCard
                    title="Fastest path"
                    steps={[
                      "Open the live product or landing page.",
                      "Use page source in your browser.",
                      "Copy the rendered HTML.",
                      "Paste it here.",
                    ]}
                  />
                  <CmsCard
                    title="Inside Shopify"
                    steps={[
                      "Go to Online Store → Themes.",
                      "Open Actions → Edit code.",
                      "Find the right template.",
                      "Copy the template only if you cannot use the live page source.",
                    ]}
                  />
                  <div className="sm:col-span-2">
                    <Tip>Rendered HTML is usually better than copying a Liquid template because it shows what search engines actually receive.</Tip>
                  </div>
                </div>
              )}

              {cmsTab === "other" && (
                <Steps
                  items={[
                    <>Wix and Squarespace usually do not expose clean raw HTML in the editor.</>,
                    <>Open the published page and use the browser page-source method instead.</>,
                    <>After SEOaxe improves the page, copy the title, description, schema, and content changes back into your CMS.</>,
                  ]}
                  tip="You do not need to rebuild your site by hand. Most CMS tools have fields for SEO title, description, and code injection."
                />
              )}
            </div>
          )}

          {option === "file" && (
            <div className="space-y-3">
              <Steps
                items={[
                  <>Click <strong>Upload HTML</strong> and choose your <Kbd>.html</Kbd> or <Kbd>.htm</Kbd> file.</>,
                  <>SEOaxe will load it into the editor automatically.</>,
                  <>Click <strong>Improve This Page</strong> when you are ready.</>,
                ]}
                tip="If you have a whole folder of pages, use the Many Files tab for a ZIP upload."
              />
              <Button type="button" variant="outline" size="sm" onClick={onUploadClick}>
                <FileCode className="h-4 w-4" />
                Choose HTML File
              </Button>
            </div>
          )}

          <details className="group rounded-md border border-border/60 bg-background/60 px-3 py-2">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-medium text-foreground">
              <ChevronDown className="h-3 w-3 transition-transform group-open:rotate-180" />
              Will this break my site?
            </summary>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Faq
                q="Will copying the HTML change my live site?"
                a="No. You are only reading a copy of the page. Nothing changes on your website until you decide to publish new code."
              />
              <Faq
                q="Do I need to know code?"
                a="No. If you can open the page source or upload a file, SEOaxe can do the heavy lifting from there."
              />
              <Faq
                q="How much HTML should I copy?"
                a="Copy the whole page source, especially the head section. That is where title tags, schema, canonical tags, and other SEO signals live."
              />
              <Faq
                q="What if my platform hides the code?"
                a="Use the live-page browser method. That grabs the final page HTML that search engines see, even when the CMS editor feels locked down."
              />
            </div>
          </details>

          <div className="flex flex-col gap-2 border-t border-primary/10 pt-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="sm:flex-1"
              onClick={() =>
                sendPrompt("I am stuck getting HTML into SEOaxe. Please tell me the simplest way to copy or upload the right HTML for my page.")
              }
            >
              <MessageCircle className="h-4 w-4" />
              I am still stuck
            </Button>
            <Button type="button" className="sm:flex-1" onClick={() => sendPrompt(conversationPrompt)}>
              <MessageCircle className="h-4 w-4" />
              Walk me through my setup
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function OptionCard({
  active,
  onClick,
  icon,
  label,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md border p-3 text-left transition-colors",
        active
          ? "border-primary/40 bg-primary/10 ring-1 ring-primary/20"
          : "border-border/60 bg-background hover:border-primary/20 hover:bg-primary/[0.03]",
      )}
    >
      <div className={cn("mb-2", active ? "text-primary" : "text-muted-foreground")}>{icon}</div>
      <div className="text-sm font-medium text-foreground">{label}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </button>
  );
}

function TabPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-primary/25 bg-primary/10 text-primary"
          : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

function Steps({ items, tip }: { items: ReactNode[]; tip?: string }) {
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-start gap-2.5">
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
            {index + 1}
          </div>
          <div className="text-sm leading-snug text-foreground">{item}</div>
        </div>
      ))}
      {tip ? <Tip>{tip}</Tip> : null}
    </div>
  );
}

function CmsCard({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div className="rounded-md border border-border/50 bg-background/70 p-3">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground">{title}</div>
      <ol className="space-y-1">
        {steps.map((step, index) => (
          <li key={index} className="flex gap-1.5 text-xs text-muted-foreground">
            <span className="shrink-0 font-medium text-primary/70">{index + 1}.</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Tip({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs leading-relaxed text-green-800 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-200">
      <span className="font-semibold">Tip:</span> {children}
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-foreground">{q}</div>
      <div className="text-xs leading-relaxed text-muted-foreground">{a}</div>
    </div>
  );
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <code className="rounded border border-border/60 bg-muted px-1 py-0.5 font-mono text-[11px] text-foreground">
      {children}
    </code>
  );
}

function browserLabel(tab: BrowserTab) {
  if (tab === "win") {
    return "Windows / Linux";
  }
  if (tab === "mac") {
    return "Mac";
  }
  return "Mobile";
}

function cmsLabel(tab: CmsTab) {
  if (tab === "wp") {
    return "WordPress";
  }
  if (tab === "shopify") {
    return "Shopify";
  }
  return "Wix / Squarespace";
}
