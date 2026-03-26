import { promises as fs } from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const distDir = path.join(cwd, "dist");

const removeIfExists = async (targetPath) => {
  try {
    await fs.rm(targetPath, {
      recursive: true,
      force: true,
      maxRetries: 10,
      retryDelay: 350,
    });
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
};

const main = async () => {
  await removeIfExists(distDir);
  await fs.mkdir(distDir, { recursive: true });
};

main().catch((error) => {
  console.error("[seo] Failed to clean previous prerender output.", error);
  process.exitCode = 1;
});
