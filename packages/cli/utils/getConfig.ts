import { readFile } from "fs/promises";
import path from "path";
import { UI_NAME } from "./domain";

export interface n5UiConfig {
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
  const matrixUi = JSON.parse(packageJson)[UI_NAME];

  const matrixUiFile = await readFile(
    path.resolve(rootDir, `${UI_NAME}.json`),
    "utf-8"
  )
    .then((f) => JSON.parse(f) as n5UiConfig)
    .catch(() => undefined);

  const config = matrixUiFile ?? (matrixUi as n5UiConfig | undefined);
  return config
    ? {
        config,
        target: matrixUiFile ? `${UI_NAME}.json` : "package.json",
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
