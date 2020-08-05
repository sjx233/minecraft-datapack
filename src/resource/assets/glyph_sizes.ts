import { promises as fs } from "fs";
import * as path from "path";
import { getResources, makeDir } from "../../util";
import ResourceMap = require("../../resource-map");

export type GlyphSizes = Uint8Array;

export async function readGlyphSizes(dir: string, map: ResourceMap<GlyphSizes>): Promise<void> {
  for (const id of await getResources(dir, "font", path => path.endsWith(".bin"))) {
    const filePath = path.join(dir, id.toPath("font"));
    map.set(id, await fs.readFile(filePath));
  }
}

export async function writeGlyphSizes(dir: string, map: ResourceMap<GlyphSizes>): Promise<void> {
  for (const [id, value] of map.entries()) {
    const filePath = path.join(dir, id.toPath("font"));
    await makeDir(path.dirname(filePath));
    await fs.writeFile(filePath, value);
  }
}
