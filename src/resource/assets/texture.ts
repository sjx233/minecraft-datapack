import { promises as fs } from "fs";
import * as path from "path";
import { getResources, makeDir } from "../../util";
import ResourceMap = require("../../resource-map");

export type Texture = Uint8Array;

export async function readTextures(dir: string, map: ResourceMap<Texture>): Promise<void> {
  for (const id of await getResources(dir, "textures", ".png")) {
    const filePath = path.join(dir, id.toPath("textures", ".png"));
    map.set(id, await fs.readFile(filePath));
  }
}

export async function writeTextures(dir: string, map: ResourceMap<Texture>): Promise<void> {
  for (const [id, value] of map.entries()) {
    const filePath = path.join(dir, id.toPath("textures", ".png"));
    await makeDir(path.dirname(filePath));
    await fs.writeFile(filePath, value);
  }
}
