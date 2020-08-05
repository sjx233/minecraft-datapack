import * as path from "path";
import { Component } from "../../text";
import { getResources, makeDir, readJSON, writeJSON } from "../../util";
import ResourceMap = require("../../resource-map");

interface AdvancementDisplay {
  title: Component;
  description: Component;
  icon: {
    item: string;
    nbt?: string;
  };
  background?: string;
  frame?: "task" | "challenge" | "goal";
  show_toast?: boolean;
  announce_to_chat?: boolean;
  hidden?: boolean;
}

interface AdvancementRewards {
  experience?: number;
  loot?: string[];
  recipes?: string[];
  function?: string;
}

interface AdvancementCriterion {
  trigger: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  conditions: any;
}

interface AdvancementCriteria {
  [id: string]: AdvancementCriterion;
}

export interface Advancement {
  parent?: string;
  display?: AdvancementDisplay;
  rewards?: AdvancementRewards;
  criteria: AdvancementCriteria;
  requirements?: string[][];
}

export async function readAdvancements(dir: string, map: ResourceMap<Advancement>): Promise<void> {
  for (const id of await getResources(dir, "advancements", ".json")) {
    const filePath = path.join(dir, id.toPath("advancements", ".json"));
    map.set(id, await readJSON(filePath));
  }
}

export async function writeAdvancements(dir: string, map: ResourceMap<Advancement>): Promise<void> {
  for (const [id, value] of map.entries()) {
    const filePath = path.join(dir, id.toPath("advancements", ".json"));
    await makeDir(path.dirname(filePath));
    await writeJSON(filePath, value);
  }
}
