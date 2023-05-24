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
import ora from "ora";
import { globalStore } from "./utils/globalStore";
import { createRequire } from "module";
import { getCLIPath } from "./utils/get-cli-path";

const version = createRequire(getCLIPath())("./package.json").version as string;

const ROOT_DIR = process.cwd();

const initialArgs = yargs(process.argv.slice(2))
  .scriptName("radiant-ui")
  .usage("$0 <cmd> [args]")
  .command("add <name>", "Add a new component", (yargs) => {
    yargs.positional("name", {
      type: "string",
      describe: "Name of the component",
    });

    yargs.option("force", {
      type: "boolean",
      alias: "f",
      describe: "Force overwrite",
    });
  })
  .command("init", "Initialize a new project")
  .demandCommand(1)
  .version(version)
  .alias("version", "v")
  .help()
  .alias("help", "h")
  .help().argv as Awaited<ReturnType<(typeof yargs)["parse"]>>;

const command = initialArgs._[0];

async function runAddComponent(name: string) {
  let config = (await getConfig(ROOT_DIR))?.config;

  if (!config) {
    const result = await initializeConfig({
      rootDir: ROOT_DIR,
      framework: await promptFrameworkInfo(ROOT_DIR),
    });

    config = result.config;
  }

  await addComponent({
    name,
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

switch (command) {
  case "add":
    runAddComponent(initialArgs.name as string);
    break;
  case "init":
    runInit();
    break;
}
