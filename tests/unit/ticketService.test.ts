import { describe, expect, it } from "vitest";
import { createTicketRepository } from "../../src/repo/ticketRepo";
import { calculateSlaRisk, createTicketService, ticketsToCsv } from "../../src/service/ticketService";

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

describe("ticket CSV export", () => {
  it("exports search results with deterministic headers and active query filtering", () => {
    const service = createTicketService(createTicketRepository());

    const result = service.exportTicketsCsv({ q: "webhook" });

    expect(result.total).toBe(1);
    expect(result.csv).toContain("ticket id,title,customer,status,priority,owner\n");
    expect(result.csv).toContain(
      "TCK-1048,Webhook retries delayed for enterprise workspace,Northstar Health,investigating,urgent,Sam Rivera\n"
    );
  });

  it("exports only the header row for an empty result set", () => {
    const service = createTicketService(createTicketRepository());

    expect(service.exportTicketsCsv({ q: "no-match" }).csv).toBe("ticket id,title,customer,status,priority,owner\n");
  });

  it("escapes CSV values containing commas, quotes, or line breaks", () => {
    const csv = ticketsToCsv([
      {
        id: "TCK-1",
        title: "Broken, quoted \"field\"",
        customer: "Acme\nNorth",
        description: "example",
        status: "open",
        priority: "high",
        sentiment: "neutral",
        assigneeId: "a-1",
        createdAt: "2026-06-03T00:00:00.000Z",
        dueAt: "2026-06-03T01:00:00.000Z",
        updatedAt: "2026-06-03T00:10:00.000Z",
        tags: [],
        assigneeName: "Owner, One",
        slaRisk: "healthy",
        minutesUntilDue: 60
      }
    ]);

    expect(csv).toContain('"Broken, quoted ""field"""');
    expect(csv).toContain('"Acme\nNorth"');
    expect(csv).toContain('"Owner, One"');
  });
});
