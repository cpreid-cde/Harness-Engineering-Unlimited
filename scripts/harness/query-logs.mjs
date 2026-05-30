#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const args = new Map();
for (let i = 2; i < process.argv.length; i += 2) {
  args.set(process.argv[i], process.argv[i + 1]);
}

const path = join(process.cwd(), "data", "logs", "app.jsonl");
const journey = args.get("--journey");
const level = args.get("--level");

if (!existsSync(path)) {
  console.log("No logs found yet. Run the app or `npm run harness:journeys` first.");
  process.exit(0);
}

const events = readFileSync(path, "utf8")
  .trim()
  .split("\n")
  .filter(Boolean)
  .map((line) => JSON.parse(line))
  .filter((event) => (journey ? event.journey === journey : true))
  .filter((event) => (level ? event.level === level : true));

if (events.length === 0) {
  console.log("No matching log events.");
  process.exit(0);
}

for (const event of events.slice(-20)) {
  console.log(`${event.timestamp} ${event.level.toUpperCase()} ${event.event} ${event.message}`);
}
