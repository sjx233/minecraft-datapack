import ResourceLocation = require("resource-location");

class ResourceMap<T> implements Map<ResourceLocation, T> {
  private readonly map = new Map<string, T>();

  public get size(): number {
    return this.map.size;
  }

  public clear(): void {
    this.map.clear();
  }

  public delete(key: string | ResourceLocation): boolean {
    return this.map.delete(ResourceLocation.from(key).toString());
  }

  public get(key: string | ResourceLocation): T | undefined {
    return this.map.get(ResourceLocation.from(key).toString());
  }

  public has(key: string | ResourceLocation): boolean {
    return this.map.has(ResourceLocation.from(key).toString());
  }

  public set(key: string | ResourceLocation, value: T): this {
    this.map.set(ResourceLocation.from(key).toString(), value);
    return this;
  }

  public forEach(callback: (value: T, key: ResourceLocation, map: Map<ResourceLocation, T>) => void, thisArg?: unknown): void {
    for (const [key, value] of this.map)
      callback.call(thisArg, value, new ResourceLocation(key), this);
  }

  public * entries(): IterableIterator<[ResourceLocation, T]> {
    for (const [key, value] of this.map)
      yield [new ResourceLocation(key), value];
  }

  public * keys(): IterableIterator<ResourceLocation> {
    for (const key of this.map.keys())
      yield new ResourceLocation(key);
  }

  public values(): IterableIterator<T> {
    return this.map.values();
  }

  public [Symbol.iterator](): IterableIterator<[ResourceLocation, T]> {
    return this.entries();
  }

  public get [Symbol.toStringTag](): string {
    return "ResourceMap";
  }
}

export = ResourceMap;
