import { expect, test } from "@playwright/test";

type TicketSearchApiResponse = {
  query: string;
  total: number;
  tickets: Array<{
    id: string;
    title: string;
    customer: string;
    status: string;
    assigneeName: string;
    slaRisk: string;
    minutesUntilDue: number;
    tags: string[];
  }>;
};

test.describe("ticket search", () => {
  test("returns matching ticket results from the API", async ({ request }) => {
    const response = await request.get("/api/tickets", {
      params: {
        journey: "ticket-search",
        q: "webhook"
      }
    });
    const responseBody = await response.text();

    expect(response.status(), responseBody).toBe(200);

    const result = JSON.parse(responseBody) as TicketSearchApiResponse;
    expect(result.query).toBe("webhook");
    expect(result.total).toBe(1);
    expect(result.tickets).toHaveLength(1);
    expect(result.tickets[0]).toMatchObject({
      id: "TCK-1048",
      title: "Webhook retries delayed for enterprise workspace",
      customer: "Northstar Health",
      assigneeName: "Sam Rivera",
      slaRisk: "at_risk",
      tags: expect.arrayContaining(["webhooks", "payments", "enterprise"])
    });
    expect(result.tickets[0].minutesUntilDue).toEqual(expect.any(Number));
  });

  test("filters the visible queue by status and clears the filter", async ({ page }) => {
    await page.goto("/");

    await page.getByLabel("Status filter").selectOption("open");

    await expect(page.getByRole("button", { name: /TCK-1049/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /TCK-1051/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /TCK-1048/ })).toBeHidden();

    await page.getByLabel("Status filter").selectOption("");

    await expect(page.getByRole("button", { name: /TCK-1048/ })).toBeVisible();
  });
});

test.describe("ticket escalation", () => {
  test("updates the selected ticket after escalation", async ({ page }) => {
    await page.goto("/");

    await page.getByLabel("Escalation note").fill("Customer impact confirmed; route to platform owner.");
    await page.getByRole("button", { name: "Escalate ticket" }).click();

    await expect(page.getByText("Escalated: Customer impact confirmed; route to platform owner.")).toBeVisible();
    await expect(page.getByLabel("Ticket detail").locator("dd").filter({ hasText: "escalated" })).toBeVisible();
  });
});
