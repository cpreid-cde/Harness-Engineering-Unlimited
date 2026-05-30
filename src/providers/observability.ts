import { appendFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import type { Request, Response, NextFunction } from "express";

const logPath = join(process.cwd(), "data", "logs", "app.jsonl");
const tracePath = join(process.cwd(), "data", "traces", "spans.jsonl");

type LogEvent = {
  timestamp: string;
  level: "info" | "warn" | "error";
  event: string;
  route?: string;
  journey?: string;
  message: string;
  fields?: Record<string, unknown>;
};

type TraceSpan = {
  timestamp: string;
  span: string;
  route: string;
  durationMs: number;
  statusCode: number;
  journey?: string;
};

function writeJsonl(path: string, value: unknown) {
  mkdirSync(dirname(path), { recursive: true });
  appendFileSync(path, `${JSON.stringify(value)}\n`);
}

export function logEvent(event: LogEvent) {
  writeJsonl(logPath, event);
}

export function recordSpan(span: TraceSpan) {
  writeJsonl(tracePath, span);
}

export function observabilityMiddleware(req: Request, res: Response, next: NextFunction) {
  const started = performance.now();
  res.on("finish", () => {
    const durationMs = Math.round((performance.now() - started) * 100) / 100;
    const journey = typeof req.query.journey === "string" ? req.query.journey : undefined;
    recordSpan({
      timestamp: new Date().toISOString(),
      span: `${req.method} ${req.path}`,
      route: req.path,
      durationMs,
      statusCode: res.statusCode,
      journey
    });

    if (res.statusCode >= 500) {
      logEvent({
        timestamp: new Date().toISOString(),
        level: "error",
        event: "api.error",
        route: req.path,
        journey,
        message: `Request failed with ${res.statusCode}`,
        fields: { method: req.method, durationMs }
      });
    }
  });
  next();
}
