import * as path from "path";
import { getResources, makeDir, readJSON, writeJSON } from "../../util";
import { Predicate } from "./predicate";
import ResourceMap = require("../../resource-map");

interface ConstantRange {
  type: "constant";
  value: number;
}

interface UniformRange {
  type?: "uniform";
  min: number;
  max: number;
}

interface BinomialRange {
  type: "binomial";
  n: number;
  p: number;
}

interface LootEntry {
  type: string;
  conditions?: Predicate[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface LootFunction {
  function: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface LootPool {
  rolls: number | UniformRange | BinomialRange | ConstantRange;
  bonus_rolls?: number | UniformRange;
  entries: LootEntry[];
  conditions?: Predicate[];
  functions?: LootFunction[];
}

export interface LootTable {
  type?: string;
  pools?: LootPool[];
  functions?: LootFunction[];
}

export async function readLootTables(dir: string, map: ResourceMap<LootTable>): Promise<void> {
  for (const id of await getResources(dir, "loot_tables", ".json")) {
    const filePath = path.join(dir, id.toPath("loot_tables", ".json"));
    map.set(id, await readJSON(filePath));
  }
}

export async function writeLootTables(dir: string, map: ResourceMap<LootTable>): Promise<void> {
  for (const [id, value] of map.entries()) {
    const filePath = path.join(dir, id.toPath("loot_tables", ".json"));
    await makeDir(path.dirname(filePath));
    await writeJSON(filePath, value);
  }
}
