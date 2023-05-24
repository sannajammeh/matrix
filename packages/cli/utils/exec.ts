import { exec } from "child_process";

export const execAsync = async <T extends string>(command: string) => {
  return new Promise<T>((resolve, reject) => {
    exec(command, (err, stdout, _) => {
      if (err) {
        return reject(err);
      }
      resolve(stdout as T);
    });
  });
};

export const exitProcess = () => {
  process.exit(0);
};
