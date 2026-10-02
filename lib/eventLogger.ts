/**
 * Client-side event/activity logger.
 *
 * Keeps a rolling timeline in localStorage per browser — this is the
 * source of truth for the Activity Log page, so it works immediately
 * regardless of backend state. Every logged event is also best-effort
 * POSTed to AN group's proposed /api/events route (lib/an-sdk/events.ts)
 * so a durable, cross-device record starts accumulating the moment that
 * route goes live; until then those calls just 404 silently and the
 * local timeline carries the UI.
 */

import { postEvent } from "./an-sdk/events";

const STORAGE_KEY = "an_event_log";
const MAX_EVENTS = 500;

export type LoggedEvent = {
  id: string;
  type: string;
  message: string;
  data?: Record<string, any>;
  timestamp: string; // ISO 8601
};

function readAll(): LoggedEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(events: LoggedEvent[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {
    // storage full/unavailable — logging is best-effort, never throw
  }
}

export function logEvent(type: string, message: string, data?: Record<string, any>): LoggedEvent {
  const entry: LoggedEvent = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    message,
    data,
    timestamp: new Date().toISOString(),
  };

  const events = readAll();
  events.unshift(entry);
  if (events.length > MAX_EVENTS) events.length = MAX_EVENTS;
  persist(events);

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log(`[event] ${entry.timestamp} ${type} — ${message}`, data || "");
  }

  // Best-effort — never let a backend 404/network error break the caller's
  // flow (signup, order update, etc.) that triggered this log.
  postEvent({ type, message, data, timestamp: entry.timestamp }).catch(() => {});

  return entry;
}

export function getEvents(): LoggedEvent[] {
  return readAll();
}

export function clearEvents() {
  persist([]);
}

/** Events of a given type, newest first — e.g. all "order_status_updated" rows for a timeline filter. */
export function getEventsByType(type: string): LoggedEvent[] {
  return readAll().filter((e) => e.type === type);
}
