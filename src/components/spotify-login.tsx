import { useRouter } from "next/router";
import { Button } from "./ui/button";
import { LogIn } from "lucide-react";
import { useEffect } from "react";

export type SpotifyLoginProps = {
  disabled?: boolean;
};

export default function SpotifyLogin({ disabled }: SpotifyLoginProps) {
  const router = useRouter();

  return (
    <Button
      disabled={disabled}
      variant="outline"
      onClick={() => {
        router.push("/api/auth");
      }}
    >
      <LogIn className="mr-2 h-4 w-4" /> Login with Spotify
    </Button>
  );
}
