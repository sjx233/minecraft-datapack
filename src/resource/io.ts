import * as events from "events";
import * as fs from "fs-extra";
import ow from "ow";
import * as path from "path";
import { PNG } from "pngjs";
import * as readline from "readline";
import { GenericResource, JsonResource, MCFunction, Resource, Tag, Text, Texture } from ".";
import { PackType } from "../pack";
import { getResourceLocations, mostFrequent } from "../util";
import { ResourceType, resourceTypes } from "./type";
import ResourceLocation = require("resource-location");

export type ResourceReader = (dirname: string) => AsyncGenerator<[ResourceLocation, Resource], void>;
export type ResourceWriter = (dirname: string, id: ResourceLocation, resource: Resource) => Promise<void>;

export interface ResourceIO {
  read: ResourceReader;
  write: ResourceWriter;
}

interface MetaType {
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
}

const checkMeta = ow.create(ow.object.exactShape({
  animation: ow.optional.object.exactShape({
    frametime: ow.optional.number.int32.positive,
    frames: ow.optional.array.ofType(ow.any(ow.number, ow.object.exactShape({
      time: ow.optional.number.int32.positive,
      index: ow.number.int32.not.negative
    })) as unknown as typeof ow.number),
    width: ow.optional.number.int32.positive,
    height: ow.optional.number.int32.positive,
    interpolate: ow.optional.boolean
  }),
  villager: ow.optional.object.exactShape({
    hat: ow.optional.string.oneOf(["none", "partial", "full"])
  }),
  texture: ow.optional.object.exactShape({
    blur: ow.optional.boolean,
    clamp: ow.optional.boolean
  })
}));

interface TagType {
  values: string[];
  replace?: boolean;
}

const checkTag = ow.create(ow.object.exactShape({
  values: ow.array.ofType(ow.string),
  replace: ow.optional.boolean
}));

function genericIO(type: ResourceType, base: string, extension?: string): ResourceIO {
  return {
    async * read(dirname: string) {
      for await (const id of getResourceLocations(dirname, base, extension)) {
        const filePath = path.join(dirname, id.toPath(base, extension));
        yield [id, {
          type,
          content: await fs.readFile(filePath)
        }];
      }
    },
    async write(dirname: string, id: ResourceLocation, resource: Resource) {
      resource = resource as GenericResource;
      const filePath = path.join(dirname, id.toPath(base, extension));
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, resource.content);
    }
  };
}

function jsonIO(type: ResourceType, base: string): ResourceIO {
  return {
    async * read(dirname: string) {
      for await (const id of getResourceLocations(dirname, base, ".json")) {
        const filePath = path.join(dirname, id.toPath(base, ".json"));
        yield [id, {
          type,
          content: await fs.readJson(filePath)
        }];
      }
    },
    async write(dirname: string, id: ResourceLocation, resource: Resource) {
      resource = resource as JsonResource;
      const filePath = path.join(dirname, id.toPath(base, ".json"));
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeJson(filePath, resource.content);
    }
  };
}

const io: ReadonlyMap<ResourceType, ResourceIO> = new Map([
  ["texture", {
    async * read(dirname: string) {
      for await (const id of getResourceLocations(dirname, "textures", ".png")) {
        const filePath = path.join(dirname, id.toPath("textures", ".png"));
        const image = fs.createReadStream(filePath).pipe(new PNG);
        let meta: MetaType | undefined;
        try {
          const metaPath = path.join(dirname, id.toPath("textures", ".png.mcmeta"));
          checkMeta(meta = await fs.readJson(metaPath));
        } catch (e) {
          if (e.code !== "ENOENT") throw e;
        }
        await events.once(image, "parsed");
        const result: Texture = {
          type: "texture",
          imageWidth: image.width,
          imageHeight: image.height,
          imageData: image.data
        };
        if (meta) {
          if (meta.animation) {
            const time = meta.animation.frametime || 1;
            if (meta.animation.frames?.length) result.frames = meta.animation.frames.map(frame => {
              if (typeof frame === "number") return { time, index: frame };
              if (frame.time) return { time: frame.time, index: frame.index };
              return { time, index: frame.index };
            });
            if (meta.animation.width) result.width = meta.animation.width;
            if (meta.animation.height) result.height = meta.animation.height;
            if (result.frames?.some(frame => frame.time > 1) && meta.animation.interpolate) result.interpolate = true;
          }
          if (meta.villager) {
            const hat = meta.villager.hat;
            if (hat === "partial" || hat === "full") result.hat = hat;
          }
          if (meta.texture) {
            if (meta.texture.blur) result.blur = true;
            if (meta.texture.clamp) result.clamp = true;
          }
        }
        yield [id, result];
      }
    },
    async write(dirname: string, id: ResourceLocation, resource: Resource) {
      resource = resource as Texture;
      const filePath = path.join(dirname, id.toPath("textures", ".png"));
      await fs.ensureDir(path.dirname(filePath));
      const image = new PNG({
        width: resource.imageWidth,
        height: resource.imageHeight
      });
      resource.imageData.copy(image.data);
      const out = image.pack().pipe(fs.createWriteStream(filePath));
      const meta: MetaType = {};
      if (resource.frames || resource.width || resource.height) {
        const time = mostFrequent(resource.frames?.map(frame => frame.time) ?? [], 1);
        meta.animation = {
          frametime: time === 1 ? undefined : time,
          frames: resource.frames?.map(frame => frame.time === time ? frame.index : frame),
          width: resource.width,
          height: resource.height,
          interpolate: resource.interpolate
        };
      }
      if (resource.hat) meta.villager = {
        hat: resource.hat
      };
      if (resource.blur || resource.clamp) meta.texture = {
        blur: resource.blur,
        clamp: resource.clamp
      };
      if (Object.keys(meta).length) {
        const metaPath = path.join(dirname, id.toPath("textures", ".png.mcmeta"));
        await fs.writeJson(metaPath, meta);
      }
      await events.once(out, "close");
    }
  }],
  ["blockstate", jsonIO("blockstate", "blockstates")],
  ["model", jsonIO("model", "models")],
  ["sound", genericIO("sound", "sounds", ".ogg")],
  ["language", jsonIO("language", "lang")],
  ["text", {
    async * read(dirname: string) {
      for await (const id of getResourceLocations(dirname, "texts", ".txt")) {
        const filePath = path.join(dirname, id.toPath("texts", ".txt"));
        yield [id, {
          type: "text",
          text: await fs.readFile(filePath, "utf8")
        }];
      }
    },
    async write(dirname: string, id: ResourceLocation, resource: Resource) {
      resource = resource as Text;
      const filePath = path.join(dirname, id.toPath("texts", ".txt"));
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, resource.text);
    }
  }],
  ["font", genericIO("font", "font")],
  ["shader", genericIO("shader", "shaders")],
  ["advancement", jsonIO("advancement", "advancements")],
  ["function", {
    async * read(dirname: string) {
      for await (const id of getResourceLocations(dirname, "functions", ".mcfunction")) {
        const filePath = path.join(dirname, id.toPath("functions", ".mcfunction"));
        const commands: string[] = [];
        await events.once(readline.createInterface({
          input: fs.createReadStream(filePath),
          crlfDelay: Infinity
        }).on("line", line => commands.push(line)), "close");
        yield [id, {
          type: "function",
          commands
        }];
      }
    },
    async write(dirname: string, id: ResourceLocation, resource: Resource) {
      resource = resource as MCFunction;
      const filePath = path.join(dirname, id.toPath("functions", ".mcfunction"));
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, resource.commands.join("\n") + "\n");
    }
  }],
  ["loot_table", jsonIO("loot_table", "loot_tables")],
  ["predicate", jsonIO("predicate", "predicates")],
  ["structure", genericIO("structure", "structures", ".nbt")],
  ["recipe", jsonIO("recipe", "recipes")],
  ["tag", {
    async * read(dirname: string) {
      for await (const id of getResourceLocations(dirname, "tags", ".json")) {
        const filePath = path.join(dirname, id.toPath("tags", ".json"));
        const tag: TagType = await fs.readJson(filePath);
        checkTag(tag);
        const result: Tag = {
          type: "tag",
          values: tag.values.map(id => id[0] === "#" ? [new ResourceLocation(id.substring(1))] : new ResourceLocation(id))
        };
        if (tag.replace) result.replace = true;
        yield [id, result];
      }
    },
    async write(dirname: string, id: ResourceLocation, resource: Resource) {
      resource = resource as Tag;
      const filePath = path.join(dirname, id.toPath("tags", ".json"));
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeJson(filePath, {
        replace: resource.replace,
        values: resource.values.map(id => id instanceof Array ? "#" + id[0] : id.toString())
      });
    }
  }]
]);

function getIO(type: ResourceType): ResourceIO {
  const handler = io.get(type);
  if (!handler) throw new Error(`type ${type} does not have an IO handler`);
  return handler;
}

export function read(dirname: string, type: ResourceType): AsyncGenerator<[ResourceLocation, Resource], void> {
  return getIO(type).read(dirname);
}

export async function* readAll(dirname: string, packType: PackType): AsyncGenerator<[ResourceLocation, Resource], void> {
  for (const type of resourceTypes[packType])
    yield* read(dirname, type);
}

export function write(dirname: string, id: ResourceLocation, resource: Resource): Promise<void> {
  return getIO(resource.type).write(dirname, id, resource);
}
