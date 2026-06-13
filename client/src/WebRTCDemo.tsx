import { useEffect, useRef } from "react";

function WebRTCDemo() {
  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);

  const localPC = useRef<RTCPeerConnection>(null);
  const remotePC = useRef<RTCPeerConnection>(null);

  const streamRef = useRef<MediaStream>(null);

  useEffect(() => {
    let isCancelled = false;
    async function start() {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      if (isCancelled) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      if (localVideo.current) {
        localVideo.current.srcObject = stream;
      }

      localPC.current = new RTCPeerConnection();
      remotePC.current = new RTCPeerConnection();

      localPC.current.onicecandidate = (evt) => {
        if (evt.candidate) {
          remotePC.current?.addIceCandidate(evt.candidate);
        }
      };
      remotePC.current.onicecandidate = (evt) => {
        if (evt.candidate) {
          localPC.current?.addIceCandidate(evt.candidate);
        }
      };

      remotePC.current.ontrack = (evt) => {
        if (remoteVideo.current && evt.streams[0]) {
          remoteVideo.current.srcObject = evt.streams[0];
        }
      };

      stream.getTracks().forEach((track) => {
        localPC.current?.addTrack(track, stream);
      });

      const offer = await localPC.current.createOffer();
      await localPC.current.setLocalDescription(offer);
      await remotePC.current.setRemoteDescription(offer);

      const answer = await remotePC.current.createAnswer();
      await remotePC.current.setLocalDescription(answer);
      await localPC.current.setRemoteDescription(answer);
    }
    start();

    return () => {
      isCancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (localPC.current) {
        localPC.current.close();
      }
      if (remotePC.current) {
        remotePC.current.close();
      }
    };
  }, []);

  return (
    <div className="grid w-full h-full gap-2 p-2 grid-cols-2">
      <div className="border rounded-md flex flex-col items-center">
        <p>Local</p>
        <video
          ref={localVideo}
          autoPlay
          className="h-full w-full object-cover"
        />
      </div>
      <div className="border rounded-md flex flex-col items-center">
        <p>Remote</p>
        <video
          ref={remoteVideo}
          autoPlay
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}

export default WebRTCDemo;
