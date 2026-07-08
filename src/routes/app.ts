import express from "express";
import { escalationSchema, savedTicketFilterSchema, ticketSearchQuerySchema } from "../schemas/ticketSchema";
import { createDefaultTicketService } from "../service/defaultTicketService";
import { logEvent, observabilityMiddleware } from "../providers/observability";

export function createApp() {
  const app = express();
  const service = createDefaultTicketService();

  app.use(express.json());
  app.use(observabilityMiddleware);

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "agentic-supportdesk-api" });
  });

  app.get("/api/tickets", (req, res) => {
    const parsed = ticketSearchQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const result = service.searchTickets(parsed.data);
    logEvent({
      timestamp: new Date().toISOString(),
      level: "info",
      event: "ticket.search",
      route: "/api/tickets",
      journey: typeof req.query.journey === "string" ? req.query.journey : undefined,
      message: `Ticket search returned ${result.total} results`,
      fields: { query: result.query, total: result.total }
    });
    res.json(result);
  });

  app.get("/api/tickets/:id", (req, res) => {
    const ticket = service.getTicket(req.params.id);
    if (!ticket) {
      res.status(404).json({ error: "Ticket not found" });
      return;
    }
    res.json(ticket);
  });

  app.get("/api/ticket-filters", (_req, res) => {
    res.json({ filters: service.listSavedTicketFilters() });
  });

  app.post("/api/ticket-filters", (req, res) => {
    const parsed = savedTicketFilterSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const filter = service.createSavedTicketFilter(parsed.data);
    logEvent({
      timestamp: new Date().toISOString(),
      level: "info",
      event: "ticket.filter.saved",
      route: "/api/ticket-filters",
      message: `Saved ticket filter ${filter.name}`,
      fields: { filterId: filter.id, query: filter.query, status: filter.status }
    });
    res.status(201).json(filter);
  });

  app.post("/api/ticket-filters/:id/restore", (req, res) => {
    const filter = service.getSavedTicketFilter(req.params.id);
    if (!filter) {
      res.status(404).json({ error: "Saved filter not found" });
      return;
    }

    logEvent({
      timestamp: new Date().toISOString(),
      level: "info",
      event: "ticket.filter.restored",
      route: "/api/ticket-filters/:id/restore",
      message: `Restored ticket filter ${filter.name}`,
      fields: { filterId: filter.id, query: filter.query, status: filter.status }
    });
    res.json(filter);
  });

  app.post("/api/tickets/:id/escalate", (req, res) => {
    const parsed = escalationSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const ticket = service.escalateTicket(req.params.id, parsed.data);
    if (!ticket) {
      res.status(404).json({ error: "Ticket not found" });
      return;
    }

    logEvent({
      timestamp: new Date().toISOString(),
      level: "warn",
      event: "ticket.escalated",
      route: "/api/tickets/:id/escalate",
      message: `${ticket.id} escalated`,
      fields: { ticketId: ticket.id, customer: ticket.customer, slaRisk: ticket.slaRisk }
    });
    res.json(ticket);
  });

  app.get("/api/assignees", (_req, res) => {
    res.json({ assignees: service.listAssignees() });
  });

  return app;
}
