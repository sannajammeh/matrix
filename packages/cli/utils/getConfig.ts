import { readFile } from "fs/promises";
import path from "path";

export interface MatrixUiConfig {
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
  const matrixUi = JSON.parse(packageJson)["matrix-cli"];

  const matrixUiFile = await readFile(
    path.resolve(rootDir, "matrix-ui.json"),
    "utf-8"
  )
    .then((f) => JSON.parse(f) as MatrixUiConfig)
    .catch(() => undefined);

  return matrixUiFile ?? (matrixUi as MatrixUiConfig | undefined);
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
