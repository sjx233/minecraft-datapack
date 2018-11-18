"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs_extra_1 = tslib_1.__importDefault(require("fs-extra"));
const path_1 = tslib_1.__importDefault(require("path"));
const resource_location_1 = tslib_1.__importDefault(require("resource-location"));
const MinecraftFunction_1 = require("./MinecraftFunction");
class Datapack {
    constructor(description) {
        this.description = description;
        this.functions = new Map;
    }
    getFunction(id) {
        return this.functions.get(resource_location_1.default.from(id).toString());
    }
    hasFunction(id) {
        return this.functions.has(resource_location_1.default.from(id).toString());
    }
    setFunction(id, commands) {
        id = resource_location_1.default.from(id);
        const func = new MinecraftFunction_1.MinecraftFunction(id, commands);
        this.functions.set(id.toString(), func);
        return func;
    }
    setFunctionIfAbsent(id, commands) {
        const func = this.getFunction(id);
        if (func)
            return func;
        return this.setFunction(id, commands());
    }
    deleteFunction(id) {
        return this.functions.delete(resource_location_1.default.from(id).toString());
    }
    async writeTo(dirname) {
        await fs_extra_1.default.emptyDir(dirname);
        const dataDirname = path_1.default.join(dirname, "data");
        for (const func of this.functions.values())
            func.writeTo(dataDirname);
        fs_extra_1.default.writeFile(path_1.default.join(dirname, "pack.mcmeta"), JSON.stringify({
            pack: {
                description: this.description,
                pack_format: 4
            }
        }));
    }
}
exports.Datapack = Datapack;
//# sourceMappingURL=Datapack.js.map