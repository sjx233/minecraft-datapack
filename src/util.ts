import fs from "fs-extra";
import glob from "glob";
import path from "path";
import ResourceLocation from "resource-location";

export async function getNamespaces(dirname: string) {
  return fs.readdirSync(dirname, {
    withFileTypes: true
  }).filter(x => x.isDirectory()).map(x => x.name).filter(x => x === x.toLowerCase());
}

export async function getNamespacedPaths(dirname: string, base: string, extension?: string) {
  return (await getNamespaces(dirname)).map(x => ({
    namespace: x,
    paths: glob.sync(extension ? `*${extension}` : "*", {
      cwd: path.join(dirname, x, base),
      matchBase: true,
      nodir: true
    })
  }));
}

export async function getResourceLocations(dirname: string, base: string, extension?: string) {
  return (await getNamespacedPaths(dirname, base, extension)).map(x => {
    const namespace = x.namespace;
    return x.paths.map(x => new ResourceLocation(namespace, x));
  }).reduce((x, y) => x.concat(y), []);
}
