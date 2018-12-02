import { MinecraftFunction, Pack, PackType } from "../index";

const datapack = new Pack(PackType.DATA_PACK, "Test datapack.");
datapack.addResource(new MinecraftFunction("namespace:test", ["tellraw @a \"Test 1\"", "tellraw @a \"Test 2\"", "tellraw @a \"Test 3\""]));
datapack.writeTo("test/datapack");
