declare module "node:fs/promises" {
  export function readFile(path: string | URL): Promise<Buffer>;
  export function readFile(
    path: string | URL,
    encoding: "utf8",
  ): Promise<string>;
  export function mkdir(
    path: string | URL,
    options?: { recursive?: boolean },
  ): Promise<string | undefined>;
  export function writeFile(
    path: string | URL,
    data: string | Uint8Array,
    encoding?: "utf8",
  ): Promise<void>;
  export function rm(
    path: string | URL,
    options?: { recursive?: boolean; force?: boolean },
  ): Promise<void>;
}

declare module "node:path" {
  const path: {
    join: (...paths: string[]) => string;
    resolve: (...paths: string[]) => string;
    dirname: (path: string) => string;
    sep: string;
  };

  export = path;
}

declare module "node:crypto" {
  export function randomUUID(): string;
}

declare class Buffer extends Uint8Array {
  static from(
    data: string | ArrayBuffer | ArrayBufferView | ArrayLike<number>,
    encoding?: "base64" | "utf8",
  ): Buffer;
  toString(encoding?: string): string;
}

declare const process: {
  env: Record<string, string | undefined>;
  cwd(): string;
};
