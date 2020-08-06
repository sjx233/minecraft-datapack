import * as path from "path";
import { getResources, makeDir, readJSON, writeJSON } from "../../util";
import ResourceMap = require("../../resource-map");

type CarvingStep = "air" | "liquid";
type MobCategory = "monster" | "creature" | "ambient" | "water_creature" | "water_ambient" | "misc";

interface Particle {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface ParticleSettings {
  options: Particle;
  probability: number;
}

interface MoodSoundSettings {
  sound: string;
  tick_delay: number;
  block_search_extent: number;
  offset: number;
}

interface AdditionsSoundSettings {
  sound: string;
  tick_chance: number;
}

interface MusicSettings {
  sound: string;
  min_delay: number;
  max_delay: number;
  replace_current_music: boolean;
}

interface BiomeEffects {
  fog_color: number;
  water_color: number;
  water_fog_color: number;
  sky_color: number;
  foliage_color?: number;
  grass_color?: number;
  grass_color_modifier?: "none" | "dark_forest" | "swamp";
  particle?: ParticleSettings;
  ambient_sound?: string;
  mood_sound?: MoodSoundSettings;
  additions_sound?: AdditionsSoundSettings;
  music?: MusicSettings;
}

interface Spawner {
  type: string;
  weight: number;
  minCount: number;
  maxCount: number;
}

interface SpawnCost {
  energy_budget: number;
  charge: number;
}

export interface Biome {
  precipitation: "none" | "rain" | "snow";
  temperature: number;
  temperature_modifier?: "none" | "frozen";
  downfall: number;
  category: "none" | "taiga" | "extreme_hills" | "jungle" | "mesa" | "plains" | "savanna" | "icy" | "the_end" | "beach" | "forest" | "ocean" | "desert" | "river" | "swamp" | "mushroom" | "nether";
  depth: number;
  scale: number;
  effects: BiomeEffects;
  surface_builder: string;
  carvers: {
    [step in CarvingStep]: string[];
  };
  features: string[][];
  starts: string[];
  creature_spawn_probability?: number;
  spawners: {
    [category in MobCategory]: Spawner[];
  };
  spawn_costs: {
    [type: string]: SpawnCost;
  };
  player_spawn_friendly?: boolean;
}

export async function readBiomes(dir: string, map: ResourceMap<Biome>): Promise<void> {
  for (const id of await getResources(dir, "worldgen/biome", ".json")) {
    const filePath = path.join(dir, id.toPath("worldgen/biome", ".json"));
    map.set(id, await readJSON(filePath));
  }
}

export async function writeBiomes(dir: string, map: ResourceMap<Biome>): Promise<void> {
  for (const [id, value] of map.entries()) {
    const filePath = path.join(dir, id.toPath("worldgen/biome", ".json"));
    await makeDir(path.dirname(filePath));
    await writeJSON(filePath, value);
  }
}
