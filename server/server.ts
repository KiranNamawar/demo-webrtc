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

  socket.on("send-ice-candidate", (candidate) => {
    console.log("candidate");
    socket.broadcast.emit("receive-ice-candidate", candidate);
  });

  socket.on("send-offer", (offer) => {
    console.log("offer");
    socket.broadcast.emit("receive-offer", offer);
  });

  socket.on("send-answer", (answer) => {
    console.log("answer");
    socket.broadcast.emit("receive-answer", answer);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected with socket id: " + socket.id);
  });
});

httpServer.listen(3000, () => {
  console.log("server is running at http://localhost:3000");
});
