import { io } from "socket.io-client";

export const socket = io("https://native-3u3v.onrender.com/", {
  transports: ["websocket"],
  reconnection: true
});

export function connectTenant(id) {
  socket.emit("register", id);
}
