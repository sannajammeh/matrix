import { fdir } from "fdir";
import path from "path";
import { readFile, writeFile } from "fs/promises";

const FILE_NAME = "generated-modules.json";

const componentsPath = path.resolve("../core/src/components");

interface Content {
  content: string;
  internalDependencies: string[];
  externalDependencies: string[];
}

type ContentMap = Record<string, Content>;

const relative_import_regex = /^import\s.*from\s*["']\..*["'];$/;

async function bootstrap() {
  const files = await new fdir()
    .glob(`**/*.{ts,tsx}`)
    .withFullPaths()
    .crawl(componentsPath)
    .withPromise();

  const tailwindFile = path.resolve("../core/tailwind.config.js");
  const pluginRadixColors = path.resolve("../core/radix-colors.js");
  const globalStyles = path.resolve("../core/globals.css");

  const contentJson: ContentMap = {};

  for (const file of [
    ...files,
    tailwindFile,
    pluginRadixColors,
    globalStyles,
  ]) {
    // Fetch each file
    const content = await readFile(file, "utf-8");

    // Get the file name and remove the extension
    const fileName = path.basename(file);
    const name = fileName.replace(path.extname(file), "");

    // Find all the imports
    const imports = content.match(/import.*from.*;/g);

    const target: Content = (contentJson[name] = {
      content,
      internalDependencies: [],
      externalDependencies: [],
    });

    // If there are imports, find the internal and external dependencies
    if (imports) {
      for (const importStatement of imports) {
        const isRelativeImport = relative_import_regex.test(importStatement);

        const fileName = importStatement.match(
          /(?<=from\s*["']).*(?=["'];)/g
        )?.[0];
        if (!fileName)
          throw new Error("Could not find file name, this should never happen");

        if (isRelativeImport) {
          target.internalDependencies.push(fileName.replace("./", ""));
        } else {
          target.externalDependencies.push(fileName);
        }
      }
    }
  }

  // Write the file
  await writeFile(
    path.resolve("./", FILE_NAME),
    JSON.stringify(contentJson, null, 2)
  );
}

bootstrap();
