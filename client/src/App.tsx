import { useState } from "react";
import WebRTCDemo from "./WebRTCDemo";

function App() {
  const [startVideo, setStartVideo] = useState(false);

  return (
    <div className="flex flex-col items-center">
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
