# Popover `<mv-popover>`

> Non-modal floating panel in the top layer (Popover API): auto placement with flip, optional arrow, closes on outside click/Escape with managed focus; data-open="liquid" option where the panel stretches out of the trigger through a liquid “neck”, then pinches back into it on close.

| | |
|---|---|
| Category | Overlays |
| Type | Web Component (`<mv-popover>`) |
| Status | stable |
| Keywords | popover, floating, dropdown, panel, top-layer, gooey, liquid, morph |

## When to use

- A small form, filter or settings panel must open next to its trigger without blocking the page
- Interactive content like links or buttons must be reachable on touch and keyboard, unlike a tooltip
- A liquid opening that stretches the panel out of its trigger fits the product's tone

**Avoid when**

- The content is a list of actions that needs menu keyboard navigation → use [Menu](menu.md) instead
- The user must confirm or complete a task before continuing → use [Dialog](dialog.md) instead
- The content is only a short label shown on hover or focus → use [Tooltip](tooltip.md) instead

## Install

```bash
node scripts/add.mjs popover --out ./src/marvelous
```

AI agent with the Marvelous UI MCP server: `install_components({ slugs: ["popover"], target_dir: "<absolute path>/src/marvelous", framework: "react" })`.

Files copied (dependencies included): `tokens/tokens.css`, `core/base.css`, `core/dom.js`, `core/element.js`, `core/focus.js`, `core/i18n.js`, `core/motion.js`, `core/position.js`, `core/svg.js`, `components/popover/popover.js`, `components/popover/popover.css`.

## Usage

Canonical markup, to start from and customize with attributes, `data-*` and CSS variables:

```html
<div style="display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center;align-items:center">
  <mv-popover placement="bottom-start">
    <button class="mv-button" data-variant="outline">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 3H3v18h18z" opacity=".35"/><path d="M8 3v18M3 8h18"/></svg>
      Dimensions
    </button>
    <div data-content style="--mv-popover-width:19rem">
      <div class="mv-popover-header">
        <h3 class="mv-popover-title">Dimensions</h3>
        <p class="mv-popover-description">Set the size of the selected layer.</p>
      </div>
      <form style="display:grid;gap:.5rem" onsubmit="event.preventDefault()">
        <label style="display:grid;grid-template-columns:5.5rem 1fr;align-items:center;gap:.75rem;font-size:.8125rem;color:var(--mv-fg-muted)">Width
          <input value="100%" class="mv-input" data-size="sm">
        </label>
        <label style="display:grid;grid-template-columns:5.5rem 1fr;align-items:center;gap:.75rem;font-size:.8125rem;color:var(--mv-fg-muted)">Max. width
          <input value="1,280px" class="mv-input" data-size="sm">
        </label>
        <label style="display:grid;grid-template-columns:5.5rem 1fr;align-items:center;gap:.75rem;font-size:.8125rem;color:var(--mv-fg-muted)">Height
          <input value="auto" class="mv-input" data-size="sm">
        </label>
      </form>
    </div>
  </mv-popover>

  <mv-popover placement="top" arrow>
    <button class="mv-button" data-variant="secondary">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.5 2.5 12 7l4.5 2.5L12 12l-2.5 4.5L7 12 2.5 9.5 7 7z"/><path d="M18 14v6M15 17h6"/></svg>
      What’s new
    </button>
    <div data-content style="--mv-popover-width:17rem">
      <div class="mv-popover-header" style="margin-bottom:0">
        <p style="margin:0 0 .25rem;font-size:.6875rem;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--mv-accent-fg)">Step 1 of 3</p>
        <h3 class="mv-popover-title">Keyboard shortcuts</h3>
        <p class="mv-popover-description">Press <strong style="color:var(--mv-fg)">?</strong> at any time to see the full list of shortcuts.</p>
      </div>
      <div class="mv-popover-footer">
        <button class="mv-button" data-variant="ghost" data-size="sm" data-mv-close>Skip</button>
        <button class="mv-button" data-size="sm" data-mv-close>Next</button>
      </div>
    </div>
  </mv-popover>

  <mv-popover placement="bottom" data-open="liquid">
    <button class="mv-button">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>
      Share (liquid)
    </button>
    <div data-content style="--mv-popover-width:17.5rem">
      <div class="mv-popover-header" style="margin-bottom:.75rem">
        <h3 class="mv-popover-title">Share board</h3>
        <p class="mv-popover-description">Anyone with the link can view.</p>
      </div>
      <div style="display:flex;gap:.5rem">
        <input class="mv-input" data-size="sm" value="kanope.app/t/roadmap-q3" readonly aria-label="Share link">
        <button class="mv-button" data-size="sm" data-variant="secondary" data-mv-close>Copy</button>
      </div>
    </div>
  </mv-popover>
</div>
```

## API

### Attributes

| Name | Type | Default | Description |
|---|---|---|---|
| `placement` | top \| bottom \| left \| right[-start\|-end] | `bottom` | Preferred side and alignment, flipped when space runs out. |
| `offset` | number | `8` | Distance from the trigger (px). |
| `arrow` | boolean |  | Shows an arrow pointing at the trigger. |
| `open` | boolean |  | Opens/closes programmatically (reflects the state). |
| `data-open` | "liquid" |  | Opt-in: a “goo” layer (SVG blur filter + alpha threshold) pulls the panel out of the trigger’s edge with a liquid neck that thins and snaps, then the content appears; closing replays a pinch back into the trigger. Ignored with reduced motion (standard animation). |

### Properties

| Name | Type | Description |
|---|---|---|
| `isOpen` | boolean | Read-only: the panel is shown. |

### Methods

| Name | Description |
|---|---|
| `show()` | Opens the panel. |
| `hide()` | Closes the panel. |
| `toggle()` | Toggles the state. |
| `liquidMorph(panel, anchor, "open" \| "close", done)` | popover.js export: plays the liquid morph on any already-positioned panel (returns { layer, cancel() }). |

### Events

| Name | Description |
|---|---|
| `mv-open` | After opening. |
| `mv-close` | After closing (whatever the cause). |

### Content structure

| Name | Description |
|---|---|
| `first child` | Trigger (button): receives aria-haspopup, aria-expanded and aria-controls. |
| `[data-content]` | Panel; an [autofocus] element inside receives focus on open, otherwise the first focusable one. |
| `[data-mv-close]` | Any element in the panel that closes the popover on click. |

### CSS classes

| Name | Description |
|---|---|
| `mv-popover-header / -title / -description / -footer` | Content layout; the title and description are wired via aria-labelledby / aria-describedby. |

### CSS variables

| Name | Default | Description |
|---|---|---|
| `--mv-popover-width` | `18rem` | Panel width. |
| `--mv-popover-padding` | `1rem` | Inner padding. |
| `--mv-popover-radius` |  | Corner radius. |
| `--mv-popover-bg` |  | Panel background (and arrow). |

## Accessibility

APG “Dialog (non-modal)” pattern: role=dialog named by .mv-popover-title, trigger with aria-expanded/aria-controls. Enter/Space open it, focus moves into the panel and returns to the trigger on close (Escape or button), unless the user clicked elsewhere. The panel is inert during the exit animation.
