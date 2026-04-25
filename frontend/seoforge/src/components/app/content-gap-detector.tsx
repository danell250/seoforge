import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDetectContentGaps } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Copy, Download, Play, RefreshCw, Rocket, Search, TrendingUp, UploadCloud } from "lucide-react";

const IMPACT_STYLE: Record<string, string> = {
  high: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-orange-50 text-orange-700 border-orange-200",
  low: "bg-blue-50 text-blue-700 border-blue-200",
};

export function ContentGapDetector() {
  const [html, setHtml] = useState("");
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const { toast } = useToast();
  const mutation = useDetectContentGaps();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setHtml(ev.target?.result as string);
    reader.readAsText(file);
  };

  const handleRun = () => {
    if (!html.trim()) {
      toast({ title: "HTML required", description: "Paste the page HTML first.", variant: "destructive" });
      return;
    }
    if (!topic.trim()) {
      toast({ title: "Topic required", description: "Tell us what niche this page targets.", variant: "destructive" });
      return;
    }
    mutation.mutate(
      { data: { html, topic: topic.trim(), audience: audience.trim() || undefined } },
      { onError: () => toast({ title: "Error", description: "Detection failed, please try again.", variant: "destructive" }) },
    );
  };

  const reset = () => {
    setHtml("");
    setTopic("");
    setAudience("");
    mutation.reset();
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: `${label} copied.` });
  };

  const download = (text: string, name: string, mime: string) => {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
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
              Paste in your page HTML and this tool finds important questions or topics the page is missing, writes the
              extra sections for you, and adds them into the page HTML.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <div className="relative">
              <Textarea
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                placeholder="Paste your page HTML here..."
                className="min-h-[320px] font-mono text-sm resize-y p-4 bg-muted/30 focus-visible:ring-primary"
              />
              <div className="absolute top-4 right-4">
                <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur-sm shadow-sm" asChild>
                  <label className="cursor-pointer flex items-center gap-2">
                    <UploadCloud className="h-4 w-4" /> Upload HTML
                    <input type="file" accept=".html,.htm" className="hidden" onChange={handleFile} />
                  </label>
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 border-t px-6 py-4 flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {html.length > 0 ? `${(html.length / 1024).toFixed(1)} KB loaded` : "No HTML loaded yet"}
            </span>
            <Button size="lg" onClick={handleRun} disabled={mutation.isPending} className="gap-2 px-8">
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
              <Button
                variant="default"
                onClick={() => {
                  sessionStorage.setItem("seoforge:deploy-html", mutation.data.augmentedHtml);
                  window.location.hash = "deploy";
                  window.dispatchEvent(new Event("seoforge:deploy-html-updated"));
                  toast({ title: "Sent to Deploy", description: "Open the Deploy tab to push it live." });
                }}
                className="gap-2"
              >
                <Rocket className="h-4 w-4" /> Send to Deploy
              </Button>
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
              <TabsTrigger value="html">Augmented HTML</TabsTrigger>
              <TabsTrigger value="sections">All Section HTML</TabsTrigger>
            </TabsList>
            <TabsContent value="html" className="m-0 mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30">
                  <div>
                    <CardTitle className="text-base">Page with all gaps filled</CardTitle>
                    <CardDescription>Drop straight into your site.</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => copy(mutation.data.augmentedHtml, "HTML")}>
                      <Copy className="h-3 w-3 mr-1" /> Copy
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => download(mutation.data.augmentedHtml, "page-gaps-filled.html", "text/html")}
                    >
                      <Download className="h-3 w-3 mr-1" /> Download
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
