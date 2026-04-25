import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useApplyHreflang } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Copy, Download, Globe2, Languages, Play, Plus, RefreshCw, Trash2, UploadCloud } from "lucide-react";

interface AltRow {
  hreflang: string;
  href: string;
}

const PRESETS: { label: string; value: AltRow[] }[] = [
  {
    label: "South Africa multilingual",
    value: [
      { hreflang: "en-ZA", href: "https://yoursite.co.za/" },
      { hreflang: "af-ZA", href: "https://yoursite.co.za/af/" },
      { hreflang: "zu-ZA", href: "https://yoursite.co.za/zu/" },
      { hreflang: "xh-ZA", href: "https://yoursite.co.za/xh/" },
    ],
  },
  {
    label: "Pan-African English",
    value: [
      { hreflang: "en-ZA", href: "https://yoursite.com/za/" },
      { hreflang: "en-NG", href: "https://yoursite.com/ng/" },
      { hreflang: "en-KE", href: "https://yoursite.com/ke/" },
      { hreflang: "en-GH", href: "https://yoursite.com/gh/" },
    ],
  },
  {
    label: "Francophone Africa",
    value: [
      { hreflang: "fr-SN", href: "https://yoursite.com/sn/" },
      { hreflang: "fr-CI", href: "https://yoursite.com/ci/" },
      { hreflang: "fr-CD", href: "https://yoursite.com/cd/" },
      { hreflang: "fr-MA", href: "https://yoursite.com/ma/" },
    ],
  },
];

export function HreflangTool() {
  const [html, setHtml] = useState("");
  const [alternates, setAlternates] = useState<AltRow[]>([
    { hreflang: "en-ZA", href: "https://yoursite.co.za/" },
    { hreflang: "af-ZA", href: "https://yoursite.co.za/af/" },
  ]);
  const { toast } = useToast();
  const mutation = useApplyHreflang();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setHtml(ev.target?.result as string);
    reader.readAsText(file);
  };

  const updateAlt = (i: number, key: keyof AltRow, value: string) => {
    setAlternates((prev) => prev.map((row, idx) => (idx === i ? { ...row, [key]: value } : row)));
  };
  const removeAlt = (i: number) => setAlternates((prev) => prev.filter((_, idx) => idx !== i));
  const addAlt = () => setAlternates((prev) => [...prev, { hreflang: "", href: "" }]);

  const handleRun = () => {
    if (!html.trim()) {
      toast({ title: "Input required", description: "Paste the page HTML first.", variant: "destructive" });
      return;
    }
    const cleaned = alternates
      .map((a) => ({ hreflang: a.hreflang.trim(), href: a.href.trim() }))
      .filter((a) => a.hreflang && a.href);
    if (cleaned.length === 0) {
      toast({ title: "Add alternates", description: "Add at least one locale.", variant: "destructive" });
      return;
    }
    for (const a of cleaned) {
      try {
        new URL(a.href);
      } catch {
        toast({ title: "Invalid URL", description: `${a.href} is not a valid URL.`, variant: "destructive" });
        return;
      }
    }
    mutation.mutate(
      { data: { html, alternates: cleaned } },
      { onError: () => toast({ title: "Error", description: "Generation failed, please try again.", variant: "destructive" }) },
    );
  };

  const reset = () => {
    setHtml("");
    mutation.reset();
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: `${label} copied.` });
  };

  const download = (text: string, name: string, mime: string) => {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {!mutation.data ? (
        <>
          <Card className="border-2 border-primary/10 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Languages className="h-6 w-6 text-primary" />
                Add Language and Country Tags
              </CardTitle>
              <CardDescription>
                Paste your page HTML, list the other versions of that page, and we will add the correct language and country tags for you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Textarea
                  value={html}
                  onChange={(e) => setHtml(e.target.value)}
                  placeholder="Paste your page HTML here..."
                  className="min-h-[260px] font-mono text-sm resize-y p-4 bg-muted/30 focus-visible:ring-primary"
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

          <Card>
            <CardHeader className="border-b bg-muted/30 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe2 className="h-5 w-5 text-primary" /> Other page versions
                </CardTitle>
                <CardDescription>Add one row for each language or country version of the same page.</CardDescription>
              </div>
              <div className="flex gap-2 flex-wrap">
                {PRESETS.map((p) => (
                  <Button key={p.label} size="sm" variant="outline" onClick={() => setAlternates(p.value)}>
                    {p.label}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              {alternates.map((row, i) => (
                <div key={i} className="grid grid-cols-[140px,1fr,auto] gap-2 items-center">
                  <Input
                    value={row.hreflang}
                    onChange={(e) => updateAlt(i, "hreflang", e.target.value)}
                    placeholder="Language code e.g. en-ZA"
                  />
                  <Input
                    value={row.href}
                    onChange={(e) => updateAlt(i, "href", e.target.value)}
                    placeholder="https://yoursite.co.za/"
                  />
                  <Button size="icon" variant="ghost" onClick={() => removeAlt(i)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addAlt} className="gap-2">
                <Plus className="h-4 w-4" /> Add page version
              </Button>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t px-6 py-4 flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {alternates.length} alternate{alternates.length === 1 ? "" : "s"} configured
              </span>
              <Button onClick={handleRun} disabled={mutation.isPending} size="lg" className="gap-2 px-8">
                {mutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Detecting...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" /> Add Tags to HTML
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Languages className="h-6 w-6 text-primary" />
              Language Tags Added
            </h2>
            <Button variant="outline" onClick={reset}>
              <RefreshCw className="h-4 w-4 mr-2" /> Start Over
            </Button>
          </div>

          <Card>
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="text-lg">Detected language</CardTitle>
              <CardDescription>
                We detected <span className="font-bold text-foreground">{mutation.data.detectedLanguage}</span> as the
                main page language and updated the <code>&lt;html lang&gt;</code> attribute automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-2">
              {mutation.data.injectedTags.map((t, i) => (
                <pre key={i} className="text-xs font-mono p-2 bg-muted rounded">
                  {t}
                </pre>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30">
              <div>
                <CardTitle className="text-base">Augmented HTML</CardTitle>
                <CardDescription>Drop straight into your page.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => copy(mutation.data.html, "HTML")}>
                  <Copy className="h-3 w-3 mr-1" /> Copy
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => download(mutation.data.html, "page-hreflang.html", "text/html")}
                >
                  <Download className="h-3 w-3 mr-1" /> Download
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <pre className="text-[12px] font-mono p-4 max-h-[500px] overflow-auto bg-[#1e1e1e] text-[#d4d4d4]">
                {mutation.data.html}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
