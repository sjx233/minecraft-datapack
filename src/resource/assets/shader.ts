import { promises as fs } from "fs";
import * as path from "path";
import { getResources, makeDir } from "../../util";
import ResourceMap = require("../../resource-map");

export type Shader = string;

export async function readShaders(dir: string, map: ResourceMap<Shader>): Promise<void> {
  for (const id of await getResources(dir, "shaders/program", path => !path.endsWith(".json"))) {
    const filePath = path.join(dir, id.toPath("shaders/program"));
    map.set(id, await fs.readFile(filePath, "utf8"));
  }
}

export async function writeShaders(dir: string, map: ResourceMap<Shader>): Promise<void> {
  for (const [id, value] of map.entries()) {
    const filePath = path.join(dir, id.toPath("shaders/program"));
    await makeDir(path.dirname(filePath));
    await fs.writeFile(filePath, value);
  }
}
