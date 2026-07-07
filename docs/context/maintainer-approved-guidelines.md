# Maintainer Approved Guidelines

Curated engineering guidance approved for use by Codex and humans working in this repo.

This file is not a transcript. It captures normalized rules that should influence implementation choices once they have been accepted into the repo.

## Status

- Curator: Harness engineering automation
- Approval model: demo-seeded guidelines, promoted through repo review
- Last updated: 2026-07-07
- Source provenance: the current origin messages are synthetic seed messages in [the harness engineering Slack channel](https://app.slack.com/client/T09KGJ44NTG/C0BFJ3Z0S3V) for the context-enrichment demo.

## Guidelines

### UI must use API helpers, not service imports

- Applies to: `src/ui/**`
- Origin message: [Approved guideline seed: UI boundary](https://theaicompanydotorg.slack.com/archives/C0BFJ3Z0S3V/p1783467144500999)
- Related docs: [Architecture](../ARCHITECTURE.md)

React UI code should call HTTP helpers from `src/ui/lib/api.ts`. It should not import from `src/service`, `src/repo`, `src/routes`, or `src/providers`.

Reason: keeping the UI behind the route boundary makes browser behavior match production behavior and keeps `npm run check:boundaries` meaningful.

Validation:

```bash
npm run check:boundaries
```

### New user-facing states need observable evidence

- Applies to: `src/service/**`, `src/routes/**`, `src/providers/**`
- Origin message: [Approved guideline seed: observable user workflows](https://theaicompanydotorg.slack.com/archives/C0BFJ3Z0S3V/p1783467152265889)
- Related docs: [Quality](../QUALITY.md)

When a feature adds a new user-facing workflow or failure mode, include enough logs or spans for Codex to query the behavior later.

Prefer stable journey names such as `ticket-search`, `ticket-create`, or `sla-risk`.

Validation examples:

```bash
npm run harness:logs -- --journey ticket-search
npm run harness:traces -- --journey ticket-search --slow 250
```

### Browser-visible bug fixes need screenshot proof

- Applies to: UI bugs, visual regressions, Playwright journeys
- Origin message: [Approved guideline seed: browser screenshot proof](https://theaicompanydotorg.slack.com/archives/C0BFJ3Z0S3V/p1783467157956349)
- Related docs: [Quality](../QUALITY.md)

If a bug is visible in the browser, include before/after evidence through Playwright screenshots or an updated journey artifact.

Validation:

```bash
npm run harness:journeys
```

## Promotion Rules

Move a guideline into [Architecture](../ARCHITECTURE.md) when it defines a durable code boundary.

Move a guideline into [Quality](../QUALITY.md) when it changes the definition of done.

Add or update a script under `scripts/harness` when the rule can be mechanically enforced.
