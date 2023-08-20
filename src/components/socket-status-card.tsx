import { useContext } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Label } from "./ui/label";
import { WebsocketContext } from "@/contexts/websocket.context";

export function SocketStatusCard() {
  const wsContext = useContext(WebsocketContext);
  if (!wsContext) {
    return <div>Serial context not found</div>;
  }

  const { isReady } = wsContext;

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>WebSocket</CardTitle>
      </CardHeader>
      <CardContent>
        {isReady && (
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Info</Label>
              <span className="text-sm text-gray-400">Socket connected!</span>
            </div>
          </div>
        )}

        {!isReady && (
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name">WS not ready</Label>
            <span className="text-sm text-gray-400">
              Your browser is not connected to the socket.
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button disabled={!isReady} variant="outline">
          Disconnect
        </Button>
        <Button disabled={isReady}>Select...</Button>
      </CardFooter>
    </Card>
  );
}
