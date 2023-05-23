#!/usr/bin/env node --no-warnings

import yargs from "yargs";

import { getConfig } from "./utils/getConfig";
import prompts from "prompts";
import { initialize } from "./runners/initialize";
import { addComponent } from "./runners/addComponent";
import ora from "ora";

const ROOT_DIR = process.cwd();

const initialArgs = yargs(process.argv.slice(2))
  .scriptName("matrix-ui")
  .usage("$0 <cmd> [args]")
  .command("add <name>", "Add a new component", (yargs) => {
    yargs.positional("name", {
      type: "string",
      describe: "Name of the component",
    });
  })

  .demandCommand(1)
  .help().argv as Awaited<ReturnType<(typeof yargs)["parse"]>>;

const command = initialArgs._[0];

async function runAddComponent(name: string) {
  let config = await getConfig(ROOT_DIR);

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

function runInit() {
  console.log("Initializing");
}

switch (command) {
  case "add":
    runAddComponent(initialArgs.name as string);
    break;
  case "init":
    runInit();
    break;
}
