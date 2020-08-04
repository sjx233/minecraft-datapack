import { promises as fs } from "fs";
import * as path from "path";
import { getResources, makeDir } from "../util";
import ResourceMap = require("../resource-map");

export type FontData = Uint8Array;

export async function readFontData(dir: string, map: ResourceMap<FontData>): Promise<void> {
  for (const id of await getResources(dir, "sounds", path => !path.endsWith(".json"))) {
    const filePath = path.join(dir, id.toPath("sounds"));
    map.set(id, await fs.readFile(filePath));
  }
}

export async function writeFontData(dir: string, map: ResourceMap<FontData>): Promise<void> {
  for (const [id, value] of map.entries()) {
    const filePath = path.join(dir, id.toPath("sounds"));
    await makeDir(path.dirname(filePath));
    await fs.writeFile(filePath, value);
  }
}
