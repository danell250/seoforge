import { useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SITE_URL } from "@/lib/brand-metadata";
import {
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Lock,
  Search,
  Sparkles,
  Code2,
  Globe,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────
interface AuditScore {
  technical: number;
  content: number;
  aeo: number;
  overall: number;
}

interface AuditResult {
  url: string;
  score: AuditScore;
  issues: { severity: "critical" | "warning" | "info"; message: string }[];
  preview: string[]; // first 3 fix suggestions, rest gated
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function scoreLabel(n: number) {
  if (n >= 80) return { label: "Excellent", color: "text-emerald-600", ring: "border-emerald-400", bg: "bg-emerald-50" };
  if (n >= 50) return { label: "Needs Work", color: "text-amber-600", ring: "border-amber-400", bg: "bg-amber-50" };
  return { label: "Poor", color: "text-red-600", ring: "border-red-400", bg: "bg-red-50" };
}

function ScoreRing({ score, label }: { score: number; label: string }) {
  const meta = scoreLabel(score);
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative w-24 h-24 rounded-full border-4 ${meta.ring} ${meta.bg} flex items-center justify-center`}>
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r={r} fill="none" stroke="#e2e8f0" strokeWidth="6" />
          <circle
            cx="44" cy="44" r={r} fill="none"
            stroke={score >= 80 ? "#059669" : score >= 50 ? "#d97706" : "#dc2626"}
            strokeWidth="6"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
          />
        </svg>
        <span className={`text-2xl font-black ${meta.color}`}>{score}</span>
      </div>
      <span className={`text-xs font-semibold uppercase tracking-wide ${meta.color}`}>{meta.label}</span>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}

function IssueIcon({ severity }: { severity: "critical" | "warning" | "info" }) {
  if (severity === "critical") return <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />;
  if (severity === "warning") return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />;
  return <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />;
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function Demo() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // We run a real lightweight audit against the backend's /api/audit endpoint.
  // It returns a subset of data — full fixes are gated behind signup.
  const runAudit = async () => {
    setError(null);
    setResult(null);

    let normalized = url.trim();
    if (!normalized) return;
    if (!/^https?:\/\//i.test(normalized)) normalized = `https://${normalized}`;

    try {
      new URL(normalized);
    } catch {
      setError("Please enter a valid URL, e.g. https://yoursite.com");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL ?? "http://localhost:4000/api"}/audit/demo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalized }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { message?: string }).message ?? "Audit failed. Please try another URL.");
      }

      const data = (await res.json()) as AuditResult;
      setResult(data);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Helmet>
        <title>Free SEO Audit Demo — SEOaxe</title>
        <meta name="description" content="Run a free SEO audit on any live URL. Get a real SEO health score, critical issues, and AI-powered fix previews — no account needed." />
        <link rel="canonical" href={`${SITE_URL}/demo`} />
        <meta property="og:title" content="Free SEO Audit Demo — SEOaxe" />
        <meta property="og:description" content="Instant SEO health score for any URL. See exactly what's hurting your rankings — free, no account needed." />
        <meta property="og:url" content={`${SITE_URL}/demo`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="SEOaxe" />
        <meta property="og:image" content={`${SITE_URL}/opengraph.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free SEO Audit Demo — SEOaxe" />
        <meta name="twitter:description" content="Instant SEO health score for any URL. See exactly what's hurting your rankings — free, no account needed." />
        <meta name="twitter:image" content={`${SITE_URL}/opengraph.png`} />
        <meta name="twitter:site" content="@seoaxe" />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <Navbar />

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="py-20 bg-gradient-to-b from-blue-50 to-white border-b border-slate-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Free Live Audit — No account needed
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-4">
              See your SEO score<br />
              <span className="text-blue-600">in 30 seconds</span>
            </h1>
            <p className="text-slate-500 text-lg mb-10 max-w-xl mx-auto">
              Enter any live URL and get a real-time SEO health score, critical issue list, and a preview of AI-powered fixes — for free.
            </p>

            {/* URL input */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !loading && runAudit()}
                  placeholder="https://yourwebsite.com/page"
                  className="w-full h-12 pl-10 pr-4 text-sm border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
              <button
                onClick={runAudit}
                disabled={loading || !url.trim()}
                className="h-12 px-7 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Scanning…</>
                ) : (
                  <><Search className="w-4 h-4" /> Run Free Audit</>
                )}
              </button>
            </div>

            {error && (
              <p className="mt-4 text-sm text-red-600 flex items-center justify-center gap-1.5">
                <XCircle className="w-4 h-4" /> {error}
              </p>
            )}

            <p className="mt-4 text-xs text-slate-400">
              ✓ No sign-up required &nbsp;·&nbsp; ✓ Real-time scan &nbsp;·&nbsp; ✓ Instant results
            </p>
          </div>
        </section>

        {/* ── Results ── */}
        {result && (
          <section ref={resultsRef} className="py-16 max-w-4xl mx-auto px-4 sm:px-6">
            {/* Score header */}
            <div className="text-center mb-10">
              <p className="text-xs text-slate-400 font-medium mb-2 truncate">Audit for: {result.url}</p>
              <h2 className="text-2xl font-black text-slate-900 mb-8">Your SEO Health Scores</h2>
              <div className="flex flex-wrap justify-center gap-8">
                <ScoreRing score={result.score.overall} label="Overall" />
                <ScoreRing score={result.score.technical} label="Technical" />
                <ScoreRing score={result.score.content} label="Content" />
                <ScoreRing score={result.score.aeo} label="AEO" />
              </div>
            </div>

            {/* Issues found */}
            <div className="mb-10">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Issues Found
              </h3>
              <div className="space-y-2">
                {result.issues.map((issue, i) => (
                  <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50 text-sm text-slate-700">
                    <IssueIcon severity={issue.severity} />
                    <span>{issue.message}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fix preview — first 3 shown, rest gated */}
            <div className="mb-10">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-blue-500" />
                AI-Powered Fix Preview
              </h3>
              <div className="space-y-2">
                {result.preview.map((fix, i) => (
                  <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl border border-blue-100 bg-blue-50 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>{fix}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gate — unlock full report */}
            <div className="relative rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50 p-8 text-center overflow-hidden">
              <div className="absolute inset-0 backdrop-blur-[2px] bg-white/40 flex items-center justify-center z-10 rounded-2xl">
                <div className="text-center px-6">
                  <Lock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="text-xl font-black text-slate-900 mb-2">
                    Unlock the Full Audit Report
                  </h3>
                  <p className="text-sm text-slate-600 mb-6 max-w-xs mx-auto">
                    Get all AI-generated fixes, copyable schema markup, competitor gap analysis, and AEO answer blocks — free account included.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href={`/signup?redirect=${encodeURIComponent("/app")}`}>
                      <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg flex items-center gap-2 transition-colors">
                        Create Free Account
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </Link>
                    <Link href="/pricing">
                      <button className="px-6 py-3 border border-slate-200 bg-white text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors">
                        View Pricing
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
              {/* Blurred placeholder rows below the gate */}
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl border border-blue-100 bg-white text-sm text-slate-300 mb-2 blur-sm select-none">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{"█".repeat(30 + i * 10)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Social proof strip ── */}
        {!result && (
          <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { stat: "10,000+", label: "Pages audited", icon: Globe },
                { stat: "85%", label: "Avg. organic traffic increase", icon: ArrowRight },
                { stat: "30 sec", label: "Average audit time", icon: Sparkles },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.stat} className="text-center p-6 rounded-2xl border border-slate-100 bg-slate-50">
                    <Icon className="w-6 h-6 text-blue-500 mx-auto mb-3" />
                    <div className="text-3xl font-black text-slate-900 mb-1">{item.stat}</div>
                    <div className="text-sm text-slate-500">{item.label}</div>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 text-center">
              <p className="text-sm text-slate-500 mb-6">
                Want the full toolkit? Create a free account and run unlimited audits.
              </p>
              <Link href="/signup">
                <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2 mx-auto">
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
