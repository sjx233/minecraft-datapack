import * as path from "path";
import { getNamespaces, makeDir, readJSON, writeJSON } from "../../util";
import ResourceMap = require("../../resource-map");
import ResourceLocation = require("resource-location");

export interface SoundEvent {
  sounds?: [];
  replace?: boolean;
  subtitle?: string;
}

export async function readSoundEvents(dir: string, map: ResourceMap<SoundEvent>): Promise<void> {
  for (const namespace of await getNamespaces(dir)) {
    const filePath = path.join(dir, namespace, "sounds.json");
    const soundEvents: Record<string, SoundEvent> = await readJSON(filePath);
    for (const id in soundEvents)
      map.set(new ResourceLocation(namespace, id), soundEvents[id]);
  }
}

export async function writeSoundEvents(dir: string, map: ResourceMap<SoundEvent>): Promise<void> {
  const namespaces = new Map<string, Record<string, SoundEvent>>();
  for (const [{ namespace, path: id }, value] of map.entries()) {
    let soundEvents = namespaces.get(namespace);
    if (!soundEvents) namespaces.set(namespace, soundEvents = {});
    soundEvents[id] = value;
  }
  for (const [namespace, soundEvents] of namespaces.entries()) {
    const filePath = path.join(dir, namespace, "sounds.json");
    await makeDir(path.dirname(filePath));
    await writeJSON(filePath, soundEvents);
  }
}
