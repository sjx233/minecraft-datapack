import { promises as fs } from "fs";
import * as path from "path";
import { getResources, makeDir } from "../../util";
import ResourceMap = require("../../resource-map");

export type Sound = Uint8Array;

export async function readSounds(dir: string, map: ResourceMap<Sound>): Promise<void> {
  for (const id of await getResources(dir, "sounds", ".ogg")) {
    const filePath = path.join(dir, id.toPath("sounds", ".ogg"));
    map.set(id, await fs.readFile(filePath));
  }
}

export async function writeSounds(dir: string, map: ResourceMap<Sound>): Promise<void> {
  for (const [id, value] of map.entries()) {
    const filePath = path.join(dir, id.toPath("sounds", ".ogg"));
    await makeDir(path.dirname(filePath));
    await fs.writeFile(filePath, value);
  }
}
