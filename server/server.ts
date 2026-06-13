import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("user connected with socket id: " + socket.id);

  socket.on("disconnect", () => {
    console.log("user disconnected with socket id: " + socket.id);
  });
});

httpServer.listen(3000, () => {
  console.log("server is running at http://localhost:3000");
});
