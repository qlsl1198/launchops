import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import type { DashboardMetric } from "../lib/api";

const toneClass = {
  good: "toneGood",
  warning: "toneWarning",
  danger: "toneDanger",
  neutral: "toneNeutral"
};

export function MetricCard({ metric }: { metric: DashboardMetric }) {
  const Icon = metric.tone === "danger" ? ArrowDownRight : metric.tone === "neutral" ? Minus : ArrowUpRight;

  return (
    <section className="metricCard">
      <div className="metricTop">
        <span>{metric.label}</span>
        <span className={toneClass[metric.tone]}>
          <Icon size={16} aria-hidden />
        </span>
      </div>
      <strong>{metric.value}</strong>
      <small>{metric.delta}</small>
    </section>
  );
}

