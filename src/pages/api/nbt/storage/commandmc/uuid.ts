import type { NextApiRequest, NextApiResponse } from "next";
import type { NbtTag, StorageNBTData } from "../../../../../helpers/nbt";
import { removeNbtWrapping } from "../../../../../helpers/nbt";
import { parseNbtFile } from "../../../../../helpers/nbt";
import { downloadStorageFile } from "../../../../../server/ftp-client";

interface Uuid {
  id: number;
  uuid: [number, number, number, number];
}

interface UuidContentsValue {
  uuid: {
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

  const result = await parseNbtFile<StorageNBTData<UuidContentsValue>>(
    filePath
  );
  const contents = result.value.data.value.contents.value;
  return res
    .status(200)
    .json(contents.uuid.value.list.value.map(transformUuidData));
}

const transformUuidData = (uuidData: Record<string, NbtTag>) => {
  const object: Record<keyof typeof uuidData, unknown> = {};

  Object.keys(uuidData).forEach((key) => {
    const value = uuidData[key as keyof Uuid];
    if (!value) return;
    object[key as keyof Uuid] = removeNbtWrapping(value);
  });

  return object;
};
