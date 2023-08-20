// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import SpotifyWebApi from "spotify-web-api-node";

type Data = {
  name: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const spot = new SpotifyWebApi({
    clientId: "868eeab41f0246c0bfb3cbcddaf8fa55",
    clientSecret: "d5d8822abb6442a3b879f1cc8900b444",
    redirectUri: "http://localhost:3000/api/callback",
  });

  res.redirect(spot.createAuthorizeURL(["user-read-playback-state"], "state"));
}
