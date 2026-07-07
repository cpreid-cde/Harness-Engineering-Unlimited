import type { TicketStatus, TicketWithSignals } from "../../types/ticket";
import { RiskBadge } from "./RiskBadge";

type TicketListProps = {
  tickets: TicketWithSignals[];
  selectedId?: string;
  query: string;
  status?: TicketStatus;
  onSelect: (ticket: TicketWithSignals) => void;
};

function formatDue(minutes: number) {
  if (minutes < 0) {
    return `${Math.abs(minutes)}m overdue`;
  }
  if (minutes < 60) {
    return `${minutes}m left`;
  }
  return `${Math.round(minutes / 60)}h left`;
}

export function TicketList({ tickets, selectedId, query, status, onSelect }: TicketListProps) {
  if (tickets.length === 0) {
    return (
      <section className="empty-state" aria-live="polite">
        <h2>No tickets match this search</h2>
        <p>Try a customer name, ticket topic, or clear the search field to return to the queue.</p>
        {query ? <code>query: {query}</code> : null}
        {status ? <code>status: {status.replaceAll("_", " ")}</code> : null}
      </section>
    );
  }

  return (
    <div className="ticket-list" aria-label="Ticket queue">
      {tickets.map((ticket) => (
        <button
          key={ticket.id}
          className={`ticket-card ${selectedId === ticket.id ? "ticket-card--selected" : ""}`}
          type="button"
          onClick={() => onSelect(ticket)}
        >
          <span className="ticket-card__meta">
            {ticket.id} / {ticket.customer}
          </span>
          <strong>{ticket.title}</strong>
          <span className="ticket-card__row">
            <RiskBadge risk={ticket.slaRisk} />
            <span>{formatDue(ticket.minutesUntilDue)}</span>
          </span>
          <span className="ticket-card__row ticket-card__row--muted">
            <span>{ticket.assigneeName}</span>
            <span>{ticket.priority}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
