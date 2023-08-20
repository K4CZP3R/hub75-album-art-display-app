import SerialContext from "@/contexts/serial.context";
import { BasePacket, PacketType, packetFromBuffer } from "@/models/packets";
import { useCallback, useEffect, useRef, useState } from "react";

interface SerialProviderProps {
  children: React.ReactNode;
}

export default function SerialProvider({ children }: SerialProviderProps) {
  const [serialSupported, setSerialSupported] = useState<boolean>(false);
  const portRef = useRef<SerialPort | null>(null);
  const [portSelected, setPortSelected] = useState<boolean>(false);

  const [messageLock, setMessageLock] = useState<boolean>(false);

  const sendMessage = async (
    message: BasePacket,
    config?: {
      timeout?: number;
      type?: PacketType;
    }
  ) => {
    if (messageLock) {
      console.warn("Already waiting for response");
      return [];
    }
    setMessageLock(true);

    try {
      const writer = portRef.current?.writable.getWriter();
      await writer?.write(message.packet);
      writer?.releaseLock();
    } catch (error) {
      console.log(error);

      return [];
    }

    if (!config?.timeout && !config?.type) {
      console.log("No config");
      setMessageLock(false);
      return [];
    }

    let exit = false;

    if (config.timeout) {
      setTimeout(() => {
        exit = true;
      }, config.timeout);
    }

    let responsePackets: BasePacket[] = [];

    while (portRef.current?.readable && !exit) {
      try {
        const reader = portRef.current.readable.getReader();

        let recvBuffer = Buffer.alloc(0);

        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            reader.releaseLock();
            exit = true;
            break;
          }

          recvBuffer = Buffer.concat([recvBuffer, Buffer.from(value)]);

          const rawPackets = recvBuffer
            .toString("hex")
            .split("1337")
            .filter((x) => x.endsWith("dead"))
            .map((x) => x.slice(0, -4));

          responsePackets = rawPackets
            .map((x) => Buffer.from(x, "hex"))
            .map((x) => packetFromBuffer(x));

          if (config.type) {
            const valid = responsePackets.filter((x) => x.type === config.type);
            if (valid.length > 0) {
              reader.releaseLock();
              exit = true;
              break;
            }
          } else {
            if (responsePackets.length > 0) {
              reader.releaseLock();
              exit = true;
              break;
            }
          }
        }

        reader.releaseLock();
      } catch (error) {
        console.log(error);
        exit = true;
        break;
      }
    }

    console.log("Lock released");
    setMessageLock(false);

    return responsePackets;
  };

  const selectPort = async () => {
    try {
      const selectedPort = await navigator.serial.requestPort();
      if (selectedPort) {
        await selectedPort.open({ baudRate: 115200 });
        portRef.current = selectedPort;
        setPortSelected(true);
      }
    } catch (error) {
      setPortSelected(false);
      console.error(error);
    }
  };

  const closePort = useCallback(async () => {
    try {
      await portRef.current?.close();
      portRef.current = null;
      setPortSelected(false);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setSerialSupported("serial" in navigator);
  }, []);

  return (
    <SerialContext.Provider
      value={{
        serialSupported,
        port: portRef.current,
        selectPort,
        closePort,
        sendMessage,
        portSelected,
        messageLock,
      }}
    >
      {children}
    </SerialContext.Provider>
  );
}
