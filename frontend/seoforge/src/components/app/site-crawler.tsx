import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCrawlSite, useOptimizeHtml, useDetectContentGaps } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import {
  Globe,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Download,
  Rocket,
  Search,
  Sparkles,
} from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

interface CrawlPage {
  url: string;
  filename: string;
  title: string;
  originalHtml: string;
  optimizedHtml?: string;
  changes?: string[];
  score?: { overall: number; technical: number; content: number; aeo: number };
  status: "pending" | "processing" | "success" | "error";
  gapStatus?: "pending" | "processing" | "success" | "error";
  gapHtml?: string;
  gapsCount?: number;
  coverageBefore?: number;
  coverageAfter?: number;
}

export function SiteCrawler() {
  const [url, setUrl] = useState("");
  const [maxPages, setMaxPages] = useState(15);
  const [pages, setPages] = useState<CrawlPage[]>([]);
  const [domain, setDomain] = useState("");
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [done, setDone] = useState(false);
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [isFillingGaps, setIsFillingGaps] = useState(false);
  const [gapsProgress, setGapsProgress] = useState(0);
  const [gapsCurrent, setGapsCurrent] = useState("");
  const [gapsDone, setGapsDone] = useState(false);

  const { toast } = useToast();
  const crawlMutation = useCrawlSite();
  const optimizeMutation = useOptimizeHtml();
  const gapMutation = useDetectContentGaps();

  const reset = () => {
    setPages([]);
    setDomain("");
    setProgress(0);
    setCurrentFile("");
    setIsOptimizing(false);
    setDone(false);
    setIsFillingGaps(false);
    setGapsProgress(0);
    setGapsCurrent("");
    setGapsDone(false);
  };

  const startCrawl = async () => {
    if (!url.trim()) {
      toast({
        title: "Enter a URL",
        description: "Paste a domain like example.co.za to start crawling.",
        variant: "destructive",
      });
      return;
    }
    reset();

    try {
      const result = await crawlMutation.mutateAsync({
        data: { url: url.trim(), maxPages },
      });
      const initial: CrawlPage[] = result.pages.map((p) => ({
        url: p.url,
        filename: p.filename,
        title: p.title,
        originalHtml: p.html,
        status: "pending",
      }));
      setPages(initial);
      setDomain(result.domain);
      toast({
        title: "Crawl complete",
        description: `Discovered ${initial.length} page${initial.length === 1 ? "" : "s"} on ${result.domain}.`,
      });
      // Auto-start optimization
      await runOptimization(initial);
    } catch {
      toast({
        title: "Crawl failed",
        description: "We couldn't crawl that site, please try again.",
        variant: "destructive",
      });
    }
  };

  const runOptimization = async (initial: CrawlPage[]) => {
    setIsOptimizing(true);
    setProgress(0);
    const updated = [...initial];

    for (let i = 0; i < updated.length; i++) {
      const page = updated[i];
      setCurrentFile(page.url);
      updated[i] = { ...page, status: "processing" };
      setPages([...updated]);

      try {
        const result = await optimizeMutation.mutateAsync({
          data: { html: page.originalHtml, filename: page.filename },
        });
        updated[i] = {
          ...page,
          optimizedHtml: result.optimizedHtml,
          changes: result.changes,
          score: result.score,
          status: "success",
        };
      } catch {
        updated[i] = { ...page, status: "error" };
      }

      setProgress(((i + 1) / updated.length) * 100);
      setPages([...updated]);
    }

    setIsOptimizing(false);
    setCurrentFile("");
    setDone(true);
    const successCount = updated.filter((p) => p.status === "success").length;
    toast({
      title: "Site optimization complete",
      description: `Optimized ${successCount} of ${updated.length} pages.`,
    });
  };

  const downloadAll = async () => {
    const zip = new JSZip();
    let count = 0;
    pages.forEach((p) => {
      if (p.status === "success" && p.optimizedHtml) {
        zip.file(p.filename, p.optimizedHtml);
        count++;
      }
    });
    if (count === 0) {
      toast({ title: "Nothing to download", variant: "destructive" });
      return;
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const safeDomain = domain
      .replace(/^https?:\/\//, "")
      .replace(/[^a-zA-Z0-9.-]/g, "-");
    saveAs(blob, `seoforge-${safeDomain}-optimized.zip`);
  };

  const fillGapsForAll = async () => {
    if (!topic.trim()) {
      toast({
        title: "Add a topic",
        description: "Enter the niche so the AI knows which questions to look for.",
        variant: "destructive",
      });
      return;
    }
    const targets = pages
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => p.status === "success" && (p.optimizedHtml || p.originalHtml));
    if (targets.length === 0) {
      toast({ title: "No pages ready", variant: "destructive" });
      return;
    }

    setIsFillingGaps(true);
    setGapsProgress(0);
    setGapsDone(false);
    const updated = [...pages];

    let completed = 0;
    for (const { p, i } of targets) {
      setGapsCurrent(p.url);
      updated[i] = { ...updated[i], gapStatus: "processing" };
      setPages([...updated]);
      try {
        const result = await gapMutation.mutateAsync({
          data: {
            html: p.optimizedHtml || p.originalHtml,
            topic: topic.trim(),
            audience: audience.trim() || undefined,
          },
        });
        updated[i] = {
          ...updated[i],
          gapStatus: "success",
          gapHtml: result.augmentedHtml,
          gapsCount: result.gaps.length,
          coverageBefore: result.coverageScoreBefore,
          coverageAfter: result.coverageScoreAfter,
        };
      } catch {
        updated[i] = { ...updated[i], gapStatus: "error" };
      }
      completed++;
      setGapsProgress((completed / targets.length) * 100);
      setPages([...updated]);
    }

    setIsFillingGaps(false);
    setGapsCurrent("");
    setGapsDone(true);
    const okCount = updated.filter((p) => p.gapStatus === "success").length;
    toast({
      title: "Content gaps filled",
      description: `${okCount} of ${targets.length} pages have new sections ready.`,
    });
  };

  const sendAllToDeployQueue = () => {
    const queue = pages
      .filter((p) => p.gapStatus === "success" && p.gapHtml)
      .map((p) => ({
        id: p.url,
        sourceUrl: p.url,
        title: p.title,
        filename: p.filename,
        html: p.gapHtml!,
        gapsCount: p.gapsCount,
      }));
    if (queue.length === 0) {
      toast({ title: "Nothing to queue", variant: "destructive" });
      return;
    }
    sessionStorage.setItem("seoforge:deploy-queue", JSON.stringify(queue));
    sessionStorage.setItem("seoforge:deploy-html", queue[0].html);
    window.location.hash = "deploy";
    window.dispatchEvent(new Event("seoforge:deploy-html-updated"));
    toast({
      title: `${queue.length} pages queued`,
      description: "Open the Deploy tab to push them one click at a time.",
    });
  };

  const downloadSingle = (page: CrawlPage) => {
    if (!page.optimizedHtml) return;
    const blob = new Blob([page.optimizedHtml], {
      type: "text/html;charset=utf-8",
    });
    saveAs(blob, page.filename);
  };

  const isCrawling = crawlMutation.isPending;
  const isBusy = isCrawling || isOptimizing || isFillingGaps;
  const successPagesCount = pages.filter((p) => p.status === "success").length;
  const gapsReadyCount = pages.filter((p) => p.gapStatus === "success").length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {pages.length === 0 ? (
        <Card className="border-2 border-primary/10 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Scan and Optimize a Website</CardTitle>
                <CardDescription>
                  Enter a website URL. We scan its pages, improve each one, and let you download the updated files.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="crawl-url">Domain or URL</Label>
              <div className="flex gap-2">
                <Input
                  id="crawl-url"
                  placeholder="https://your-site.co.za"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isBusy}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") startCrawl();
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={startCrawl}
                  disabled={isBusy}
                  className="gap-2 min-w-[160px]"
                >
                  {isCrawling ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Scanning…
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Scan Site
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                We only follow pages on the same domain and skip images, PDFs, and other assets.
              </p>
            </div>

            <div className="space-y-2 max-w-xs">
              <Label htmlFor="max-pages">Max pages to crawl</Label>
              <Input
                id="max-pages"
                type="number"
                min={1}
                max={50}
                value={maxPages}
                onChange={(e) =>
                  setMaxPages(
                    Math.max(
                      1,
                      Math.min(50, Number(e.target.value) || 15),
                    ),
                  )
                }
                disabled={isBusy}
              />
              <p className="text-xs text-muted-foreground">Hard cap is 50.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <Feature
                title="Find pages"
                body="We follow internal links on the same domain and collect each HTML page we can reach."
              />
              <Feature
                title="Improve each page"
                body="Every discovered page gets rewritten with better metadata, structure, and FAQ-ready formatting."
              />
              <Feature
                title="Download everything"
                body="Get one ZIP file with every updated page when the run is finished."
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
            <div>
              <CardTitle>{domain}</CardTitle>
              <CardDescription>
                {pages.length} page{pages.length === 1 ? "" : "s"} discovered
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {done && (
                <Button
                  onClick={downloadAll}
                  className="gap-2"
                  data-testid="button-download-all"
                >
                  <Download className="h-4 w-4" />
                  Download Updated Site
                </Button>
              )}
              <Button variant="outline" onClick={reset} disabled={isBusy}>
                Scan Another Site
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {isOptimizing && (
              <div className="mb-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-primary">
                    Optimizing page{" "}
                    {Math.ceil((progress / 100) * pages.length)} of{" "}
                    {pages.length}…
                  </span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground truncate">
                  Current: {currentFile}
                </p>
              </div>
            )}

            {done && successPagesCount > 0 && (
              <div className="mb-6 rounded-lg border-2 border-purple-200 bg-purple-50/50 p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-base">Apply Content Gaps to ALL Pages</h3>
                    <p className="text-sm text-muted-foreground">
                      Find missing topics across all the updated pages, add the new sections, and then send the whole batch to Publish.
                    </p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">What is this site about? *</Label>
                    <Input
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g. contact center"
                      disabled={isFillingGaps}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Who is it for? (optional)</Label>
                    <Input
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      placeholder="e.g. contact center managers"
                      disabled={isFillingGaps}
                    />
                  </div>
                </div>
                {isFillingGaps && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-purple-700">Filling gaps…</span>
                      <span>{Math.round(gapsProgress)}%</span>
                    </div>
                    <Progress value={gapsProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground truncate">Current: {gapsCurrent}</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 justify-end">
                  <Button
                    onClick={fillGapsForAll}
                    disabled={isBusy || !topic.trim()}
                    className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {isFillingGaps ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" /> Filling Gaps…
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" /> Add Missing Content to {successPagesCount} Pages
                      </>
                    )}
                  </Button>
                  {gapsDone && gapsReadyCount > 0 && (
                    <Button onClick={sendAllToDeployQueue} className="gap-2" variant="default">
                      <Rocket className="h-4 w-4" /> Send {gapsReadyCount} to Publish Queue
                    </Button>
                  )}
                </div>
              </div>
            )}

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Changes</TableHead>
                    <TableHead>Gaps</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.map((page, i) => (
                    <TableRow key={i}>
                      <TableCell
                        className="font-medium max-w-[320px] truncate"
                        title={page.url}
                      >
                        <div className="truncate">{page.title || page.url}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {page.url}
                        </div>
                      </TableCell>
                      <TableCell>
                        {page.status === "pending" && (
                          <span className="text-muted-foreground text-sm">
                            Waiting
                          </span>
                        )}
                        {page.status === "processing" && (
                          <span className="text-blue-500 text-sm flex items-center gap-1">
                            <RefreshCw className="h-3 w-3 animate-spin" />
                            Processing
                          </span>
                        )}
                        {page.status === "success" && (
                          <span className="text-green-600 text-sm flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Done
                          </span>
                        )}
                        {page.status === "error" && (
                          <span className="text-red-500 text-sm flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Error
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {page.score ? (
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold ${
                                page.score.overall >= 80
                                  ? "text-green-600"
                                  : page.score.overall >= 50
                                    ? "text-orange-500"
                                    : "text-red-500"
                              }`}
                            >
                              {page.score.overall}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              /100
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {page.changes
                          ? `${page.changes.length} updates`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {page.gapStatus === "processing" && (
                          <span className="text-blue-500 text-sm flex items-center gap-1">
                            <RefreshCw className="h-3 w-3 animate-spin" />
                            Detecting
                          </span>
                        )}
                        {page.gapStatus === "success" && (
                          <span className="text-sm flex items-center gap-2">
                            <Sparkles className="h-3 w-3 text-purple-600" />
                            <span className="font-medium">{page.gapsCount} new</span>
                            {typeof page.coverageBefore === "number" && (
                              <span className="text-xs text-muted-foreground">
                                {page.coverageBefore}→{page.coverageAfter}
                              </span>
                            )}
                          </span>
                        )}
                        {page.gapStatus === "error" && (
                          <span className="text-red-500 text-sm flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Error
                          </span>
                        )}
                        {!page.gapStatus && (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadSingle(page)}
                          disabled={page.status !== "success"}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <div className="font-semibold text-sm mb-1">{title}</div>
      <div className="text-xs text-muted-foreground">{body}</div>
    </div>
  );
}
