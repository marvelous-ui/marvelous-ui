# Marvelous UI (Free pack and agent plugin)

Marvelous UI is a framework-agnostic UI component library: native Web Components (`<mv-*>` tags), CSS classes on native HTML (`.mv-*`) and design tokens (`--mv-*` CSS variables), with zero runtime dependencies. It works in plain HTML, React 19+, Vue 3, Svelte, Angular and Astro.

This repository holds the **Free pack** (21 components, MIT License) and makes it a **Claude Code plugin**: a local MCP server to search and install the components, a skill with the usage rules, and a hook that reminds the agent to search the library before hand-writing UI. Everything here works on its own, with no account, no license key and no purchase.

## Install in Claude Code

```
/plugin marketplace add marvelous-ui/marvelous-ui
/plugin install marvelous-ui@marvelous-ui
```

From a terminal: `claude plugin marketplace add marvelous-ui/marvelous-ui`, then `claude plugin install marvelous-ui@marvelous-ui`.

Requirements: Node.js 20 or later and npm on the PATH. When Claude Code installs the plugin, it installs the MCP server's two dependencies (`@modelcontextprotocol/server` 2.0.0 and `zod` 4.6.5) from `package-lock.json`, with lifecycle scripts disabled. Restart Claude Code or run `/reload-plugins`, then ask for UI as usual, for example: *"Add a settings dialog with tabs and a toast on save."*

## What the plugin does

| Part | File | Behavior |
|---|---|---|
| MCP server `marvelous-ui` | `.mcp.json`, `mcp/server.mjs` | Runs locally over stdio (`node ${CLAUDE_PLUGIN_ROOT}/mcp/server.mjs`). Tools: `search_components`, `list_components`, `get_component`, `get_design_tokens` (read only), `get_install_bundle` (returns files, writes nothing) and `install_components` (copies the chosen components into a folder of your project). Makes no network request. Its only subprocess is a read-only `git log` on its own folder, to date the components when that folder is a git checkout. |
| Skill `marvelous-ui` | `skills/marvelous-ui/SKILL.md` | Tells the agent how to find, install and use the components. |
| Hook | `hooks/hooks.json`, `hooks/search-first.mjs` | Before the agent writes a new UI file (`.html`, `.css`, `.jsx`, `.tsx`, `.vue`, `.svelte`, `.astro`...) in a session that has not called the MCP server yet, it declines that write once with a reminder to search the library first; the retry goes through. It keeps one empty marker file per session in the system temp folder (`marvelous-ui-hooks/`). It reads nothing else and sends nothing. |

The plugin collects no data and contacts no server. Privacy policy: https://marvelous-ui.com/legal/privacy.html

## Components

| Component | Use | Description |
|---|---|---|
| Badge | `.mv-badge` | Pure-CSS badge: 7 variants (soft or solid tints), animatable status dot, icon, remove button, pill/square, 3 sizes, and a counter positioned on the corner of an avatar or icon. |
| Button | `.mv-button` | Pure-CSS button on &lt;button&gt; or &lt;a&gt;: 6 variants, 4 sizes, loading state, group. |
| Checkbox | `.mv-checkbox` | Native pure-CSS checkbox: a self-drawing (reversible) check mark, indeterminate state, sizes, invalid; also provides the shared .mv-choice and .mv-choice-card layouts (option cards highlighted via :has(:checked)). |
| Input | `.mv-input` | Pure-CSS text field: 3 sizes, invalid (aria-invalid / :user-invalid), read-only and file states, plus a group with icons, prefixes/suffixes, inline buttons and a clear button. |
| Kbd | `.mv-kbd` | Subtly raised keyboard keys on &lt;kbd&gt;: nested combinations, 3 sizes, a flat variant, adapts inside buttons and tooltips. |
| Radio | `.mv-radio` | Pure-CSS native radio button: an inner dot that springs in, sizes, an outline variant, inline or stacked groups, and option cards (plan lists, tiles with a badge). |
| Select | `.mv-select` | Styled native &lt;select&gt; (token-colored chevron), progressively enhanced into a customizable select (appearance: base-select): animated list, status dots, icons, descriptions and checkmark, optional “liquid” opening; clean fallback elsewhere. |
| Separator | `.mv-separator` | Pure-CSS horizontal or vertical separator: solid, dashed, dotted or faded, with a centered (“or”) or aligned label, on &lt;hr&gt; or &lt;div&gt;. |
| Switch | `.mv-switch` | Pure-CSS switch on &lt;input type="checkbox" role="switch"&gt;: thumb that slides on a spring and stretches when pressed, icons in the thumb (customizable), sizes, label on the left or right, option card. |
| Textarea | `.mv-textarea` | Textarea that grows on its own (field-sizing: content) between a minimum and maximum number of rows, with an optional resize handle, a group with a toolbar and an &lt;mv-char-count&gt; character counter. |
| Field | `.mv-field` | Pure-CSS field layout: label (required / optional), help text, an error message that shows up on its own when the control is invalid, vertical, horizontal, responsive and inline orientations, choice cards and fieldset. |
| Dialog | `<mv-dialog>` | Animated native &lt;dialog&gt; modal; also covers Alert Dialog (persistent), Sheet (4 sides) and a mobile Drawer with swipe to close. |
| Menu | `<mv-menu>` | Full-featured dropdown menu: checkboxes, radio items, submenus with a safe-triangle, shortcuts, typeahead and APG keyboard navigation; opt-in data-motion="glide" (opens from the trigger’s corner, a single highlight that glides between items, submenus that slide in). |
| Popover | `<mv-popover>` | Non-modal floating panel in the top layer (Popover API): auto placement with flip, optional arrow, closes on outside click/Escape with managed focus; data-open="liquid" option where the panel stretches out of the trigger through a liquid “neck”, then pinches back into it on close. |
| Toast | `<mv-toaster>` | Sonner-style stacked notifications: a compact stack that expands on hover, paused timers, swipe to dismiss, promises and in-place updates by id, through an imperative toast() API. |
| Tooltip | `<mv-tooltip>` | Tooltip in the top layer (Popover API), automatic placement with flip, arrow, grouped delay. |
| Tabs | `<mv-tabs>` | Accessible tabs with a sliding indicator (underline, pill or segmented), horizontal or vertical, automatic or manual activation, and crossfading panels. |
| Accordion | `<mv-accordion>` | CSS accordion on native &lt;details&gt;: animated height (::details-content + interpolate-size), chevron or plus/minus, bordered, separated and card variants; optional &lt;mv-accordion type="single"&gt;. |
| Card | `.mv-card` | Composable card (media, header, action, content, footer): outline, elevated, ghost and muted variants, plus a fully clickable card. |
| Skeleton | `.mv-skeleton` | Loading placeholders with a shimmer synced across the whole page (or a pulse), text, heading, avatar, media and button shapes, and a blurred cross-fade reveal into the loaded content driven by aria-busy. |
| Typography | `.mv-prose` | Long-form text styles on one class: headings, lists, quotes, inline and block code, keys, tables, figures, definition lists and disclosures get a steady vertical rhythm and a capped reading measure, in 3 sizes. |

Per-component docs: [docs/components/](docs/components/). Catalog: [docs/COMPONENTS.md](docs/COMPONENTS.md). Guides: [docs/GUIDE.md](docs/GUIDE.md), [docs/MCP.md](docs/MCP.md). Agents without MCP can read [llms.txt](llms.txt).

## Without the plugin

```bash
git clone https://github.com/marvelous-ui/marvelous-ui.git marvelous-ui
cd marvelous-ui
node scripts/add.mjs dialog tabs toast --out ../my-app/src/marvelous
```

`scripts/add.mjs` copies each component with everything it needs (tokens, core helpers, other components) and prints the imports. For Codex or another MCP client, run `npm ci` in the clone, then `node scripts/init-agent.mjs /path/to/your-app` or `node scripts/init-agent.mjs --plugin`: see [docs/MCP.md](docs/MCP.md).

The npm CLI `npx marvelous-ui-library@latest init` installs the same Free pack in a project and connects the detected agents.

## Editions

Marvelous UI also has a paid edition, the Pro pack, sold at https://marvelous-ui.com. It is not in this repository: this plugin neither contains nor downloads it, and works fully with the 21 free components.

## Versions

This repository is generated from the Marvelous UI release pipeline at each release; it is not edited by hand. Version 1.4.4, see [CHANGELOG.md](CHANGELOG.md). Pull requests cannot be merged as such: open an issue or write to hello@marvelous-ui.com.

## License

The Free pack is released under the MIT License, see [LICENSE](LICENSE). Copyright (c) 2026 Quentin Fankrache EI.
Only the Free pack is MIT: the Pro pack and the Exclusive components are sold under the Marvelous UI commercial license, not under MIT.

## Trademark

The MIT License covers the code, not the brand: it gives no right to the "Marvelous UI" name or logo.
A fork must use a different name and must not present itself as the official Marvelous UI product.

Support: hello@marvelous-ui.com
