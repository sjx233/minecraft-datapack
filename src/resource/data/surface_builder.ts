import * as path from "path";
import { getResources, makeDir, readJSON, writeJSON } from "../../util";
import ResourceMap = require("../../resource-map");

export interface SurfaceBuilder {
  type: string;
  config: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
}

export async function readSurfaceBuilders(dir: string, map: ResourceMap<SurfaceBuilder>): Promise<void> {
  for (const id of await getResources(dir, "worldgen/configured_surface_builder", ".json")) {
    const filePath = path.join(dir, id.toPath("worldgen/configured_surface_builder", ".json"));
    map.set(id, await readJSON(filePath));
  }
}

export async function writeSurfaceBuilders(dir: string, map: ResourceMap<SurfaceBuilder>): Promise<void> {
  for (const [id, value] of map.entries()) {
    const filePath = path.join(dir, id.toPath("worldgen/configured_surface_builder", ".json"));
    await makeDir(path.dirname(filePath));
    await writeJSON(filePath, value);
  }
}
