// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import SpotifyWebApi from "spotify-web-api-node";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const spot = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI,
  });

  const auth = await spot.authorizationCodeGrant(req.query.code as string);

  res.redirect(
    "/serial?token=" +
      auth.body.access_token +
      "&refresh=" +
      auth.body.refresh_token +
      "&expires=" +
      auth.body.expires_in +
      "&scope=" +
      auth.body.scope +
      "&type=" +
      auth.body.token_type +
      "&scope=" +
      auth.body.scope +
      "&expires_in=" +
      auth.body.expires_in +
      "&refresh_token=" +
      auth.body.refresh_token +
      "&access_token=" +
      auth.body.access_token +
      "&code=" +
      req.query.code
  );
}
