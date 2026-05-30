#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const root = process.cwd();
const ignoredDirs = new Set(["node_modules", "dist", ".git"]);

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (ignoredDirs.has(entry.name)) {
      return [];
    }
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      return walk(path);
    }
    return entry.name.endsWith(".md") ? [path] : [];
  });
}

let failed = false;

for (const file of walk(root)) {
  const markdown = readFileSync(file, "utf8");
  const links = markdown.matchAll(/\[[^\]]+\]\(([^)]+)\)/g);

  for (const match of links) {
    const href = match[1].trim();
    if (/^(https?:|mailto:|app:\/\/|#)/.test(href)) {
      continue;
    }

    const [pathPart] = href.split("#");
    if (!pathPart) {
      continue;
    }

    const target = resolve(dirname(file), pathPart);
    if (!existsSync(target)) {
      failed = true;
      console.error(`Broken doc link in ${file.replace(`${root}/`, "")}: ${href}`);
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log("Doc link check passed.");
