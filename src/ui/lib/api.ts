import type { Assignee, TicketSearchResult, TicketWithSignals } from "../../types/ticket";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function fetchTickets(query: string) {
  const params = new URLSearchParams({ journey: "ticket-search" });
  if (query.trim()) {
    params.set("q", query.trim());
  }
  return request<TicketSearchResult>(`/api/tickets?${params}`);
}

export function fetchAssignees() {
  return request<{ assignees: Assignee[] }>("/api/assignees");
}

export function escalateTicket(id: string, note: string) {
  return request<TicketWithSignals>(`/api/tickets/${id}/escalate`, {
    method: "POST",
    body: JSON.stringify({ note })
  });
}
