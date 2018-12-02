import fs from "fs-extra";
import path from "path";
import ResourceLocation from "resource-location";
import { Writable } from "stream";
import { ResourceType } from "./ResourceType";

export abstract class Resource<T extends Resource<T>> {
  public readonly id: ResourceLocation;

  protected constructor(public readonly type: ResourceType<T>, id: string | ResourceLocation) {
    this.id = ResourceLocation.from(id);
  }

  public async writeTo(dirname: string) {
    const type = this.type;
    const filePath = path.join(dirname, this.id.toPath(type.path) + type.extension);
    fs.ensureDirSync(path.dirname(filePath));
    this.write(fs.createWriteStream(filePath));
  }

  protected abstract write(stream: Writable): void;
}
