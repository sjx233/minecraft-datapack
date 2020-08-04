import * as path from "path";
import { getResources, makeDir, readJSON, writeJSON } from "../util";
import ResourceMap = require("../resource-map");

interface AnimationMetadataSection {
  frametime?: number;
  frames?: (number | { time?: number; index: number; })[];
  width?: number;
  height?: number;
  interpolate?: boolean;
}

interface VillagerMetadataSection {
  hat?: "none" | "partial" | "full";
}

interface TextureMetadataSection {
  blur?: boolean;
  clamp?: boolean;
}

export interface TextureMetadata {
  animation?: AnimationMetadataSection;
  villager?: VillagerMetadataSection;
  texture?: TextureMetadataSection;
}

export async function readTextureMetadata(dir: string, map: ResourceMap<TextureMetadata>): Promise<void> {
  for (const id of await getResources(dir, "textures", path => path.endsWith(".png.mcmeta"))) {
    const filePath = path.join(dir, id.toPath("textures", ".png.mcmeta"));
    map.set(id, await readJSON(filePath));
  }
}

export async function writeTextureMetadata(dir: string, map: ResourceMap<TextureMetadata>): Promise<void> {
  for (const [id, value] of map.entries()) {
    const filePath = path.join(dir, id.toPath("textures", ".png.mcmeta"));
    await makeDir(path.dirname(filePath));
    await writeJSON(filePath, value);
  }
}
