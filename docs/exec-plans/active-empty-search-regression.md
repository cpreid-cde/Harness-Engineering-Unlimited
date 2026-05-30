# Active Plan: Empty Search Regression

## Goal

Demonstrate observable UI repair by asking Codex to reproduce an empty-search journey, inspect evidence, fix the behavior, and verify no error logs or slow spans remain.

## Prompt

```text
Reproduce the empty-search regression in the browser, capture before/after evidence, fix it, and verify no error logs or slow spans remain on the ticket search journey.
```

## Expected Evidence

- Browser or Playwright sees the empty state: `No tickets match this search`.
- `npm run harness:logs -- --journey ticket-search` shows successful `ticket.search` events.
- `npm run harness:traces -- --journey ticket-search --slow 250` reports no slow spans.

## Notes

The current mainline includes the fixed empty state so the repository stays CI-clean. For a live repair demo, temporarily remove the empty-state branch in `src/ui/components/TicketList.tsx`, run the journey to capture failure, then restore the branch.
