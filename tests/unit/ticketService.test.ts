import { describe, expect, it } from "vitest";
import { createTicketRepository } from "../../src/repo/ticketRepo";
import { calculateSlaRisk, createTicketService } from "../../src/service/ticketService";

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

describe("saved ticket filters", () => {
  it("creates and lists saved ticket filters with query state", () => {
    const service = createTicketService(createTicketRepository());

    const saved = service.createSavedTicketFilter({ name: "Webhook queue", q: "webhook" });

    expect(saved).toMatchObject({ name: "Webhook queue", query: "webhook" });
    expect(saved.id).toEqual(expect.any(String));
    expect(service.listSavedTicketFilters()).toEqual([saved]);
  });

  it("returns a saved filter by id for restore", () => {
    const service = createTicketService(createTicketRepository());
    const saved = service.createSavedTicketFilter({ name: "Full queue", q: "" });

    expect(service.getSavedTicketFilter(saved.id)).toEqual(saved);
    expect(service.getSavedTicketFilter("missing")).toBeUndefined();
  });
});
