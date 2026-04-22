import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useOptimizeHtml } from "@workspace/api-client-react";
import { CheckCircle2, UploadCloud, Copy, RefreshCw, Download, Play, AlertCircle, FileCode, Globe, CheckSquare } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

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

export function SinglePageOptimizer() {
  const [htmlInput, setHtmlInput] = useState("");
  const { toast } = useToast();
  
  const optimizeMutation = useOptimizeHtml();

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
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setHtmlInput(event.target?.result as string);
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    setHtmlInput("");
    optimizeMutation.reset();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {!optimizeMutation.data ? (
        <Card className="border-2 border-primary/10 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <FileCode className="h-6 w-6 text-primary" />
              Optimize HTML
            </CardTitle>
            <CardDescription>
              Paste your raw HTML code below or upload a .html file to inject technical SEO, AEO metadata, and multilingual JSON-LD schema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Textarea 
                value={htmlInput}
                onChange={(e) => setHtmlInput(e.target.value)}
                placeholder="<!DOCTYPE html>&#10;<html>&#10;  <head>&#10;    <title>My Page</title>&#10;  </head>&#10;  <body>...</body>&#10;</html>"
                className="min-h-[400px] font-mono text-sm resize-y p-4 bg-muted/30 focus-visible:ring-primary"
              />
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur-sm shadow-sm" asChild>
                  <label className="cursor-pointer flex items-center gap-2">
                    <UploadCloud className="h-4 w-4" />
                    Upload .html
                    <input type="file" accept=".html,.htm" className="hidden" onChange={handleFileUpload} />
                  </label>
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 border-t px-6 py-4 flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {htmlInput.length > 0 ? `${(htmlInput.length / 1024).toFixed(1)} KB loaded` : '0 KB loaded'}
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
                  Optimize for SEO & AEO
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
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="h-4 w-4 mr-2" /> Start Over
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 border-primary/20 shadow-md">
              <CardHeader className="bg-muted/30 pb-4 border-b">
                <CardTitle className="text-lg">Health Score</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex justify-center mb-6">
                  <ScoreCircle score={optimizeMutation.data.score.overall} label="Overall Score" />
                </div>
                <div className="space-y-6">
                  <ScoreBar score={optimizeMutation.data.score.technical} label="Technical SEO" />
                  <ScoreBar score={optimizeMutation.data.score.content} label="Content SEO" />
                  <ScoreBar score={optimizeMutation.data.score.aeo} label="AEO Readiness" />
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 border-primary/20 shadow-md">
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
                    const blob = new Blob(["<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n  <url>\n    <loc>https://example.com/page</loc>\n    <lastmod>2023-10-25</lastmod>\n  </url>\n</urlset>"], { type: "application/xml" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = "sitemap.xml";
                    a.click();
                  }}>
                    <Download className="h-4 w-4 mr-2" /> sitemap.xml
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => {
                     const blob = new Blob(["User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml"], { type: "text/plain" });
                     const url = URL.createObjectURL(blob);
                     const a = document.createElement('a');
                     a.href = url;
                     a.download = "robots.txt";
                     a.click();
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
    </div>
  );
}
