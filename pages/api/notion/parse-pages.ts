import { parseCollection } from "@/utils/page-parser";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    let collection = await parseCollection();
    res.status(200).json(collection)
  } else {
    // Handle any other HTTP method
  }
}
