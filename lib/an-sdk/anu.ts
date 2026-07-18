import { anPost } from "./client";

export type AnuChatMessage = {
  role: "user" | "assistant";
  content: string;
};

/**
 * Ask ANu (ANgroup's assistant, POST /api/anu) a question in the context of
 * this business (Native's businessId, already attached to every request by
 * client.ts). Requires a signed-in user - ANgroup's route 401s otherwise,
 * same as every other authenticated an-sdk call.
 */
export async function askAnu(messages: AnuChatMessage[], language?: string) {
  return anPost("/api/anu", { messages, language });
}

export type AnuIssueSeverity = "LOW" | "MEDIUM" | "HIGH";

/**
 * Report a problem *through ANu* (ANgroup's ANu Issues & Reports inbox,
 * /admin/anu-issues) - replaces the old app/anu/page.jsx dashboard, which
 * posted to an unrelated external Render endpoint instead of ANgroup at
 * all. Requires a signed-in user, same as askAnu above.
 */
export async function reportIssueToAnu(input: {
  title: string;
  description: string;
  severity?: AnuIssueSeverity;
}) {
  return anPost("/api/anu/issues", {
    title: input.title,
    description: input.description,
    severity: input.severity ?? "MEDIUM",
    source: "native-anu",
  });
}
