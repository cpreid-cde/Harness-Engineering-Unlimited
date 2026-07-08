import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import type { Assignee, SavedTicketFilter, Ticket, TicketStatus } from "../types/ticket";

type TicketRow = Omit<Ticket, "tags"> & { tags: string };
type SavedTicketFilterRow = SavedTicketFilter & { status: TicketStatus | null; assigneeId: string | null };

export type TicketRepository = {
  listTickets(filters: { query?: string; status?: TicketStatus; assigneeId?: string }): Ticket[];
  getTicket(id: string): Ticket | undefined;
  updateTicket(ticket: Ticket): Ticket;
  listAssignees(): Assignee[];
  getAssignee(id: string): Assignee | undefined;
  listSavedTicketFilters(): SavedTicketFilter[];
  getSavedTicketFilter(id: string): SavedTicketFilter | undefined;
  createSavedTicketFilter(filter: SavedTicketFilter): SavedTicketFilter;
};

function isoMinutesFromNow(minutes: number) {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

function mapTicket(row: TicketRow): Ticket {
  return {
    ...row,
    tags: JSON.parse(row.tags) as string[]
  };
}

function mapSavedTicketFilter(row: SavedTicketFilterRow): SavedTicketFilter {
  return {
    ...row,
    status: row.status ?? undefined,
    assigneeId: row.assigneeId ?? undefined
  };
}

export function createTicketRepository(): TicketRepository {
  const db = new DatabaseSync(":memory:");

  db.exec(`
    CREATE TABLE assignees (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      queue TEXT NOT NULL,
      activeTickets INTEGER NOT NULL
    );

    CREATE TABLE tickets (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      customer TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL,
      priority TEXT NOT NULL,
      sentiment TEXT NOT NULL,
      assigneeId TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      dueAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      tags TEXT NOT NULL,
      escalationNote TEXT,
      FOREIGN KEY (assigneeId) REFERENCES assignees(id)
    );

    CREATE TABLE saved_ticket_filters (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      query TEXT NOT NULL,
      status TEXT,
      assigneeId TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  const assignees: Assignee[] = [
    { id: "a-ana", name: "Ana Iyer", queue: "tier_1", activeTickets: 8 },
    { id: "a-morgan", name: "Morgan Lee", queue: "tier_2", activeTickets: 5 },
    { id: "a-sam", name: "Sam Rivera", queue: "platform", activeTickets: 3 }
  ];

  const tickets: Ticket[] = [
    {
      id: "TCK-1048",
      title: "Webhook retries delayed for enterprise workspace",
      customer: "Northstar Health",
      description: "Customer reports webhook retries taking more than 20 minutes during checkout reconciliation.",
      status: "investigating",
      priority: "urgent",
      sentiment: "negative",
      assigneeId: "a-sam",
      createdAt: isoMinutesFromNow(-190),
      dueAt: isoMinutesFromNow(45),
      updatedAt: isoMinutesFromNow(-12),
      tags: ["webhooks", "payments", "enterprise"]
    },
    {
      id: "TCK-1049",
      title: "Seat provisioning CSV import reports unclear errors",
      customer: "Evergreen Robotics",
      description: "Admin can upload CSV, but validation errors do not identify the failing row.",
      status: "open",
      priority: "high",
      sentiment: "neutral",
      assigneeId: "a-morgan",
      createdAt: isoMinutesFromNow(-75),
      dueAt: isoMinutesFromNow(210),
      updatedAt: isoMinutesFromNow(-22),
      tags: ["admin", "csv", "provisioning"]
    },
    {
      id: "TCK-1050",
      title: "SAML certificate rotation confirmation",
      customer: "Fjord Bank",
      description: "Security team needs confirmation that both old and new signing certificates are active.",
      status: "waiting_on_customer",
      priority: "medium",
      sentiment: "positive",
      assigneeId: "a-ana",
      createdAt: isoMinutesFromNow(-260),
      dueAt: isoMinutesFromNow(980),
      updatedAt: isoMinutesFromNow(-44),
      tags: ["saml", "security"]
    },
    {
      id: "TCK-1051",
      title: "Search empty state copy regression",
      customer: "Atlas Market",
      description: "Support lead sees an empty ticket pane when a search has no matching results.",
      status: "open",
      priority: "medium",
      sentiment: "negative",
      assigneeId: "a-ana",
      createdAt: isoMinutesFromNow(-34),
      dueAt: isoMinutesFromNow(360),
      updatedAt: isoMinutesFromNow(-16),
      tags: ["search", "ui", "demo-gap"]
    }
  ];

  const insertAssignee = db.prepare("INSERT INTO assignees VALUES (?, ?, ?, ?)");
  for (const assignee of assignees) {
    insertAssignee.run(assignee.id, assignee.name, assignee.queue, assignee.activeTickets);
  }

  const insertTicket = db.prepare(`
    INSERT INTO tickets (
      id, title, customer, description, status, priority, sentiment, assigneeId,
      createdAt, dueAt, updatedAt, tags, escalationNote
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const ticket of tickets) {
    insertTicket.run(
      ticket.id,
      ticket.title,
      ticket.customer,
      ticket.description,
      ticket.status,
      ticket.priority,
      ticket.sentiment,
      ticket.assigneeId,
      ticket.createdAt,
      ticket.dueAt,
      ticket.updatedAt,
      JSON.stringify(ticket.tags),
      ticket.escalationNote ?? null
    );
  }

  return {
    listTickets(filters) {
      let sql = "SELECT * FROM tickets";
      const clauses: string[] = [];
      const params: SQLInputValue[] = [];

      if (filters.query) {
        clauses.push("(LOWER(title) LIKE ? OR LOWER(customer) LIKE ? OR LOWER(tags) LIKE ?)");
        const token = `%${filters.query.toLowerCase()}%`;
        params.push(token, token, token);
      }
      if (filters.status) {
        clauses.push("status = ?");
        params.push(filters.status);
      }
      if (filters.assigneeId) {
        clauses.push("assigneeId = ?");
        params.push(filters.assigneeId);
      }
      if (clauses.length > 0) {
        sql += ` WHERE ${clauses.join(" AND ")}`;
      }
      sql += " ORDER BY dueAt ASC";

      return db.prepare(sql).all(...params).map((row) => mapTicket(row as TicketRow));
    },

    getTicket(id) {
      const row = db.prepare("SELECT * FROM tickets WHERE id = ?").get(id) as TicketRow | undefined;
      return row ? mapTicket(row) : undefined;
    },

    updateTicket(ticket) {
      db.prepare(`
        UPDATE tickets
        SET title = ?, customer = ?, description = ?, status = ?, priority = ?, sentiment = ?,
            assigneeId = ?, createdAt = ?, dueAt = ?, updatedAt = ?, tags = ?, escalationNote = ?
        WHERE id = ?
      `).run(
        ticket.title,
        ticket.customer,
        ticket.description,
        ticket.status,
        ticket.priority,
        ticket.sentiment,
        ticket.assigneeId,
        ticket.createdAt,
        ticket.dueAt,
        ticket.updatedAt,
        JSON.stringify(ticket.tags),
        ticket.escalationNote ?? null,
        ticket.id
      );
      return ticket;
    },

    listAssignees() {
      return db.prepare("SELECT * FROM assignees ORDER BY queue, activeTickets DESC").all() as Assignee[];
    },

    getAssignee(id) {
      return db.prepare("SELECT * FROM assignees WHERE id = ?").get(id) as Assignee | undefined;
    },

    listSavedTicketFilters() {
      return db
        .prepare("SELECT * FROM saved_ticket_filters ORDER BY updatedAt DESC, name ASC")
        .all()
        .map((row) => mapSavedTicketFilter(row as SavedTicketFilterRow));
    },

    getSavedTicketFilter(id) {
      const row = db.prepare("SELECT * FROM saved_ticket_filters WHERE id = ?").get(id) as
        | SavedTicketFilterRow
        | undefined;
      return row ? mapSavedTicketFilter(row) : undefined;
    },

    createSavedTicketFilter(filter) {
      db.prepare(`
        INSERT INTO saved_ticket_filters (id, name, query, status, assigneeId, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        filter.id,
        filter.name,
        filter.query,
        filter.status ?? null,
        filter.assigneeId ?? null,
        filter.createdAt,
        filter.updatedAt
      );
      return filter;
    }
  };
}
