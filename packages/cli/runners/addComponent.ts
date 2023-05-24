import path from "path";
import { RadiantUiConfig, getPackageJson } from "../utils/getConfig";
import {
  fetchGeneratedModules,
  getRecursiveComponent,
  getSingleComponent,
} from "../utils/getSingleComponent";
import { writeFileRecursive } from "../utils/writeFileRecursive";
import ora from "ora";
import { access, readFile, writeFile } from "fs/promises";
import prompts from "prompts";
import { installDependencies } from "./installDeps";

interface Config {
  name: string;
  rootDir: string;
  config: RadiantUiConfig;
}

export async function addComponent({
  name,
  rootDir,
  config: { components: componentsDir },
}: Config) {
  const spinner = ora("Fetching generated modules").start();
  const modules = await fetchGeneratedModules();
  const packageJson = await getPackageJson(rootDir);
  const resolvedComponentsDir = path.resolve(rootDir, componentsDir);
  // Get the component template
  const { internalDependencies, externalDependencies, content } =
    await getRecursiveComponent(name, modules);

  const filteredInternalDependencies = internalDependencies.filter(
    (dep) => dep !== "classed.config"
  );

  const filteredExternalDependencies = externalDependencies.filter(
    (dep) => dep !== "react" && dep !== "react-dom"
  );

  const componentPath = path.resolve(rootDir, componentsDir, `${name}.tsx`);

  spinner.text = `Adding ${name} to ${componentPath}`;

  // Check if the component already exists and ask the user if they want to overwrite it
  const componentExists = await fileExists(componentPath);
  if (componentExists) {
    const result = await prompts({
      type: "confirm",
      name: "overwrite",
      message: `Component ${name} already exists. Do you want to overwrite it?`,
      initial: false,
    });

    spinner.stop();

    if (!result.overwrite) return;
  }

  // Write the component
  await writeComponent(name, content, resolvedComponentsDir);

  // Write the dependencies in paralell
  const skipped: string[] = [];
  const internalDepsPromises = filteredInternalDependencies.map(async (dep) => {
    const exists = await fileExists(
      path.resolve(resolvedComponentsDir, `${dep}.tsx`)
    );
    if (!exists) skipped.push(dep);

    const { content } = await getSingleComponent(dep, modules);
    await writeComponent(dep, content, resolvedComponentsDir);
  });

  if (internalDepsPromises.length)
    spinner.text = `Adding components used by ${name}`;

  await Promise.all(internalDepsPromises);

  // Install the dependencies (external)

  const externalDeps = filteredExternalDependencies.filter(
    (dep) => !packageJson.dependencies[dep]
  );

  if (externalDeps.length) {
    spinner.text = `Installing dependencies for ${name}`;
    await installDependencies({
      dependencies: externalDeps,
      devDependencies: [],
    });
  }

  spinner.succeed(`Added ${name} to ${`${componentsDir}/${name}.tsx`}`);
}

async function writeComponent(
  name: string,
  content: string,
  componentsDir: string
) {
  const componentPath = path.resolve(componentsDir, `${name}.tsx`);

  await writeFileRecursive(componentPath, content);

  const indexFilePath = path.resolve(componentsDir, "index.ts");

  const indexFileExists = await fileExists(indexFilePath);
  if (!indexFileExists) {
    await writeFile(
      indexFilePath,
      `
export * from "./classed.config";
export * from "./${name}";
`.trim()
    );
  }

  const indexFileContent = await readFile(indexFilePath);
  const indexFileContentString = indexFileContent.toString();

  const indexFileLines = indexFileContentString.split("\n");

  const exportExists = indexFileLines.some((line) =>
    line.includes(`./${name}`)
  );

  if (exportExists) return;

  await writeFile(
    indexFilePath,
    `${indexFileContentString}\nexport * from "./${name}";`
  );
}

async function fileExists(path: string) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
