# Review PR Locally

Use this skill when reviewing a local branch or proposed patch.

## Review Stance

Prioritize bugs, behavior regressions, missing tests, architecture violations, and insufficient verification.

## Checks

```bash
npm test
npm run check:boundaries
npm run check:doc-links
npm run harness:quality
```

Use Playwright when the PR changes UI behavior:

```bash
npm run test:e2e
```
