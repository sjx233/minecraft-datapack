import fs from "fs-extra";
import path from "path";
import readline from "readline";
import ResourceLocation from "resource-location";
import { getResourceLocations } from "./util";

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
    const resourcesDirname = path.join(dirname, this.type);
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
    const resourcesDirname = path.join(dirname, type);
    for (const resourceType of ResourceType.DEFAULT_VALUES)
      for (const resource of await resourceType.read(resourcesDirname))
        pack.addResource(resource);
    return pack;
  }
}

export enum PackType {
  RESOURCE_PACK = "assets",
  DATA_PACK = "data"
}

export abstract class Resource {
  public readonly id: ResourceLocation;

  protected constructor(public readonly type: ResourceType<any>, id: string | ResourceLocation) {
    this.id = ResourceLocation.from(id);
  }

  public async write(dirname: string) {
    this.type.write(dirname, this);
  }
}

export class ResourceType<T extends Resource> {
  public static readonly FUNCTION = (() => {
    const base = "functions";
    const extension = ".mcfunction";
    const extensionLength = extension.length;
    return new ResourceType<MinecraftFunction>(PackType.DATA_PACK, {
      async read(dirname: string) {
        return await Promise.all((await getResourceLocations(dirname, base, extension)).map(x => new Promise<MinecraftFunction>(resolve => {
          const commands: string[] = [];
          readline.createInterface({
            crlfDelay: Infinity,
            input: fs.createReadStream(path.join(dirname, x.toPath(base)))
          }).on("line", x => commands.push(x)).on("close", () => {
            const path = x.path;
            return resolve(new MinecraftFunction(new ResourceLocation(x.namespace, path.substring(0, path.length - extensionLength)), commands));
          });
        })));
      },
      async write(this: ResourceType<MinecraftFunction>, dirname: string, resource: MinecraftFunction) {
        const filePath = path.join(dirname, resource.id.toPath(base, extension));
        fs.ensureDirSync(path.dirname(filePath));
        for (const command of resource.commands)
          fs.appendFileSync(filePath, command + "\n");
      }
    });
  })();
  public static readonly DEFAULT_VALUES: ReadonlyArray<ResourceType<any>> = [ResourceType.FUNCTION];
  public readonly read: (this: ResourceType<T>, dirname: string) => Promise<T[]>;
  public readonly write: (this: ResourceType<T>, dirname: string, resource: T) => Promise<void>;

  public constructor(public readonly packType: PackType, { read, write }: { read: (this: ResourceType<T>, dirname: string) => Promise<T[]>, write: (this: ResourceType<T>, dirname: string, resource: T) => Promise<void> }) {
    this.read = read;
    this.write = write;
  }
}

export class MinecraftFunction extends Resource {
  public readonly commands: ReadonlyArray<string>;

  public constructor(id: string | ResourceLocation, commands: Iterable<string> | ArrayLike<string>) {
    super(ResourceType.FUNCTION, id);
    this.commands = Array.from(commands);
  }
}
