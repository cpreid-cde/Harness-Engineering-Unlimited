# agentic-supportdesk Agent Guide

This repository is a small harness-engineering demo. Treat this file as a map, not a manual.

## Start Here

| Need | Read or run |
| --- | --- |
| Architecture boundaries | `docs/ARCHITECTURE.md` |
| Definition of done | `docs/QUALITY.md` |
| Active and completed plans | `docs/exec-plans/` |
| Feature workflow | `.codex/skills/add-product-feature/SKILL.md` |
| UI bug workflow | `.codex/skills/reproduce-ui-bug/SKILL.md` |
| Local PR review | `.codex/skills/review-pr-locally/SKILL.md` |
| Entropy cleanup | `.codex/skills/quality-gardener/SKILL.md` |

## Commands

- Install: `npm install`
- Boot app: `npm run dev`
- Unit tests: `npm test`
- Browser smoke: `npm run test:e2e`
- Boundary lint: `npm run check:boundaries`
- Doc link lint: `npm run check:doc-links`
- Journey check: `npm run harness:journeys`
- Log query: `npm run harness:logs -- --journey ticket-search`
- Trace query: `npm run harness:traces -- --journey ticket-search --slow 250`
- Quality score: `npm run harness:quality`

## Working Rules

- Keep domain flow in this order: `types -> schemas -> repo -> service -> routes -> ui`.
- UI code must not import `repo`, `service`, `routes`, or `providers`; use HTTP API helpers in `src/ui/lib`.
- When a rule matters, encode it in `scripts/harness` with a remediation message.
- If you fix a bug, capture before/after evidence through tests, logs, traces, or screenshots.
- Update docs when a workflow or architecture rule changes.
