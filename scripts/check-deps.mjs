// Enforces the dependency rule from README.md / AGENTS.md:
//
//   ui-design ← ui-core ← ui-app ← feat-* → app-core → ux-core
//                          ↑ ux-core         ↑ backend
//   apps → feat-*, ui-app, app-core, backend, ux-core   (storybook → dashboard, to render it)
//
// Two checks per workspace package: every declared @humble/* dependency is an allowed edge, and
// every `@humble/*` import under src/ (and the app's config/story files) is a declared dependency.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = new URL("..", import.meta.url).pathname;

const packages = [
  "ux-core",
  "ui-design",
  "ui-core",
  "ui-app",
  "backend",
  "app-core",
  "feat-orders",
  "feat-shipments",
];
const featureDeps = ["ui-app", "ui-core", "app-core", "backend", "ux-core"];

/** name → what it may import. Apps may import every package; storybook may also render the dashboard. */
const allowed = {
  "ux-core": [],
  "ui-design": [],
  "ui-core": ["ui-design"],
  "ui-app": ["ui-core", "ux-core"],
  backend: ["ux-core"],
  "app-core": ["ux-core", "backend"],
  "feat-orders": featureDeps,
  "feat-shipments": featureDeps,
  api: packages,
  dashboard: packages,
  storybook: [...packages, "dashboard"],
};

const workspace = [
  ...packages.map((name) => ({ name, dir: join(root, "packages", name) })),
  ...["api", "dashboard", "storybook"].map((name) => ({ name, dir: join(root, "apps", name) })),
];

const failures = [];

for (const { name, dir } of workspace) {
  const manifest = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
  const declared = new Set(
    Object.keys({
      ...manifest.dependencies,
      ...manifest.devDependencies,
      ...manifest.peerDependencies,
    })
      .filter((dep) => dep.startsWith("@humble/"))
      .map((dep) => dep.slice("@humble/".length)),
  );

  for (const dep of declared) {
    if (!allowed[name].includes(dep)) {
      failures.push(
        `${name}: declares @humble/${dep}, but the rule allows only [${allowed[name].join(", ")}]`,
      );
    }
  }

  for (const file of sourceFiles(dir)) {
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(
      /from\s+"@humble\/([a-z-]+)(?:\/[^"]*)?"|import\(\s*"@humble\/([a-z-]+)/g,
    )) {
      const dep = match[1] ?? match[2];
      if (!declared.has(dep)) {
        failures.push(
          `${name}: ${relative(root, file)} imports @humble/${dep}, which is not in its package.json`,
        );
      }
    }
  }
}

if (failures.length > 0) {
  console.error("Dependency rule violations:\n");
  for (const failure of failures) console.error(`  - ${failure}`);
  console.error("\nSee AGENTS.md → The dependency rule.");
  process.exit(1);
}
console.log(`check-deps: ${workspace.length} packages, dependency rule holds`);

function sourceFiles(dir) {
  const out = [];
  const visit = (path) => {
    for (const entry of readdirSync(path)) {
      if (entry === "node_modules" || entry === "dist" || entry === "storybook-static") continue;
      const full = join(path, entry);
      if (statSync(full).isDirectory()) visit(full);
      else if (/\.(ts|tsx|mjs|js)$/.test(entry)) out.push(full);
    }
  };
  for (const sub of ["src", ".storybook"]) {
    try {
      visit(join(dir, sub));
    } catch {
      // no such directory
    }
  }
  for (const entry of readdirSync(dir)) if (/\.config\.ts$/.test(entry)) out.push(join(dir, entry));
  return out;
}
