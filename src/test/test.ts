import * as assert from "assert";
import { Pack } from "..";
import ResourceLocation = require("resource-location");

(async () => {
  let pack = new Pack("data", "test data pack")
    .addResource("test:countdown", {
      type: "function",
      commands: [
        "# countdown from 3",
        "say 3",
        "",
        "say 2",
        "",
        "say 1"
      ]
    })
    .addResource("test:blocks/doors", {
      type: "tag",
      values: [
        [new ResourceLocation("wooden_doors")],
        new ResourceLocation("iron_door"),
        [new ResourceLocation("wooden_trapdoors")],
        new ResourceLocation("iron_trapdoor")
      ],
      replace: true
    })
    .addResource("test:fluids/all", {
      type: "tag",
      values: [
        new ResourceLocation("water"),
        new ResourceLocation("lava")
      ]
    });
  await pack.write("test/data");
  assert.deepStrictEqual(await Pack.read("test/data", "data"), pack);
  pack = new Pack("assets", "test resource pack")
    .addResource("test:color", {
      type: "texture",
      imageWidth: 1,
      imageHeight: 3,
      imageData: Buffer.from([
        255, 0, 0, 255,
        0, 255, 0, 255,
        0, 0, 255, 255
      ]),
      frames: [
        { time: 2, index: 0 },
        { time: 2, index: 1 },
        { time: 3, index: 2 },
        { time: 1, index: 1 },
        { time: 1, index: 0 }
      ]
    });
  await pack.write("test/assets");
  assert.deepStrictEqual(await Pack.read("test/assets", "assets"), pack);
})();
