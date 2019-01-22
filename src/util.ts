import fs from "fs-extra";
import glob from "glob";
import path from "path";
import ResourceLocation from "resource-location";

export async function getNamespaces(dirname: string) {
  return (await fs.readdir(dirname)).filter(name => name === name.toLowerCase() && fs.statSync(path.join(dirname, name)).isDirectory());
}

export async function getNamespacedPaths(dirname: string, base: string, extension?: string) {
  return (await getNamespaces(dirname)).map(namespace => ({
    namespace,
    paths: glob.sync(extension ? `*${extension}` : "*", {
      cwd: path.join(dirname, namespace, base),
      matchBase: true,
      nodir: true
    })
  }));
}

export async function getResourceLocations(dirname: string, base: string, extension?: string) {
  return (await getNamespacedPaths(dirname, base, extension)).map(namespacedPaths => {
    const namespace = namespacedPaths.namespace;
    return namespacedPaths.paths.map(path => new ResourceLocation(namespace, path));
  }).reduce((previous, current) => previous.concat(current), []);
}
