import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const socket = io(SOCKET_URL, {
  autoConnect: false,
});

export const connectSocket = (userId, isAdmin = false) => {
  if (!socket.connected) {
    socket.connect();
    socket.on("connect", () => {
      console.log("Connected to notification server");
      socket.emit("join", { userId, isAdmin });
    });

    socket.on("notification", (data) => {
      console.log("New real-time notification:", data);
      import("react-hot-toast").then(({ toast }) => {
        toast.success(data.message || data.title, {
          duration: 5000,
          position: "top-right",
          icon: "🔔",
        });
      });
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from notification server");
    });
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export default socket;
