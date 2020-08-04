import { promises as fs } from "fs";
import * as path from "path";
import { Advancement, readAdvancements, writeAdvancements } from "./resource/advancement";
import { Blockstate, readBlockstates, writeBlockstates } from "./resource/blockstate";
import { Font, readFonts, writeFonts } from "./resource/font";
import { FontData, readFontData, writeFontData } from "./resource/font_data";
import { MCFunction, readFunctions, writeFunctions } from "./resource/function";
import { Language, readLanguages, writeLanguages } from "./resource/language";
import { LootTable, readLootTables, writeLootTables } from "./resource/loot_table";
import { Model, readModels, writeModels } from "./resource/model";
import { PostEffect, readPostEffects, writePostEffects } from "./resource/post_effect";
import { Predicate, readPredicates, writePredicates } from "./resource/predicate";
import { Program, readPrograms, writePrograms } from "./resource/program";
import { readRecipes, Recipe, writeRecipes } from "./resource/recipe";
import { readShaders, Shader, writeShaders } from "./resource/shader";
import { readSounds, Sound, writeSounds } from "./resource/sound";
import { readSoundEvents, SoundEvent, writeSoundEvents } from "./resource/sound_event";
import { readStructures, Structure, writeStructures } from "./resource/structure";
import { readTags, Tag, writeTags } from "./resource/tag";
import { readTexts, Text, writeTexts } from "./resource/text";
import { readTextures, Texture, writeTextures } from "./resource/texture";
import { readTextureMetadata, TextureMetadata, writeTextureMetadata } from "./resource/texture_metadata";
import { Component } from "./text";
import { emptyDir, readJSON, writeJSON } from "./util";
import ResourceMap = require("./resource-map");

export {
  Texture, TextureMetadata, Blockstate, Model, Sound, SoundEvent, Language, Text, Font, FontData, PostEffect, Program, Shader,
  Advancement, MCFunction as Function, LootTable, Predicate, Recipe, Structure, Tag,
  Component, ResourceMap
};
export type PackType = "assets" | "data";

interface PackMetadataSection {
  description: Component;
  pack_format: 5;
}

interface LanguageMetadataSection {
  [id: string]: {
    region: string;
    name: string;
    bidirectional?: boolean;
  };
}

interface ResourcePackMetadata {
  pack: PackMetadataSection;
  language?: LanguageMetadataSection;
}

interface DataPackMetadata {
  pack: PackMetadataSection;
}

export class ResourcePack {
  public readonly type: PackType = "assets";
  public languageMetadata?: LanguageMetadataSection;
  public gpuWarnlist?: {
    renderer: string[];
    version: string[];
    vendor: string[];
  };
  public readonly textures = new ResourceMap<Texture>();
  public readonly textureMetadata = new ResourceMap<TextureMetadata>();
  public readonly blockstates = new ResourceMap<Blockstate>();
  public readonly models = new ResourceMap<Model>();
  public readonly sounds = new ResourceMap<Sound>();
  public readonly soundEvents = new ResourceMap<SoundEvent>();
  public readonly languages = new ResourceMap<Language>();
  public readonly texts = new ResourceMap<Text>();
  public readonly fonts = new ResourceMap<Font>();
  public readonly fontData = new ResourceMap<FontData>();
  public readonly postEffects = new ResourceMap<PostEffect>();
  public readonly programs = new ResourceMap<Program>();
  public readonly shaders = new ResourceMap<Shader>();

  public constructor(public description: Component = "", public icon?: Uint8Array) { }

  public async read(dir: string): Promise<void> {
    const meta: ResourcePackMetadata = await readJSON(path.join(dir, "pack.mcmeta"));
    this.description = meta.pack.description;
    this.languageMetadata = meta.language;
    try {
      this.icon = await fs.readFile(path.join(dir, "pack.png"));
    } catch (e) {
      this.icon = undefined;
    }
    dir = path.join(dir, this.type);
    try {
      this.gpuWarnlist = await readJSON(path.join(dir, "minecraft", "gpu_warnlist.json"));
    } catch (e) {
      this.gpuWarnlist = undefined;
    }
    await readTextures(dir, this.textures);
    await readTextureMetadata(dir, this.textureMetadata);
    await readBlockstates(dir, this.blockstates);
    await readModels(dir, this.models);
    await readSounds(dir, this.sounds);
    await readSoundEvents(dir, this.soundEvents);
    await readLanguages(dir, this.languages);
    await readTexts(dir, this.texts);
    await readFonts(dir, this.fonts);
    await readFontData(dir, this.fontData);
    await readPostEffects(dir, this.postEffects);
    await readPrograms(dir, this.programs);
    await readShaders(dir, this.shaders);
  }

  public async write(dir: string): Promise<void> {
    await emptyDir(dir);
    const meta: ResourcePackMetadata = {
      pack: {
        description: this.description,
        pack_format: 5
      },
      language: this.languageMetadata
    };
    await writeJSON(path.join(dir, "pack.mcmeta"), meta);
    if (this.icon) await fs.writeFile(path.join(dir, "pack.png"), this.icon);
    dir = path.join(dir, this.type);
    if (this.gpuWarnlist) await writeJSON(path.join(dir, "minecraft", "gpu_warnlist.json"), this.gpuWarnlist);
    await writeTextures(dir, this.textures);
    await writeTextureMetadata(dir, this.textureMetadata);
    await writeBlockstates(dir, this.blockstates);
    await writeModels(dir, this.models);
    await writeSounds(dir, this.sounds);
    await writeSoundEvents(dir, this.soundEvents);
    await writeLanguages(dir, this.languages);
    await writeTexts(dir, this.texts);
    await writeFonts(dir, this.fonts);
    await writeFontData(dir, this.fontData);
    await writePostEffects(dir, this.postEffects);
    await writePrograms(dir, this.programs);
    await writeShaders(dir, this.shaders);
  }
}

export class DataPack {
  public readonly type: PackType = "data";
  public readonly advancements = new ResourceMap<Advancement>();
  public readonly functions = new ResourceMap<MCFunction>();
  public readonly lootTables = new ResourceMap<LootTable>();
  public readonly predicates = new ResourceMap<Predicate>();
  public readonly recipes = new ResourceMap<Recipe>();
  public readonly structures = new ResourceMap<Structure>();
  public readonly tags = new ResourceMap<Tag>();
  // public readonly dimensionTypes = new ResourceMap<DimensionType>();
  // public readonly dimensions = new ResourceMap<Dimension>();
  // public readonly biomes = new ResourceMap<Biome>();
  // public readonly carvers = new ResourceMap<Carver>();
  // public readonly features = new ResourceMap<Feature>();
  // public readonly structureFeatures = new ResourceMap<StructureFeature>();
  // public readonly surfaceBuilders = new ResourceMap<SurfaceBuilder>();
  // public readonly noiseSettings = new ResourceMap<NoiseSettings>();
  // public readonly processorLists = new ResourceMap<ProcessorList>();
  // public readonly templatePools = new ResourceMap<TemplatePool>();

  public constructor(public description: Component = "", public icon?: Uint8Array) { }

  public async read(dir: string): Promise<void> {
    const meta: DataPackMetadata = await readJSON(path.join(dir, "pack.mcmeta"));
    this.description = meta.pack.description;
    try {
      this.icon = await fs.readFile(path.join(dir, "pack.png"));
    } catch (e) {
      this.icon = undefined;
    }
    dir = path.join(dir, this.type);
    await readAdvancements(dir, this.advancements);
    await readFunctions(dir, this.functions);
    await readLootTables(dir, this.lootTables);
    await readPredicates(dir, this.predicates);
    await readRecipes(dir, this.recipes);
    await readStructures(dir, this.structures);
    await readTags(dir, this.tags);
    // await readDimensionTypes(dir, this.dimensionTypes);
    // await readDimensions(dir, this.dimensions);
    // await readBiomes(dir, this.biomes);
    // await readCarvers(dir, this.carvers);
    // await readFeatures(dir, this.features);
    // await readStructureFeatures(dir, this.structureFeatures);
    // await readSurfaceBuilders(dir, this.surfaceBuilders);
    // await readNoiseSettings(dir, this.noiseSettings);
    // await readProcessorLists(dir, this.processorLists);
    // await readTemplatePools(dir, this.templatePools);
  }

  public async write(dir: string): Promise<void> {
    await emptyDir(dir);
    const meta: DataPackMetadata = {
      pack: {
        description: this.description,
        pack_format: 5
      }
    };
    await writeJSON(path.join(dir, "pack.mcmeta"), meta);
    if (this.icon) await fs.writeFile(path.join(dir, "pack.png"), this.icon);
    dir = path.join(dir, this.type);
    await writeAdvancements(dir, this.advancements);
    await writeFunctions(dir, this.functions);
    await writeLootTables(dir, this.lootTables);
    await writePredicates(dir, this.predicates);
    await writeRecipes(dir, this.recipes);
    await writeStructures(dir, this.structures);
    await writeTags(dir, this.tags);
    // await writeDimensionTypes(dir, this.dimensionTypes);
    // await writeDimensions(dir, this.dimensions);
    // await writeBiomes(dir, this.biomes);
    // await writeCarvers(dir, this.carvers);
    // await writeFeatures(dir, this.features);
    // await writeStructureFeatures(dir, this.structureFeatures);
    // await writeSurfaceBuilders(dir, this.surfaceBuilders);
    // await writeNoiseSettings(dir, this.noiseSettings);
    // await writeProcessorLists(dir, this.processorLists);
    // await writeTemplatePools(dir, this.templatePools);
  }
}
