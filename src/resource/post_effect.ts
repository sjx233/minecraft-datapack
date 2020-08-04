import * as path from "path";
import { getResources, makeDir, readJSON, writeJSON } from "../util";
import ResourceMap = require("../resource-map");

type Target = string | { name: string; width?: number; height?: number; };

interface AuxTarget {
  name: string;
  id: string;
}

interface AuxTexture {
  name: string;
  id: string;
  width: number;
  height: number;
  bilinear: boolean;
}

interface Uniform {
  name: string;
  values: number[];
}

interface Pass {
  name: string;
  intarget: string;
  outtarget: string;
  auxtargets?: (AuxTarget | AuxTexture)[];
  uniforms?: Uniform[];
}

export interface PostEffect {
  targets?: Target[];
  passes?: Pass[];
}

export async function readPostEffects(dir: string, map: ResourceMap<PostEffect>): Promise<void> {
  for (const id of await getResources(dir, "shaders/post", path => path.endsWith(".json"))) {
    const filePath = path.join(dir, id.toPath("shaders/post", ".json"));
    map.set(id, await readJSON(filePath));
  }
}

export async function writePostEffects(dir: string, map: ResourceMap<PostEffect>): Promise<void> {
  for (const [id, value] of map.entries()) {
    const filePath = path.join(dir, id.toPath("shaders/post", ".json"));
    await makeDir(path.dirname(filePath));
    await writeJSON(filePath, value);
  }
}
