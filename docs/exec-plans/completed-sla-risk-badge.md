# Completed Plan: SLA Risk Badge

## Goal

Add an SLA risk badge to ticket cards and ticket detail while preserving the repository architecture.

## Implementation

- `src/service/ticketService.ts` owns `calculateSlaRisk`.
- `src/routes/app.ts` exposes tickets with computed signals.
- `src/ui/components/RiskBadge.tsx` renders the UI primitive.
- `src/ui/components/TicketList.tsx` and `src/ui/components/TicketDetail.tsx` display the badge.

## Verification

- `tests/unit/ticketService.test.ts` covers healthy, at-risk, and breached logic.
- `tests/e2e/ticket-search.spec.ts` verifies that an SLA badge is visible in the ticket list.
- `npm run check:boundaries` prevents UI from importing service or repo code directly.
