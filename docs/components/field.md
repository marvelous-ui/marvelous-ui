# Field `.mv-field`

> Pure-CSS field layout: label (required / optional), help text, an error message that shows up on its own when the control is invalid, vertical, horizontal, responsive and inline orientations, choice cards and fieldset.

| | |
|---|---|
| Category | Forms |
| Type | CSS only (`.mv-field`) |
| Status | stable |
| Keywords | field, label, form, fieldset, legend, error, helper-text, validation, choice-card |

## When to use

- Every form control needs a consistent label, help text and an error message that appears on invalid input
- Settings forms should show labels on the left on wide screens and stack them on narrow ones
- Related radios or checkboxes must be grouped under a legend, optionally as selectable choice cards

**Avoid when**

- The need is the text control itself rather than its label and messages → use [Input](input.md) instead

## Install

```bash
node scripts/add.mjs field --out ./src/marvelous
```

AI agent with the Marvelous UI MCP server: `install_components({ slugs: ["field"], target_dir: "<absolute path>/src/marvelous", framework: "react" })`.

Files copied (dependencies included): `tokens/tokens.css`, `core/base.css`, `components/field/field.css`.

## Usage

Canonical markup, to start from and customize with attributes, `data-*` and CSS variables:

```html
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(24rem,100%),1fr));gap:1.5rem;width:min(100%,62rem);margin-inline:auto;align-items:start">
  <form novalidate onsubmit="event.preventDefault()">
    <fieldset class="mv-fieldset" data-variant="card">
      <legend>Profile</legend>
      <p class="mv-fieldset-description">This information appears on your public page.</p>

      <div class="mv-field-group">
        <div class="mv-field-row">
          <div class="mv-field">
            <label class="mv-label" for="fd-first" data-required>First name</label>
            <input class="mv-input" id="fd-first" value="Sarah" required autocomplete="given-name">
          </div>
          <div class="mv-field">
            <label class="mv-label" for="fd-last" data-required>Last name</label>
            <input class="mv-input" id="fd-last" value="Kim" required autocomplete="family-name">
          </div>
        </div>

        <div class="mv-field">
          <label class="mv-label" for="fd-email" data-required>Email address</label>
          <input class="mv-input" id="fd-email" type="email" value="sarah.kim@" required aria-invalid="true" aria-describedby="fd-email-desc fd-email-err" autocomplete="email">
          <p class="mv-field-description" id="fd-email-desc">We’ll never share it.</p>
          <p class="mv-field-error" id="fd-email-err">Enter a full address, for example sarah@example.com.</p>
        </div>

        <div class="mv-field">
          <div class="mv-field-header">
            <label class="mv-label" for="fd-pass">Password</label>
            <a href="#">Forgot password?</a>
          </div>
          <input class="mv-input" id="fd-pass" type="password" minlength="8" value="sunrise-2026" aria-describedby="fd-pass-desc">
          <p class="mv-field-description" id="fd-pass-desc">At least 8 characters, including a number.</p>
        </div>

        <div class="mv-field">
          <label class="mv-label" for="fd-bio" data-optional="optional">Bio</label>
          <textarea class="mv-textarea" id="fd-bio" style="--mv-textarea-min-rows:2" placeholder="Tell us about your work…"></textarea>
        </div>
      </div>
      <div class="mv-fieldset-footer">
        <button type="button" class="mv-button" data-variant="outline">Cancel</button>
        <button class="mv-button">Save</button>
      </div>
    </fieldset>
  </form>

  <fieldset class="mv-fieldset" data-variant="card">
    <legend>Preferences</legend>
    <p class="mv-fieldset-description">Applies to all your workspaces.</p>

    <div class="mv-field-group" style="gap:1rem">
      <div class="mv-field" data-orientation="horizontal" style="--mv-field-label-width:8rem">
        <label class="mv-label" for="fd-lang">Language</label>
        <select class="mv-select" id="fd-lang">
          <option>Français</option>
          <option selected>English</option>
          <option>Deutsch</option>
          <option>Español</option>
        </select>
      </div>

      <div class="mv-field" data-orientation="horizontal" style="--mv-field-label-width:8rem">
        <label class="mv-label" for="fd-team">Team</label>
        <input class="mv-input" id="fd-team" value="Studio Berlin" disabled aria-describedby="fd-team-desc">
        <p class="mv-field-description" id="fd-team-desc">Managed by your admin.</p>
      </div>
    </div>

    <fieldset class="mv-fieldset" style="gap:.625rem">
      <legend style="font-size:var(--mv-text-sm);font-weight:500">Email notifications</legend>
      <label class="mv-field" data-orientation="inline" data-variant="card">
        <input type="radio" name="fd-notif" checked aria-describedby="fd-n1">
        <span class="mv-label">Daily digest</span>
        <span class="mv-field-description" id="fd-n1">A summary every morning at 8 a.m.</span>
      </label>
      <label class="mv-field" data-orientation="inline" data-variant="card">
        <input type="radio" name="fd-notif" aria-describedby="fd-n2">
        <span class="mv-label">Mentions only</span>
        <span class="mv-field-description" id="fd-n2">When someone mentions or assigns you.</span>
      </label>
    </fieldset>

    <div class="mv-field" data-orientation="inline">
      <input type="checkbox" id="fd-beta" checked>
      <label class="mv-label" for="fd-beta">Early access to new features</label>
    </div>
  </fieldset>
</div>
```

## API

### Attributes

| Name | Type | Default | Description |
|---|---|---|---|
| `data-required (label)` | boolean |  | Decorative asterisk (ignored by screen readers: put required on the control). |
| `data-optional (label)` | string |  | Note shown after the label, e.g. data-optional="optional". |
| `data-orientation` | horizontal \| responsive \| inline | `(vertical)` | horizontal: label on the left; responsive: horizontal when the container is ≥ 36rem; inline: checkbox/radio first, label next to it. |
| `data-variant (field)` | card |  | Selectable choice card (with inline orientation, on a `<label>`). |
| `data-variant (fieldset)` | card |  | Framed fieldset with a built-in action footer. |
| `data-invalid / data-disabled` | boolean |  | Forces the state on the field (otherwise inferred from the control). |

### CSS classes

| Name | Description |
|---|---|
| `mv-field` | Field container: label, control, description, error. |
| `mv-label` | Label (`<label for>`). Can be used on its own, outside .mv-field. |
| `mv-field-header` | Row with the label + a secondary element on the right (“Forgot password?” link, counter). |
| `mv-field-label-group` | Label + description stacked in the left column (horizontal orientation). |
| `mv-field-description` | Help text. |
| `mv-field-error` | Error message: hidden, then shown (fade) when the field contains a :user-invalid or aria-invalid="true" control, or has data-invalid. Never shown when empty. |
| `mv-field-group` | Stack of spaced fields; container-query container (responsive orientation). |
| `mv-field-row` | Side-by-side fields that wrap below 12rem. |
| `mv-fieldset` | On `<fieldset>`: styled `<legend>` (no notch), description, footer. |
| `mv-fieldset-description / -footer` | Text under the legend; action row (muted background in the card variant). |

### CSS variables

| Name | Default | Description |
|---|---|---|
| `--mv-field-label-width` | `11rem` | Width of the label column (horizontal / responsive). |

## Accessibility

Associate each label with `<label for="id">`. Link help text and error to the control: aria-describedby="help-id error-id" (an error hidden with display:none is not read; it is as soon as it shows). Set aria-invalid="true" on the control for a server error, and required for a required field (the asterisk is decorative). Group related options in `<fieldset class="mv-fieldset">` + `<legend>`; a disabled fieldset disables all its content. Choice cards: the `<label>` wraps the radio/checkbox input, and keyboard focus is shown on the card. A disabled field dims its label but keeps its help text readable (fg-subtle), since it often says why the field is locked. Forced colors: the error keeps its icon; the red tint of the label and border is lost there, so the error text itself must carry the message.
