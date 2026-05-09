import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDetectContentGaps } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Copy, Play, RefreshCw, Search, TrendingUp, Globe } from "lucide-react";

const IMPACT_STYLE: Record<string, string> = {
  high: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-orange-50 text-orange-700 border-orange-200",
  low: "bg-blue-50 text-blue-700 border-blue-200",
};

export function ContentGapDetector() {
  const [url, setUrl] = useState("");
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const { toast } = useToast();
  const mutation = useDetectContentGaps();

  const handleRun = async () => {
    if (!url.trim()) {
      toast({ title: "URL required", description: "Enter a live page URL first.", variant: "destructive" });
      return;
    }
    if (!topic.trim()) {
      toast({ title: "Topic required", description: "Tell us what niche this page targets.", variant: "destructive" });
      return;
    }
    try {
      const html = await fetchPageHtml(url);
      mutation.mutate(
        { data: { html, topic: topic.trim(), audience: audience.trim() || undefined } },
        { onError: () => toast({ title: "Error", description: "Detection failed, please try again.", variant: "destructive" }) },
      );
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch page. Please check the URL.", variant: "destructive" });
    }
  };

  const fetchPageHtml = async (url: string): Promise<string> => {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch');
    return await response.text();
  };

  const reset = () => {
    setUrl("");
    setTopic("");
    setAudience("");
    mutation.reset();
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: `${label} copied.` });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {!mutation.data ? (
        <Card className="border-2 border-primary/10 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Search className="h-6 w-6 text-primary" />
              Missing Content Finder
            </CardTitle>
            <CardDescription>
              Enter a live page URL to find missing content. SEOaxe scans your page directly and gives you copyable sections to review.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Live page URL</label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/page"
                className="font-mono"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">What is this page about? *</label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. contact center"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Who is this page for? (optional)</label>
                <Input
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g. contact center managers"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 border-t px-6 py-4 flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {url.length > 0 ? "URL ready to scan" : "No URL provided"}
            </span>
            <Button size="lg" onClick={handleRun} disabled={mutation.isPending || !url.trim()} className="gap-2 px-8">
              {mutation.isPending ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" /> Analyzing...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" /> Find Missing Content
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              {mutation.data.gaps.length} Content Gaps Found
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={reset}>
                <RefreshCw className="h-4 w-4 mr-2" /> Start Over
              </Button>
            </div>
          </div>

          <Card className="shadow-md">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle>Topic Coverage Score</CardTitle>
              <CardDescription>How well your page covers searcher intent for this niche.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="text-5xl font-bold text-red-600">{mutation.data.coverageScoreBefore}</div>
                  <div className="text-sm text-muted-foreground mt-1">Before</div>
                </div>
                <ArrowRight className="h-8 w-8 text-muted-foreground" />
                <div className="text-center">
                  <div className="text-5xl font-bold text-green-600">{mutation.data.coverageScoreAfter}</div>
                  <div className="text-sm text-muted-foreground mt-1">After (with new sections)</div>
                </div>
              </div>
              <div className="mt-6 h-3 w-full bg-muted rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-red-500 transition-all duration-1000 absolute top-0 left-0"
                  style={{ width: `${mutation.data.coverageScoreBefore}%` }}
                />
                <div
                  className="h-full bg-green-500 transition-all duration-1000 absolute top-0 left-0 opacity-60"
                  style={{ width: `${mutation.data.coverageScoreAfter}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle>Missing Topics &amp; New Content</CardTitle>
              <CardDescription>Sorted by ranking impact. Each section will be injected into your page.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {mutation.data.gaps.map((g, i) => (
                <div key={i} className="border rounded-lg p-4 bg-card">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className={`text-xs uppercase font-bold px-2 py-0.5 rounded border ${IMPACT_STYLE[g.impact] || IMPACT_STYLE.medium}`}
                        >
                          {g.impact} impact
                        </span>
                        <h3 className="font-semibold text-base">{g.question}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{g.why}</p>
                    </div>
                    <Button size="sm" variant="ghost" className="shrink-0" onClick={() => copy(g.sectionHtml, "Section HTML")}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="mt-3 border rounded bg-muted/30 p-3">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Generated section</div>
                    <div
                      className="prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: g.sectionHtml }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Tabs defaultValue="html" className="w-full">
            <TabsList>
              <TabsTrigger value="html">Suggested HTML</TabsTrigger>
              <TabsTrigger value="sections">All Section HTML</TabsTrigger>
            </TabsList>
            <TabsContent value="html" className="m-0 mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30">
                  <div>
                    <CardTitle className="text-base">Suggested page sections in context</CardTitle>
                    <CardDescription>Review these suggestions before adding them to your site.</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => copy(mutation.data.augmentedHtml, "HTML")}>
                      <Copy className="h-3 w-3 mr-1" /> Copy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <pre className="text-[12px] font-mono p-4 max-h-[500px] overflow-auto bg-[#1e1e1e] text-[#d4d4d4]">
                    {mutation.data.augmentedHtml}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="sections" className="m-0 mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30">
                  <CardTitle className="text-base">Just the new sections</CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copy(mutation.data.gaps.map((g) => g.sectionHtml).join("\n\n"), "Sections")}
                  >
                    <Copy className="h-3 w-3 mr-1" /> Copy all
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <pre className="text-[12px] font-mono p-4 max-h-[500px] overflow-auto bg-[#1e1e1e] text-[#d4d4d4]">
                    {mutation.data.gaps.map((g) => g.sectionHtml).join("\n\n")}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
