import { describe, expect, it } from "vitest";
import { createTicketRepository } from "../../src/repo/ticketRepo";
import { calculateSlaRisk, createTicketService } from "../../src/service/ticketService";
import type { TicketStatus } from "../../src/types/ticket";

const now = new Date("2026-05-27T12:00:00.000Z");

describe("calculateSlaRisk", () => {
  it("marks overdue tickets as breached", () => {
    expect(
      calculateSlaRisk(
        {
          dueAt: "2026-05-27T11:59:00.000Z",
          priority: "medium",
          sentiment: "neutral"
        },
        now
      )
    ).toBe("breached");
  });

  it("marks near-deadline tickets as at risk", () => {
    expect(
      calculateSlaRisk(
        {
          dueAt: "2026-05-27T13:30:00.000Z",
          priority: "low",
          sentiment: "positive"
        },
        now
      )
    ).toBe("at_risk");
  });

  it("marks high-priority negative-sentiment tickets as at risk", () => {
    expect(
      calculateSlaRisk(
        {
          dueAt: "2026-05-28T13:30:00.000Z",
          priority: "high",
          sentiment: "negative"
        },
        now
      )
    ).toBe("at_risk");
  });

  it("marks distant low-signal tickets as healthy", () => {
    expect(
      calculateSlaRisk(
        {
          dueAt: "2026-05-28T13:30:00.000Z",
          priority: "medium",
          sentiment: "neutral"
        },
        now
      )
    ).toBe("healthy");
  });
});

describe("searchTickets", () => {
  it.each([
    ["open", ["TCK-1049", "TCK-1051"]],
    ["investigating", ["TCK-1048"]],
    ["waiting_on_customer", ["TCK-1050"]],
    ["escalated", []],
    ["resolved", []]
  ] satisfies Array<[TicketStatus, string[]]>)("filters tickets by %s status", (status, expectedIds) => {
    const service = createTicketService(createTicketRepository());

    const result = service.searchTickets({ q: "", status });

    expect(result.status).toBe(status);
    expect(result.tickets.map((ticket) => ticket.id)).toEqual(expectedIds);
  });

  it("returns the full queue when the status filter is cleared", () => {
    const service = createTicketService(createTicketRepository());

    const result = service.searchTickets({ q: "" });

    expect(result.status).toBeUndefined();
    expect(result.total).toBe(4);
  });
});
