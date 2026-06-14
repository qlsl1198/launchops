import { useEffect, useState } from "react";
import { Activity, Bell, Database, GitBranch, Radio, ShieldCheck } from "lucide-react";

import { DataTable } from "./components/DataTable";
import { MetricCard } from "./components/MetricCard";
import { DashboardSummary, getDashboard } from "./lib/api";

export function App() {
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    void getDashboard().then(setDashboard);
  }, []);

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
          <a className="active" href="#"><Activity size={18} /> Overview</a>
          <a href="#"><Radio size={18} /> Live Events</a>
          <a href="#"><Bell size={18} /> Incidents</a>
          <a href="#"><Database size={18} /> Accounts</a>
          <a href="#"><GitBranch size={18} /> Automations</a>
          <a href="#"><ShieldCheck size={18} /> Reliability</a>
        </nav>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p>Product operations</p>
            <h1>Signal, incidents, and customer health in one workspace.</h1>
          </div>
          <button type="button">Create incident</button>
        </header>

        <section className="metricsGrid">
          {dashboard.metrics.map((metric) => (
            <MetricCard key={metric.label} metric={metric} />
          ))}
        </section>

        <section className="split">
          <DataTable title="Recent events" rows={dashboard.recentEvents} />
          <DataTable title="Account risk" rows={dashboard.accountRisks} />
        </section>

        <section className="split">
          <DataTable title="Incidents" rows={dashboard.incidents} />
          <DataTable title="Ops tasks" rows={dashboard.tasks} />
        </section>
      </section>
    </main>
  );
}

