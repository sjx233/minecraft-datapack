import * as assert from "assert";
import { DataPack } from "..";

(async () => {
  const written = new DataPack("Test data pack.");
  written.advancements.set("test:get_apple", {
    parent: "minecraft:husbandry/root",
    display: {
      title: "Apple",
      description: "Get an apple",
      icon: {
        item: "minecraft:apple"
      }
    },
    criteria: {
      get_apple: {
        trigger: "minecraft:inventory_changed",
        conditions: {
          items: [
            {
              item: "minecraft:apple"
            }
          ]
        }
      }
    }
  });
  written.functions.set("test:countdown", [
    "# countdown",
    "",
    "say 3",
    "say 2",
    "say 1"
  ]);
  written.tags.set("test:blocks/doors", {
    values: [
      "#minecraft:wooden_doors",
      { id: "minecraft:iron_door", required: false }
    ]
  });
  await written.write("test");
  const read = new DataPack;
  await read.read("test");
  assert.deepStrictEqual(read, written);
})().catch(error => {
  process.stderr.write(error + "\n");
  process.exit(1);
});
