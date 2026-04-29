import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useGetAgencySettings,
  useUpdateAgencySettings,
  getGetAgencySettingsQueryKey,
  customFetch,
} from "@workspace/api-client-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_AGENCY_SETTINGS, normalizeBrandName } from "../../../../lib/api-zod/src/brand";
import { Bot, Brush, CheckCircle2, Download, RefreshCw, Save, ThumbsDown, ThumbsUp } from "lucide-react";

interface AiFeedbackSummary {
  totals: {
    totalExamples: number;
    pendingCount: number;
    acceptedCount: number;
    rejectedCount: number;
    reviewedCount: number;
    acceptanceRate: number;
  };
  pageTypes: Array<{
    pageType: string;
    total: number;
    accepted: number;
    rejected: number;
    acceptanceRate: number;
  }>;
  acceptedExamples: Array<{
    id: number;
    optimizationId: number | null;
    taskName: string;
    pageType: string | null;
    title: string | null;
    evaluationScore: number | null;
    evaluationSummary: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
}

function formatPageType(pageType: string | null) {
  if (!pageType) return "Unknown";
  return pageType
    .split("-")
    .join(" ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function Settings() {
  const { data, isLoading } = useGetAgencySettings();
  const update = useUpdateAgencySettings();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const aiLearning = useQuery({
    queryKey: ["ai-feedback-summary"],
    queryFn: () => customFetch<AiFeedbackSummary>("/api/ai-feedback/summary", { method: "GET" }),
    retry: false,
  });

  const [brandName, setBrandName] = useState("");
  const [tagline, setTagline] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [supportEmail, setSupportEmail] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [brandVoice, setBrandVoice] = useState("");
  const [preferredMarkets, setPreferredMarkets] = useState("");
  const [primaryCms, setPrimaryCms] = useState("custom");
  const [optimizationStyle, setOptimizationStyle] = useState("balanced");

  useEffect(() => {
    if (data) {
      setBrandName(normalizeBrandName(data.brandName));
      setTagline(data.tagline);
      setLogoUrl(data.logoUrl ?? "");
      setPrimaryColor(data.primaryColor);
      setSupportEmail(data.supportEmail ?? "");
      setWebsiteUrl(data.websiteUrl ?? "");
      setBrandVoice(data.brandVoice ?? DEFAULT_AGENCY_SETTINGS.brandVoice);
      setPreferredMarkets(data.preferredMarkets ?? DEFAULT_AGENCY_SETTINGS.preferredMarkets);
      setPrimaryCms(data.primaryCms ?? DEFAULT_AGENCY_SETTINGS.primaryCms);
      setOptimizationStyle(data.optimizationStyle ?? DEFAULT_AGENCY_SETTINGS.optimizationStyle);
    }
  }, [data]);

  const handleSave = () => {
    if (!brandName.trim() || !tagline.trim()) {
      toast({ title: "Brand name and tagline required", variant: "destructive" });
      return;
    }
    if (!/^#[0-9a-fA-F]{6}$/.test(primaryColor)) {
      toast({ title: "Invalid color", description: "Use a 6-digit hex like #2563eb.", variant: "destructive" });
      return;
    }
    update.mutate(
      {
        data: {
          brandName: brandName.trim(),
          tagline: tagline.trim(),
          logoUrl: logoUrl.trim() || null,
          primaryColor,
          supportEmail: supportEmail.trim() || null,
          websiteUrl: websiteUrl.trim() || null,
          brandVoice: brandVoice.trim() || null,
          preferredMarkets: preferredMarkets.trim() || null,
          primaryCms: primaryCms.trim() || null,
          optimizationStyle: optimizationStyle.trim() || null,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetAgencySettingsQueryKey() });
          toast({ title: "Saved", description: "Branding updated everywhere." });
        },
        onError: () => toast({ title: "Save failed", description: "Please try again.", variant: "destructive" }),
      },
    );
  };

  const handleReset = () => {
    setBrandName(DEFAULT_AGENCY_SETTINGS.brandName);
    setTagline(DEFAULT_AGENCY_SETTINGS.tagline);
    setLogoUrl(DEFAULT_AGENCY_SETTINGS.logoUrl ?? "");
    setPrimaryColor(DEFAULT_AGENCY_SETTINGS.primaryColor);
    setSupportEmail(DEFAULT_AGENCY_SETTINGS.supportEmail ?? "");
    setWebsiteUrl(DEFAULT_AGENCY_SETTINGS.websiteUrl ?? "");
    setBrandVoice(DEFAULT_AGENCY_SETTINGS.brandVoice);
    setPreferredMarkets(DEFAULT_AGENCY_SETTINGS.preferredMarkets);
    setPrimaryCms(DEFAULT_AGENCY_SETTINGS.primaryCms);
    setOptimizationStyle(DEFAULT_AGENCY_SETTINGS.optimizationStyle);
  };

  const handleExportExamples = async () => {
    try {
      const exportData = await customFetch<{
        exportedAt: string;
        verdict: string;
        count: number;
        items: unknown[];
      }>("/api/ai-feedback/training-examples/export?verdict=accepted", { method: "GET" });

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "seoaxe-training-examples-accepted.json";
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Training examples exported",
        description: `${exportData.count} accepted example${exportData.count === 1 ? "" : "s"} downloaded.`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Training examples are not ready to export yet.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">White Label Settings</h1>
            <p className="text-muted-foreground">
              Rebrand the platform as your own. Sell it to your clients under your agency name.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-24 text-muted-foreground">Loading settings...</div>
          ) : (
            <div className="space-y-8">
              <Card className="shadow-md">
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brush className="h-5 w-5 text-primary" /> Agency branding
                  </CardTitle>
                  <CardDescription>Changes apply instantly across the entire app.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Brand name *</label>
                    <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} maxLength={60} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Primary color *</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="h-10 w-14 rounded border cursor-pointer"
                      />
                      <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} maxLength={7} />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-2 block">Tagline *</label>
                    <Textarea value={tagline} onChange={(e) => setTagline(e.target.value)} maxLength={200} rows={2} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-2 block">Logo URL</label>
                    <Input
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://yourcdn.com/logo.svg"
                    />
                    {logoUrl && (
                      <div className="mt-2 p-3 bg-muted/30 border rounded-md flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">Preview:</span>
                        <img src={logoUrl} alt="logo preview" className="h-8 w-auto" />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Support email</label>
                    <Input
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      placeholder="hello@youragency.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Agency website</label>
                    <Input
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://youragency.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Brand voice</label>
                    <Input
                      value={brandVoice}
                      onChange={(e) => setBrandVoice(e.target.value)}
                      placeholder="Clear, authoritative, friendly"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Preferred markets</label>
                    <Input
                      value={preferredMarkets}
                      onChange={(e) => setPreferredMarkets(e.target.value)}
                      placeholder="US SaaS, UK services, global B2B"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Primary CMS</label>
                    <select
                      value={primaryCms}
                      onChange={(e) => setPrimaryCms(e.target.value)}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="custom">Custom / Code</option>
                      <option value="wordpress">WordPress</option>
                      <option value="shopify">Shopify</option>
                      <option value="webflow">Webflow</option>
                      <option value="wix">Wix</option>
                      <option value="squarespace">Squarespace</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Optimization style</label>
                    <select
                      value={optimizationStyle}
                      onChange={(e) => setOptimizationStyle(e.target.value)}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="conservative">Conservative</option>
                      <option value="balanced">Balanced</option>
                      <option value="aggressive">Aggressive</option>
                    </select>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/30 border-t px-6 py-4 flex justify-between items-center">
                  <Button variant="outline" onClick={handleReset}>
                    <RefreshCw className="h-4 w-4 mr-2" /> Reset to defaults
                  </Button>
                  <div className="flex items-center gap-3">
                    {update.isSuccess && (
                      <span className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Saved
                      </span>
                    )}
                    <Button onClick={handleSave} disabled={update.isPending} size="lg" className="gap-2 px-6">
                      {update.isPending ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" /> Save changes
                        </>
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </Card>

              <Card className="shadow-md">
                <CardHeader className="border-b bg-muted/30">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Bot className="h-5 w-5 text-primary" /> SEOaxe AI Learning
                      </CardTitle>
                      <CardDescription>
                        Track what your users mark as helpful, see which page types perform best, and export accepted examples for future model tuning.
                      </CardDescription>
                    </div>
                    <Button variant="outline" onClick={() => void handleExportExamples()} className="gap-2">
                      <Download className="h-4 w-4" /> Export accepted examples
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {aiLearning.isLoading ? (
                    <div className="text-sm text-muted-foreground">Loading AI learning summary...</div>
                  ) : aiLearning.isError || !aiLearning.data ? (
                    <div className="rounded-lg border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                      AI learning analytics are not ready yet. If you just pulled the latest code, run the newest DB schema push first.
                    </div>
                  ) : (
                    <>
                      <div className="grid gap-4 md:grid-cols-4">
                        <Card className="shadow-none">
                          <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Examples captured</p>
                            <p className="mt-2 text-2xl font-semibold">{aiLearning.data.totals.totalExamples}</p>
                          </CardContent>
                        </Card>
                        <Card className="shadow-none">
                          <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Accepted</p>
                            <p className="mt-2 flex items-center gap-2 text-2xl font-semibold text-green-600">
                              <ThumbsUp className="h-5 w-5" />
                              {aiLearning.data.totals.acceptedCount}
                            </p>
                          </CardContent>
                        </Card>
                        <Card className="shadow-none">
                          <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Needs work</p>
                            <p className="mt-2 flex items-center gap-2 text-2xl font-semibold text-amber-600">
                              <ThumbsDown className="h-5 w-5" />
                              {aiLearning.data.totals.rejectedCount}
                            </p>
                          </CardContent>
                        </Card>
                        <Card className="shadow-none">
                          <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Acceptance rate</p>
                            <p className="mt-2 text-2xl font-semibold">{aiLearning.data.totals.acceptanceRate}%</p>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
                        <div>
                          <h3 className="text-sm font-semibold mb-3">Performance by page type</h3>
                          <div className="space-y-3">
                            {aiLearning.data.pageTypes.length > 0 ? (
                              aiLearning.data.pageTypes.map((entry) => (
                                <div key={entry.pageType} className="rounded-lg border bg-muted/20 px-4 py-3">
                                  <div className="flex items-center justify-between gap-3">
                                    <div>
                                      <p className="font-medium">{formatPageType(entry.pageType)}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {entry.total} captured · {entry.accepted} accepted · {entry.rejected} needs work
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-lg font-semibold">{entry.acceptanceRate}%</p>
                                      <p className="text-xs text-muted-foreground">acceptance</p>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="rounded-lg border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                                No page-type analytics yet. Mark a few optimizations as helpful or needs work first.
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-semibold mb-3">Accepted training examples</h3>
                          <div className="space-y-3">
                            {aiLearning.data.acceptedExamples.length > 0 ? (
                              aiLearning.data.acceptedExamples.map((example) => (
                                <div key={example.id} className="rounded-lg border bg-muted/20 px-4 py-3">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                      <p className="font-medium truncate">
                                        {example.title || "Untitled optimization"}
                                      </p>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {formatPageType(example.pageType)} · {example.taskName} · score {example.evaluationScore ?? 0}/100
                                      </p>
                                      {example.evaluationSummary && (
                                        <p className="text-sm text-muted-foreground mt-2">{example.evaluationSummary}</p>
                                      )}
                                    </div>
                                    <span className="shrink-0 text-xs text-muted-foreground">
                                      {new Date(example.updatedAt).toLocaleDateString("en-ZA")}
                                    </span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="rounded-lg border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                                No accepted examples yet. Once users mark optimizations as helpful, they will show up here and become exportable.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
