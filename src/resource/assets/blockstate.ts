import * as path from "path";
import { getResources, makeDir, readJSON, writeJSON } from "../../util";
import ResourceMap = require("../../resource-map");

interface Variant {
  model: string;
  x?: 0 | 90 | 180 | 270;
  y?: 0 | 90 | 180 | 270;
  uvlock?: boolean;
  weight?: number;
}

interface MultiVariant {
  [state: string]: Variant | Variant[];
}

type Condition =
  | { OR: Condition[]; }
  | { AND: Condition[]; }
  | { [key: string]: string; };

interface Selector {
  when?: Condition;
  apply: Variant | Variant[];
}

export interface Blockstate {
  variants?: MultiVariant;
  multipart?: Selector[];
}

export async function readBlockstates(dir: string, map: ResourceMap<Blockstate>): Promise<void> {
  for (const id of await getResources(dir, "blockstates", path => path.endsWith(".json"))) {
    const filePath = path.join(dir, id.toPath("blockstates", ".json"));
    map.set(id, await readJSON(filePath));
  }
}

export async function writeBlockstates(dir: string, map: ResourceMap<Blockstate>): Promise<void> {
  for (const [id, value] of map.entries()) {
    const filePath = path.join(dir, id.toPath("blockstates", ".json"));
    await makeDir(path.dirname(filePath));
    await writeJSON(filePath, value);
  }
}
