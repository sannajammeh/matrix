import { fdir } from "fdir";

export const detectSrcDir = async (rootDir: string) => {
  const dir = await new fdir({
    exclude: (dirName) => dirName.includes("node_modules"),
  })
    .onlyDirs()
    .filter((path, isDirectory) => isDirectory && path.includes("src"))
    .crawl(rootDir)
    .withPromise();

  const isDetected = !!dir[0];
  console.log("Detected src dir:", isDetected);
  return isDetected;
};

export const fileDir = new fdir({
  exclude: (dirName) => dirName.includes("node_modules"),
});

export const getFdir = () =>
  new fdir({
    exclude: (dirName) => dirName.includes("node_modules"),
  });
