import ora, { Ora } from "ora";
import {
  getPkgManagerInstallCommand,
  getUserPkgManager,
} from "../utils/getUserPkgManager";
import { exec } from "child_process";

interface Config {
  dependencies: string[];
  devDependencies: string[];
  spinner?: Ora;
  message?: string;
}
export async function installDependencies({
  dependencies,
  devDependencies,
  spinner: incomingSpinner,
  message,
}: Config) {
  const spinner = incomingSpinner || ora(message || "Installing dependencies");
  const packageManager = getUserPkgManager();
  const installCmd = getPkgManagerInstallCommand();

  spinner.start(`Installing required dependencies using ${packageManager}`);

  const deps = dependencies.length > 0 ? dependencies.join(" ") : null;
  const devDeps = devDependencies.length > 0 ? devDependencies.join(" ") : null;

  if (deps) {
    await new Promise<void>((resolve, reject) => {
      const installCommand = `${installCmd} ${deps}`;
      exec(installCommand, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  if (devDeps) {
    spinner.text = `Installing required dev dependencies using ${packageManager}`;
    await new Promise<void>((resolve, reject) => {
      const installCommand = `${installCmd} ${devDeps} -D`;
      exec(installCommand, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  spinner.succeed(
    devDeps || deps
      ? "Installed required dependencies"
      : "No dependencies to install"
  );
}
