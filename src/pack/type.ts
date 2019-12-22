import { ValuesOf } from "../util";

export const packTypes = ["assets", "data"] as const;
export type PackType = ValuesOf<typeof packTypes>;
