import * as path from "path";
import { getResources, makeDir, readJSON, writeJSON } from "../../util";
import ResourceMap = require("../../resource-map");

export interface StructureFeature {
  type: string;
  config: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
}

export async function readStructureFeatures(dir: string, map: ResourceMap<StructureFeature>): Promise<void> {
  for (const id of await getResources(dir, "worldgen/configured_structure_feature", ".json")) {
    const filePath = path.join(dir, id.toPath("worldgen/configured_structure_feature", ".json"));
    map.set(id, await readJSON(filePath));
  }
}

export async function writeStructureFeatures(dir: string, map: ResourceMap<StructureFeature>): Promise<void> {
  for (const [id, value] of map.entries()) {
    const filePath = path.join(dir, id.toPath("worldgen/configured_structure_feature", ".json"));
    await makeDir(path.dirname(filePath));
    await writeJSON(filePath, value);
  }
}
