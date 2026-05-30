import { expect, test } from "@playwright/test";

test("ticket search shows SLA badges and an empty state", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "agentic-supportdesk" })).toBeVisible();
  await expect(page.getByText(/SLA (healthy|at risk|breached)/).first()).toBeVisible();

  await page.getByLabel("Search tickets").fill("no-match-demo-query");

  await expect(page.getByRole("heading", { name: "No tickets match this search" })).toBeVisible();
  await expect(page.getByText("query: no-match-demo-query")).toBeVisible();
});

test("ticket escalation workflow updates visible state", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Escalation note").fill("Customer impact confirmed; route to platform owner.");
  await page.getByRole("button", { name: "Escalate ticket" }).click();

  await expect(page.getByText("Escalated: Customer impact confirmed; route to platform owner.")).toBeVisible();
  await expect(page.getByText("escalated").first()).toBeVisible();
});
