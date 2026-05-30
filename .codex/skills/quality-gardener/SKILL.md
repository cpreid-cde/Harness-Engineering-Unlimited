# Quality Gardener

Use this skill for recurring cleanup.

## Weekly Loop

1. Run `npm run harness:quality`.
2. Run `npm run check:boundaries` and `npm run check:doc-links`.
3. Look for stale exec plans, duplicate helpers, and missing tests around recently changed service rules.
4. Open a small reviewable plan in `docs/exec-plans` or make a focused patch.
5. Prefer one cleanup theme per run.

## Output

Return a short report with score, failing signals, proposed fix, and estimated blast radius.
