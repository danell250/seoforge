import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGetDashboardSummary, useDeleteOptimization, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Activity, BarChart3, CheckCircle2, Trash2, TrendingUp, Trophy } from "lucide-react";
import { Link } from "wouter";

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
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
