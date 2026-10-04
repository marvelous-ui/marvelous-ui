# Kbd `.mv-kbd`

> Subtly raised keyboard keys on `<kbd>`: nested combinations, 3 sizes, a flat variant, adapts inside buttons and tooltips.

| | |
|---|---|
| Category | Primitives |
| Type | CSS only (`.mv-kbd`) |
| Status | stable |
| Keywords | kbd, keyboard, shortcut, hotkey, keycap |

## When to use

- Keyboard shortcuts must be displayed in docs, menus, tooltips or a command palette
- A key combination such as Ctrl+K needs to read as a group of keycaps

**Avoid when**

- The text is a status or category label rather than a key to press → use [Badge](badge.md) instead
- The content is inline code or a command to run rather than a keyboard key

## Install

```bash
node scripts/add.mjs kbd --out ./src/marvelous
```

AI agent with the Marvelous UI MCP server: `install_components({ slugs: ["kbd"], target_dir: "<absolute path>/src/marvelous", framework: "react" })`.

Files copied (dependencies included): `tokens/tokens.css`, `core/base.css`, `components/kbd/kbd.css`.

## Usage

Canonical markup, to start from and customize with attributes, `data-*` and CSS variables:

```html
<div style="display:grid;gap:1.75rem;justify-items:center;font-size:.875rem">
  <ul style="list-style:none;margin:0;padding:.375rem;width:min(100%,21rem);border:1px solid var(--mv-border);border-radius:var(--mv-radius-lg);background:var(--mv-surface);box-shadow:var(--mv-shadow-sm)">
    <li style="display:flex;justify-content:space-between;align-items:center;padding:.5rem .625rem">Search <kbd class="mv-kbd-group"><kbd class="mv-kbd">⌘</kbd><kbd class="mv-kbd">K</kbd></kbd></li>
    <li style="display:flex;justify-content:space-between;align-items:center;padding:.5rem .625rem">New document <kbd class="mv-kbd-group"><kbd class="mv-kbd">⌘</kbd><kbd class="mv-kbd">⇧</kbd><kbd class="mv-kbd">N</kbd></kbd></li>
    <li style="display:flex;justify-content:space-between;align-items:center;padding:.5rem .625rem">Save <kbd class="mv-kbd-group"><kbd class="mv-kbd">Ctrl</kbd>+<kbd class="mv-kbd">S</kbd></kbd></li>
    <li style="display:flex;justify-content:space-between;align-items:center;padding:.5rem .625rem">Go to home <kbd class="mv-kbd-group"><kbd class="mv-kbd">G</kbd>then<kbd class="mv-kbd">H</kbd></kbd></li>
    <li style="display:flex;justify-content:space-between;align-items:center;padding:.5rem .625rem">Close panel <kbd class="mv-kbd">Esc</kbd></li>
  </ul>

  <p style="margin:0;color:var(--mv-fg-muted)">Press <kbd class="mv-kbd">↵</kbd> to confirm or <kbd class="mv-kbd">Tab</kbd> to move to the next field.</p>

  <div style="display:flex;flex-wrap:wrap;gap:.75rem;align-items:center;justify-content:center">
    <button class="mv-button" data-variant="outline">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
      Search <kbd class="mv-kbd-group"><kbd class="mv-kbd">⌘</kbd><kbd class="mv-kbd">K</kbd></kbd>
    </button>
    <button class="mv-button">Send <kbd class="mv-kbd">⌘↵</kbd></button>
    <span style="display:inline-flex;gap:.5rem;align-items:center">
      <kbd class="mv-kbd" data-size="sm">⌥</kbd>
      <kbd class="mv-kbd">⌥</kbd>
      <kbd class="mv-kbd" data-size="lg">⌥ Option</kbd>
      <kbd class="mv-kbd" data-variant="flat">Del</kbd>
    </span>
  </div>
</div>
```

## API

### Attributes

| Name | Type | Default | Description |
|---|---|---|---|
| `data-size` | sm \| lg | `(md)` | Height 16 / 20 / 28 px. |
| `data-variant` | flat |  | No relief, tinted background (menus, command palettes). |

### CSS classes

| Name | Description |
|---|---|
| `mv-kbd` | Key, on `<kbd>`. |
| `mv-kbd-group` | Combination: a parent `<kbd>` holding several .mv-kbd; text between keys (“+”, “then”) stays subtle. |

### CSS variables

| Name | Default | Description |
|---|---|---|
| `--mv-kbd-bg` |  | Key background. |
| `--mv-kbd-fg` | `var(--mv-fg-muted)` | Text. |
| `--mv-kbd-border` |  | Border. |
| `--mv-kbd-depth` |  | Bottom edge color (3D effect). |
| `--mv-kbd-radius` | `var(--mv-radius-xs)` | Corner radius. |

## Accessibility

Use the `<kbd>` element (“keyboard input” semantics). For a combination, nest the `<kbd>`s inside a parent `<kbd>`, as the HTML spec recommends. Symbols (⌘, ⇧, ⌥) are read inconsistently: add an aria-label on the group (e.g. aria-label="Command K") or a .mv-sr-only text if the shortcut is important information.
