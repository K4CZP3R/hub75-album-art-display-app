import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SpotifyLogin from "./spotify-login";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import SpotifyWebApi from "spotify-web-api-js";
import MatrixImg from "./matrix-img";

export function SpotifyCard() {
  const router = useRouter();

  const spotifyRef = useRef<SpotifyWebApi.SpotifyWebApiJs | null>(null);
  const [spotifyActive, setSpotifyActive] = useState(false);

  const [currentSong, setCurrentSong] =
    useState<SpotifyApi.CurrentlyPlayingObject | null>(null);

  const [paletteSize, setPaletteSize] = useState(16);
  const [coverSize, setCoverSize] = useState(32);

  useEffect(() => {
    const queryToken = router.query.token as string;
    if (queryToken) {
      localStorage.setItem("token", queryToken);
    }
    const token = localStorage.getItem("token");
    if (token) {
      spotifyRef.current = new SpotifyWebApi();
      spotifyRef.current.setAccessToken(token);
      setSpotifyActive(true);
    }
  }, []);

  useEffect(() => {
    if (!spotifyRef.current) return;

    spotifyRef.current.getMyCurrentPlayingTrack().then((track) => {
      setCurrentSong(track);
    });
  }, [spotifyActive]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!spotifyRef.current) return;

      spotifyRef.current.getMyCurrentPlayingTrack().then((track) => {
        setCurrentSong(track);
      });
    }, 10 * 1000);
    return () => clearInterval(interval);
  }, [spotifyActive]);

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Spotify</CardTitle>
        <CardDescription>Control Spotify here.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name">Current Song</Label>
            <span className="text-sm text-gray-400">
              {currentSong?.item?.name ?? "No song playing"}
            </span>
            <Label htmlFor="name">Cover Art</Label>
            <Image
              alt="Cover Art"
              width={128}
              height={128}
              src={currentSong?.item?.album?.images[0].url}
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name">Display settings</Label>
            <span className="text-sm text-gray-400">{paletteSize} colors</span>
            <Input
              type="number"
              value={paletteSize}
              disabled={!spotifyActive}
              onChange={(e) => {
                setPaletteSize(parseInt(e.target.value));
              }}
            />
            <span className="text-sm text-gray-400">
              {coverSize}x{coverSize} size
            </span>
            <Input
              type="number"
              value={coverSize}
              disabled={!spotifyActive}
              max={32}
              min={2}
              onChange={(e) => {
                setCoverSize(parseInt(e.target.value));
              }}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <SpotifyLogin disabled={spotifyActive} />
        <MatrixImg
          src={currentSong?.item?.album?.images[0].url}
          dimension={coverSize}
          startPos={{ x: 0, y: 0 }}
          paletteSize={paletteSize}
        />
      </CardFooter>
    </Card>
  );
}
