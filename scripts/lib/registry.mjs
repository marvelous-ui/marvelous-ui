// Load, validate and resolve the Marvelous UI registry from the file system.
import { readFileSync, readdirSync, existsSync, statSync, realpathSync } from "node:fs";
import { join, dirname, relative, resolve, isAbsolute, posix } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const COMPONENTS_DIR = join(ROOT, "components");

export const CATEGORIES = [
  "primitive", "form", "overlay", "navigation", "data-display", "feedback", "layout", "text",
  "background", "cursor", "scroll", "media", "3d", "transition", "micro-interaction", "effect",
  "block", "utility",
];
export const CATEGORY_LABELS = {
  primitive: "Primitives", form: "Forms", overlay: "Overlays", navigation: "Navigation",
  "data-display": "Data display", feedback: "Feedback", layout: "Layout", text: "Animated text",
  background: "Backgrounds", cursor: "Cursors", scroll: "Scroll", media: "Media", "3d": "3D",
  transition: "Transitions", "micro-interaction": "Micro-interactions", effect: "Effects",
  block: "Blocks", utility: "Utilities",
};
export const KINDS = ["css", "element", "script", "shader", "block"];
/** Exclusive kits (ADR 0008): groups of components that answer one need together. */
export const KITS = existsSync(join(ROOT, "kits.json")) ? JSON.parse(readFileSync(join(ROOT, "kits.json"), "utf8")) : [];
export const BASE_FILES = ["tokens/tokens.css", "core/base.css"];

const toPosix = (p) => p.split("\\").join("/");
const rel = (abs) => toPosix(relative(ROOT, abs));

/**
 * Steps of a video preview scenario (meta.json `preview`, played by landing/tools/previews.mjs, docs/PREVIEWS.md):
 * the name of each step, then the type of each of its arguments.
 */
export const PREVIEW_STEPS = {
  wait: ["ms"], hover: ["selector"], click: ["selector"], hold: ["selector", "ms"], move: ["number", "number"], leave: [],
  type: ["text"], press: ["text"], scroll: ["number"],
};
export const PREVIEW_VIEWPORT = { width: [320, 1920], height: [160, 1200] };

/** Problems of a meta.json `preview` field (empty array when valid). */
// Public API names that break the element for its users (#51): a method named like a DOM tree method replaces it
// (a framework or a client that calls el.remove() detaches nothing), and a prop named key or ref never reaches the
// element in React or Vue, while title, id, slot… are global attributes with their own meaning.
const DOM_METHODS = ["remove", "append", "prepend", "before", "after", "replaceWith", "replaceChildren"];
const RESERVED_PROPS = ["key", "ref", "children", "class", "className", "style", "slot", "is", "id", "title", "hidden"];
export function apiNameErrors(jsFiles) {
  const errors = [];
  for (const f of jsFiles) {
    const src = readFileSync(f, "utf8");
    for (const m of src.matchAll(new RegExp(`^ {2}(?:async\\s+)?(${DOM_METHODS.join("|")})\\s*\\(`, "gm"))) {
      errors.push(`${rel(f)}: method ${m[1]}() replaces Element.${m[1]}(): name it after what it handles (removeItem, appendItems…)`);
    }
    const props = src.match(/static props\s*=\s*\{([\s\S]*?)\n?\s*\};/)?.[1] ?? "";
    for (const m of props.matchAll(/(?:^|[,{\s])([a-zA-Z_]\w*)\s*:/g)) {
      if (RESERVED_PROPS.includes(m[1])) errors.push(`${rel(f)}: prop "${m[1]}" is reserved by frameworks or a global attribute`);
    }
  }
  return errors;
}

// Optional builder hints for the Playground site builder (landing/tools/runtime.mjs, ADR 0012): what the automatic
// reading of api.attributes and demo.html gets wrong. docs/CONVENTIONS.md §5.
const BUILDER_PROP_TYPES = ["text", "number", "boolean", "enum"];
// builder.summary: the note under the component's name in the panel, in the style of the blocks' hints (blocks.js),
// translated like the Playground's other texts (Customer text). A fragment, not a sentence: no final period.
export const SUMMARY_MAX = 60;
// builder.settings: per prop of the inspector, its words (Quentin's answer Q1 of the UX audit): a label, one line of
// help, and the words of an enum's values. Customer text, translated like the summary.
export const SETTING_LABEL_MAX = 28;
export const SETTING_HELP_MAX = 100;
const plainText = (s, min, max) => typeof s === "string" && s.trim() === s && s.length >= min && s.length <= max && !/[<>{}]/.test(s) && !/\.$/.test(s);
export function builderErrors(b) {
  if (!b || typeof b !== "object" || Array.isArray(b)) return ["builder must be an object"];
  const errors = [];
  for (const k of Object.keys(b)) if (!["summary", "settings", "insert", "props", "hidden", "container"].includes(k)) errors.push(`builder: unknown field ${k}`);
  if (b.insert !== undefined && (typeof b.insert !== "string" || !b.insert.trim() || /<script\b|\son[a-z]+\s*=/i.test(b.insert))) errors.push("builder.insert must be non-empty markup without <script> or on* handlers");
  for (const k of ["hidden", "container"]) if (b[k] !== undefined && typeof b[k] !== "boolean") errors.push(`builder.${k} must be a boolean`);
  if (b.summary !== undefined) {
    const s = b.summary;
    if (typeof s !== "string" || s.trim() !== s || s.length < 8 || s.length > SUMMARY_MAX) errors.push(`builder.summary must be a trimmed string of 8 to ${SUMMARY_MAX} characters`);
    else if (/[<>{}]/.test(s) || /\.$/.test(s)) errors.push("builder.summary: plain text, no final period");
  }
  if (b.settings !== undefined) {
    if (!b.settings || typeof b.settings !== "object" || Array.isArray(b.settings)) errors.push("builder.settings must be an object { prop: { label, help, options? } }");
    else for (const [name, s] of Object.entries(b.settings)) {
      const at = `builder.settings.${name}`;
      if (!/^[a-z][a-z0-9-]*$/.test(name)) errors.push(`${at}: not an attribute name`);
      if (!s || typeof s !== "object" || Array.isArray(s)) { errors.push(`${at} must be an object`); continue; }
      for (const k of Object.keys(s)) if (!["label", "help", "options", "hidden"].includes(k)) errors.push(`${at}: unknown field ${k}`);
      if (s.hidden !== undefined && typeof s.hidden !== "boolean") errors.push(`${at}.hidden must be a boolean`);
      if (!plainText(s.label, 2, SETTING_LABEL_MAX)) errors.push(`${at}.label: plain text of 2 to ${SETTING_LABEL_MAX} characters, no final period`);
      if (!plainText(s.help, 8, SETTING_HELP_MAX)) errors.push(`${at}.help: plain text of 8 to ${SETTING_HELP_MAX} characters, no final period`);
      if (s.options !== undefined) {
        if (!s.options || typeof s.options !== "object" || Array.isArray(s.options)) errors.push(`${at}.options must be an object { value: label }`);
        else for (const [v, l] of Object.entries(s.options)) if (!plainText(l, 1, SETTING_LABEL_MAX)) errors.push(`${at}.options.${v}: plain text of 1 to ${SETTING_LABEL_MAX} characters`);
      }
    }
  }
  if (b.props !== undefined) {
    if (!Array.isArray(b.props)) errors.push("builder.props must be an array");
    else b.props.forEach((p, i) => {
      if (!p || typeof p.name !== "string" || !/^[a-z][a-z0-9-]*$/.test(p.name)) errors.push(`builder.props[${i}]: name must be an attribute name`);
      if (!BUILDER_PROP_TYPES.includes(p?.type)) errors.push(`builder.props[${i}]: type must be one of ${BUILDER_PROP_TYPES.join(", ")}`);
      if (p?.type === "enum" && !(Array.isArray(p.options) && p.options.length > 1 && p.options.every((o) => typeof o === "string"))) errors.push(`builder.props[${i}]: an enum needs 2+ string options`);
    });
  }
  return errors;
}

export function previewErrors(preview) {
  if (!preview || typeof preview !== "object" || Array.isArray(preview)) return ["preview must be an object"];
  const errors = [];
  for (const k of Object.keys(preview)) if (!["viewport", "steps", "static"].includes(k)) errors.push(`preview: unknown field ${k}`);
  const v = preview.viewport;
  const inRange = (n, [min, max]) => Number.isInteger(n) && n >= min && n <= max;
  if (!v || typeof v !== "object" || Object.keys(v).some((k) => !(k in PREVIEW_VIEWPORT)) || !inRange(v.width, PREVIEW_VIEWPORT.width) || !inRange(v.height, PREVIEW_VIEWPORT.height)) {
    errors.push(`preview.viewport must be { width, height } in whole CSS px (width ${PREVIEW_VIEWPORT.width.join(" to ")}, height ${PREVIEW_VIEWPORT.height.join(" to ")})`);
  }
  if (preview.static !== undefined && preview.static !== true) errors.push("preview.static must be true or absent");
  const steps = preview.steps ?? [];
  if (!Array.isArray(steps)) return [...errors, "preview.steps must be an array of steps"];
  if (!preview.static && !steps.length) errors.push("preview.steps is empty (use \"static\": true for a poster without video)");
  const valid = { ms: (a) => Number.isInteger(a) && a >= 0 && a <= 10000, selector: (a) => typeof a === "string" && a.trim() !== "",
    text: (a) => typeof a === "string" && a !== "", number: (a) => typeof a === "number" && Number.isFinite(a) };
  steps.forEach((step, i) => {
    const [op, ...args] = Array.isArray(step) ? step : [];
    const types = PREVIEW_STEPS[op];
    if (!types) errors.push(`preview.steps[${i}]: unknown step ${JSON.stringify(op ?? step)} (known: ${Object.keys(PREVIEW_STEPS).join(", ")})`);
    else if (args.length !== types.length || args.some((a, j) => !valid[types[j]](a))) errors.push(`preview.steps[${i}]: expected ["${op}"${types.map((t) => `, ${t}`).join("")}], got ${JSON.stringify(step)}`);
  });
  return errors;
}

/** True when the absolute path `p` is `dir` itself or inside it (compares resolved paths, not string prefixes). */
export function isInside(dir, p) {
  const r = relative(resolve(dir), resolve(p));
  return r === "" || (r.split(/[\\/]/)[0] !== ".." && !isAbsolute(r));
}

/** Why a path listed in a component's `files` is refused, or null: it must be relative and stay in the component folder. */
export function unsafeFilePath(f) {
  if (typeof f !== "string" || !f.trim()) return "must be a non-empty string";
  if (isAbsolute(f) || /^[a-zA-Z]:/.test(f) || f.startsWith("/") || f.startsWith("\\")) return "must be relative";
  if (f.split(/[\\/]/).includes("..")) return 'must not contain ".."';
  return null;
}

/** Relative ES module imports of a JS file (static + dynamic string imports). */
export function jsImports(absFile) {
  const src = readFileSync(absFile, "utf8");
  const out = new Set();
  const re = /(?:import|export)\s[^'"`;]*?from\s*["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\)|import\s*["']([^"']+)["']/g;
  for (const m of src.matchAll(re)) {
    const spec = m[1] ?? m[2] ?? m[3];
    if (spec.startsWith(".")) out.add(resolve(dirname(absFile), spec));
  }
  return [...out];
}

/** Transitive relative imports starting at `absFiles`. */
export function importGraph(absFiles) {
  const seen = new Set();
  const stack = [...absFiles];
  while (stack.length) {
    const f = stack.pop();
    if (seen.has(f) || !existsSync(f)) continue;
    seen.add(f);
    if (f.endsWith(".js") || f.endsWith(".mjs")) stack.push(...jsImports(f));
  }
  return [...seen];
}

export function listSlugs() {
  if (!existsSync(COMPONENTS_DIR)) return [];
  return readdirSync(COMPONENTS_DIR)
    .filter((d) => statSync(join(COMPONENTS_DIR, d)).isDirectory() && existsSync(join(COMPONENTS_DIR, d, "meta.json")))
    .sort();
}

/** Load and validate one component. Returns { item, errors, warnings }. */
export function loadComponent(slug) {
  const dir = join(COMPONENTS_DIR, slug);
  const errors = [];
  const warnings = [];
  let meta;
  try {
    meta = JSON.parse(readFileSync(join(dir, "meta.json"), "utf8"));
  } catch (e) {
    return { item: null, errors: [`meta.json invalide: ${e.message}`], warnings };
  }

  const req = (k) => { if (meta[k] === undefined || meta[k] === "") errors.push(`missing required field: ${k}`); };
  ["name", "slug", "category", "kind", "wave", "description", "files"].forEach(req);
  if (meta.slug && meta.slug !== slug) errors.push(`slug "${meta.slug}" ≠ folder "${slug}"`);
  if (meta.category && !CATEGORIES.includes(meta.category)) errors.push(`unknown category: ${meta.category}`);
  if (meta.kind && !KINDS.includes(meta.kind)) errors.push(`unknown kind: ${meta.kind}`);
  if (meta.kind === "element" && !meta.tag) errors.push(`kind "element" requires "tag"`);
  if (meta.tag && !/^mv-[a-z0-9-]+$/.test(meta.tag)) errors.push(`tag must start with "mv-": ${meta.tag}`);
  if (!existsSync(join(dir, "demo.html"))) errors.push("missing demo.html");

  // Every entry of `files` must stay inside components/<slug>/ (no absolute path, no "..", no symlink out of it).
  if (meta.files !== undefined && !Array.isArray(meta.files)) errors.push("files must be an array of paths");
  const files = [];
  for (const f of Array.isArray(meta.files) ? meta.files : []) {
    const why = unsafeFilePath(f);
    const abs = why ? null : join(dir, f);
    if (why || !isInside(dir, abs)) { errors.push(`files: ${JSON.stringify(f)} ${why ?? "leaves the component folder"}`); continue; }
    if (existsSync(abs) && !isInside(realpathSync(dir), realpathSync(abs))) { errors.push(`files: ${JSON.stringify(f)} is a symbolic link out of the component folder`); continue; }
    files.push(abs);
  }
  for (const f of files) if (!existsSync(f)) errors.push(`missing file: ${rel(f)}`);

  // Resolve dependencies from the JS import graph.
  const jsEntry = files.filter((f) => f.endsWith(".js") && existsSync(f));
  const graph = importGraph(jsEntry).filter((f) => !files.includes(f));
  const core = graph.filter((f) => rel(f).startsWith("core/")).map(rel).sort();
  const shaders = graph.filter((f) => rel(f).startsWith("shaders/")).map(rel).sort();
  const deps = new Set(meta.dependencies ?? []);
  for (const f of graph) {
    const r = rel(f);
    if (r.startsWith("components/")) {
      const other = r.split("/")[1];
      if (other !== slug) deps.add(other);
    }
  }
  for (const f of graph) if (!existsSync(f)) errors.push(`import not found: ${rel(f)}`);
  errors.push(...apiNameErrors(jsEntry));

  // Exclusive components are original by definition (tag "exclusive", no Inspiration), and a "safe-rewrite" keeps its
  // provenance in its <slug>-classic: nothing to report.
  const exclusive = (meta.tags ?? []).some((t) => t === "exclusive" || t === "safe-rewrite");
  // Third-party assets bundled as is (icon paths) declare their provenance in thirdParty instead of inspiredBy.
  const thirdParty = meta.thirdParty;
  if (thirdParty !== undefined && (!Array.isArray(thirdParty) || thirdParty.some((t) => ["name", "license", "url", "notice"].some((k) => typeof t?.[k] !== "string" || !t[k]) || !(meta.files ?? []).includes(t.notice))))
    errors.push("thirdParty items must be { name, license, url, notice } with the notice listed in files");
  if (!meta.inspiredBy?.length && meta.category !== "utility" && !exclusive && !thirdParty?.length) void 0;
  const useWhen = meta.useWhen ?? [];
  const avoidWhen = (meta.avoidWhen ?? []).map((a) => (typeof a === "string" ? { when: a } : a));
  if (!Array.isArray(useWhen) || useWhen.some((s) => typeof s !== "string" || !s.trim())) errors.push("useWhen must be an array of strings");
  if (avoidWhen.some((a) => typeof a?.when !== "string" || (a.instead !== undefined && typeof a.instead !== "string"))) errors.push("avoidWhen items must be { when: string, instead?: slug }");
  if (avoidWhen.some((a) => a.instead === slug)) errors.push("avoidWhen.instead points at the component itself");
  if (!useWhen.length) warnings.push("no useWhen guidance");
  if (!meta.api) warnings.push("undocumented api");
  if (meta.kit !== undefined && !KITS.some((k) => k.id === meta.kit)) errors.push(`unknown kit: ${meta.kit} (see kits.json)`);
  if (meta.featured !== undefined && typeof meta.featured !== "boolean") errors.push("featured must be a boolean");
  if (meta.quickstart !== undefined && (typeof meta.quickstart !== "string" || !meta.quickstart.trim())) errors.push("quickstart must be a non-empty string");
  if (meta.wave === 9 && !meta.quickstart) warnings.push("Light component without quickstart");
  if (meta.preview !== undefined) errors.push(...previewErrors(meta.preview));
  if (meta.builder !== undefined) errors.push(...builderErrors(meta.builder));

  const item = {
    name: meta.name,
    slug,
    tag: meta.tag ?? null,
    kind: meta.kind,
    category: meta.category,
    wave: meta.wave,
    description: meta.description,
    useWhen,
    avoidWhen,
    tags: meta.tags ?? [],
    usage: meta.usage ?? null,
    api: meta.api ?? null,
    a11y: meta.a11y ?? null,
    inspiredBy: meta.inspiredBy ?? [],
    culture: meta.culture ?? null,
    kit: meta.kit ?? null,
    featured: meta.featured === true,
    labs: meta.wave === 8 && !meta.kit,
    quickstart: meta.quickstart ?? null,
    ...(meta.builder && { builder: meta.builder }),
    demo: { file: `components/${slug}/demo.html`, layout: meta.demo?.layout ?? "center", height: meta.demo?.height ?? null, theme: meta.demo?.theme ?? null, requires: meta.demo?.requires ?? [] },
    files: files.map(rel),
    core,
    shaders,
    dependencies: [...deps].sort(),
    npm: meta.npm ?? [],
    status: meta.status ?? "stable",
  };
  return { item, errors, warnings };
}

/**
 * When each component was added: the earliest of its first git commit and the
 * creation time of its meta.json (precise locally, commit date on fresh clones).
 * A renamed component keeps the date of its first slug.
 */
export function addedDates() {
  const byPath = new Map();
  try {
    const out = execFileSync("git", ["log", "--reverse", "--diff-filter=AR", "--format=%x00%aI", "--name-status", "--", "components"], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 64 * 1024 * 1024 });
    let date = null;
    for (const line of out.split(/\r?\n/)) {
      if (line.startsWith("\u0000")) { date = line.slice(1).trim(); continue; }
      const [status, from, to] = line.split("\t");
      if (!date || !from) continue;
      if (status === "A" && !byPath.has(from)) byPath.set(from, date); // oldest-first → first write wins
      if (status?.startsWith("R")) { byPath.set(to, byPath.get(from) ?? date); byPath.delete(from); }
    }
  } catch { /* not a git checkout */ }
  const fromGit = new Map();
  for (const [path, date] of byPath) {
    const m = path.match(/^components\/([^/]+)\/meta\.json$/);
    if (m) fromGit.set(m[1], date);
  }
  const dates = new Map();
  for (const slug of listSlugs()) {
    const st = statSync(join(COMPONENTS_DIR, slug, "meta.json"));
    const local = Math.min(st.birthtimeMs || st.mtimeMs, st.mtimeMs);
    const git = fromGit.has(slug) ? Date.parse(fromGit.get(slug)) : Infinity;
    dates.set(slug, new Date(Math.min(local, git)).toISOString());
  }
  return dates;
}

export function loadRegistry({ strict = false } = {}) {
  const added = addedDates();
  const items = [];
  const problems = [];
  for (const slug of listSlugs()) {
    const { item, errors, warnings } = loadComponent(slug);
    if (errors.length || warnings.length) problems.push({ slug, errors, warnings });
    if (item) item.added = added.get(slug) ?? null;
    if (item && (!strict || !errors.length)) items.push(item);
  }
  // Validate cross-deps
  const known = new Set(items.map((i) => i.slug));
  for (const i of items) {
    for (const a of i.avoidWhen) {
      if (a.instead && !known.has(a.instead)) problems.push({ slug: i.slug, errors: [], warnings: [`avoidWhen.instead: unknown component ${a.instead}`] });
    }
    for (const d of [...i.dependencies, ...i.demo.requires]) {
      if (!known.has(d)) problems.push({ slug: i.slug, errors: [`unknown dependency: ${d}`], warnings: [] });
    }
  }
  items.sort((a, b) => a.wave - b.wave || CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category) || a.name.localeCompare(b.name));
  return { items, problems };
}

/** All files needed to install `slugs` (base + core + components, transitive).
 * Dependencies come before the components that use them: every library rule sits in the same layer with zero
 * specificity, so the later file wins, and a component must be able to override its dependencies (navbar hides
 * some .mv-button at some widths). */
export function resolveInstall(slugs, items) {
  const bySlug = new Map(items.map((i) => [i.slug, i]));
  const wanted = new Set();
  const seen = new Set();
  const visit = (s) => {
    if (seen.has(s)) return;
    const item = bySlug.get(s);
    if (!item) throw new Error(`unknown component: ${s}`);
    seen.add(s);
    item.dependencies.forEach(visit);
    wanted.add(s);
  };
  slugs.forEach(visit);
  const files = new Set(BASE_FILES);
  for (const s of wanted) {
    const it = bySlug.get(s);
    it.core.forEach((f) => files.add(f));
    it.shaders.forEach((f) => files.add(f));
    it.files.forEach((f) => files.add(f));
  }
  return { components: [...wanted], files: [...files] };
}

export { toPosix, rel, posix };
