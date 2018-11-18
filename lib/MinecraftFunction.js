"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs_extra_1 = tslib_1.__importDefault(require("fs-extra"));
const path_1 = tslib_1.__importDefault(require("path"));
class MinecraftFunction {
    constructor(id, commands) {
        this.id = id;
        this.commands = commands;
    }
    async writeTo(dirname) {
        const functionPath = path_1.default.join(dirname, this.id.toPath("functions") + ".mcfunction");
        await fs_extra_1.default.ensureDir(path_1.default.dirname(functionPath));
        const fileDescriptor = await fs_extra_1.default.open(functionPath, "w");
        for (const command of this.commands)
            await fs_extra_1.default.write(fileDescriptor, command + "\n", 0);
        fs_extra_1.default.close(fileDescriptor);
    }
}
exports.MinecraftFunction = MinecraftFunction;
//# sourceMappingURL=MinecraftFunction.js.map