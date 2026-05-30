# Harness Engineering Customer Demo

## Summary
Build a 45-minute platform-engineering demo around a synthetic repo named `agentic-supportdesk`: a TypeScript support-ticket SaaS with a React/Vite UI, Express API, SQLite, Vitest, Playwright, and a lightweight JSONL logs/traces harness.

The core message: harness engineering is the work of making a repo legible, enforceable, observable, and self-improving for agents. Anchor it to the blog’s themes: repository knowledge as system of record, agent-legible app feedback, mechanical architecture rules, autonomy loops, and recurring cleanup. Source grounding: OpenAI’s harness-engineering blog, plus public Codex docs for AGENTS.md, skills, worktrees, automations, MCP, appshots, and rules. [Blog](https://openai.com/index/harness-engineering/) [AGENTS.md docs](https://developers.openai.com/codex/guides/agents-md) [Skills](https://developers.openai.com/codex/skills) [Automations](https://developers.openai.com/codex/app/automations)

## Sample Repository
Use `agentic-supportdesk` with these demo-ready artifacts:

- `AGENTS.md`: short table-of-contents style guide pointing to deeper docs, mirroring the blog’s “map, not manual” pattern.
- `docs/ARCHITECTURE.md`: fixed domain layers: `types -> schemas -> repo -> service -> routes -> ui`, with `providers` as the only cross-cutting boundary.
- `docs/QUALITY.md`: quality scorecard covering tests, observability, accessibility, architecture, and stale-doc risk.
- `docs/exec-plans/`: active/completed plans so Codex can preserve decisions in-repo.
- `.codex/skills/`: `reproduce-ui-bug`, `add-product-feature`, `quality-gardener`, and `review-pr-locally`.
- `scripts/harness/`: `check-boundaries`, `check-doc-links`, `query-logs`, `query-traces`, `run-user-journeys`, and `quality-score`.
- CI gates: unit tests, Playwright smoke journeys, architecture-boundary lint, doc-link lint, and quality-score threshold.

Keep the app domain simple but realistic: ticket list, ticket detail, SLA badge, assignee queue, customer sentiment, and escalation workflow. Seed one feature gap and one bug so the demo has visible progress.

## Demo Flow
1. **Opening, 5 min**
   Explain that the blog reframes engineering work: humans specify intent and design feedback loops; agents execute. Show the blog concepts briefly: repo knowledge, app legibility, mechanical constraints, autonomy, entropy cleanup.

2. **Repo Legibility, 8 min**
   Open `AGENTS.md`, `docs/ARCHITECTURE.md`, and `docs/QUALITY.md`.
   Talk track: “This is not a giant prompt. It is onboarding material for an agent. The repo tells Codex where truth lives, what boundaries matter, and how to know whether work is done.”

3. **Workflow 1: Architecture-Guided Feature, 12 min**
   Prompt Codex:
   ```text
   Add an SLA risk badge to ticket cards. Follow the repository architecture guide, update tests, and run the relevant checks. If a boundary lint fails, explain the rule and fix the design.
   ```
   Expected outcome: Codex reads the docs, implements through service/schema/UI layers, runs tests, and cites the harness checks. If useful, intentionally include a pre-seeded branch where UI imports repo code so `check-boundaries` fails and Codex repairs it.

4. **Workflow 2: Observable UI Repair, 12 min**
   Prompt Codex:
   ```text
   Reproduce the empty-search regression in the browser, capture before/after evidence, fix it, and verify no error logs or slow spans remain on the ticket search journey.
   ```
   Expected outcome: Codex uses Playwright/browser/appshot-style evidence, runs `query-logs` and `query-traces`, fixes the bug, and produces a verification summary. Connect this to the blog’s point that UI, logs, metrics, and traces must be legible to Codex. [Worktrees](https://developers.openai.com/codex/app/worktrees) [Appshots](https://developers.openai.com/codex/appshots) [MCP](https://developers.openai.com/codex/mcp)

5. **Workflow 3: Recurring Cleanup, 5 min**
   Show a pre-seeded automation:
   ```text
   Weekly, run quality-gardener on agentic-supportdesk. Identify stale docs, drifting architecture, duplicate helpers, and low-coverage domains. Open a small reviewable plan or PR.
   ```
   Talk track: “The most valuable rules graduate from taste to tooling. Cleanup becomes continuous, small, and reviewable.” Tie to Codex rules/automations and permission controls. [Rules](https://developers.openai.com/codex/rules) [Automations](https://developers.openai.com/codex/app/automations)

6. **Close, 3 min**
   Adoption ladder:
   Start with `AGENTS.md` and a repo map, add executable checks, expose app feedback to Codex, add reusable skills, then automate recurring cleanup.

## Talk Track
- “Harness engineering is not prompt engineering with a nicer name. It is the system around the model: context, tools, permissions, feedback, verification, and memory.”
- “The scarce resource is human attention. The harness exists to spend that attention on judgment, not repetitive investigation.”
- “If Codex cannot see it, query it, or verify it, it effectively does not exist to the agent.”
- “Docs are useful until they drift. The moment a rule matters, we encode it as a check with a helpful remediation message.”
- “The demo repo is intentionally small, but the pattern scales: short instructions, deep repo-local truth, strict boundaries, observable runtime behavior, and recurring garbage collection.”

## Acceptance Criteria
- The repo can be cloned and booted in under 10 minutes.
- All demo commands are deterministic: setup, test, lint, Playwright, logs/traces query, and quality score.
- The live demo shows at least one Codex-authored feature, one Codex-repaired bug, and one Codex-readable verification report.
- The customer leaves with a concrete harness maturity model: legible repo, enforceable architecture, observable app, reusable workflows, recurring cleanup.

## Assumptions
- Audience is platform engineering.
- Demo duration is 45 minutes.
- Repo is synthetic SaaS to avoid customer IP and setup risk.
- No Slack sources are used.
