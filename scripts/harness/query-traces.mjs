#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const args = new Map();
for (let i = 2; i < process.argv.length; i += 2) {
  args.set(process.argv[i], process.argv[i + 1]);
}

const path = join(process.cwd(), "data", "traces", "spans.jsonl");
const journey = args.get("--journey");
const slow = Number(args.get("--slow") ?? 0);

if (!existsSync(path)) {
  console.log("No traces found yet. Run the app or `npm run harness:journeys` first.");
  process.exit(0);
}

const spans = readFileSync(path, "utf8")
  .trim()
  .split("\n")
  .filter(Boolean)
  .map((line) => JSON.parse(line))
  .filter((span) => (journey ? span.journey === journey : true))
  .filter((span) => span.durationMs >= slow);

if (spans.length === 0) {
  console.log(`No matching spans${slow ? ` at or above ${slow}ms` : ""}.`);
  process.exit(0);
}

for (const span of spans.slice(-20)) {
  console.log(`${span.timestamp} ${span.span} ${span.durationMs}ms status=${span.statusCode}`);
}
