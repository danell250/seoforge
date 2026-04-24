import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGetDashboardSummary, useDeleteOptimization, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Activity, BarChart3, CheckCircle2, Trash2, TrendingUp, Trophy, Globe, Lock, Plus, LineChart as LineChartIcon, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function scoreColor(score: number) {
  if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
  if (score >= 50) return "text-orange-600 bg-orange-50 border-orange-200";
  return "text-red-600 bg-red-50 border-red-200";
}

function ScoreChip({ score }: { score: number }) {
  return (
    <span className={`inline-flex items-center justify-center min-w-[44px] px-2 py-1 rounded-md text-sm font-semibold border ${scoreColor(score)}`}>
      {score}
    </span>
  );
}

// Mock data for domain monitoring - in production, fetch from API
const mockSiteData = {
  domain: "example.com",
  currentScore: 67,
  previousScore: 45,
  history: [
    { date: "Jan", score: 34 },
    { date: "Feb", score: 42 },
    { date: "Mar", score: 45 },
    { date: "Apr", score: 67 },
  ],
  pages: [
    { url: "/", title: "Homepage", score: 72, change: +15 },
    { url: "/about", title: "About Us", score: 58, change: -5 },
    { url: "/services", title: "Services", score: 81, change: +22 },
  ],
};

function DomainMonitoring({ userPlan }: { userPlan: string }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const isFree = userPlan === "free";
  const isLocked = isFree;

  if (isLocked) {
    return (
      <Card className="mt-8 border-dashed border-2 bg-muted/20">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Domain Monitoring</h3>
            <p className="text-muted-foreground mb-2 max-w-md">
              Monitor up to 5 websites with monthly SEO health checks, score trend graphs, and email alerts when pages drop below 60.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <LineChartIcon className="w-4 h-4" />
              <span>Example: Score improved from 34 to 91 over 3 months</span>
            </div>
            <Link href="/pricing">
              <Button size="lg">
                Upgrade to Starter
                <TrendingUp className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8 shadow-md">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Domain Monitoring
            </CardTitle>
            <CardDescription>
              Track SEO health scores for up to 5 websites
            </CardDescription>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Domain
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {showAddForm && (
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-3">
              Add your website URL to start monthly monitoring
            </p>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://your-website.com"
                className="flex-1 px-3 py-2 border rounded-md text-sm"
              />
              <Button size="sm">Start Monitoring</Button>
            </div>
          </div>
        )}

        {/* Example site data - in production, map over user's sites */}
        <div className="space-y-6">
          <div className="border rounded-xl overflow-hidden">
            <div className="p-4 bg-muted/30 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-primary" />
                <div>
                  <h4 className="font-semibold">{mockSiteData.domain}</h4>
                  <p className="text-sm text-muted-foreground">
                    Next scan: {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{mockSiteData.currentScore}</div>
                  <div className="text-xs text-muted-foreground">/100 average</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-green-600">+{mockSiteData.currentScore - mockSiteData.previousScore}</div>
                  <div className="text-xs text-muted-foreground">vs last month</div>
                </div>
              </div>
            </div>

            {/* Score Trend Chart */}
            <div className="p-4 border-b">
              <h5 className="text-sm font-medium mb-4">Score Trend Over Time</h5>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockSiteData.history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      formatter={(value: number) => [`${value}/100`, 'SEO Score']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#2563eb" 
                      strokeWidth={2}
                      dot={{ fill: '#2563eb', strokeWidth: 0, r: 4 }}
                      activeDot={{ r: 6, stroke: '#2563eb', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-2">
                Score improved from {mockSiteData.history[0].score} to {mockSiteData.history[mockSiteData.history.length - 1].score} over {mockSiteData.history.length} months
              </p>
            </div>

            {/* Pages Table */}
            <div className="p-4">
              <h5 className="text-sm font-medium mb-3">Page Scores</h5>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead className="text-center">Change</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockSiteData.pages.map((page) => (
                    <TableRow key={page.url}>
                      <TableCell>
                        <div className="font-medium">{page.title}</div>
                        <div className="text-xs text-muted-foreground">{page.url}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <ScoreChip score={page.score} />
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`text-sm font-medium ${page.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {page.change > 0 ? '+' : ''}{page.change}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href="/app">
                          <Button size="sm" variant="ghost">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function Dashboard() {
  const { data, isLoading } = useGetDashboardSummary();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const deleteMutation = useDeleteOptimization();
  const { user } = useAuth();
  const userPlan = user?.plan || "free";

  const handleDelete = (id: number) => {
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          toast({ title: "Deleted", description: "Record removed." });
        },
        onError: () => toast({ title: "Error", description: "Delete failed.", variant: "destructive" }),
      },
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mb-10">
            <h1 className="text-4xl font-bold mb-2">SEO Health Score Dashboard</h1>
            <p className="text-muted-foreground">
              Track every page you optimize. Show clients the numbers going up.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-24 text-muted-foreground">Loading dashboard...</div>
          ) : !data || data.totalPages === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center text-center py-20 gap-4">
                <BarChart3 className="h-16 w-16 text-muted-foreground/40" />
                <div>
                  <h3 className="text-xl font-semibold mb-1">No optimizations yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Run your first page through the optimizer and it will show up here with a full score breakdown.
                  </p>
                  <Link href="/app">
                    <Button size="lg">Optimize a page</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <Activity className="h-4 w-4" /> Total pages
                    </CardDescription>
                    <CardTitle className="text-3xl">{data.totalPages}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" /> Average overall
                    </CardDescription>
                    <CardTitle className="text-3xl">
                      {data.avgOverall}
                      <span className="text-base font-normal text-muted-foreground">/100</span>
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" /> Pages 80+
                    </CardDescription>
                    <CardTitle className="text-3xl text-green-600">{data.greenCount}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" /> Need work
                    </CardDescription>
                    <CardTitle className="text-3xl text-red-600">{data.redCount}</CardTitle>
                  </CardHeader>
                </Card>
              </div>

              <div className="grid lg:grid-cols-3 gap-4 mb-8">
                <Card>
                  <CardHeader>
                    <CardDescription>Average Technical SEO</CardDescription>
                    <CardTitle className="text-3xl">{data.avgTechnical}/100</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${data.avgTechnical >= 80 ? "bg-green-500" : data.avgTechnical >= 50 ? "bg-orange-500" : "bg-red-500"}`}
                        style={{ width: `${data.avgTechnical}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardDescription>Average Content SEO</CardDescription>
                    <CardTitle className="text-3xl">{data.avgContent}/100</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${data.avgContent >= 80 ? "bg-green-500" : data.avgContent >= 50 ? "bg-orange-500" : "bg-red-500"}`}
                        style={{ width: `${data.avgContent}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardDescription>Average AEO Readiness</CardDescription>
                    <CardTitle className="text-3xl">{data.avgAeo}/100</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${data.avgAeo >= 80 ? "bg-green-500" : data.avgAeo >= 50 ? "bg-orange-500" : "bg-red-500"}`}
                        style={{ width: `${data.avgAeo}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="shadow-md">
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle>Recent optimizations</CardTitle>
                  <CardDescription>Most recent first. Click delete to remove a record.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Page</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-center">Technical</TableHead>
                        <TableHead className="text-center">Content</TableHead>
                        <TableHead className="text-center">AEO</TableHead>
                        <TableHead className="text-center">Overall</TableHead>
                        <TableHead className="text-center">Changes</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(data.recent ?? []).map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium max-w-[260px] truncate">
                            {row.title || row.filename || row.sourceUrl || `Optimization #${row.id}`}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">{formatDate(row.createdAt)}</TableCell>
                          <TableCell className="text-center"><ScoreChip score={row.score.technical} /></TableCell>
                          <TableCell className="text-center"><ScoreChip score={row.score.content} /></TableCell>
                          <TableCell className="text-center"><ScoreChip score={row.score.aeo} /></TableCell>
                          <TableCell className="text-center"><ScoreChip score={row.score.overall} /></TableCell>
                          <TableCell className="text-center text-sm text-muted-foreground">{row.changesCount}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" onClick={() => handleDelete(row.id)} disabled={deleteMutation.isPending}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              {/* Domain Monitoring Section */}
              <DomainMonitoring userPlan={userPlan} />
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
