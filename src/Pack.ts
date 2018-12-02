import fs from "fs-extra";
import { PackType } from "PackType";
import path from "path";
import ResourceLocation from "resource-location";
import { Resource } from "./Resource";
import { ResourceType } from "./ResourceType";

export class Pack {
  private readonly resources: Array<Resource<any>> = [];

  public constructor(public readonly type: PackType, public readonly description: string) { }

  public getResource<T extends Resource<T>>(type: ResourceType<T>, id: string | ResourceLocation) {
    if (type.packType !== this.type) throw new TypeError("Getting resource of wrong pack type.");
    return this.resources.find(x => x.type === type && x.id.is(id)) as T | undefined;
  }

  public addResource<T extends Resource<T>>(newResource: T) {
    const type = newResource.type;
    if (type.packType !== this.type) throw new TypeError("Adding resource of wrong pack type.");
    const id = newResource.id;
    const resources = this.resources;
    const index = resources.findIndex(x => x.type === type && x.id.is(id));
    if (index === -1) resources.push(newResource);
    else resources[index] = newResource;
    return newResource;
  }

  public deleteResource<T extends Resource<T>>(type: ResourceType<T>, id: string | ResourceLocation) {
    if (type.packType !== this.type) throw new TypeError("Deleting resource of wrong pack type.");
    const resources = this.resources;
    const index = resources.findIndex(x => x.type === type && x.id.is(id));
    return index === -1 ? undefined : resources.splice(index, 1)[0];
  }

  public async writeTo(dirname: string) {
    fs.emptyDirSync(dirname);
    fs.writeJson(path.join(dirname, "pack.mcmeta"), {
      pack: {
        description: this.description,
        pack_format: 4
      }
    });
    const dataDirname = path.join(dirname, "data");
    for (const resource of this.resources)
      resource.writeTo(dataDirname);
  }
}
