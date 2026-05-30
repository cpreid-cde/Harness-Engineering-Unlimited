# agentic-supportdesk

Synthetic TypeScript support-ticket SaaS for a 45-minute harness-engineering demo.

The point is not the ticketing product. The point is the system around it: repo-local knowledge, enforceable architecture rules, agent-visible app feedback, reusable Codex skills, and recurring cleanup loops.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173`.

## Demo Checks

```bash
npm run build
npm test
npm run test:e2e
npm run check:boundaries
npm run check:doc-links
npm run harness:journeys
npm run harness:logs -- --journey ticket-search
npm run harness:traces -- --journey ticket-search --slow 250
npm run harness:quality
```

## Demo Story

1. Show `AGENTS.md`, `docs/ARCHITECTURE.md`, and `docs/QUALITY.md`.
2. Add or modify a feature through the documented layers.
3. Reproduce a UI issue in the browser, fix it, and verify through app output, logs, and traces.
4. Show how `quality-gardener` turns cleanup into a small repeatable loop.
