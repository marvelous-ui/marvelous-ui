# Button `.mv-button`

> Pure-CSS button on `<button>` or `<a>`: 6 variants, 4 sizes, loading state, group.

| | |
|---|---|
| Category | Primitives |
| Type | CSS only (`.mv-button`) |
| Status | stable |
| Keywords | button, cta, group, loading |

## When to use

- A form submission or in-page action needs a clear, consistently styled trigger
- Actions must be ranked by importance with primary, secondary, outline, ghost, destructive or link styles
- An action runs asynchronously and should show a loading state that blocks repeat clicks
- Related actions should be joined into a single attached group

## Install

```bash
node scripts/add.mjs button --out ./src/marvelous
```

AI agent with the Marvelous UI MCP server: `install_components({ slugs: ["button"], target_dir: "<absolute path>/src/marvelous", framework: "react" })`.

Files copied (dependencies included): `tokens/tokens.css`, `core/base.css`, `components/button/button.css`.

## Usage

Canonical markup, to start from and customize with attributes, `data-*` and CSS variables:

```html
<div style="display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center">
  <button class="mv-button">Primary</button>
  <button class="mv-button" data-variant="secondary">Secondary</button>
  <button class="mv-button" data-variant="outline">Outline</button>
  <button class="mv-button" data-variant="ghost">Ghost</button>
  <button class="mv-button" data-variant="destructive">Delete</button>
  <a class="mv-button" data-variant="link" href="#">Link</a>
</div>
<div style="display:flex;flex-wrap:wrap;gap:.75rem;align-items:center;justify-content:center">
  <button class="mv-button" data-size="sm">Small</button>
  <button class="mv-button" data-size="lg" data-shape="pill">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
    Create
  </button>
  <button class="mv-button" data-variant="outline" data-size="icon" aria-label="Settings">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>
  </button>
  <button class="mv-button" data-variant="outline" data-size="icon-sm" aria-label="Edit">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
  </button>
  <button class="mv-button" data-variant="outline" data-size="icon-xs" aria-label="More actions">
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
  </button>
  <button class="mv-button" aria-busy="true">Sending…</button>
  <button class="mv-button" disabled>Disabled</button>
  <div class="mv-button-group" role="group" aria-label="Alignment">
    <button class="mv-button" data-variant="outline">Left</button>
    <button class="mv-button" data-variant="outline">Center</button>
    <button class="mv-button" data-variant="outline">Right</button>
  </div>
</div>
```

## API

### Attributes

| Name | Type | Default | Description |
|---|---|---|---|
| `data-variant` | secondary \| outline \| ghost \| destructive \| link | `(primary)` | Visual style. |
| `data-size` | sm \| lg \| icon \| icon-sm \| icon-xs | `(md)` | Size; icon = square (36px), icon-sm = 32px for toolbars, icon-xs = 24px for compact tables. Name icon-only buttons with aria-label. |
| `data-shape` | pill \| round |  | Fully rounded corners. |
| `aria-busy` | true |  | Shows a spinner and blocks clicks. |

### CSS classes

| Name | Description |
|---|---|
| `mv-button` | Base class, on `<button>` or `<a>`. |
| `mv-button-group` | Container that joins several buttons together (add role="group"). |

### CSS variables

| Name | Default | Description |
|---|---|---|
| `--mv-button-radius` | `var(--mv-radius-md)` | Corner radius. |

## Accessibility

Use a real `<button>` (or `<a href>` for navigation). Icon buttons must have an aria-label.
