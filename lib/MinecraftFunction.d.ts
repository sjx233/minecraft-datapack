import ResourceLocation from "resource-location";
export declare class MinecraftFunction {
    readonly id: ResourceLocation;
    readonly commands: ReadonlyArray<string>;
    constructor(id: ResourceLocation, commands: ReadonlyArray<string>);
    writeTo(dirname: string): Promise<void>;
}
//# sourceMappingURL=MinecraftFunction.d.ts.map