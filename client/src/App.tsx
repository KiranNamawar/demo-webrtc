import { useState } from "react";
import AudioDemo from "./AudioDemo";
import { useSocket } from "./socketContext";
import WebRTCDemo from "./WebRTCDemo";

function App() {
  const [startVideo, setStartVideo] = useState(false);
  const [startAudio, setStartAudio] = useState(false);
  const { isConnected } = useSocket();

  return (
    <div className="flex flex-col items-center">
      <p className="text-center">
        {isConnected ? "Connected" : "Not Connected"}
      </p>
      <button
        className="border p-2 rounded-md"
        onClick={() => setStartVideo(!startVideo)}
      >
        {startVideo ? "Stop Video" : "Start Video"}
      </button>
      {startVideo && <WebRTCDemo />}

      <button
        className="border p-2 rounded-md"
        onClick={() => setStartAudio(!startAudio)}
      >
        {startAudio ? "Stop Audio" : "Start Audio"}
      </button>
      {startAudio && <AudioDemo />}
    </div>
  );
}

export default App;
