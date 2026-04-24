import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useListMonitoredSites,
  useCreateMonitoredSite,
  useDeleteMonitoredSite,
  useRunMonitoredSite,
  useListMonitorReports,
  getListMonitoredSitesQueryKey,
  getListMonitorReportsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  Mail,
  Play,
  RefreshCw,
  Radar,
  Trash2,
  TrendingDown,
  TrendingUp,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export function SiteMonitor() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [maxPages, setMaxPages] = useState(15);
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [expandedReports, setExpandedReports] = useState<number | null>(null);

  const sitesQ = useListMonitoredSites();
  const create = useCreateMonitoredSite();
  const del = useDeleteMonitoredSite();
  const run = useRunMonitoredSite();

  const submit = () => {
    if (!url.trim() || !email.trim()) {
      toast({ title: "Add URL and email", variant: "destructive" });
      return;
    }
    create.mutate(
      {
        data: {
          url: url.trim(),
          email: email.trim(),
          topic: topic.trim() || undefined,
          audience: audience.trim() || undefined,
          maxPages,
          frequency,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Site added", description: "We'll re-crawl on schedule and email you the diff." });
          setUrl("");
          setTopic("");
          setAudience("");
          qc.invalidateQueries({ queryKey: getListMonitoredSitesQueryKey() });
        },
        onError: () => toast({ title: "Couldn't add site", variant: "destructive" }),
      },
    );
  };

  const remove = (id: number) => {
    if (!confirm("Stop monitoring this site? All history will be deleted.")) return;
    del.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Removed" });
          qc.invalidateQueries({ queryKey: getListMonitoredSitesQueryKey() });
        },
      },
    );
  };

  const runNow = (id: number) => {
    toast({
      title: "Running now",
      description: "Re-crawling and analyzing — this can take a minute or two.",
    });
    run.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Report ready", description: "Email sent and saved to history." });
          qc.invalidateQueries({ queryKey: getListMonitoredSitesQueryKey() });
          qc.invalidateQueries({ queryKey: getListMonitorReportsQueryKey(id) });
        },
        onError: () => toast({ title: "Run failed", variant: "destructive" }),
      },
    );
  };

  const sites = sitesQ.data?.sites ?? [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="border-2 border-primary/10 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Radar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Scheduled Site Monitor</CardTitle>
              <CardDescription>
                Re-crawl any site on a schedule. We email you a diff of pages that lost ranking signals or got new content gaps.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="m-url">Domain to monitor *</Label>
              <Input id="m-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://your-site.co.za" />
            </div>
            <div>
              <Label htmlFor="m-email">Email for reports *</Label>
              <Input id="m-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@agency.com" />
            </div>
            <div>
              <Label htmlFor="m-topic">Topic / niche</Label>
              <Input id="m-topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. solar geyser installation" />
            </div>
            <div>
              <Label htmlFor="m-audience">Audience</Label>
              <Input id="m-audience" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. homeowners in Gauteng" />
            </div>
            <div>
              <Label htmlFor="m-pages">Max pages per scan</Label>
              <Input
                id="m-pages"
                type="number"
                min={1}
                max={50}
                value={maxPages}
                onChange={(e) => setMaxPages(Math.max(1, Math.min(50, Number(e.target.value) || 15)))}
              />
            </div>
            <div>
              <Label htmlFor="m-freq">Frequency</Label>
              <select
                id="m-freq"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as "daily" | "weekly" | "monthly")}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={submit} disabled={create.isPending} className="gap-2">
              {create.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Radar className="h-4 w-4" />}
              Start monitoring
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Monitored sites</CardTitle>
          <CardDescription>
            {sites.length === 0
              ? "Nothing here yet. Add a site above to start tracking changes."
              : `${sites.length} site${sites.length === 1 ? "" : "s"} on a schedule.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sitesQ.isLoading && (
            <div className="text-sm text-muted-foreground py-8 text-center">Loading…</div>
          )}
          {sites.map((s) => (
            <SiteRow
              key={s.id}
              site={s}
              expanded={expandedReports === s.id}
              onToggle={() => setExpandedReports((cur) => (cur === s.id ? null : s.id))}
              onRun={() => runNow(s.id)}
              onRemove={() => remove(s.id)}
              isRunning={run.isPending && run.variables?.id === s.id}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

interface SiteRowProps {
  site: {
    id: number;
    url: string;
    domain: string;
    email: string;
    topic?: string | null;
    frequency: string;
    nextRunAt: string;
    lastRunAt?: string | null;
  };
  expanded: boolean;
  onToggle: () => void;
  onRun: () => void;
  onRemove: () => void;
  isRunning: boolean;
}

function SiteRow({ site, expanded, onToggle, onRun, onRemove, isRunning }: SiteRowProps) {
  const reportsQ = useListMonitorReports(site.id, {
    query: { enabled: expanded, queryKey: getListMonitorReportsQueryKey(site.id) },
  });
  const reports = reportsQ.data?.reports ?? [];

  return (
    <div className="rounded-lg border bg-background">
      <div className="p-4 flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate">{site.domain}</div>
          <div className="text-xs text-muted-foreground truncate">{site.url}</div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" /> {site.email}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {site.frequency}
            </span>
            <span>Next run: {new Date(site.nextRunAt).toLocaleString()}</span>
            {site.lastRunAt && <span>Last: {new Date(site.lastRunAt).toLocaleString()}</span>}
            {site.topic && <span className="text-purple-600">Topic: {site.topic}</span>}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button size="sm" variant="outline" onClick={onToggle} className="gap-1">
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            History
          </Button>
          <Button size="sm" onClick={onRun} disabled={isRunning} className="gap-1">
            {isRunning ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
            Run now
          </Button>
          <Button size="sm" variant="ghost" onClick={onRemove}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      {expanded && (
        <div className="border-t bg-muted/30 p-4 space-y-3">
          {reportsQ.isLoading && <div className="text-sm text-muted-foreground">Loading history…</div>}
          {!reportsQ.isLoading && reports.length === 0 && (
            <div className="text-sm text-muted-foreground">No reports yet. Click Run now to create the first one.</div>
          )}
          {reports.map((r) => (
            <ReportCard
              key={r.id}
              report={{
                id: r.id,
                summary: r.summary,
                pagesScanned: r.pagesScanned,
                regressionsCount: r.regressionsCount,
                newGapsCount: r.newGapsCount,
                emailedTo: r.emailedTo,
                createdAt: r.createdAt,
                diffs: r.diffs.map((d) => ({
                  url: d.url,
                  title: d.title,
                  status: d.status,
                  previousScore: d.previousScore ?? null,
                  currentScore: d.currentScore ?? null,
                  scoreDelta: d.scoreDelta,
                  currentGaps: d.currentGaps,
                  newGapQuestions: d.newGapQuestions,
                })),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ReportCardProps {
  report: {
    id: number;
    summary: string;
    pagesScanned: number;
    regressionsCount: number;
    newGapsCount: number;
    emailedTo?: string | null;
    createdAt: string;
    diffs: Array<{
      url: string;
      title: string;
      status: string;
      previousScore: number | null;
      currentScore: number | null;
      scoreDelta: number;
      currentGaps: number;
      newGapQuestions: string[];
    }>;
  };
}

function ReportCard({ report }: ReportCardProps) {
  const interesting = report.diffs
    .filter((d) => d.status !== "unchanged")
    .sort((a, b) => Math.abs(b.scoreDelta) - Math.abs(a.scoreDelta))
    .slice(0, 8);

  return (
    <div className="rounded-md border bg-background p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-muted-foreground">{new Date(report.createdAt).toLocaleString()}</div>
        <div className="flex gap-2 text-xs">
          <span className="px-2 py-0.5 rounded bg-slate-100">{report.pagesScanned} pages</span>
          {report.regressionsCount > 0 && (
            <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 flex items-center gap-1">
              <TrendingDown className="h-3 w-3" /> {report.regressionsCount}
            </span>
          )}
          {report.newGapsCount > 0 && (
            <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> {report.newGapsCount} gaps
            </span>
          )}
          {report.emailedTo && (
            <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 flex items-center gap-1">
              <Mail className="h-3 w-3" /> sent
            </span>
          )}
        </div>
      </div>
      <div className="text-sm mb-2">{report.summary}</div>
      {interesting.length > 0 && (
        <div className="space-y-1">
          {interesting.map((d, i) => (
            <div key={i} className="text-xs flex items-start gap-2 py-1 border-t first:border-t-0">
              <StatusBadge status={d.status} />
              <div className="flex-1 min-w-0">
                <div className="truncate font-medium">{d.title || d.url}</div>
                <div className="text-muted-foreground truncate">{d.url}</div>
                {d.newGapQuestions.length > 0 && (
                  <ul className="mt-1 ml-4 list-disc text-purple-700">
                    {d.newGapQuestions.slice(0, 3).map((q, j) => (
                      <li key={j}>{q}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="text-right shrink-0">
                {d.previousScore != null && d.currentScore != null && (
                  <div className="font-mono">
                    {d.previousScore}→{d.currentScore}{" "}
                    <span className={d.scoreDelta < 0 ? "text-red-600" : d.scoreDelta > 0 ? "text-green-600" : ""}>
                      ({d.scoreDelta > 0 ? "+" : ""}{d.scoreDelta})
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; icon?: React.ReactNode }> = {
    new: { color: "bg-blue-100 text-blue-700" },
    removed: { color: "bg-slate-200 text-slate-700" },
    regressed: { color: "bg-red-100 text-red-700", icon: <TrendingDown className="h-3 w-3" /> },
    improved: { color: "bg-green-100 text-green-700", icon: <TrendingUp className="h-3 w-3" /> },
    unchanged: { color: "bg-slate-100 text-slate-600" },
    error: { color: "bg-orange-100 text-orange-700" },
  };
  const cfg = map[status] || map.unchanged;
  return (
    <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] uppercase font-semibold flex items-center gap-1 ${cfg.color}`}>
      {cfg.icon}
      {status}
    </span>
  );
}
