import type { TicketWithSignals } from "../../types/ticket";
import { RiskBadge } from "./RiskBadge";

type TicketDetailProps = {
  ticket?: TicketWithSignals;
  escalationNote: string;
  onEscalationNote: (value: string) => void;
  onEscalate: () => void;
};

export function TicketDetail({ ticket, escalationNote, onEscalationNote, onEscalate }: TicketDetailProps) {
  if (!ticket) {
    return (
      <section className="detail detail--empty">
        <h2>Select a ticket</h2>
        <p>The detail pane shows customer context, SLA risk, and the escalation workflow.</p>
      </section>
    );
  }

  return (
    <section className="detail" aria-label="Ticket detail">
      <div className="detail__header">
        <div>
          <span className="eyebrow">{ticket.id}</span>
          <h2>{ticket.title}</h2>
        </div>
        <RiskBadge risk={ticket.slaRisk} />
      </div>

      <dl className="signal-grid">
        <div>
          <dt>Customer</dt>
          <dd>{ticket.customer}</dd>
        </div>
        <div>
          <dt>Assignee</dt>
          <dd>{ticket.assigneeName}</dd>
        </div>
        <div>
          <dt>Sentiment</dt>
          <dd>{ticket.sentiment}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{ticket.status.replaceAll("_", " ")}</dd>
        </div>
      </dl>

      <p className="description">{ticket.description}</p>

      <div className="tag-row">
        {ticket.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>

      <form className="escalation" onSubmit={(event) => event.preventDefault()}>
        <label htmlFor="escalation-note">Escalation note</label>
        <textarea
          id="escalation-note"
          value={escalationNote}
          onChange={(event) => onEscalationNote(event.target.value)}
          placeholder="Summarize customer impact and next owner."
        />
        <button type="button" onClick={onEscalate} disabled={escalationNote.trim().length < 8}>
          Escalate ticket
        </button>
        {ticket.escalationNote ? <p className="confirmation">Escalated: {ticket.escalationNote}</p> : null}
      </form>
    </section>
  );
}
