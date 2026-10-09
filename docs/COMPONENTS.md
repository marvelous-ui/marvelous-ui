# Component catalog

Marvelous UI v1.5.1: 21 framework-agnostic components (native Web Components + layered CSS, zero runtime dependencies).

**How to pick:** find the part of the interface you need below, open its page ("When to use" tells you if it fits or which component fits better, then the full API and the canonical markup), then install it with `node scripts/add.mjs <slug> --out <dir>` (dependencies are copied automatically). AI agents: see [MCP.md](MCP.md).

Legend: `<mv-…>` is a Web Component tag, `.mv-…` a CSS class to put on native HTML. *beta* = API may still change.

## Primitives (10)

| Component | Use | What it does |
|---|---|---|
| [Badge](components/badge.md) | `.mv-badge` | Pure-CSS badge: 7 variants (soft or solid tints), animatable status dot, icon, remove button, pill/square, 3 sizes, and a counter positioned on the corner of an avatar or icon. |
| [Button](components/button.md) | `.mv-button` | Pure-CSS button on `<button>` or `<a>`: 6 variants, 4 sizes, loading state, group. |
| [Checkbox](components/checkbox.md) | `.mv-checkbox` | Native pure-CSS checkbox: a self-drawing (reversible) check mark, indeterminate state, sizes, invalid; also provides the shared .mv-choice and .mv-choice-card layouts (option cards highlighted via :has(:checked)). |
| [Input](components/input.md) | `.mv-input` | Pure-CSS text field: 3 sizes, invalid (aria-invalid / :user-invalid), read-only and file states, plus a group with icons, prefixes/suffixes, inline buttons and a clear button. |
| [Kbd](components/kbd.md) | `.mv-kbd` | Subtly raised keyboard keys on `<kbd>`: nested combinations, 3 sizes, a flat variant, adapts inside buttons and tooltips. |
| [Radio](components/radio.md) | `.mv-radio` | Pure-CSS native radio button: an inner dot that springs in, sizes, an outline variant, inline or stacked groups, and option cards (plan lists, tiles with a badge). |
| [Select](components/select.md) | `.mv-select` | Styled native `<select>` (token-colored chevron), progressively enhanced into a customizable select (appearance: base-select): animated list, status dots, icons, descriptions and checkmark, optional “liquid” opening; clean fallback elsewhere. |
| [Separator](components/separator.md) | `.mv-separator` | Pure-CSS horizontal or vertical separator: solid, dashed, dotted or faded, with a centered (“or”) or aligned label, on `<hr>` or `<div>`. |
| [Switch](components/switch.md) | `.mv-switch` | Pure-CSS switch on `<input type="checkbox" role="switch">`: thumb that slides on a spring and stretches when pressed, icons in the thumb (customizable), sizes, label on the left or right, option card. |
| [Textarea](components/textarea.md) | `.mv-textarea` | Textarea that grows on its own (field-sizing: content) between a minimum and maximum number of rows, with an optional resize handle, a group with a toolbar and an `<mv-char-count>` character counter. |

## Forms (1)

| Component | Use | What it does |
|---|---|---|
| [Field](components/field.md) | `.mv-field` | Pure-CSS field layout: label (required / optional), help text, an error message that shows up on its own when the control is invalid, vertical, horizontal, responsive and inline orientations, choice cards and fieldset. |

## Overlays (5)

| Component | Use | What it does |
|---|---|---|
| [Dialog](components/dialog.md) | `<mv-dialog>` | Animated native `<dialog>` modal; also covers Alert Dialog (persistent), Sheet (4 sides) and a mobile Drawer with swipe to close. |
| [Menu](components/menu.md) | `<mv-menu>` | Full-featured dropdown menu: checkboxes, radio items, submenus with a safe-triangle, shortcuts, typeahead and APG keyboard navigation; opt-in data-motion="glide" (opens from the trigger’s corner, a single highlight that glides between items, submenus that slide in). |
| [Popover](components/popover.md) | `<mv-popover>` | Non-modal floating panel in the top layer (Popover API): auto placement with flip, optional arrow, closes on outside click/Escape with managed focus; data-open="liquid" option where the panel stretches out of the trigger through a liquid “neck”, then pinches back into it on close. |
| [Toast](components/toast.md) | `<mv-toaster>` | Sonner-style stacked notifications: a compact stack that expands on hover, paused timers, swipe to dismiss, promises and in-place updates by id, through an imperative toast() API. |
| [Tooltip](components/tooltip.md) | `<mv-tooltip>` | Tooltip in the top layer (Popover API), automatic placement with flip, arrow, grouped delay. For a toolbar, Tooltip Group shares a single surface that slides from one button to the next. |

## Navigation (1)

| Component | Use | What it does |
|---|---|---|
| [Tabs](components/tabs.md) | `<mv-tabs>` | Accessible tabs with a sliding indicator (underline, pill or segmented), horizontal or vertical, automatic or manual activation, and crossfading panels. |

## Data display (2)

| Component | Use | What it does |
|---|---|---|
| [Accordion](components/accordion.md) | `<mv-accordion>` | CSS accordion on native `<details>`: animated height (::details-content + interpolate-size), chevron or plus/minus, bordered, separated and card variants; optional `<mv-accordion type="single">`. Also covers Collapsible. A native disclosure group (WAI-ARIA Disclosure pattern), with optional headings in the triggers. |
| [Card](components/card.md) | `.mv-card` | Composable card (media, header, action, content, footer): outline, elevated, ghost and muted variants, plus a fully clickable card. |

## Feedback (1)

| Component | Use | What it does |
|---|---|---|
| [Skeleton](components/skeleton.md) | `.mv-skeleton` | Loading placeholders with a shimmer synced across the whole page (or a pulse), text, heading, avatar, media and button shapes, and a blurred cross-fade reveal into the loaded content driven by aria-busy. |

## Animated text (1)

| Component | Use | What it does |
|---|---|---|
| [Typography](components/typography.md) | `.mv-prose` | Long-form text styles on one class: headings, lists, quotes, inline and block code, keys, tables, figures, definition lists and disclosures get a steady vertical rhythm and a capped reading measure, in 3 sizes. Components placed inside keep their own look, and mv-not-prose opts any subtree out. |
