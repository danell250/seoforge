import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useOptimizeHtml, useGenerateBlogArticle } from "@workspace/api-client-react";
import { CheckCircle2, UploadCloud, Copy, RefreshCw, Download, Play, AlertCircle, FileCode, Globe, CheckSquare, FileDown, FileText, Sparkles, X, Languages, MapPin, Users, Volume2, TrendingUp, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

function extractMeta(html: string) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const title = doc.querySelector("title")?.textContent || "No Title";
    const desc = doc.querySelector('meta[name="description"]')?.getAttribute("content") || "No description provided.";
    const url = "https://example.com/page"; // Mock URL for preview
    return { title, desc, url };
  } catch (e) {
    return { title: "Error", desc: "Error parsing HTML", url: "" };
  }
}

function extractCanonicalUrl(html: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute("href");
    if (canonical) return canonical;
    const ogUrl = doc.querySelector('meta[property="og:url"]')?.getAttribute("content");
    if (ogUrl) return ogUrl;
    return "https://example.com/page";
  } catch (e) {
    return "https://example.com/page";
  }
}

function generateSitemapXml(url: string): string {
  const today = new Date().toISOString().split("T")[0];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
}

function generateRobotsTxt(url: string): string {
  const sitemapUrl = url.endsWith("/") ? `${url}sitemap.xml` : `${url}/sitemap.xml`;
  return `User-agent: *
Allow: /

Sitemap: ${sitemapUrl}`;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function GooglePreview({ html, label }: { html: string, label: string }) {
  const { title, desc, url } = extractMeta(html);
  
  return (
    <div className="bg-card border rounded-lg p-4 text-left font-sans shadow-sm">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 pb-2 border-b">{label} Preview</div>
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
          <Globe className="w-3 h-3 text-muted-foreground" />
        </div>
        <div className="text-[12px] text-[#202124] flex flex-col leading-tight">
          <span className="truncate max-w-[250px]">example.com</span>
          <span className="text-muted-foreground">{url}</span>
        </div>
      </div>
      <h3 className="text-[20px] text-[#1a0dab] hover:underline cursor-pointer leading-tight mb-1 truncate">
        {title}
      </h3>
      <p className="text-[14px] text-[#4d5156] line-clamp-2 leading-snug">
        {desc}
      </p>
    </div>
  );
}

function DiffViewer({ original, optimized }: { original: string, optimized: string }) {
  const originalRef = useRef<HTMLPreElement>(null);
  const optimizedRef = useRef<HTMLPreElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLPreElement>, targetRef: React.RefObject<HTMLPreElement | null>) => {
    if (targetRef.current) {
      targetRef.current.scrollTop = e.currentTarget.scrollTop;
      targetRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const linesOriginal = original.split('\n');
  const linesOptimized = optimized.split('\n');

  return (
    <div className="grid grid-cols-2 gap-4 h-[500px]">
      <div className="flex flex-col border rounded-md overflow-hidden bg-[#1e1e1e]">
        <div className="bg-[#2d2d2d] text-[#cccccc] text-xs px-4 py-2 border-b border-[#3d3d3d] font-mono flex justify-between">
          <span>Original HTML</span>
        </div>
        <pre 
          ref={originalRef}
          onScroll={(e) => handleScroll(e, optimizedRef)}
          className="flex-1 p-4 overflow-auto text-[13px] font-mono text-[#d4d4d4] leading-relaxed"
        >
          {linesOriginal.map((line, i) => (
            <div key={i} className="flex">
              <span className="w-8 shrink-0 text-[#858585] text-right pr-4 select-none">{i + 1}</span>
              <span className="whitespace-pre">{line}</span>
            </div>
          ))}
        </pre>
      </div>

      <div className="flex flex-col border border-primary/30 rounded-md overflow-hidden bg-[#1e1e1e]">
        <div className="bg-[#2d2d2d] text-primary-foreground text-xs px-4 py-2 border-b border-[#3d3d3d] font-mono flex justify-between items-center">
          <span className="text-primary font-bold">Optimized HTML</span>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-6 text-xs text-primary hover:text-primary hover:bg-primary/20"
            onClick={() => {
              navigator.clipboard.writeText(optimized);
            }}
          >
            <Copy className="w-3 h-3 mr-1" /> Copy Code
          </Button>
        </div>
        <pre 
          ref={optimizedRef}
          onScroll={(e) => handleScroll(e, originalRef)}
          className="flex-1 p-4 overflow-auto text-[13px] font-mono text-[#d4d4d4] leading-relaxed"
        >
          {linesOptimized.map((line, i) => (
            <div key={i} className="flex">
              <span className="w-8 shrink-0 text-[#858585] text-right pr-4 select-none">{i + 1}</span>
              <span className="whitespace-pre">{line}</span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}

function ScoreCircle({ score, label }: { score: number, label: string }) {
  const color = score >= 80 ? "text-green-500" : score >= 50 ? "text-orange-500" : "text-red-500";
  const strokeColor = score >= 80 ? "stroke-green-500" : score >= 50 ? "stroke-orange-500" : "stroke-red-500";
  
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-24 h-24 flex items-center justify-center mb-3">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted" />
          <circle 
            cx="50" cy="50" r="40" 
            stroke="currentColor" 
            strokeWidth="8" 
            fill="transparent" 
            strokeDasharray="251.2" 
            strokeDashoffset={251.2 - (251.2 * score) / 100}
            className={`${strokeColor} transition-all duration-1000 ease-out`} 
          />
        </svg>
        <span className={`absolute text-2xl font-bold ${color}`}>{score}</span>
      </div>
      <span className="text-sm font-medium text-center">{label}</span>
    </div>
  );
}

function ScoreBar({ score, label }: { score: number, label: string }) {
  const colorClass = score >= 80 ? "bg-green-500" : score >= 50 ? "bg-orange-500" : "bg-red-500";
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-bold">{score}/100</span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${colorClass} transition-all duration-1000`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function ScoreImprovementBar({ 
  before, 
  after, 
  label 
}: { 
  before: number, 
  after: number, 
  label: string 
}) {
  const improvement = after - before;
  const colorClass = improvement >= 30 ? "text-green-600" : improvement >= 15 ? "text-blue-600" : "text-orange-600";
  const barColorClass = after >= 80 ? "bg-green-500" : after >= 50 ? "bg-orange-500" : "bg-red-500";
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm items-center">
        <span className="font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground line-through text-xs">{before}</span>
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
          <span className="font-bold">{after}</span>
          <span className={`text-xs font-semibold ${colorClass}`}>+{improvement}</span>
        </div>
      </div>
      <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
        {/* Before indicator */}
        <div 
          className="absolute top-0 h-full bg-gray-400/50 rounded-full" 
          style={{ width: `${before}%` }} 
        />
        {/* After bar */}
        <div 
          className={`absolute top-0 h-full ${barColorClass} transition-all duration-1000 rounded-full`} 
          style={{ width: `${after}%` }} 
        />
      </div>
    </div>
  );
}

export function SinglePageOptimizer() {
  const [htmlInput, setHtmlInput] = useState("");
  const [sourceFilename, setSourceFilename] = useState("optimized.html");
  const [blogDialogOpen, setBlogDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const optimizeMutation = useOptimizeHtml();
  const blogMutation = useGenerateBlogArticle();

  const handleOptimize = () => {
    if (!htmlInput.trim()) {
      toast({
        title: "Input required",
        description: "Please paste some HTML or drop a file first.",
        variant: "destructive"
      });
      return;
    }
    
    optimizeMutation.mutate({ data: { html: htmlInput, filename: "index.html" } }, {
      onError: () => {
        toast({
          title: "Error",
          description: "Optimization failed, please try again.",
          variant: "destructive"
        });
      }
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSourceFilename(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      setHtmlInput(event.target?.result as string);
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    setHtmlInput("");
    optimizeMutation.reset();
    blogMutation.reset();
  };

  const handleGenerateBlog = () => {
    if (!optimizeMutation.data?.optimizedHtml) {
      toast({
        title: "No optimized content",
        description: "Please optimize a page first before generating a blog article.",
        variant: "destructive"
      });
      return;
    }

    const topic = extractMeta(optimizeMutation.data.optimizedHtml).title;
    
    blogMutation.mutate({
      data: {
        html: optimizeMutation.data.optimizedHtml,
        topic: topic !== "No Title" ? topic : undefined
      }
    }, {
      onSuccess: () => {
        setBlogDialogOpen(true);
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to generate blog article. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {!optimizeMutation.data ? (
        <Card className="border-2 border-primary/10 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <FileCode className="h-6 w-6 text-primary" />
              Optimize One HTML Page
            </CardTitle>
            <CardDescription>
              Paste one page of HTML or upload an HTML file. We will improve the metadata, structure, schema, and FAQ-ready formatting for you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Textarea 
                value={htmlInput}
                onChange={(e) => setHtmlInput(e.target.value)}
                placeholder="Paste one page of HTML here..."
                className="min-h-[400px] font-mono text-sm resize-y p-4 bg-muted/30 focus-visible:ring-primary"
              />
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur-sm shadow-sm" asChild>
                  <label className="cursor-pointer flex items-center gap-2">
                    <UploadCloud className="h-4 w-4" />
                    Upload HTML
                    <input type="file" accept=".html,.htm" className="hidden" onChange={handleFileUpload} />
                  </label>
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 border-t px-6 py-4 flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {htmlInput.length > 0 ? `${(htmlInput.length / 1024).toFixed(1)} KB loaded` : "No HTML loaded yet"}
            </span>
            <Button 
              size="lg" 
              onClick={handleOptimize} 
              disabled={optimizeMutation.isPending || !htmlInput.trim()}
              className="gap-2 px-8"
            >
              {optimizeMutation.isPending ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  Improve This Page
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              Optimization Complete
            </h2>
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={handleGenerateBlog}
                disabled={blogMutation.isPending}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                {blogMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Generating Blog...
                  </>
                ) : (
                <>
                    <Sparkles className="h-4 w-4 mr-2" /> Create Blog Draft
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const blob = new Blob([optimizeMutation.data.optimizedHtml], { type: "text/html;charset=utf-8" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = sourceFilename;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <FileDown className="h-4 w-4 mr-2" /> Download HTML
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RefreshCw className="h-4 w-4 mr-2" /> Start Over
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 border-primary/20 shadow-md">
              <CardHeader className="bg-muted/30 pb-4 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Before and After Scores
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Before/After Overall Score */}
                <div className="flex justify-center mb-6">
                  <div className="flex items-center gap-4">
                    {/* Before */}
                    <div className="flex flex-col items-center">
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted" />
                          <circle 
                            cx="50" cy="50" r="40" 
                            stroke="currentColor" 
                            strokeWidth="8" 
                            fill="transparent" 
                            strokeDasharray="251.2" 
                            strokeDashoffset={251.2 - (251.2 * optimizeMutation.data.originalScore.overall) / 100}
                            className="stroke-red-500/50" 
                          />
                        </svg>
                        <span className="absolute text-xl font-bold text-red-500/70">
                          {optimizeMutation.data.originalScore.overall}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground mt-1">Before</span>
                    </div>

                    {/* Arrow and improvement */}
                    <div className="flex flex-col items-center">
                      <ArrowRight className="h-6 w-6 text-primary" />
                      <span className="text-sm font-bold text-green-600">
                        +{optimizeMutation.data.scoreImprovement.overall}
                      </span>
                    </div>

                    {/* After */}
                    <div className="flex flex-col items-center">
                      <ScoreCircle score={optimizeMutation.data.score.overall} label="" />
                      <span className="text-xs text-muted-foreground mt-1">After</span>
                    </div>
                  </div>
                </div>

                {/* Individual Score Improvements */}
                <div className="space-y-5">
                  <ScoreImprovementBar 
                    before={optimizeMutation.data.originalScore.technical} 
                    after={optimizeMutation.data.score.technical} 
                    label="Technical SEO" 
                  />
                  <ScoreImprovementBar 
                    before={optimizeMutation.data.originalScore.content} 
                    after={optimizeMutation.data.score.content} 
                    label="Content SEO" 
                  />
                  <ScoreImprovementBar 
                    before={optimizeMutation.data.originalScore.aeo} 
                    after={optimizeMutation.data.score.aeo} 
                    label="AI Answer Readiness" 
                  />
                </div>

                {/* Total Improvement Badge */}
                <div className="mt-6 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Total Score Improvement</p>
                  <p className="text-2xl font-bold text-green-600">
                    +{optimizeMutation.data.scoreImprovement.overall} points
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* African Language Support Card */}
            {optimizeMutation.data.africanLanguageSupport && (
              <Card className="lg:col-span-1 border-amber-200 dark:border-amber-800 shadow-md bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20">
                <CardHeader className="bg-amber-100/50 dark:bg-amber-900/20 pb-4 border-b border-amber-200 dark:border-amber-800">
                  <CardTitle className="text-lg flex items-center gap-2 text-amber-900 dark:text-amber-100">
                    <Languages className="h-5 w-5 text-amber-600" />
                    African Language Support
                  </CardTitle>
                  <CardDescription className="text-amber-700 dark:text-amber-300">
                    {optimizeMutation.data.languageGuidance}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-black/20 rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <span className="text-lg font-bold text-amber-700 dark:text-amber-300">
                        {optimizeMutation.data.africanLanguageSupport.detected.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-amber-900 dark:text-amber-100">
                        {optimizeMutation.data.africanLanguageSupport.config?.nativeName || optimizeMutation.data.africanLanguageSupport.detected}
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        {optimizeMutation.data.africanLanguageSupport.config?.speakers || ''}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-amber-600" />
                      <span className="text-amber-800 dark:text-amber-200">
                        {optimizeMutation.data.africanLanguageSupport.config?.region || ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Volume2 className="h-4 w-4 text-amber-600" />
                      <span className="text-amber-800 dark:text-amber-200">
                        Voice Search: {optimizeMutation.data.africanLanguageSupport.config?.searchBehavior?.voiceSearchPrevalence || 'high'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-amber-600" />
                      <span className="text-amber-800 dark:text-amber-200">
                        Mobile-First: Yes
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-amber-200 dark:border-amber-800">
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      <strong>Optimizations applied:</strong>
                    </p>
                    <ul className="mt-1 space-y-1 text-xs text-amber-600 dark:text-amber-400">
                      <li>• Language-specific meta tags</li>
                      <li>• Hreflang for African markets</li>
                      <li>• Voice search optimization</li>
                      <li>• Local SEO schema markup</li>
                    </ul>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-amber-300 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900/30"
                    onClick={() => {
                      navigator.clipboard.writeText(optimizeMutation.data.africanLanguageSupport?.hreflangTags || '');
                      toast({ title: "Copied", description: "Hreflang tags copied to clipboard" });
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" /> Copy Hreflang Tags
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card className={`border-primary/20 shadow-md ${optimizeMutation.data.africanLanguageSupport ? 'lg:col-span-1' : 'lg:col-span-2'}`}>
              <CardHeader className="bg-muted/30 pb-4 border-b">
                <CardTitle className="text-lg flex justify-between items-center">
                  <span>Google AI Overview Preview</span>
                  <span className="text-xs font-normal text-muted-foreground bg-background px-2 py-1 rounded-md border">Simulated Result</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 bg-gray-50/50 dark:bg-zinc-950/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <GooglePreview html={htmlInput} label="Original" />
                  <GooglePreview html={optimizeMutation.data.optimizedHtml} label="Optimized" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-md">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle>Code Comparison</CardTitle>
              <CardDescription>Review the exact changes made to your source code.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <DiffViewer original={htmlInput} optimized={optimizeMutation.data.optimizedHtml} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-primary" />
                  Changes Applied
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {optimizeMutation.data.changes.map((change, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm leading-snug">{change}</span>
                    </li>
                  ))}
                  {optimizeMutation.data.changes.length === 0 && (
                    <li className="text-muted-foreground text-sm flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" /> No changes were necessary.
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  Sitemap & Deployment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => {
                    const pageUrl = extractCanonicalUrl(optimizeMutation.data.optimizedHtml);
                    const blob = new Blob([generateSitemapXml(pageUrl)], { type: "application/xml" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = "sitemap.xml";
                    a.click();
                    URL.revokeObjectURL(url);
                  }}>
                    <Download className="h-4 w-4 mr-2" /> sitemap.xml
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => {
                    const pageUrl = extractCanonicalUrl(optimizeMutation.data.optimizedHtml);
                    const blob = new Blob([generateRobotsTxt(pageUrl)], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = "robots.txt";
                    a.click();
                    URL.revokeObjectURL(url);
                  }}>
                    <Download className="h-4 w-4 mr-2" /> robots.txt
                  </Button>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3 text-sm">Google Search Console Guide</h4>
                  <ul className="space-y-2 mb-4">
                    {["Verify domain ownership", "Deploy optimized HTML to server", "Upload sitemap.xml to root", "Submit sitemap URL in GSC", "Request indexing for updated pages"].map((step, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4" />
                        <span>{i+1}. {step}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" onClick={() => window.open("https://search.google.com/search-console", "_blank")}>
                    Open Search Console
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Blog Generation Dialog */}
      <Dialog open={blogDialogOpen} onOpenChange={setBlogDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Generated Blog Article
            </DialogTitle>
            <DialogDescription>
              {blogMutation.data && (
                <span className="text-sm text-muted-foreground">
                  {blogMutation.data.wordCount?.toLocaleString()} words • Ready to publish
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {blogMutation.data && (
            <div className="space-y-4">
              {/* Meta Info Card */}
              <Card className="bg-muted/50">
                <CardContent className="p-4 space-y-3">
                  {/* Language Badge for African Languages */}
                  {blogMutation.data.language && blogMutation.data.language !== "en" && (
                    <div className="flex items-center gap-2 p-2 bg-amber-100/50 dark:bg-amber-900/20 rounded-lg">
                      <Languages className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        {blogMutation.data.languageName} ({blogMutation.data.language.toUpperCase()})
                      </span>
                      <span className="text-xs text-amber-600 dark:text-amber-400 ml-auto">
                        African Language Content
                      </span>
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Meta Title</label>
                    <p className="text-sm font-medium">{blogMutation.data.metaTitle}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Meta Description</label>
                    <p className="text-sm text-muted-foreground">{blogMutation.data.metaDescription}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Suggested URL Slug</label>
                    <p className="text-sm font-mono text-primary">/blog/{blogMutation.data.slug}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Article Content */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{blogMutation.data.title}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(blogMutation.data.content);
                      toast({ title: "Copied to clipboard", description: "Blog HTML copied successfully" });
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" /> Copy HTML
                  </Button>
                </div>
                <ScrollArea className="h-[400px] border rounded-md">
                  <div className="p-4">
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: blogMutation.data.content }}
                    />
                  </div>
                </ScrollArea>
              </div>

              {/* Download Button */}
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    const lang = blogMutation.data.language || "en";
                    const fullHtml = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${blogMutation.data.metaTitle}</title>
  <meta name="description" content="${blogMutation.data.metaDescription}">
</head>
<body>
${blogMutation.data.content}
</body>
</html>`;
                    const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${blogMutation.data.slug}.html`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download className="h-4 w-4 mr-2" /> Download Full HTML
                </Button>
                <Button variant="outline" onClick={() => setBlogDialogOpen(false)}>
                  <X className="h-4 w-4 mr-2" /> Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
