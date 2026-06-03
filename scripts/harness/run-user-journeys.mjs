#!/usr/bin/env node
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:5173";
const stepTimeoutMs = Number.parseInt(process.env.JOURNEY_STEP_TIMEOUT_MS ?? "10000", 10);
const launchOptions = process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {};
const screenshotDir = process.env.HARNESS_SCREENSHOT_DIR ?? join(process.cwd(), "test-results", "harness-screenshots");

function formatError(error) {
  return error instanceof Error ? error.message : String(error);
}

function urlFor(path) {
  return new URL(path, baseUrl).toString();
}

async function runStep(label, action) {
  console.log(`[journey] ${label}`);
  try {
    await action();
  } catch (error) {
    throw new Error(`${label} failed: ${formatError(error)}`);
  }
}

async function saveScreenshot(page, name) {
  await mkdir(screenshotDir, { recursive: true });
  const path = join(screenshotDir, name);
  await page.screenshot({ path, fullPage: true });
  console.log(`[journey] Playwright screenshot saved ${path}`);
}

async function main() {
  if (Number.isNaN(stepTimeoutMs) || stepTimeoutMs <= 0) {
    throw new Error("JOURNEY_STEP_TIMEOUT_MS must be a positive number.");
  }

  let browser;

  try {
    await runStep(`Check app health at ${urlFor("/api/health")}`, async () => {
      const response = await fetch(urlFor("/api/health"), {
        signal: AbortSignal.timeout(stepTimeoutMs)
      });
      if (!response.ok) {
        throw new Error(`received HTTP ${response.status}`);
      }
    });

    await runStep("Launch browser", async () => {
      browser = await chromium.launch(launchOptions);
    });

    const page = await browser.newPage();
    page.setDefaultTimeout(stepTimeoutMs);
    page.setDefaultNavigationTimeout(stepTimeoutMs);

    await runStep(`Open ${baseUrl}`, async () => {
      await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
      await page.getByLabel("Search tickets").waitFor();
    });

    await runStep("Verify empty ticket search state", async () => {
      await page.getByLabel("Search tickets").fill("no-match-demo-query");
      await page.getByRole("heading", { name: "No tickets match this search" }).waitFor();
      await saveScreenshot(page, "ticket-search-empty-state.png");
    });

    await runStep("Verify matching ticket search state", async () => {
      await page.getByLabel("Search tickets").fill("webhook");
      await page.getByRole("heading", { name: "Webhook retries delayed for enterprise workspace" }).waitFor();
      await saveScreenshot(page, "ticket-search-matching-result.png");
    });

    await runStep("Verify ticket escalation", async () => {
      await page.getByLabel("Search tickets").fill("search");
      await page.getByRole("heading", { name: "Search empty state copy regression" }).waitFor();
      await page.getByLabel("Escalation note").fill("Journey verified customer impact and owner handoff.");
      await page.getByRole("button", { name: "Escalate ticket" }).click();
      await page.getByText("Escalated: Journey verified customer impact and owner handoff.").waitFor();
      await saveScreenshot(page, "ticket-search-escalated-ticket.png");
    });

    console.log(`Journey passed against ${baseUrl}.`);
  } finally {
    await browser?.close();
  }
}

main().catch((error) => {
  console.error("Journey failed.");
  console.error(formatError(error));
  if (error.message.includes("Executable doesn't exist")) {
    console.error("Install Playwright browsers with `npx playwright install chromium`, or set PLAYWRIGHT_CHANNEL=chrome when Chrome is installed.");
  } else if (error.message.includes("/api/health") || error.message.includes("fetch failed")) {
    console.error("Start the app with `npm run dev`, or set BASE_URL to a running instance.");
  } else {
    console.error(`Increase JOURNEY_STEP_TIMEOUT_MS if the app is expected to take longer than ${stepTimeoutMs}ms per step.`);
  }
  process.exit(1);
});
