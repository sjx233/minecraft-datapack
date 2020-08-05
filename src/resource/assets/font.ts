import * as path from "path";
import { getResources, makeDir, readJSON, writeJSON } from "../../util";
import ResourceMap = require("../../resource-map");

interface BitmapGlyphProvider {
  type: "bitmap";
  height?: number;
  ascent: number;
  chars: string[];
}

interface TrueTypeGlyphProvider {
  type: "ttf";
  file: string;
  size?: number;
  oversample?: number;
  shift?: [number, number];
  skip?: string | string[];
}

interface LegacyUnicodeGlyphProvider {
  type: "legacy_unicode";
  sizes: string;
  template: string;
}

type GlyphProvider = BitmapGlyphProvider | TrueTypeGlyphProvider | LegacyUnicodeGlyphProvider;

export interface Font {
  providers: GlyphProvider[];
}

export async function readFonts(dir: string, map: ResourceMap<Font>): Promise<void> {
  for (const id of await getResources(dir, "font", ".json")) {
    const filePath = path.join(dir, id.toPath("font", ".json"));
    map.set(id, await readJSON(filePath));
  }
}

export async function writeFonts(dir: string, map: ResourceMap<Font>): Promise<void> {
  for (const [id, value] of map.entries()) {
    const filePath = path.join(dir, id.toPath("font", ".json"));
    await makeDir(path.dirname(filePath));
    await writeJSON(filePath, value);
  }
}
