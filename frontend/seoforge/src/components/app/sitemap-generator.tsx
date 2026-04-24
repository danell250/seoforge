import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  useListSitemapUrls,
  useAddSitemapUrl,
  useDeleteSitemapUrl,
  getListSitemapUrlsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Copy, Download, ExternalLink, FileCode, Globe, Plus, RefreshCw, Trash2 } from "lucide-react";

const FREQ_OPTIONS = ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"] as const;

function escapeXml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

export function SitemapGenerator() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const list = useListSitemapUrls();
  const add = useAddSitemapUrl();
  const del = useDeleteSitemapUrl();

  const [newUrl, setNewUrl] = useState("");
  const [priority, setPriority] = useState(80);
  const [changefreq, setChangefreq] = useState<(typeof FREQ_OPTIONS)[number]>("weekly");
  const [siteRoot, setSiteRoot] = useState("");

  const items = list.data?.items ?? [];

  const refresh = () => queryClient.invalidateQueries({ queryKey: getListSitemapUrlsQueryKey() });

  const handleAdd = () => {
    const url = newUrl.trim();
    if (!url) return;
    try {
      new URL(url);
    } catch {
      toast({ title: "Invalid URL", description: "Enter a full URL including https://", variant: "destructive" });
      return;
    }
    add.mutate(
      { data: { url, priority, changefreq } },
      {
        onSuccess: () => {
          setNewUrl("");
          refresh();
        },
        onError: () => toast({ title: "Error", description: "Could not add URL.", variant: "destructive" }),
      },
    );
  };

  const handleDelete = (id: number) => {
    del.mutate({ id }, { onSuccess: refresh });
  };

  const lastmod = new Date().toISOString().slice(0, 10);
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items
  .map(
    (r) =>
      `  <url>\n    <loc>${escapeXml(r.url)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${(r.priority / 100).toFixed(2)}</priority>\n  </url>`,
  )
  .join("\n")}
</urlset>`;

  const robotsTxt = `User-agent: *\nAllow: /\n\nSitemap: ${siteRoot ? siteRoot.replace(/\/$/, "") : "https://yoursite.com"}/sitemap.xml\n`;

  const downloadFile = (name: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: `${label} copied to clipboard.` });
  };

  const submitToGsc = () => {
    if (!siteRoot.trim()) {
      toast({ title: "Site URL needed", description: "Add your website URL first.", variant: "destructive" });
      return;
    }
    const url = `https://search.google.com/search-console/sitemaps?resource_id=${encodeURIComponent(siteRoot.replace(/\/$/, ""))}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="border-2 border-primary/10 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <FileCode className="h-6 w-6 text-primary" />
            Automatic Sitemap &amp; Robots Generator
          </CardTitle>
          <CardDescription>
            Add every URL you optimize. We rebuild sitemap.xml and robots.txt automatically and submit to Google Search
            Console with one click.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Your website URL</label>
            <Input
              value={siteRoot}
              onChange={(e) => setSiteRoot(e.target.value)}
              placeholder="https://yoursite.com"
            />
          </div>
          <div className="grid md:grid-cols-[1fr,140px,160px,auto] gap-3 items-end">
            <div>
              <label className="text-sm font-medium mb-2 block">Add page URL</label>
              <Input
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://yoursite.com/services"
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Priority</label>
              <Input
                type="number"
                min={0}
                max={100}
                value={priority}
                onChange={(e) => setPriority(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Change freq</label>
              <select
                value={changefreq}
                onChange={(e) => setChangefreq(e.target.value as (typeof FREQ_OPTIONS)[number])}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {FREQ_OPTIONS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={handleAdd} disabled={add.isPending || !newUrl.trim()} className="gap-2">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30">
          <div>
            <CardTitle className="text-lg">Indexed URLs ({items.length})</CardTitle>
            <CardDescription>Every URL added here is included in sitemap.xml.</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={refresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {items.length === 0 ? (
            <div className="text-center text-muted-foreground py-12 text-sm">No URLs yet. Add your first above.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>URL</TableHead>
                  <TableHead className="w-32 text-center">Priority</TableHead>
                  <TableHead className="w-32 text-center">Change freq</TableHead>
                  <TableHead className="w-20 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs truncate max-w-[420px]">{r.url}</TableCell>
                    <TableCell className="text-center">{(r.priority / 100).toFixed(2)}</TableCell>
                    <TableCell className="text-center">{r.changefreq}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(r.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30">
            <CardTitle className="text-base">sitemap.xml</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => copy(sitemapXml, "sitemap.xml")}>
                <Copy className="h-3 w-3 mr-1" /> Copy
              </Button>
              <Button size="sm" variant="outline" onClick={() => downloadFile("sitemap.xml", sitemapXml, "application/xml")}>
                <Download className="h-3 w-3 mr-1" /> Download
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <pre className="text-[12px] font-mono p-4 max-h-[360px] overflow-auto bg-[#1e1e1e] text-[#d4d4d4]">
              {sitemapXml}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30">
            <CardTitle className="text-base">robots.txt</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => copy(robotsTxt, "robots.txt")}>
                <Copy className="h-3 w-3 mr-1" /> Copy
              </Button>
              <Button size="sm" variant="outline" onClick={() => downloadFile("robots.txt", robotsTxt, "text/plain")}>
                <Download className="h-3 w-3 mr-1" /> Download
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <pre className="text-[12px] font-mono p-4 max-h-[360px] overflow-auto bg-[#1e1e1e] text-[#d4d4d4]">
              {robotsTxt}
            </pre>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" /> Submit to Google Search Console
          </CardTitle>
          <CardDescription>
            Upload sitemap.xml and robots.txt to your domain root, then click below to open Search Console with your
            property selected.
          </CardDescription>
        </CardHeader>
        <CardFooter className="bg-muted/10 border-t px-6 py-4 flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            Sitemap will be submitted at{" "}
            <code className="text-foreground">{(siteRoot.replace(/\/$/, "") || "https://yoursite.com") + "/sitemap.xml"}</code>
          </span>
          <Button onClick={submitToGsc} className="gap-2">
            Open Search Console <ExternalLink className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
