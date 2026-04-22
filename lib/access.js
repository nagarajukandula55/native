export function can(user, permission) {
  if (!user) return false;

  const permissions = user.permissions || [];

  // Super wildcard (future use)
  if (permissions.includes("*")) return true;

  return permissions.includes(permission);
}
