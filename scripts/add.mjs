#!/usr/bin/env node
// Copy components (and everything they need) into a project.
//   node scripts/add.mjs <slug...> --out ./src/marvelous [--dry] [--force]
//   node scripts/add.mjs --list
// Keeps the repo layout (tokens/, core/, components/<slug>/) so relative imports keep working.
import { resolve, join } from "node:path";
import { existsSync, writeFileSync, mkdirSync } from "node:fs";
import { ROOT, loadRegistry, resolveInstall } from "./lib/registry.mjs";
import { planInstall, applyInstall, TYPES_FILE, JSX_TYPES } from "./lib/integrate.mjs";

const args = process.argv.slice(2);
const { items } = loadRegistry({ strict: true });

if (args.includes("--list")) {
  for (const i of items) console.log(`${i.slug.padEnd(28)} ${i.category.padEnd(18)} ${i.name}`);
  process.exit(0);
}

const outIdx = args.indexOf("--out");
const out = resolve(outIdx > -1 ? args[outIdx + 1] : "marvelous");
const dry = args.includes("--dry");
const force = args.includes("--force");
const slugs = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--out");
if (!slugs.length) {
  console.error("Usage: node scripts/add.mjs <slug...> --out <dir>");
  process.exit(1);
}

const unknown = slugs.filter((s) => !items.some((i) => i.slug === s));
if (unknown.length) {
  console.error(`✗ Not in this pack: ${unknown.join(", ")}. See the ${items.length} components it contains with: node scripts/add.mjs --list`);
  process.exit(1);
}
const { components, files } = resolveInstall(slugs, items);
// planInstall refuses any path that would land outside --out (symbolic links included).
let plan;
try {
  plan = planInstall(files, { from: ROOT, to: out });
} catch (e) {
  console.error(`✗ ${e.message}`);
  process.exit(1);
}
// Component files are refreshed; shared files (tokens, core) already present are kept unless --force.
const keep = plan.replace.filter((f) => !force && !f.startsWith("components/"));
for (const f of files) {
  if (plan.unchanged.includes(f)) console.log(`= ${f} (unchanged)`);
  else if (keep.includes(f)) console.log(`= ${f} (already present)`);
  else console.log(`${dry ? "~" : "+"} ${f}`);
}
if (!dry) applyInstall(plan, plan.ops.map((o) => o.file).filter((f) => !keep.includes(f)));
const cssOrder = files.filter((f) => f.endsWith(".css"));
const jsEntries = components.flatMap((s) => items.find((i) => i.slug === s).files.filter((f) => f.endsWith(".js")));
console.log(`\n${components.length} component(s) → ${out}\n\nCSS (in this order):\n${cssOrder.map((f) => `  ${f}`).join("\n")}\nJS:\n${jsEntries.map((f) => `  import "./${f}";`).join("\n") || "  (none)"}`);
// JSX types for every mv-* tag (React, Next.js + TypeScript): written once, never overwritten.
const typesFile = join(out, TYPES_FILE);
if (!existsSync(typesFile)) {
  if (!dry) { mkdirSync(out, { recursive: true }); writeFileSync(typesFile, JSX_TYPES); }
  console.log(`${dry ? "~" : "+"} ${TYPES_FILE} (TypeScript: JSX types for every mv-* tag)`);
}
console.log("\nPlain HTML: serve the page over HTTP (npx serve . or your dev server). Browsers refuse module scripts from file://, so a page opened by double-click shows styled but inert components.");
// The tag to write (it can differ from the slug: toast → <mv-toaster>), and what the usage markup of the docs also uses.
const asked = slugs.map((s) => items.find((i) => i.slug === s)).filter(Boolean);
const tags = asked.filter((i) => i.tag).map((i) => `  ${i.slug} → <${i.tag}>`);
if (tags.length) console.log(`\nTags:\n${tags.join("\n")}`);
const classes = asked.filter((i) => !i.tag && i.usage?.class).map((i) => `  ${i.slug} → class="${i.usage.class}"`);
if (classes.length) console.log(`\nCSS only, there is no <mv-…> element for these: write the class on native HTML.\n${classes.join("\n")}`);
// Only suggest what this pack contains: the Free pack holds a subset of the catalog.
const extra = [...new Set(asked.flatMap((i) => i.demo?.requires ?? []))].filter((s) => !components.includes(s));
const inPack = extra.filter((s) => items.some((i) => i.slug === s));
const missing = extra.filter((s) => !inPack.includes(s));
if (inPack.length) console.log(`\nThe usage markup in the docs also uses: ${inPack.join(", ")}. Add them with: node scripts/add.mjs ${inPack.join(" ")} --out "${out}"`);
if (missing.length) console.log(`\nThe usage markup in the docs also shows ${missing.join(", ")}, not in this pack: leave those parts out.`);
