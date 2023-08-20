import SerialProvider from "@/providers/serial.provider";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SerialProvider>
      <Component {...pageProps} />
    </SerialProvider>
  );
}
