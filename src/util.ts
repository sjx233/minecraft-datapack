import * as glob from "fast-glob";
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import ResourceLocation = require("resource-location");

const readdir = promisify(fs.readdir);

export type ValuesOf<T> = T extends readonly (infer U)[] ? U : never;

export function mostFrequent<T>(arr: T[], defaultValue: T): T {
  arr = Array.from(arr).sort();
  const counts = new Map<T, number>();
  for (const value of arr)
    counts.set(value, (counts.get(value) ?? 0) + 1);
  let result = defaultValue;
  let max = 0;
  for (const [value, count] of counts)
    if (count > max) {
      result = value;
      max = count;
    }
  return result;
}

export async function* getNamespaces(dirname: string): AsyncGenerator<string, void> {
  for (const entry of await readdir(dirname, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const name = entry.name;
    if (name === name.toLowerCase()) yield name;
  }
}

export async function* getResourceLocations(dirname: string, base: string, extension = ""): AsyncGenerator<ResourceLocation, void> {
  const sliceIndex = -extension.length;
  const pattern = "*" + extension;
  const options: glob.Options = { baseNameMatch: true };
  for await (const namespace of getNamespaces(dirname)) {
    options.cwd = path.join(dirname, namespace, base);
    for await (const path of glob.stream(pattern, options))
      yield new ResourceLocation(namespace, path.toString().slice(0, sliceIndex));
  }
}
