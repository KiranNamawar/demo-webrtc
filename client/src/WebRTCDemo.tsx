import { useEffect, useRef } from "react";
import { useSocket } from "./socketContext";

function WebRTCDemo() {
  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const { socket, isConnected } = useSocket();

  const pcRef = useRef<RTCPeerConnection>(null);
  const localStreamRef = useRef<MediaStream>(null);

  const contraints = { audio: true, video: true };
  const config = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  useEffect(() => {
    if (!isConnected) return;

    let isMounted = true;

    const pc = new RTCPeerConnection(config);
    pcRef.current = pc;

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) socket.emit("send-ice-candidate", candidate);
    };

    pc.onnegotiationneeded = async () => {
      try {
        await pc.setLocalDescription(await pc.createOffer());
        socket.emit("send-offer", pc.localDescription);
      } catch (err) {
        console.error("Error during negotiation: " + err);
      }
    };

    pc.ontrack = (evt) => {
      if (remoteVideo.current) remoteVideo.current.srcObject = evt.streams[0];
    };

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(contraints);
        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        localStreamRef.current = stream;
        if (localVideo.current) localVideo.current.srcObject = stream;
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      } catch (err) {
        console.error("Error accessing media devices: " + err);
      }
    }
    start();

    const handleReceiveIce = async (candidate: RTCIceCandidateInit) => {
      try {
        if (pc.remoteDescription)
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Error adding ICE candidate: " + err);
      }
    };

    const handleReceiveOffer = async (offer: RTCSessionDescriptionInit) => {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        await pc.setLocalDescription(await pc.createAnswer());
        socket.emit("send-answer", pc.localDescription);
      } catch (err) {
        console.error("Error handling offer: " + err);
      }
    };

    const handleReceiveAnswer = (answer: RTCSessionDescriptionInit) => {
      try {
        pc.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (err) {
        console.error("Error handling answer: " + err);
      }
    };

    socket.on("receive-ice-candidate", handleReceiveIce);
    socket.on("receive-offer", handleReceiveOffer);
    socket.on("receive-answer", handleReceiveAnswer);

    return () => {
      isMounted = false;
      socket.off("receive-ice-candidate", handleReceiveIce);
      socket.off("receive-offer", handleReceiveOffer);
      socket.off("receive-answer", handleReceiveAnswer);

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }

      if (localVideo.current) localVideo.current.srcObject = null;
      if (remoteVideo.current) remoteVideo.current.srcObject = null;

      pc.close();
      pcRef.current = null;
    };
  }, [isConnected, socket]);

  return (
    <div className="grid w-full h-full gap-2 p-2 grid-cols-2">
      <div className="border rounded-md flex flex-col items-center">
        <p className="mb-2 font-semibold">Local</p>
        <video
          ref={localVideo}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover rounded"
        />
      </div>
      <div className="border rounded-md flex flex-col items-center">
        <p className="mb-2 font-semibold">Remote</p>
        <video
          ref={remoteVideo}
          autoPlay
          playsInline
          className="h-full w-full object-cover rounded"
        />
      </div>
    </div>
  );
}

export default WebRTCDemo;
