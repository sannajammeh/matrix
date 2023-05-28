import prompts from "prompts";
import { fetchGeneratedModules } from "../utils/getSingleComponent";
import { exitProcess } from "../utils/exec";

const ignoredModules = [
  "classed.config",
  "tailwind.config",
  "globals",
  "plugin-radix-colors",
  "radix-colors",
];

export async function listComponents() {
  const modules = await fetchGeneratedModules();

  const moduleNames = Object.keys(modules);

  const filteredModules = moduleNames.filter((moduleName) => {
    return !ignoredModules.includes(moduleName);
  });

  return filteredModules;
}

export async function selectComponent() {
  const components = await listComponents();

  const result = await prompts(
    [
      {
        type: "select",
        name: "component",
        message: "Select a component",
        choices: components.map((component) => ({
          title: component,
          value: component,
        })),
      },
    ],
    {
      onCancel: exitProcess,
    }
  );

  return result.component as string;
}
