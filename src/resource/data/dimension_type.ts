import * as path from "path";
import { getResources, makeDir, readJSON, writeJSON } from "../../util";
import ResourceMap = require("../../resource-map");

export interface DimensionType {
  fixed_time?: number;
  has_skylight: boolean;
  has_ceiling: boolean;
  ultrawarm: boolean;
  natural: boolean;
  coordinate_scale: number;
  piglin_safe: boolean;
  bed_works: boolean;
  respawn_anchor_works: boolean;
  has_raids: boolean;
  logical_height: number;
  infiniburn: string;
  ambient_light: number;
}

export async function readDimensionTypes(dir: string, map: ResourceMap<DimensionType>): Promise<void> {
  for (const id of await getResources(dir, "dimension_type", ".json")) {
    const filePath = path.join(dir, id.toPath("dimension_type", ".json"));
    map.set(id, await readJSON(filePath));
  }
}

export async function writeDimensionTypes(dir: string, map: ResourceMap<DimensionType>): Promise<void> {
  for (const [id, value] of map.entries()) {
    const filePath = path.join(dir, id.toPath("dimension_type", ".json"));
    await makeDir(path.dirname(filePath));
    await writeJSON(filePath, value);
  }
}
