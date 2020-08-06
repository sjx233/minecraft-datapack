import * as path from "path";
import { getResources, makeDir, readJSON, writeJSON } from "../../util";
import ResourceMap = require("../../resource-map");

interface Stronghold {
  distance: number;
  spread: number;
  count: number;
}

interface Structure {
  spacing: number;
  separation: number;
  salt: number;
}

interface Structures {
  stronghold?: Stronghold;
  structures: {
    [id: string]: Structure;
  };
}

interface NoiseSampling {
  xz_scale: number;
  y_scale: number;
  xz_factor: number;
  y_factor: number;
}

interface NoiseSlide {
  target: number;
  size: number;
  offset: number;
}

interface Noise {
  height: number;
  sampling: NoiseSampling;
  top_slide: NoiseSlide;
  bottom_slide: NoiseSlide;
  size_horizontal: number;
  size_vertical: number;
  density_factor: number;
  density_offset: number;
  simplex_surface_noise: boolean;
  random_density_offset?: boolean;
  island_noise_override?: boolean;
  amplified?: boolean;
}

interface BlockState {
  Name: string;
  Properties?: {
    [key: string]: string;
  };
}

export interface NoiseSettings {
  structures: Structures;
  noise: Noise;
  default_block: BlockState;
  default_fluid: BlockState;
  bedrock_roof_position: number;
  bedrock_floor_position: number;
  sea_level: number;
  disable_mob_generation: boolean;
}

export async function readNoiseSettings(dir: string, map: ResourceMap<NoiseSettings>): Promise<void> {
  for (const id of await getResources(dir, "worldgen/noise_settings", ".json")) {
    const filePath = path.join(dir, id.toPath("worldgen/noise_settings", ".json"));
    map.set(id, await readJSON(filePath));
  }
}

export async function writeNoiseSettings(dir: string, map: ResourceMap<NoiseSettings>): Promise<void> {
  for (const [id, value] of map.entries()) {
    const filePath = path.join(dir, id.toPath("worldgen/noise_settings", ".json"));
    await makeDir(path.dirname(filePath));
    await writeJSON(filePath, value);
  }
}
