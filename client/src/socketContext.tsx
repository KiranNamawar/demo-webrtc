import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";

interface SocketConnectedProps {
  isConnected: true;
  socket: Socket;
}

interface SocketDisconnectedProps {
  isConnected: false;
  socket: null;
}

type SocketContextType = SocketConnectedProps | SocketDisconnectedProps;
const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socketStatus, setSocketStatus] = useState<SocketContextType>({
    socket: null,
    isConnected: false,
  });

  useEffect(() => {
    const socket = io("ws://localhost:3000");

    socket.on("connect", () =>
      setSocketStatus({
        socket,
        isConnected: true,
      }),
    );
    socket.on("disconnect", () =>
      setSocketStatus({
        socket: null,
        isConnected: false,
      }),
    );

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socketStatus}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
