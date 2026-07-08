export type TicketPriority = "low" | "medium" | "high" | "urgent";

export type TicketStatus = "open" | "investigating" | "waiting_on_customer" | "escalated" | "resolved";

export type CustomerSentiment = "positive" | "neutral" | "negative";

export type SlaRisk = "healthy" | "at_risk" | "breached";

export type Assignee = {
  id: string;
  name: string;
  queue: "tier_1" | "tier_2" | "platform";
  activeTickets: number;
};

export type Ticket = {
  id: string;
  title: string;
  customer: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  sentiment: CustomerSentiment;
  assigneeId: string;
  createdAt: string;
  dueAt: string;
  updatedAt: string;
  tags: string[];
  escalationNote?: string;
};

export type TicketWithSignals = Ticket & {
  assigneeName: string;
  slaRisk: SlaRisk;
  minutesUntilDue: number;
};

export type TicketSearchResult = {
  tickets: TicketWithSignals[];
  total: number;
  query: string;
  status?: TicketStatus;
};
