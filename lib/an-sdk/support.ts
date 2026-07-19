import { anGet, anPost } from "./client";

export async function raiseTicket(payload: {
  name: string;
  email?: string;
  phone?: string;
  orderId?: string;
  subject: string;
  message: string;
}) {
  return anPost("/api/storefront/support-tickets", payload);
}

export async function getTicket(ticketNumber: string) {
  return anGet(`/api/storefront/support-tickets/${encodeURIComponent(ticketNumber)}`);
}

export async function addTicketMessage(ticketNumber: string, message: string) {
  return anPost(`/api/storefront/support-tickets/${encodeURIComponent(ticketNumber)}`, { message });
}
