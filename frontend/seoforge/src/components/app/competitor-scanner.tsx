import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ApiError, useScanCompetitor } from "@workspace/api-client-react";
import { Search, RefreshCw, Target, Code, FileText, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function CompetitorScanner() {
  const [url, setUrl] = useState("");
  const { toast } = useToast();
  const scanMutation = useScanCompetitor();

  const getErrorMessage = (error: unknown) => {
    if (error instanceof ApiError) {
      const message =
        typeof error.data === "object" && error.data && "message" in error.data
          ? (error.data as { message?: unknown }).message
          : null;
      if (typeof message === "string" && message.trim()) {
        return message;
      }
    }
    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }
    return "Scan failed, please try again.";
  };

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    // Basic URL validation
    let validUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      validUrl = 'https://' + url;
    }
    
    scanMutation.mutate({ data: { url: validUrl } }, {
      onError: (error) => {
        toast({
          title: "Scan failed",
          description: getErrorMessage(error),
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <Card className="border-2 border-primary/10 shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Search className="h-6 w-6 text-primary" />
            Research a Competitor Page
          </CardTitle>
          <CardDescription>
            Paste a competitor page URL and we will summarize what they are targeting, how the page is structured, and how your page can be stronger.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleScan} className="flex gap-4">
            <Input 
              placeholder="Paste a competitor page URL" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={!url || scanMutation.isPending} className="min-w-[150px]">
              {scanMutation.isPending ? (
                <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Scanning...</>
              ) : (
                <><Target className="mr-2 h-4 w-4" /> Analyze Page</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {scanMutation.data && (
        <div className="space-y-4 animate-in fade-in duration-500">
          <Card className="border-primary/20 shadow-md">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Snapshot
              </CardTitle>
              <CardDescription className="flex items-center gap-1">
                Analysis for{" "}
                <a href={scanMutation.data.url} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                  {scanMutation.data.title} <ExternalLink className="h-3 w-3" />
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm bg-muted/50 p-3 rounded-md border">{scanMutation.data.strategy.metaStrategy}</p>
            </CardContent>
          </Card>

          <Accordion type="single" collapsible defaultValue="actions" className="rounded-xl border bg-background px-4">
            <AccordionItem value="actions">
              <AccordionTrigger className="text-base font-semibold">
                How You Can Beat Them
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-3 pt-2">
                  {scanMutation.data.beatThem.map((tip, i) => (
                    <li key={i} className="flex gap-3">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-sm">
                        {i + 1}
                      </div>
                      <p className="text-sm font-medium leading-relaxed">{tip}</p>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="details">
              <AccordionTrigger className="text-base font-semibold">
                Competitor Details
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div>
                    <h4 className="text-sm font-semibold flex items-center gap-2 mb-2 text-muted-foreground uppercase tracking-wide">
                      <Search className="h-4 w-4" /> Target Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {scanMutation.data.strategy.targetKeywords.map((kw, i) => (
                        <Badge key={i} variant="secondary" className="font-normal">{kw}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold flex items-center gap-2 mb-2 text-muted-foreground uppercase tracking-wide">
                      <Code className="h-4 w-4" /> Structured Data
                    </h4>
                    <ul className="space-y-1 bg-muted/50 p-3 rounded-md border text-sm font-mono">
                      {scanMutation.data.strategy.schemaUsage.map((schema, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
                          {schema}
                        </li>
                      ))}
                      {scanMutation.data.strategy.schemaUsage.length === 0 && (
                        <li className="text-muted-foreground italic">No structured data detected.</li>
                      )}
                    </ul>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-semibold flex items-center gap-2 mb-2 text-muted-foreground uppercase tracking-wide">
                    <FileText className="h-4 w-4" /> Page Structure
                  </h4>
                  <p className="text-sm bg-muted/50 p-3 rounded-md border">{scanMutation.data.strategy.contentStructure}</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </div>
  );
}
