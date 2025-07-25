 
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL);

    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("🔥 Socket connected from client:", socketInstance.id);
      socketInstance?.emit('register', 'participant');
    });

 
    socketInstance.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
