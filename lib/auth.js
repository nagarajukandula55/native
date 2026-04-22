export function hasPermission(user, permission) {
  if (!user) return false;

  if (user.role === "super_admin") return true;

  return user.permissions?.includes(permission);
}
