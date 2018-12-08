import fs from "fs-extra";
import path from "path";
import readline from "readline";
import ResourceLocation from "resource-location";
import { MinecraftFunction } from "./MinecraftFunction";
import { PackType } from "./PackType";
import { Resource } from "./Resource";
import { getResourceLocations } from "./util";

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
