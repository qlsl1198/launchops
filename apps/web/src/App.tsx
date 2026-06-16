import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Activity,
  Bell,
  CheckCircle2,
  Database,
  GitBranch,
  Home,
  MessageCircle,
  Plus,
  Radio,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Users
} from "lucide-react";

import { DataTable } from "./components/DataTable";
import { MetricCard } from "./components/MetricCard";
import {
  AccountHealth,
  AuditLog,
  changeIncidentStatus,
  changeTaskStatus,
  createEvent,
  createIncident,
  createProject,
  createTask,
  DashboardSummary,
  EventInput,
  EventRecord,
  EventSeverity,
  getAccountHealth,
  getAuditLogs,
  getAccessToken,
  getDashboard,
  getEvents,
  getIncidents,
  getMe,
  getProjects,
  getStoredUser,
  getTasks,
  Incident,
  login,
  logout,
  OpsTask,
  Project,
  ProjectMembership,
  register,
  streamEvents,
  UserProfile
} from "./lib/api";

type View = "overview" | "events" | "incidents" | "tasks" | "accounts" | "workspace" | "reliability";

const navItems: Array<{ id: View; label: string; icon: typeof Activity }> = [
  { id: "overview", label: "개요", icon: Activity },
  { id: "events", label: "실시간 이벤트", icon: Radio },
  { id: "incidents", label: "장애 관리", icon: Bell },
  { id: "tasks", label: "자동화", icon: GitBranch },
  { id: "accounts", label: "고객 상태", icon: Database },
  { id: "workspace", label: "워크스페이스", icon: Users },
  { id: "reliability", label: "안정성", icon: ShieldCheck }
];

const defaultEvent: EventInput = {
  projectKey: "demo",
  accountId: "acme",
  userId: "u_101",
  name: "결제 완료",
  source: "web",
  severity: "info",
  durationMs: 220,
  properties: { plan: "pro" }
};

export function App() {
  const [mode, setMode] = useState<"user" | "admin">("user");
  const [view, setView] = useState<View>("overview");
  const [projectKey, setProjectKey] = useState("demo");
  const [projects, setProjects] = useState<Project[]>([]);
  const [memberships, setMemberships] = useState<ProjectMembership[]>([]);
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [tasks, setTasks] = useState<OpsTask[]>([]);
  const [accountHealth, setAccountHealth] = useState<AccountHealth[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState("API 배포 전에도 데모 모드로 화면을 확인할 수 있습니다.");
  const [user, setUser] = useState<UserProfile | null>(() => getStoredUser());
  const apiConfigured = Boolean(import.meta.env.VITE_API_URL);

  async function refresh() {
    setIsLoading(true);
    const [me, fallbackProjects, nextDashboard, nextEvents, nextIncidents, nextTasks, nextAccounts, nextAuditLogs] = await Promise.all([
      getMe(),
      getProjects(),
      getDashboard(projectKey),
      getEvents(projectKey),
      getIncidents(projectKey),
      getTasks(projectKey),
      getAccountHealth(projectKey),
      getAuditLogs(projectKey)
    ]);
    const memberProjects = me?.memberships.map((membership) => membership.project) ?? [];
    setUser(me?.user ?? user);
    setMemberships(me?.memberships ?? []);
    setProjects(memberProjects.length ? memberProjects : fallbackProjects);
    setDashboard(nextDashboard);
    setEvents(nextEvents);
    setIncidents(nextIncidents);
    setTasks(nextTasks);
    setAccountHealth(nextAccounts);
    setAuditLogs(nextAuditLogs);
    setIsLoading(false);
  }

  useEffect(() => {
    if (apiConfigured && !getAccessToken()) {
      setIsLoading(false);
      return;
    }
    void refresh();
  }, [projectKey]);

  const currentProject = useMemo(
    () => projects.find((project) => project.projectKey === projectKey) ?? projects[0],
    [projectKey, projects]
  );

  if (apiConfigured && !user) {
    return (
      <AuthScreen
        onAuthenticated={(nextUser) => {
          setUser(nextUser);
          setNotice("로그인되었습니다. 워크스페이스 데이터를 API에서 동기화합니다.");
          void refresh();
        }}
      />
    );
  }

  if (!dashboard) {
    return <div className="loading">LaunchOps를 불러오는 중입니다...</div>;
  }

  if (mode === "user") {
    return (
      <UserPortal
        dashboard={dashboard}
        incidents={incidents}
        tasks={tasks}
        accountHealth={accountHealth}
        currentProject={currentProject}
        onOpenAdmin={() => setMode("admin")}
      />
    );
  }

  return (
    <main>
      <aside className="sidebar">
        <div className="brand">
          <div className="brandMark">L</div>
          <div>
            <strong>LaunchOps</strong>
            <span>운영 콘솔</span>
          </div>
        </div>
        <nav>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={view === item.id ? "active" : ""}
                key={item.id}
                onClick={() => setView(item.id)}
                type="button"
              >
                <Icon size={18} /> {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p>제품 운영</p>
            <button className="modeButton" type="button" onClick={() => setMode("user")}>
              <Home size={16} /> 사용자 앱으로
            </button>
            <h1>{titleFor(view)}</h1>
            <span className="notice">
              {notice}
              {user ? ` ${user.name}님으로 로그인됨.` : ""}
            </span>
          </div>
          <div className="topActions">
            <select value={projectKey} onChange={(event) => setProjectKey(event.target.value)}>
              {(projects.length ? projects : [{ projectKey: "demo", name: "LaunchOps Demo" }]).map((project) => (
                <option key={project.projectKey} value={project.projectKey}>
                  {project.name}
                </option>
              ))}
            </select>
            <button type="button" onClick={() => void refresh()}>
              <RefreshCw size={16} /> 새로고침
            </button>
            {user ? (
              <button
                type="button"
                onClick={() => {
                  logout();
                  setUser(null);
                }}
              >
                로그아웃
              </button>
            ) : null}
          </div>
        </header>

        {isLoading ? <div className="loadingPanel">워크스페이스를 새로고침하는 중입니다...</div> : null}

        {view === "overview" ? <Overview dashboard={dashboard} currentProject={currentProject} /> : null}
        {view === "events" ? (
          <EventsView
            events={events}
            projectKey={projectKey}
            onCreated={() => {
              setNotice("이벤트가 수집되었습니다. 대시보드 데이터를 새로고침했습니다.");
              void refresh();
            }}
          />
        ) : null}
        {view === "incidents" ? (
          <IncidentsView
            incidents={incidents}
            projectKey={projectKey}
            onChanged={() => {
              setNotice("장애 처리 흐름이 업데이트되었습니다.");
              void refresh();
            }}
          />
        ) : null}
        {view === "tasks" ? (
          <TasksView
            tasks={tasks}
            projectKey={projectKey}
            onChanged={() => {
              setNotice("작업 큐가 업데이트되었습니다.");
              void refresh();
            }}
          />
        ) : null}
        {view === "accounts" ? <AccountsView accounts={accountHealth} /> : null}
        {view === "workspace" ? (
          <WorkspaceView
            auditLogs={auditLogs}
            memberships={memberships}
            projects={projects}
            onChanged={() => {
              setNotice("워크스페이스 프로젝트가 업데이트되었습니다.");
              void refresh();
            }}
          />
        ) : null}
        {view === "reliability" ? <ReliabilityView dashboard={dashboard} incidents={incidents} /> : null}
      </section>
    </main>
  );
}

function UserPortal({
  dashboard,
  incidents,
  tasks,
  accountHealth,
  currentProject,
  onOpenAdmin
}: {
  dashboard: DashboardSummary;
  incidents: Incident[];
  tasks: OpsTask[];
  accountHealth: AccountHealth[];
  currentProject?: Project;
  onOpenAdmin: () => void;
}) {
  const openIncidents = incidents.filter((incident) => incident.status !== "resolved").length;
  const nextTask = tasks.find((task) => task.status !== "done");
  const riskiestAccount = accountHealth[0];

  return (
    <main className="userAppShell">
      <header className="userTopbar">
        <div className="brand">
          <div className="brandMark">L</div>
          <div>
            <strong>LaunchOps</strong>
            <span>사용자 앱</span>
          </div>
        </div>
        <button type="button" onClick={onOpenAdmin}>
          <ShieldCheck size={16} /> 운영 콘솔
        </button>
      </header>

      <section className="userHero">
        <div>
          <p>내 서비스 상태</p>
          <h1>{currentProject?.name ?? "LaunchOps Demo"}의 오늘 상태를 한눈에 확인하세요.</h1>
          <span>장애 알림, 고객 영향도, 해야 할 일을 모바일 앱처럼 빠르게 확인하는 사용자 화면입니다.</span>
        </div>
        <div className="phoneMock">
          <div className="phoneHeader">
            <Smartphone size={18} />
            <strong>오늘의 요약</strong>
          </div>
          <div className="phoneMetric">
            <span>열린 장애</span>
            <strong>{openIncidents}</strong>
          </div>
          <div className="phoneMetric">
            <span>다음 작업</span>
            <strong>{nextTask?.title ?? "대기 중인 작업 없음"}</strong>
          </div>
        </div>
      </section>

      <section className="userQuickGrid">
        {dashboard.metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="userContentGrid">
        <article className="userPanel">
          <div className="userPanelHeader">
            <MessageCircle size={18} />
            <h2>알림 피드</h2>
          </div>
          {incidents.slice(0, 3).map((incident) => (
            <div className="feedItem" key={incident.id ?? incident.title}>
              <strong>{incident.title}</strong>
              <span>{koValue(incident.severity)} · {koValue(incident.status)} · {incident.owner ?? "담당자 미정"}</span>
              <p>{incident.impact || "영향도 설명이 아직 없습니다."}</p>
            </div>
          ))}
        </article>

        <article className="userPanel">
          <div className="userPanelHeader">
            <CheckCircle2 size={18} />
            <h2>내 할 일</h2>
          </div>
          {tasks.slice(0, 4).map((task) => (
            <div className="feedItem" key={task.id ?? task.title}>
              <strong>{task.title}</strong>
              <span>{koValue(task.priority)} · {koValue(task.status)} · {task.assignee ?? "담당자 미정"}</span>
            </div>
          ))}
        </article>

        <article className="userPanel userPanelWide">
          <div className="userPanelHeader">
            <Database size={18} />
            <h2>고객 영향도</h2>
          </div>
          <div className="impactSummary">
            <strong>{riskiestAccount?.accountId ?? "orbit"}</strong>
            <span>가장 높은 리스크 점수 {riskiestAccount?.riskScore ?? 78}</span>
            <p>{riskiestAccount?.summary ?? "웹훅 실패로 청구서 전달이 지연되고 있습니다."}</p>
          </div>
        </article>
      </section>
    </main>
  );
}

function AuthScreen({ onAuthenticated }: { onAuthenticated: (user: UserProfile) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("데모 관리자");
  const [email, setEmail] = useState("owner@launchops.dev");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const response =
        mode === "login"
          ? await login({ email, password })
          : await register({ name, email, password });
      onAuthenticated(response.user);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "인증에 실패했습니다.");
    }
  }

  return (
    <main className="authShell">
      <section className="authPanel">
        <div className="brand authBrand">
          <div className="brandMark">L</div>
          <div>
            <strong>LaunchOps</strong>
            <span>운영 콘솔</span>
          </div>
        </div>
        <h1>{mode === "login" ? "워크스페이스에 로그인하세요." : "LaunchOps 워크스페이스 관리자를 만드세요."}</h1>
        <form className="formPanel authForm" onSubmit={(event) => void submit(event)}>
          {mode === "register" ? (
            <Field label="이름" value={name} onChange={setName} />
          ) : null}
          <Field label="이메일" value={email} onChange={setEmail} />
          <Field label="비밀번호" type="password" value={password} onChange={setPassword} />
          {error ? <p className="formError">{error}</p> : null}
          <button type="submit">{mode === "login" ? "로그인" : "계정 만들기"}</button>
        </form>
        <button className="linkButton" type="button" onClick={() => setMode(mode === "login" ? "register" : "login")}>
          {mode === "login" ? "계정이 없나요? 회원가입" : "이미 계정이 있나요? 로그인"}
        </button>
      </section>
    </main>
  );
}

function titleFor(view: View) {
  switch (view) {
    case "events":
      return "제품 이벤트를 수집하고 확인하세요.";
    case "incidents":
      return "장애를 만들고 처리 상태를 관리하세요.";
    case "tasks":
      return "운영 신호를 담당 가능한 작업으로 전환하세요.";
    case "accounts":
      return "위험 고객을 먼저 확인하고 이탈을 예방하세요.";
    case "workspace":
      return "프로젝트와 멤버십 경계를 관리하세요.";
    case "reliability":
      return "서비스 안정성 상태를 추적하세요.";
    default:
      return "신호, 장애, 고객 상태를 한 워크스페이스에서 확인하세요.";
  }
}

function Overview({ dashboard, currentProject }: { dashboard: DashboardSummary; currentProject?: Project }) {
  return (
    <>
      <section className="workspaceBanner">
        <div>
          <span>워크스페이스</span>
          <strong>{currentProject?.name ?? "LaunchOps Demo"}</strong>
        </div>
        <div>
          <span>환경</span>
          <strong>{koValue(currentProject?.environment ?? "production")}</strong>
        </div>
        <div>
          <span>API 키</span>
          <strong>{currentProject?.projectKey ?? "demo"}</strong>
        </div>
      </section>

      <section className="metricsGrid">
        {dashboard.metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="split">
        <DataTable title="최근 이벤트" rows={normalizeRows(dashboard.recentEvents)} />
        <DataTable title="고객 리스크" rows={normalizeRows(dashboard.accountRisks)} />
      </section>

      <section className="split">
        <DataTable title="장애" rows={normalizeRows(dashboard.incidents)} />
        <DataTable title="운영 작업" rows={normalizeRows(dashboard.tasks)} />
      </section>
    </>
  );
}

function EventsView({
  events,
  projectKey,
  onCreated
}: {
  events: EventRecord[];
  projectKey: string;
  onCreated: () => void;
}) {
  const [form, setForm] = useState<EventInput>({ ...defaultEvent, projectKey });
  const [propertiesText, setPropertiesText] = useState('{"plan":"pro"}');
  const [liveEvents, setLiveEvents] = useState<EventRecord[]>(events);
  const [streamStatus, setStreamStatus] = useState<"demo" | "connecting" | "connected" | "disconnected">("demo");
  const [receivedCount, setReceivedCount] = useState(0);

  useEffect(() => {
    setForm((current) => ({ ...current, projectKey }));
  }, [projectKey]);

  useEffect(() => {
    setLiveEvents(events);
  }, [events]);

  useEffect(() => {
    if (!import.meta.env.VITE_API_URL || !getAccessToken()) {
      setStreamStatus("demo");
      return;
    }

    const controller = new AbortController();
    setStreamStatus("connecting");
    void streamEvents(
      projectKey,
      (event) => {
        setLiveEvents((current) => [event, ...current.filter((item) => item.id !== event.id)].slice(0, 100));
        setReceivedCount((count) => count + 1);
        setStreamStatus("connected");
      },
      controller.signal,
      () => setStreamStatus("connected")
    )
      .then(() => {
        if (!controller.signal.aborted) {
          setStreamStatus("disconnected");
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setStreamStatus("disconnected");
        }
      });

    return () => controller.abort();
  }, [projectKey]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const properties = JSON.parse(propertiesText || "{}") as Record<string, unknown>;
    await createEvent({ ...form, properties });
    onCreated();
  }

  return (
    <section className="screenGrid">
      <form className="formPanel" onSubmit={(event) => void submit(event)}>
        <PanelTitle icon={Plus} title="이벤트 보내기" />
        <Field label="고객 ID" value={form.accountId} onChange={(value) => setForm({ ...form, accountId: value })} />
        <Field label="사용자 ID" value={form.userId ?? ""} onChange={(value) => setForm({ ...form, userId: value })} />
        <Field label="이벤트 이름" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
        <div className="formRow">
          <label>
            출처
            <input value={form.source} onChange={(event) => setForm({ ...form, source: event.target.value })} />
          </label>
          <label>
            심각도
            <select value={form.severity} onChange={(event) => setForm({ ...form, severity: event.target.value as EventSeverity })}>
              <option value="info">정보</option>
              <option value="warning">경고</option>
              <option value="error">오류</option>
              <option value="critical">치명</option>
            </select>
          </label>
        </div>
        <Field
          label="소요 시간(ms)"
          type="number"
          value={String(form.durationMs ?? 0)}
          onChange={(value) => setForm({ ...form, durationMs: Number(value) })}
        />
        <label>
          속성 JSON
          <textarea value={propertiesText} onChange={(event) => setPropertiesText(event.target.value)} />
        </label>
        <button type="submit">
          <Radio size={16} /> 이벤트 수집
        </button>
      </form>

      <div className="streamColumn">
        <section className="streamStatusPanel">
          <div>
            <span>실시간 연결</span>
            <strong>{streamStatusLabel(streamStatus)}</strong>
          </div>
          <div>
            <span>수신 이벤트</span>
            <strong>{receivedCount}건</strong>
          </div>
        </section>
        <DataTable title="이벤트 스트림" rows={normalizeRows(liveEvents)} />
      </div>
    </section>
  );
}

function streamStatusLabel(status: "demo" | "connecting" | "connected" | "disconnected") {
  switch (status) {
    case "connected":
      return "연결됨";
    case "connecting":
      return "연결 중";
    case "disconnected":
      return "연결 끊김";
    default:
      return "데모 모드";
  }
}

function IncidentsView({
  incidents,
  projectKey,
  onChanged
}: {
  incidents: Incident[];
  projectKey: string;
  onChanged: () => void;
}) {
  const [form, setForm] = useState({ title: "", severity: "sev3", status: "open", owner: "나", impact: "" });

  async function submit(event: FormEvent) {
    event.preventDefault();
    await createIncident(projectKey, form);
    setForm({ title: "", severity: "sev3", status: "open", owner: "나", impact: "" });
    onChanged();
  }

  return (
    <section className="screenGrid">
      <form className="formPanel" onSubmit={(event) => void submit(event)}>
        <PanelTitle icon={Bell} title="장애 만들기" />
        <Field label="제목" value={form.title} onChange={(value) => setForm({ ...form, title: value })} />
        <div className="formRow">
          <Field label="심각도" value={form.severity} onChange={(value) => setForm({ ...form, severity: value })} />
          <Field label="담당자" value={form.owner} onChange={(value) => setForm({ ...form, owner: value })} />
        </div>
        <label>
          영향도
          <textarea value={form.impact} onChange={(event) => setForm({ ...form, impact: event.target.value })} />
        </label>
        <button type="submit">
          <Plus size={16} /> 장애 만들기
        </button>
      </form>

      <section className="panel">
        <div className="panelHeader">
          <h2>장애 큐</h2>
        </div>
        <div className="cardList">
          {incidents.map((incident) => (
            <article className="workItem" key={incident.id ?? incident.title}>
              <div>
                <strong>{incident.title}</strong>
                <span>{koValue(incident.severity)} · {incident.owner ?? "담당자 미정"}</span>
              </div>
              <p>{incident.impact || "영향도 설명이 아직 없습니다."}</p>
              {incident.id ? (
                <div className="segmented">
                  {["open", "investigating", "monitoring", "resolved"].map((status) => (
                    <button
                      className={incident.status === status ? "selected" : ""}
                      key={status}
                      onClick={() => void changeIncidentStatus(incident.id!, status).then(onChanged)}
                      type="button"
                    >
                      {koValue(status)}
                    </button>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

function TasksView({ tasks, projectKey, onChanged }: { tasks: OpsTask[]; projectKey: string; onChanged: () => void }) {
  const [form, setForm] = useState({ title: "", status: "todo", priority: "medium", assignee: "나" });

  async function submit(event: FormEvent) {
    event.preventDefault();
    await createTask(projectKey, form);
    setForm({ title: "", status: "todo", priority: "medium", assignee: "나" });
    onChanged();
  }

  return (
    <section className="screenGrid">
      <form className="formPanel" onSubmit={(event) => void submit(event)}>
        <PanelTitle icon={GitBranch} title="작업 만들기" />
        <Field label="제목" value={form.title} onChange={(value) => setForm({ ...form, title: value })} />
        <div className="formRow">
          <Field label="우선순위" value={form.priority} onChange={(value) => setForm({ ...form, priority: value })} />
          <Field label="담당자" value={form.assignee} onChange={(value) => setForm({ ...form, assignee: value })} />
        </div>
        <button type="submit">
          <Plus size={16} /> 작업 만들기
        </button>
      </form>

      <section className="kanban">
        {["todo", "doing", "done"].map((status) => (
          <div className="kanbanColumn" key={status}>
            <h2>{koValue(status)}</h2>
            {tasks.filter((task) => task.status === status).map((task) => (
              <article className="taskCard" key={task.id ?? task.title}>
                <strong>{task.title}</strong>
                <span>{koValue(task.priority)} · {task.assignee ?? "담당자 미정"}</span>
                {task.id ? (
                  <button
                    type="button"
                    onClick={() => void changeTaskStatus(task.id!, status === "todo" ? "doing" : "done").then(onChanged)}
                  >
                    <CheckCircle2 size={15} /> 이동
                  </button>
                ) : null}
              </article>
            ))}
          </div>
        ))}
      </section>
    </section>
  );
}

function AccountsView({ accounts }: { accounts: AccountHealth[] }) {
  return (
    <section className="panel">
      <div className="panelHeader">
        <h2>고객 상태</h2>
      </div>
      <div className="accountGrid">
        {accounts.map((account) => (
          <article className="accountCard" key={account.id}>
            <div>
              <strong>{account.accountId}</strong>
              <span>리스크 {account.riskScore}</span>
            </div>
            <meter min="0" max="100" value={account.riskScore} />
            <p>{account.summary}</p>
            <small>오류 {account.errorCount24h}건 · 이벤트 {account.eventCount24h}건 · p95 {account.p95DurationMs ?? 0}ms</small>
          </article>
        ))}
      </div>
    </section>
  );
}

function WorkspaceView({
  auditLogs,
  memberships,
  projects,
  onChanged
}: {
  auditLogs: AuditLog[];
  memberships: ProjectMembership[];
  projects: Project[];
  onChanged: () => void;
}) {
  const [form, setForm] = useState({ name: "", projectKey: "", environment: "production" });

  async function submit(event: FormEvent) {
    event.preventDefault();
    await createProject(form);
    setForm({ name: "", projectKey: "", environment: "production" });
    onChanged();
  }

  const visibleMemberships = memberships.length
    ? memberships
    : projects.map((project) => ({ project, role: "demo" }));

  return (
    <section className="screenGrid">
      <form className="formPanel" onSubmit={(event) => void submit(event)}>
        <PanelTitle icon={Users} title="프로젝트 만들기" />
        <Field label="이름" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
        <Field
          label="프로젝트 키"
          value={form.projectKey}
          onChange={(value) => setForm({ ...form, projectKey: value.toLowerCase().replaceAll(" ", "-") })}
        />
        <Field
          label="환경"
          value={form.environment}
          onChange={(value) => setForm({ ...form, environment: value })}
        />
        <button type="submit">
          <Plus size={16} /> 프로젝트 만들기
        </button>
      </form>

      <div className="streamColumn">
        <section className="panel">
          <div className="panelHeader">
            <h2>멤버십</h2>
          </div>
          <div className="cardList">
            {visibleMemberships.map((membership) => (
              <article className="workItem" key={membership.project.id}>
                <div>
                  <strong>{membership.project.name}</strong>
                  <span>{membership.project.projectKey} · {koValue(membership.project.environment)}</span>
                </div>
                <p>역할: {koValue(membership.role)}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panelHeader">
            <h2>활동 피드</h2>
          </div>
          <div className="cardList">
            {auditLogs.map((log) => (
              <article className="workItem auditItem" key={log.id}>
                <div>
                  <strong>{log.message}</strong>
                  <span>{koValue(log.action)} · {log.actorEmail}</span>
                </div>
                <p>{formatAuditDetails(log.details)}</p>
                <small>{formatDateTime(log.createdAt)}</small>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

function ReliabilityView({ dashboard, incidents }: { dashboard: DashboardSummary; incidents: Incident[] }) {
  return (
    <>
      <section className="metricsGrid">
        {dashboard.metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>
      <section className="panel">
        <div className="panelHeader">
          <h2>안정성 체크리스트</h2>
        </div>
        <div className="checklist">
          <span><CheckCircle2 size={16} /> Actuator 헬스 체크 엔드포인트 구성 완료</span>
          <span><CheckCircle2 size={16} /> PostgreSQL 마이그레이션은 Flyway로 관리</span>
          <span><CheckCircle2 size={16} /> 장애 큐에 {incidents.length}건 기록됨</span>
          <span><CheckCircle2 size={16} /> 배포 전에도 프론트는 데모 모드로 동작</span>
        </div>
      </section>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text"
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label>
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function PanelTitle({ icon: Icon, title }: { icon: typeof Plus; title: string }) {
  return (
    <div className="formTitle">
      <Icon size={18} />
      <h2>{title}</h2>
    </div>
  );
}

function normalizeRows(rows: Array<Record<string, unknown>>) {
  return rows.map((row) => {
    const normalized: Record<string, string | number> = {};
    Object.entries(row).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        normalized[key] = "-";
      } else if (typeof value === "object") {
        normalized[key] = JSON.stringify(value);
      } else if (typeof value === "number") {
        normalized[key] = value;
      } else {
        normalized[key] = koValue(String(value));
      }
    });
    return normalized;
  });
}

function formatAuditDetails(details?: Record<string, unknown>) {
  if (!details || !Object.keys(details).length) {
    return "상세 정보 없음";
  }

  return Object.entries(details)
    .map(([key, value]) => `${koValue(key)}: ${koValue(String(value))}`)
    .join(" · ");
}

function formatDateTime(value?: string) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function koValue(value: string) {
  const dictionary: Record<string, string> = {
    info: "정보",
    warning: "경고",
    error: "오류",
    critical: "치명",
    open: "열림",
    investigating: "조사 중",
    monitoring: "모니터링",
    resolved: "해결",
    todo: "할 일",
    doing: "진행 중",
    done: "완료",
    high: "높음",
    medium: "보통",
    low: "낮음",
    server: "서버",
    stripe: "스트라이프",
    title: "제목",
    status: "상태",
    priority: "우선순위",
    name: "이름",
    severity: "심각도",
    accountId: "고객 ID",
    "event.ingested": "이벤트 수집",
    "incident.created": "장애 생성",
    "incident.updated": "장애 수정",
    "incident.status_changed": "장애 상태 변경",
    "task.created": "작업 생성",
    "task.updated": "작업 수정",
    "task.status_changed": "작업 상태 변경",
    api: "API",
    web: "웹",
    production: "운영",
    OWNER: "소유자",
    MEMBER: "멤버",
    demo: "데모"
  };
  return dictionary[value] ?? value;
}
