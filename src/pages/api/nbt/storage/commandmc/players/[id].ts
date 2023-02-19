import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import type { PlayerContentsValue } from ".";
import { transformPlayerData } from ".";
import type { StorageNBTData } from "../../../../../../helpers/nbt";
import { parseNbtFile } from "../../../../../../helpers/nbt";
import { downloadStorageFile } from "../../../../../../server/ftp-client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const filePath = process.env.FTP_DOWNLOAD_PATH;
  if (!filePath) {
    res.status(500).json({ error: "FTP_DOWNLOAD_PATH is not set" });
    return;
  }

  const inputSchema = z.object({
    id: z.string().regex(/\d+/),
  });
  const schemaResult = await inputSchema.safeParseAsync(req.query);
  if (!schemaResult.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  await downloadStorageFile();
  const result = await parseNbtFile<StorageNBTData<PlayerContentsValue>>(
    filePath
  );
  const contents = result.value.data.value.contents.value;
  const player = contents.players.value.list.value.find(
    (x) => x.id && x.id.value === parseInt(schemaResult.data.id, 10)
  );

  if (!player) {
    res.status(404).json({ error: "Player not found" });
    return;
  }

  return res.status(200).json(transformPlayerData(player));
}
