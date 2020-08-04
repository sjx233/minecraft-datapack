import * as path from "path";
import { getResources, makeDir, readJSON, writeJSON } from "../util";
import ResourceMap = require("../resource-map");

export interface Predicate {
  condition: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export async function readPredicates(dir: string, map: ResourceMap<Predicate>): Promise<void> {
  for (const id of await getResources(dir, "predicates", path => path.endsWith(".json"))) {
    const filePath = path.join(dir, id.toPath("predicates", ".json"));
    map.set(id, await readJSON(filePath));
  }
}

export async function writePredicates(dir: string, map: ResourceMap<Predicate>): Promise<void> {
  for (const [id, value] of map.entries()) {
    const filePath = path.join(dir, id.toPath("predicates", ".json"));
    await makeDir(path.dirname(filePath));
    await writeJSON(filePath, value);
  }
}
