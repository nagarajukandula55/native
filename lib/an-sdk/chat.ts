import { anGet, anPost } from "./client";

export async function startChat(payload: { name: string; email?: string; visitorId?: string; message: string }) {
  return anPost("/api/support/chat/start", payload);
}

export async function sendChatMessage(conversationId: string, text: string) {
  return anPost(`/api/support/chat/${conversationId}/message`, { text });
}

export async function getChatMessages(conversationId: string) {
  return anGet(`/api/support/chat/${conversationId}/messages`);
}
