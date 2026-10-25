import fs from "node:fs";
import path from "node:path";
import { parseLegacyHtml } from "@/lib/legacy-content";

export function getLegacyFeatureAiPage() {
  const html = fs.readFileSync(path.join(process.cwd(), "pages", "feature-ai.html"), "utf8");
  return parseLegacyHtml("feature-ai", html);
}
