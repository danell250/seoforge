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
      title: "Optimize One Page",
      description: "Paste one HTML page and get back a cleaner, more search-friendly version.",
    },
    "aeo-block": {
      title: "Add FAQ Answers",
      description: "Add FAQ-style questions and answers so AI search tools can quote your page more easily.",
    },
    "content-gaps": {
      title: "Find Missing Content",
      description: "Find important questions your page is missing and add new sections to cover them.",
    },
    "site-crawler": {
      title: "Scan a Website",
      description: "Crawl a live site, improve each page, and download the updated files.",
    },
    "zip-upload": {
      title: "Optimize Many Files",
      description: "Upload a ZIP of HTML files, improve them in bulk, and download a new ZIP.",
    },
    competitor: {
      title: "Research a Competitor",
      description: "Analyze a competitor page and see how your page can be stronger.",
    },
    hreflang: {
      title: "Add Language Targeting",
      description: "Add language and country tags when the same page exists in multiple versions.",
    },
    sitemap: {
      title: "Create Sitemap Files",
      description: "Build `sitemap.xml` and `robots.txt` from the pages you want indexed.",
    },
    monitor: {
      title: "Monitor a Website",
      description: "Keep checking a live site and get alerted when pages lose important search signals.",
    },
    deploy: {
      title: "Publish Changes",
      description: "Send finished HTML to WordPress or Shopify when it is ready to go live.",
    },
  };
  const active = tabMeta[tab] ?? tabMeta["single-page"];
  const tabs = [
    { value: "single-page", label: "One Page" },
    { value: "zip-upload", label: "Many Files" },
    { value: "site-crawler", label: "Scan Site" },
    { value: "aeo-block", label: "Add FAQs" },
    { value: "content-gaps", label: "Missing Content" },
    { value: "competitor", label: "Competitor" },
    { value: "hreflang", label: "Languages" },
    { value: "sitemap", label: "Sitemap" },
    { value: "deploy", label: "Publish" },
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
