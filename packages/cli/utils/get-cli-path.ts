import url from "url";

export function getCLIPath() {
  const cliPath = url.fileURLToPath(new URL("../", import.meta.url));
  return cliPath;
}
