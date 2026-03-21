import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_BASE_URL;
const SOCKET_URL = API_URL ? new URL(API_URL).origin : "";

const socket = io(SOCKET_URL, {
  autoConnect: false,
});

// Setup listeners once
socket.on("connect", () => {
  console.log("Connected to notification server");
});

socket.on("notification", (data) => {
  console.log("New real-time notification:", data);
});

socket.on("disconnect", () => {
  console.log("Disconnected from notification server");
});

// Shared handler for join to avoid duplication
const joinRoomHandler = (userId, isAdmin) => {
  if (socket.connected) {
    socket.emit("join", { userId, isAdmin });
  }
};

export const connectSocket = (userId, isAdmin = false) => {
  if (!socket.connected) {
    socket.connect();
    
    // Remove previous listeners to avoid duplicates
    socket.off("connect");
    
    // Setup connect listener to join rooms once connected
    socket.on("connect", () => {
      console.log("Connected to notification server");
      joinRoomHandler(userId, isAdmin);
    });
  } else {
    // If already connected, join rooms immediately with current info
    joinRoomHandler(userId, isAdmin);
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export default socket;
