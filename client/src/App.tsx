import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import WebRTCDemo from "./WebRTCDemo";

function App() {
  const socketRef = useRef<Socket>(null);
  const [connected, setConnected] = useState(false);
  const [startVideo, setStartVideo] = useState(false);

  useEffect(() => {
    socketRef.current = io("ws://localhost:3000");
    socketRef.current.on("connect", () => {
      setConnected(true);
    });
    socketRef.current.on("disconnect", () => {
      setConnected(false);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      <p className="text-center">{connected ? "Connected" : "Not Connected"}</p>
      <button
        className="border p-2 rounded-md"
        onClick={() => setStartVideo(!startVideo)}
      >
        {startVideo ? "Stop Video" : "Start Video"}
      </button>
      {startVideo && <WebRTCDemo />}
    </div>
  );
}

export default App;
