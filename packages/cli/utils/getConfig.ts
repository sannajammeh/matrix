import { readFile } from "fs/promises";
import path from "path";

export interface RadiantUiConfig {
  components: string;
}

/**
 * Reads the config from root dirs package.json
 */
export async function getConfig(rootDir: string) {
  const packageJson = await readFile(
    path.resolve(rootDir, "package.json"),
    "utf-8"
  );
  const matrixUi = JSON.parse(packageJson)["radiant-cli"];

  const matrixUiFile = await readFile(
    path.resolve(rootDir, "radiant-ui.json"),
    "utf-8"
  )
    .then((f) => JSON.parse(f) as RadiantUiConfig)
    .catch(() => undefined);

  const config = matrixUiFile ?? (matrixUi as RadiantUiConfig | undefined);
  return config
    ? {
        config,
        target: matrixUiFile ? "radiant-ui.json" : "package.json",
      }
    : undefined;
}

export async function getPackageJson(rootDir: string) {
  const packageJson = await readFile(
    path.resolve(rootDir, "package.json"),
    "utf-8"
  )
    .then((f) => JSON.parse(f))
    .catch(() => {
      throw new Error("package.json not found");
    });

  return packageJson;
}
