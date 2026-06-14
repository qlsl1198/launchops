export type DashboardMetric = {
  label: string;
  value: string;
  delta: string;
  tone: "good" | "warning" | "danger" | "neutral";
};

export type DashboardSummary = {
  metrics: DashboardMetric[];
  recentEvents: Array<Record<string, string | number>>;
  accountRisks: Array<Record<string, string | number>>;
  incidents: Array<Record<string, string | number>>;
  tasks: Array<Record<string, string | number>>;
};

const demoDashboard: DashboardSummary = {
  metrics: [
    { label: "Events 24h", value: "18,420", delta: "+12.4% vs yesterday", tone: "good" },
    { label: "Error rate", value: "1.8%", delta: "below alert threshold", tone: "good" },
    { label: "Avg latency", value: "246ms", delta: "p95 stable", tone: "neutral" },
    { label: "Open incidents", value: "2", delta: "1 needs owner", tone: "warning" }
  ],
  recentEvents: [
    { name: "checkout.completed", account_id: "acme", severity: "info", source: "server", occurred_at: "now" },
    { name: "billing.webhook_failed", account_id: "orbit", severity: "error", source: "stripe", occurred_at: "3m ago" },
    { name: "search.timeout", account_id: "northstar", severity: "warning", source: "api", occurred_at: "9m ago" }
  ],
  accountRisks: [
    { account_id: "orbit", risk_score: 78, errors: 14, summary: "Webhook failures affecting invoices." },
    { account_id: "northstar", risk_score: 61, errors: 6, summary: "Search latency increased after deploy." },
    { account_id: "acme", risk_score: 22, errors: 1, summary: "Healthy usage with minor warnings." }
  ],
  incidents: [
    { title: "Billing webhooks retry storm", status: "investigating", severity: "sev2", owner: "backend" },
    { title: "Search p95 latency elevated", status: "monitoring", severity: "sev3", owner: "platform" }
  ],
  tasks: [
    { title: "Add idempotency key to billing worker", status: "todo", priority: "high", assignee: "you" },
    { title: "Publish customer-facing status update", status: "doing", priority: "medium", assignee: "ops" },
    { title: "Backfill account health rollups", status: "done", priority: "low", assignee: "worker" }
  ]
};

export async function getDashboard(projectKey = "demo"): Promise<DashboardSummary> {
  const baseUrl = import.meta.env.VITE_API_URL;
  if (!baseUrl) return demoDashboard;

  try {
    const response = await fetch(`${baseUrl}/v1/projects/${projectKey}/dashboard`);
    if (!response.ok) return demoDashboard;
    return (await response.json()) as DashboardSummary;
  } catch {
    return demoDashboard;
  }
}

