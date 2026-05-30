import { describe, expect, it } from "vitest";
import { calculateSlaRisk } from "../../src/service/ticketService";

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
