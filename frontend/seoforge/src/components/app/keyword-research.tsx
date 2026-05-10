import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, BarChart3 } from "lucide-react";

const sampleSuggestions = [
  { term: "SEO audit checklist", volume: "1.6k" },
  { term: "how to rank local SEO", volume: "880" },
  { term: "best SEO tools 2026", volume: "720" },
  { term: "on page SEO tips", volume: "540" },
];

export function KeywordResearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<typeof sampleSuggestions>([]);
  const [activeTerm, setActiveTerm] = useState<string | null>(null);

  const handleSearch = () => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      setResults([]);
      return;
    }

    setActiveTerm(normalized);
    setResults(
      sampleSuggestions
        .filter((item) => item.term.toLowerCase().includes(normalized))
        .slice(0, 5),
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="border-2 border-primary/10 shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Search className="h-6 w-6 text-primary" />
            Keyword Research
          </CardTitle>
          <CardDescription>
            Discover keyword ideas, search intent signals, and content opportunities for your next page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <Input
              placeholder="Enter a keyword or topic"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-w-0"
            />
            <Button onClick={handleSearch} className="w-full md:w-auto">
              Analyze
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border bg-muted/50 p-4">
              <div className="text-sm font-semibold text-muted-foreground">Estimated difficulty</div>
              <div className="mt-3 text-4xl font-bold">62</div>
              <div className="mt-2 text-xs text-muted-foreground">Lower is easier to rank.</div>
            </div>
            <div className="rounded-3xl border bg-muted/50 p-4">
              <div className="text-sm font-semibold text-muted-foreground">Priority score</div>
              <div className="mt-3 text-4xl font-bold">82</div>
              <div className="mt-2 text-xs text-muted-foreground">Based on search intent and content opportunity.</div>
            </div>
          </div>

          <div className="rounded-3xl border bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-3">
              <TrendingUp className="h-4 w-4" />
              Suggested keywords
            </div>
            <div className="space-y-3">
              {(results.length > 0 ? results : sampleSuggestions).map((suggestion) => (
                <div
                  key={suggestion.term}
                  className={`flex items-center justify-between rounded-xl border p-3 transition ${
                    activeTerm === suggestion.term.toLowerCase() ? "border-primary bg-primary/5" : "border-border bg-background"
                  }`}
                >
                  <div>
                    <div className="font-medium">{suggestion.term}</div>
                    <div className="text-xs text-muted-foreground">Search volume: {suggestion.volume}</div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setQuery(suggestion.term)}>
                    Use
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-primary/10 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">How to use this feature</CardTitle>
          <CardDescription>
            Enter a topic and use the suggested keywords as page titles, section headings, or blog ideas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>Keyword research helps you choose the query your page should satisfy before you optimize metadata, schema, and content structure.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border bg-muted p-3">
              <div className="font-semibold">Step 1</div>
              <p className="text-xs mt-1">Find a high-intent keyword that matches your page topic.</p>
            </div>
            <div className="rounded-2xl border bg-muted p-3">
              <div className="font-semibold">Step 2</div>
              <p className="text-xs mt-1">Use the keyword in title, headings, and the first paragraph.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
