import { promises as fs } from "fs";
import * as path from "path";
import { promisify } from "util";
import * as zlib from "zlib";
import { getResources, makeDir } from "../util";
import ResourceMap = require("../resource-map");

const gzip = promisify<zlib.InputType, Buffer>(zlib.gzip);
const gunzip = promisify<zlib.InputType, Buffer>(zlib.gunzip);

export type Structure = Uint8Array;

export async function readStructures(dir: string, map: ResourceMap<Structure>): Promise<void> {
  for (const id of await getResources(dir, "structures", path => path.endsWith(".nbt"))) {
    const filePath = path.join(dir, id.toPath("structures", ".nbt"));
    map.set(id, await gunzip(await fs.readFile(filePath)));
  }
}

export async function writeStructures(dir: string, map: ResourceMap<Structure>): Promise<void> {
  for (const [id, value] of map.entries()) {
    const filePath = path.join(dir, id.toPath("structures", ".nbt"));
    await makeDir(path.dirname(filePath));
    await fs.writeFile(filePath, await gzip(value));
  }
}
