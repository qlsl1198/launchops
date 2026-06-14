export type Tone = "good" | "warning" | "danger" | "neutral";

export type DashboardMetric = {
  label: string;
  value: string;
  delta: string;
  tone: Tone;
};

export type DashboardSummary = {
  metrics: DashboardMetric[];
  recentEvents: EventRecord[];
  accountRisks: AccountRiskRow[];
  incidents: Incident[];
  tasks: OpsTask[];
};

export type Project = {
  id: string;
  name: string;
  projectKey: string;
  environment: string;
  createdAt: string;
};

export type EventSeverity = "info" | "warning" | "error" | "critical";

export type EventRecord = {
  id?: string;
  accountId?: string;
  account_id?: string;
  userId?: string;
  name: string;
  source: string;
  severity: EventSeverity;
  durationMs?: number;
  duration_ms?: number;
  properties?: Record<string, unknown>;
  occurredAt?: string;
  occurred_at?: string;
};

export type EventInput = {
  projectKey: string;
  accountId: string;
  userId?: string;
  name: string;
  source: string;
  severity: EventSeverity;
  durationMs?: number;
  properties: Record<string, unknown>;
};

export type Incident = {
  id?: string;
  title: string;
  status: string;
  severity: string;
  owner?: string;
  impact?: string;
  createdAt?: string;
};

export type IncidentInput = {
  title: string;
  status: string;
  severity: string;
  owner?: string;
  impact?: string;
};

export type OpsTask = {
  id?: string;
  incidentId?: string;
  title: string;
  status: string;
  priority: string;
  assignee?: string;
  createdAt?: string;
};

export type TaskInput = {
  incidentId?: string;
  title: string;
  status: string;
  priority: string;
  assignee?: string;
};

export type AccountHealth = {
  id: string;
  accountId: string;
  eventCount24h: number;
  errorCount24h: number;
  p95DurationMs?: number;
  riskScore: number;
  summary: string;
  updatedAt: string;
};

export type AccountRiskRow = {
  account_id?: string;
  accountId?: string;
  risk_score?: number;
  riskScore?: number;
  errors?: number;
  summary: string;
};

const API_URL = import.meta.env.VITE_API_URL || "";

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
    { id: "inc_1", title: "Billing webhooks retry storm", status: "investigating", severity: "sev2", owner: "backend", impact: "Invoices delayed." },
    { id: "inc_2", title: "Search p95 latency elevated", status: "monitoring", severity: "sev3", owner: "platform", impact: "Search is slower." }
  ],
  tasks: [
    { id: "task_1", title: "Add idempotency key to billing worker", status: "todo", priority: "high", assignee: "you" },
    { id: "task_2", title: "Publish customer-facing status update", status: "doing", priority: "medium", assignee: "ops" },
    { id: "task_3", title: "Backfill account health rollups", status: "done", priority: "low", assignee: "worker" }
  ]
};

const demoProjects: Project[] = [
  {
    id: "demo",
    name: "LaunchOps Demo",
    projectKey: "demo",
    environment: "production",
    createdAt: new Date().toISOString()
  }
];

const demoAccountHealth: AccountHealth[] = [
  {
    id: "orbit",
    accountId: "orbit",
    eventCount24h: 82,
    errorCount24h: 14,
    p95DurationMs: 1330,
    riskScore: 78,
    summary: "Webhook failures are affecting invoice delivery.",
    updatedAt: new Date().toISOString()
  },
  {
    id: "northstar",
    accountId: "northstar",
    eventCount24h: 61,
    errorCount24h: 6,
    p95DurationMs: 920,
    riskScore: 61,
    summary: "Search latency increased after the latest deploy.",
    updatedAt: new Date().toISOString()
  }
];

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  if (!API_URL) {
    throw new Error("API URL is not configured");
  }

  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers
    },
    ...options
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function getProjects(): Promise<Project[]> {
  try {
    return await request<Project[]>("/v1/projects");
  } catch {
    return demoProjects;
  }
}

export async function getDashboard(projectKey = "demo"): Promise<DashboardSummary> {
  try {
    return await request<DashboardSummary>(`/v1/projects/${projectKey}/dashboard`);
  } catch {
    return demoDashboard;
  }
}

export async function getEvents(projectKey = "demo"): Promise<EventRecord[]> {
  try {
    return await request<EventRecord[]>(`/v1/events?projectKey=${projectKey}&limit=100`);
  } catch {
    return demoDashboard.recentEvents;
  }
}

export async function createEvent(payload: EventInput): Promise<{ id: string; accepted: boolean }> {
  return request("/v1/events", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function getIncidents(projectKey = "demo"): Promise<Incident[]> {
  try {
    return await request<Incident[]>(`/v1/incidents?projectKey=${projectKey}`);
  } catch {
    return demoDashboard.incidents;
  }
}

export async function createIncident(projectKey: string, payload: IncidentInput): Promise<Incident> {
  return request(`/v1/incidents?projectKey=${projectKey}`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function changeIncidentStatus(id: string, status: string): Promise<Incident> {
  return request(`/v1/incidents/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });
}

export async function getTasks(projectKey = "demo"): Promise<OpsTask[]> {
  try {
    return await request<OpsTask[]>(`/v1/tasks?projectKey=${projectKey}`);
  } catch {
    return demoDashboard.tasks;
  }
}

export async function createTask(projectKey: string, payload: TaskInput): Promise<OpsTask> {
  return request(`/v1/tasks?projectKey=${projectKey}`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function changeTaskStatus(id: string, status: string): Promise<OpsTask> {
  return request(`/v1/tasks/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });
}

export async function getAccountHealth(projectKey = "demo"): Promise<AccountHealth[]> {
  try {
    return await request<AccountHealth[]>(`/v1/accounts/health?projectKey=${projectKey}`);
  } catch {
    return demoAccountHealth;
  }
}

