export function saveToken(token: string) {
  localStorage.setItem("admin_token", token);
}

export function getToken() {
  return localStorage.getItem("admin_token");
}

export function logout() {
  localStorage.removeItem("admin_token");
}
