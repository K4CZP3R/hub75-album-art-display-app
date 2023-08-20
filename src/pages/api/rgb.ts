// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import Jimp from "jimp";
import { Color } from "@/models/packets";

type Data = {
  pixels: Color[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const imageUrl = req.query.url as string;
  const dimensions = parseInt(req.query.dimensions as string);

  let image = await Jimp.read(imageUrl);
  image = image.resize(dimensions, dimensions);

  let pixels: Color[] = [];
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
    let red = image.bitmap.data[idx];
    let green = image.bitmap.data[idx + 1];
    let blue = image.bitmap.data[idx + 2];

    pixels.push({ r: red, g: green, b: blue });
  });

  res.status(200).json({ pixels });
}
