import * as path from "path";
import { getResources, makeDir, readJSON, writeJSON } from "../util";
import ResourceMap = require("../resource-map");

type TagEntry = string | { id: string; required?: boolean; };

export interface Tag {
  values: TagEntry[];
  replace?: boolean;
}

export async function readTags(dir: string, map: ResourceMap<Tag>): Promise<void> {
  for (const id of await getResources(dir, "tags", path => path.endsWith(".json"))) {
    const filePath = path.join(dir, id.toPath("tags", ".json"));
    map.set(id, await readJSON(filePath));
  }
}

export async function writeTags(dir: string, map: ResourceMap<Tag>): Promise<void> {
  for (const [id, value] of map.entries()) {
    const filePath = path.join(dir, id.toPath("tags", ".json"));
    await makeDir(path.dirname(filePath));
    await writeJSON(filePath, value);
  }
}
