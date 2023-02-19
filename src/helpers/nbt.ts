import { readFileSync } from "fs";
import { parse } from "../nbt";

// TODO: somehow the friend list is not filled with the correct data
export const parseNbtFile = async <TResult>(filePath: string) =>
  new Promise<TResult>((resolve, reject) => {
    const fileData = readFileSync(filePath);
    parse(fileData, (err, data) => {
      if (err) {
        reject(err);
      }

      resolve(data as TResult);
    });
  });

export interface StorageNBTData<
  TContentsValue = Record<string, { value: Record<string, unknown> }>
> {
  value: {
    data: {
      value: {
        contents: {
          value: TContentsValue;
        };
      };
    };
  };
}

interface NbtString {
  type: "string";
  value: string;
}

interface NbtInt {
  type: "int";
  value: number;
}

interface NbtCompoundList {
  type: "compound";
  value: Record<`${number}`, Record<string, NbtTag>>;
}

interface NbtCompound {
  type: "compound";
  value: Record<string, NbtTag>;
}

interface NbtList {
  type: "list";
  value: NbtEnd | NbtCompoundList;
}

interface NbtEnd {
  type: "end";
  value: unknown[];
}

interface NbtIntArray {
  type: "intArray";
  value: number[];
}

export type NbtTag =
  | NbtString
  | NbtInt
  | NbtCompound
  | NbtIntArray
  | NbtList
  | NbtEnd;

export const removeNbtWrapping = (value: NbtTag) => {
  if (value.type === "list") {
    if (value.value.type === "end") {
      return value.value.value;
    }

    if (value.value.value === undefined) {
      return [];
    }

    return Object.values(value.value.value)
      .filter((v) => v !== undefined && v !== null)
      .map((v) => {
        const object: Record<keyof typeof v, unknown> = {};
        Object.entries(v).forEach(([key, value]) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          object[key] = removeNbtWrapping(value);
        });
        return object;
      });
  }
  if (value.type === "string") {
    return value.value;
  }
  if (value.type === "int") {
    return value.value;
  }

  if (value.type === "intArray") {
    return value.value;
  }

  if (value.type !== "compound") {
    return value;
  }

  const object: Record<keyof typeof value.value, unknown> = {};

  for (const key in value.value) {
    const v = value.value[key];
    if (!v) continue;
    object[key] = removeNbtWrapping(v);
  }

  return object;
};
