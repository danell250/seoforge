import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGenerateAeoBlock } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Copy, Download, MessageSquareQuote, Play, RefreshCw, Sparkles, UploadCloud } from "lucide-react";

export function AeoAnswerBlock() {
  const [html, setHtml] = useState("");
  const [topic, setTopic] = useState("");
  const { toast } = useToast();
  const mutation = useGenerateAeoBlock();

  const handleRun = () => {
    if (!html.trim()) {
      toast({ title: "Input required", description: "Paste the page HTML first.", variant: "destructive" });
      return;
    }
    mutation.mutate(
      { data: { html, topic: topic.trim() || undefined } },
      {
        onError: () => toast({ title: "Error", description: "Generation failed, please try again.", variant: "destructive" }),
      },
    );
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setHtml(ev.target?.result as string);
    reader.readAsText(file);
  };

  const handleReset = () => {
    setHtml("");
    setTopic("");
    mutation.reset();
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: `${label} copied to clipboard.` });
  };

  const download = (text: string, filename: string, mime: string) => {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {!mutation.data ? (
        <Card className="border-2 border-primary/10 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <MessageSquareQuote className="h-6 w-6 text-primary" />
              AEO Answer Block Generator
            </CardTitle>
            <CardDescription>
              Detects the questions your page should answer to win Google AI Overviews and Perplexity, then injects
              ready-to-deploy Q&amp;A content and FAQPage JSON-LD schema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Topic hint (optional)</label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. solar geyser installation Cape Town"
              />
            </div>
            <div className="relative">
              <Textarea
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                placeholder="<!DOCTYPE html>..."
                className="min-h-[360px] font-mono text-sm resize-y p-4 bg-muted/30 focus-visible:ring-primary"
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
          <CardFooter className="bg-muted/30 border-t px-6 py-4 flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {html.length > 0 ? `${(html.length / 1024).toFixed(1)} KB loaded` : "0 KB loaded"}
            </span>
            <Button size="lg" onClick={handleRun} disabled={mutation.isPending || !html.trim()} className="gap-2 px-8">
              {mutation.isPending ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" /> Generate Answer Blocks
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              {mutation.data.questions.length} Answer Blocks Generated
            </h2>
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="h-4 w-4 mr-2" /> Start Over
            </Button>
          </div>

          <Card className="shadow-md">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle>Questions &amp; Answers</CardTitle>
              <CardDescription>Tuned for Google AI Overviews, Perplexity, and voice search.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {mutation.data.questions.map((q, i) => (
                <div key={i} className="border rounded-lg p-4 bg-card">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="font-semibold text-base flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-1" />
                      {q.question}
                    </h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="shrink-0"
                      onClick={() => copy(`Q: ${q.question}\nA: ${q.answer}`, "Q&A")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed pl-6">{q.answer}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Tabs defaultValue="full" className="w-full">
            <TabsList>
              <TabsTrigger value="full">Augmented HTML</TabsTrigger>
              <TabsTrigger value="schema">FAQPage Schema</TabsTrigger>
            </TabsList>
            <TabsContent value="full" className="m-0 mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30">
                  <div>
                    <CardTitle className="text-base">Full HTML with FAQ section + JSON-LD</CardTitle>
                    <CardDescription>Drop straight into your page.</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => copy(mutation.data.html, "HTML")}>
                      <Copy className="h-3 w-3 mr-1" /> Copy
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => download(mutation.data.html, "page-with-aeo.html", "text/html")}
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
            </TabsContent>
            <TabsContent value="schema" className="m-0 mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30">
                  <div>
                    <CardTitle className="text-base">FAQPage JSON-LD only</CardTitle>
                    <CardDescription>Paste inside the page &lt;head&gt;.</CardDescription>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => copy(mutation.data.schemaJsonLd, "Schema")}>
                    <Copy className="h-3 w-3 mr-1" /> Copy
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <pre className="text-[12px] font-mono p-4 max-h-[500px] overflow-auto bg-[#1e1e1e] text-[#d4d4d4]">
                    {mutation.data.schemaJsonLd}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
