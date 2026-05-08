import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { customFetch } from "@workspace/api-client-react";
import {
  Search,
  ArrowRight,
  Globe,
  Type,
  Heading1,
  FileText,
  ListChecks,
  Target,
  Loader2,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";

interface IntentResult {
  url: string;
  keyword: string;
  overallScore: number;
  intentType: string;
  title: string;
  metaDescription: string;
  h1: string;
  scores: {
    titleMatch: number;
    h1Match: number;
    first100Words: number;
    bodyMatch: number;
    headingMatch: number;
    metaMatch: number;
  };
  checks: {
    keywordInTitle: boolean;
    keywordInH1: boolean;
    keywordInFirst100: boolean;
  };
  recommendations: string[];
}

function scoreColorClass(score: number) {
  if (score >= 80) return "text-green-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-600";
}

function scoreBgClass(score: number) {
  if (score >= 80) return "bg-green-50 border-green-200";
  if (score >= 50) return "bg-amber-50 border-amber-200";
  return "bg-red-50 border-red-200";
}

function Gauge({ score, size = 140 }: { score: number; size?: number }) {
  const radius = (size - 14) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference * 0.75;
  const color = score >= 80 ? "#16a34a" : score >= 50 ? "#d97706" : "#dc2626";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-[135deg]">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#e5e7eb" strokeWidth={9}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * 0.25}
          strokeLinecap="round"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={9}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-bold ${scoreColorClass(score)}`}>{score}</span>
        <span className="text-[10px] text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

export default function IntentPage() {
  const [url, setUrl] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IntentResult | null>(null);
  const [error, setError] = useState("");

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || !keyword.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await customFetch<IntentResult>("/api/search-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), keyword: keyword.trim() }),
      });
      setResult(res);
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Could not analyze the page. Please check the URL and try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const intentLabels: Record<string, { label: string; color: string }> = {
    informational: { label: "Informational", color: "bg-blue-50 text-blue-700 border-blue-200" },
    transactional: { label: "Transactional", color: "bg-purple-50 text-purple-700 border-purple-200" },
    commercial: { label: "Commercial", color: "bg-amber-50 text-amber-700 border-amber-200" },
    navigational: { label: "Navigational", color: "bg-slate-50 text-slate-700 border-slate-200" },
    "tool-seeking": { label: "Tool-Seeking", color: "bg-green-50 text-green-700 border-green-200" },
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary/5 to-transparent py-16 md:py-20">
          <div className="container mx-auto max-w-3xl px-4 text-center">
            <Badge variant="outline" className="mb-4 px-3 py-1 text-xs font-medium">
              <Sparkles className="mr-1 h-3 w-3" /> Free Tool
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Search Intent Matcher
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Does your page actually match what people are searching for? Enter your keyword and URL to find out.
            </p>

            <form onSubmit={handleAnalyze} className="space-y-3 max-w-lg mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Target keyword (e.g. free seo audit tool)"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="pl-10 h-12"
                  disabled={loading}
                />
              </div>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Your page URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-10 h-12"
                  disabled={loading}
                />
              </div>
              <Button type="submit" disabled={loading || !url || !keyword} className="h-12 w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Target className="mr-2 h-4 w-4" />
                    Check Intent Match
                  </>
                )}
              </Button>
            </form>

            {error && (
              <div className="mt-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm max-w-lg mx-auto">
                {error}
              </div>
            )}
          </div>
        </section>

        {/* Results */}
        {result && (
          <section className="py-12">
            <div className="container mx-auto max-w-4xl px-4">
              {/* Score Header */}
              <Card className="mb-6 border-2 border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="shrink-0">
                      <Gauge score={result.overallScore} />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start mb-2">
                        <h2 className="text-2xl font-bold">Intent Match Score</h2>
                        <Badge className={intentLabels[result.intentType]?.color || "bg-slate-50 text-slate-700 border-slate-200"}>
                          {intentLabels[result.intentType]?.label || result.intentType}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm mb-3">
                        {result.keyword} &mdash; {result.url}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {result.overallScore >= 80
                          ? "Strong intent match. Your page signals clearly match the search query."
                          : result.overallScore >= 50
                            ? "Moderate match. A few adjustments could significantly improve rankings."
                            : "Weak match. The page may not rank well for this keyword without changes."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category Scores */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                {[
                  { label: "Title Tag", icon: Type, score: result.scores.titleMatch, check: result.checks.keywordInTitle },
                  { label: "H1 Heading", icon: Heading1, score: result.scores.h1Match, check: result.checks.keywordInH1 },
                  { label: "First 100 Words", icon: FileText, score: result.scores.first100Words, check: result.checks.keywordInFirst100 },
                  { label: "Body Content", icon: ListChecks, score: result.scores.bodyMatch, check: result.scores.bodyMatch >= 30 },
                  { label: "Meta Description", icon: Search, score: result.scores.metaMatch, check: result.scores.metaMatch >= 30 },
                  { label: "Subheadings", icon: Target, score: result.scores.headingMatch, check: result.scores.headingMatch >= 30 },
                ].map((cat) => (
                  <Card key={cat.label} className={`border ${scoreBgClass(cat.score)}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        {cat.check ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm font-medium">{cat.label}</span>
                      </div>
                      <div className={`text-xl font-bold ${scoreColorClass(cat.score)}`}>{cat.score}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Page Snippets */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Title Tag</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium text-blue-700 line-clamp-3">
                      {result.title || "No title found"}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-medium">H1 Heading</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium line-clamp-3">
                      {result.h1 || "No H1 found"}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Meta Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {result.metaDescription || "No meta description found"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations */}
              {result.recommendations.length > 0 && (
                <div className="space-y-3 mb-12">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    Fixes to Improve Intent Match
                  </h3>
                  {result.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-lg border bg-amber-50 border-amber-200">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-amber-200 text-amber-800 text-xs font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm">{rec}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* CTA */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="shrink-0">
                      <ShieldCheck className="h-12 w-12 text-primary" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-lg font-semibold mb-1">Generate the fixes automatically</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        SEOForge can rewrite your title, meta, headings, and body to better match this search intent — then deliver deployable HTML.
                      </p>
                      <div className="flex flex-wrap justify-center md:justify-start gap-3">
                        <Link href="/signup">
                          <Button>
                            Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href="/audit">
                          <Button variant="outline">Try Free Audit Tool</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Empty State Info */}
        {!result && !loading && (
          <section className="pb-24">
            <div className="container mx-auto max-w-4xl px-4">
              <h2 className="text-center text-lg font-semibold mb-6">Why Search Intent Match Matters</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    icon: Target,
                    title: "#1 Ranking Factor",
                    desc: "Google now ranks pages that match the searcher's goal, not just pages with the most keywords.",
                  },
                  {
                    icon: Type,
                    title: "Title & H1 Signal",
                    desc: "If your title and heading do not contain the keyword, Google assumes the page is not relevant.",
                  },
                  {
                    icon: ListChecks,
                    title: "Content Structure",
                    desc: "Informational queries want guides. Transactional queries want buy buttons. Structure matters.",
                  },
                ].map((item) => (
                  <Card key={item.title} className="border-border/60">
                    <CardHeader>
                      <item.icon className="h-8 w-8 text-primary mb-2" />
                      <CardTitle className="text-base">{item.title}</CardTitle>
                      <CardDescription>{item.desc}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
