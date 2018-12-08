import fs from "fs-extra";
import { PackType } from "PackType";
import path from "path";
import ResourceLocation from "resource-location";
import { Resource } from "./Resource";
import { ResourceType } from "./ResourceType";

export class Pack {
  private readonly resources: Resource[] = [];

  public constructor(public readonly type: PackType, public readonly description: string) { }

  public getResources<T extends Resource>(type: ResourceType<T>) {
    if (type.packType !== this.type) throw new TypeError("Getting resource of wrong pack type.");
    return this.resources.filter(x => x.type === type);
  }

  public getResource<T extends Resource>(type: ResourceType<T>, id: string | ResourceLocation) {
    if (type.packType !== this.type) throw new TypeError("Getting resource of wrong pack type.");
    return this.resources.find(x => x.type === type && x.id.is(id));
  }

  public addResource<T extends Resource>(newResource: T) {
    const type = newResource.type;
    if (type.packType !== this.type) throw new TypeError("Adding resource of wrong pack type.");
    const id = newResource.id;
    const resources = this.resources;
    const index = resources.findIndex(x => x.type === type && x.id.is(id));
    if (index === -1) resources.push(newResource);
    else resources[index] = newResource;
    return newResource;
  }

  public deleteResources<T extends Resource>(type: ResourceType<T>, id?: string | ResourceLocation) {
    if (type.packType !== this.type) throw new TypeError("Deleting resource of wrong pack type.");
    const resources = this.resources;
    const index = resources.findIndex(id ? x => x.type === type && x.id.is(id) : x => x.type === type);
    return index === -1 ? undefined : resources.splice(index, 1)[0];
  }

  public async write(dirname: string) {
    fs.emptyDirSync(dirname);
    const resourcesDirname = path.join(dirname, this.type.dirname);
    await Promise.all([fs.writeJson(path.join(dirname, "pack.mcmeta"), {
      pack: {
        description: this.description,
        pack_format: 4
      }
    }), ...this.resources.map(x => x.write(resourcesDirname))]);
  }

  public static async read(dirname: string, type: PackType) {
    const metadata = fs.readJsonSync(path.join(dirname, "pack.mcmeta"));
    if (!(metadata && metadata.pack && typeof metadata.pack === "object")) throw new TypeError("Invalid pack");
    const packInfo = metadata.pack;
    if (typeof packInfo.description !== "string") throw new TypeError("Invalid description");
    if (!Number.isInteger(packInfo.pack_format)) throw new TypeError("Invalid pack format");
    const pack = new Pack(type, packInfo.description);
    const resourcesDirname = path.join(dirname, type.dirname);
    for (const resourceType of ResourceType.DEFAULT_VALUES)
      for (const resource of await resourceType.read(resourcesDirname))
        pack.addResource(resource);
    return pack;
  }
}
