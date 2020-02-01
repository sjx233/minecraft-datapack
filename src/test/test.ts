import * as assert from "assert";
import { DataPack, Pack } from "..";

(async () => {
  const pack = new DataPack("test data pack");
  pack.advancements.set("test:get_apple", {
    "parent": "minecraft:husbandry/root",
    "display": {
      "title": "Apple",
      "description": "Get an apple",
      "icon": {
        "item": "minecraft:apple"
      }
    },
    "criteria": {
      "get_apple": {
        "trigger": "minecraft:inventory_changed",
        "conditions": {
          "items": [
            { "item": "minecraft:apple" }
          ]
        }
      }
    }
  });
  pack.functions.set("test:countdown", [
    "# countdown",
    "",
    "say 3",
    "say 2",
    "say 1"
  ]);
  pack.tags.set("test:blocks/doors", {
    values: [
      "#minecraft:wooden_doors",
      "minecraft:iron_door"
    ]
  });
  await pack.write("test/data");
  assert.deepStrictEqual(await Pack.read("test/data", "data"), pack);
})();
