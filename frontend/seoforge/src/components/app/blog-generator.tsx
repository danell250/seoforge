import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { customFetch } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Loader2,
  Download,
  Copy,
  CheckCircle2,
  Sparkles,
  Rocket,
  Trash2,
  Plus,
} from "lucide-react";

interface BlogPost {
  title: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;
  content: string;
  wordCount: number;
}

export function BlogGenerator() {
  const { toast } = useToast();
  const [keywords, setKeywords] = useState("");
  const [tone, setTone] = useState("authoritative");
  const [generating, setGenerating] = useState(false);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  async function handleGenerate() {
    const keywordList = keywords
      .split("\n")
      .map(k => k.trim())
      .filter(k => k.length > 0);

    if (keywordList.length === 0) {
      toast({ title: "No keywords provided", variant: "destructive" });
      return;
    }

    setGenerating(true);
    setPosts([]);
    setCurrentIndex(0);

    const concurrencyLimit = 5;
    let completedCount = 0;
    const results: BlogPost[] = [];

    async function promisePool<T>(
      items: string[],
      processor: (item: string) => Promise<T | null>,
      limit: number
    ): Promise<(T | null)[]> {
      const results: (T | null)[] = [];
      const executing = new Set<Promise<void>>();

      for (const item of items) {
        const promise = (async () => {
          const result = await processor(item);
          results.push(result);
        })();

        executing.add(promise);
        promise.finally(() => executing.delete(promise));

        if (executing.size >= limit) {
          await Promise.race(executing);
        }
      }

      await Promise.all(executing);
      return results;
    }

    const processed = await promisePool(
      keywordList,
      async (kw) => {
        try {
          const result = await customFetch<BlogPost>("/api/blog-from-keyword", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ keyword: kw, tone }),
          });
          results.push(result);
          setPosts([...results]);
          setCurrentPost(result);
          completedCount++;
          setCurrentIndex(completedCount);
          return result;
        } catch (err: any) {
          toast({
            title: `Failed to generate: ${kw}`,
            description: err?.data?.message || "Please try again",
            variant: "destructive",
          });
          completedCount++;
          setCurrentIndex(completedCount);
          return null;
        }
      },
      concurrencyLimit
    );

    setGenerating(false);
    setCurrentIndex(0);
    toast({ title: `Generated ${posts.length} blog posts` });
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  }

  function downloadPost(post: BlogPost, index: number) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.metaTitle}</title>
  <meta name="description" content="${post.metaDescription}">
</head>
<body>
${post.content}
</body>
</html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${post.slug}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function downloadAll() {
    posts.forEach((post, i) => downloadPost(post, i));
  }

  function removePost(index: number) {
    setPosts((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="border-2 border-primary/10 shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Rocket className="h-6 w-6 text-primary" />
            Blog Generator (Content Velocity)
          </CardTitle>
          <CardDescription>
            Generate 20-50 SEO-optimized blog posts fast. Enter long-tail keywords (one per line) and we'll create full articles targeting each query.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="keywords">Keywords (one per line)</Label>
            <Textarea
              id="keywords"
              placeholder="how to improve domain authority in 2026&#10;why my website is not ranking on google&#10;best seo tools for small business&#10;how to get backlinks fast&#10;seo checklist for new websites"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Target long-tail queries with 4+ words for better ranking chances.
            </p>
          </div>

          <div>
            <Label htmlFor="tone">Tone</Label>
            <select
              id="tone"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full mt-1.5 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="authoritative">Authoritative</option>
              <option value="friendly">Friendly</option>
              <option value="professional">Professional</option>
              <option value="technical">Technical</option>
            </select>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generating || !keywords.trim()}
            className="w-full"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating {currentIndex > 0 ? `(${currentIndex}/${keywords.split("\n").filter(k => k.trim()).length})` : "..."}
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Blog Posts
              </>
            )}
          </Button>

          {posts.length > 0 && !generating && (
            <Button onClick={downloadAll} variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download All ({posts.length} posts)
            </Button>
          )}
        </CardContent>
      </Card>

      {posts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Generated Posts</h2>
            <Badge variant="outline">{posts.length} posts</Badge>
          </div>

          <div className="grid gap-4">
            {posts.map((post, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-base">{post.title}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {post.metaDescription}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {post.wordCount} words
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removePost(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="preview">
                    <TabsList className="grid w-full grid-cols-3 mb-3">
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                      <TabsTrigger value="html">HTML</TabsTrigger>
                      <TabsTrigger value="meta">Meta</TabsTrigger>
                    </TabsList>

                    <TabsContent value="preview" className="m-0">
                      <div
                        className="prose prose-sm max-w-none border rounded-md p-4 bg-muted/30 max-h-64 overflow-y-auto"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                      />
                    </TabsContent>

                    <TabsContent value="html" className="m-0">
                      <div className="flex gap-2 mb-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(post.content)}
                        >
                          <Copy className="mr-1 h-3 w-3" /> Copy HTML
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadPost(post, index)}
                        >
                          <Download className="mr-1 h-3 w-3" /> Download
                        </Button>
                      </div>
                      <Textarea
                        value={post.content}
                        readOnly
                        className="font-mono text-xs max-h-64"
                      />
                    </TabsContent>

                    <TabsContent value="meta" className="m-0 space-y-3">
                      <div>
                        <Label>Title Tag</Label>
                        <div className="flex gap-2 mt-1">
                          <Input value={post.metaTitle} readOnly />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(post.metaTitle)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label>Meta Description</Label>
                        <div className="flex gap-2 mt-1">
                          <Textarea value={post.metaDescription} readOnly rows={2} />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(post.metaDescription)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label>URL Slug</Label>
                        <div className="flex gap-2 mt-1">
                          <Input value={post.slug} readOnly />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(post.slug)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {posts.length === 0 && !generating && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ready to generate content</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Enter your long-tail keywords above and click generate to create SEO-optimized blog posts at scale.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
