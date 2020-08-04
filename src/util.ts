import { promises as fs } from "fs";
import * as path from "path";
import ResourceLocation = require("resource-location");

function stripBOM(str: string): string {
  return str.charCodeAt(0) === 0xfeff ? str.substring(1) : str;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function readJSON(path: string): Promise<any> {
  return JSON.parse(stripBOM(await fs.readFile(path, "utf8")));
}

export async function writeJSON(path: string, value: unknown): Promise<void> {
  await fs.writeFile(path, JSON.stringify(value) + "\n");
}

export async function readLines(path: string): Promise<string[]> {
  return (await fs.readFile(path, "utf8")).trim().split(/\n|\r\n?/g);
}

export async function writeLines(path: string, lines: string[]): Promise<void> {
  await fs.writeFile(path, lines.map(line => line + "\n").join(""));
}

export async function emptyDir(path: string): Promise<void> {
  await fs.rmdir(path, { recursive: true });
  await fs.mkdir(path, { recursive: true });
}

export async function makeDir(path: string): Promise<void> {
  try {
    await fs.mkdir(path, { recursive: true });
  } catch (e) {
    if (e.code === "EEXIST") {
      await fs.unlink(path);
      await fs.mkdir(path);
      return;
    }
    throw e;
  }
}

export async function getNamespaces(dir: string): Promise<string[]> {
  try {
    const results: string[] = [];
    for (const entry of await fs.readdir(dir, { withFileTypes: true }))
      if (entry.isDirectory() && entry.name === entry.name.toLowerCase()) results.push(entry.name);
    return results;
  } catch (e) {
    if (["ENOENT", "ENOTDIR"].includes(e.code)) return [];
    throw e;
  }
}

export async function getResources(dir: string, base: string, filter: (path: string) => boolean): Promise<ResourceLocation[]> {
  const results: ResourceLocation[] = [];
  for (const namespace of await getNamespaces(dir))
    await listResources(path.join(dir, namespace, base), namespace, "", filter, results);
  return results;
}

export async function listResources(dir: string, namespace: string, prefix: string, filter: (path: string) => boolean, results: ResourceLocation[]): Promise<void> {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const fullPath = prefix + entry.name;
    if (entry.isDirectory()) listResources(path.join(dir, entry.name), namespace, fullPath + "/", filter, results);
    else if (!entry.name.endsWith(".mcmeta") && filter(fullPath)) results.push(new ResourceLocation(namespace, fullPath));
  }
}
