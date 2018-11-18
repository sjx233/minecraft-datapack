import ResourceLocation from "resource-location";
import { MinecraftFunction } from "./MinecraftFunction";
export declare class Datapack {
    readonly description: string;
    private readonly functions;
    constructor(description: string);
    getFunction(id: string | ResourceLocation): MinecraftFunction | undefined;
    hasFunction(id: string | ResourceLocation): boolean;
    setFunction(id: string | ResourceLocation, commands: ReadonlyArray<string>): MinecraftFunction;
    setFunctionIfAbsent(id: string | ResourceLocation, commands: () => ReadonlyArray<string>): MinecraftFunction;
    deleteFunction(id: string | ResourceLocation): boolean;
    writeTo(dirname: string): Promise<void>;
}
//# sourceMappingURL=Datapack.d.ts.map