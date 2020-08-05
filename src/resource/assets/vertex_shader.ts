import { promises as fs } from "fs";
import * as path from "path";
import { getResources, makeDir } from "../../util";
import ResourceMap = require("../../resource-map");

export type VertexShader = string;

export async function readVertexShaders(dir: string, map: ResourceMap<VertexShader>): Promise<void> {
  for (const id of await getResources(dir, "shaders/program", path => path.endsWith(".vsh"))) {
    const filePath = path.join(dir, id.toPath("shaders/program"));
    map.set(id, await fs.readFile(filePath, "utf8"));
  }
}

export async function writeVertexShaders(dir: string, map: ResourceMap<VertexShader>): Promise<void> {
  for (const [id, value] of map.entries()) {
    const filePath = path.join(dir, id.toPath("shaders/program"));
    await makeDir(path.dirname(filePath));
    await fs.writeFile(filePath, value);
  }
}
