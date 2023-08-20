import SerialContext from "@/contexts/serial.context";
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

export function SerialSelector() {
  const serialContext = useContext(SerialContext);
  if (!serialContext) {
    return <div>Serial context not found</div>;
  }

  const { serialSupported, selectPort, closePort, portSelected, port } =
    serialContext;

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Serial</CardTitle>
        <CardDescription>Select your Matrix device.</CardDescription>
      </CardHeader>
      <CardContent>
        {portSelected && (
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Info</Label>
              <span className="text-sm text-gray-400">
                VID={port!.getInfo().usbVendorId}, PID=
                {port!.getInfo().usbProductId}
              </span>
            </div>
          </div>
        )}

        {!portSelected && !serialSupported && (
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name">Serial not supported</Label>
            <span className="text-sm text-gray-400">
              Your browser does not support serial.
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button disabled={!portSelected} onClick={closePort} variant="outline">
          Disconnect
        </Button>
        <Button onClick={selectPort} disabled={portSelected}>
          Select...
        </Button>
      </CardFooter>
    </Card>
  );
}
