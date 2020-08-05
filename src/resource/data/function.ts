import * as path from "path";
import { getResources, makeDir, readLines, writeLines } from "../../util";
import ResourceMap = require("../../resource-map");

export type MCFunction = string[];

export async function readFunctions(dir: string, map: ResourceMap<MCFunction>): Promise<void> {
  for (const id of await getResources(dir, "functions", path => path.endsWith(".mcfunction"))) {
    const filePath = path.join(dir, id.toPath("functions", ".mcfunction"));
    map.set(id, await readLines(filePath));
  }
}

export async function writeFunctions(dir: string, map: ResourceMap<MCFunction>): Promise<void> {
  for (const [id, value] of map.entries()) {
    const filePath = path.join(dir, id.toPath("functions", ".mcfunction"));
    await makeDir(path.dirname(filePath));
    await writeLines(filePath, value);
  }
}
