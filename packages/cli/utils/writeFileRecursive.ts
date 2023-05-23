// Writes a file recursively, creating directories as needed

import path from "path";
import { mkdir, writeFile } from "fs/promises";

export async function writeFileRecursive(
  filePath: string,
  content: string
): Promise<void> {
  const dir = path.dirname(filePath);

  await mkdir(dir, { recursive: true });

  return await writeFile(filePath, content);
}
