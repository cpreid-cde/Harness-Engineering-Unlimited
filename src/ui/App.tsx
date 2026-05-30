import { useEffect, useMemo, useState } from "react";
import type { Assignee, TicketWithSignals } from "../types/ticket";
import { AssigneeQueue } from "./components/AssigneeQueue";
import { ObservabilityStrip } from "./components/ObservabilityStrip";
import { TicketDetail } from "./components/TicketDetail";
import { TicketList } from "./components/TicketList";
import { escalateTicket, fetchAssignees, fetchTickets } from "./lib/api";

export function App() {
  const [query, setQuery] = useState("");
  const [tickets, setTickets] = useState<TicketWithSignals[]>([]);
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [escalationNote, setEscalationNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchTickets(query)
      .then((result) => {
        if (cancelled) {
          return;
        }
        setTickets(result.tickets);
        setSelectedId((current) => {
          if (result.tickets.some((ticket) => ticket.id === current)) {
            return current;
          }
          return result.tickets[0]?.id;
        });
        setError(undefined);
      })
      .catch((reason: Error) => setError(reason.message))
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  useEffect(() => {
    fetchAssignees()
      .then((result) => setAssignees(result.assignees))
      .catch((reason: Error) => setError(reason.message));
  }, []);

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedId) ?? tickets[0],
    [selectedId, tickets]
  );

  async function handleEscalate() {
    if (!selectedTicket) {
      return;
    }
    const updated = await escalateTicket(selectedTicket.id, escalationNote);
    setTickets((current) => current.map((ticket) => (ticket.id === updated.id ? updated : ticket)));
    setEscalationNote("");
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <h1>agentic-supportdesk</h1>
          <p>Support tickets instrumented for Codex-visible feedback loops.</p>
        </div>
        <div className="status-pill">SQLite / Express / React / Harness</div>
      </header>

      <ObservabilityStrip />

      <section className="workspace">
        <div className="left-pane">
          <div className="search-row">
            <label htmlFor="ticket-search">Search tickets</label>
            <input
              id="ticket-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Customer, title, or tag"
            />
          </div>
          {loading ? <p className="notice">Loading queue...</p> : null}
          {error ? <p className="notice notice--error">{error}</p> : null}
          {!loading && !error ? (
            <TicketList
              tickets={tickets}
              selectedId={selectedTicket?.id}
              query={query}
              onSelect={(ticket) => setSelectedId(ticket.id)}
            />
          ) : null}
        </div>

        <TicketDetail
          ticket={selectedTicket}
          escalationNote={escalationNote}
          onEscalationNote={setEscalationNote}
          onEscalate={handleEscalate}
        />

        <AssigneeQueue assignees={assignees} />
      </section>
    </main>
  );
}
