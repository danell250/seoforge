import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useScanCompetitor } from "@workspace/api-client-react";
import { Search, RefreshCw, Target, Code, FileText, Lightbulb, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export function CompetitorScanner() {
  const [url, setUrl] = useState("");
  const { toast } = useToast();
  const scanMutation = useScanCompetitor();

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    // Basic URL validation
    let validUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      validUrl = 'https://' + url;
    }
    
    scanMutation.mutate({ data: { url: validUrl } }, {
      onError: () => {
        toast({
          title: "Scan failed",
          description: "Scan failed, please try again.",
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
            Competitor Scanner
          </CardTitle>
          <CardDescription>
            Enter a competitor's URL to reverse-engineer their SEO strategy, schema usage, and discover how to outrank them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleScan} className="flex gap-4">
            <Input 
              placeholder="https://competitor-agency.co.za" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={!url || scanMutation.isPending} className="min-w-[150px]">
              {scanMutation.isPending ? (
                <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Scanning...</>
              ) : (
                <><Target className="mr-2 h-4 w-4" /> Scan Competitor</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {scanMutation.data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
          
          <Card className="shadow-md h-full flex flex-col border-primary/20">
            <CardHeader className="bg-muted/30 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Their Strategy
                  </CardTitle>
                  <CardDescription className="mt-1 flex items-center gap-1">
                    Analysis for <a href={scanMutation.data.url} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">{scanMutation.data.title} <ExternalLink className="h-3 w-3" /></a>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 flex-1 space-y-6">
              
              <div>
                <h4 className="text-sm font-semibold flex items-center gap-2 mb-2 text-muted-foreground uppercase tracking-wide">
                  <FileText className="h-4 w-4" /> Meta Strategy
                </h4>
                <p className="text-sm bg-muted/50 p-3 rounded-md border">{scanMutation.data.strategy.metaStrategy}</p>
              </div>

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
                  <Code className="h-4 w-4" /> Schema Usage
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

              <div>
                <h4 className="text-sm font-semibold flex items-center gap-2 mb-2 text-muted-foreground uppercase tracking-wide">
                  <FileText className="h-4 w-4" /> Content Structure
                </h4>
                <p className="text-sm bg-muted/50 p-3 rounded-md border">{scanMutation.data.strategy.contentStructure}</p>
              </div>

            </CardContent>
          </Card>

          <Card className="shadow-md h-full flex flex-col bg-primary/[0.02] border-primary/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -z-10"></div>
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="text-xl flex items-center gap-2 text-primary">
                <Lightbulb className="h-5 w-5" />
                How To Beat Them
              </CardTitle>
              <CardDescription className="text-primary/70">
                Actionable recommendations to outrank this competitor.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 flex-1">
              <ul className="space-y-4">
                {scanMutation.data.beatThem.map((tip, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-sm">
                      {i + 1}
                    </div>
                    <div className="pt-1">
                      <p className="text-sm font-medium leading-relaxed">{tip}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  );
}
