"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const datapack = new index_1.Datapack("Test datapack.");
datapack.setFunction("domain:tests/1", ["say test"]);
datapack.setFunctionIfAbsent("domain:tests/1", () => ["say this should not happen"]);
datapack.setFunctionIfAbsent("domain:tests/2", () => ["say this should exist"]);
datapack.writeTo("test");
//# sourceMappingURL=test.js.map