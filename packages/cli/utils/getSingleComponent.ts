import { getCLIPath } from "./get-cli-path";
import path from "path";

export interface IModule {
  content: string;
  internalDependencies: string[];
  externalDependencies: string[];
}

export async function getSingleComponent(
  name: string,
  generatedModules?: Modules
): Promise<IModule> {
  const cliPath = getCLIPath();

  // ./generated-modules.json
  const generatedModulesPath = path.resolve(cliPath, "generated-modules.json");

  const resolvedModules: Record<string, IModule> =
    generatedModules ||
    (await import(generatedModulesPath, {
      assert: { type: "json" },
    }).then((m) => m.default));

  return resolvedModules[name];
}

type Modules = Record<string, IModule>;

type IModuleResolved = IModule & {
  __resolved: boolean;
};

/**
 * Get a component and all of its dependencies recursively
 */
export async function getRecursiveComponent(
  name: string,
  generatedModules: Modules
): Promise<IModuleResolved> {
  const module = generatedModules[name];

  const internalDependencies = await Promise.all(
    module.internalDependencies.map(async (dep) => {
      return (await getRecursiveComponent(dep, generatedModules))
        .internalDependencies;
    })
  ).then((deps) => {
    const filteredDeps = new Set([
      ...deps.flat(),
      ...module.internalDependencies,
    ]);
    // Remove the current module from the dependencies if its referenced
    filteredDeps.delete(name);
    return Array.from(filteredDeps);
  });

  // Flattened array of all external deps of the module plus all internal deps
  const externalDependencies = await Promise.all(
    internalDependencies.map(async (dep) => {
      return (await getRecursiveComponent(dep, generatedModules))
        .externalDependencies;
    })
  ).then((deps) => {
    const filteredDeps = new Set([
      ...deps.flat(),
      ...module.externalDependencies,
    ]);
    return Array.from(filteredDeps);
  });

  return {
    content: module.content,
    internalDependencies,
    externalDependencies,
    __resolved: true,
  };
}

export const fetchGeneratedModules = async (): Promise<Modules> => {
  const cliPath = getCLIPath();
  const generatedModulesPath = path.resolve(cliPath, "generated-modules.json");

  return await import(generatedModulesPath, {
    assert: { type: "json" },
  }).then((m) => m.default);
};
