import * as path from "path";
import { getResources, makeDir, readJSON, writeJSON } from "../util";
import ResourceMap = require("../resource-map");

export interface Recipe {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export async function readRecipes(dir: string, map: ResourceMap<Recipe>): Promise<void> {
  for (const id of await getResources(dir, "recipes", path => path.endsWith(".json"))) {
    const filePath = path.join(dir, id.toPath("recipes", ".json"));
    map.set(id, await readJSON(filePath));
  }
}

export async function writeRecipes(dir: string, map: ResourceMap<Recipe>): Promise<void> {
  for (const [id, value] of map.entries()) {
    const filePath = path.join(dir, id.toPath("recipes", ".json"));
    await makeDir(path.dirname(filePath));
    await writeJSON(filePath, value);
  }
}
