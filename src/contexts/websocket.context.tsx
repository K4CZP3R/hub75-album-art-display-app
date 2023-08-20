import { createContext } from "react";

export const WebsocketContext = createContext<
  | {
      isReady: boolean;
      ws: WebSocket | null;
    }
  | undefined
>(undefined);
