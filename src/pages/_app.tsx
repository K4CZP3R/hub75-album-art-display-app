import SerialProvider from "@/providers/serial.provider";
import { WebsocketProvider } from "@/providers/websocket.provider";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WebsocketProvider url="ws://192.168.178.78/ws">
      <SerialProvider>
        <Component {...pageProps} />
      </SerialProvider>
    </WebsocketProvider>
  );
}
