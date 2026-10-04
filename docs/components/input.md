# Input `.mv-input`

> Pure-CSS text field: 3 sizes, invalid (aria-invalid / :user-invalid), read-only and file states, plus a group with icons, prefixes/suffixes, inline buttons and a clear button.

| | |
|---|---|
| Category | Primitives |
| Type | CSS only (`.mv-input`) |
| Status | stable |
| Keywords | input, text-field, input-group, addon, search, file, clear, password |

## When to use

- A single-line value is needed, such as a name, email, password, URL or search query
- The field needs a prefix, suffix, icon, inline button or clear button inside one bordered group
- Server-side or native validation errors must be shown directly on the field

**Avoid when**

- The text can span several lines, such as a comment or message → use [Textarea](textarea.md) instead

## Install

```bash
node scripts/add.mjs input --out ./src/marvelous
```

AI agent with the Marvelous UI MCP server: `install_components({ slugs: ["input"], target_dir: "<absolute path>/src/marvelous", framework: "react" })`.

Files copied (dependencies included): `tokens/tokens.css`, `core/base.css`, `components/input/input.css`.

## Usage

Canonical markup, to start from and customize with attributes, `data-*` and CSS variables:

```html
<div id="mv-input-demo" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));gap:1.25rem 1.5rem;width:min(100%,56rem);margin-inline:auto;font-size:.8125rem">
  <style>
    #mv-input-demo .cap { display:block; margin-bottom:.4rem; color:var(--mv-fg-muted); font-size:.75rem; font-weight:500 }
  </style>

  <div>
    <label class="cap" for="in-email">Email address</label>
    <input class="mv-input" id="in-email" type="email" placeholder="you@company.com" autocomplete="email">
  </div>

  <div>
    <label class="cap" for="in-search">Search</label>
    <div class="mv-input-group">
      <label class="mv-input-group-addon" for="in-search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></label>
      <input class="mv-input" id="in-search" type="search" placeholder="Search…">
      <span class="mv-input-group-addon"><kbd class="mv-kbd-group"><kbd class="mv-kbd">⌘</kbd><kbd class="mv-kbd">K</kbd></kbd></span>
    </div>
  </div>

  <div>
    <label class="cap" for="in-url">Website</label>
    <div class="mv-input-group">
      <label class="mv-input-group-addon" data-variant="filled" for="in-url">https://</label>
      <input class="mv-input" id="in-url" placeholder="my-studio" value="lumen-studio">
      <label class="mv-input-group-addon" data-variant="filled" for="in-url">.com</label>
    </div>
  </div>

  <div>
    <label class="cap" for="in-price">Monthly budget</label>
    <div class="mv-input-group">
      <label class="mv-input-group-addon" for="in-price">$</label>
      <input class="mv-input" id="in-price" inputmode="decimal" placeholder="0.00" value="1,250.00" style="font-variant-numeric:tabular-nums">
      <label class="mv-input-group-addon" for="in-price">USD</label>
    </div>
  </div>

  <div>
    <label class="cap" for="in-pass">Password</label>
    <div class="mv-input-group">
      <input class="mv-input" id="in-pass" type="password" value="correct-horse-battery" autocomplete="new-password">
      <button type="button" class="mv-button" data-variant="ghost" data-size="icon" aria-label="Show password" aria-pressed="false" data-toggle-pass>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>
      </button>
    </div>
  </div>

  <div>
    <label class="cap" for="in-news">Newsletter</label>
    <div class="mv-input-group">
      <label class="mv-input-group-addon" for="in-news"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg></label>
      <input class="mv-input" id="in-news" type="email" placeholder="Your email">
      <button type="button" class="mv-button" data-size="sm">Subscribe</button>
    </div>
  </div>

  <div>
    <label class="cap" for="in-clear">With clear button</label>
    <div class="mv-input-group">
      <input class="mv-input" id="in-clear" placeholder="Board name" value="Q4 roadmap">
      <button type="button" class="mv-input-clear" aria-label="Clear" data-clear>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    </div>
  </div>

  <div>
    <label class="cap" for="in-invalid">Invalid</label>
    <input class="mv-input" id="in-invalid" type="email" value="ada@" aria-invalid="true">
  </div>

  <div>
    <label class="cap" for="in-file">Attachment</label>
    <input class="mv-input" id="in-file" type="file">
  </div>

  <div>
    <label class="cap" for="in-ro">Read-only</label>
    <input class="mv-input" id="in-ro" value="ID-7F3A-2291" readonly style="font-family:var(--mv-font-mono)">
  </div>

  <div>
    <label class="cap" for="in-dis">Disabled</label>
    <input class="mv-input" id="in-dis" placeholder="Unavailable" disabled>
  </div>

  <div style="display:grid;gap:.5rem;align-content:end">
    <span class="cap" style="margin:0">Sizes</span>
    <div style="display:flex;gap:.5rem;align-items:center">
      <input class="mv-input" data-size="sm" placeholder="Small" aria-label="Small">
      <input class="mv-input" placeholder="Medium" aria-label="Medium">
      <input class="mv-input" data-size="lg" placeholder="Large" aria-label="Large">
    </div>
  </div>
</div>
<script type="module">
  const root = document.getElementById("mv-input-demo");
  root.addEventListener("click", (e) => {
    const toggle = e.target.closest("[data-toggle-pass]");
    if (toggle) {
      const input = toggle.parentElement.querySelector("input");
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      toggle.setAttribute("aria-pressed", String(show));
      toggle.setAttribute("aria-label", show ? "Hide password" : "Show password");
    }
    const clear = e.target.closest("[data-clear]");
    if (clear) {
      const input = clear.parentElement.querySelector("input");
      input.value = "";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.focus();
    }
  });
</script>
```

## API

### Attributes

| Name | Type | Default | Description |
|---|---|---|---|
| `data-size` | sm \| lg | `(md)` | Height 32 / 36 / 44px; on .mv-input or .mv-input-group. |
| `aria-invalid` | true |  | Forces the error state (server-side validation). :user-invalid is also supported natively. |
| `data-variant (addon)` | filled |  | Addon separated by a divider, on a muted background. |
| `type="search"` | native |  | The native clear button (WebKit/Blink) is restyled: clearing without JS. |

### CSS classes

| Name | Description |
|---|---|
| `mv-input` | On `<input>` (text, email, search, password, number, file…). |
| `mv-input-group` | Container that carries the border and focus ring; the inner .mv-input becomes borderless. |
| `mv-input-group-addon` | Icon, text (“https://”, “$”), `<kbd>` or indicator placed before/after the input. Use a `<label for>` so clicking it focuses the input. |
| `mv-input-clear` | Clear button: hidden automatically while the input is empty (the input needs a placeholder). The clearing itself is up to you (3 lines of JS). |

### CSS variables

| Name | Default | Description |
|---|---|---|
| `--mv-input-radius` | `var(--mv-radius-md)` | Corner radius (input and group). |
| `--mv-input-bg` |  | Field background. |

## Accessibility

Always pair with a `<label for>` (or aria-label). Decorative icons have aria-hidden="true". Text addons in a `<label for>` join the accessible name (“https://” is then announced). Inline buttons are real `<button type="button">` elements with an aria-label; the show/hide password button uses aria-pressed. On error, set aria-invalid="true" and link the message via aria-describedby (see Field).
