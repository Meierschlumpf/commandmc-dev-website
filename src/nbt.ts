import { gunzip } from "zlib";

interface NBT {
  tagTypes: {
    end: 0;
    byte: 1;
    short: 2;
    int: 3;
    long: 4;
    float: 5;
    double: 6;
    byteArray: 7;
    string: 8;
    list: 9;
    compound: 10;
    intArray: 11;
    longArray: 12;
  };
  tagTypeNames: {
    0: "end";
    1: "byte";
    2: "short";
    3: "int";
    4: "long";
    5: "float";
    6: "double";
    7: "byteArray";
    8: "string";
    9: "list";
    10: "compound";
    11: "intArray";
    12: "longArray";
  };
  parse(
    data: ArrayBuffer | Buffer,
    callback: (error: Error | null, result: unknown | null) => void
  ): void;
}

const tagTypes = {
  end: 0,
  byte: 1,
  short: 2,
  int: 3,
  long: 4,
  float: 5,
  double: 6,
  byteArray: 7,
  string: 8,
  list: 9,
  compound: 10,
  intArray: 11,
  longArray: 12,
} as const;

const generateTagTypeNames = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tagTypeNames: any = {};
  let name: keyof NBT["tagTypes"];
  for (name in tagTypes) {
    if (tagTypes.hasOwnProperty(name)) {
      const tagType = tagTypes[name];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      tagTypeNames[tagType] = name;
    }
  }
  return tagTypeNames as NBT["tagTypeNames"];
};

const tagTypeNames: NBT["tagTypeNames"] = generateTagTypeNames();

type ReadDataViewDataType =
  | "Int8"
  | "Uint8"
  | "Int16"
  | "Int32"
  | "Float32"
  | "Float64";

class Reader {
  private offset = 0;
  private arrayView: Uint8Array;
  private dataView: DataView;

  constructor(data: ArrayBuffer | Buffer) {
    this.arrayView = new Uint8Array(data);
    this.dataView = new DataView(this.arrayView.buffer);
  }

  private read(dataType: ReadDataViewDataType, size: number) {
    const value = this.dataView[`get${dataType}`](this.offset);
    this.offset += size;
    return value;
  }

  public byte = () => this.read("Int8", 1) as keyof NBT["tagTypeNames"];
  private ubyte = () => this.read("Uint8", 1);
  private short = () => this.read("Int16", 2);
  private int = () => this.read("Int32", 4);
  private float = () => this.read("Float32", 4);
  private double = () => this.read("Float64", 8);
  private long = () => [this.int(), this.int()];
  private byteArray = () => {
    const length = this.int();
    const bytes = [];
    for (let i = 0; i < length; i++) {
      bytes.push(this.byte());
    }
    return bytes;
  };

  private intArray = () => {
    const lenth = this.int();
    const ints = [];
    for (let i = 0; i < lenth; i++) {
      ints.push(this.int());
    }
    return ints;
  };

  private longArray = () => {
    const lenth = this.int();
    const longs = [];
    for (let i = 0; i < lenth; i++) {
      longs.push(this.long());
    }
    return longs;
  };

  public string = () => {
    const length = this.short();
    const slice = sliceUint8Array(
      this.arrayView,
      this.offset,
      this.offset + length
    );
    this.offset += length;
    return decodeUTF8(slice);
  };

  private list = (): unknown[] => {
    const type = this.byte();
    const length = this.int();
    const name = tagTypeNames[type];

    const method = name === "end" ? () => undefined : this[name];
    const values = [];
    for (let i = 0; i < length; i++) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      values.push(method());
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return values;
  };

  public compound = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const values: any = {};
    while (true) {
      const type = this.byte();
      if (type === tagTypes.end) {
        break;
      }
      const name = this.string();
      const method = this[tagTypeNames[type]];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      values[name] = {
        type: tagTypeNames[type],
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        value: method(),
      };
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return values;
  };
}

const sliceUint8Array = (array: Uint8Array, begin: number, end: number) => {
  if ("slice" in array) {
    return array.slice(begin, end);
  } else {
    return new Uint8Array([].slice.call(array, begin, end));
  }
};

const parseUncompressed = (data: Buffer | Uint8Array) => {
  if (!data) {
    throw new Error('Argument "data" is falsy');
  }

  const reader = new Reader(data);

  const type = reader.byte();
  if (type !== tagTypes.compound) {
    throw new Error("Top tag should be a compound");
  }

  return {
    name: reader.string(),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    value: reader.compound(),
  };
};

export const parse = (
  data: Buffer,
  callback: (error: Error | null, result: unknown | null) => void
) => {
  if (!data) {
    throw new Error('Argument "data" is falsy');
  }

  if (!hasGzipHeader(data)) {
    callback(null, parseUncompressed(data));
  } else {
    let buffer: Buffer | Uint8Array;
    if (data.length) {
      buffer = data;
    } else if (typeof Buffer !== "undefined") {
      buffer = Buffer.from(data);
    } else {
      buffer = new Uint8Array(data);
    }

    gunzip(buffer, function (error, uncompressed) {
      if (error) {
        callback(error, null);
      } else {
        callback(null, parseUncompressed(uncompressed));
      }
    });
  }
};

function hasGzipHeader(data: ArrayBuffer | Buffer) {
  const head = new Uint8Array(data.slice(0, 2));
  return head.length === 2 && head[0] === 0x1f && head[1] === 0x8b;
}

function decodeUTF8(array: Uint8Array) {
  const codepoints: number[] = [];
  for (let i = 0; i < array.length; i++) {
    const firstItem = array[i];
    if (firstItem == undefined) continue;
    if ((firstItem & 0x80) === 0) {
      codepoints.push(firstItem & 0x7f);
      continue;
    }

    const secondItem = array[i + 1];
    if (secondItem == undefined) continue;

    if (
      i + 1 < array.length &&
      (firstItem & 0xe0) === 0xc0 &&
      (secondItem & 0xc0) === 0x80
    ) {
      codepoints.push(((firstItem & 0x1f) << 6) | (secondItem & 0x3f));
    }

    const thirdItem = array[i + 2];
    if (thirdItem == undefined) continue;
    if (
      i + 2 < array.length &&
      (firstItem & 0xf0) === 0xe0 &&
      (secondItem & 0xc0) === 0x80 &&
      (thirdItem & 0xc0) === 0x80
    ) {
      codepoints.push(
        ((firstItem & 0x0f) << 12) |
          ((secondItem & 0x3f) << 6) |
          (thirdItem & 0x3f)
      );
    }

    const fourthItem = array[i + 3];
    if (fourthItem == undefined) continue;
    if (
      i + 3 < array.length &&
      (firstItem & 0xf8) === 0xf0 &&
      (secondItem & 0xc0) === 0x80 &&
      (thirdItem & 0xc0) === 0x80 &&
      (fourthItem & 0xc0) === 0x80
    ) {
      codepoints.push(
        ((firstItem & 0x07) << 18) |
          ((secondItem & 0x3f) << 12) |
          ((thirdItem & 0x3f) << 6) |
          (fourthItem & 0x3f)
      );
    }
  }
  return String.fromCharCode.apply(null, codepoints);
}
