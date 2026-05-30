# Add Product Feature

Use this skill when adding a support-desk product feature.

## Workflow

1. Read `AGENTS.md`, `docs/ARCHITECTURE.md`, and `docs/QUALITY.md`.
2. Identify the layer where the business rule belongs before editing UI.
3. Update data shapes in `src/types`, validation in `src/schemas`, persistence in `src/repo`, orchestration in `src/service`, endpoints in `src/routes`, and React UI in `src/ui` only as needed.
4. Add or update focused unit tests for service rules.
5. Add or update a Playwright smoke journey when the user-visible flow changes.
6. Run `npm test`, `npm run check:boundaries`, and the relevant harness script.
7. Summarize the exact checks and any changed architecture decisions.
