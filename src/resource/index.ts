import { PackType } from "../pack";
import { packTypes } from "../pack/type";
import { ResourceType, resourceTypes } from "./type";
import ResourceLocation = require("resource-location");

export const packType: ReadonlyMap<ResourceType, PackType> = new Map(packTypes.flatMap(packType => (resourceTypes[packType] as readonly ResourceType[]).map(type => [type, packType])));

export interface Texture {
  type: "texture";
  imageWidth: number;
  imageHeight: number;
  imageData: Buffer;
  frames?: {
    time: number;
    index: number;
  }[];
  width?: number;
  height?: number;
  interpolate?: true;
  hat?: "partial" | "full";
  blur?: true;
  clamp?: true;
}

export interface Text {
  type: "text";
  text: string;
}

export interface MCFunction {
  type: "function";
  commands: string[];
}

export interface Tag {
  type: "tag";
  values: (ResourceLocation | [ResourceLocation])[];
  replace?: true;
}

export interface GenericResource {
  type: ResourceType;
  content: Uint8Array;
}

export interface JsonResource {
  type: ResourceType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any;
}

export type Resource = Texture | Text | MCFunction | Tag | GenericResource | JsonResource;
export { ResourceType };
