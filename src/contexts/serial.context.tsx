import { BasePacket, PacketType } from "@/models/packets";
import { createContext } from "react";

interface SerialContextProps {
  serialSupported: boolean;
  port: SerialPort | null;
  selectPort: () => Promise<void>;
  closePort: () => Promise<void>;
  sendMessage: (
    message: BasePacket,
    config?: {
      timeout?: number;
      type?: PacketType;
    }
  ) => Promise<BasePacket[]>;
  portSelected: boolean;
  messageLock: boolean;
}

const SerialContext = createContext<SerialContextProps | null>(null);

export default SerialContext;
