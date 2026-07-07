import { useEffect, useMemo, useState } from "react";
import type { Assignee, SavedTicketFilter, TicketWithSignals } from "../types/ticket";
import { AssigneeQueue } from "./components/AssigneeQueue";
import { ObservabilityStrip } from "./components/ObservabilityStrip";
import { TicketDetail } from "./components/TicketDetail";
import { TicketList } from "./components/TicketList";
import {
  createSavedTicketFilter,
  escalateTicket,
  fetchAssignees,
  fetchSavedTicketFilters,
  fetchTickets,
  restoreSavedTicketFilter
} from "./lib/api";

export function App() {
  const [query, setQuery] = useState("");
  const [tickets, setTickets] = useState<TicketWithSignals[]>([]);
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [savedFilters, setSavedFilters] = useState<SavedTicketFilter[]>([]);
  const [filterName, setFilterName] = useState("");
  const [savingFilter, setSavingFilter] = useState(false);
  const [savedFiltersLoading, setSavedFiltersLoading] = useState(true);
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

  useEffect(() => {
    fetchSavedTicketFilters()
      .then((result) => setSavedFilters(result.filters))
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setSavedFiltersLoading(false));
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

  async function handleSaveFilter() {
    if (!filterName.trim()) {
      return;
    }
    setSavingFilter(true);
    try {
      const filter = await createSavedTicketFilter(filterName, query);
      setSavedFilters((current) => [filter, ...current]);
      setFilterName("");
      setError(undefined);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Saved filter failed");
    } finally {
      setSavingFilter(false);
    }
  }

  async function handleRestoreFilter(id: string) {
    try {
      const filter = await restoreSavedTicketFilter(id);
      setQuery(filter.query);
      setError(undefined);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Saved filter restore failed");
    }
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
            <div className="saved-filter-form">
              <label htmlFor="saved-filter-name">Saved filter name</label>
              <input
                id="saved-filter-name"
                value={filterName}
                onChange={(event) => setFilterName(event.target.value)}
                placeholder="Queue name"
              />
              <button type="button" onClick={handleSaveFilter} disabled={savingFilter || !filterName.trim()}>
                {savingFilter ? "Saving..." : "Save filter"}
              </button>
            </div>
            <div className="saved-filter-list" aria-label="Saved ticket filters">
              {savedFiltersLoading ? <p>Loading saved filters...</p> : null}
              {!savedFiltersLoading && savedFilters.length === 0 ? <p>No saved filters yet.</p> : null}
              {savedFilters.map((filter) => (
                <button key={filter.id} type="button" onClick={() => handleRestoreFilter(filter.id)}>
                  <span>{filter.name}</span>
                  <small>{filter.query || "Full queue"}</small>
                </button>
              ))}
            </div>
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
