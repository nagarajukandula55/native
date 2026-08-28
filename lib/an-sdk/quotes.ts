import { anPost } from "./client";

export type QuoteRequestPayload = {
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  gstNumber?: string;
  productDescription: string;
  quantity?: string;
  targetPrice?: number;
};

/**
 * POST /api/quote-requests — public "request a custom quote" (custom
 * product / bulk order / private label). businessId is auto-attached by
 * client.ts's query-param injection.
 */
export async function submitQuoteRequest(payload: QuoteRequestPayload) {
  return anPost("/api/quote-requests", payload);
}
