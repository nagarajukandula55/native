import { io } from "socket.io-client";

export const socket = io("https://YOUR-ANU.onrender.com", {
  transports: ["websocket"],
  reconnection: true
});

export function connectTenant(id) {
  socket.emit("register", id);
}
