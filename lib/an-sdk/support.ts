/**
 * Repointed to an-helpdesk (central-api's shared "tickets" dataset)
 * instead of ANgroup's own local /api/storefront/support-tickets, per
 * explicit direction that support tickets be universal across every AN
 * Group site's admin view, not siloed per-app. See an-helpdesk's own
 * README for the shape of what it stores.
 *
 * Native's UI (app/support/page.js) is written against ANgroup's OLD
 * shape (`success`, `ticket.messages[].from` "ADMIN"/"CUSTOMER",
 * `.createdAt`) -- rather than touch that page (kept deliberately
 * untouched, minimal diff), this module translates an-helpdesk's actual
 * shape (`ticket`, `.replies[].from` "TEAM"/"REQUESTER", `.at`) into the
 * old shape here, at the boundary.
 *
 * SECURITY FIX: the old raiseTicket/getTicket/addTicketMessage let anyone
 * who merely knew a ticket NUMBER read or reply to it -- no ownership
 * check at all. an-helpdesk's track/message endpoints require the
 * requester's own email to match, so getTicket/addTicketMessage now also
 * take an email argument. Native's support page was updated to collect
 * it on the Track tab (it already collects it when raising a ticket).
 */

const HELPDESK_API = process.env.NEXT_PUBLIC_HELPDESK_API;

async function helpdeskPost(path: string, body: unknown) {
  if (!HELPDESK_API) throw new Error("NEXT_PUBLIC_HELPDESK_API is not configured");
  const res = await fetch(`${HELPDESK_API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: any = new Error(data.error || "Request failed");
    err.data = data;
    throw err;
  }
  return data;
}

// an-helpdesk's `replies[].from` is "TEAM"/"REQUESTER" -- Native's UI
// expects "ADMIN"/"CUSTOMER".
function translateTicket(ticket: any) {
  if (!ticket) return ticket;
  return {
    ...ticket,
    messages: (ticket.replies || []).map((r: any) => ({
      from: r.from === "TEAM" ? "ADMIN" : "CUSTOMER",
      authorName: r.authorName,
      createdAt: r.at,
      message: r.message,
    })),
  };
}

export async function raiseTicket(payload: {
  name: string;
  email?: string;
  phone?: string;
  orderId?: string;
  subject: string;
  message: string;
}) {
  const data = await helpdeskPost("/api/tickets", {
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    category: "CUSTOMER",
    businessHint: payload.orderId ? `Order ID: ${payload.orderId}` : undefined,
    subject: payload.subject,
    message: payload.message,
  });
  return { success: true, ticketNumber: data.ticketNumber };
}

export async function getTicket(ticketNumber: string, email: string) {
  const data = await helpdeskPost("/api/tickets/track", { ticketNumber, email });
  return { success: true, ticket: translateTicket(data.ticket) };
}

export async function addTicketMessage(ticketNumber: string, email: string, message: string) {
  const data = await helpdeskPost("/api/tickets/message", { ticketNumber, email, message });
  return { success: true, ticket: translateTicket(data.ticket) };
}
