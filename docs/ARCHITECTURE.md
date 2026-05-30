# Architecture

`agentic-supportdesk` is intentionally small, but its boundaries are strict so Codex can reason about changes mechanically.

## Domain Layers

```text
types -> schemas -> repo -> service -> routes -> ui
```

## Layer Responsibilities

| Layer | Owns | May import |
| --- | --- | --- |
| `src/types` | Shared TypeScript shapes | Nothing repo-local |
| `src/schemas` | Runtime validation and request parsing | `types` |
| `src/repo` | SQLite persistence and seed data | `types`, `schemas`, `providers` |
| `src/service` | Business rules and orchestration | `types`, `schemas`, `repo`, `providers` |
| `src/routes` | Express endpoints and HTTP translation | `types`, `schemas`, `service`, `providers` |
| `src/ui` | React UI and client-side state | `types`, UI-local helpers/components |
| `src/providers` | Cross-cutting adapters such as observability | `types` |

## Boundary Rules

- UI code calls the API through `src/ui/lib/api.ts`; it does not import repo or service code.
- Business rules such as SLA risk live in `src/service`.
- SQLite access stays in `src/repo`.
- Express concerns stay in `src/routes`.
- Cross-cutting runtime adapters belong in `src/providers`.
- If a future feature needs another external dependency, add it under `providers` and inject it inward.

## Mechanical Enforcement

Run:

```bash
npm run check:boundaries
```

The checker scans local imports and reports the first boundary violation with the importing file, imported target, and allowed layer list.
