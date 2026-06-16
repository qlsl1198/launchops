export type Tone = "good" | "warning" | "danger" | "neutral";

export type DashboardMetric = {
  label: string;
  value: string;
  delta: string;
  tone: Tone;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type AuthResponse = {
  accessToken: string;
  tokenType: "Bearer";
  user: UserProfile;
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

export type ProjectMembership = {
  project: Project;
  role: string;
};

export type MeResponse = {
  user: UserProfile;
  memberships: ProjectMembership[];
};

export type ProjectInput = {
  name: string;
  projectKey: string;
  environment: string;
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

export type AuditLog = {
  id: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId?: string;
  message: string;
  details?: Record<string, unknown>;
  createdAt: string;
};

const API_URL = import.meta.env.VITE_API_URL || "";
const TOKEN_KEY = "launchops.accessToken";
const USER_KEY = "launchops.user";

const demoDashboard: DashboardSummary = {
  metrics: [
    { label: "24시간 이벤트", value: "18,420", delta: "어제보다 +12.4%", tone: "good" },
    { label: "오류율", value: "1.8%", delta: "알림 기준 이하", tone: "good" },
    { label: "평균 지연", value: "246ms", delta: "p95 안정적", tone: "neutral" },
    { label: "열린 장애", value: "2", delta: "1건 담당자 필요", tone: "warning" }
  ],
  recentEvents: [
    { name: "결제 완료", account_id: "acme", severity: "info", source: "server", occurred_at: "방금 전" },
    { name: "결제 웹훅 실패", account_id: "orbit", severity: "error", source: "stripe", occurred_at: "3분 전" },
    { name: "검색 시간 초과", account_id: "northstar", severity: "warning", source: "api", occurred_at: "9분 전" }
  ],
  accountRisks: [
    { account_id: "orbit", risk_score: 78, errors: 14, summary: "웹훅 실패로 청구서 전달이 지연되고 있습니다." },
    { account_id: "northstar", risk_score: 61, errors: 6, summary: "배포 이후 검색 지연 시간이 증가했습니다." },
    { account_id: "acme", risk_score: 22, errors: 1, summary: "사용량은 정상이며 경고가 소량 발생했습니다." }
  ],
  incidents: [
    { id: "inc_1", title: "결제 웹훅 재시도 급증", status: "investigating", severity: "sev2", owner: "백엔드", impact: "일부 청구서 발송이 지연됩니다." },
    { id: "inc_2", title: "검색 p95 지연 증가", status: "monitoring", severity: "sev3", owner: "플랫폼", impact: "검색 응답이 평소보다 느립니다." }
  ],
  tasks: [
    { id: "task_1", title: "결제 워커에 멱등성 키 추가", status: "todo", priority: "high", assignee: "나" },
    { id: "task_2", title: "고객 공지용 상태 업데이트 발행", status: "doing", priority: "medium", assignee: "운영" },
    { id: "task_3", title: "고객 상태 집계 데이터 보정", status: "done", priority: "low", assignee: "워커" }
  ]
};

const demoProjects: Project[] = [
  {
    id: "demo",
    name: "LaunchOps Demo",
    projectKey: "demo",
    environment: "운영",
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
    summary: "웹훅 실패로 청구서 전달이 지연되고 있습니다.",
    updatedAt: new Date().toISOString()
  },
  {
    id: "northstar",
    accountId: "northstar",
    eventCount24h: 61,
    errorCount24h: 6,
    p95DurationMs: 920,
    riskScore: 61,
    summary: "최근 배포 이후 검색 지연 시간이 증가했습니다.",
    updatedAt: new Date().toISOString()
  }
];

const demoAuditLogs: AuditLog[] = [
  {
    id: "audit_1",
    actorEmail: "demo@launchops.kr",
    action: "incident.status_changed",
    targetType: "incident",
    targetId: "inc_1",
    message: "장애 상태가 변경되었습니다.",
    details: { title: "결제 웹훅 재시도 급증", status: "monitoring" },
    createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString()
  },
  {
    id: "audit_2",
    actorEmail: "demo@launchops.kr",
    action: "task.created",
    targetType: "task",
    targetId: "task_4",
    message: "운영 작업이 생성되었습니다.",
    details: { title: "VIP 고객 영향도 확인", priority: "high" },
    createdAt: new Date(Date.now() - 1000 * 60 * 9).toISOString()
  },
  {
    id: "audit_3",
    actorEmail: "demo@launchops.kr",
    action: "event.ingested",
    targetType: "product_event",
    targetId: "evt_1",
    message: "제품 이벤트가 수집되었습니다.",
    details: { name: "결제 웹훅 실패", severity: "error", accountId: "orbit" },
    createdAt: new Date(Date.now() - 1000 * 60 * 14).toISOString()
  }
];

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  if (!API_URL) {
    throw new Error("API URL is not configured");
  }

  const token = getAccessToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers
    }
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): UserProfile | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function persistAuth(response: AuthResponse) {
  localStorage.setItem(TOKEN_KEY, response.accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(response.user));
  return response;
}

export async function register(payload: { name: string; email: string; password: string }) {
  return persistAuth(
    await request<AuthResponse>("/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    })
  );
}

export async function login(payload: { email: string; password: string }) {
  return persistAuth(
    await request<AuthResponse>("/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    })
  );
}

export async function getProjects(): Promise<Project[]> {
  try {
    return await request<Project[]>("/v1/projects");
  } catch {
    return demoProjects;
  }
}

export async function getMe(): Promise<MeResponse | null> {
  try {
    return await request<MeResponse>("/v1/me");
  } catch {
    return null;
  }
}

export async function createProject(payload: ProjectInput): Promise<Project> {
  return request<Project>("/v1/projects", {
    method: "POST",
    body: JSON.stringify(payload)
  });
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

export async function streamEvents(
  projectKey: string,
  onEvent: (event: EventRecord) => void,
  signal: AbortSignal,
  onConnected?: () => void
) {
  if (!API_URL) {
    throw new Error("API URL is not configured");
  }

  const token = getAccessToken();
  if (!token) {
    throw new Error("로그인이 필요합니다.");
  }

  const response = await fetch(`${API_URL}/v1/events/stream?projectKey=${encodeURIComponent(projectKey)}`, {
    headers: {
      Accept: "text/event-stream",
      Authorization: `Bearer ${token}`
    },
    signal
  });

  if (!response.ok || !response.body) {
    throw new Error(`실시간 이벤트 연결 실패: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (!signal.aborted) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      let boundary = buffer.indexOf("\n\n");

      while (boundary >= 0) {
        const rawMessage = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        boundary = buffer.indexOf("\n\n");

        const lines = rawMessage.replaceAll("\r\n", "\n").split("\n");
        const eventName = lines.find((line) => line.startsWith("event:"))?.slice(6).trim();
        const data = lines
          .filter((line) => line.startsWith("data:"))
          .map((line) => line.slice(5).trim())
          .join("\n");

        if (eventName === "connected") {
          onConnected?.();
        }

        if (eventName === "product-event" && data) {
          onEvent(JSON.parse(data) as EventRecord);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
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

export async function getAuditLogs(projectKey = "demo"): Promise<AuditLog[]> {
  try {
    return await request<AuditLog[]>(`/v1/audit-logs?projectKey=${projectKey}&limit=50`);
  } catch {
    return demoAuditLogs;
  }
}
