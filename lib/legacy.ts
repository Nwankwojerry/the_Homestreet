import fs from "node:fs";
import path from "node:path";
import { parseLegacyHtml, type LegacyPage } from "@/lib/legacy-content";

const ROOT = process.cwd();
const readLegacyHtml = (slug: string) => fs.readFileSync(path.join(ROOT, "pages", `${slug}.html`), "utf8");

export type { LegacyPage } from "@/lib/legacy-content";

export function getLegacySlugs(): string[] {
  return fs.readdirSync(path.join(ROOT, "pages")).filter((e) => e.endsWith(".html")).map((e) => e.replace(/\.html$/, "")).sort();
}

export function getLegacyPage(slug: string): LegacyPage {
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error("Invalid page slug");
  return parseLegacyHtml(slug, readLegacyHtml(slug));
}
