import fs from "fs-extra";
import path from "path";
import ResourceLocation from "resource-location";
import { MinecraftFunction } from "./MinecraftFunction";

export class Datapack {
  private readonly functions: Map<string, MinecraftFunction> = new Map;

  constructor(public readonly description: string) { }

  public getFunction(id: string | ResourceLocation) {
    return this.functions.get(ResourceLocation.from(id).toString());
  }

  public hasFunction(id: string | ResourceLocation) {
    return this.functions.has(ResourceLocation.from(id).toString());
  }

  public setFunction(id: string | ResourceLocation, commands: ReadonlyArray<string>) {
    id = ResourceLocation.from(id);
    const func = new MinecraftFunction(id, commands);
    this.functions.set(id.toString(), func);
    return func;
  }

  public setFunctionIfAbsent(id: string | ResourceLocation, commands: () => ReadonlyArray<string>) {
    const func = this.getFunction(id);
    if (func) return func;
    return this.setFunction(id, commands());
  }

  public deleteFunction(id: string | ResourceLocation) {
    return this.functions.delete(ResourceLocation.from(id).toString());
  }

  public async writeTo(dirname: string) {
    await fs.emptyDir(dirname);
    const dataDirname = path.join(dirname, "data");
    for (const func of this.functions.values())
      func.writeTo(dataDirname);
    fs.writeFile(path.join(dirname, "pack.mcmeta"), JSON.stringify({
      pack: {
        description: this.description,
        pack_format: 4
      }
    }));
  }
}
