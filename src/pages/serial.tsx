import { MatrixFill } from "@/components/matrix-fill";
import { SerialSelector } from "@/components/serial-selector";
import { SocketStatusCard } from "@/components/socket-status-card";
import { SpotifyCard } from "@/components/spotify-card";
import SpotifyLogin from "@/components/spotify-login";
import { Button } from "@/components/ui/button";
import SerialContext from "@/contexts/serial.context";
import { FillScreenPacket, PacketType } from "@/models/packets";
import { useContext } from "react";

export default function Serial() {
  const serialContext = useContext(SerialContext);
  if (!serialContext) {
    return <div>Serial context not found</div>;
  }

  const { serialSupported, selectPort, port, closePort, sendMessage } =
    serialContext;

  return (
    <div>
      <div className="flex">
        <SerialSelector />
        <SocketStatusCard />
      </div>
      <div className="flex">
        <MatrixFill transport="serial" />
        <MatrixFill transport="websocket" />
      </div>
      <SpotifyCard />
    </div>
  );
}
