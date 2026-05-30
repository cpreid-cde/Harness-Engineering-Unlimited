import { z } from "zod";

export const ticketPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);
export const ticketStatusSchema = z.enum(["open", "investigating", "waiting_on_customer", "escalated", "resolved"]);
export const customerSentimentSchema = z.enum(["positive", "neutral", "negative"]);
export const slaRiskSchema = z.enum(["healthy", "at_risk", "breached"]);

export const ticketSearchQuerySchema = z.object({
  q: z.string().trim().optional().default(""),
  status: ticketStatusSchema.optional(),
  assigneeId: z.string().optional()
});

export const escalationSchema = z.object({
  note: z.string().trim().min(8, "Escalation note must explain the customer impact.")
});

export type TicketSearchQuery = z.infer<typeof ticketSearchQuerySchema>;
export type EscalationInput = z.infer<typeof escalationSchema>;
