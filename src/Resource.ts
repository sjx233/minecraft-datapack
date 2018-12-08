import ResourceLocation from "resource-location";
import { ResourceType } from "./ResourceType";

export abstract class Resource {
  public readonly id: ResourceLocation;

  protected constructor(public readonly type: ResourceType<any>, id: string | ResourceLocation) {
    this.id = ResourceLocation.from(id);
  }

  public async write(dirname: string) {
    this.type.write(dirname, this);
  }
}
