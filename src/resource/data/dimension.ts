import * as path from "path";
import { getResources, makeDir, readJSON, writeJSON } from "../../util";
import ResourceMap = require("../../resource-map");

interface Generator {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface Dimension {
  type: string;
  generator: Generator;
}

export async function readDimensions(dir: string, map: ResourceMap<Dimension>): Promise<void> {
  for (const id of await getResources(dir, "dimension", ".json")) {
    const filePath = path.join(dir, id.toPath("dimension", ".json"));
    map.set(id, await readJSON(filePath));
  }
}

export async function writeDimensions(dir: string, map: ResourceMap<Dimension>): Promise<void> {
  for (const [id, value] of map.entries()) {
    const filePath = path.join(dir, id.toPath("dimension", ".json"));
    await makeDir(path.dirname(filePath));
    await writeJSON(filePath, value);
  }
}
