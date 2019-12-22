import ResourceLocation = require("resource-location");

export = class ResourceMap<T> implements Map<ResourceLocation, T> {
  private readonly map = new Map<string, T>();

  public get size(): number {
    return this.map.size;
  }

  public clear(): void {
    this.map.clear();
  }

  public delete(key: ResourceLocation): boolean {
    return this.map.delete(key.toString());
  }

  public get(key: ResourceLocation): T | undefined {
    return this.map.get(key.toString());
  }

  public has(key: ResourceLocation): boolean {
    return this.map.has(key.toString());
  }

  public set(key: ResourceLocation, value: T): this {
    this.map.set(key.toString(), value);
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public forEach(callback: (value: T, key: ResourceLocation, map: Map<ResourceLocation, T>) => void, thisArg?: any): void {
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
};
