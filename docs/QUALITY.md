# Quality Scorecard

The repository quality bar is deliberately executable. Humans decide the bar; scripts make it repeatable.

## Score Areas

| Area | Evidence | Weight |
| --- | --- | --- |
| Tests | `npm test`, `npm run test:e2e` | 30 |
| Architecture | `npm run check:boundaries` | 20 |
| Observability | `data/logs`, `data/traces`, query scripts | 20 |
| Accessibility | semantic labels, focus styles, empty states | 15 |
| Doc freshness | `npm run check:doc-links`, active/completed plans | 15 |

## Definition of Done

- The relevant unit or e2e test is updated.
- `npm run check:boundaries` passes.
- User-facing workflows have a visible empty, loading, or error state.
- New runtime behavior emits enough logs or spans for Codex to query.
- `docs/exec-plans` captures durable decisions when the work changes architecture, workflow, or demo flow.

## Current Threshold

`npm run harness:quality` must score at least `85`.
