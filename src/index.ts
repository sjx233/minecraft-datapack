import * as fs from "fs-extra";
import * as path from "path";
import { Advancement, Blockstate, Font, LootTable, Model, Predicate, Recipe, ResourceType, Tag, Texture } from "./resource";
import { read, write } from "./resource/io";
import ResourceLocation = require("resource-location");
import ResourceMap = require("./resource-map");

export * from "./resource";

export type PackType = "assets" | "data";

export abstract class Pack {
  public static readonly format = 5;

  public constructor(public readonly type: PackType, public readonly description: string) { }

  public async write(dirname: string, writeCallback?: (type: ResourceType, id: ResourceLocation) => void): Promise<void> {
    await fs.emptyDir(dirname);
    await fs.writeJson(path.join(dirname, "pack.mcmeta"), {
      "pack": {
        "description": this.description,
        "pack_format": 5
      }
    });
    await this.writeResources(path.join(dirname, this.type), writeCallback);
  }

  protected abstract writeResources(dirname: string, writeCallback?: (type: ResourceType, id: ResourceLocation) => void): Promise<void>;

  public static async read(dirname: string, type: PackType, checkFormat = true): Promise<Pack> {
    const meta = await fs.readJson(path.join(dirname, "pack.mcmeta"));
    const { description, pack_format: format }: {
      description: string;
      pack_format: number;
    } = meta.pack;
    if (typeof description !== "string") throw new TypeError(`invalid description: expected string, got ${typeof description}`);
    if (checkFormat && format !== this.format) throw new TypeError(`invalid pack format: expected ${this.format}, got ${format}`);
    const pack = this.construct(type, description);
    await pack.readResources(path.join(dirname, type));
    return pack;
  }

  protected abstract readResources(dirname: string): Promise<void>;

  private static construct(type: PackType, description: string): Pack {
    /* eslint-disable @typescript-eslint/no-use-before-define */
    switch (type) {
      case "assets":
        return new ResourcePack(description);
      case "data":
        return new DataPack(description);
      default:
        throw new TypeError("invalid pack type");
    }
    /* eslint-enable @typescript-eslint/no-use-before-define */
  }
}

export class ResourcePack extends Pack {
  private static readonly fields = [
    ["texture", "textures"],
    ["blockstate", "blockstates"],
    ["model", "models"],
    ["sound", "sounds"],
    ["language", "languages"],
    ["text", "texts"],
    ["font", "fonts"],
    ["shader", "shaders"]
  ] as const;
  public readonly textures = new ResourceMap<Texture>();
  public readonly blockstates = new ResourceMap<Blockstate>();
  public readonly models = new ResourceMap<Model>();
  public readonly sounds = new ResourceMap<Uint8Array>();
  public readonly languages = new ResourceMap<Record<string, string>>();
  public readonly texts = new ResourceMap<string>();
  public readonly fonts = new ResourceMap<Font>();
  public readonly shaders = new ResourceMap<string>();

  public constructor(description: string) {
    super("assets", description);
  }

  protected async writeResources(dirname: string, writeCallback?: (type: ResourceType, id: ResourceLocation) => void): Promise<void> {
    if (writeCallback) {
      for (const [type, key] of ResourcePack.fields)
        for (const [id, resource] of this[key]) {
          await write(dirname, type, id, resource);
          writeCallback(type, id);
        }
    } else {
      for (const [type, key] of ResourcePack.fields)
        for (const [id, resource] of this[key])
          await write(dirname, type, id, resource);
    }
  }

  protected async readResources(dirname: string): Promise<void> {
    for (const [type, key] of ResourcePack.fields)
      for await (const [id, resource] of read(dirname, type))
        this[key].set(id, resource);
  }
}

export class DataPack extends Pack {
  private static readonly fields = [
    ["advancement", "advancements"],
    ["function", "functions"],
    ["loot_table", "lootTables"],
    ["predicate", "predicates"],
    ["structure", "structures"],
    ["recipe", "recipes"],
    ["tag", "tags"]
  ] as const;
  public readonly advancements = new ResourceMap<Advancement>();
  public readonly functions = new ResourceMap<string[]>();
  public readonly lootTables = new ResourceMap<LootTable>();
  public readonly predicates = new ResourceMap<Predicate>();
  public readonly structures = new ResourceMap<Uint8Array>();
  public readonly recipes = new ResourceMap<Recipe>();
  public readonly tags = new ResourceMap<Tag>();

  public constructor(description: string) {
    super("data", description);
  }

  protected async writeResources(dirname: string, writeCallback?: (type: ResourceType, id: ResourceLocation) => void): Promise<void> {
    if (writeCallback) {
      for (const [type, key] of DataPack.fields)
        for (const [id, resource] of this[key]) {
          await write(dirname, type, id, resource);
          writeCallback(type, id);
        }
    } else {
      for (const [type, key] of DataPack.fields)
        for (const [id, resource] of this[key])
          await write(dirname, type, id, resource);
    }
  }

  protected async readResources(dirname: string): Promise<void> {
    for (const [type, key] of DataPack.fields)
      for await (const [id, resource] of read(dirname, type))
        this[key].set(id, resource);
  }
}
