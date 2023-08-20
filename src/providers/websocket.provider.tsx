import { WebsocketContext } from "@/contexts/websocket.context";
import { useEffect, useRef, useState } from "react";

export type WebsocketContextProps = {
  url: string;
  children: React.ReactNode;
};

export function WebsocketProvider({ url, children }: WebsocketContextProps) {
  const [isReady, setIsReady] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket(url);

    socket.onopen = () => setIsReady(true);
    socket.onclose = () => setIsReady(false);
    socket.onmessage = (event) => {
      console.log("ws message", event.data);

      // Data is a blob, print as hex
      const reader = new FileReader();
      reader.addEventListener("loadend", () => {
        const text = reader.result;
        console.log(text);
      });
      reader.readAsText(event.data);
    };

    wsRef.current = socket;

    return () => {
      socket.close();
    };
  }, [url]);

  const ret = {
    isReady,
    ws: wsRef.current,
  };

  return (
    <WebsocketContext.Provider value={ret}>
      {children}
    </WebsocketContext.Provider>
  );
}
