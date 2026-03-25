import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_BASE_URL;
const SOCKET_URL = API_URL ? new URL(API_URL).origin : "";

const socket = io(SOCKET_URL, {
  autoConnect: false,
  path: "/socket.io/",
  transports: ["polling", "websocket"],
  withCredentials: false,
  auth: {
    token: localStorage.getItem("token"),
  },
});

// Global listeners
socket.on("connect", () => {
  console.log("Connected to notification server");
});

socket.on("notification", (data) => {
  console.log("New real-time notification:", data);
});

socket.on("disconnect", (reason) => {
  console.log("Disconnected from notification server:", reason);
});

socket.on("connect_error", (err) => {
  console.error("Socket connection error:", err.message);
});

export const connectSocket = () => {
  if (!SOCKET_URL) {
    console.error("SOCKET_URL is missing");
    return;
  }

  // Update token before connecting in case it changed
  socket.auth.token = localStorage.getItem("token");

  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export default socket;
