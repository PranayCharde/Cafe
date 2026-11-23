import { io } from "socket.io-client";

// In dev with Vite proxy or direct backend port
const SOCKET_URL = window.location.hostname === "localhost" ? "http://localhost:5001" : "/";

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
});

socket.on("connect", () => {
  console.log("🟢 Connected to Cafe Realtime WebSocket:", socket.id);
});

socket.on("connect_error", (err) => {
  console.warn("⚠️ Socket connection error (will retry):", err.message);
});

// Cross-tab broadcast channel for local sync
export const orderBroadcastChannel = typeof window !== "undefined" && "BroadcastChannel" in window
  ? new BroadcastChannel("cafe_orders_sync")
  : null;

