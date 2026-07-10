import { anGet, anPost, anPatch } from "./client";

export async function adminListUsers() {
  return anGet("/api/admin/users");
}

export async function adminCreateUser(payload: any) {
  return anPost("/api/admin/users", payload);
}

export async function registerAdmin(payload: any) {
  return anPost("/api/admin/register", payload);
}

/**
 * ANgroup's real PATCH /api/users/[id] route (confirmed by reading
 * src/app/api/users/[id]/route.ts) lets a logged-in user update their own
 * name/phone/avatar (email/username/role are admin-only fields on the same
 * route). userId must be the current session's own id — the route 403s
 * otherwise.
 */
export async function updateProfile(
  userId: string,
  updates: { name?: string; phone?: string; avatar?: string }
) {
  return anPatch(`/api/users/${userId}`, updates);
}

/**
 * ANgroup's real POST /api/auth/change-password route (confirmed by
 * reading src/app/api/auth/change-password/route.ts). Body:
 * { currentPassword, newPassword }. On success the backend expects the
 * user to sign in again — it doesn't rotate the current session token.
 */
export async function changePassword(currentPassword: string, newPassword: string) {
  return anPost("/api/auth/change-password", { currentPassword, newPassword });
}
