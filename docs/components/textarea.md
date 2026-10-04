# Textarea `.mv-textarea`

> Textarea that grows on its own (field-sizing: content) between a minimum and maximum number of rows, with an optional resize handle, a group with a toolbar and an `<mv-char-count>` character counter.

| | |
|---|---|
| Category | Primitives |
| Type | CSS only (`.mv-textarea`) |
| Status | stable |
| Keywords | textarea, autosize, auto-grow, character-count, composer, counter |

## When to use

- Users write multi-line text such as a comment, message, bio or description
- The field should grow with its content between a minimum and a maximum number of rows
- A character limit must be shown with a counter that warns near the limit
- A composer needs a toolbar for formatting or attachment buttons next to the text

**Avoid when**

- The value is short and single-line, like a name or an email → use [Input](input.md) instead
- Rich text such as headings, bold and links must render while typing; this field is plain text

## Install

```bash
node scripts/add.mjs textarea --out ./src/marvelous
```

AI agent with the Marvelous UI MCP server: `install_components({ slugs: ["textarea"], target_dir: "<absolute path>/src/marvelous", framework: "react" })`.

Files copied (dependencies included): `tokens/tokens.css`, `core/base.css`, `core/dom.js`, `core/element.js`, `core/i18n.js`, `components/textarea/textarea.css`, `components/textarea/char-count.js`.

## Usage

Canonical markup, to start from and customize with attributes, `data-*` and CSS variables:

```html
<div id="mv-textarea-demo" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(18rem,1fr));gap:1.5rem 2rem;width:min(100%,50rem);margin-inline:auto;align-items:start">
  <style>
    #mv-textarea-demo .cap { display:block; margin-bottom:.4rem; font-size:.8125rem; font-weight:500 }
    #mv-textarea-demo .row { display:flex; justify-content:space-between; align-items:center; gap:1rem; margin-top:.4rem; color:var(--mv-fg-muted); font-size:.75rem }
  </style>

  <div>
    <label class="cap" for="ta-bio">Bio</label>
    <textarea class="mv-textarea" id="ta-bio" maxlength="200" placeholder="A few words about you…">Product designer in Lisbon. I love clean interfaces, careful typography and the small details that make all the difference.</textarea>
    <div class="row">
      <span>Grows with your text.</span>
      <mv-char-count for="ta-bio"></mv-char-count>
    </div>
  </div>

  <div>
    <label class="cap" for="ta-msg">Message</label>
    <div class="mv-textarea-group">
      <textarea class="mv-textarea" id="ta-msg" placeholder="Message the Design team…" style="--mv-textarea-min-rows:2;--mv-textarea-max-rows:6">The onboarding mockups are ready: I’ll share them at tomorrow morning’s review.</textarea>
      <div class="mv-textarea-toolbar">
        <button type="button" class="mv-button" data-variant="ghost" data-size="icon" aria-label="Attach a file">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21 11-8.6 8.6a5.5 5.5 0 0 1-7.8-7.8l8.6-8.6a3.7 3.7 0 0 1 5.2 5.2l-8.6 8.6a1.8 1.8 0 0 1-2.6-2.6L15 7"/></svg>
        </button>
        <button type="button" class="mv-button" data-variant="ghost" data-size="icon" aria-label="Mention someone">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/></svg>
        </button>
        <span class="mv-textarea-toolbar-spacer"></span>
        <mv-char-count for="ta-msg" max="120" mode="remaining" data-variant="ring"></mv-char-count>
        <button type="button" class="mv-button" data-size="sm" style="margin-inline-start:.25rem">Send</button>
      </div>
    </div>
  </div>

  <div>
    <label class="cap" for="ta-notes">Internal notes <span style="color:var(--mv-fg-subtle);font-weight:400">(resizable)</span></label>
    <textarea class="mv-textarea" id="ta-notes" data-resize="vertical" placeholder="Only visible to your team"></textarea>
  </div>

  <div style="display:grid;gap:1rem">
    <div>
      <label class="cap" for="ta-err">Reason for rejection</label>
      <textarea class="mv-textarea" id="ta-err" aria-invalid="true" style="--mv-textarea-min-rows:2">Too short</textarea>
    </div>
    <div>
      <label class="cap" for="ta-dis">Comment (closed)</label>
      <textarea class="mv-textarea" id="ta-dis" disabled style="--mv-textarea-min-rows:1">Comments are closed on this ticket.</textarea>
    </div>
  </div>
</div>
```

## API

### Attributes

| Name | Type | Default | Description |
|---|---|---|---|
| `data-size` | sm \| lg | `(md)` | Padding and text size; on .mv-textarea or .mv-textarea-group. |
| `data-resize` | vertical \| both | `(none)` | Shows the resize handle. |
| `data-autosize` | false |  | Disables auto-grow (height set via rows). |
| `aria-invalid` | true |  | Forces the error state; :user-invalid is also supported. |
| `<mv-char-count for>` | id |  | Tracked control (otherwise: the first textarea/input of the parent .mv-field or group). |
| `<mv-char-count max>` | number | `the control's maxlength` | Limit. Without maxlength it is a soft limit: the control becomes invalid past it. |
| `<mv-char-count mode>` | count \| remaining | `count` | “42 / 280” or the number of characters left. |
| `<mv-char-count warn-at>` | number | `0.9` | Ratio at which data-state="near" applies. |
| `<mv-char-count data-variant>` | ring |  | Circular gauge; the number only appears near the limit. |

### Methods

| Name | Description |
|---|---|
| `<mv-char-count>.refresh()` | Recomputes after a programmatic value change. |

### CSS classes

| Name | Description |
|---|---|
| `mv-textarea` | On `<textarea>`. Height adapts to the content. |
| `mv-textarea-group` | Shared container for textarea + toolbar (message composer, comment box). |
| `mv-textarea-toolbar` | Row of buttons below the textarea; data-divider adds a rule and a background. |
| `mv-textarea-toolbar-spacer` | Pushes the following items to the right. |

### CSS variables

| Name | Default | Description |
|---|---|---|
| `--mv-textarea-min-rows` | `3` | Minimum height in rows. |
| `--mv-textarea-max-rows` | `12` | Maximum height in rows before scrolling. |
| `--mv-textarea-radius` | `var(--mv-radius-md)` | Radius (group: radius-lg). |
| `--mv-textarea-bg` |  | Background. |
| `--mv-char-progress` |  | 0 → 1, set by `<mv-char-count>` (use it for your own gauges). |

## Accessibility

Pair with a `<label for>`. `<mv-char-count>` adds its description (“120 characters left of 200”) to the control's aria-describedby without overwriting existing ids, and only announces (role=status) when crossing the warning threshold or the limit, not on every keystroke. The visible number is aria-hidden. Toolbar buttons are `<button type="button">` with an aria-label.
