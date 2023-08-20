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

export type MatrixImgProps = {
  src?: string;
  dimension: number;
  startPos: { x: number; y: number };
  paletteSize?: number;
};

export default function MatrixImg({
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
      Push to Matrix
    </Button>
  );
}
