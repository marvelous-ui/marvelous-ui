#!/usr/bin/env node
// Marvelous UI: MCP server (stdio).
// Lets any AI agent search the registry, read component docs/source and
// install components (with all their dependencies) into a project.
//
//   claude mcp add marvelous-ui -- node /path/to/marvelous-ui-library/mcp/server.mjs
import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";
import { ROOT, loadRegistry, resolveInstall, isInside, CATEGORIES, CATEGORY_LABELS, BASE_FILES } from "../scripts/lib/registry.mjs";
import { snippet, FRAMEWORKS, projectRoot, planInstall, applyInstall, defaultBase, TYPES_FILE, JSX_TYPES } from "../scripts/lib/integrate.mjs";

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
// Only files of the library itself are ever read (defense in depth: the registry already refuses paths out of a component).
const read = (f) => {
  const abs = resolve(ROOT, f);
  if (!isInside(ROOT, abs)) throw new Error(`Refused path outside the library: ${f}`);
  return readFileSync(abs, "utf8");
};
const text = (t) => ({ content: [{ type: "text", text: t }] });
const json = (o) => text(JSON.stringify(o, null, 2));
const fail = (t) => ({ content: [{ type: "text", text: t }], isError: true });

// Registry is read from disk, then reused for a few seconds: one tool call looks it up once per slug, and a full
// read of every component takes seconds on a slow disk (install_components on 7 slugs used to pass the client's
// 60 s timeout). A later call still reflects the working tree.
const REGISTRY_TTL_MS = 5000;
let registryCache = null;
const registry = () => {
  if (!registryCache || Date.now() - registryCache.at > REGISTRY_TTL_MS) registryCache = { at: Date.now(), items: loadRegistry({ strict: true }).items };
  return registryCache.items;
};
const norm = (s) => String(s ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

function findItem(slug) {
  const items = registry();
  const item = items.find((i) => i.slug === slug || i.tag === slug || i.usage?.class === slug);
  if (item) return { item, items };
  const close = items.filter((i) => i.slug.includes(norm(slug)) || norm(i.name).includes(norm(slug))).slice(0, 8).map((i) => i.slug);
  return { item: null, items, hint: close.length ? `Did you mean: ${close.join(", ")}?` : "Use search_components." };
}

// Natural-language queries ("a pricing section with a monthly/yearly toggle") are reduced to
// meaningful terms; common UI vocabulary is mapped onto the names the registry uses.
const STOPWORDS = new Set(`a an the and or with without for of to in on at by from into as is are be it its that this these
  my our your some any i we need want like make build create add use using page site website app ui component components element
  when after before then once where which show shows showing display most very simple
  un une le la les des de du d l et ou avec sans pour sur dans en au aux mon ma mes notre nos son sa ses qui que faire ajouter`.split(/\s+/));
const SYNONYMS = {
  modal: ["dialog"], modale: ["dialog"], popup: ["dialog", "popover", "toast"], lightbox: ["dialog", "gallery"], drawer: ["sheet"],
  dropdown: ["menu", "select"], picker: ["select", "combobox"], autocomplete: ["combobox"], typeahead: ["combobox"],
  notification: ["toast", "alert"], snackbar: ["toast"], banner: ["alert"], spinner: ["loader", "loading"],
  carousel: ["carousel", "slider"], slideshow: ["carousel"], ticker: ["marquee"], scroller: ["marquee"],
  toggle: ["switch", "toggle"], checkbox: ["checkbox"], datepicker: ["calendar", "date"], date: ["calendar"],
  table: ["table", "data-table"], grid: ["grid", "bento"], navbar: ["navbar", "header"], nav: ["navbar", "navigation"],
  menu: ["menu"], sidebar: ["sidebar"], footer: ["footer"], header: ["navbar", "hero"], landing: ["hero", "block"],
  pricing: ["pricing"], plans: ["pricing"], tier: ["pricing"], testimonial: ["testimonials"], reviews: ["testimonials"], faq: ["faq", "accordion"],
  logos: ["logo"], stats: ["stats", "number"], counter: ["number", "ticker"], progress: ["progress"],
  chat: ["chat"], ai: ["ai", "agent"], upload: ["file", "dropzone"], dropzone: ["dropzone", "file"],
  animated: ["animated", "motion"], animation: ["motion", "animated"], background: ["background"], bg: ["background"],
  gradient: ["gradient"], glow: ["glow", "spotlight"], shiny: ["shine", "shimmer"], typing: ["typewriter"],
  texte: ["text"], bouton: ["button"], formulaire: ["form"], fond: ["background"], onglets: ["tabs"], infobulle: ["tooltip"],
};
const stem = (t) => t.length > 4 && t.endsWith("ies") ? `${t.slice(0, -3)}y` : t.length > 3 && t.endsWith("s") && !t.endsWith("ss") ? t.slice(0, -1) : t;
const queryTerms = (q) => [...new Set(norm(q).split(/[^a-z0-9-]+/).filter((t) => t.length > 1 && !STOPWORDS.has(t)))];

function score(item, terms) {
  const fields = [
    [item.slug, 6], [item.name, 6], [item.tag, 5], [item.tags.join(" "), 4], [item.category, 3],
    [item.description, 2], [item.useWhen.join(" "), 2], [JSON.stringify(item.api ?? {}), 1],
  ].map(([v, w]) => [norm(v), w, new Set(norm(v).split(/[^a-z0-9]+/))]);
  // A whole word counts fully, a fragment half: "side" must not rank sidebar above the dialog sheet for "side panel drawer".
  const weigh = (t) => {
    let best = 0;
    for (const [v, w, words] of fields) {
      if (words.has(t)) best = Math.max(best, w + (v === t ? 3 : 0));
      else if (v.includes(t)) best = Math.max(best, w * 0.5);
    }
    return best;
  };
  let total = 0;
  let matched = 0;
  for (const t of terms) {
    const direct = Math.max(weigh(t), weigh(stem(t)));
    const viaSynonym = Math.max(0, ...(SYNONYMS[t] ?? SYNONYMS[stem(t)] ?? []).map(weigh)) * 0.8;
    const best = Math.max(direct, viaSynonym);
    if (best) { matched++; total += best; }
  }
  // Every term must match for short queries; longer, descriptive queries only need most of them. A query that names the
  // component ("simple static table for a weekly schedule", "pricing tiers most popular") keeps it whatever else it says.
  const named = terms.some((t) => t === item.slug || stem(t) === item.slug);
  const needed = named ? 1 : terms.length <= 2 ? terms.length : Math.ceil(terms.length * 0.5);
  return matched >= needed ? total * (matched / terms.length) * (named ? 2 : 1) : 0;
}

const summary = (i) => ({
  slug: i.slug, name: i.name, category: i.category, kind: i.kind,
  // A field test agent wrote <mv-faq> for the CSS-only faq and got an unstyled page: say there is no element.
  use: i.tag ? `<${i.tag}>` : i.usage?.class ? `class="${i.usage.class}" on native HTML (CSS only: there is no <${i.usage.class}> element)` : null,
  description: i.description, status: i.status,
  ...(i.kit ? { kit: i.kit } : {}), ...(i.quickstart ? { quickstart: i.quickstart } : {}),
});
// Search results carry the choice guidance so the agent can pick without opening every candidate.
const hit = (i) => ({ ...summary(i), useWhen: i.useWhen, avoidWhen: i.avoidWhen });
// Field-test agents ran ten searches of twelve rows at about 1 k characters each: the brief row keeps what decides the
// pick (first sentence, two useWhen, every avoidWhen with its better-suited component) and get_component has the rest.
const firstSentence = (s) => { const m = String(s).match(/^.{40,240}?[.!?](?=\s|$)/); return m ? m[0] : String(s).length > 240 ? `${String(s).slice(0, 237)}...` : String(s); };
const briefHit = (i) => ({ ...summary(i), description: firstSentence(i.description), useWhen: i.useWhen.slice(0, 2), avoidWhen: i.avoidWhen });

function installAssets(slugs, items) {
  const { components, files } = resolveInstall(slugs, items);
  const bySlug = new Map(items.map((i) => [i.slug, i]));
  const css = files.filter((f) => f.endsWith(".css"));
  const js = components.flatMap((s) => bySlug.get(s).files.filter((f) => f.endsWith(".js")));
  const tags = components.map((s) => bySlug.get(s).tag).filter(Boolean);
  return { components, files, css, js, tags };
}

// No serverInfo icon in the public repository (optional in MCP): the plugin's icon comes from its manifest.
const icons = undefined;

const server = new McpServer({ name: "marvelous-ui", version: pkg.version, icons }, {
  instructions: `Marvelous UI is a framework-agnostic component library installed in this project (native Web Components + layered CSS, zero runtime deps, prefix "mv-").
Before building any UI component, animation or effect by hand, even in a single standalone HTML page, search this registry (search_components). It probably already exists.
Workflow: split the requested UI into parts (e.g. navbar, hero, pricing, FAQ) and run one search_components per part → get_component on the best candidates (API, demo markup, a11y) → one install_components call with every chosen slug → apply the returned framework snippet.
Pick with each candidate's useWhen / avoidWhen guidance (avoidWhen.instead names a better-suited component), not the name alone; prefer status "stable" over "beta". If nothing fits, write custom code with the same design tokens.
Components work in plain HTML, React, Vue, Svelte, Angular, Astro. Theme with CSS variables (get_design_tokens). Respect the demo markup structure shown by get_component.`,
});

// ── Tools ────────────────────────────────────────────────────────────────

server.registerTool("search_components", {
  title: "Search components",
  description: "Search the Marvelous UI registry by need, in plain language or keywords (names, tags, descriptions, APIs, e.g. 'spotlight card', 'marquee', 'modal', 'animated gradient background for a hero'). Common synonyms are understood (modal→dialog, dropdown→menu/select…). Returns the best matches, best first; search once per part of the UI.",
  inputSchema: z.object({
    query: z.string().describe("What the component should be or do, in English (French also works)"),
    category: z.enum(CATEGORIES).optional().describe("Restrict to a category"),
    limit: z.number().int().min(1).max(50).default(8),
    detail: z.enum(["brief", "full"]).default("brief").describe("brief: the first sentence of each description and two useWhen; full: everything"),
  }),
  annotations: { readOnlyHint: true },
}, async ({ query, category, limit, detail }) => {
  const terms = queryTerms(query);
  if (!terms.length) return text(`"${query}" has no searchable keyword. Describe the component (e.g. "pricing table", "animated background").`);
  const hits = registry()
    .filter((i) => !category || i.category === category)
    .map((i) => ({ i, s: score(i, terms) }))
    .filter((h) => h.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((h) => (detail === "full" ? hit(h.i) : briefHit(h.i)));
  if (!hits.length) return text(`No component for "${query}". Try broader terms, list_components.`);
  return json(hits);
});

server.registerTool("list_components", {
  title: "List components",
  description: "List registry components, optionally filtered by category, wave, kind or status, with counts per category. Brief rows (slug, name, category, kind, status) by default, so the whole catalog fits in one reply; detail: \"full\" adds descriptions and is paged (offset, next_offset). To pick a component for a need, search_components is the better tool.",
  inputSchema: z.object({
    category: z.enum(CATEGORIES).optional(),
    wave: z.number().int().optional().describe("1 essentials · 2 motion · 3 creative/WebGL · 4 blocks · 5 signature polish · 6 exclusives"),
    kind: z.enum(["css", "element", "script", "shader", "block"]).optional(),
    status: z.enum(["stable", "beta"]).optional(),
    detail: z.enum(["brief", "full"]).default("brief").describe("brief: slug, name, category, kind, status. full: also tag or class, description, kit, quickstart"),
    offset: z.number().int().min(0).default(0),
    limit: z.number().int().min(1).max(500).optional().describe("Rows per page. Default: every row for brief, 40 for full (a full row is about 1 k characters)"),
  }),
  annotations: { readOnlyHint: true },
}, async ({ category, wave, kind, status, detail, offset, limit }) => {
  const items = registry().filter((i) => (!category || i.category === category) && (!wave || i.wave === wave) && (!kind || i.kind === kind) && (!status || i.status === status));
  const counts = Object.fromEntries(CATEGORIES.map((c) => [c, items.filter((i) => i.category === c).length]).filter(([, n]) => n));
  // The full catalog with descriptions is about 350 k characters, more than an agent accepts in one tool result.
  const page = items.slice(offset, offset + (limit ?? (detail === "full" ? 40 : 500)));
  const row = detail === "full" ? summary : (i) => ({ slug: i.slug, name: i.name, category: i.category, kind: i.kind, status: i.status });
  const next = offset + page.length < items.length ? offset + page.length : null;
  return json({ total: items.length, categories: counts, offset, ...(next !== null ? { next_offset: next } : {}), components: page.map(row) });
});

// A demo stages its component in a small app (grin's is 20 kB): its <style> blocks only lay out that page, and its
// placeholder images are inline data: URIs (most of blog's 71 kB), so the default leaves both out and says how much
// was removed. Scripts stay, since they show how to drive the API.
function demoFields(markup, demo) {
  if (demo === "none") return {};
  if (demo === "full") return { demoMarkup: markup };
  let omitted = 0;
  const stripped = markup
    .replace(/[ \t]*<style\b[\s\S]*?<\/style>\n?/gi, (m) => { omitted += m.length; return ""; })
    .replace(/data:[a-z]+\/[a-z0-9.+-]+[;,][^"')\s]{80,}/gi, (m) => { omitted += m.length; return "data:,placeholder"; });
  return { demoMarkup: stripped, ...(omitted ? { demoOmitted: `${omitted} characters of demo-only <style> and inline placeholder images (now data:,placeholder) left out; demo: "full" includes them` } : {}) };
}

server.registerTool("get_component", {
  title: "Component details",
  description: "Everything needed to use one component: description, full API (attributes, properties, methods, events, slots, classes, CSS variables), accessibility notes, demo markup (the canonical usage example), dependencies, and optionally its source code. Demos can weigh tens of kilobytes: to compare candidates, pass demo: \"none\" and read only the API.",
  inputSchema: z.object({
    slug: z.string().describe("Component slug, tag (mv-dialog) or class (mv-button)"),
    demo: z.enum(["markup", "full", "none"]).default("markup").describe("markup: the demo's HTML and scripts, without its <style> blocks (they only lay out the demo page). full: the demo as is. none: no demo"),
    include_source: z.boolean().default(false).describe("Also return the component's CSS/JS source"),
  }),
  annotations: { readOnlyHint: true },
}, async ({ slug, demo, include_source }) => {
  const { item, items, hint } = findItem(slug);
  if (!item) return fail(`Component "${slug}" not found. ${hint}`);
  const { components, files } = resolveInstall([item.slug], items);
  const out = {
    ...hit(item),
    tags: item.tags,
    api: item.api,
    a11y: item.a11y,
    ...demoFields(read(item.demo.file).trim(), demo),
    dependencies: item.dependencies,
    installs: { components, files },
    culture: item.culture,
  };
  if (include_source) out.source = Object.fromEntries(item.files.map((f) => [f, read(f)]));
  return json(out);
});

server.registerTool("install_components", {
  title: "Install components",
  description: "Copy components and ALL their dependencies (design tokens, core helpers, other components) into a folder of the current project, preserving the layout so relative imports work. Never writes outside the project root, and refuses to replace an existing file whose content differs unless overwrite is true. Returns the written, overwritten and unchanged files and the integration snippet for the chosen framework.",
  inputSchema: z.object({
    slugs: z.array(z.string()).min(1).describe("Component slugs to install"),
    target_dir: z.string().describe("Destination folder inside the project: absolute (e.g. /app/src/marvelous) or relative to the project root (e.g. src/marvelous). Must stay inside the project root."),
    framework: z.enum(FRAMEWORKS).default("html"),
    import_base: z.string().optional().describe("How the app imports the target dir (e.g. '@/marvelous', '/marvelous'). Defaults to the framework's alias when there is one (next '@/' from src/, nuxt '@/' from its srcDir), otherwise a path relative to the file the snippet names (index.html, src/main.*, src/layouts/Base.astro, src/routes/+layout.svelte)."),
    overwrite: z.boolean().default(false).describe("Replace existing files whose content differs (older Marvelous UI version or local edits). Without it the call is refused and nothing is written. The reply lists every overwritten file."),
    dry_run: z.boolean().default(false).describe("Report what would be written, overwritten or refused, without writing."),
  }),
  annotations: { destructiveHint: true, idempotentHint: true },
}, async ({ slugs, target_dir, framework, import_base, overwrite, dry_run }) => {
  const { root, reason } = projectRoot();
  if (!root) return fail(`No project root: ${reason} Start the MCP server from your project folder (or set MARVELOUS_PROJECT_ROOT in its config), or use get_install_bundle and write the files yourself.`);
  const items = registry();
  const unknown = slugs.filter((s) => !findItem(s).item);
  if (unknown.length) return fail(`Unknown: ${unknown.join(", ")}. Use search_components.`);
  const real = slugs.map((s) => findItem(s).item.slug);
  const assets = installAssets(real, items);
  let plan;
  try {
    plan = planInstall(assets.files, { from: ROOT, to: resolve(root, target_dir), root });
  } catch (e) {
    return fail(`${e.message} Nothing was written. target_dir must stay inside the project root (${root}).`);
  }
  const list = (files) => files.join(", ") || "none";
  if (plan.replace.length && !overwrite && !dry_run) {
    return fail([
      `Refused: ${plan.replace.length} file(s) already exist in ${plan.target} with a different content: ${list(plan.replace)}.`,
      "Nothing was written. Ask the user, then call again with overwrite: true to replace them (or dry_run: true to preview).",
    ].join("\n"));
  }
  const replaced = overwrite ? plan.replace : [];
  if (!dry_run) applyInstall(plan, [...plan.create, ...replaced]);
  // React and Next.js: JSX types for every mv-* tag, next to the components (kept if the project already has it).
  const typesFile = join(plan.target, TYPES_FILE);
  const writeTypes = ["react", "next"].includes(framework) && !existsSync(typesFile);
  if (writeTypes && !dry_run) writeFileSync(typesFile, JSX_TYPES);
  return text([
    `${dry_run ? "[dry run] " : ""}${assets.components.length} component(s): ${assets.components.join(", ")}`,
    `→ ${plan.target}`,
    `Written (${plan.create.length}): ${list(plan.create)}`,
    replaced.length ? `Overwritten (${replaced.length}): ${list(replaced)}` : "",
    writeTypes ? `TypeScript: ${dry_run ? "would write" : "wrote"} ${TYPES_FILE} (JSX types for every mv-* tag).` : "",
    plan.unchanged.length ? `Unchanged (${plan.unchanged.length}): ${list(plan.unchanged)}` : "",
    dry_run && plan.replace.length && !overwrite ? `Would be refused without overwrite: true (${plan.replace.length}): ${list(plan.replace)}` : "",
    "",
    cssOnly(assets.components, items),
    demoExtras(real, assets.components, items),
    `Integration (${framework}):`,
    "```",
    snippet(assets, framework, import_base ?? defaultBase(framework, plan.target, root)),
    "```",
    "",
    "Usage: see get_component(<slug>).demoMarkup for the expected HTML structure.",
  ].filter(Boolean).join("\n"));
});

// Components the demos of the chosen ones also use (inputs, buttons…): copying the demo markup without them leaves unstyled parts.
function demoExtras(chosen, installed, items) {
  const extra = [...new Set(chosen.flatMap((s) => items.find((i) => i.slug === s)?.demo?.requires ?? []))].filter((s) => !installed.includes(s));
  return extra.length ? `The demo markup also uses: ${extra.join(", ")}. Install them too if you copy those parts of the demo.
` : "";
}

// Components without a custom element: their tag does not exist, so the markup must use the class on native HTML.
function cssOnly(components, items) {
  const rows = components.map((s) => items.find((i) => i.slug === s)).filter((i) => !i.tag && i.usage?.class).map((i) => `${i.slug} → class="${i.usage.class}"`);
  return rows.length ? `CSS only, there is no <mv-…> element for these: write the class on native HTML (${rows.join(", ")}).\n` : "";
}

server.registerTool("get_install_bundle", {
  title: "Install bundle",
  description: "Return the content of every file needed by the given components (for agents that prefer to write files themselves, e.g. in a remote sandbox), plus the integration snippet.",
  inputSchema: z.object({
    slugs: z.array(z.string()).min(1),
    framework: z.enum(FRAMEWORKS).default("html"),
    import_base: z.string().optional(),
  }),
  annotations: { readOnlyHint: true },
}, async ({ slugs, framework, import_base }) => {
  const items = registry();
  const unknown = slugs.filter((s) => !findItem(s).item);
  if (unknown.length) return fail(`Unknown: ${unknown.join(", ")}.`);
  const assets = installAssets(slugs.map((s) => findItem(s).item.slug), items);
  return json({
    components: assets.components,
    files: Object.fromEntries(assets.files.map((f) => [f, read(f)])),
    snippet: snippet(assets, framework, import_base ?? defaultBase(framework)),
  });
});

server.registerTool("get_design_tokens", {
  title: "Design tokens",
  description: "The design tokens (CSS custom properties): colors (OKLCH, light/dark), typography, spacing, radius, shadows, z-index, motion durations & easings. Use them when theming or writing custom CSS next to the components.",
  inputSchema: z.object({ format: z.enum(["summary", "css"]).default("summary") }),
  annotations: { readOnlyHint: true },
}, async ({ format }) => {
  const css = read("tokens/tokens.css");
  if (format === "css") return text(css);
  const vars = [...css.matchAll(/(--mv-[a-z0-9-]+)\s*:\s*([^;]+);/g)].filter((m) => m[1] !== "--mv-mark").map((m) => `${m[1]}: ${m[2].trim().replace(/\s+/g, " ")}`);
  return text([
    "Re-theme by overriding on :root (or any element): --mv-accent-h (hue 0-360), --mv-accent-c (chroma), --mv-neutral-h/-c, --mv-radius-*, --mv-font-sans.",
    "Dark mode: automatic via prefers-color-scheme, or data-theme=\"dark|light\" on any element. Reduced motion: automatic, or <html data-motion=\"reduce\">.",
    "",
    ...[...new Set(vars)],
  ].join("\n"));
});

server.registerResource("registry", "marvelous://registry", {
  title: "Marvelous UI registry",
  description: "Index of all components (JSON)",
  mimeType: "application/json",
}, async (uri) => ({ contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify({ version: pkg.version, base: BASE_FILES, items: registry() }, null, 2) }] }));

server.registerResource("tokens", "marvelous://tokens", {
  title: "Design tokens", mimeType: "text/css",
}, async (uri) => ({ contents: [{ uri: uri.href, mimeType: "text/css", text: read("tokens/tokens.css") }] }));

server.registerResource("component", new ResourceTemplate("marvelous://component/{slug}", {
  list: async () => ({ resources: registry().map((i) => ({ uri: `marvelous://component/${i.slug}`, name: i.name, description: i.description, mimeType: "application/json" })) }),
}), { title: "Component", mimeType: "application/json" }, async (uri, { slug }) => {
  const { item } = findItem(String(slug));
  if (!item) throw new Error(`Unknown component: ${slug}`);
  return { contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify({ ...item, demoMarkup: read(item.demo.file), source: Object.fromEntries(item.files.map((f) => [f, read(f)])) }, null, 2) }] };
});

// ── Prompts ──────────────────────────────────────────────────────────────

server.registerPrompt("build-ui", {
  title: "Build a UI with Marvelous UI",
  description: "Guide the agent to assemble an interface from registry components before writing anything custom.",
  argsSchema: z.object({
    goal: z.string().describe("What to build, e.g. 'landing page hero with animated background'"),
    framework: z.string().optional().describe("Target framework"),
  }),
}, ({ goal, framework }) => ({
  messages: [{ role: "user", content: { type: "text", text: `Goal: ${goal}${framework ? ` (framework: ${framework})` : ""}.

1. Break the interface down into parts (sections, controls, effects).
2. Run one search_components per part, described by what it must do. Compare the candidates' descriptions, read get_component for the best ones (API, demo markup, a11y) and keep the one that fits the need and the page's tone.
3. Install them with install_components into the project (a single call with every slug), then apply the integration snippet.
4. Reproduce the demoMarkup HTML structure; customize through attributes, data-* and CSS variables (get_design_tokens) rather than rewriting the CSS.
5. Only write custom code for what doesn't exist.` } }],
}));

await server.connect(new StdioServerTransport());
