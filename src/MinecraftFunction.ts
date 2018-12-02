import ResourceLocation from "resource-location";
import { Readable, Writable } from "stream";
import { Resource } from "./Resource";
import { ResourceType } from "./ResourceType";

export class MinecraftFunction extends Resource<MinecraftFunction> {
  public constructor(id: string | ResourceLocation, public readonly commands: ReadonlyArray<string>) {
    super(ResourceType.FUNCTION, id);
  }

  protected write(stream: Writable) {
    const commands = this.commands;
    const length = commands.length;
    let line = 0;
    new Readable({
      read() {
        while (line < length)
          if (!this.push(commands[line++] + "\n")) return;
        this.push(null);
      }
    }).pipe(stream);
  }
}
