import prompts from "prompts";
import { getConfig, getPackageJson, n5UiConfig } from "../utils/getConfig";
import ora from "ora";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { getSingleComponent } from "../utils/getSingleComponent";
import { writeFileRecursive } from "../utils/writeFileRecursive";
import { installDependencies } from "./installDeps";
import { fdir } from "fdir";
import { existsSync } from "fs";
import { execAsync, exitProcess } from "../utils/exec";
import { getGlobalStore, globalStore } from "../utils/globalStore";
import { detectSrcDir, fileDir, getFdir } from "../utils/detectSrcDir";
import { getTailwindConfig } from "../template/tailwind.config";
import { UI_NAME } from "../utils/domain";

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

  const config: n5UiConfig = {
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

export async function initClassedConfig({
  rootDir,
  config,
}: {
  rootDir: string;
  config: n5UiConfig;
}) {
  const packageJson = await getPackageJson(rootDir);
  const spinner = ora("Installing and configuring tw-classed").start();
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

  spinner.start("Writing index.ts");

  // Write index.ts file
  const indexFilePath = path.join(rootDir, config.components, "index.ts");
  const indexFileExists = existsSync(
    path.join(rootDir, config.components, "index.ts")
  );
  if (!indexFileExists) {
    await writeFile(indexFilePath, `export * from "./classed.config"`);
  } else {
    const indexFile = await readFile(indexFilePath, "utf-8");
    if (!indexFile.includes("classed.config")) {
      await writeFile(
        indexFilePath,
        `${indexFile}\nexport * from "./classed.config"`
      );
    }
  }

  spinner.succeed("Wrote index.ts");

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
    const response = await prompts(
      [
        {
          type: "confirm",
          name: "override",
          message:
            "A matrix-ui config already exists. Do you want to overwrite it?",
          initial: false,
        },
      ],
      {
        onCancel: exitProcess,
      }
    );

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
    ? prompts(configQuestions, {
        onCancel: exitProcess,
      })
    : prompts(
        [
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
        ],
        {
          onCancel: exitProcess,
        }
      );

  const answer = (await prompter) as prompts.Answers<
    "shouldInit" | "target" | "components"
  >;

  let configToWrite = {
    components: answer.components,
  } satisfies n5UiConfig;

  if (override) {
    configToWrite = {
      ...config,
      ...configToWrite,
    };
  }

  const spinner = ora("Writing config").start();

  const target = override ? currentTarget : answer.target;
  console.log("🚀 ~ file: initialize.ts:206 ~ target:", target);

  const packageJson = await getPackageJson(rootDir);

  switch (target) {
    case "package.json":
      packageJson[UI_NAME] = configToWrite;
      await writeFile(
        path.resolve(rootDir, "package.json"),
        JSON.stringify(packageJson, null, 2)
      );

      break;
    case `${UI_NAME}.json`:
      await writeFile(
        path.resolve(rootDir, `${UI_NAME}.json`),
        JSON.stringify(config, null, 2)
      );
      break;
  }

  spinner.succeed("Config written");

  return {
    config: configToWrite,
  };
}

export async function detectFrameworkInfo(rootDir: string) {
  // Only test for next.js for now
  const nextConfig = await getFdir()
    .glob("**/next.config.{mjs,js,cjs,tsx}")
    .onlyCounts()
    .crawl(rootDir)
    .withPromise();
  const srcDir = await getFdir()
    .glob("**/src")
    .onlyCounts()
    .crawl(rootDir)
    .withPromise();

  if (nextConfig.files > 0) {
    return {
      framework: "next" as const,
      srcDir: srcDir.directories > 0,
    };
  }

  return null;
}

export async function promptFrameworkInfo(
  rootDir: string
): Promise<FrameworkInfo> {
  const detected = await detectFrameworkInfo(rootDir);

  if (detected) {
    return {
      framework: detected.framework,
      srcDir: detected.srcDir,
    };
  }

  const frameworkInfo = await prompts(
    [
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
        type: (prev) => (prev === "next" ? "confirm" : null),
        name: "srcDir",
        message: "I am using a custom src directory",
        initial: await detectSrcDir(rootDir),
      },
    ],
    {
      onCancel: exitProcess,
    }
  );

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

export async function initGlobals({
  rootDir,
  config,
  framework,
}: {
  rootDir: string;
  config: n5UiConfig;
  framework: FrameworkInfo;
}) {
  let responses: string[] = [];

  if (framework.framework !== "next")
    console.warn(
      "You are using a custom framework. You will need to add the globals yourself"
    );

  // 5. Check for file configurations (tailwind.config.js, globals.css, classed.config.js)
  const [presetLocation] = await new fdir()
    .withFullPaths()
    .glob("**/preset-n5.js")
    .crawl(rootDir)
    .withPromise();
  const [tailwindLocation] = await getFdir()
    .withFullPaths()
    .glob("**/tailwind.config.js")
    .crawl(rootDir)
    .withPromise();
  const [globalsLocation] = await getFdir()
    .withFullPaths()
    .glob("**/globals.{css,scss}")
    .crawl(rootDir)
    .withPromise();

  let presetPath = path.join(config.components, "preset-n5.js");
  let tailwindWritten = false;
  if (!tailwindLocation) {
    const answer = await prompts(
      {
        type: "confirm",
        message: "Write tailwind config?",
        name: "writeTailwind",
        initial: true,
      },
      {
        onCancel: exitProcess,
      }
    );

    if (answer.writeTailwind) {
      await writeFile(
        path.join(rootDir, "tailwind.config.js"),
        getTailwindConfig({
          srcDir: framework.srcDir,
          presetPath: presetPath.startsWith("./")
            ? presetPath
            : "./" + presetPath,
        })
      );
      tailwindWritten = true;
    } else
      responses.push(
        `
Tailwind config not written, you will need to add the presets yourself
See: https://n5.vercel.app/docs/getting-started`.trim()
      );
  }

  const spinner = ora("Initializing globals").start();

  if (!presetLocation) {
    const pluginPath = path.join(config.components, "radix-colors.js");
    const { content } = await getSingleComponent("tailwind.config");
    const { content: plugin } = await getSingleComponent("plugin-radix-colors");
    await writeFileRecursive(path.join(rootDir, presetPath), content);
    await writeFileRecursive(path.join(rootDir, pluginPath), plugin);
  }

  const { content: globalCss } = await getSingleComponent("globals");

  if (!globalsLocation) {
    const globalsPath = framework.srcDir
      ? "./src/styles/globals.css"
      : "./styles/globals.css";

    await writeFileRecursive(path.join(rootDir, globalsPath), globalCss);
  } else {
    // Split the globalCss from the last @tailwind mention
    const lines = globalCss.split("\n");
    const lastTailwindIndex = lines.lastIndexOf("@tailwind");
    const tailwindBase = lines.slice(0, lastTailwindIndex).join("\n");
    const rest = lines.slice(lastTailwindIndex).join("\n");
    // Check if tailwind has been setup
    const globalsContent = await readFile(globalsLocation, "utf-8");
    if (globalsContent.includes("@tailwind")) {
      const newCssFile = `${globalsContent}\n${rest}`;

      await writeFile(globalsLocation, newCssFile);
    } else {
      const newCssFile = `${tailwindBase}\n${globalsContent}\n${rest}`;

      await writeFile(globalsLocation, newCssFile);
    }
  }

  responses.push(
    "Globals written. You can now use the n5 components in your app enter: `pnpm n5 add <component>`"
  );

  spinner.succeed("Globals initialized");

  return {
    responses,
  };
}

export async function forceGitCommit() {
  const store = getGlobalStore();

  // Check if git is initialized
  const gitInitialized = await execAsync<string>(
    "git rev-parse --is-inside-work-tree"
  ).then((r) => r.trim() === "true");

  if (store.argv.force) return; // Ignore if force is passed

  if (!gitInitialized) {
    return; // No need as there is no git
  }

  const hasUncommitted = await execAsync<string>("git status --porcelain").then(
    (r) => r.trim() !== ""
  );

  if (!hasUncommitted) {
    return; // No need as there are no uncommitted changes
  }

  console.log(
    "You have uncommitted changes. Please commit them before continuing. Use --force to ignore this warning."
  );
  process.exit(0);
}
