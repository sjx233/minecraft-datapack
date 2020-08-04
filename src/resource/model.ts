import * as path from "path";
import { getResources, makeDir, readJSON, writeJSON } from "../util";
import ResourceMap = require("../resource-map");

type Direction = "down" | "up" | "north" | "south" | "west" | "east";

interface ModelRotation {
  origin: [number, number, number];
  axis: "x" | "y" | "z" | "X" | "Y" | "Z";
  angle: -45 | -22.5 | 0 | 22.5 | 45;
  rescale?: boolean;
}

interface ModelFace {
  texture: string;
  uv?: [number, number, number, number];
  rotation?: 0 | 90 | 180 | 270;
  cullface?: Direction;
  tintindex?: number;
}

type ModelFaces = {
  [dir in Direction]?: ModelFace;
};

interface ModelElement {
  from: [number, number, number];
  to: [number, number, number];
  rotation?: ModelRotation;
  faces: ModelFaces;
  shade?: boolean;
}

interface ModelTransform {
  rotation: [number, number, number];
  translation: [number, number, number];
  scale: [number, number, number];
}

interface ModelTransforms {
  thirdperson_righthand?: ModelTransform;
  thirdperson_lefthand?: ModelTransform;
  firstperson_righthand?: ModelTransform;
  firstperson_lefthand?: ModelTransform;
  head?: ModelTransform;
  gui?: ModelTransform;
  ground?: ModelTransform;
  fixed?: ModelTransform;
}

interface ModelOverride {
  predicate: { [key: string]: number; };
  model: string;
}

export interface Model {
  parent?: string;
  textures?: { [id: string]: string; };
  elements?: ModelElement[];
  display?: ModelTransforms;
  overrides?: ModelOverride[];
  ambientocclusion?: boolean;
  gui_light?: "front" | "side";
}

export async function readModels(dir: string, map: ResourceMap<Model>): Promise<void> {
  for (const id of await getResources(dir, "models", path => path.endsWith(".json"))) {
    const filePath = path.join(dir, id.toPath("models", ".json"));
    map.set(id, await readJSON(filePath));
  }
}

export async function writeModels(dir: string, map: ResourceMap<Model>): Promise<void> {
  for (const [id, value] of map.entries()) {
    const filePath = path.join(dir, id.toPath("models", ".json"));
    await makeDir(path.dirname(filePath));
    await writeJSON(filePath, value);
  }
}
