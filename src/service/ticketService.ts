import { randomUUID } from "node:crypto";
import type { TicketRepository } from "../repo/ticketRepo";
import type { Assignee, SavedTicketFilter, SlaRisk, Ticket, TicketSearchResult, TicketWithSignals } from "../types/ticket";
import type { EscalationInput, SavedTicketFilterInput, TicketSearchQuery } from "../schemas/ticketSchema";

export function calculateSlaRisk(ticket: Pick<Ticket, "dueAt" | "priority" | "sentiment">, now = new Date()): SlaRisk {
  const minutesUntilDue = Math.round((new Date(ticket.dueAt).getTime() - now.getTime()) / 60_000);

  if (minutesUntilDue < 0) {
    return "breached";
  }

  if (minutesUntilDue <= 120) {
    return "at_risk";
  }

  if ((ticket.priority === "urgent" || ticket.priority === "high") && ticket.sentiment === "negative") {
    return "at_risk";
  }

  return "healthy";
}

function withSignals(ticket: Ticket, assignee: Assignee | undefined, now = new Date()): TicketWithSignals {
  return {
    ...ticket,
    assigneeName: assignee?.name ?? "Unassigned",
    slaRisk: calculateSlaRisk(ticket, now),
    minutesUntilDue: Math.round((new Date(ticket.dueAt).getTime() - now.getTime()) / 60_000)
  };
}

export type TicketService = {
  searchTickets(query: TicketSearchQuery): TicketSearchResult;
  getTicket(id: string): TicketWithSignals | undefined;
  listAssignees(): Assignee[];
  listSavedTicketFilters(): SavedTicketFilter[];
  getSavedTicketFilter(id: string): SavedTicketFilter | undefined;
  createSavedTicketFilter(input: SavedTicketFilterInput): SavedTicketFilter;
  escalateTicket(id: string, input: EscalationInput): TicketWithSignals | undefined;
};

export function createTicketService(repo: TicketRepository): TicketService {
  return {
    searchTickets(query) {
      const tickets = repo
        .listTickets({ query: query.q, status: query.status, assigneeId: query.assigneeId })
        .map((ticket) => withSignals(ticket, repo.getAssignee(ticket.assigneeId)));

      return {
        tickets,
        total: tickets.length,
        query: query.q ?? ""
      };
    },

    getTicket(id) {
      const ticket = repo.getTicket(id);
      return ticket ? withSignals(ticket, repo.getAssignee(ticket.assigneeId)) : undefined;
    },

    listAssignees() {
      return repo.listAssignees();
    },

    listSavedTicketFilters() {
      return repo.listSavedTicketFilters();
    },

    getSavedTicketFilter(id) {
      return repo.getSavedTicketFilter(id);
    },

    createSavedTicketFilter(input) {
      const now = new Date().toISOString();
      return repo.createSavedTicketFilter({
        id: randomUUID(),
        name: input.name,
        query: input.q ?? "",
        status: input.status,
        assigneeId: input.assigneeId,
        createdAt: now,
        updatedAt: now
      });
    },

    escalateTicket(id, input) {
      const ticket = repo.getTicket(id);
      if (!ticket) {
        return undefined;
      }

      const updated = repo.updateTicket({
        ...ticket,
        status: "escalated",
        escalationNote: input.note,
        updatedAt: new Date().toISOString()
      });

      return withSignals(updated, repo.getAssignee(updated.assigneeId));
    }
  };
}
