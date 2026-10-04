<!-- marvelous-ui:start -->
## UI components: Marvelous UI

This project uses **Marvelous UI**, a library of framework-agnostic UI components and animations: Web Components (`<mv-*>` tags), CSS classes on native HTML (`.mv-*`) and design tokens (`--mv-*` CSS variables). Installed components live in `{{OUT}}/`.

**Before writing any UI component, animation or visual effect by hand, look for it in Marvelous UI.**

1. **Find.** With the `marvelous-ui` MCP server: split the UI into parts (navbar, hero, pricing, form, toast…) and call `search_components` once per part, pick with each result's `useWhen` / `avoidWhen` guidance, then `get_component` on the best candidates (`demo: "none"` while comparing them, the default once one is chosen). Without MCP: read `{{LIB}}/llms.txt` (catalog), then `{{LIB}}/docs/components/<slug>.md` (its "When to use" section helps choose).
2. **Install.** MCP `install_components` with `target_dir: "{{OUT_ABS}}"` and the project's framework, or `node {{LIB}}/scripts/add.mjs <slug...> --out {{OUT}}`. Dependencies are copied automatically; add the CSS/JS imports it prints once.
3. **Use.** Start from the component's canonical markup (`demoMarkup` / "Usage" section) and customize with attributes, `data-*` and CSS variables.
4. **Don't edit `{{OUT}}/`.** Re-installing overwrites it. Override styles in the app's own CSS instead: library CSS lives in `@layer mv` with zero-specificity selectors, so app CSS always wins.
5. **Theme with tokens** on `:root`: `--mv-accent-h` (hue), `--mv-accent-c` (chroma), `--mv-radius-*`, `--mv-font-sans`. Dark mode: `data-theme="dark|light"` on any element. Reduced motion is handled by every component.
6. **Framework notes.** Plain HTML: the components load as ES modules, which browsers refuse from `file://`, so tell the user to serve the page over HTTP (`npx serve .` or their dev server); opened by double-click, it shows styled but inert components. React 19+: use the tags directly, with `onmv-*` props for events (`<mv-dialog open={open} onmv-close={(e) => e.target === e.currentTarget && setOpen(false)}>`: `mv-*` events bubble, and a combobox or date-picker inside the dialog sends its own `mv-close`, in every framework); with TypeScript, keep the `marvelous.d.ts` written by the install in the tsconfig. Vue: `compilerOptions.isCustomElement: (tag) => tag.startsWith("mv-")`. Angular: `CUSTOM_ELEMENTS_SCHEMA`. Tailwind v4: declare `@layer theme, base, mv, components, utilities;` before the imports.
7. Write custom UI only when nothing fits, reusing the same tokens so it matches.
<!-- marvelous-ui:end -->
