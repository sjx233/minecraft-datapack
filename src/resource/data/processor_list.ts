import * as path from "path";
import { getResources, makeDir, readJSON, writeJSON } from "../../util";
import ResourceMap = require("../../resource-map");

interface Processor {
  processor_type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface ProcessorList {
  processors: Processor[];
}

export async function readProcessorLists(dir: string, map: ResourceMap<ProcessorList>): Promise<void> {
  for (const id of await getResources(dir, "worldgen/processor_list", ".json")) {
    const filePath = path.join(dir, id.toPath("worldgen/processor_list", ".json"));
    map.set(id, await readJSON(filePath));
  }
}

export async function writeProcessorLists(dir: string, map: ResourceMap<ProcessorList>): Promise<void> {
  for (const [id, value] of map.entries()) {
    const filePath = path.join(dir, id.toPath("worldgen/processor_list", ".json"));
    await makeDir(path.dirname(filePath));
    await writeJSON(filePath, value);
  }
}
