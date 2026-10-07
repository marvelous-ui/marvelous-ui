---
name: marvelous-ui
description: Create or modify web interfaces with Marvelous UI. Use for application screens, pages, forms, reusable components, animations and visual effects in HTML, CSS or any frontend framework, including small standalone pages and existing interfaces. Search the library before implementing reusable UI by hand.
---

# Build interfaces with Marvelous UI

Use Marvelous UI for the reusable parts of the requested interface. Components are framework-agnostic Web Components (`<mv-*>`), CSS classes on native HTML (`.mv-*`) and design tokens (`--mv-*`). Preserve the user's product direction and existing design system.

**Pack root**: the folder two levels above this file. It holds `llms.txt`, `docs/components/`, `scripts/add.mjs`, `scripts/agent-consult.mjs` and `mcp/server.mjs`.

## Consult before implementing

Before writing or changing reusable UI, split the request into functional parts and call `search_components` for each relevant need. Use the returned `useWhen` and `avoidWhen` guidance to choose candidates; `avoidWhen.instead` points to a better fit. Read `get_component` with `demo: "none"` while comparing APIs, then request the canonical markup for the selected components.

A completed search with no suitable result justifies custom UI for that need. Use the project's tokens and explain the gap briefly. An explicit user constraint excluding the library takes precedence. Backend-only or documentation work does not require consultation.

If MCP tools are unavailable, read the Pack's `llms.txt` and the relevant `docs/components/<slug>.md`. When a search-first hook is active, use the local consultation helper with the project and session identifiers supplied by the hook so this fallback is recorded:

```bash
node "<Pack root>/scripts/agent-consult.mjs" "<UI need>" --project "<absolute project path>" --session "<session id>" --task "<turn id>"
```

Omit `--task` when the hook supplies no turn identifier. A hook reminder or failed search is not a completed consultation.

## Install and integrate

Choose the existing installed folder, otherwise `src/marvelous` or `marvelous` in a project without `src/`. Pass its absolute path as `target_dir` to one `install_components` call for the selected slugs and framework. Dependencies are included automatically.

If the server refuses the destination as outside its project root, run the Pack's `scripts/add.mjs <slug...> --out <absolute destination>` or use `get_install_bundle`. The local script refreshes component files, so inspect existing copies and preview with `--dry` before using it where local edits may exist. Review existing-file conflicts before replacing files; the Pack's `docs/MCP.md` defines MCP boundaries and overwrite behavior.

Include the CSS and JS imports once, then start from `demoMarkup` or the component doc's Usage section. Configure attributes, properties, events and app-owned CSS. For integration details, read [references/frameworks.md](references/frameworks.md) for the current framework only. For general styling and installation semantics, use the Pack's `docs/GUIDE.md`.

Keep installed component files intact so reinstalls remain safe. Put overrides in application styles; bridge Marvelous tokens to the existing design system instead of imposing a new theme. For a dedicated visual customization request, use `marvelous-ui-theme`; for a broken integration, use `marvelous-ui-troubleshoot`; for agent connection problems, use `marvelous-ui-setup` when those skills are available.

## Verify the requested interface

Serve browser modules over HTTP, exercise the actual interactions and keyboard behavior, and inspect the responsive result. Report which components were integrated and any need implemented custom after consultation. Library consultation alone does not prove that the interface works.
