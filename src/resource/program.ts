import * as path from "path";
import { getResources, makeDir, readJSON, writeJSON } from "../util";
import ResourceMap = require("../resource-map");

interface Sampler {
  name: string;
}

interface Uniform {
  name: string;
  type: string;
  count: number;
  values: number[];
}

interface Blend {
  func?: string;
  srcrgb?: string;
  dstrgb?: string;
  srcalpha?: string;
  dstalpha?: string;
}

export interface Program {
  vertex: string;
  fragment: string;
  samplers?: Sampler[];
  attributes?: string[];
  uniforms?: Uniform[];
  blend?: Blend;
}

export async function readPrograms(dir: string, map: ResourceMap<Program>): Promise<void> {
  for (const id of await getResources(dir, "shaders/program", path => path.endsWith(".json"))) {
    const filePath = path.join(dir, id.toPath("shaders/program", ".json"));
    map.set(id, await readJSON(filePath));
  }
}

export async function writePrograms(dir: string, map: ResourceMap<Program>): Promise<void> {
  for (const [id, value] of map.entries()) {
    const filePath = path.join(dir, id.toPath("shaders/program", ".json"));
    await makeDir(path.dirname(filePath));
    await writeJSON(filePath, value);
  }
}
