#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";

const root = process.cwd();
const srcRoot = join(root, "src");

const allowedImports = {
  types: [],
  schemas: ["types"],
  providers: ["types"],
  repo: ["types", "schemas", "providers"],
  service: ["types", "schemas", "repo", "providers"],
  routes: ["types", "schemas", "service", "providers"],
  ui: ["types", "ui"]
};

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      return walk(path);
    }
    return /\.(ts|tsx)$/.test(entry.name) ? [path] : [];
  });
}

function layerFor(file) {
  const parts = relative(srcRoot, file).split(/[\\/]/);
  return parts[0] in allowedImports ? parts[0] : undefined;
}

function resolveImport(fromFile, specifier) {
  if (!specifier.startsWith(".")) {
    return undefined;
  }

  const base = resolve(dirname(fromFile), specifier);
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.jsx`,
    join(base, "index.ts"),
    join(base, "index.tsx")
  ];

  return candidates.find((candidate) => existsSync(candidate) && extname(candidate));
}

let failed = false;

for (const file of walk(srcRoot)) {
  const sourceLayer = layerFor(file);
  if (!sourceLayer) {
    continue;
  }

  const source = readFileSync(file, "utf8");
  const imports = source.matchAll(/(?:from\s+["']([^"']+)["'])|(?:import\(["']([^"']+)["']\))/g);

  for (const match of imports) {
    const specifier = match[1] ?? match[2];
    const target = resolveImport(file, specifier);
    if (!target || !target.startsWith(srcRoot)) {
      continue;
    }

    const targetLayer = layerFor(target);
    if (!targetLayer || targetLayer === sourceLayer) {
      continue;
    }

    if (!allowedImports[sourceLayer].includes(targetLayer)) {
      failed = true;
      console.error("Boundary violation");
      console.error(`  File: ${relative(root, file)}`);
      console.error(`  Import: ${specifier} -> ${relative(root, target)}`);
      console.error(`  Rule: ${sourceLayer} may import only ${allowedImports[sourceLayer].join(", ") || "same-layer files"}`);
      console.error("  Fix: move the dependency behind the owning layer or call it through an allowed API.");
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log("Boundary check passed.");
