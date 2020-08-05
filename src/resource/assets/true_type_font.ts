import { promises as fs } from "fs";
import * as path from "path";
import { getResources, makeDir } from "../../util";
import ResourceMap = require("../../resource-map");

export type TrueTypeFont = Uint8Array;

export async function readTrueTypeFonts(dir: string, map: ResourceMap<TrueTypeFont>): Promise<void> {
  for (const id of await getResources(dir, "font", path => path.endsWith(".ttf"))) {
    const filePath = path.join(dir, id.toPath("font"));
    map.set(id, await fs.readFile(filePath));
  }
}

export async function writeTrueTypeFonts(dir: string, map: ResourceMap<TrueTypeFont>): Promise<void> {
  for (const [id, value] of map.entries()) {
    const filePath = path.join(dir, id.toPath("font"));
    await makeDir(path.dirname(filePath));
    await fs.writeFile(filePath, value);
  }
}
