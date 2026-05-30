#!/usr/bin/env node
import { existsSync } from "node:fs";
import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:5173";
const localChromeAvailable = existsSync("/Applications/Google Chrome.app");
const launchOptions = process.env.PLAYWRIGHT_CHANNEL
  ? { channel: process.env.PLAYWRIGHT_CHANNEL }
  : localChromeAvailable
    ? { channel: "chrome" }
    : {};

async function main() {
  const browser = await chromium.launch(launchOptions);
  const page = await browser.newPage();

  try {
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.getByLabel("Search tickets").fill("no-match-demo-query");
    await page.getByRole("heading", { name: "No tickets match this search" }).waitFor();
    await page.getByLabel("Search tickets").fill("webhook");
    await page.getByText("Webhook retries delayed").waitFor();
    await page.getByLabel("Escalation note").fill("Journey verified customer impact and owner handoff.");
    await page.getByRole("button", { name: "Escalate ticket" }).click();
    await page.getByText("Escalated: Journey verified customer impact and owner handoff.").waitFor();
    console.log(`Journey passed against ${baseUrl}.`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error("Journey failed.");
  console.error(error.message);
  if (error.message.includes("Executable doesn't exist")) {
    console.error("Install Playwright browsers with `npx playwright install chromium`, or set PLAYWRIGHT_CHANNEL=chrome when Chrome is installed.");
  } else {
    console.error("Start the app with `npm run dev`, or set BASE_URL to a running instance.");
  }
  process.exit(1);
});
