import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDeployToWordpress, useDeployToShopify } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, ChevronRight, ExternalLink, ListChecks, RefreshCw, Rocket, ShoppingBag, Trash2, UploadCloud, X } from "lucide-react";

interface QueueItem {
  id: string;
  sourceUrl: string;
  title: string;
  filename: string;
  html: string;
  gapsCount?: number;
  deployedTo?: { wp?: boolean; shopify?: boolean };
}

export function DeployPanel() {
  const { toast } = useToast();
  const [html, setHtml] = useState("");

  const [wpSite, setWpSite] = useState("");
  const [wpUser, setWpUser] = useState("");
  const [wpPass, setWpPass] = useState("");
  const [wpType, setWpType] = useState<"pages" | "posts">("pages");
  const [wpId, setWpId] = useState("");

  const [shop, setShop] = useState("");
  const [token, setToken] = useState("");
  const [pageId, setPageId] = useState("");

  const wp = useDeployToWordpress();
  const sh = useDeployToShopify();
  const [importedFrom, setImportedFrom] = useState<string | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const persistQueue = (next: QueueItem[]) => {
    setQueue(next);
    if (next.length === 0) {
      sessionStorage.removeItem("seoforge:deploy-queue");
    } else {
      sessionStorage.setItem("seoforge:deploy-queue", JSON.stringify(next));
    }
  };

  useEffect(() => {
    const consume = () => {
      const storedHtml = sessionStorage.getItem("seoforge:deploy-html");
      if (storedHtml) {
        setHtml(storedHtml);
        sessionStorage.removeItem("seoforge:deploy-html");
      }
      const storedQueue = sessionStorage.getItem("seoforge:deploy-queue");
      if (storedQueue) {
        try {
          const parsed = JSON.parse(storedQueue) as QueueItem[];
          if (Array.isArray(parsed) && parsed.length) {
            setQueue(parsed);
            setActiveId(parsed[0].id);
            setHtml(parsed[0].html);
            setImportedFrom(`Bulk queue: ${parsed.length} pages from Site Crawler`);
            return;
          }
        } catch {
          // ignore
        }
      }
      if (storedHtml) setImportedFrom("Content Gap Detector");
    };
    consume();
    window.addEventListener("seoforge:deploy-html-updated", consume);
    return () => window.removeEventListener("seoforge:deploy-html-updated", consume);
  }, []);

  const loadQueueItem = (item: QueueItem) => {
    setActiveId(item.id);
    setHtml(item.html);
  };

  const removeQueueItem = (id: string) => {
    const next = queue.filter((q) => q.id !== id);
    persistQueue(next);
    if (activeId === id) {
      if (next.length > 0) {
        setActiveId(next[0].id);
        setHtml(next[0].html);
      } else {
        setActiveId(null);
      }
    }
  };

  const markDeployed = (target: "wp" | "shopify") => {
    if (!activeId) return;
    const next = queue.map((q) =>
      q.id === activeId ? { ...q, deployedTo: { ...(q.deployedTo || {}), [target]: true } } : q,
    );
    persistQueue(next);
    const idx = next.findIndex((q) => q.id === activeId);
    const remaining = next.slice(idx + 1).find((q) => !q.deployedTo?.[target]);
    if (remaining) loadQueueItem(remaining);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setHtml(ev.target?.result as string);
    reader.readAsText(file);
  };

  const deployWp = () => {
    if (!html.trim() || !wpSite || !wpUser || !wpPass || !wpId) {
      toast({ title: "Fill all fields", description: "Site URL, username, app password, post ID and HTML are required.", variant: "destructive" });
      return;
    }
    const id = Number(wpId);
    if (!Number.isInteger(id) || id <= 0) {
      toast({ title: "Invalid ID", description: "Post ID must be a positive number.", variant: "destructive" });
      return;
    }
    wp.mutate(
      { data: { siteUrl: wpSite, username: wpUser, appPassword: wpPass, postType: wpType, postId: id, html } },
      {
        onSuccess: (data) => {
          toast({ title: "Deployed", description: data.message });
          markDeployed("wp");
        },
        onError: () => toast({ title: "Error", description: "Deploy failed, please try again.", variant: "destructive" }),
      },
    );
  };

  const deployShopify = () => {
    if (!html.trim() || !shop || !token || !pageId) {
      toast({ title: "Fill all fields", description: "Shop, access token, page ID and HTML are required.", variant: "destructive" });
      return;
    }
    const id = Number(pageId);
    if (!Number.isInteger(id) || id <= 0) {
      toast({ title: "Invalid ID", description: "Page ID must be a positive number.", variant: "destructive" });
      return;
    }
    sh.mutate(
      { data: { shop, accessToken: token, pageId: id, html } },
      {
        onSuccess: (data) => {
          toast({ title: "Deployed", description: data.message });
          markDeployed("shopify");
        },
        onError: () => toast({ title: "Error", description: "Deploy failed, please try again.", variant: "destructive" }),
      },
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {queue.length > 0 && (
        <Card className="border-2 border-purple-200 bg-purple-50/30 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-purple-600" /> Publish Queue
              <span className="text-sm font-normal text-muted-foreground ml-2">
                {queue.length} page{queue.length === 1 ? "" : "s"} ready
              </span>
            </CardTitle>
            <CardDescription>
              Click a page to load it. Publish to WordPress or Shopify below and we will jump to the next page still waiting.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[280px] overflow-auto">
            {queue.map((item) => {
              const isActive = item.id === activeId;
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-2 p-2 rounded-md border bg-background cursor-pointer transition-colors ${
                    isActive ? "border-purple-400 ring-2 ring-purple-200" : "hover:bg-muted/50"
                  }`}
                  onClick={() => loadQueueItem(item)}
                >
                  <ChevronRight
                    className={`h-4 w-4 shrink-0 transition-transform ${isActive ? "text-purple-600 rotate-90" : "text-muted-foreground"}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{item.title || item.filename}</div>
                    <div className="text-xs text-muted-foreground truncate">{item.sourceUrl}</div>
                  </div>
                  {typeof item.gapsCount === "number" && (
                    <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700 shrink-0">
                      +{item.gapsCount} gaps
                    </span>
                  )}
                  {item.deployedTo?.wp && (
                    <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 shrink-0">WP</span>
                  )}
                  {item.deployedTo?.shopify && (
                    <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 shrink-0">Shopify</span>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeQueueItem(item.id);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
          </CardContent>
          <CardFooter className="flex justify-end pt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                persistQueue([]);
                setActiveId(null);
                setImportedFrom(null);
              }}
            >
              <Trash2 className="h-3 w-3 mr-1" /> Clear queue
            </Button>
          </CardFooter>
        </Card>
      )}

      <Card className="border-2 border-primary/10 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Rocket className="h-6 w-6 text-primary" />
            Publish HTML to WordPress or Shopify
          </CardTitle>
          <CardDescription>
            Paste or upload finished HTML, then send it to an existing WordPress page or Shopify page. Credentials stay in this browser session and are never stored.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {importedFrom && (
            <div className="mb-3 px-3 py-2 rounded-md bg-primary/10 border border-primary/20 text-sm text-primary flex items-center justify-between">
              <span>Loaded from {importedFrom}. Review it and publish below.</span>
              <Button size="sm" variant="ghost" onClick={() => setImportedFrom(null)}>Dismiss</Button>
            </div>
          )}
          <div className="relative">
            <Textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              placeholder="Paste optimized HTML here..."
              className="min-h-[220px] font-mono text-sm resize-y p-4 bg-muted/30 focus-visible:ring-primary"
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
      </Card>

      <Tabs defaultValue="wordpress" className="w-full">
        <TabsList>
          <TabsTrigger value="wordpress">WordPress</TabsTrigger>
          <TabsTrigger value="shopify">Shopify</TabsTrigger>
        </TabsList>

        <TabsContent value="wordpress" className="m-0 mt-4">
          <Card className="shadow-md">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="text-lg flex items-center gap-2">
                <Rocket className="h-5 w-5 text-primary" /> WordPress
              </CardTitle>
              <CardDescription>
                Use an Application Password from WordPress. This works with self-hosted WordPress sites that have the REST API enabled.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">WordPress site URL</label>
                <Input value={wpSite} onChange={(e) => setWpSite(e.target.value)} placeholder="https://yoursite.com" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Username</label>
                <Input value={wpUser} onChange={(e) => setWpUser(e.target.value)} placeholder="admin" autoComplete="off" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Application Password</label>
                <Input
                  type="password"
                  value={wpPass}
                  onChange={(e) => setWpPass(e.target.value)}
                  placeholder="xxxx xxxx xxxx xxxx"
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <select
                  value={wpType}
                  onChange={(e) => setWpType(e.target.value as "pages" | "posts")}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="pages">Page</option>
                  <option value="posts">Post</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Existing page or post ID</label>
                <Input value={wpId} onChange={(e) => setWpId(e.target.value)} placeholder="123" />
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t px-6 py-4 flex justify-between items-center">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                {wp.isSuccess && wp.data && (
                  <span className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-4 w-4" /> {wp.data.message}
                    {wp.data.url && (
                      <a href={wp.data.url} target="_blank" rel="noreferrer" className="underline inline-flex items-center gap-1">
                        View <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </span>
                )}
              </div>
              <Button onClick={deployWp} disabled={wp.isPending} size="lg" className="gap-2 px-6">
                {wp.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Pushing...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4" /> Publish to WordPress
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="shopify" className="m-0 mt-4">
          <Card className="shadow-md">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" /> Shopify
              </CardTitle>
              <CardDescription>
                Create a Shopify custom app with the <code>write_content</code> scope and paste its Admin API access token here.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">Shopify store domain</label>
                <Input value={shop} onChange={(e) => setShop(e.target.value)} placeholder="your-store.myshopify.com" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">Admin API access token</label>
                <Input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="shpat_..."
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Existing page ID</label>
                <Input value={pageId} onChange={(e) => setPageId(e.target.value)} placeholder="987654321" />
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t px-6 py-4 flex justify-between items-center">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                {sh.isSuccess && sh.data && (
                  <span className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-4 w-4" /> {sh.data.message}
                    {sh.data.url && (
                      <a href={sh.data.url} target="_blank" rel="noreferrer" className="underline inline-flex items-center gap-1">
                        View <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </span>
                )}
              </div>
              <Button onClick={deployShopify} disabled={sh.isPending} size="lg" className="gap-2 px-6">
                {sh.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Pushing...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" /> Publish to Shopify
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
