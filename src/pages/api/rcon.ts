import type { NextApiRequest, NextApiResponse } from "next";
import { getPlayerCount } from "../../helpers/rcon/player-list";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  res.status(200).json(await getPlayerCount());
};

export default handler;
