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
    clientId: "868eeab41f0246c0bfb3cbcddaf8fa55",
    redirectUri: "http://localhost:3000/api/callback",
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
