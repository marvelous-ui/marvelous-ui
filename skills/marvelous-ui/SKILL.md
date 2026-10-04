---
name: marvelous-ui
description: Find, install and use Marvelous UI components (framework-agnostic Web Components `<mv-*>`, `.mv-*` classes on native HTML, `--mv-*` design tokens). Use before hand-writing any UI (component, page section, animation or visual effect) in any HTML, CSS, JSX, Vue, Svelte or Astro file, a single standalone page included, and whenever the code already uses mv-* tags or classes.
---

# Marvelous UI

Marvelous UI is a library of framework-agnostic UI components and animations: Web Components (`<mv-*>` tags), CSS classes on native HTML (`.mv-*`) and design tokens (`--mv-*` CSS variables). It works in plain HTML, React 19+, Vue 3, Svelte, Angular and Astro.

**Pack root**: the folder two levels above this file. It holds `llms.txt`, `docs/components/`, `scripts/add.mjs` and `mcp/server.mjs`.

**Search Marvelous UI before writing any UI component, animation or visual effect by hand.**

1. **Find.** With the `marvelous-ui` MCP tools: split the UI into parts (navbar, hero, pricing, form, toast…), call `search_components` once per part, pick with each result's `useWhen` / `avoidWhen` guidance (`avoidWhen.instead` names a better-suited component), then call `get_component` on the best candidates (`demo: "none"` while comparing them, the default once one is chosen). Without the tools: read `llms.txt` at the Pack root (the catalog), then `docs/components/<slug>.md` (its "When to use" section helps choose).
2. **Install.** Choose the destination folder in the user's project: `src/marvelous` by default, `marvelous` when there is no `src/`, or the folder the project already uses. Always pass it as an **absolute path**.
   - MCP: one `install_components` call with every chosen slug, `target_dir` set to that absolute path and the project's framework.
   - When the call answers that the folder is outside the project root, or that there is no project root, the server was started from the Pack folder: run `node <Pack root>/scripts/add.mjs <slug...> --out <absolute destination>` instead, or call `get_install_bundle` and write the returned files yourself.
   - Dependencies are copied automatically. Add the CSS and JS imports the install prints, once.
3. **Use.** Start from the component's canonical markup (`demoMarkup` from `get_component`, or the "Usage" section of its doc page) and customize with attributes, `data-*` and CSS variables.
4. **Leave the installed folder as installed.** Re-installing overwrites it. Override styles in the app's own CSS: library CSS lives in `@layer mv` with zero-specificity selectors, so app CSS always wins.
5. **Theme with tokens** on `:root`: `--mv-accent-h` (hue), `--mv-accent-c` (chroma), `--mv-radius-*`, `--mv-font-sans`. Dark mode: `data-theme="dark|light"` on any element. Every component handles reduced motion.
6. **Framework notes.** Plain HTML: the components load as ES modules, which browsers refuse from `file://`, so tell the user to serve the page over HTTP (`npx serve .` or their dev server); opened by double-click, it shows styled but inert components. React 19+: use the tags directly, with `onmv-*` props for events (`<mv-dialog open={open} onmv-close={(e) => e.target === e.currentTarget && setOpen(false)}>`: `mv-*` events bubble, and a combobox or date-picker inside the dialog sends its own `mv-close`, in every framework); with TypeScript, keep the `marvelous.d.ts` written by the install in the tsconfig. Vue: `compilerOptions.isCustomElement: (tag) => tag.startsWith("mv-")`. Angular: `CUSTOM_ELEMENTS_SCHEMA`. Tailwind v4: declare `@layer theme, base, mv, components, utilities;` before the imports.
7. **Custom UI last.** Write custom UI only when nothing fits, reusing the same tokens so it matches.

When the `marvelous-ui` tools fail to start with `Cannot find package '@modelcontextprotocol/server'`, ask the user to run `npm ci` in the Pack root, then to restart the agent.
