import { useCallback, useContext, useEffect } from "react";
import { Button } from "./ui/button";
import SerialContext from "@/contexts/serial.context";
import { MCut, findNearestColor } from "@/services/quantize";
import {
  ClearScreenPacket,
  Color,
  DrawPixelPacket,
  DrawRGBBitmapPacket,
  FeedRGBBitmapPacket,
  InitRGBBitmapPacket,
  PacketType,
} from "@/models/packets";
import { WebsocketContext } from "@/contexts/websocket.context";

export type MatrixImgProps = {
  src?: string;
  dimension: number;
  startPos: { x: number; y: number };
  paletteSize?: number;
  transport?: "serial" | "websocket";
};

function MatrixImgSerial({
  src,
  dimension,
  startPos,
  paletteSize = 16,
}: MatrixImgProps) {
  const serialContext = useContext(SerialContext);

  useEffect(() => {
    pushToMatrix();
  }, [src, serialContext?.portSelected, paletteSize, dimension]);

  if (!serialContext) {
    return <div>Serial context not found</div>;
  }

  const { portSelected, sendMessage, messageLock } = serialContext;

  const pushToMatrix = async () => {
    if (!portSelected || !src) return;

    const rgbData = await fetch(
      `/api/rgb?dimensions=${dimension}&url=${src}`
    ).then((res) => res.json());

    let pixels = rgbData.pixels;
    var mcut = new MCut();
    mcut.init(pixels.map((p: Color) => [p.r, p.g, p.b]));

    var palette = mcut.get_fixed_size_palette(paletteSize);

    pixels = pixels.map((p: Color) => {
      const resp = findNearestColor([p.r, p.g, p.b], palette);
      if (!resp) {
        return { r: 0, g: 0, b: 0 };
      }
      return {
        r: resp[0],
        g: resp[1],
        b: resp[2],
      };
    });

    const messages = [
      new InitRGBBitmapPacket({
        size: {
          width: dimension,
          height: dimension,
        },
      }),
      ...FeedRGBBitmapPacket.fromPixelsIntoMultiplePackets(pixels),
    ];

    let progress = 0;
    for (const message of messages) {
      const retPackets = await sendMessage(message, {
        timeout: 3000,
        type: PacketType.Ret,
      });

      await sendMessage(
        new DrawPixelPacket({
          color: { r: 255, g: 0, b: 0 },
          pos: { x: progress, y: 0 },
        }),
        {
          timeout: 3000,
          type: PacketType.Ret,
        }
      );

      progress += 1;
      console.log("Received packets", retPackets);
    }

    await sendMessage(new ClearScreenPacket());
    await sendMessage(new DrawRGBBitmapPacket({ pos: startPos }));
  };

  return (
    <Button
      onClick={() => {
        pushToMatrix();
      }}
      disabled={!portSelected || messageLock}
    >
      Push to Matrix (Serial)
    </Button>
  );
}

function MatrixImgSocket({
  src,
  dimension,
  startPos,
  paletteSize = 16,
}: MatrixImgProps) {
  const socketContext = useContext(WebsocketContext);

  useEffect(() => {
    pushToMatrix();
  }, [src, socketContext?.isReady, paletteSize, dimension]);

  if (!socketContext) {
    return <div>Serial context not found</div>;
  }

  const { isReady, ws } = socketContext;

  const pushToMatrix = async () => {
    if (!isReady || !src) return;

    const rgbData = await fetch(
      `/api/rgb?dimensions=${dimension}&url=${src}`
    ).then((res) => res.json());

    let pixels = rgbData.pixels;
    var mcut = new MCut();
    mcut.init(pixels.map((p: Color) => [p.r, p.g, p.b]));

    var palette = mcut.get_fixed_size_palette(paletteSize);

    pixels = pixels.map((p: Color) => {
      const resp = findNearestColor([p.r, p.g, p.b], palette);
      if (!resp) {
        return { r: 0, g: 0, b: 0 };
      }
      return {
        r: resp[0],
        g: resp[1],
        b: resp[2],
      };
    });

    const messages = [
      new InitRGBBitmapPacket({
        size: {
          width: dimension,
          height: dimension,
        },
      }),
      ...FeedRGBBitmapPacket.fromPixelsIntoMultiplePackets(pixels),
      new ClearScreenPacket(),
      new DrawRGBBitmapPacket({ pos: startPos }),
    ];

    let progress = 0;
    for (const message of messages) {
      ws?.send(message.packet);
      // const retPackets = await sendMessage(message, {
      //   timeout: 3000,
      //   type: PacketType.Ret,
      // });

      progress += 1;
      // console.log("Received packets", retPackets);
    }
  };

  return (
    <Button
      onClick={() => {
        pushToMatrix();
      }}
      disabled={!isReady}
    >
      Push to Matrix (Socket)
    </Button>
  );
}

export default function MatrixImg(props: MatrixImgProps) {
  if (props.transport === "serial") {
    return <MatrixImgSerial {...props} />;
  } else if (props.transport === "websocket") {
    return <MatrixImgSocket {...props} />;
  } else {
    return <div>Invalid transport</div>;
  }
}
