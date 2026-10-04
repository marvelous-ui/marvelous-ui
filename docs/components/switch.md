# Switch `.mv-switch`

> Pure-CSS switch on `<input type="checkbox" role="switch">`: thumb that slides on a spring and stretches when pressed, icons in the thumb (customizable), sizes, label on the left or right, option card.

| | |
|---|---|
| Category | Primitives |
| Type | CSS only (`.mv-switch`) |
| Status | stable |
| Also installs | [checkbox](checkbox.md) |
| Keywords | switch, toggle, form, settings, spring, choice-card |

## When to use

- A setting turns on or off and takes effect immediately, as in a preferences panel
- A list of settings needs on/off rows or option cards with descriptions

**Avoid when**

- The choice only applies after submitting a form, or is an agreement such as accepting terms → use [Checkbox](checkbox.md) instead

## Install

```bash
node scripts/add.mjs switch --out ./src/marvelous
```

AI agent with the Marvelous UI MCP server: `install_components({ slugs: ["switch"], target_dir: "<absolute path>/src/marvelous", framework: "react" })`.

Files copied (dependencies included): `tokens/tokens.css`, `core/base.css`, `components/checkbox/checkbox.css`, `components/switch/switch.css`.

## Usage

Canonical markup, to start from and customize with attributes, `data-*` and CSS variables:

```html
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));gap:2rem 2.5rem;width:100%;max-width:42rem;align-items:start">
  <div style="display:grid;gap:0;border:1px solid var(--mv-border);border-radius:var(--mv-radius-lg);background:var(--mv-surface);box-shadow:var(--mv-shadow-xs)">
    <label class="mv-choice" data-control="end" style="padding:.875rem 1rem">
      <input type="checkbox" role="switch" class="mv-switch" checked>
      <span class="mv-choice-text"><span class="mv-choice-title">Wi‑Fi</span><span class="mv-choice-description">Connected to “Studio‑5G”</span></span>
    </label>
    <label class="mv-choice" data-control="end" style="padding:.875rem 1rem;border-top:1px solid var(--mv-border)">
      <input type="checkbox" role="switch" class="mv-switch">
      <span class="mv-choice-text"><span class="mv-choice-title">Airplane mode</span><span class="mv-choice-description">Turns off all wireless connections</span></span>
    </label>
    <label class="mv-choice" data-control="end" style="padding:.875rem 1rem;border-top:1px solid var(--mv-border)">
      <input type="checkbox" role="switch" class="mv-switch" data-icons checked>
      <span class="mv-choice-text"><span class="mv-choice-title">Auto-updates</span><span class="mv-choice-description">Installed overnight, between 2 and 5 a.m.</span></span>
    </label>
    <label class="mv-choice" data-control="end" style="padding:.875rem 1rem;border-top:1px solid var(--mv-border)">
      <input type="checkbox" role="switch" class="mv-switch" disabled>
      <span class="mv-choice-text"><span class="mv-choice-title">Personal hotspot</span><span class="mv-choice-description">Not supported by your plan</span></span>
    </label>
  </div>

  <div style="display:grid;gap:1.5rem">
    <div style="display:grid;gap:.875rem">
      <label class="mv-choice"><input type="checkbox" role="switch" class="mv-switch" checked> Show previews</label>
      <label class="mv-choice"><input type="checkbox" role="switch" class="mv-switch" data-icons> Notification sounds</label>
      <label class="mv-choice">
        <input type="checkbox" role="switch" class="mv-switch" data-icons data-size="lg" style="--mv-switch-icon-off:url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.4' stroke-linecap='round'%3E%3Ccircle cx='12' cy='12' r='4'/%3E%3Cpath d='M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4'/%3E%3C/svg%3E&quot;);--mv-switch-icon-on:url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'%3E%3Cpath d='M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z'/%3E%3C/svg%3E&quot;)">
        Dark theme
      </label>
    </div>
    <div style="display:flex;gap:1rem;align-items:center">
      <input type="checkbox" role="switch" class="mv-switch" data-size="sm" checked aria-label="Small">
      <input type="checkbox" role="switch" class="mv-switch" checked aria-label="Medium">
      <input type="checkbox" role="switch" class="mv-switch" data-size="lg" checked aria-label="Large">
      <input type="checkbox" role="switch" class="mv-switch" data-shape="square" checked aria-label="Square">
    </div>
    <label class="mv-choice-card" data-control="end">
      <input type="checkbox" role="switch" class="mv-switch">
      <span class="mv-choice-text">
        <span class="mv-choice-title">Public share link</span>
        <span class="mv-choice-description">Anyone with the link can view this document.</span>
      </span>
    </label>
  </div>
</div>
```

## API

### Attributes

| Name | Type | Default | Description |
|---|---|---|---|
| `data-size` | sm \| lg | `(md)` | Height 16 / 20 / 24 px. |
| `data-shape` | square |  | Slightly rounded corners instead of a pill. |
| `data-icons` | boolean |  | Shows an icon in the thumb (✕ / ✓ by default). |
| `aria-invalid` | true |  | Error halo. |

### CSS classes

| Name | Description |
|---|---|
| `mv-switch` | On `<input type="checkbox" role="switch">`. |
| `mv-choice / mv-choice-card` | Shared label and card (checkbox component). data-control="end" puts the switch to the right of the label (settings row). |

### CSS variables

| Name | Type | Default | Description |
|---|---|---|---|
| `--mv-switch-height` |  | `1.25rem` | Track height (the thumb follows). |
| `--mv-switch-width` |  | `1.8 × height` | Track width. |
| `--mv-switch-radius` |  | `var(--mv-radius-full)` | Track radius. |
| `--mv-switch-icon-off / -on` | url() |  | SVG icon masks (e.g. sun / moon). |
| `--mv-switch-icon-color / -color-on` |  | `--mv-fg-subtle / --mv-accent` | Icon color. |

## Accessibility

role="switch" on a native checkbox: state announced as “on / off”, Space toggles, value submitted with the form. The wrapping `<label>` provides the name; link a description via aria-describedby if needed. Icons are decorative (pseudo-elements).
