import { Component } from "./text";

export type ResourceType = "texture" | "blockstate" | "model" | "sound" | "language" | "text" | "font" | "shader" | "advancement" | "function" | "loot_table" | "predicate" | "structure" | "recipe" | "tag";

export interface Texture {
  image: Buffer;
  meta?: {
    animation?: {
      frametime?: number;
      frames?: (number | {
        time?: number;
        index: number;
      })[];
      width?: number;
      height?: number;
      interpolate?: boolean;
    };
    villager?: {
      hat?: "none" | "partial" | "full";
    };
    texture?: {
      blur?: boolean;
      clamp?: boolean;
    };
  };
}

interface ModelVariant {
  model: string;
  x?: 0 | 90 | 180 | 270;
  y?: 0 | 90 | 180 | 270;
  uvlock?: boolean;
  weight?: number;
}

type ModelSelector =
  | { OR: ModelSelector[]; }
  | { AND: ModelSelector[]; }
  | Record<string, string>;

export interface Blockstate {
  variants?: Record<string, ModelVariant | ModelVariant[]>;
  multipart?: {
    when?: ModelSelector;
    apply: ModelVariant | ModelVariant[];
  }[];
}

interface ModelElementFace {
  texture: string;
  uv?: [number, number, number, number];
  rotation?: 0 | 90 | 180 | 270;
  cullface?: "down" | "up" | "north" | "south" | "west" | "east";
  tintindex?: number;
}

interface ModelTransformation {
  rotation: [number, number, number];
  translation: [number, number, number];
  scale: [number, number, number];
}

export interface Model {
  parent?: string;
  textures?: Record<string, string>;
  elements?: {
    from: [number, number, number];
    to: [number, number, number];
    rotation?: {
      origin: [number, number, number];
      axis: "x" | "y" | "z" | "X" | "Y" | "Z";
      angle: -45 | -22.5 | 0 | 22.5 | 45;
      rescale?: boolean;
      faces:
      | [ModelElementFace]
      | [ModelElementFace, ModelElementFace]
      | [ModelElementFace, ModelElementFace, ModelElementFace]
      | [ModelElementFace, ModelElementFace, ModelElementFace, ModelElementFace]
      | [ModelElementFace, ModelElementFace, ModelElementFace, ModelElementFace, ModelElementFace]
      | [ModelElementFace, ModelElementFace, ModelElementFace, ModelElementFace, ModelElementFace, ModelElementFace];
      shade?: boolean;
    };
  }[];
  display?: {
    thirdperson_righthand?: ModelTransformation;
    thirdperson_lefthand?: ModelTransformation;
    firstperson_righthand?: ModelTransformation;
    firstperson_lefthand?: ModelTransformation;
    head?: ModelTransformation;
    gui?: ModelTransformation;
    ground?: ModelTransformation;
    fixed?: ModelTransformation;
  };
  overrides?: {
    model: string;
    predicate: Record<string, number>;
  }[];
  ambientocclusion?: boolean;
  gui_light?: "front" | "side";
}

interface BitmapFontProvider {
  type: "bitmap";
  height?: number;
  ascent: number;
  chars: string[];
}

interface TrueTypeFontProvider {
  type: "ttf";
  file: string;
  size?: number;
  oversample?: number;
  shift?: [number, number];
  skip?: string | string[];
}

interface LegacyUnicodeFontProvider {
  type: "legacy_unicode";
  template: string;
  sizes: string;
}

export interface Font {
  providers: (BitmapFontProvider | TrueTypeFontProvider | LegacyUnicodeFontProvider)[];
}

export interface Advancement {
  parent?: string;
  display?: {
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
  };
  rewards?: {
    experience?: number;
    loot?: string[];
    recipes?: string[];
    function: string;
  };
  criteria: Record<string, {
    trigger: string;
    conditions: object;
  }>;
  requirements?: string[][];
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

interface ConstantRange {
  type: "constant";
  value: number;
}

interface LootEntry {
  type: string;
  conditions?: Predicate[];
}

interface LootFunction {
  function: string;
}

export interface LootTable {
  type?: string;
  pools?: {
    rolls: number | UniformRange | BinomialRange | ConstantRange;
    bonus_rolls: number | UniformRange;
    entries: LootEntry[];
    conditions?: Predicate[];
    functions?: LootFunction[];
  }[];
  functions?: LootFunction[];
}

export interface Predicate {
  condition: string;
}

export interface Recipe {
  type: string;
}

export interface Tag {
  values: string[];
  replace?: boolean;
}
