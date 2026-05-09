import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { CompetitorScanner } from "@/components/app/competitor-scanner";
import { SiteCrawler } from "@/components/app/site-crawler";
import { AeoAnswerBlock } from "@/components/app/aeo-answer-block";
import { SitemapGenerator } from "@/components/app/sitemap-generator";
import { HreflangTool } from "@/components/app/hreflang-tool";
import { ContentGapDetector } from "@/components/app/content-gap-detector";
import { SiteMonitor } from "@/components/app/site-monitor";
import { BlogGenerator } from "@/components/app/blog-generator";
import { type ReactNode, useEffect, useState } from "react";
import { Bot, Globe, Languages, Search, ShieldCheck, Sparkles, Radar, FileQuestion } from "lucide-react";

export default function AppWorkspace() {
  const initial = typeof window !== "undefined" && window.location.hash
    ? window.location.hash.slice(1)
    : "site-crawler";
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
    "aeo-block": {
      title: "Generate FAQ Snippets",
      description: "Create reviewable FAQ and schema snippets without uploading source files.",
    },
    "content-gaps": {
      title: "Find Missing Content",
      description: "Find important questions a page is missing and generate copyable section suggestions.",
    },
    "site-crawler": {
      title: "Audit a Live Website",
      description: "Crawl a live site, score each page, and get guided fixes from public URLs.",
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
    "blog-gen": {
      title: "Blog Generator",
      description: "Generate 20-50 SEO-optimized blog posts fast from long-tail keywords.",
    },
  };
  const active = tabMeta[tab] ?? tabMeta["site-crawler"];
  const groups = [
    {
      title: "Audit",
      items: [
        { value: "site-crawler", label: "Live Site Audit", icon: Globe },
        { value: "monitor", label: "Monitor", icon: Radar },
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
        { value: "aeo-block", label: "FAQ Snippets", icon: Bot },
        { value: "hreflang", label: "Languages", icon: Languages },
        { value: "sitemap", label: "Sitemap", icon: ShieldCheck },
      ],
    },
  ] as const;

  const contentByTab: Record<string, ReactNode> = {
    "site-crawler": <SiteCrawler />,
    "aeo-block": <AeoAnswerBlock />,
    "content-gaps": <ContentGapDetector />,
    competitor: <CompetitorScanner />,
    hreflang: <HreflangTool />,
    sitemap: <SitemapGenerator />,
    monitor: <SiteMonitor />,
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
              {contentByTab[tab] ?? contentByTab["site-crawler"]}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
