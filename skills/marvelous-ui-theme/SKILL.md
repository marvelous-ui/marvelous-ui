---
name: marvelous-ui-theme
description: Theme Marvelous UI components to match a brand, an existing design system, dark mode or motion preferences. Use when adjusting Marvelous colors, typography, spacing, radii or CSS overrides in an existing interface.
---

# Theme Marvelous UI

**Pack root**: the folder two levels above this file. It holds `tokens/tokens.css`, `docs/GUIDE.md` and `docs/components/`.

## Adapt the current design

Inspect the app's token definitions, installed Marvelous imports and the requested visual change. Keep the existing product direction and the user's scope. Read `get_design_tokens` or the Pack's `tokens/tokens.css` for actual token names. Call `get_component` for the affected component's local CSS variables and variants, or read its Pack doc when MCP is unavailable. If an active hook requires recorded consultation, follow the local catalog command supplied by its reminder.

Use the Pack's `docs/GUIDE.md`, Customize section, as the shared styling contract. Define overrides in app-owned CSS, leaving the installed component files intact. Map `--mv-*` values to the project's own tokens when possible so both systems retain one source of truth.

Accent hue and chroma (`--mv-accent-h`, `--mv-accent-c`) derive colors on `:root`; changing them on a section does not recalculate the root colors. For scoped accent styling, inspect and override the actual derived color tokens needed by that section. Fonts, radii and component variables can be scoped to the relevant container.

Use `data-theme="dark"` or `data-theme="light"` to set theme scope, and respect the app's current theme state. Preserve reduced-motion support and check any added animation with the preference enabled.

For a request introducing new reusable UI, use `marvelous-ui` to consult and integrate the library before styling it. A styling-only change to known installed components needs their token and API documentation, not an unrelated catalog search.

## Verify visual behavior

Inspect the affected components in the requested themes and responsive layouts. Exercise focus, hover, disabled and open states where the change affects them. Check text legibility and keyboard focus after overrides. Report the visual changes and any state that could not be inspected.
