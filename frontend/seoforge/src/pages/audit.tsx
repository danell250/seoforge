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
  AlertTriangle,
  CheckCircle2,
  FileText,
  Code2,
  Link2,
  ShieldCheck,
  Loader2,
  Sparkles,
} from "lucide-react";

interface AuditFinding {
  category: "meta" | "content" | "technical" | "social" | "links";
  severity: "critical" | "warning" | "good";
  title: string;
  detail: string;
}

interface AuditResult {
  url: string;
  overallScore: number;
  metaScore: number;
  contentScore: number;
  technicalScore: number;
  socialScore: number;
  linkScore: number;
  title: string;
  metaDescription: string;
  h1: string;
  wordCount: number;
  imageCount: number;
  imagesWithoutAlt: number;
  internalLinks: number;
  externalLinks: number;
  findings: AuditFinding[];
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

function Gauge({ score, size = 160 }: { score: number; size?: number }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference * 0.75;
  const color = score >= 80 ? "#16a34a" : score >= 50 ? "#d97706" : "#dc2626";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-[135deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={10}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * 0.25}
          strokeLinecap="round"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold ${scoreColorClass(score)}`}>{score}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

export default function AuditPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState("");

  async function handleAudit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await customFetch<AuditResult>("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      setResult(res);
    } catch (err: any) {
      const msg =
        err?.data?.message || err?.message || "Could not audit the page. Please check the URL and try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const criticalCount = result?.findings.filter((f) => f.severity === "critical").length ?? 0;
  const warningCount = result?.findings.filter((f) => f.severity === "warning").length ?? 0;
  const goodCount = result?.findings.filter((f) => f.severity === "good").length ?? 0;

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary/5 to-transparent py-16 md:py-24">
          <div className="container mx-auto max-w-3xl px-4 text-center">
            <Badge variant="outline" className="mb-4 px-3 py-1 text-xs font-medium">
              <Sparkles className="mr-1 h-3 w-3" /> Free Tool
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Free SEO Audit Tool
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Check your website SEO score instantly. Enter any URL and get a detailed audit with actionable fixes in seconds.
            </p>

            <form onSubmit={handleAudit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="https://yourwebsite.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-10 h-12"
                  disabled={loading}
                />
              </div>
              <Button type="submit" disabled={loading || !url} className="h-12 px-6">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Auditing...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Check My Score
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
            <div className="container mx-auto max-w-5xl px-4">
              {/* Score Header */}
              <Card className="mb-8 border-2 border-primary/10">
                <CardContent className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="shrink-0">
                      <Gauge score={result.overallScore} />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h2 className="text-2xl font-bold mb-1">
                        {result.overallScore >= 80
                          ? "Great job!"
                          : result.overallScore >= 50
                            ? "Room for improvement"
                            : "Needs work"}
                      </h2>
                      <p className="text-muted-foreground mb-3">
                        {result.title || result.url}
                      </p>
                      <div className="flex flex-wrap justify-center md:justify-start gap-2">
                        {criticalCount > 0 && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            <AlertTriangle className="mr-1 h-3 w-3" /> {criticalCount} Critical
                          </Badge>
                        )}
                        {warningCount > 0 && (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            <AlertTriangle className="mr-1 h-3 w-3" /> {warningCount} Warnings
                          </Badge>
                        )}
                        {goodCount > 0 && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle2 className="mr-1 h-3 w-3" /> {goodCount} Passing
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category Scores */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
                {[
                  { label: "Meta", score: result.metaScore },
                  { label: "Content", score: result.contentScore },
                  { label: "Technical", score: result.technicalScore },
                  { label: "Social", score: result.socialScore },
                  { label: "Links", score: result.linkScore },
                ].map((cat) => (
                  <Card key={cat.label} className={`border ${scoreBgClass(cat.score)}`}>
                    <CardContent className="p-4 text-center">
                      <div className={`text-2xl font-bold ${scoreColorClass(cat.score)}`}>{cat.score}</div>
                      <div className="text-xs text-muted-foreground mt-1">{cat.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">Words</div>
                    <div className="text-xl font-semibold">{result.wordCount.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">Images</div>
                    <div className="text-xl font-semibold">
                      {result.imageCount}
                      {result.imagesWithoutAlt > 0 && (
                        <span className="text-sm text-red-600 ml-1">({result.imagesWithoutAlt} no alt)</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">Internal Links</div>
                    <div className="text-xl font-semibold">{result.internalLinks}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">External Links</div>
                    <div className="text-xl font-semibold">{result.externalLinks}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Findings */}
              <div className="space-y-3 mb-12">
                <h3 className="text-lg font-semibold">Findings</h3>
                {result.findings.map((finding, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 p-4 rounded-lg border ${
                      finding.severity === "critical"
                        ? "bg-red-50 border-red-200"
                        : finding.severity === "warning"
                          ? "bg-amber-50 border-amber-200"
                          : "bg-green-50 border-green-200"
                    }`}
                  >
                    {finding.severity === "critical" ? (
                      <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    ) : finding.severity === "warning" ? (
                      <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-medium text-sm">{finding.title}</div>
                      <div className="text-sm text-muted-foreground mt-0.5">{finding.detail}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="shrink-0">
                      <ShieldCheck className="h-12 w-12 text-primary" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-lg font-semibold mb-1">Get the full guided audit</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        This audit shows what is wrong. SEOaxe can generate reviewable snippets, schema guidance, AEO answer blocks, and a checklist for every issue found.
                      </p>
                      <div className="flex flex-wrap justify-center md:justify-start gap-3">
                        <Link href="/app#site-crawler">
                          <Button>
                            Open Workspace <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href="/pricing">
                          <Button variant="outline">View Plans</Button>
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
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    icon: FileText,
                    title: "Meta & Tags",
                    desc: "Title length, meta description, canonical tags, viewport, and language attributes.",
                  },
                  {
                    icon: Code2,
                    title: "Technical SEO",
                    desc: "Schema markup, Open Graph, Twitter Cards, mobile readiness, and hreflang coverage.",
                  },
                  {
                    icon: Link2,
                    title: "Content & Links",
                    desc: "Heading structure, word count, image alt text, internal and external linking.",
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
