/**
 * Client-side copy of angroup's src/lib/marketSession.ts::computeNextSanthaDate.
 *
 * KEEP IN SYNC: the backend (POST /api/grocery-orders) computes the
 * authoritative `plannedFor` date using that same pure function. This copy
 * exists purely so the santha picker can preview the date + cutoff-passed
 * messaging BEFORE the customer submits, since there is no preview endpoint.
 * If the backend's rollover rule ever changes, mirror the change here too.
 *
 * Algorithm (identical to the backend):
 *  1. Find the next calendar date (today or later) whose day-of-week
 *     matches `weekday`. Today counts as a valid candidate.
 *  2. Build the exact cutoff instant for that candidate date at `cutoffTime`.
 *  3. If `now` is before that cutoff instant, the candidate is orderable.
 *  4. If `now` is at/after cutoff, roll forward 7 days to next week's
 *     occurrence of the same weekday.
 */

export type MarketSessionWeekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export function computeNextSanthaDate(
  weekday: MarketSessionWeekday,
  cutoffTime: string,
  now: Date
): Date {
  const [cutoffHour, cutoffMinute] = parseCutoffTime(cutoffTime);

  const today = now.getDay();
  const daysAhead = (weekday - today + 7) % 7;

  const candidate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  candidate.setDate(candidate.getDate() + daysAhead);

  const cutoffInstant = new Date(candidate);
  cutoffInstant.setHours(cutoffHour, cutoffMinute, 0, 0);

  const cutoffPassed = now >= cutoffInstant;
  const result = cutoffPassed ? addDays(candidate, 7) : candidate;
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Same as computeNextSanthaDate, but also reports whether the nearer
 * (this-cycle) occurrence's cutoff has already passed, so the UI can show
 * an explicit "today's cutoff has passed" note.
 */
export function previewNextSanthaDate(
  weekday: MarketSessionWeekday,
  cutoffTime: string,
  now: Date = new Date()
): { plannedFor: Date; cutoffPassed: boolean; nearestOccurrence: Date } {
  const [cutoffHour, cutoffMinute] = parseCutoffTime(cutoffTime);

  const today = now.getDay();
  const daysAhead = (weekday - today + 7) % 7;

  const nearestOccurrence = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  nearestOccurrence.setDate(nearestOccurrence.getDate() + daysAhead);

  const cutoffInstant = new Date(nearestOccurrence);
  cutoffInstant.setHours(cutoffHour, cutoffMinute, 0, 0);

  const cutoffPassed = now >= cutoffInstant;
  const plannedFor = cutoffPassed ? addDays(nearestOccurrence, 7) : new Date(nearestOccurrence);
  plannedFor.setHours(0, 0, 0, 0);

  const nearest = new Date(nearestOccurrence);
  nearest.setHours(0, 0, 0, 0);

  return { plannedFor, cutoffPassed, nearestOccurrence: nearest };
}

function parseCutoffTime(cutoffTime: string): [number, number] {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(cutoffTime || "");
  if (!match) {
    // Defensive fallback -- shouldn't happen given backend validation, but
    // avoid throwing in the UI over a malformed value.
    return [23, 59];
  }
  return [Number(match[1]), Number(match[2])];
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}
