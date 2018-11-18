import fs from "fs-extra";
import path from "path";
import ResourceLocation from "resource-location";

export class MinecraftFunction {
  constructor(public readonly id: ResourceLocation, public readonly commands: ReadonlyArray<string>) { }

  public async writeTo(dirname: string) {
    const functionPath = path.join(dirname, this.id.toPath("functions") + ".mcfunction");
    await fs.ensureDir(path.dirname(functionPath));
    const fileDescriptor = await fs.open(functionPath, "w");
    for (const command of this.commands)
      await fs.write(fileDescriptor, command + "\n", 0);
    fs.close(fileDescriptor);
  }
}
