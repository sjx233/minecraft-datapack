import * as path from "path";
import { getResources, makeDir, readJSON, writeJSON } from "../../util";
import ResourceMap = require("../../resource-map");

interface PoolElement {
  element_type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface WeightedPoolElement {
  element: PoolElement;
  weight: number;
}

export interface TemplatePool {
  name: string;
  fallback: string;
  elements: WeightedPoolElement[];
}

export async function readTemplatePools(dir: string, map: ResourceMap<TemplatePool>): Promise<void> {
  for (const id of await getResources(dir, "worldgen/template_pool", ".json")) {
    const filePath = path.join(dir, id.toPath("worldgen/template_pool", ".json"));
    map.set(id, await readJSON(filePath));
  }
}

export async function writeTemplatePools(dir: string, map: ResourceMap<TemplatePool>): Promise<void> {
  for (const [id, value] of map.entries()) {
    const filePath = path.join(dir, id.toPath("worldgen/template_pool", ".json"));
    await makeDir(path.dirname(filePath));
    await writeJSON(filePath, value);
  }
}
