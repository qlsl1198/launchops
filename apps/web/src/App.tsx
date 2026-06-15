import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Activity,
  Bell,
  CheckCircle2,
  Database,
  GitBranch,
  Plus,
  Radio,
  RefreshCw,
  ShieldCheck,
  Users
} from "lucide-react";

import { DataTable } from "./components/DataTable";
import { MetricCard } from "./components/MetricCard";
import {
  AccountHealth,
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
  UserProfile
} from "./lib/api";

type View = "overview" | "events" | "incidents" | "tasks" | "accounts" | "workspace" | "reliability";

const navItems: Array<{ id: View; label: string; icon: typeof Activity }> = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "events", label: "Live Events", icon: Radio },
  { id: "incidents", label: "Incidents", icon: Bell },
  { id: "tasks", label: "Automations", icon: GitBranch },
  { id: "accounts", label: "Accounts", icon: Database },
  { id: "workspace", label: "Workspace", icon: Users },
  { id: "reliability", label: "Reliability", icon: ShieldCheck }
];

const defaultEvent: EventInput = {
  projectKey: "demo",
  accountId: "acme",
  userId: "u_101",
  name: "checkout.completed",
  source: "web",
  severity: "info",
  durationMs: 220,
  properties: { plan: "pro" }
};

export function App() {
  const [view, setView] = useState<View>("overview");
  const [projectKey, setProjectKey] = useState("demo");
  const [projects, setProjects] = useState<Project[]>([]);
  const [memberships, setMemberships] = useState<ProjectMembership[]>([]);
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [tasks, setTasks] = useState<OpsTask[]>([]);
  const [accountHealth, setAccountHealth] = useState<AccountHealth[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState("Demo mode works even before the API is deployed.");
  const [user, setUser] = useState<UserProfile | null>(() => getStoredUser());
  const apiConfigured = Boolean(import.meta.env.VITE_API_URL);

  async function refresh() {
    setIsLoading(true);
    const [me, fallbackProjects, nextDashboard, nextEvents, nextIncidents, nextTasks, nextAccounts] = await Promise.all([
      getMe(),
      getProjects(),
      getDashboard(projectKey),
      getEvents(projectKey),
      getIncidents(projectKey),
      getTasks(projectKey),
      getAccountHealth(projectKey)
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
          setNotice("Signed in. Workspace data is synced from the API.");
          void refresh();
        }}
      />
    );
  }

  if (!dashboard) {
    return <div className="loading">Loading LaunchOps...</div>;
  }

  return (
    <main>
      <aside className="sidebar">
        <div className="brand">
          <div className="brandMark">L</div>
          <div>
            <strong>LaunchOps</strong>
            <span>Operations OS</span>
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
            <p>Product operations</p>
            <h1>{titleFor(view)}</h1>
            <span className="notice">
              {notice}
              {user ? ` Signed in as ${user.name}.` : ""}
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
              <RefreshCw size={16} /> Refresh
            </button>
            {user ? (
              <button
                type="button"
                onClick={() => {
                  logout();
                  setUser(null);
                }}
              >
                Sign out
              </button>
            ) : null}
          </div>
        </header>

        {isLoading ? <div className="loadingPanel">Refreshing workspace...</div> : null}

        {view === "overview" ? <Overview dashboard={dashboard} currentProject={currentProject} /> : null}
        {view === "events" ? (
          <EventsView
            events={events}
            projectKey={projectKey}
            onCreated={() => {
              setNotice("Event accepted. Dashboard data refreshed.");
              void refresh();
            }}
          />
        ) : null}
        {view === "incidents" ? (
          <IncidentsView
            incidents={incidents}
            projectKey={projectKey}
            onChanged={() => {
              setNotice("Incident workflow updated.");
              void refresh();
            }}
          />
        ) : null}
        {view === "tasks" ? (
          <TasksView
            tasks={tasks}
            projectKey={projectKey}
            onChanged={() => {
              setNotice("Task queue updated.");
              void refresh();
            }}
          />
        ) : null}
        {view === "accounts" ? <AccountsView accounts={accountHealth} /> : null}
        {view === "workspace" ? (
          <WorkspaceView
            memberships={memberships}
            projects={projects}
            onChanged={() => {
              setNotice("Workspace projects updated.");
              void refresh();
            }}
          />
        ) : null}
        {view === "reliability" ? <ReliabilityView dashboard={dashboard} incidents={incidents} /> : null}
      </section>
    </main>
  );
}

function AuthScreen({ onAuthenticated }: { onAuthenticated: (user: UserProfile) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("Demo Owner");
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
      setError(caught instanceof Error ? caught.message : "Authentication failed");
    }
  }

  return (
    <main className="authShell">
      <section className="authPanel">
        <div className="brand authBrand">
          <div className="brandMark">L</div>
          <div>
            <strong>LaunchOps</strong>
            <span>Operations OS</span>
          </div>
        </div>
        <h1>{mode === "login" ? "Sign in to your operations workspace." : "Create your LaunchOps workspace owner."}</h1>
        <form className="formPanel authForm" onSubmit={(event) => void submit(event)}>
          {mode === "register" ? (
            <Field label="Name" value={name} onChange={setName} />
          ) : null}
          <Field label="Email" value={email} onChange={setEmail} />
          <Field label="Password" type="password" value={password} onChange={setPassword} />
          {error ? <p className="formError">{error}</p> : null}
          <button type="submit">{mode === "login" ? "Sign in" : "Create account"}</button>
        </form>
        <button className="linkButton" type="button" onClick={() => setMode(mode === "login" ? "register" : "login")}>
          {mode === "login" ? "Need an account? Register" : "Already have an account? Sign in"}
        </button>
      </section>
    </main>
  );
}

function titleFor(view: View) {
  switch (view) {
    case "events":
      return "Ingest, inspect, and debug product events.";
    case "incidents":
      return "Create incidents and move them through response states.";
    case "tasks":
      return "Turn operational signals into accountable work.";
    case "accounts":
      return "Prioritize risky customers before they churn.";
    case "workspace":
      return "Manage projects and membership boundaries.";
    case "reliability":
      return "Track the reliability posture of the product.";
    default:
      return "Signal, incidents, and customer health in one workspace.";
  }
}

function Overview({ dashboard, currentProject }: { dashboard: DashboardSummary; currentProject?: Project }) {
  return (
    <>
      <section className="workspaceBanner">
        <div>
          <span>Workspace</span>
          <strong>{currentProject?.name ?? "LaunchOps Demo"}</strong>
        </div>
        <div>
          <span>Environment</span>
          <strong>{currentProject?.environment ?? "production"}</strong>
        </div>
        <div>
          <span>API key</span>
          <strong>{currentProject?.projectKey ?? "demo"}</strong>
        </div>
      </section>

      <section className="metricsGrid">
        {dashboard.metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="split">
        <DataTable title="Recent events" rows={normalizeRows(dashboard.recentEvents)} />
        <DataTable title="Account risk" rows={normalizeRows(dashboard.accountRisks)} />
      </section>

      <section className="split">
        <DataTable title="Incidents" rows={normalizeRows(dashboard.incidents)} />
        <DataTable title="Ops tasks" rows={normalizeRows(dashboard.tasks)} />
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

  useEffect(() => {
    setForm((current) => ({ ...current, projectKey }));
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
        <PanelTitle icon={Plus} title="Send event" />
        <Field label="Account ID" value={form.accountId} onChange={(value) => setForm({ ...form, accountId: value })} />
        <Field label="User ID" value={form.userId ?? ""} onChange={(value) => setForm({ ...form, userId: value })} />
        <Field label="Event name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
        <div className="formRow">
          <label>
            Source
            <input value={form.source} onChange={(event) => setForm({ ...form, source: event.target.value })} />
          </label>
          <label>
            Severity
            <select value={form.severity} onChange={(event) => setForm({ ...form, severity: event.target.value as EventSeverity })}>
              <option value="info">info</option>
              <option value="warning">warning</option>
              <option value="error">error</option>
              <option value="critical">critical</option>
            </select>
          </label>
        </div>
        <Field
          label="Duration ms"
          type="number"
          value={String(form.durationMs ?? 0)}
          onChange={(value) => setForm({ ...form, durationMs: Number(value) })}
        />
        <label>
          Properties JSON
          <textarea value={propertiesText} onChange={(event) => setPropertiesText(event.target.value)} />
        </label>
        <button type="submit">
          <Radio size={16} /> Ingest event
        </button>
      </form>

      <DataTable title="Event stream" rows={normalizeRows(events)} />
    </section>
  );
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
  const [form, setForm] = useState({ title: "", severity: "sev3", status: "open", owner: "you", impact: "" });

  async function submit(event: FormEvent) {
    event.preventDefault();
    await createIncident(projectKey, form);
    setForm({ title: "", severity: "sev3", status: "open", owner: "you", impact: "" });
    onChanged();
  }

  return (
    <section className="screenGrid">
      <form className="formPanel" onSubmit={(event) => void submit(event)}>
        <PanelTitle icon={Bell} title="Create incident" />
        <Field label="Title" value={form.title} onChange={(value) => setForm({ ...form, title: value })} />
        <div className="formRow">
          <Field label="Severity" value={form.severity} onChange={(value) => setForm({ ...form, severity: value })} />
          <Field label="Owner" value={form.owner} onChange={(value) => setForm({ ...form, owner: value })} />
        </div>
        <label>
          Impact
          <textarea value={form.impact} onChange={(event) => setForm({ ...form, impact: event.target.value })} />
        </label>
        <button type="submit">
          <Plus size={16} /> Create incident
        </button>
      </form>

      <section className="panel">
        <div className="panelHeader">
          <h2>Incident queue</h2>
        </div>
        <div className="cardList">
          {incidents.map((incident) => (
            <article className="workItem" key={incident.id ?? incident.title}>
              <div>
                <strong>{incident.title}</strong>
                <span>{incident.severity} · {incident.owner ?? "unassigned"}</span>
              </div>
              <p>{incident.impact || "No impact statement yet."}</p>
              {incident.id ? (
                <div className="segmented">
                  {["open", "investigating", "monitoring", "resolved"].map((status) => (
                    <button
                      className={incident.status === status ? "selected" : ""}
                      key={status}
                      onClick={() => void changeIncidentStatus(incident.id!, status).then(onChanged)}
                      type="button"
                    >
                      {status}
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
  const [form, setForm] = useState({ title: "", status: "todo", priority: "medium", assignee: "you" });

  async function submit(event: FormEvent) {
    event.preventDefault();
    await createTask(projectKey, form);
    setForm({ title: "", status: "todo", priority: "medium", assignee: "you" });
    onChanged();
  }

  return (
    <section className="screenGrid">
      <form className="formPanel" onSubmit={(event) => void submit(event)}>
        <PanelTitle icon={GitBranch} title="Create task" />
        <Field label="Title" value={form.title} onChange={(value) => setForm({ ...form, title: value })} />
        <div className="formRow">
          <Field label="Priority" value={form.priority} onChange={(value) => setForm({ ...form, priority: value })} />
          <Field label="Assignee" value={form.assignee} onChange={(value) => setForm({ ...form, assignee: value })} />
        </div>
        <button type="submit">
          <Plus size={16} /> Create task
        </button>
      </form>

      <section className="kanban">
        {["todo", "doing", "done"].map((status) => (
          <div className="kanbanColumn" key={status}>
            <h2>{status}</h2>
            {tasks.filter((task) => task.status === status).map((task) => (
              <article className="taskCard" key={task.id ?? task.title}>
                <strong>{task.title}</strong>
                <span>{task.priority} · {task.assignee ?? "unassigned"}</span>
                {task.id ? (
                  <button
                    type="button"
                    onClick={() => void changeTaskStatus(task.id!, status === "todo" ? "doing" : "done").then(onChanged)}
                  >
                    <CheckCircle2 size={15} /> Move
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
        <h2>Customer health</h2>
      </div>
      <div className="accountGrid">
        {accounts.map((account) => (
          <article className="accountCard" key={account.id}>
            <div>
              <strong>{account.accountId}</strong>
              <span>Risk {account.riskScore}</span>
            </div>
            <meter min="0" max="100" value={account.riskScore} />
            <p>{account.summary}</p>
            <small>{account.errorCount24h} errors · {account.eventCount24h} events · p95 {account.p95DurationMs ?? 0}ms</small>
          </article>
        ))}
      </div>
    </section>
  );
}

function WorkspaceView({
  memberships,
  projects,
  onChanged
}: {
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
        <PanelTitle icon={Users} title="Create project" />
        <Field label="Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
        <Field
          label="Project key"
          value={form.projectKey}
          onChange={(value) => setForm({ ...form, projectKey: value.toLowerCase().replaceAll(" ", "-") })}
        />
        <Field
          label="Environment"
          value={form.environment}
          onChange={(value) => setForm({ ...form, environment: value })}
        />
        <button type="submit">
          <Plus size={16} /> Create project
        </button>
      </form>

      <section className="panel">
        <div className="panelHeader">
          <h2>Memberships</h2>
        </div>
        <div className="cardList">
          {visibleMemberships.map((membership) => (
            <article className="workItem" key={membership.project.id}>
              <div>
                <strong>{membership.project.name}</strong>
                <span>{membership.project.projectKey} · {membership.project.environment}</span>
              </div>
              <p>Role: {membership.role}</p>
            </article>
          ))}
        </div>
      </section>
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
          <h2>Reliability checklist</h2>
        </div>
        <div className="checklist">
          <span><CheckCircle2 size={16} /> Actuator health endpoint configured</span>
          <span><CheckCircle2 size={16} /> PostgreSQL migrations handled by Flyway</span>
          <span><CheckCircle2 size={16} /> Incident queue has {incidents.length} records</span>
          <span><CheckCircle2 size={16} /> Frontend falls back to demo mode before deployment</span>
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
        normalized[key] = String(value);
      }
    });
    return normalized;
  });
}
