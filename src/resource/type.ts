import { PackType } from "../pack";
import { ValuesOf } from "../util";

export const resourceTypes = {
  assets: ["texture", "blockstate", "model", "sound", "language", "text", "font", "shader"],
  data: ["advancement", "function", "loot_table", "predicate", "structure", "recipe", "tag"]
} as const;
export type ResourceType = ValuesOf<typeof resourceTypes[PackType]>;
