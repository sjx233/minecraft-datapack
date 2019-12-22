import * as fs from "fs-extra";
import * as path from "path";
import { packType, Resource } from "../resource";
import { readAll, write } from "../resource/io";
import { ResourceType } from "../resource/type";
import { PackType } from "./type";
import ResourceLocation = require("resource-location");
import ResourceMap = require("../resource-map");

export class Pack {
  private readonly resources = new ResourceMap<Resource>();

  public constructor(public readonly type: PackType, public readonly description: string) { }

  public get size(): number {
    return this.resources.size;
  }

  public clear(): void {
    this.resources.clear();
  }

  public * getResources(type?: ResourceType): IterableIterator<[ResourceLocation, Resource]> {
    if (type === undefined) return yield* this.resources.entries();
    if (packType.get(type) !== this.type) throw new TypeError("trying to get resources of wrong pack type");
    for (const entry of this.resources)
      if (entry[1].type === type) yield entry;
  }

  public getResource(id: string | ResourceLocation): Resource | undefined {
    return this.resources.get(ResourceLocation.from(id));
  }

  public addResource(id: string | ResourceLocation, resource: Resource): this {
    const type = resource.type;
    if (packType.get(type) !== this.type) throw new TypeError("trying to add resource of wrong pack type");
    this.resources.set(ResourceLocation.from(id), resource);
    return this;
  }

  public deleteResource(id: string | ResourceLocation): this {
    this.resources.delete(ResourceLocation.from(id));
    return this;
  }

  public async write(dirname: string, writeCallback?: (resource: Resource) => void): Promise<void> {
    await fs.emptyDir(dirname);
    const meta: PackMeta = {
      pack: {
        description: this.description,
        "pack_format": 5
      }
    };
    await fs.writeJson(path.join(dirname, "pack.mcmeta"), meta);
    dirname = path.join(dirname, this.type);
    for (const [id, resource] of this.resources) {
      await write(dirname, id, resource);
      if (writeCallback) writeCallback(resource);
    }
  }

  public static async read(dirname: string, type: PackType): Promise<Pack> {
    const meta = Pack.checkMeta(await fs.readJson(path.join(dirname, "pack.mcmeta")));
    const pack = new Pack(type, meta.pack.description);
    dirname = path.join(dirname, type);
    for await (const [id, resource] of readAll(dirname, type))
      pack.addResource(id, resource);
    return pack;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static checkMeta(meta: any): PackMeta {
    if (!(meta && typeof meta.pack === "object")) throw new TypeError("invalid pack");
    if (typeof meta.pack.description !== "string") throw new TypeError("invalid description");
    if (!Number.isInteger(meta.pack.pack_format)) throw new TypeError("invalid pack format");
    return meta;
  }
}

interface PackMeta {
  pack: {
    description: string;
    pack_format: number;
  };
}

export { PackType };
