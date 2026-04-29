import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  useGetDashboardSummary,
  useDeleteOptimization,
  useListMonitoredSites,
  getGetDashboardSummaryQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRight,
  CalendarClock,
  Check,
  ExternalLink,
  Globe,
  Lock,
  Radar,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

function scoreColor(score: number) {
  if (score >= 80) return "text-green-700 bg-green-50 border-green-200";
  if (score >= 50) return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-red-700 bg-red-50 border-red-200";
}

function ScoreChip({ score }: { score: number }) {
  return (
    <span className={`inline-flex min-w-[44px] items-center justify-center rounded-md border px-2 py-1 text-sm font-semibold ${scoreColor(score)}`}>
      {score}
    </span>
  );
}

interface MonitoredSiteSummary {
  id: number;
  url: string;
  domain: string;
  email: string;
  frequency: string;
  enabled: boolean;
  nextRunAt: string;
  lastRunAt?: string | null;
}

function SectionCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-lg font-semibold text-slate-900">{title}</CardTitle>
          <CardDescription className="mt-1 text-slate-600">{description}</CardDescription>
        </div>
        {action}
      </CardHeader>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}

function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "blue" | "green";
}) {
  const toneClass =
    tone === "green"
      ? "text-green-700"
      : tone === "blue"
        ? "text-blue-700"
        : "text-slate-900";

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="space-y-3 pb-4">
        <CardDescription className="text-sm font-medium text-slate-500">{label}</CardDescription>
        <CardTitle className={`text-3xl font-semibold tracking-tight ${toneClass}`}>{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

function ChecklistItem({
  complete,
  step,
  title,
  description,
  href,
}: {
  complete: boolean;
  step: number;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href} className="block">
      <div className="flex items-start gap-4 rounded-lg border border-slate-200 bg-slate-50/70 p-4 transition-colors hover:border-blue-200 hover:bg-blue-50/50">
        <div
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${
            complete
              ? "border-green-200 bg-green-100 text-green-700"
              : "border-blue-200 bg-white text-blue-700"
          }`}
        >
          {complete ? <Check className="h-4 w-4" /> : step}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-slate-900">{title}</p>
            <ArrowRight className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        </div>
      </div>
    </Link>
  );
}

function DomainMonitoring({
  userPlan,
  sitesQ,
}: {
  userPlan: string;
  sitesQ: ReturnType<typeof useListMonitoredSites>;
}) {
  const isFree = userPlan === "free";
  const sites = ((sitesQ.data as { sites?: MonitoredSiteSummary[] } | undefined)?.sites ?? []);
  const upcomingWindow = Date.now() + 1000 * 60 * 60 * 24 * 7;
  const dueSoonCount = sites.filter((site) => new Date(site.nextRunAt).getTime() <= upcomingWindow).length;
  const activeCount = sites.filter((site) => site.enabled).length;
  const mostRecentCompletedSite = sites
    .filter((site) => site.lastRunAt)
    .sort((a, b) => new Date(b.lastRunAt ?? 0).getTime() - new Date(a.lastRunAt ?? 0).getTime())[0];

  return (
    <SectionCard
      title="Domain Monitoring"
      description="Scheduled crawls and regression checks will show up here as soon as you connect a domain."
      action={
        <Button variant="outline" asChild>
          <Link href="/app#monitor">
            Open Monitor
            <Radar className="h-4 w-4" />
          </Link>
        </Button>
      }
    >
      <div className="p-6">
        {isFree ? (
          <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-slate-50/80 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <Lock className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Upgrade to unlock automated monitoring</p>
                <p className="mt-1 text-sm text-slate-600">
                  Add up to 5 domains, schedule recurring checks, and get alerted when pages lose ranking signals.
                </p>
              </div>
            </div>
            <Button asChild>
              <Link href="/pricing">Upgrade to Starter</Link>
            </Button>
          </div>
        ) : sitesQ.isError ? (
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <span>Monitoring summary unavailable right now.</span>
            <Link href="/app#monitor" className="font-medium text-blue-700 hover:text-blue-800">
              Retry in Monitor
            </Link>
          </div>
        ) : sitesQ.isLoading ? (
          <div className="text-sm text-slate-500">Loading monitored domains...</div>
        ) : sites.length === 0 ? (
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <span>No domains monitored yet. Add your first site to start scheduled checks.</span>
            <Link href="/app#monitor" className="font-medium text-blue-700 hover:text-blue-800">
              Set up monitoring
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-slate-200 bg-slate-50/70 shadow-none">
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2 text-slate-500">
                    <Globe className="h-4 w-4" />
                    Domains live
                  </CardDescription>
                  <CardTitle className="text-2xl text-slate-900">{activeCount}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-slate-200 bg-slate-50/70 shadow-none">
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2 text-slate-500">
                    <CalendarClock className="h-4 w-4" />
                    Due this week
                  </CardDescription>
                  <CardTitle className="text-2xl text-slate-900">{dueSoonCount}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-slate-200 bg-slate-50/70 shadow-none">
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2 text-slate-500">
                    <Radar className="h-4 w-4" />
                    Last completed
                  </CardDescription>
                  <CardTitle className="text-lg text-slate-900">
                    {mostRecentCompletedSite?.lastRunAt ? formatDate(mostRecentCompletedSite.lastRunAt) : "No runs yet"}
                  </CardTitle>
                  {mostRecentCompletedSite ? (
                    <div className="text-sm text-slate-500">{mostRecentCompletedSite.domain}</div>
                  ) : null}
                </CardHeader>
              </Card>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="border-slate-200">
                  <TableHead>Domain</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Next run</TableHead>
                  <TableHead>Last run</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sites.map((site) => (
                  <TableRow key={site.id} className="border-slate-200">
                    <TableCell>
                      <div className="font-medium text-slate-900">{site.domain}</div>
                      <div className="max-w-[280px] truncate text-xs text-slate-500">{site.url}</div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">{site.email}</TableCell>
                    <TableCell className="capitalize text-slate-700">{site.frequency}</TableCell>
                    <TableCell className="text-sm text-slate-600">{formatDate(site.nextRunAt)}</TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {site.lastRunAt ? formatDate(site.lastRunAt) : "Not run yet"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" asChild>
                        <Link href="/app#monitor">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </SectionCard>
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
  const monitoredSitesQuery = useListMonitoredSites();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const deleteMutation = useDeleteOptimization();
  const { user } = useAuth();
  const userPlan = user?.plan || "free";
  const sites = ((monitoredSitesQuery.data as { sites?: MonitoredSiteSummary[] } | undefined)?.sites ?? []);
  const summary = data ?? {
    totalPages: 0,
    avgOverall: 0,
    avgTechnical: 0,
    avgContent: 0,
    avgAeo: 0,
    greenCount: 0,
    orangeCount: 0,
    redCount: 0,
    recent: [],
  };
  const recentRows = summary.recent ?? [];
  const isBooting = isLoading && !data;
  const checklist = [
    {
      step: 1,
      complete: summary.totalPages > 0,
      title: "Optimize your first page",
      description: "Run a page through the workspace to generate your first scorecard.",
      href: "/app",
    },
    {
      step: 2,
      complete: sites.length > 0,
      title: "Set up domain monitoring",
      description: "Track live domains for regressions, schedules, and email updates.",
      href: "/app#monitor",
    },
    {
      step: 3,
      complete: false,
      title: "Run a competitor scan",
      description: "Benchmark a competing page before you refine your next draft.",
      href: "/app#competitor",
    },
  ] as const;

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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container mx-auto flex max-w-7xl flex-col gap-6 px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Dashboard</h1>
              <p className="mt-1 text-sm text-slate-500">A clean view of your repair history, scores, and monitoring setup.</p>
            </div>
            {isBooting ? <span className="text-sm text-slate-400">Loading dashboard...</span> : null}
          </div>

          <Card className="relative overflow-hidden border border-slate-900/80 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-900 text-white shadow-lg">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.10),transparent_40%,transparent_60%,rgba(96,165,250,0.20))]" />
            <CardContent className="relative flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-blue-100">
                  <Sparkles className="h-3.5 w-3.5" />
                  Dashboard ready
                </div>
                <h2 className="text-3xl font-semibold tracking-tight">Welcome to SEOaxe</h2>
                <p className="mt-2 text-sm text-blue-100 md:text-base">
                  Start repairing pages to see your scores here
                </p>
              </div>
              <Button
                asChild
                size="lg"
                className="min-w-[220px] bg-white text-slate-950 hover:bg-blue-50"
              >
                <Link href="/app">
                  Repair Your First Page
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <SectionCard
            title="Get started in 3 steps"
            description="A simple setup path so the dashboard starts filling in with real performance data."
          >
            <div className="grid gap-4 p-6 md:grid-cols-3">
              {checklist.map((item) => (
                <ChecklistItem key={item.step} {...item} />
              ))}
            </div>
          </SectionCard>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Pages Optimized" value={summary.totalPages} tone="blue" />
            <StatCard label="Average Score" value={summary.totalPages > 0 ? `${summary.avgOverall}/100` : "—"} />
            <StatCard label="Pages Scoring 80+" value={summary.greenCount} tone="green" />
            <StatCard label="Domains Monitored" value={sites.length} />
          </div>

          <SectionCard
            title="Recent Optimizations"
            description="Your newest page runs show up here with score breakdowns and quick cleanup actions."
            action={
              <Button variant="outline" asChild>
                <Link href="/app">Open Workspace</Link>
              </Button>
            }
          >
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200">
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
                {isBooting ? (
                  <TableRow className="border-slate-200">
                    <TableCell colSpan={8} className="px-6 py-5 text-sm text-slate-500">
                      Loading recent optimizations...
                    </TableCell>
                  </TableRow>
                ) : recentRows.length === 0 ? (
                  <TableRow className="border-slate-200">
                    <TableCell colSpan={8} className="px-6 py-5 text-sm text-slate-600">
                      <span>No optimizations yet. Your results will appear here.</span>{" "}
                      <Link href="/app" className="font-medium text-blue-700 hover:text-blue-800">
                        Optimize a page
                      </Link>
                    </TableCell>
                  </TableRow>
                ) : (
                  recentRows.map((row) => (
                    <TableRow key={row.id} className="border-slate-200">
                      <TableCell className="max-w-[260px] truncate font-medium text-slate-900">
                        {row.title || row.filename || row.sourceUrl || `Optimization #${row.id}`}
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">{formatDate(row.createdAt)}</TableCell>
                      <TableCell className="text-center"><ScoreChip score={row.score.technical} /></TableCell>
                      <TableCell className="text-center"><ScoreChip score={row.score.content} /></TableCell>
                      <TableCell className="text-center"><ScoreChip score={row.score.aeo} /></TableCell>
                      <TableCell className="text-center"><ScoreChip score={row.score.overall} /></TableCell>
                      <TableCell className="text-center text-sm text-slate-500">{row.changesCount}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(row.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </SectionCard>

          <DomainMonitoring userPlan={userPlan} sitesQ={monitoredSitesQuery} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
