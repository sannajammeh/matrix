#!/usr/bin/env node --no-warnings

import yargs from "yargs";

import { getConfig } from "./utils/getConfig";
import {
  forceGitCommit,
  initClassedConfig,
  initGlobals,
  initializeConfig,
  promptFrameworkInfo,
} from "./runners/initialize";
import { addComponent } from "./runners/addComponent";
import { globalStore } from "./utils/globalStore";
import { createRequire } from "module";
import { getCLIPath } from "./utils/get-cli-path";
import { listComponents, selectComponent } from "./runners/listComponents";

const SELECT_COMPONENT_NAME = "$$SELECT_COMPONENT$$";

const version = createRequire(getCLIPath())("./package.json").version as string;

const ROOT_DIR = process.cwd();

const initialArgs = yargs(process.argv.slice(2))
  .scriptName("n5-ui")
  .usage("$0 <cmd> [args]")
  .command("add [name]", "Add a new component", (yargs) => {
    yargs.positional("name", {
      type: "string",
      describe: "Name of the component",
      default: SELECT_COMPONENT_NAME,
    });

    yargs.option("force", {
      type: "boolean",
      alias: "f",
      describe: "Force overwrite",
    });
  })
  .command("init", "Initialize a new project")
  .command("list", "List all components")
  .demandCommand(1)
  .version(version)
  .alias("version", "v")
  .help()
  .alias("help", "h")
  .help().argv as Awaited<ReturnType<(typeof yargs)["parse"]>>;

const command = initialArgs._[0];

async function runAddComponent(name: string) {
  const resolvedName =
    name === SELECT_COMPONENT_NAME ? await selectComponent() : name;
  let config = (await getConfig(ROOT_DIR))?.config;

  if (!config) {
    const result = await initializeConfig({
      rootDir: ROOT_DIR,
      framework: await promptFrameworkInfo(ROOT_DIR),
    });

    config = result.config;
  }

  await addComponent({
    name: resolvedName,
    rootDir: ROOT_DIR,
    config: {
      components: config.components,
    },
  });
}

globalStore.enterWith({
  argv: initialArgs,
});
async function runInit() {
  // Grab and store package.json in async local storage
  await forceGitCommit();

  const frameworkInfo = await promptFrameworkInfo(ROOT_DIR);
  const { config } = await initializeConfig({
    rootDir: ROOT_DIR,
    framework: frameworkInfo,
  });

  // 5. Check for file configurations (tailwind.config.js, globals.css, classed.config.js)
  const { responses } = await initGlobals({
    config,
    rootDir: ROOT_DIR,
    framework: frameworkInfo,
  });

  await initClassedConfig({
    config,
    rootDir: ROOT_DIR,
  });

  responses.forEach((response) => {
    console.log(response);
  });
}

async function runListComponents() {
  const components = await listComponents();

  console.log(components);
}

switch (command) {
  case "add":
    runAddComponent(initialArgs.name as string);
    break;
  case "init":
    runInit();
    break;
  case "list":
    runListComponents();
    break;
}
