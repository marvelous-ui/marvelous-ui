// Framework integration snippets for installed components, and the safe copy of their files.
import { existsSync, lstatSync, mkdirSync, copyFileSync, readFileSync, realpathSync } from "node:fs";
import { basename, dirname, isAbsolute, join, parse, relative, resolve, posix as pathPosix } from "node:path";
import { homedir } from "node:os";
import { isInside, unsafeFilePath } from "./registry.mjs";

export const FRAMEWORKS = ["html", "react", "next", "vue", "nuxt", "svelte", "sveltekit", "angular", "astro"];

// JSX types for every mv-* tag, written by add.mjs as <out>/marvelous.d.ts. The top-level `import type` makes the file
// a module, so `declare module "react"` extends React's types instead of replacing them (no more "no exported member
// 'useEffect'").
export const TYPES_FILE = "marvelous.d.ts";
// How the app imports the install folder when the caller does not say. Aliases where the framework has one: Next.js
// "@/" (src/ when it exists), Nuxt "@/" (its srcDir: app/ in Nuxt 4, the root in Nuxt 3, "~~/" for the root).
// SvelteKit gets a relative path: SvelteKit 3 removed "$lib" (now "#lib"), SvelteKit 2 has no "#lib", and
// "../lib/marvelous" from src/routes/ works in both. Otherwise a path relative to the file the snippet names (index.html at the root, src/main.ts,
// src/layouts/Base.astro, src/routes/+layout.svelte). Without the install folder (get_install_bundle), the folder is
// assumed to be the usual one.
const ENTRY_DIR = { html: "", react: "src", vue: "src", svelte: "src", angular: "src", astro: "src/layouts", sveltekit: "src/routes" };
const posix = (p) => p.split(/[\\/]/).filter(Boolean).join("/");
const relativeImport = (from, to) => { const r = posix(relative(from, to)); return !r ? "." : r.startsWith("..") ? r : `./${r}`; };
export const defaultBase = (framework, target, root) => {
  if (!target || !root) return { next: "@/marvelous", nuxt: "@/marvelous", sveltekit: "../lib/marvelous" }[framework] ?? "./marvelous";
  if (framework === "next") {
    const from = isInside(join(root, "src"), target) ? join(root, "src") : root;
    return `@/${posix(relative(from, target))}`.replace(/\/$/, "");
  }
  if (framework === "nuxt") {
    const srcDir = existsSync(join(root, "app")) ? join(root, "app") : root;
    if (isInside(srcDir, target)) return `@/${posix(relative(srcDir, target))}`.replace(/\/$/, "");
    return `~~/${posix(relative(root, target))}`.replace(/\/$/, "");
  }
  return relativeImport(join(root, ENTRY_DIR[framework] ?? ""), target);
};
export const JSX_TYPES = `// Marvelous UI: JSX types for the mv-* custom elements (React 19+, Next.js). Written by scripts/add.mjs.
import type React from "react";

type MvElementProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { [attribute: string]: unknown };

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      [tag: \`mv-\${string}\`]: MvElementProps;
    }
  }
}
`;

/**
 * @param {{ css: string[], js: string[], tags: string[] }} assets  paths relative to `base`
 * @param {string} framework
 * @param {string} base  where the files were copied, as imported from the app (e.g. "./marvelous", "@/marvelous")
 */
export function snippet({ css, js, tags }, framework = "html", base = "./marvelous") {
  const p = (f) => `${base.replace(/\/$/, "")}/${f}`;
  const cssImports = css.map((f) => `import "${p(f)}";`).join("\n");
  const jsImports = js.map((f) => `import "${p(f)}";`).join("\n");
  const dynImports = js.map((f) => `    import("${p(f)}");`).join("\n");
  const layerNote = "/* Tailwind v4: declare `@layer theme, base, mv, components, utilities;` first thing in your global CSS. */";

  switch (framework) {
    case "react":
      return `// main.tsx (Vite): CSS + registration of the custom elements
${cssImports}
${jsImports}

// Custom elements work in React 19+ as-is: <mv-dialog open>…</mv-dialog>
// Events: <mv-dialog onmv-close={(e) => e.target === e.currentTarget && setOpen(false)}>. mv-* events bubble, so the
// target check keeps the mv-close of a combobox or date-picker inside the dialog from closing it.

// TypeScript: add.mjs wrote ${p(TYPES_FILE)} (JSX types for every mv-* tag). Keep it inside your tsconfig "include",
// or paste this into any .d.ts file:
${JSX_TYPES}`;
    case "next":
      return `// app/layout.tsx: global CSS
${cssImports}

// app/marvelous-client.tsx: register custom elements on the client only
"use client";
import { useEffect } from "react";
export function Marvelous() {
  useEffect(() => {
${dynImports}
  }, []);
  return null;
}
// then render <Marvelous /> once in the root layout. (Modules are SSR-safe, but custom elements only upgrade in the browser.)

// TypeScript: add.mjs wrote ${p(TYPES_FILE)} (JSX types for every mv-* tag). Keep it inside your tsconfig "include",
// or paste this into any .d.ts file:
${JSX_TYPES}`;
    case "vue":
      return `// main.ts
${cssImports}
${jsImports}

// vite.config.ts
vue({ template: { compilerOptions: { isCustomElement: (tag) => tag.startsWith("mv-") } } })
// Events: <mv-dialog @mv-close="onClose">`;
    case "nuxt":
      return `// nuxt.config.ts
export default defineNuxtConfig({
  css: [${css.map((f) => `"${p(f)}"`).join(", ")}],
  vue: { compilerOptions: { isCustomElement: (tag) => tag.startsWith("mv-") } },
});

// plugins/marvelous.client.ts: define the elements once Vue has hydrated the page. Elements that build their own
// DOM (gallery, buy-box, carousel…) would otherwise change the server HTML first: "Hydration completed but contains
// mismatches" in nuxi generate builds.
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("app:mounted", () => {
${dynImports.replace(/^/gm, "  ")}
  });
});`;
    case "svelte":
      return `<!-- App.svelte / main.ts -->
<script>
${css.map((f) => `  import "${p(f)}";`).join("\n")}
${js.map((f) => `  import "${p(f)}";`).join("\n")}
</script>
<!-- Events: <mv-dialog on:mv-close={handler}> (Svelte 5: onmv-close={handler}) -->`;
    case "sveltekit":
      return `<!-- src/routes/+layout.svelte (Svelte 5; with Svelte 4, drop $props() and write <slot /> instead of the render tag) -->
<script>
  import { onMount } from "svelte";
${css.map((f) => `  import "${p(f)}";`).join("\n")}
  let { children } = $props();
  // Custom elements only upgrade in the browser: prerendered HTML shows them as plain markup until this runs.
  onMount(() => {
${js.map((f) => `    import("${p(f)}");`).join("\n")}
  });
</script>
{@render children()}`;
    case "angular":
      // angular.json paths start at the workspace root, the main.ts imports at src/ (where the base is computed from).
      return `// angular.json → "styles": [${css.map((f) => `"${pathPosix.join("src", base, f)}"`).join(", ")}]
// main.ts
${js.map((f) => `import "${p(f)}";`).join("\n")}

// component: add the schema so Angular accepts mv-* tags
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
@Component({ /* … */ schemas: [CUSTOM_ELEMENTS_SCHEMA] })
// Events: <mv-dialog (mv-close)="onClose($event)">; with strict templates, read the detail as $any($event).detail.
// Events bubble: a combobox or date-picker inside the dialog also sends mv-close, so check $event.target === $event.currentTarget.`;
    case "astro":
      return `---
// src/layouts/Base.astro
${cssImports}
---
<slot />
<script>
${js.map((f) => `  import "${p(f)}";`).join("\n")}
</script>`;
    default:
      return `<!-- Serve the page over HTTP (npx serve . or your dev server): browsers refuse module scripts from file://, so a page opened by double-click shows styled but inert components. -->
<!-- ${layerNote} -->
${css.map((f) => `<link rel="stylesheet" href="${p(f)}">`).join("\n")}
${js.map((f) => `<script type="module" src="${p(f)}"></script>`).join("\n")}`;
  }
}

// ── Safe installation (shared by scripts/add.mjs and the MCP server) ──────────────────────────
// Every destination is checked after resolving symbolic links: nothing may be written outside the
// install folder, and the MCP server also keeps that folder inside the project root.

/** Real path of `p`, even when its end does not exist yet: the deepest existing ancestor goes through realpath. */
export function realpathDeep(p) {
  const rest = [];
  let cur = resolve(p);
  while (!lstatSync(cur, { throwIfNoEntry: false })) {
    const parent = dirname(cur);
    if (parent === cur) break;
    rest.unshift(basename(cur));
    cur = parent;
  }
  let real;
  try { real = realpathSync.native(cur); } catch { throw new Error(`${cur} is a broken symbolic link.`); }
  return rest.length ? join(real, ...rest) : real;
}

const samePath = (a, b) => relative(a, b) === "";

/**
 * The project the MCP server may install into.
 * `MARVELOUS_PROJECT_ROOT` (absolute) wins; otherwise the nearest ancestor of `cwd` holding `.git`,
 * then `package.json`, else `cwd` itself. Never the filesystem root nor the home folder.
 * → { root } or { root: null, reason }
 */
export function projectRoot({ cwd = process.cwd(), env = process.env } = {}) {
  const home = realpathDeep(homedir());
  const tooWide = (d) => samePath(d, parse(d).root) || samePath(d, home);
  if (env.MARVELOUS_PROJECT_ROOT) {
    if (!isAbsolute(env.MARVELOUS_PROJECT_ROOT)) return { root: null, reason: "MARVELOUS_PROJECT_ROOT must be an absolute path." };
    const root = realpathDeep(env.MARVELOUS_PROJECT_ROOT);
    return tooWide(root) ? { root: null, reason: `MARVELOUS_PROJECT_ROOT (${root}) is the home folder or a filesystem root, not a project.` } : { root };
  }
  const start = realpathDeep(cwd);
  const ancestors = [];
  for (let d = start; !tooWide(d); d = dirname(d)) ancestors.push(d);
  for (const marker of [".git", "package.json"]) {
    const hit = ancestors.find((d) => existsSync(join(d, marker)));
    if (hit) return { root: hit };
  }
  if (ancestors.length) return { root: start };
  return { root: null, reason: `the server's working directory (${start}) is the home folder or a filesystem root, not a project.` };
}

/**
 * Plan the copy of `files` (paths relative to `from`) into `to`, without writing anything.
 * Throws when a path would leave `to` (or `to` would leave `root`), symbolic links included.
 * → { target, create: [], replace: [], unchanged: [], ops: [{ file, src, dest }] }
 *   `replace`: files that already exist with a different content.
 */
export function planInstall(files, { from, to, root = null }) {
  const target = realpathDeep(to);
  if (root && !isInside(root, target)) throw new Error(`${to} is outside the project root ${root}.`);
  const plan = { target, create: [], replace: [], unchanged: [], ops: [] };
  for (const file of files) {
    const why = unsafeFilePath(file);
    if (why) throw new Error(`Refused path ${JSON.stringify(file)}: ${why}.`);
    const src = resolve(from, file);
    if (!isInside(from, src)) throw new Error(`Refused path ${JSON.stringify(file)}: it leaves ${from}.`);
    const dest = realpathDeep(resolve(target, file));
    if (!isInside(target, dest)) throw new Error(`Refused path ${JSON.stringify(file)}: it resolves outside ${to} (symbolic link).`);
    const st = lstatSync(dest, { throwIfNoEntry: false });
    if (!st) plan.create.push(file);
    else if (!st.isFile()) throw new Error(`Refused path ${JSON.stringify(file)}: ${dest} exists and is not a file.`);
    else if (readFileSync(dest).equals(readFileSync(src))) { plan.unchanged.push(file); continue; }
    else plan.replace.push(file);
    plan.ops.push({ file, src, dest });
  }
  return plan;
}

/** Copy the planned files (`only`: a subset of them). Returns the copied paths. */
export function applyInstall(plan, only = null) {
  const done = [];
  for (const { file, src, dest } of plan.ops) {
    if (only && !only.includes(file)) continue;
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(src, dest);
    done.push(file);
  }
  return done;
}
