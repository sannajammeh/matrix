import prompts from "prompts";
import { getConfig, getPackageJson, RadiantUiConfig } from "../utils/getConfig";
import ora from "ora";
import { writeFile } from "fs/promises";
import path from "path";
import { getSingleComponent } from "../utils/getSingleComponent";
import { writeFileRecursive } from "../utils/writeFileRecursive";
import { installDependencies } from "./installDeps";
import { fdir } from "fdir";
import { existsSync } from "fs";
import { execAsync } from "../utils/exec";

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

  const config: RadiantUiConfig = {
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

  const classedConfig = await new fdir({
    exclude: (dirName) => dirName.includes("node_modules"),
  })
    .glob("**/classed.config.ts")
    .crawl(rootDir)
    .withPromise();

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

export async function initializeConfig({
  rootDir,
  framework,
}: {
  rootDir: string;
  framework: FrameworkInfo;
}) {
  // 1. Check if config exists
  // 2. If it does, ask if they want to overwrite
  // 3. If it doesn't, ask where they want to create it
  // 4. Create it
  let { config, target: currentTarget } = (await getConfig(rootDir)) ?? {};
  let override = false;
  if (config) {
    const response = await prompts([
      {
        type: "confirm",
        name: "override",
        message:
          "A matrix-ui config already exists. Do you want to overwrite it?",
        initial: true,
      },
    ]);

    if (!response.override) {
      return {
        config,
      };
    }

    override = response.override;
  }

  const configQuestions = [
    {
      type: "text",
      message: "Where do you want to store your components?",
      name: "components" as const,
      initial: framework.srcDir ? "./src/components/ui" : "./components/ui",
    },
  ] satisfies prompts.PromptObject[];

  const prompter = override
    ? prompts(configQuestions)
    : prompts([
        {
          type: "confirm",
          name: "shouldInit",
          message: "No matrix-ui config found. Do you want to create one?",
          initial: true,
        },
        {
          type: (prev) => (prev ? "select" : null),
          name: "target",
          message: "Where do you want to create the config? (its very small)",
          choices: [
            {
              title: "In package.json",
              value: "package.json",
            },
            {
              title: "Separate matrix-ui.json",
              value: "matrix-ui.json",
            },
          ],
        },
        ...configQuestions,
      ]);

  const answer = (await prompter) as prompts.Answers<
    "shouldInit" | "target" | "components"
  >;

  let configToWrite = {
    components: answer.components,
  } satisfies RadiantUiConfig;

  if (override) {
    configToWrite = {
      ...config,
      ...configToWrite,
    };
  }

  const spinner = ora("Writing config").start();

  const target = override ? currentTarget : answer.target;

  const packageJson = await getPackageJson(rootDir);

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

  return {
    config: configToWrite,
  };
}

export async function promptFrameworkInfo(): Promise<FrameworkInfo> {
  const frameworkInfo = await prompts([
    {
      type: "select",
      name: "framework",
      message: "What framework are you using?",
      choices: [
        {
          title: "Next.js",
          value: "next",
        },
        {
          title: "React (Vite etc)",
          value: "react",
          description: "I will add my own globals",
        },
      ],
    },
    {
      type: (prev) => (prev === "next" ? "toggle" : null),
      name: "srcDir",
      message: "I am using a custom src directory",
      initial: false,
    },
  ]);

  return frameworkInfo.framework === "next"
    ? frameworkInfo
    : {
        ...frameworkInfo,
        srcDir: true,
      };
}

type FrameworkInfo = {
  framework: "next" | "react";
  srcDir: boolean;
};

export async function initGlobals(config: RadiantUiConfig) {
  // 5. Check for file configurations (tailwind.config.js, globals.css, classed.config.js)
  // 6. If they exist, ask if they want to overwrite
  // 7. If they don't, ask where they want to create them
  // 8. Instruct user how to add a component next
}

export async function forceGitCommit() {
  // Check if git is initialized
  const gitInitialized = await execAsync<string>(
    "git rev-parse --is-inside-work-tree"
  ).then((r) => r.trim() === "true");

  if (!gitInitialized) {
    return; // No need as there is no git
  }

  const hasUncommitted = await execAsync<string>("git status --porcelain").then(
    (r) => r.trim() !== ""
  );
  console.log(
    "🚀 ~ file: initialize.ts:275 ~ forceGitCommit ~ hasUncommitted:",
    hasUncommitted
  );

  process.exit(0);
  // If it is, make sure there are no uncommitted changes
  // If there are, prompt user to commit them
  // If git is not initialized, initialize it
}
