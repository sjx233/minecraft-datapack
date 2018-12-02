import { MinecraftFunction } from "./MinecraftFunction";
import { PackType } from "./PackType";
import { Resource } from "./Resource";

export class ResourceType<T extends Resource<T>> {
  public static readonly FUNCTION = new ResourceType<MinecraftFunction>(PackType.DATA_PACK, "functions", ".mcfunction");

  public constructor(public readonly packType: PackType, public readonly path: string, public readonly extension: string) { }
}
