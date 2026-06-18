import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { X, Check, ArrowRight, Zap, Globe, Bot, BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";
import { Analytics } from "@/lib/analytics";

const STORAGE_KEY = "seoaxe-onboarding-complete";

const STEPS = [
  {
    title: "Welcome to SEOaxe 🎉",
    description:
      "You're 3 steps away from your first SEO score. Let's get your site ranked higher.",
    icon: Zap,
    detail: "SEOaxe audits live pages, finds issues, and gives you copy-ready AI fixes in seconds.",
  },
  {
    title: "Step 1: Enter your URL",
    description: "Paste any live page URL into the Website Audit tool.",
    icon: Globe,
    detail:
      "Any public URL works — your homepage, a blog post, a product page. We fetch it in real-time.",
  },
  {
    title: "Step 2: Get your SEO score",
    description: "SEOaxe scans metadata, headings, schema, and AEO signals instantly.",
    icon: BarChart3,
    detail:
      "You'll see Technical, Content, and AEO scores — each with a prioritised list of what to fix first.",
  },
  {
    title: "Step 3: Apply the fixes",
    description: "Copy the AI-generated fixes and deploy them directly to your site.",
    icon: Bot,
    detail:
      "Every fix is copy-paste ready. No developer needed. Most pages improve 15–30 points after one pass.",
  },
];

interface Props {
  /** Called when the user completes or skips onboarding. */
  onComplete?: () => void;
}

export function OnboardingWalkthrough({ onComplete }: Props) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  const close = (completed: boolean) => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "true");
    if (completed) {
      Analytics.firstAuditRun("onboarding_completed");
    }
    onComplete?.();
  };

  if (!visible) return null;

  const current = STEPS[step]!;
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Close */}
        <button
          onClick={() => close(false)}
          className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close onboarding"
        >
          <X className="h-4 w-4 text-slate-500" />
        </button>

        <CardHeader className="pb-4">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg leading-snug">{current.title}</CardTitle>
              <CardDescription className="mt-1">{current.description}</CardDescription>
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i <= step ? "bg-blue-600" : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Detail callout */}
          <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-800">
            {current.detail}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => close(false)}
              className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
            >
              Skip for now
            </button>
            <Button
              onClick={() => {
                if (isLast) {
                  close(true);
                } else {
                  setStep((s) => s + 1);
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              {isLast ? (
                <>
                  <Check className="h-4 w-4" />
                  Run My First Audit
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
