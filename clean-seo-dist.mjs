import { promises as fs } from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const distDir = path.join(cwd, "dist");

const generatedPaths = [
  "__seo",
  "403",
  "404",
  "album",
  "albums",
  "artist",
  "artist-auth",
  "artist-request",
  "history",
  "login",
  "me",
  "new-release",
  "register",
  "search",
  "song",
  "top-100",
  "top-50",
  "verify-email",
  "zing-chart",
  "404.html",
  "robots.txt",
  "sitemap.xml",
];

const removeIfExists = async (targetPath) => {
  try {
    await fs.rm(targetPath, {
      recursive: true,
      force: true,
      maxRetries: 8,
      retryDelay: 250,
    });
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
};

const main = async () => {
  for (const entry of generatedPaths) {
    await removeIfExists(path.join(distDir, entry));
  }
};

main().catch((error) => {
  console.error("[seo] Failed to clean previous prerender output.", error);
  process.exitCode = 1;
});
