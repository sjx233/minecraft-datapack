import ResourceLocation from "resource-location";
import { Resource } from "./Resource";
import { ResourceType } from "./ResourceType";

export class MinecraftFunction extends Resource {
  public readonly commands: ReadonlyArray<string>;

  public constructor(id: string | ResourceLocation, commands: Iterable<string> | ArrayLike<string>) {
    super(ResourceType.FUNCTION, id);
    this.commands = Array.from(commands);
  }
}
