import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SinglePageOptimizer } from "@/components/app/single-page-optimizer";
import { ZipUpload } from "@/components/app/zip-upload";
import { CompetitorScanner } from "@/components/app/competitor-scanner";
import { SiteCrawler } from "@/components/app/site-crawler";
import { AeoAnswerBlock } from "@/components/app/aeo-answer-block";
import { DeployPanel } from "@/components/app/deploy-panel";
import { SitemapGenerator } from "@/components/app/sitemap-generator";
import { HreflangTool } from "@/components/app/hreflang-tool";
import { ContentGapDetector } from "@/components/app/content-gap-detector";
import { SiteMonitor } from "@/components/app/site-monitor";
import { useEffect, useState, type ComponentType } from "react";
import { Bot, FileCode2, Globe2, Layers3, Radar, Rocket, Search, UploadCloud } from "lucide-react";

export default function AppWorkspace() {
  const initial = typeof window !== "undefined" && window.location.hash
    ? window.location.hash.slice(1)
    : "single-page";
  const [tab, setTab] = useState(initial);

  useEffect(() => {
    const onHash = () => {
      const next = window.location.hash.slice(1);
      if (next) setTab(next);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const handleTabChange = (val: string) => {
    setTab(val);
    if (window.location.hash.slice(1) !== val) {
      window.history.replaceState(null, "", `#${val}`);
    }
  };

  const tabMeta: Record<string, { title: string; description: string; icon: ComponentType<{ className?: string }> }> = {
    "single-page": {
      title: "Single Page Optimizer",
      description: "Best when you already have a page ready and want stronger metadata, structure, schema, and answer-engine formatting.",
      icon: FileCode2,
    },
    "aeo-block": {
      title: "AEO Answer Blocks",
      description: "Generate question-and-answer sections that make the page easier for AI assistants and search answer surfaces to quote.",
      icon: Bot,
    },
    "content-gaps": {
      title: "Content Gaps",
      description: "Find missing sections and add stronger topical coverage so the page answers more of the search journey.",
      icon: Layers3,
    },
    "site-crawler": {
      title: "Full Site Crawler",
      description: "Start here when you need a broad picture of a live site before deciding what to fix first.",
      icon: Radar,
    },
    "zip-upload": {
      title: "Bulk ZIP Upload",
      description: "Use this when you are working through many HTML files at once and want a faster batch workflow.",
      icon: UploadCloud,
    },
    competitor: {
      title: "Competitor Scanner",
      description: "Understand how a competing page is positioned so your rewrite can be sharper, more complete, and easier to differentiate.",
      icon: Search,
    },
    hreflang: {
      title: "Hreflang Tool",
      description: "Add alternate language and regional signals when the page serves more than one locale or market.",
      icon: Globe2,
    },
    sitemap: {
      title: "Sitemap and Robots",
      description: "Maintain crawl instructions and machine-readable discovery files without leaving the workspace.",
      icon: Rocket,
    },
    monitor: {
      title: "Site Monitor",
      description: "Track pages over time and watch for regressions so SEO gains stay visible after launch.",
      icon: Radar,
    },
    deploy: {
      title: "Deploy",
      description: "Push final HTML into WordPress or Shopify once the page is structurally ready to publish.",
      icon: Rocket,
    },
  };
  const active = tabMeta[tab] ?? tabMeta["single-page"];
  const ActiveIcon = active.icon;

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      
      <main className="flex-1 py-8 px-4">
        <div className="container max-w-7xl mx-auto">
          <div className="mb-8 space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>SEO workflow</Badge>
                <Badge variant="outline">AEO-ready output</Badge>
                <Badge variant="outline">Deploy from one place</Badge>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Optimization Workspace</h1>
                <p className="mt-2 max-w-3xl text-muted-foreground">
                  Use the tools below in the order that makes sense for the job: inspect the page or site, strengthen structure,
                  improve answer readiness, then deploy and monitor. Each tab is focused on one clear outcome so the product stays easy to understand.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-border/70 bg-card/85 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Start here</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p><span className="font-medium text-foreground">Single Page</span> when you already have HTML.</p>
                  <p><span className="font-medium text-foreground">Full Site Crawler</span> when you need a fast audit first.</p>
                </CardContent>
              </Card>
              <Card className="border-border/70 bg-card/85 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Best for AEO</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p><span className="font-medium text-foreground">Answer Blocks</span> to make answers easier to quote.</p>
                  <p><span className="font-medium text-foreground">Content Gaps</span> to broaden topical coverage.</p>
                </CardContent>
              </Card>
              <Card className="border-border/70 bg-card/85 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Final step</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p><span className="font-medium text-foreground">Deploy</span> when the HTML is ready.</p>
                  <p><span className="font-medium text-foreground">Monitor</span> when you want ongoing visibility.</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="mb-5 w-full md:w-auto inline-flex overflow-x-auto">
              <TabsTrigger value="single-page" className="flex-1 md:flex-none">Single Page</TabsTrigger>
              <TabsTrigger value="aeo-block" className="flex-1 md:flex-none">AEO Answer Blocks</TabsTrigger>
              <TabsTrigger value="content-gaps" className="flex-1 md:flex-none">Content Gaps</TabsTrigger>
              <TabsTrigger value="site-crawler" className="flex-1 md:flex-none">Full Site Crawler</TabsTrigger>
              <TabsTrigger value="zip-upload" className="flex-1 md:flex-none">Bulk ZIP Upload</TabsTrigger>
              <TabsTrigger value="competitor" className="flex-1 md:flex-none">Competitor Scanner</TabsTrigger>
              <TabsTrigger value="hreflang" className="flex-1 md:flex-none">Hreflang</TabsTrigger>
              <TabsTrigger value="sitemap" className="flex-1 md:flex-none">Sitemap &amp; Robots</TabsTrigger>
              <TabsTrigger value="monitor" className="flex-1 md:flex-none">Monitor</TabsTrigger>
              <TabsTrigger value="deploy" className="flex-1 md:flex-none">Deploy</TabsTrigger>
            </TabsList>

            <div className="mb-8 rounded-3xl border border-border/70 bg-card/85 p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-primary/12 p-3 text-primary">
                  <ActiveIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{active.title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{active.description}</p>
                </div>
              </div>
            </div>

            <TabsContent value="single-page" className="m-0">
              <SinglePageOptimizer />
            </TabsContent>

            <TabsContent value="site-crawler" className="m-0">
              <SiteCrawler />
            </TabsContent>

            <TabsContent value="zip-upload" className="m-0">
              <ZipUpload />
            </TabsContent>

            <TabsContent value="aeo-block" className="m-0">
              <AeoAnswerBlock />
            </TabsContent>

            <TabsContent value="content-gaps" className="m-0">
              <ContentGapDetector />
            </TabsContent>

            <TabsContent value="competitor" className="m-0">
              <CompetitorScanner />
            </TabsContent>

            <TabsContent value="hreflang" className="m-0">
              <HreflangTool />
            </TabsContent>

            <TabsContent value="sitemap" className="m-0">
              <SitemapGenerator />
            </TabsContent>

            <TabsContent value="monitor" className="m-0">
              <SiteMonitor />
            </TabsContent>

            <TabsContent value="deploy" className="m-0">
              <DeployPanel />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
