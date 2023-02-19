import type { NextApiRequest, NextApiResponse } from "next";
import type { Player } from "../../../../../../helpers/api";
import type { NbtTag, StorageNBTData } from "../../../../../../helpers/nbt";
import { removeNbtWrapping } from "../../../../../../helpers/nbt";
import { parseNbtFile } from "../../../../../../helpers/nbt";
import { downloadStorageFile } from "../../../../../../server/ftp-client";

export interface PlayerContentsValue {
  players: {
    value: {
      list: {
        value: Record<string, NbtTag>[];
      };
    };
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const filePath = process.env.FTP_DOWNLOAD_PATH;
  if (!filePath) {
    res.status(500).json({ error: "FTP_DOWNLOAD_PATH is not set" });
    return;
  }

  await downloadStorageFile();
  const result = await parseNbtFile<StorageNBTData<PlayerContentsValue>>(
    filePath
  );
  const contents = result.value.data.value.contents.value;
  return res
    .status(200)
    .json(contents.players.value.list.value.map(transformPlayerData));
}

export const transformPlayerData = (playerData: Record<string, NbtTag>) => {
  const object: Record<keyof typeof playerData, unknown> = {};

  Object.keys(playerData).forEach((key) => {
    const value = playerData[key as keyof Player];
    if (!value) return;
    object[key as keyof Player] = removeNbtWrapping(value);
  });

  return object;
};
