import assert from "assert";
import { MinecraftFunction, Pack, PackType } from "../index";

const written = new Pack(PackType.DATA_PACK, "Test datapack.");
written.addResource(new MinecraftFunction("namespace:test", ["tellraw @a \"Test 1\"", "tellraw @a \"Test 2\"", "tellraw @a \"Test 3\""]));
written.write("test/datapack").then(() => Pack.read("test/datapack", PackType.DATA_PACK)).then(read => assert.deepStrictEqual(read, written));
