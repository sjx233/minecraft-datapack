import { promises as fs } from "fs";
import * as path from "path";
import { getResources, makeDir } from "../../util";
import ResourceMap = require("../../resource-map");

export type Text = string;

export async function readTexts(dir: string, map: ResourceMap<Text>): Promise<void> {
  for (const id of await getResources(dir, "texts", ".txt")) {
    const filePath = path.join(dir, id.toPath("texts", ".txt"));
    map.set(id, await fs.readFile(filePath, "utf8"));
  }
}

export async function writeTexts(dir: string, map: ResourceMap<Text>): Promise<void> {
  for (const [id, value] of map.entries()) {
    const filePath = path.join(dir, id.toPath("texts", ".txt"));
    await makeDir(path.dirname(filePath));
    await fs.writeFile(filePath, value);
  }
}
