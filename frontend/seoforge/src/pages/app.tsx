import { Navbar } from "@/components/layout/navbar";
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
import { useEffect, useState } from "react";

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

  const tabMeta: Record<string, { title: string; description: string }> = {
    "single-page": {
      title: "Single Page Optimizer",
      description: "Best when you already have a page ready and want stronger metadata, structure, schema, and answer-engine formatting.",
    },
    "aeo-block": {
      title: "AEO Answer Blocks",
      description: "Generate question-and-answer sections that make the page easier for AI assistants and search answer surfaces to quote.",
    },
    "content-gaps": {
      title: "Content Gaps",
      description: "Find missing sections and add stronger topical coverage so the page answers more of the search journey.",
    },
    "site-crawler": {
      title: "Full Site Crawler",
      description: "Start here when you need a broad picture of a live site before deciding what to fix first.",
    },
    "zip-upload": {
      title: "Bulk ZIP Upload",
      description: "Use this when you are working through many HTML files at once and want a faster batch workflow.",
    },
    competitor: {
      title: "Competitor Scanner",
      description: "Understand how a competing page is positioned so your rewrite can be sharper, more complete, and easier to differentiate.",
    },
    hreflang: {
      title: "Hreflang Tool",
      description: "Add alternate language and regional signals when the page serves more than one locale or market.",
    },
    sitemap: {
      title: "Sitemap and Robots",
      description: "Maintain crawl instructions and machine-readable discovery files without leaving the workspace.",
    },
    monitor: {
      title: "Site Monitor",
      description: "Track pages over time and watch for regressions so SEO gains stay visible after launch.",
    },
    deploy: {
      title: "Deploy",
      description: "Push final HTML into WordPress or Shopify once the page is structurally ready to publish.",
    },
  };
  const active = tabMeta[tab] ?? tabMeta["single-page"];
  const tabs = [
    { value: "single-page", label: "Single Page" },
    { value: "zip-upload", label: "ZIP Upload" },
    { value: "site-crawler", label: "Site Crawler" },
    { value: "aeo-block", label: "AEO Blocks" },
    { value: "content-gaps", label: "Content Gaps" },
    { value: "competitor", label: "Competitor" },
    { value: "hreflang", label: "Hreflang" },
    { value: "sitemap", label: "Sitemap" },
    { value: "deploy", label: "Deploy" },
    { value: "monitor", label: "Monitor" },
  ] as const;

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <main className="flex-1 px-4 py-6">
        <div className="container mx-auto max-w-7xl">
          <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
            <div className="mb-4">
              <h1 className="text-sm font-semibold tracking-tight text-foreground">Workspace</h1>
            </div>

            <TabsList className="mb-3 flex h-auto w-full flex-wrap justify-start gap-2 rounded-none bg-transparent p-0">
              {tabs.map((item) => (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  className="h-9 rounded-md border border-border bg-background px-3 text-sm font-medium text-muted-foreground data-[state=active]:border-primary/40 data-[state=active]:bg-primary/10 data-[state=active]:text-foreground"
                >
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="mb-4 border-b border-border/70 pb-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{active.title}</span>
              <span className="mx-2 text-border">/</span>
              <span>{active.description}</span>
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
    </div>
  );
}
