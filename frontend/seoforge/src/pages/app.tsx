import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
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
import { BlogGenerator } from "@/components/app/blog-generator";
import { type ReactNode, useEffect, useState } from "react";
import { Bot, FileCode2, FolderArchive, Globe, Languages, Search, Ship, ShieldCheck, Sparkles, Radar, FileQuestion } from "lucide-react";

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
      title: "Repair One Page",
      description: "Paste one HTML page and get repaired, deployable HTML with a receipt.",
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
      title: "Scan and Repair a Website",
      description: "Crawl a live site, repair each page, and download the updated files.",
    },
    "zip-upload": {
      title: "Repair Many Files",
      description: "Upload a ZIP of HTML files, repair them in bulk, and download a new ZIP.",
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
      title: "Publish Repairs",
      description: "Send repaired HTML to WordPress or Shopify when it is ready to go live.",
    },
    "blog-gen": {
      title: "Blog Generator",
      description: "Generate 20-50 SEO-optimized blog posts fast from long-tail keywords.",
    },
  };
  const active = tabMeta[tab] ?? tabMeta["single-page"];
  const groups = [
    {
      title: "Repair",
      items: [
        { value: "single-page", label: "Repair Page", icon: FileCode2 },
        { value: "zip-upload", label: "Repair Files", icon: FolderArchive },
        { value: "site-crawler", label: "Repair Site", icon: Globe },
      ],
    },
    {
      title: "Growth",
      items: [
        { value: "competitor", label: "Competitor", icon: Search },
        { value: "content-gaps", label: "Missing Content", icon: FileQuestion },
        { value: "blog-gen", label: "Blog Generator", icon: Sparkles },
      ],
    },
    {
      title: "Technical",
      items: [
        { value: "aeo-block", label: "Add FAQs", icon: Bot },
        { value: "hreflang", label: "Languages", icon: Languages },
        { value: "sitemap", label: "Sitemap", icon: ShieldCheck },
      ],
    },
    {
      title: "Operations",
      items: [
        { value: "deploy", label: "Publish", icon: Ship },
        { value: "monitor", label: "Monitor", icon: Radar },
      ],
    },
  ] as const;

  const contentByTab: Record<string, ReactNode> = {
    "single-page": <SinglePageOptimizer />,
    "site-crawler": <SiteCrawler />,
    "zip-upload": <ZipUpload />,
    "aeo-block": <AeoAnswerBlock />,
    "content-gaps": <ContentGapDetector />,
    competitor: <CompetitorScanner />,
    hreflang: <HreflangTool />,
    sitemap: <SitemapGenerator />,
    monitor: <SiteMonitor />,
    deploy: <DeployPanel />,
    "blog-gen": <BlogGenerator />,
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <main className="flex-1 px-4 py-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid gap-5 md:grid-cols-[240px_minmax(0,1fr)]">
            <aside className="rounded-xl border bg-background p-3 md:sticky md:top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
              <div className="mb-3 px-2">
                <h1 className="text-sm font-semibold tracking-tight text-foreground">Workspace</h1>
                <p className="text-xs text-muted-foreground mt-1">Choose one tool and focus.</p>
              </div>
              <nav className="space-y-3">
                {groups.map((group) => (
                  <div key={group.title}>
                    <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {group.title}
                    </p>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const activeItem = tab === item.value;
                        return (
                          <Button
                            key={item.value}
                            variant={activeItem ? "default" : "ghost"}
                            className="w-full justify-start gap-2"
                            onClick={() => handleTabChange(item.value)}
                          >
                            <Icon className="h-4 w-4" />
                            {item.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>
            </aside>

            <section className="min-w-0">
              <div className="mb-4 border-b border-border/70 pb-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{active.title}</span>
                <span className="mx-2 text-border">/</span>
                <span>{active.description}</span>
              </div>
              {contentByTab[tab] ?? contentByTab["single-page"]}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
