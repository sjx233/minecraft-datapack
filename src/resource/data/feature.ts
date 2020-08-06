import * as path from "path";
import { getResources, makeDir, readJSON, writeJSON } from "../../util";
import ResourceMap = require("../../resource-map");

export interface Feature {
  type: string;
  config: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
}

export async function readFeatures(dir: string, map: ResourceMap<Feature>): Promise<void> {
  for (const id of await getResources(dir, "worldgen/configured_feature", ".json")) {
    const filePath = path.join(dir, id.toPath("worldgen/configured_feature", ".json"));
    map.set(id, await readJSON(filePath));
  }
}

export async function writeFeatures(dir: string, map: ResourceMap<Feature>): Promise<void> {
  for (const [id, value] of map.entries()) {
    const filePath = path.join(dir, id.toPath("worldgen/configured_feature", ".json"));
    await makeDir(path.dirname(filePath));
    await writeJSON(filePath, value);
  }
}
