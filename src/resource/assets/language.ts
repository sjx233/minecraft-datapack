import * as path from "path";
import { getResources, makeDir, readJSON, writeJSON } from "../../util";
import ResourceMap = require("../../resource-map");

export type Language = Record<string, string>;

export async function readLanguages(dir: string, map: ResourceMap<Language>): Promise<void> {
  for (const id of await getResources(dir, "lang", ".json")) {
    const filePath = path.join(dir, id.toPath("lang", ".json"));
    map.set(id, await readJSON(filePath));
  }
}

export async function writeLanguages(dir: string, map: ResourceMap<Language>): Promise<void> {
  for (const [id, value] of map.entries()) {
    const filePath = path.join(dir, id.toPath("lang", ".json"));
    await makeDir(path.dirname(filePath));
    await writeJSON(filePath, value);
  }
}
