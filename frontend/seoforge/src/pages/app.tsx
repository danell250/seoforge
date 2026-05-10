import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CompetitorScanner } from "@/components/app/competitor-scanner";
import { SiteCrawler } from "@/components/app/site-crawler";
import { AeoAnswerBlock } from "@/components/app/aeo-answer-block";
import { SitemapGenerator } from "@/components/app/sitemap-generator";
import { HreflangTool } from "@/components/app/hreflang-tool";
import { ContentGapDetector } from "@/components/app/content-gap-detector";
import { SiteMonitor } from "@/components/app/site-monitor";
import { BlogGenerator } from "@/components/app/blog-generator";
import { SinglePageOptimizer } from "@/components/app/single-page-optimizer";
import { ZipUpload } from "@/components/app/zip-upload";
import { HtmlGuide } from "@/components/app/html-guide";
import { DeployPanel } from "@/components/app/deploy-panel";
import { KeywordResearch } from "@/components/app/keyword-research";
import { type ReactNode, useEffect, useState } from "react";
import { useGetAgencySettings } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Bot, Globe, Languages, Search, ShieldCheck, Sparkles, Radar, FileQuestion, FileEdit, FileArchive, BookOpen, UploadCloud, Settings } from "lucide-react";

export default function AppWorkspace() {
  const initial = typeof window !== "undefined" && window.location.hash
    ? window.location.hash.slice(1)
    : "site-crawler";
  const [tab, setTab] = useState(initial);
  const { data: agencySettings } = useGetAgencySettings();
  const { user } = useAuth();

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

  function ComingSoonTool({ title, description }: { title: string; description: string }) {
    return (
      <Card className="rounded-3xl border p-6 shadow-sm">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="outline">Coming soon</Badge>
          <p className="mt-3 text-sm text-muted-foreground">
            This tool is not live yet, but it is on the roadmap for your SEO workspace.
          </p>
        </CardContent>
      </Card>
    );
  }

  const tabMeta: Record<string, { title: string; description: string }> = {
    "aeo-block": {
      title: "FAQ generator",
      description: "Create reviewable FAQ text and schema suggestions without uploading files.",
    },
    "content-gaps": {
      title: "Missing content",
      description: "Find the questions and page sections your content still needs.",
    },
    "site-crawler": {
      title: "Website audit",
      description: "Scan a live site, score pages, and get easy-to-follow fix suggestions.",
    },
    competitor: {
      title: "Compare a competitor",
      description: "See how a competing page stacks up and where your page can improve.",
    },
    keyword: {
      title: "Keyword research",
      description: "Explore keyword opportunities for your site and content.",
    },
    hreflang: {
      title: "Language targeting",
      description: "Add the right language and country tags for multi-region pages.",
    },
    sitemap: {
      title: "Sitemap builder",
      description: "Create sitemap and robots guidance for the pages you want search engines to crawl.",
    },
    "ai-tools": {
      title: "AI SEO tools",
      description: "Use AI-powered optimization tools to improve content and metadata.",
    },
    "content-editor": {
      title: "Content editor",
      description: "Edit and optimize page content in one place.",
    },
    "backlink-checker": {
      title: "Backlink checker",
      description: "Inspect inbound links and spot potential SEO opportunities.",
    },
    "rank-tracker": {
      title: "Rank tracker",
      description: "Track keyword rankings and performance over time.",
    },
    monitor: {
      title: "Site monitoring",
      description: "Keep an eye on a live site and see when key SEO signals change.",
    },
    "blog-gen": {
      title: "Blog ideas",
      description: "Generate SEO-friendly blog post ideas and outlines from keywords.",
    },
    "single-page": {
      title: "Fix one page",
      description: "Upload a page and get AI-powered SEO improvements you can download.",
    },
    "zip-upload": {
      title: "Fix multiple pages",
      description: "Upload a ZIP, get fixes for every file, and download the updated bundle.",
    },
    "html-guide": {
      title: "SEO guide",
      description: "Copyable examples for page structure, metadata, and schema.",
    },
    deploy: {
      title: "Publish",
      description: "Publish optimizations directly to Vercel with one click.",
    },
  };
  const active = tabMeta[tab] ?? tabMeta["site-crawler"];
  const groups = [
    {
      title: "Audit",
      items: [
        { value: "site-crawler", label: "Website audit", icon: Globe },
        { value: "monitor", label: "Site monitoring", icon: Radar },
      ],
    },
    {
      title: "Repair",
      items: [
        { value: "single-page", label: "Fix one page", icon: FileEdit },
        { value: "zip-upload", label: "Fix multiple pages", icon: FileArchive },
      ],
    },
    {
      title: "Growth",
      items: [
        { value: "competitor", label: "Compare competitor", icon: Search },
        { value: "keyword", label: "Keyword research", icon: Search },
        { value: "content-gaps", label: "Find missing content", icon: FileQuestion },
        { value: "blog-gen", label: "Blog ideas", icon: Sparkles },
      ],
    },
    {
      title: "Tools",
      items: [
        { value: "aeo-block", label: "FAQ generator", icon: Bot },
        { value: "hreflang", label: "Language targeting", icon: Languages },
        { value: "sitemap", label: "Sitemap builder", icon: ShieldCheck },
        { value: "html-guide", label: "SEO guide", icon: BookOpen },
        { value: "ai-tools", label: "AI SEO tools", icon: Sparkles },
        { value: "content-editor", label: "Content editor", icon: FileEdit },
        { value: "backlink-checker", label: "Backlink checker", icon: Globe },
        { value: "rank-tracker", label: "Rank tracker", icon: Radar },
      ],
    },
    {
      title: "Publish",
      items: [
        { value: "deploy", label: "Publish", icon: UploadCloud },
      ],
    },
  ] as const;

  const contentByTab: Record<string, ReactNode> = {
    "site-crawler": <SiteCrawler />,
    "aeo-block": <AeoAnswerBlock />,
    "content-gaps": <ContentGapDetector />,
    competitor: <CompetitorScanner />,
    keyword: <KeywordResearch />,
    hreflang: <HreflangTool />,
    sitemap: <SitemapGenerator />,
    "ai-tools": <ComingSoonTool title="AI SEO tools" description="Optimize metadata, schema, and content with AI-powered workflows." />,
    "content-editor": <ComingSoonTool title="Content editor" description="Edit page content, format sections, and publish updates quickly." />,
    "backlink-checker": <ComingSoonTool title="Backlink checker" description="Monitor your backlinks and identify link opportunities." />,
    "rank-tracker": <ComingSoonTool title="Rank tracker" description="Track keyword performance and ranking progress over time." />,
    monitor: <SiteMonitor />,
    "blog-gen": <BlogGenerator />,
    "single-page": <SinglePageOptimizer />,
    "zip-upload": <ZipUpload />,
    "html-guide": <HtmlGuide sendPrompt={() => {}} onUploadClick={() => {}} hasHtml={false} />,
    deploy: <DeployPanel />,
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />
      <main className="flex-1 px-4 py-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid gap-5 md:grid-cols-[240px_minmax(0,1fr)]">
            <aside className="rounded-3xl border border-slate-800 bg-slate-950 p-4 shadow-2xl md:sticky md:top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
              <div className="mb-3 px-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h1 className="text-sm font-semibold tracking-tight text-foreground">Workspace</h1>
                    <p className="text-xs text-muted-foreground mt-1">
                      Signed in as {user?.displayName ?? user?.email ?? "your account"}
                    </p>
                  </div>
                </div>
                <div className="mt-2 space-y-2">
                  {agencySettings?.websiteUrl ? (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-xs text-slate-300 truncate">
                        <Globe className="h-3 w-3 shrink-0 text-slate-400" />
                        <a 
                          href={agencySettings.websiteUrl.startsWith("http") ? agencySettings.websiteUrl : `https://${agencySettings.websiteUrl}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="truncate text-slate-200 hover:text-white"
                        >
                          {agencySettings.websiteUrl.replace(/^https?:\/\//, "")}
                        </a>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 rounded-full border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white" 
                        onClick={() => window.location.href = "/settings"}
                      >
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs h-8 w-full justify-start text-muted-foreground" 
                      onClick={() => window.location.href = "/settings"}
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      Add your domain
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Choose one tool and focus.</p>
              </div>
              <nav className="space-y-3">
                {groups.map((group) => (
                  <div key={group.title}>
                    <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      {group.title}
                    </p>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const activeItem = tab === item.value;
                        return (
                          <Button
                            key={item.value}
                            variant="ghost"
                            className={
                              `w-full justify-start gap-2 rounded-2xl px-3 py-3 text-sm transition-all ${
                                activeItem
                                  ? "bg-slate-800 text-white shadow-xl"
                                  : "text-slate-200 hover:bg-slate-900 hover:text-white"
                              }`
                            }
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

            <section className="min-w-0 rounded-3xl bg-slate-50 p-6 shadow-[0_30px_70px_-40px_rgba(15,23,42,0.4)] text-slate-900">
              <div className="mb-4 border-b border-slate-200 pb-2 text-sm text-slate-500">
                <span className="font-medium text-slate-900">{active.title}</span>
                <span className="mx-2 text-slate-300">/</span>
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
