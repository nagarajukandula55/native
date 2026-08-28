import { anGet, anPost } from "./client";

export async function getSuggestions() {
  return anGet("/api/suggestions");
}

export async function submitSuggestion(payload: { name?: string; email?: string; category?: string; text: string }) {
  return anPost("/api/suggestions", payload);
}

export async function voteSuggestion(id: string) {
  return anPost(`/api/suggestions/${id}/vote`);
}
