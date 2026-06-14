import { useParams } from "react-router";
import WebRTCDemo from "./WebRTCDemo";

function Room() {
  const { room } = useParams();
  return (
    <div className="flex flex-col items-center">
      <h1 className="font-bold text-2xl">{room}</h1>
      <WebRTCDemo room={room!} />
    </div>
  );
}

export default Room;
