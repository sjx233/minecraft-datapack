/* eslint-disable @typescript-eslint/no-explicit-any */
import * as events from "events";
import * as fs from "fs-extra";
import * as path from "path";
import * as readline from "readline";
import { Advancement, Blockstate, Font, LootTable, Model, Predicate, Recipe, ResourceType, Tag, Texture } from ".";
import { getResourceLocations } from "../util";
import ResourceLocation = require("resource-location");

async function readOptJson(file: string, options?: fs.ReadOptions): Promise<any> {
  return fs.readJson(file, options).catch(e => {
    if (e?.code !== "ENOENT") throw e;
  });
}

async function writeOptJson(file: string, obj: any, options?: fs.WriteOptions): Promise<void> {
  return obj === undefined ? Promise.resolve() : fs.writeJson(file, obj, options);
}

export type ResourceReader<T> = (dirname: string) => AsyncGenerator<[ResourceLocation, T], void>;
export type ResourceWriter<T> = (dirname: string, id: ResourceLocation, resource: T) => Promise<void>;

export interface ResourceIO<T> {
  read: ResourceReader<T>;
  write: ResourceWriter<T>;
}

function binaryIO(base: string, extension = ""): ResourceIO<Uint8Array> {
  return {
    async * read(dirname: string) {
      for await (const id of getResourceLocations(dirname, base, extension)) {
        const filePath = path.join(dirname, id.toPath(base, extension));
        yield [id, await fs.readFile(filePath)];
      }
    },
    async write(dirname: string, id: ResourceLocation, resource: Uint8Array) {
      const filePath = path.join(dirname, id.toPath(base, extension));
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, resource);
    }
  };
}

function jsonIO<T>(base: string, extension = ".json"): ResourceIO<T> {
  return {
    async * read(dirname: string) {
      for await (const id of getResourceLocations(dirname, base, extension)) {
        const filePath = path.join(dirname, id.toPath(base, extension));
        yield [id, await fs.readJson(filePath)];
      }
    },
    async write(dirname: string, id: ResourceLocation, resource: T) {
      const filePath = path.join(dirname, id.toPath(base, extension));
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeJson(filePath, resource);
    }
  };
}

function textIO(base: string, extension = ""): ResourceIO<string> {
  return {
    async * read(dirname: string) {
      for await (const id of getResourceLocations(dirname, base, extension)) {
        const filePath = path.join(dirname, id.toPath(base, extension));
        yield [id, await fs.readFile(filePath, "utf8")];
      }
    },
    async write(dirname: string, id: ResourceLocation, text: string) {
      const filePath = path.join(dirname, id.toPath(base, extension));
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, text);
    }
  };
}

const textureIO: ResourceIO<Texture> = {
  async * read(dirname: string) {
    for await (const id of getResourceLocations(dirname, "textures", ".png")) {
      const filePath = path.join(dirname, id.toPath("textures", ".png"));
      const [image, meta] = await Promise.all([fs.readFile(filePath), readOptJson(filePath + ".mcmeta")]);
      yield [id, { image, meta }];
    }
  },
  async write(dirname: string, id: ResourceLocation, texture: Texture) {
    const filePath = path.join(dirname, id.toPath("textures", ".png"));
    await fs.ensureDir(path.dirname(filePath));
    await Promise.all([fs.writeFile(filePath, texture.image), writeOptJson(filePath + ".mcmeta", texture.meta)]);
  }
};
const functionIO: ResourceIO<string[]> = {
  async * read(dirname: string) {
    for await (const id of getResourceLocations(dirname, "functions", ".mcfunction")) {
      const filePath = path.join(dirname, id.toPath("functions", ".mcfunction"));
      const commands: string[] = [];
      await events.once(readline.createInterface({ input: fs.createReadStream(filePath), crlfDelay: Infinity }).on("line", line => commands.push(line)), "close");
      yield [id, commands];
    }
  },
  async write(dirname: string, id: ResourceLocation, resource: string[]) {
    const filePath = path.join(dirname, id.toPath("functions", ".mcfunction"));
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, resource.join("\n") + "\n");
  }
};
const io = new Map<ResourceType, ResourceIO<any>>([
  ["texture", textureIO],
  ["blockstate", jsonIO<Blockstate>("blockstates")],
  ["model", jsonIO<Model>("models")],
  ["sound", binaryIO("sounds", ".ogg")],
  ["language", jsonIO<Record<string, string>>("lang")],
  ["text", textIO("texts", ".txt")],
  ["font", jsonIO<Font>("font")],
  ["shader", textIO("shaders")],
  ["advancement", jsonIO<Advancement>("advancements")],
  ["function", functionIO],
  ["loot_table", jsonIO<LootTable>("loot_tables")],
  ["predicate", jsonIO<Predicate>("predicates")],
  ["structure", binaryIO("structures", ".nbt")],
  ["recipe", jsonIO<Recipe>("recipes")],
  ["tag", jsonIO<Tag>("tags")]
]);

function getIO(type: ResourceType): ResourceIO<any> {
  const handler = io.get(type);
  if (!handler) throw new Error(`type ${type} does not have an IO handler`);
  return handler;
}

export function read(dirname: string, type: ResourceType): AsyncGenerator<[ResourceLocation, any], void> {
  return getIO(type).read(dirname);
}

export function write(dirname: string, type: ResourceType, id: ResourceLocation, resource: any): Promise<void> {
  return getIO(type).write(dirname, id, resource);
}
