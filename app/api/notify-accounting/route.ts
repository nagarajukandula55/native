import { NextResponse } from "next/server";

/**
 * Server-side proxy to AN-Accounting's sales ingestion API. Exists so the
 * real ACCOUNTING_API_KEY never reaches the browser — OrderSuccessClient.js
 * calls this internal route instead of AN-Accounting directly.
 *
 * Never fails the caller: on any error (not configured, unreachable, bad
 * response), returns { ok: false } rather than throwing — a broken push to
 * the owner's bookkeeping app must never break the order-success page for
 * a customer.
 *
 * Transient failures (network errors, 5xx, 429) are retried with
 * exponential backoff before giving up. Auth failures (401/403) are not
 * retried — those need a human to fix the API key. If every attempt fails,
 * the failure is logged with enough context to manually re-push the sale.
 */

const MAX_ATTEMPTS = 3;
const BACKOFF_MS = [1000, 3000, 9000];

function isRetryableStatus(status: number) {
  return status === 429 || status >= 500;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  const url = process.env.ACCOUNTING_API_URL;
  const key = process.env.ACCOUNTING_API_KEY;
  if (!url || !key) {
    return NextResponse.json({ ok: false, reason: "not_configured" });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid_body" }, { status: 400 });
  }

  const orderId =
    body && typeof body === "object" && "externalOrderId" in body
      ? (body as { externalOrderId?: unknown }).externalOrderId
      : undefined;

  let lastError: { reason: string; status?: number; data?: unknown; message?: string } | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        return NextResponse.json({ ok: true, ...data });
      }

      // Auth errors need a human to fix the API key — don't retry.
      if (response.status === 401 || response.status === 403) {
        console.error("[notify-accounting] Auth error pushing to AN-Accounting — API key needs attention:", {
          orderId,
          timestamp: new Date().toISOString(),
          status: response.status,
          data,
        });
        return NextResponse.json({ ok: false, reason: "upstream_auth_error", status: response.status });
      }

      lastError = { reason: "upstream_error", status: response.status, data };

      if (!isRetryableStatus(response.status) || attempt === MAX_ATTEMPTS) {
        break;
      }
    } catch (error) {
      lastError = { reason: "unreachable", message: error instanceof Error ? error.message : String(error) };
      if (attempt === MAX_ATTEMPTS) {
        break;
      }
    }

    // Wait before the next attempt (skip the wait after the final attempt).
    await sleep(BACKOFF_MS[attempt - 1]);
  }

  console.error("[notify-accounting] Failed to push sale to AN-Accounting after retries:", {
    orderId,
    timestamp: new Date().toISOString(),
    attempts: MAX_ATTEMPTS,
    ...lastError,
    body,
  });

  return NextResponse.json({
    ok: false,
    reason: lastError?.reason ?? "unreachable",
    status: lastError?.status,
  });
}
