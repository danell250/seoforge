import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDeployToWordpress, useDeployToShopify } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, ExternalLink, RefreshCw, Rocket, ShoppingBag, UploadCloud } from "lucide-react";

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
        onSuccess: (data) => toast({ title: "Deployed", description: data.message }),
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
        onSuccess: (data) => toast({ title: "Deployed", description: data.message }),
        onError: () => toast({ title: "Error", description: "Deploy failed, please try again.", variant: "destructive" }),
      },
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="border-2 border-primary/10 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Rocket className="h-6 w-6 text-primary" />
            One-Click Deploy
          </CardTitle>
          <CardDescription>
            Paste optimized HTML and push it directly into your WordPress page or Shopify page. Credentials stay in
            this browser session and are never stored.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                  <UploadCloud className="h-4 w-4" /> Upload .html
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
                Generate an Application Password under Users &rarr; Profile &rarr; Application Passwords. Requires
                self-hosted WordPress with REST API enabled.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">Site URL</label>
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
                <label className="text-sm font-medium mb-2 block">Page or Post ID</label>
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
                    <Rocket className="h-4 w-4" /> Push to WordPress
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
                Create a custom app in Shopify Admin with the <code>write_content</code> scope and copy its Admin API
                access token.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">Shop domain</label>
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
                <label className="text-sm font-medium mb-2 block">Page ID</label>
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
                    <ShoppingBag className="h-4 w-4" /> Push to Shopify
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
