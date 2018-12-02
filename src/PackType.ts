export class PackType {
  public static readonly RESOURCE_PACK = new PackType("assets");
  public static readonly DATA_PACK = new PackType("data");

  private constructor(public readonly dirname: string) { }
}
