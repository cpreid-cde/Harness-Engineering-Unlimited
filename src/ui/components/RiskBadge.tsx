import type { SlaRisk } from "../../types/ticket";

const labels: Record<SlaRisk, string> = {
  healthy: "SLA healthy",
  at_risk: "SLA at risk",
  breached: "SLA breached"
};

export function RiskBadge({ risk }: { risk: SlaRisk }) {
  return <span className={`risk-badge risk-badge--${risk}`}>{labels[risk]}</span>;
}
