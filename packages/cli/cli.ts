#!/usr/bin/env node --no-warnings

import yargs from "yargs";

import { getConfig, getPackageJson } from "./utils/getConfig";
import prompts from "prompts";
import {
  forceGitCommit,
  initGlobals,
  initialize,
  initializeConfig,
  promptFrameworkInfo,
} from "./runners/initialize";
import { addComponent } from "./runners/addComponent";
import ora from "ora";
import { AsyncLocalStorage } from "async_hooks";

const ROOT_DIR = process.cwd();

const initialArgs = yargs(process.argv.slice(2))
  .scriptName("radiant-ui")
  .usage("$0 <cmd> [args]")
  .command("add <name>", "Add a new component", (yargs) => {
    yargs.positional("name", {
      type: "string",
      describe: "Name of the component",
    });
  })
  .command("init", "Initialize a new project")

  .demandCommand(1)
  .help().argv as Awaited<ReturnType<(typeof yargs)["parse"]>>;

const command = initialArgs._[0];

async function runAddComponent(name: string) {
  let config = (await getConfig(ROOT_DIR))?.config;

  if (!config) {
    const response = await prompts([
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
    ]);

    if (!response.shouldInit) {
      console.log("This will result in a prompt each time you run matrix-ui.");
    } else {
      const result = await initialize({
        target: response.target,
        rootDir: ROOT_DIR,
      });

      config = result.config;
    }
  }

  const spinner = ora(`Adding ${name}`).start();

  await addComponent({
    name,
    rootDir: ROOT_DIR,
    config: {
      components: config?.components!, // TODO fix this
    },
  });

  spinner.succeed(`Added ${name}`);
}

async function runInit() {
  // Grab and store package.json in async local storage
  await forceGitCommit();
  const frameworkInfo = await promptFrameworkInfo();
  const { config } = await initializeConfig({
    rootDir: ROOT_DIR,
    framework: frameworkInfo,
  });

  await initGlobals(config);

  // 5. Check for file configurations (tailwind.config.js, globals.css, classed.config.js)
  // 6. If they exist, ask if they want to overwrite
  // 7. If they don't, ask where they want to create them
  // 8. Instruct user how to add a component next
}

switch (command) {
  case "add":
    runAddComponent(initialArgs.name as string);
    break;
  case "init":
    runInit();
    break;
}
