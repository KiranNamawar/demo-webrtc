import { useEffect, useRef, useState } from "react";
import { useSocket } from "./socketContext";

export default function WebRTCDemo({ room }: { room: string }) {
  const { socket, isConnected } = useSocket();

  const localVideoRef = useRef<HTMLVideoElement>(null);

  const localStreamRef = useRef<MediaStream | null>(null);

  const peerConnectionsRef = useRef(new Map<string, RTCPeerConnection>());

  const [remoteStreams, setRemoteStreams] = useState<
    {
      userId: string;
      stream: MediaStream;
    }[]
  >([]);

  const rtcConfig: RTCConfiguration = {
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302",
      },
      {
        urls: [
          "turn:webrtc.justanotherdemo.site:3478?transport=udp",
          "turn:webrtc.justanotherdemo.site:3478?transport=tcp",
        ],
        username: "webrtc",
        credential: "secret",
      },
    ],
  };

  function addRemoteStream(userId: string, stream: MediaStream) {
    setRemoteStreams((prev) => {
      const exists = prev.some((s) => s.userId === userId);

      if (exists) {
        return prev.map((s) => (s.userId === userId ? { userId, stream } : s));
      }

      return [...prev, { userId, stream }];
    });
  }

  function removeRemoteStream(userId: string) {
    setRemoteStreams((prev) => prev.filter((s) => s.userId !== userId));
  }

  function createPeer(userId: string) {
    const existing = peerConnectionsRef.current.get(userId);

    if (existing) return existing;

    const pc = new RTCPeerConnection(rtcConfig);

    peerConnectionsRef.current.set(userId, pc);

    localStreamRef.current?.getTracks().forEach((track) => {
      pc.addTrack(track, localStreamRef.current!);
    });

    pc.onicecandidate = ({ candidate }) => {
      if (!candidate) return;

      socket?.emit("ice-candidate", {
        target: userId,
        candidate,
      });
    };

    pc.ontrack = (event) => {
      addRemoteStream(userId, event.streams[0]);
    };

    pc.onconnectionstatechange = () => {
      console.log(userId, pc.connectionState);
    };

    return pc;
  }

  useEffect(() => {
    if (!isConnected || !socket) return;

    let mounted = true;

    async function init() {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      if (!mounted) return;

      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      if (isConnected) socket.emit("join-room", room);
    }

    init();

    socket.on("existing-users", async (users: string[]) => {
      for (const userId of users) {
        const pc = createPeer(userId);

        const offer = await pc.createOffer();

        await pc.setLocalDescription(offer);

        socket.emit("offer", {
          target: userId,
          offer,
        });
      }
    });

    socket.on("user-joined", async (userId: string) => {
      console.log("user joined", userId);
    });

    socket.on(
      "offer",
      async ({
        sender,
        offer,
      }: {
        sender: string;
        offer: RTCSessionDescriptionInit;
      }) => {
        const pc = createPeer(sender);

        await pc.setRemoteDescription(offer);

        const answer = await pc.createAnswer();

        await pc.setLocalDescription(answer);

        socket.emit("answer", {
          target: sender,
          answer,
        });
      },
    );

    socket.on(
      "answer",
      async ({
        sender,
        answer,
      }: {
        sender: string;
        answer: RTCSessionDescriptionInit;
      }) => {
        const pc = peerConnectionsRef.current.get(sender);

        if (!pc) return;

        await pc.setRemoteDescription(answer);
      },
    );

    socket.on(
      "ice-candidate",
      async ({
        sender,
        candidate,
      }: {
        sender: string;
        candidate: RTCIceCandidateInit;
      }) => {
        const pc = peerConnectionsRef.current.get(sender);

        if (!pc) return;

        try {
          await pc.addIceCandidate(candidate);
        } catch (err) {
          console.error(err);
        }
      },
    );

    socket.on("user-left", (userId: string) => {
      const pc = peerConnectionsRef.current.get(userId);

      pc?.close();

      peerConnectionsRef.current.delete(userId);

      removeRemoteStream(userId);
    });

    return () => {
      mounted = false;

      socket.off("existing-users");
      socket.off("user-joined");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("user-left");

      peerConnectionsRef.current.forEach((pc) => pc.close());

      peerConnectionsRef.current.clear();

      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [socket, isConnected]);

  return (
    <div className="grid gap-4">
      <div>
        <h2>Local</h2>
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full max-w-md"
        />
      </div>

      <div>
        <h2>Remote Users</h2>

        <div className="grid grid-cols-2 gap-4">
          {remoteStreams.map((remote) => (
            <RemoteVideo key={remote.userId} stream={remote.stream} />
          ))}
        </div>
      </div>
    </div>
  );
}

function RemoteVideo({ stream }: { stream: MediaStream }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.srcObject = stream;
    }
  }, [stream]);

  return <video ref={ref} autoPlay playsInline className="w-full" />;
}
