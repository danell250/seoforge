import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGenerateAeoBlock } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Copy, MessageSquareQuote, Play, RefreshCw, Sparkles, Globe } from "lucide-react";
import { useFetchPage } from "@workspace/api-client-react";

export function AeoAnswerBlock() {
  const [url, setUrl] = useState("");
  const [topic, setTopic] = useState("");
  const { toast } = useToast();
  const mutation = useGenerateAeoBlock();
  const fetchMutation = useFetchPage();

  const handleRun = async () => {
    if (!url.trim()) {
      toast({ title: "Input required", description: "Enter a live page URL first.", variant: "destructive" });
      return;
    }
    try {
      const html = await fetchPageHtml(url);
      mutation.mutate(
        { data: { html, topic: topic.trim() || undefined } },
        {
          onError: () => toast({ title: "Error", description: "Generation failed, please try again.", variant: "destructive" }),
        },
      );
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch page. Please check the URL.", variant: "destructive" });
    }
  };

  const fetchPageHtml = async (url: string): Promise<string> => {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch');
    return await response.text();
  };

  const handleReset = () => {
    setUrl("");
    setTopic("");
    mutation.reset();
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: `${label} copied to clipboard.` });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {!mutation.data ? (
        <Card className="border-2 border-primary/10 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <MessageSquareQuote className="h-6 w-6 text-primary" />
              FAQ and Answer Block Generator
            </CardTitle>
            <CardDescription>
              Enter a live page URL to generate copyable FAQ and schema suggestions. SEOaxe scans your page directly—no file uploads needed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Live page URL</label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/page"
                className="font-mono"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Page topic (optional)</label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. call centers"
              />
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 border-t px-6 py-4 flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {url.length > 0 ? "URL ready to scan" : "No URL provided"}
            </span>
            <Button size="lg" onClick={handleRun} disabled={mutation.isPending || !url.trim()} className="gap-2 px-8">
              {mutation.isPending ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" /> Generate FAQ Content
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
              <TabsTrigger value="full">Suggested HTML</TabsTrigger>
              <TabsTrigger value="schema">FAQPage Schema</TabsTrigger>
            </TabsList>
            <TabsContent value="full" className="m-0 mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30">
                  <div>
                    <CardTitle className="text-base">Suggested FAQ section + JSON-LD</CardTitle>
                    <CardDescription>Review the snippet before adding it to your site.</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => copy(mutation.data.html, "HTML")}>
                      <Copy className="h-3 w-3 mr-1" /> Copy
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
