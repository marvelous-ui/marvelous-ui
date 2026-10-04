# Getting started with Marvelous UI

Marvelous UI is a library of UI components and animations that work in **any** web project: plain HTML, React 19+, Next.js, Vue 3, Nuxt, Svelte, Angular, Astro. Components are native Web Components (`<mv-dialog>`) or CSS classes on native HTML (`<button class="mv-button">`), themed with CSS variables, with no runtime dependency.

You own the code: components are **copied into your project**, so nothing breaks when the library updates, and you can read every line.

## Quick start

From your web project's folder, run:

```bash
npx marvelous-ui-library@latest init
```

Without a key, `init` installs the Free pack (no account or e-mail). Choose installation in this project or at the user level for multiple projects. Use `--scope project|user` to select explicitly; a noninteractive run defaults to `project`.

Project setup detects the project and configures supported coding agents where possible. User setup detects Codex, Claude Code, Cursor and OpenCode, then lets you select several agents by number or name. `all` selects the detected supported agents; `none` installs the shared Pack without connecting an agent. The prompt remembers your previous choice. For automation, use `--scope user --clients codex,cursor,opencode`, `--clients all`, or `--clients none`. The first noninteractive user setup connects no agent unless you provide `--clients`. Codex and Claude Code require their command-line tools for automatic registration; Cursor and OpenCode use local user files. Rerunning user setup disconnects agents you deselect, and a user-level update refreshes the connected agents. Other agents can use project setup or the manual guide in [MCP.md](MCP.md). Restart an open agent session to load the plugin, or reload Cursor.

Then add components or check for a newer pack version when you want:

```bash
npx marvelous-ui-library@latest add dialog tabs toast
npx marvelous-ui-library@latest update
```

An updated npm installer alone does not change the files copied into a project. `update` presents the changes before applying them, refreshes files that still match the installed version, and reports locally edited files as conflicts. A user-level pack update does not update components already copied into individual projects.

The [Free ZIP](https://marvelous-ui.com/downloads/marvelous-ui-free.zip) is also available for manual setup without the CLI.

### Uninstall for a clean setup

Use an explicit scope when removing an installation for testing:

```bash
npx marvelous-ui-library@latest uninstall --scope user
npx marvelous-ui-library@latest uninstall --scope project
```

User uninstall disconnects the agents selected through the CLI and removes the shared Pack. Project uninstall removes the Pack for the current project. The CLI keeps copied project components and project agent configuration files, including local edits, so inspect those separately if you want a completely fresh project. It also leaves agent configurations it does not manage alone.

## 1. Find a component

- Browse the [component catalog](COMPONENTS.md), grouped by category (forms, overlays, navigation, animated text, backgrounds, blocks…).
- Each component has its own page in [`docs/components/`](components/): what it does, **when to use it (and when another component fits better)**, how to install it, the canonical markup, the full API and accessibility notes.
- Or list everything from the terminal: `node scripts/add.mjs --list`.
- Working with an AI agent? Let it search for you: see [MCP.md](MCP.md).

## 2. Install it into your project

The public CLI above is the normal path. If you already downloaded a Pack or are working in this repository, you can also run its local script:

```bash
node scripts/add.mjs dialog tabs toast --out ../my-app/src/marvelous
```

The command copies each component **with everything it needs** (design tokens, shared helpers, other components) and keeps the folder layout so imports work. It then prints the files to include:

```text
CSS (in this order):
  tokens/tokens.css
  core/base.css
  components/dialog/dialog.css
  …
JS:
  import "./components/dialog/dialog.js";
```

- Shared files (`tokens/`, `core/`) are never overwritten once present, so your edits there survive. Add `--force` to refresh them.
- Component files are refreshed on every install: don't edit them, override their styles in your own CSS (see *Customize*).
- `--dry` shows what would be copied.

## 3. Include it

### Plain HTML, Astro, 11ty

The paths below assume the components were copied where your server publishes `/marvelous` (for example `--out ./public/marvelous`). Serve the page over HTTP (`npx serve .`, or your dev server): browsers refuse module scripts from `file://`, so a page opened by double-click shows styled but inert components.

```html
<link rel="stylesheet" href="/marvelous/tokens/tokens.css">
<link rel="stylesheet" href="/marvelous/core/base.css">   <!-- optional light reset -->
<link rel="stylesheet" href="/marvelous/components/dialog/dialog.css">
<script type="module" src="/marvelous/components/dialog/dialog.js"></script>
```

### React 19+ / Vite

```js
// main.tsx
import "./marvelous/tokens/tokens.css";
import "./marvelous/core/base.css";
import "./marvelous/components/dialog/dialog.css";
import "./marvelous/components/dialog/dialog.js";
```

Use the tags directly in JSX. React 19 passes `on` + the event name to the element, so `mv-*` events need no ref, and a component can be controlled by your state:

```jsx
const [open, setOpen] = useState(false);

<button onClick={() => setOpen(true)}>Edit profile</button>
<mv-dialog open={open} onmv-close={() => setOpen(false)}>
  <dialog>…</dialog>
</mv-dialog>
```

Keep `onmv-close` in the controlled pattern: Escape and the backdrop close the dialog themselves, and your state must follow. Arrays and objects go through properties as well (`<mv-combobox options={cities}>`).

#### TypeScript

`add.mjs` writes `marvelous.d.ts` next to the components: JSX types for every `mv-*` tag. Keep it inside the `include` of your `tsconfig.json` (it is, when the components live in `src/`). Without it, `tsc` reports `Property 'mv-dialog' does not exist on type 'JSX.IntrinsicElements'`.

The imperative API of `toast` ships with its types (`components/toast/toast.d.ts`), so `import { toast } from "./marvelous/components/toast/toast.js"` type-checks. Other component modules are plain JavaScript: if you import one of their exports in TypeScript and `tsc` reports `TS7016: Could not find a declaration file for module`, add `"allowJs": true` to the `compilerOptions` of your `tsconfig.json` (TypeScript then reads the types from the JavaScript). Registration imports (`import "./marvelous/components/dialog/dialog.js"`) never need it.

### Next.js

Copy the components into `src/marvelous` (`--out ../my-app/src/marvelous`), import the CSS in the root layout, and register the elements in a client component rendered once:

```tsx
// src/app/marvelous.tsx
"use client";
import { useEffect } from "react";

export function Marvelous() {
  useEffect(() => {
    import("@/marvelous/components/dialog/dialog.js");
  }, []);
  return null;
}
```

```tsx
// src/app/layout.tsx
import "@/marvelous/tokens/tokens.css";
import "@/marvelous/core/base.css";
import "@/marvelous/components/dialog/dialog.css";
import { Marvelous } from "./marvelous";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Marvelous />
      </body>
    </html>
  );
}
```

Custom elements upgrade in the browser, after hydration. Attributes (strings, numbers, booleans) are kept; an array or object prop (`options={[…]}`) is only read if the element is defined when React sets it, so set those from a ref once `customElements.whenDefined("mv-combobox")` resolves. The TypeScript note of the React section applies too.

### Vue 3 / Nuxt

Import the CSS and JS in `main.ts` (or `css: [...]` + a client plugin in Nuxt), and tell Vue that `mv-*` tags are custom elements:

```js
// vite.config.ts
vue({ template: { compilerOptions: { isCustomElement: (tag) => tag.startsWith("mv-") } } })
```

Events: `<mv-dialog @mv-close="onClose">`.

### Svelte, SvelteKit, Angular

Svelte works as is (`on:mv-close` / `onmv-close`). Angular: add `CUSTOM_ELEMENTS_SCHEMA` to the component or module using the tags.

### Tailwind CSS v4

Declare the layer order first in your global CSS so your utilities override the components:

```css
@layer theme, base, mv, components, utilities;
@import "tailwindcss";
```

## 4. Use it

Copy the **Usage** markup from the component's page and adapt the content. Components are configured through:

- **attributes** (`<mv-dialog persistent>`), and `data-*` attributes on CSS components (`<button class="mv-button" data-variant="outline" data-size="sm">`);
- **properties and methods** in JavaScript (`dialog.show()`, `accordion.value = ["faq-2"]`);
- **events** prefixed with `mv-` (`mv-change`, `mv-close`…), with details in `event.detail`;
- **CSS variables** for sizes, colors and timings (`--mv-dialog-width: 26rem`).

Everything is listed in the **API** section of each page.

## 5. Customize

### Theme

All colors, radii, fonts and motion come from design tokens (`tokens/tokens.css`). Override them on `:root`. The accent colors are derived from `--mv-accent-h` and `--mv-accent-c` on `:root`, so changing the hue on a section does not recolor it; radii, fonts and the other tokens can be overridden on any element.

```css
:root {
  --mv-accent-h: 160;          /* accent hue, 0-360 */
  --mv-accent-c: 0.15;         /* accent chroma (saturation) */
  --mv-radius-md: 0.75rem;
  --mv-font-sans: "Geist", system-ui, sans-serif;
}
```

### Dark mode

Automatic from the system setting (`prefers-color-scheme`). Force it with `data-theme="dark"` or `data-theme="light"` on `<html>` or any element.

### Styles

All library CSS sits in the `mv` cascade layer with zero-specificity selectors: **your own CSS always wins**, no `!important` needed.

```css
.pricing .mv-button { border-radius: 999px; }
```

## Accessibility and motion

- Components are built on native elements (`<dialog>`, `<details>`, `<button>`, `<input>`…) and follow the WAI-ARIA patterns: keyboard navigation, focus management and screen-reader announcements are included. Each page lists what is handled and what remains your job (for example, an `aria-label` on icon-only buttons).
- `prefers-reduced-motion` is respected everywhere: animations are shortened or removed. Force it with `<html data-motion="reduce">`.

## Updating

Run `npx marvelous-ui-library@latest update` in a project when you want to check for a newer pack. It reads the installed version and file fingerprints, previews the changes, and preserves local edits by reporting conflicts. Run it separately in each project you want to update. Updating a user-level installation does not rewrite project copies.

Marvelous UI also has a paid edition, the Pro pack, sold at https://marvelous-ui.com. It is not in this repository, and nothing here needs it.

## Using an AI coding agent

Run `npx marvelous-ui-library@latest init` from your app once: supported agents can then find, install and use components through the MCP server. If you already have the Pack locally, `node scripts/init-agent.mjs /path/to/your-app` still sets up a project, and `node scripts/init-agent.mjs --plugin` prints commands to register the Pack as a plugin. Agent support varies by client; see [MCP.md](MCP.md) for the tested integrations and manual setup.

## Troubleshooting

| Symptom | Fix |
|---|---|
| The component shows as plain HTML | Its JS module isn't imported (or, in Next.js, not imported on the client). |
| Styled, but nothing opens or reacts | The page is opened from `file://`: serve it over HTTP (`npx serve .`). |
| `Property 'mv-…' does not exist on type 'JSX.IntrinsicElements'` | Include `marvelous.d.ts` (written by `add.mjs`) in your `tsconfig.json`. |
| `TS7016: Could not find a declaration file for module './marvelous/components/…js'` | Add `"allowJs": true` to `compilerOptions` (see TypeScript above). `toast.js` ships its own types. |
| No styles | `tokens/tokens.css` must be included before the component CSS. |
| Vue warns "Failed to resolve component: mv-…" | Add the `isCustomElement` option above. |
| Tailwind utilities don't override a component | Declare `@layer theme, base, mv, components, utilities;` before the imports. |
