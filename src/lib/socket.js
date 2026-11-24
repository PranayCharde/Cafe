import { io } from "socket.io-client";

export const LIVE_BACKEND_URL = "https://cafe-backend-production-e4bb93a5.up.railway.app";

// Connect to Railway backend in production, or localhost in development
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:5001"
    : LIVE_BACKEND_URL);

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ["websocket", "polling"],
  reconnectionAttempts: 15,
  reconnectionDelay: 2000,
});

socket.on("connect", () => {
  console.log("🟢 Connected to Cafe Realtime WebSocket:", socket.id, "at", SOCKET_URL);
});

socket.on("connect_error", (err) => {
  console.warn("⚠️ Socket connection error (will retry):", err.message);
});

// Cross-tab broadcast channel for local sync
export const orderBroadcastChannel = typeof window !== "undefined" && "BroadcastChannel" in window
  ? new BroadcastChannel("cafe_orders_sync")
  : null;
