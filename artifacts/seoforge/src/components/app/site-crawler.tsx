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
import { useCrawlSite, useOptimizeHtml } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import {
  Globe,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Download,
  Search,
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

  const { toast } = useToast();
  const crawlMutation = useCrawlSite();
  const optimizeMutation = useOptimizeHtml();

  const reset = () => {
    setPages([]);
    setDomain("");
    setProgress(0);
    setCurrentFile("");
    setIsOptimizing(false);
    setDone(false);
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

  const downloadSingle = (page: CrawlPage) => {
    if (!page.optimizedHtml) return;
    const blob = new Blob([page.optimizedHtml], {
      type: "text/html;charset=utf-8",
    });
    saveAs(blob, page.filename);
  };

  const isCrawling = crawlMutation.isPending;
  const isBusy = isCrawling || isOptimizing;

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
                <CardTitle className="text-2xl">Full Website Crawler</CardTitle>
                <CardDescription>
                  Paste any domain. We crawl every page and optimize them in one
                  run — sitemap, schema, AEO, the lot.
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
                      Crawling…
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Crawl & Optimize
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                We respect same-origin only and skip non-HTML assets.
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
                title="Same-domain BFS"
                body="We follow internal links breadth-first, skipping PDFs, images and assets."
              />
              <Feature
                title="One-click optimization"
                body="Every discovered page is rewritten with full SEO + AEO improvements."
              />
              <Feature
                title="Bundled download"
                body="Get a single zip of every optimized page, ready to ship."
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
                  Download Optimized Site
                </Button>
              )}
              <Button variant="outline" onClick={reset} disabled={isBusy}>
                New Crawl
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

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Changes</TableHead>
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
