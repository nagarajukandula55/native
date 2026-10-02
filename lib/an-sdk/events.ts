/**
 * Event/audit-log SDK module.
 *
 * NOT confirmed against AN group's real backend yet — proposing
 * POST /api/events (write one entry, auth-scoped to the calling user) and
 * GET /api/events (that user's own history, newest first, paginated) as the
 * shape it should expose, mirroring the vendor-proposal pattern in
 * lib/an-sdk/vendors.ts. Until AN group implements these, calls here will
 * 404 — lib/eventLogger.ts catches that and falls back to its existing
 * localStorage timeline, so the UI keeps working either way and picks up
 * server-side persistence automatically the day this route exists.
 */

import { anGet, anPost } from "./client";

export type RemoteEvent = {
  type: string;
  message: string;
  data?: Record<string, any>;
  timestamp: string;
};

export async function postEvent(event: RemoteEvent) {
  return anPost("/api/events", event);
}

export async function getMyEvents(query: { limit?: number; before?: string } = {}) {
  const qs = new URLSearchParams();
  if (query.limit) qs.set("limit", String(query.limit));
  if (query.before) qs.set("before", query.before);
  const str = qs.toString();
  return anGet(`/api/events${str ? `?${str}` : ""}`);
}
