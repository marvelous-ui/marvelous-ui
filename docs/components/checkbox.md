# Checkbox `.mv-checkbox`

> Native pure-CSS checkbox: a self-drawing (reversible) check mark, indeterminate state, sizes, invalid; also provides the shared .mv-choice and .mv-choice-card layouts (option cards highlighted via :has(:checked)).

| | |
|---|---|
| Category | Primitives |
| Type | CSS only (`.mv-checkbox`) |
| Status | stable |
| Keywords | checkbox, form, indeterminate, choice-card, check, select-all |

## When to use

- Users pick any number of options from a list, or give a single opt-in such as accepting terms
- A select-all control needs an indeterminate state above a nested list of options
- Options need richer presentation as clickable cards with a title, description and icon

**Avoid when**

- The setting takes effect immediately, like turning a feature on or off → use [Switch](switch.md) instead
- Only one option in the set may be chosen → use [Radio](radio.md) instead

## Install

```bash
node scripts/add.mjs checkbox --out ./src/marvelous
```

AI agent with the Marvelous UI MCP server: `install_components({ slugs: ["checkbox"], target_dir: "<absolute path>/src/marvelous", framework: "react" })`.

Files copied (dependencies included): `tokens/tokens.css`, `core/base.css`, `components/checkbox/checkbox.css`.

## Usage

Canonical markup, to start from and customize with attributes, `data-*` and CSS variables:

```html
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));gap:2rem 2.5rem;width:100%;max-width:40rem;align-items:start">
  <div style="display:grid;gap:1.25rem">
    <div style="display:grid;gap:.75rem">
      <label class="mv-choice"><input type="checkbox" class="mv-checkbox" checked> I accept the terms of service</label>
      <label class="mv-choice"><input type="checkbox" class="mv-checkbox"> Remember me</label>
      <label class="mv-choice"><input type="checkbox" class="mv-checkbox" disabled> Sync (coming soon)</label>
    </div>
    <label class="mv-choice">
      <input type="checkbox" class="mv-checkbox" checked aria-describedby="cb-desc-rapport">
      <span class="mv-choice-text">
        <span class="mv-choice-title">Weekly report</span>
        <span class="mv-choice-description" id="cb-desc-rapport">A summary of team activity, every Monday at 9 a.m.</span>
      </span>
    </label>
    <div style="display:flex;gap:1rem;align-items:center">
      <input type="checkbox" class="mv-checkbox" data-size="sm" checked aria-label="Small">
      <input type="checkbox" class="mv-checkbox" checked aria-label="Medium">
      <input type="checkbox" class="mv-checkbox" data-size="lg" checked aria-label="Large">
      <input type="checkbox" class="mv-checkbox" data-size="lg" data-shape="round" checked aria-label="Round">
      <input type="checkbox" class="mv-checkbox" aria-invalid="true" aria-label="Invalid">
    </div>
  </div>

  <div style="display:grid;gap:1.25rem">
    <fieldset class="mv-choice-group" id="cb-demo-tree">
      <legend>Notifications</legend>
      <label class="mv-choice"><input type="checkbox" class="mv-checkbox" data-all> Select all</label>
      <div class="mv-choice-group-nested">
        <label class="mv-choice"><input type="checkbox" class="mv-checkbox" checked> Mentions</label>
        <label class="mv-choice"><input type="checkbox" class="mv-checkbox"> Comments</label>
        <label class="mv-choice"><input type="checkbox" class="mv-checkbox" checked> New followers</label>
      </div>
    </fieldset>
    <label class="mv-choice-card">
      <input type="checkbox" class="mv-checkbox" checked>
      <span class="mv-choice-text">
        <span class="mv-choice-title">Autosave</span>
        <span class="mv-choice-description">Saves your drafts every 30 seconds.</span>
      </span>
    </label>
    <label class="mv-choice-card" data-control="end">
      <input type="checkbox" class="mv-checkbox">
      <span class="mv-choice-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></span>
      <span class="mv-choice-text">
        <span class="mv-choice-title">Two-factor authentication</span>
        <span class="mv-choice-description">A code is required at every sign-in.</span>
      </span>
    </label>
  </div>
</div>
<script type="module">
  // Demo: "select all" parent reflecting its children (checked / indeterminate).
  const root = document.getElementById("cb-demo-tree");
  const all = root.querySelector("[data-all]");
  const items = [...root.querySelectorAll(".mv-choice-group-nested input")];
  const sync = () => {
    const n = items.filter((i) => i.checked).length;
    all.checked = n === items.length;
    all.indeterminate = n > 0 && n < items.length;
  };
  all.addEventListener("change", () => { items.forEach((i) => (i.checked = all.checked)); sync(); });
  items.forEach((i) => i.addEventListener("change", sync));
  sync();
</script>
```

## API

### Attributes

| Name | Type | Default | Description |
|---|---|---|---|
| `data-size` | sm \| lg | `(md)` | Box size (14 / 16 / 20 px). |
| `data-shape` | round |  | Round box. |
| `aria-invalid` | true |  | Error border and halo. |
| `data-control` | end |  | On .mv-choice / .mv-choice-card: puts the control at the end of the row. |
| `data-orientation` | horizontal |  | On .mv-choice-group: options in a row. |
| `data-layout` | grid |  | On .mv-choice-group: auto-fit grid of cards (min width --mv-choice-min). |

### CSS classes

| Name | Description |
|---|---|
| `mv-checkbox` | On `<input type="checkbox">`. Set the indeterminate state in JS: input.indeterminate = true. |
| `mv-choice` | Shared (radio, switch): a `<label>` row with control + label, the control centered on the first line. |
| `mv-choice-card` | Shared: a clickable card `<label>` containing the input; highlighted when checked, ring on keyboard focus. |
| `mv-choice-text / -title / -description` | Text block: title + muted description. |
| `mv-choice-icon` | Optional icon tile inside a card (tinted when checked). |
| `mv-choice-group` | List of options (ideally `<fieldset>` + `<legend>`). |
| `mv-choice-group-nested` | Indented sub-list (“select all” tree). |

### CSS variables

| Name | Default | Description |
|---|---|---|
| `--mv-checkbox-size` | `1rem` | Box size. |
| `--mv-checkbox-radius` | `28% of the size` | Corner radius. |
| `--mv-choice-card-radius` | `var(--mv-radius-lg)` | Option card radius. |
| `--mv-choice-min` | `11rem` | Minimum card width with data-layout="grid". |

## Accessibility

Native input: role, checked/mixed state (aria-checked=mixed for indeterminate), Space and form submission handled by the browser. The wrapping `<label>` provides the accessible name; link the description with aria-describedby. Focus ring visible for keyboard only; animations disabled with reduced motion.
