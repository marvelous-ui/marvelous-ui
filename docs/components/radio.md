# Radio `.mv-radio`

> Pure-CSS native radio button: an inner dot that springs in, sizes, an outline variant, inline or stacked groups, and option cards (plan lists, tiles with a badge).

| | |
|---|---|
| Category | Primitives |
| Type | CSS only (`.mv-radio`) |
| Status | stable |
| Also installs | [checkbox](checkbox.md) |
| Keywords | radio, radio-group, form, choice-card, plan-selector |

## When to use

- Users must choose exactly one option from a small set and benefit from seeing every choice at once
- Plans or shipping methods must be compared as option cards with a price, description or badge

**Avoid when**

- There are many options and vertical space is limited → use [Select](select.md) instead
- Several options can be selected at the same time → use [Checkbox](checkbox.md) instead

## Install

```bash
node scripts/add.mjs radio --out ./src/marvelous
```

AI agent with the Marvelous UI MCP server: `install_components({ slugs: ["radio"], target_dir: "<absolute path>/src/marvelous", framework: "react" })`.

Files copied (dependencies included): `tokens/tokens.css`, `core/base.css`, `components/checkbox/checkbox.css`, `components/radio/radio.css`.

## Usage

Canonical markup, to start from and customize with attributes, `data-*` and CSS variables:

```html
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));gap:2rem 2.5rem;width:100%;max-width:42rem;align-items:start">
  <div style="display:grid;gap:1.75rem">
    <fieldset class="mv-choice-group" data-orientation="horizontal">
      <legend>Billing</legend>
      <label class="mv-choice"><input type="radio" class="mv-radio" name="rd-cycle" value="monthly"> Monthly</label>
      <label class="mv-choice"><input type="radio" class="mv-radio" name="rd-cycle" value="yearly" checked> Yearly (−20%)</label>
    </fieldset>

    <fieldset class="mv-choice-group">
      <legend>Shipping</legend>
      <label class="mv-choice">
        <input type="radio" class="mv-radio" name="rd-ship" value="standard" checked aria-describedby="rd-ship-1">
        <span class="mv-choice-text"><span class="mv-choice-title">Standard</span><span class="mv-choice-description" id="rd-ship-1">3-5 business days · free</span></span>
      </label>
      <label class="mv-choice">
        <input type="radio" class="mv-radio" name="rd-ship" value="express" aria-describedby="rd-ship-2">
        <span class="mv-choice-text"><span class="mv-choice-title">Express</span><span class="mv-choice-description" id="rd-ship-2">Delivered tomorrow by 1 p.m. · $9.90</span></span>
      </label>
      <label class="mv-choice">
        <input type="radio" class="mv-radio" name="rd-ship" value="pickup" disabled aria-describedby="rd-ship-3">
        <span class="mv-choice-text"><span class="mv-choice-title">In-store pickup</span><span class="mv-choice-description" id="rd-ship-3">Unavailable for this address</span></span>
      </label>
    </fieldset>

    <div style="display:flex;gap:1rem;align-items:center" role="radiogroup" aria-label="Sizes">
      <input type="radio" class="mv-radio" name="rd-size" data-size="sm" aria-label="Small">
      <input type="radio" class="mv-radio" name="rd-size" checked aria-label="Medium">
      <input type="radio" class="mv-radio" name="rd-size" data-size="lg" aria-label="Large">
      <input type="radio" class="mv-radio" name="rd-size2" data-size="lg" data-variant="outline" checked aria-label="Outline">
    </div>
  </div>

  <div style="display:grid;gap:1.75rem">
    <fieldset class="mv-choice-group">
      <legend>Plan</legend>
      <label class="mv-choice-card">
        <input type="radio" class="mv-radio" name="rd-plan" value="starter">
        <span class="mv-choice-text"><span class="mv-choice-title">Starter</span><span class="mv-choice-description">1 project, 2 members</span></span>
        <span class="mv-radio-meta">$0</span>
      </label>
      <label class="mv-choice-card">
        <input type="radio" class="mv-radio" name="rd-plan" value="pro" checked>
        <span class="mv-choice-text"><span class="mv-choice-title">Pro</span><span class="mv-choice-description">Unlimited projects, 10 members</span></span>
        <span class="mv-radio-meta">$19 <small>/ month</small></span>
      </label>
      <label class="mv-choice-card">
        <input type="radio" class="mv-radio" name="rd-plan" value="enterprise">
        <span class="mv-choice-text"><span class="mv-choice-title">Enterprise</span><span class="mv-choice-description">SSO, audit logs, dedicated support</span></span>
        <span class="mv-radio-meta">Custom quote</span>
      </label>
    </fieldset>

    <fieldset class="mv-choice-group" data-layout="grid" style="--mv-choice-min:6rem">
      <legend>Payment</legend>
      <label class="mv-choice-card" data-variant="badge">
        <input type="radio" class="mv-radio" name="rd-pay" value="card" checked>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
        <span class="mv-choice-title" style="margin-top:.5rem">Card</span>
      </label>
      <label class="mv-choice-card" data-variant="badge">
        <input type="radio" class="mv-radio" name="rd-pay" value="transfer">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>
        <span class="mv-choice-title" style="margin-top:.5rem">Bank transfer</span>
      </label>
      <label class="mv-choice-card" data-variant="badge">
        <input type="radio" class="mv-radio" name="rd-pay" value="cash">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/></svg>
        <span class="mv-choice-title" style="margin-top:.5rem">Cash</span>
      </label>
    </fieldset>
  </div>
</div>
```

## API

### Attributes

| Name | Type | Default | Description |
|---|---|---|---|
| `data-size` | sm \| lg | `(md)` | Size (14 / 16 / 20 px). |
| `data-variant` | outline |  | On the input: neutral ring, only the dot takes the accent. |
| `aria-invalid` | true |  | Error border and halo. |
| `data-variant="badge"` | on .mv-choice-card |  | Vertical tile; the radio becomes a corner badge, visible once checked or on focus. |

### CSS classes

| Name | Description |
|---|---|
| `mv-radio` | On `<input type="radio">`. |
| `mv-choice / mv-choice-card / mv-choice-group` | Shared layouts, provided by the checkbox component (dependency). |
| `mv-radio-meta` | Price or info aligned at the end of the card (`<small>` for the unit). |

### CSS variables

| Name | Default | Description |
|---|---|---|
| `--mv-radio-size` | `1rem` | Control size. |

## Accessibility

Native radios grouped by name: arrows change the option, Tab enters/leaves the group, all handled by the browser. Wrap them in `<fieldset>` + `<legend>` (or role="radiogroup" + aria-label). In the badge variant, the radio stays present and focusable (only visually hidden until checked).
