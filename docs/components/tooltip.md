# Tooltip `<mv-tooltip>`

> Tooltip in the top layer (Popover API), automatic placement with flip, arrow, grouped delay. For a toolbar, Tooltip Group shares a single surface that slides from one button to the next.

| | |
|---|---|
| Category | Overlays |
| Type | Web Component (`<mv-tooltip>`) |
| Status | stable |
| Keywords | tooltip, hint, popover, morphic-tooltip |

## When to use

- An icon-only button needs its label shown on hover and keyboard focus
- A short supplementary hint clarifies a control without cluttering the layout

**Avoid when**

- The content is interactive or must be reachable on touch devices → use [Popover](popover.md) instead

## Install

```bash
node scripts/add.mjs tooltip --out ./src/marvelous
```

AI agent with the Marvelous UI MCP server: `install_components({ slugs: ["tooltip"], target_dir: "<absolute path>/src/marvelous", framework: "react" })`.

Files copied (dependencies included): `tokens/tokens.css`, `core/base.css`, `core/dom.js`, `core/element.js`, `core/i18n.js`, `core/position.js`, `components/tooltip/tooltip.js`, `components/tooltip/tooltip.css`.

## Usage

Canonical markup, to start from and customize with attributes, `data-*` and CSS variables:

```html
<div style="display:flex;gap:.75rem;flex-wrap:wrap;justify-content:center">
  <mv-tooltip text="Above" placement="top"><button class="mv-button" data-variant="outline">Top</button></mv-tooltip>
  <mv-tooltip text="Below" placement="bottom"><button class="mv-button" data-variant="outline">Bottom</button></mv-tooltip>
  <mv-tooltip text="To the left" placement="left"><button class="mv-button" data-variant="outline">Left</button></mv-tooltip>
  <mv-tooltip text="To the right" placement="right"><button class="mv-button" data-variant="outline">Right</button></mv-tooltip>
  <mv-tooltip placement="top" delay="0">
    <button class="mv-button" data-variant="secondary">Rich</button>
    <div data-content><strong>⌘ K</strong>: open the palette</div>
  </mv-tooltip>
</div>
```

## API

### Attributes

| Name | Type | Default | Description |
|---|---|---|---|
| `text` | string |  | Plain text (otherwise a [data-content] child). |
| `placement` | top \| bottom \| left \| right[-start\|-end] | `top` | Preferred side, flipped when there’s no room. |
| `delay` | number | `500` | Show delay (ms). Skipped if another tooltip just closed. |
| `offset` | number | `8` | Distance from the trigger (px). |
| `open` | boolean |  | Opens/closes programmatically. |
| `disabled` | boolean |  | Disables the tooltip. |

### Events

| Name | Description |
|---|---|
| `mv-open` | After opening. |
| `mv-close` | After closing. |

### Content structure

| Name | Description |
|---|---|
| `first child` | Trigger (button, link, focusable icon). |
| `[data-content]` | Optional rich content. |

### CSS variables

| Name | Description |
|---|---|
| `--mv-tooltip-bg` | Background. |
| `--mv-tooltip-fg` | Text. |

## Accessibility

role=tooltip + aria-describedby on the trigger; opens on keyboard focus, closes on Escape. Doesn’t open on touch (use a Popover).
