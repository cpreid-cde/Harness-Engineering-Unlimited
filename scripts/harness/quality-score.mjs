#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const checks = [
  {
    name: "repo map and architecture docs",
    points: 15,
    run: () => existsSync("AGENTS.md") && existsSync("docs/ARCHITECTURE.md") && existsSync("docs/QUALITY.md")
  },
  {
    name: "exec plans present",
    points: 10,
    run: () => readdirSync("docs/exec-plans").some((file) => file.endsWith(".md"))
  },
  {
    name: "repo-local skills present",
    points: 15,
    run: () => {
      const skills = ["add-product-feature", "reproduce-ui-bug", "quality-gardener", "review-pr-locally"];
      return skills.every((skill) => existsSync(join(".codex", "skills", skill, "SKILL.md")));
    }
  },
  {
    name: "architecture boundaries pass",
    points: 20,
    run: () => spawnSync(process.execPath, ["scripts/harness/check-boundaries.mjs"], { stdio: "ignore" }).status === 0
  },
  {
    name: "doc links pass",
    points: 15,
    run: () => spawnSync(process.execPath, ["scripts/harness/check-doc-links.mjs"], { stdio: "ignore" }).status === 0
  },
  {
    name: "observability harness present",
    points: 15,
    run: () => existsSync("scripts/harness/query-logs.mjs") && existsSync("scripts/harness/query-traces.mjs")
  },
  {
    name: "browser journey captures Playwright screenshot proof",
    points: 10,
    run: () =>
      existsSync("tests/e2e/ticket-search.spec.ts") &&
      existsSync("scripts/harness/run-user-journeys.mjs") &&
      readFileSync("scripts/harness/run-user-journeys.mjs", "utf8").includes("page.screenshot")
  }
];

let score = 0;
const failed = [];

for (const check of checks) {
  if (check.run()) {
    score += check.points;
  } else {
    failed.push(check.name);
  }
}

console.log(`Quality score: ${score}/100`);

if (failed.length > 0) {
  console.log("Failed signals:");
  for (const name of failed) {
    console.log(`- ${name}`);
  }
}

if (score < 85) {
  process.exit(1);
}
