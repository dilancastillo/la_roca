declare module "node:fs/promises" {
  export function readFile(path: string | URL): Promise<Buffer>;
}

declare module "node:path" {
  const path: {
    join: (...paths: string[]) => string;
  };

  export = path;
}

declare class Buffer extends Uint8Array {
  static from(data: string | ArrayBuffer | ArrayBufferView | ArrayLike<number>): Buffer;
  toString(encoding?: string): string;
}

declare const process: {
  env: Record<string, string | undefined>;
  cwd(): string;
};
