import { io } from "socket.io-client";

// Previously hardcoded to the old backend's onrender.com deployment — now
// pulled from an env var so this points at whatever AN group's real-time
// service ends up being, matching the pattern already used in
// app/admin/page.js. Falls back to localhost for local dev against a mock
// server.
export const socket = io(
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000",
  {
    transports: ["websocket"],
    reconnection: true,
  }
);

export function connectTenant(id) {
  socket.emit("register", id);
}
