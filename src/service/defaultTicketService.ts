import { createTicketRepository } from "../repo/ticketRepo";
import { createTicketService } from "./ticketService";

export function createDefaultTicketService() {
  return createTicketService(createTicketRepository());
}
