import { anPost } from "./client";

export async function sendContactMessage(payload: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}) {
  return anPost("/api/contact", payload);
}

/**
 * Newsletter signup (footer). Proposed endpoint — no route for this
 * existed in the original backend bundle. See
 * backend-reference/FRONTEND_GAPS.md.
 */
export async function subscribeNewsletter(email: string) {
  return anPost("/api/newsletter/subscribe", { email });
}
