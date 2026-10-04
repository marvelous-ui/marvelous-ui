# Select `.mv-select`

> Styled native `<select>` (token-colored chevron), progressively enhanced into a customizable select (appearance: base-select): animated list, status dots, icons, descriptions and checkmark, optional “liquid” opening; clean fallback elsewhere.

| | |
|---|---|
| Category | Primitives |
| Type | CSS only (`.mv-select`) |
| Status | stable |
| Keywords | select, native-select, base-select, customizable-select, dropdown, listbox, picker, liquid, gooey |

## When to use

- Users pick one value from a medium-sized list where native mobile pickers and keyboard support matter
- Options benefit from status dots, icons or descriptions while staying a real form control
- A playful liquid opening fits the product, with a clean native fallback on unsupported browsers

**Avoid when**

- The list holds actions to run rather than a value to submit → use [Menu](menu.md) instead
- Only two to five options exist and showing them all helps the decision → use [Radio](radio.md) instead

## Install

```bash
node scripts/add.mjs select --out ./src/marvelous
```

AI agent with the Marvelous UI MCP server: `install_components({ slugs: ["select"], target_dir: "<absolute path>/src/marvelous", framework: "react" })`.

Files copied (dependencies included): `tokens/tokens.css`, `core/base.css`, `components/select/select.css`.

## Usage

Canonical markup, to start from and customize with attributes, `data-*` and CSS variables:

```html
<div id="mv-select-demo" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(14rem,1fr));gap:1.25rem 1.5rem;width:min(100%,52rem);margin-inline:auto;align-items:start">
  <style>
    #mv-select-demo .cap { display:block; margin-bottom:.4rem; color:var(--mv-fg-muted); font-size:.75rem; font-weight:500 }
  </style>

  <div>
    <label class="cap" for="sl-status">Project status</label>
    <select class="mv-select" id="sl-status">
      <button><selectedcontent></selectedcontent></button>
      <option value="active" selected><span class="mv-select-dot" data-tone="success"></span>Active</option>
      <option value="review"><span class="mv-select-dot" data-tone="warning"></span>In review</option>
      <option value="paused"><span class="mv-select-dot" data-tone="info"></span>Paused</option>
      <option value="late"><span class="mv-select-dot" data-tone="danger"></span>Overdue</option>
      <hr>
      <option value="archived" disabled><span class="mv-select-dot"></span>Archived</option>
    </select>
  </div>

  <div>
    <label class="cap" for="sl-role">Role</label>
    <select class="mv-select" id="sl-role">
      <button><selectedcontent></selectedcontent></button>
      <option value="admin">
        <span class="mv-select-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6Z"/></svg></span>
        <span class="mv-select-text">Admin<span class="mv-select-description">Full access, including billing</span></span>
      </option>
      <option value="editor" selected>
        <span class="mv-select-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4Z"/></svg></span>
        <span class="mv-select-text">Editor<span class="mv-select-description">Creates and edits content</span></span>
      </option>
      <option value="viewer">
        <span class="mv-select-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg></span>
        <span class="mv-select-text">Viewer<span class="mv-select-description">Can view and comment</span></span>
      </option>
    </select>
  </div>

  <div>
    <label class="cap" for="sl-tz">Time zone</label>
    <select class="mv-select" id="sl-tz">
      <optgroup label="Americas">
        <option selected>New York (UTC−5)</option>
        <option>Los Angeles (UTC−8)</option>
        <option>São Paulo (UTC−3)</option>
      </optgroup>
      <optgroup label="Europe &amp; Asia">
        <option>London (UTC+0)</option>
        <option>Tokyo (UTC+9)</option>
      </optgroup>
    </select>
  </div>

  <div>
    <label class="cap" for="sl-native">Country (native rendering)</label>
    <select class="mv-select" id="sl-native" data-native>
      <option>United States</option>
      <option>Canada</option>
      <option>United Kingdom</option>
      <option>Germany</option>
    </select>
  </div>

  <div>
    <label class="cap" for="sl-invalid">Category (required)</label>
    <select class="mv-select" id="sl-invalid" required aria-invalid="true">
      <option value="" disabled selected>Choose a category…</option>
      <option>Design</option>
      <option>Engineering</option>
      <option>Marketing</option>
    </select>
  </div>

  <div>
    <label class="cap" for="sl-liquid">Priority (liquid open)</label>
    <select class="mv-select" id="sl-liquid" data-open="liquid">
      <button><selectedcontent></selectedcontent></button>
      <option value="urgent"><span class="mv-select-dot" data-tone="danger"></span>Urgent</option>
      <option value="haute" selected><span class="mv-select-dot" data-tone="warning"></span>High</option>
      <option value="normale"><span class="mv-select-dot" data-tone="info"></span>Normal</option>
      <option value="basse"><span class="mv-select-dot"></span>Low</option>
    </select>
  </div>

  <div style="display:grid;gap:.5rem">
    <span class="cap" style="margin:0">Sizes and disabled state</span>
    <select class="mv-select" data-size="sm" aria-label="Density"><option>Compact</option><option>Comfortable</option></select>
    <select class="mv-select" disabled aria-label="Plan"><option>Team plan (locked)</option></select>
    <select class="mv-select" data-size="lg" aria-label="Display"><option>Large</option><option>Standard</option></select>
  </div>

</div>
```

## API

### Attributes

| Name | Type | Default | Description |
|---|---|---|---|
| `data-size` | sm \| lg | `(md)` | Height 32 / 36 / 44px. |
| `data-native` | boolean |  | Keeps native rendering even when base-select is available. |
| `aria-invalid` | true |  | Error state; :user-invalid is supported too. |
| `<button><selectedcontent>` | structure |  | Optional first child: the displayed value mirrors the selected option’s rich content (dot, icon). |
| `data-open` | "liquid" |  | Opt-in, pure CSS: the list stretches out of the trigger (a drop hanging from a neck, clip-path shape() driven by @property properties), spreads out, then pinches back into the trigger on close. Requires base-select + shape(); otherwise a standard animation. Instant with reduced motion. |

### CSS classes

| Name | Description |
|---|---|
| `mv-select` | On `<select>`. Classic everywhere; customizable where appearance: base-select is supported. |
| `mv-select-dot` | Status dot inside an option; data-tone="success \| warning \| danger \| info" or --mv-select-dot. |
| `mv-select-icon` | Option icon (svg). |
| `mv-select-text` | Label + description container inside an option. |
| `mv-select-description` | Secondary option text, hidden in the displayed value (selectedcontent). |

### CSS variables

| Name | Default | Description |
|---|---|---|
| `--mv-select-radius` | `var(--mv-radius-md)` | Trigger radius. |
| `--mv-select-picker-radius` | `var(--mv-radius-lg)` | List radius. |
| `--mv-select-bg` |  | Trigger background. |
| `--mv-select-dot` |  | Dot color. |

## Accessibility

Stays a real `<select>`: combobox/listbox role, keyboard (arrows, type-ahead, Enter, Escape), screen readers and native mobile pickers handled by the browser. Pair it with a `<label for>`. Option icons are aria-hidden. Fallback: without base-select, rich option content is reduced to its text (keep descriptions short; don’t use the label attribute, which would hide the rich content). For a required choice, use required + a first option with value="" disabled (placeholder styling applied). Known limits: the custom picker, rich options and data-open="liquid" need appearance: base-select (Chromium-based browsers today), and the liquid opening also needs clip-path: shape(); elsewhere the field stays a styled native select with plain-text options and the browser's own list.
