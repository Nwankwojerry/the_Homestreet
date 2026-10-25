import fs from "node:fs";
import path from "node:path";
import { parseLegacyHtml } from "@/lib/legacy-content";

export function getHomePage() {
  const html = fs.readFileSync(path.join(process.cwd(), "index.html"), "utf8");
  return parseLegacyHtml("", html);
}
