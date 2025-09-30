import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

const userSocketMap = {}; // {userID : socketID}

io.on("connection", (socket) => {
  console.log(`User ${socket.id} Connected`);
  const userId = socket.handshake.query.userId;

  if (userId) userSocketMap[userId] = socket.id;

  //emits data to all the connected users
  io.emit("getonlineusers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log(`User ${socket.id} Disconnected`);
    delete userSocketMap[userId];
    io.emit("getonlineusers", Object.keys(userSocketMap));
  });
});

export function getRecieverSocketId(userId) {
  return userSocketMap[userId];
}

export { io, app, server };
