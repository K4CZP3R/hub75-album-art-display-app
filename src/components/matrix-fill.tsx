import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SerialContext from "@/contexts/serial.context";
import { WebsocketContext } from "@/contexts/websocket.context";
import { FillScreenPacket, PacketType } from "@/models/packets";
import { useCallback, useContext } from "react";

export type MatrixFillProps = {
  transport: "serial" | "websocket";
};

function MatrixFillSerial() {
  const serialContext = useContext(SerialContext);

  const fillWithColor = useCallback(async (color: string) => {
    let packet: FillScreenPacket | undefined = undefined;

    switch (color) {
      case "red":
        packet = new FillScreenPacket({
          color: {
            r: 255,
            g: 0,
            b: 0,
          },
        });
        break;
      case "green":
        packet = new FillScreenPacket({
          color: {
            r: 0,
            g: 255,
            b: 0,
          },
        });
        break;
      case "blue":
        packet = new FillScreenPacket({
          color: {
            r: 0,
            g: 0,
            b: 255,
          },
        });
        break;
      case "white":
        packet = new FillScreenPacket({
          color: {
            r: 255,
            g: 255,
            b: 255,
          },
        });
        break;
      case "black":
        packet = new FillScreenPacket({
          color: {
            r: 0,
            g: 0,
            b: 0,
          },
        });
        break;
    }

    if (!packet) return;

    await sendMessage(packet, { type: PacketType.Ret, timeout: 1000 });
  }, []);

  if (!serialContext) {
    return <div>Serial context not found</div>;
  }

  const { portSelected, sendMessage, messageLock } = serialContext;

  return (
    <Card className="w-[450px]">
      <CardHeader>
        <CardTitle>Fill Screen</CardTitle>
        <CardDescription>FillScreenPacket via Serial</CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between">
        {["Red", "Green", "Blue", "White", "Black"].map((color) => (
          <Button
            key={color}
            onClick={() => fillWithColor(color.toLowerCase())}
            variant="outline"
            disabled={!portSelected || messageLock}
          >
            {color}
          </Button>
        ))}
      </CardFooter>
    </Card>
  );
}

function MatrixFillWebsocket() {
  const wsContext = useContext(WebsocketContext);

  const fillWithColor = useCallback(
    async (color: string) => {
      let packet: FillScreenPacket | undefined = undefined;

      switch (color) {
        case "red":
          packet = new FillScreenPacket({
            color: {
              r: 255,
              g: 0,
              b: 0,
            },
          });
          break;
        case "green":
          packet = new FillScreenPacket({
            color: {
              r: 0,
              g: 255,
              b: 0,
            },
          });
          break;
        case "blue":
          packet = new FillScreenPacket({
            color: {
              r: 0,
              g: 0,
              b: 255,
            },
          });
          break;
        case "white":
          packet = new FillScreenPacket({
            color: {
              r: 255,
              g: 255,
              b: 255,
            },
          });
          break;
        case "black":
          packet = new FillScreenPacket({
            color: {
              r: 0,
              g: 0,
              b: 0,
            },
          });
          break;
      }

      if (!packet) return;

      console.log("ws is", ws, packet.packet);
      ws?.send(packet.packet);

      // await sendMessage(packet, { type: PacketType.Ret, timeout: 1000 });
    },
    [wsContext?.isReady]
  );

  if (!wsContext) {
    return <div>WS context not found</div>;
  }

  const { isReady, ws } = wsContext;

  return (
    <Card className="w-[450px]">
      <CardHeader>
        <CardTitle>Fill Screen</CardTitle>
        <CardDescription>FillScreenPacket via WS</CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between">
        {["Red", "Green", "Blue", "White", "Black"].map((color) => (
          <Button
            key={color}
            onClick={() => fillWithColor(color.toLowerCase())}
            variant="outline"
            disabled={!isReady}
          >
            {color}
          </Button>
        ))}
      </CardFooter>
    </Card>
  );
}

export function MatrixFill({ transport }: MatrixFillProps) {
  if (transport === "serial") {
    return <MatrixFillSerial />;
  } else if (transport === "websocket") {
    return <MatrixFillWebsocket />;
  } else {
    return <div>Invalid transport</div>;
  }
}
