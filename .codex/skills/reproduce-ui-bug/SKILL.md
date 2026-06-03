# Reproduce UI Bug

Use this skill for browser-visible regressions.

## Workflow

1. Read `AGENTS.md` and `docs/QUALITY.md`.
2. Reproduce the bug in the browser or Playwright before editing.
3. Capture the user-visible symptom and the expected behavior with Playwright screenshots. Use `page.screenshot` artifacts, not in-app browser screenshots, for proof.
4. Query logs with `npm run harness:logs -- --journey ticket-search`.
5. Query traces with `npm run harness:traces -- --journey ticket-search --slow 250`.
6. Fix the smallest layer that owns the defect.
7. Re-run the browser journey, logs query, traces query, and relevant tests.
8. In Codex Desktop, ALWAYS include the Playwright screenshots inline in the final response alongside logs, traces, and test output.
