import { promises as fs } from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const distDir = path.join(cwd, "dist");
const sitemapPath = path.join(distDir, "sitemap.xml");
const robotsPath = path.join(distDir, "robots.txt");

const ENV_FILES = [
  ".env",
  ".env.local",
  ".env.production",
  ".env.production.local",
];

const INDEXABLE_ROUTES = [
  "/",
  "/albums",
  "/new-release",
  "/top-50",
  "/zing-chart",
  "/zing-chart/region/vietnam",
  "/zing-chart/region/usuk",
  "/zing-chart/region/kpop",
];

const DISALLOWED_ROUTES = [
  "/admin",
  "/artist-auth",
  "/artist-request",
  "/history",
  "/library",
  "/login",
  "/me",
  "/playlists",
  "/register",
  "/search",
  "/verify-email",
];

const parseEnvContent = (content = "") =>
  content.split(/\r?\n/).reduce((acc, rawLine) => {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) return acc;

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) return acc;

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");

    if (key) {
      acc[key] = value;
    }

    return acc;
  }, {});

const loadEnvValues = async () => {
  const loaded = {};

  for (const fileName of ENV_FILES) {
    const filePath = path.join(cwd, fileName);

    try {
      const content = await fs.readFile(filePath, "utf8");
      Object.assign(loaded, parseEnvContent(content));
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
  }

  return loaded;
};

const normalizeSiteUrl = (value = "") => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";

  try {
    const normalized = new URL(trimmed);
    normalized.pathname = normalized.pathname.replace(/\/+$/, "");
    normalized.hash = "";
    normalized.search = "";
    return normalized.toString().replace(/\/$/, "");
  } catch {
    return "";
  }
};

const createRobotsTxt = (siteUrl) => {
  const lines = ["User-agent: *", "Allow: /"];

  for (const route of DISALLOWED_ROUTES) {
    lines.push(`Disallow: ${route}`);
  }

  if (siteUrl) {
    lines.push("", `Sitemap: ${siteUrl}/sitemap.xml`);
  }

  return `${lines.join("\n")}\n`;
};

const createSitemapXml = (siteUrl) => {
  const today = new Date().toISOString().split("T")[0];
  const urls = INDEXABLE_ROUTES.map(
    (route) => `  <url>
    <loc>${siteUrl}${route === "/" ? "" : route}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route === "/" ? "daily" : "weekly"}</changefreq>
    <priority>${route === "/" ? "1.0" : "0.7"}</priority>
  </url>`
  ).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
};

const removeIfExists = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
};

const main = async () => {
  const envValues = await loadEnvValues();
  const siteUrl = normalizeSiteUrl(
    process.env.VITE_SITE_URL || process.env.SITE_URL || envValues.VITE_SITE_URL
  );

  await fs.mkdir(distDir, { recursive: true });
  await fs.writeFile(robotsPath, createRobotsTxt(siteUrl), "utf8");

  if (!siteUrl) {
    await removeIfExists(sitemapPath);
    console.warn(
      "[seo] VITE_SITE_URL is missing. robots.txt was generated, but sitemap.xml was skipped."
    );
    return;
  }

  await fs.writeFile(sitemapPath, createSitemapXml(siteUrl), "utf8");
  console.log(`[seo] Generated robots.txt and sitemap.xml for ${siteUrl}`);
};

main().catch((error) => {
  console.error("[seo] Failed to generate SEO files.", error);
  process.exitCode = 1;
});
