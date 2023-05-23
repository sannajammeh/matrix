import prompts from "prompts";
import { getPackageJson, MatrixUiConfig } from "../utils/getConfig";
import ora from "ora";
import { writeFile } from "fs/promises";
import path from "path";
import { glob } from "glob";
import { getSingleComponent } from "../utils/getSingleComponent";
import { writeFileRecursive } from "../utils/writeFileRecursive";
import {
  getPkgManagerInstallCommand,
  getUserPkgManager,
} from "../utils/getUserPkgManager";
import { installDependencies } from "./installDeps";

const requiredDeps = [
  "@tw-classed/react",
  "@radix-ui/colors",
  "tailwind-merge",
];

const requiredDevDeps: string[] = [];

interface InitializeArgs {
  target: "package.json" | "matrix-ui.json";
  rootDir: string;
}

export async function initialize({ target, rootDir }: InitializeArgs) {
  const configQuestions = await prompts([
    {
      type: "text",
      message: "Where do you want to store your components?",
      name: "components",
      initial: "./src/components/ui",
    },
  ]);

  const config: MatrixUiConfig = {
    components: configQuestions.components,
  };

  const packageJson = await getPackageJson(rootDir);

  const spinner = ora("Writing config").start();

  switch (target) {
    case "package.json":
      packageJson["matrix-cli"] = config;
      await writeFile(
        path.resolve(rootDir, "package.json"),
        JSON.stringify(packageJson, null, 2)
      );

      break;
    case "matrix-ui.json":
      await writeFile(
        path.resolve(rootDir, "matrix-ui.json"),
        JSON.stringify(config, null, 2)
      );
      break;
  }

  spinner.succeed("Config written");

  // Check for classed.config.ts, tailwind.config.js file, if not found create one
  const classedConfig = glob.sync(
    path.join(rootDir, "**", "classed.config.ts")
  );

  if (classedConfig.length === 0) {
    spinner.start("Creating classed.config.ts");
    // Create classed.config.ts
    const classedConfigModule = await getSingleComponent("classed.config");

    await writeFileRecursive(
      path.join(rootDir, config.components, "classed.config.ts"),
      classedConfigModule.content
    );

    spinner.succeed("Created classed.config.ts");
  }

  // Check package.json for deps required and install them
  const deps = new Set([...Object.keys(packageJson.dependencies || {})]);

  const devDeps = new Set([...Object.keys(packageJson.devDependencies || {})]);

  const missingDeps = requiredDeps.filter((dep) => !deps.has(dep));
  const missingDevDeps = requiredDevDeps.filter((dep) => !devDeps.has(dep));

  await installDependencies({
    dependencies: missingDeps,
    devDependencies: missingDevDeps,
    spinner,
  });

  return {
    config,
  };
}
