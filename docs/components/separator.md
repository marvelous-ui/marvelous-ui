# Separator `.mv-separator`

> Pure-CSS horizontal or vertical separator: solid, dashed, dotted or faded, with a centered (“or”) or aligned label, on `<hr>` or `<div>`.

| | |
|---|---|
| Category | Primitives |
| Type | CSS only (`.mv-separator`) |
| Status | stable |
| Keywords | separator, divider, hr, rule, or |

## When to use

- Two groups of content or controls need a quiet visual split, horizontal or vertical
- Alternative paths need a labeled divider, such as “or” between social login and email
- A feed or timeline needs inline labels like Today between groups of items

**Avoid when**

- Spacing alone already separates the groups clearly and extra lines would add clutter
- Sections need collapsible headings rather than a static line → use [Accordion](accordion.md) instead

## Install

```bash
node scripts/add.mjs separator --out ./src/marvelous
```

AI agent with the Marvelous UI MCP server: `install_components({ slugs: ["separator"], target_dir: "<absolute path>/src/marvelous", framework: "react" })`.

Files copied (dependencies included): `tokens/tokens.css`, `core/base.css`, `components/separator/separator.css`.

## Usage

Canonical markup, to start from and customize with attributes, `data-*` and CSS variables:

```html
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(16rem,1fr));gap:2rem;width:min(100%,46rem);align-items:start">
  <div style="display:grid;gap:1rem;font-size:.875rem">
    <div>
      <div style="font-weight:600">Marvelous UI</div>
      <div style="color:var(--mv-fg-muted)">Native components, zero dependencies.</div>
    </div>
    <hr class="mv-separator">
    <nav aria-label="Links" style="display:flex;align-items:center;gap:.75rem;height:1.25rem;color:var(--mv-fg-muted)">
      <a href="#" style="color:inherit;text-decoration:none">Blog</a>
      <div class="mv-separator" role="separator" aria-orientation="vertical" data-orientation="vertical"></div>
      <a href="#" style="color:inherit;text-decoration:none">Documentation</a>
      <div class="mv-separator" role="separator" aria-orientation="vertical" data-orientation="vertical"></div>
      <a href="#" style="color:inherit;text-decoration:none">Source</a>
    </nav>

    <div style="display:grid;gap:.875rem;margin-top:.75rem;font-size:.8125rem">
      <div class="mv-separator" data-variant="fade">Today</div>
      <div style="color:var(--mv-fg-muted)"><strong style="color:var(--mv-fg)">Isabel</strong> published version 2.4.</div>
      <div class="mv-separator" data-variant="dashed" data-align="start" style="--mv-separator-color:color-mix(in oklch, var(--mv-danger) 55%, transparent);color:var(--mv-danger)">New messages</div>
      <div style="color:var(--mv-fg-muted)"><strong style="color:var(--mv-fg)">Hana</strong>: review at 3 p.m.?</div>
    </div>
  </div>

  <div style="display:grid;gap:.875rem;padding:1.5rem;border:1px solid var(--mv-border);border-radius:var(--mv-radius-xl);background:var(--mv-surface);box-shadow:var(--mv-shadow-sm)">
    <div style="font-weight:600;font-size:1rem">Sign in</div>
    <button class="mv-button" data-variant="outline" style="width:100%">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
      Continue with GitHub
    </button>
    <div class="mv-separator">or</div>
    <button class="mv-button" style="width:100%">Email me a sign-in link</button>
    <div class="mv-separator" data-variant="dotted" style="margin-top:.25rem"></div>
    <div style="display:flex;align-items:center;justify-content:center;gap:.75rem;height:4.5rem;color:var(--mv-fg-muted);font-size:.8125rem">
      <span>Monthly</span>
      <div class="mv-separator" role="separator" aria-orientation="vertical" data-orientation="vertical" style="min-height:4.5rem">or</div>
      <span>Yearly <span style="color:var(--mv-success)">−20%</span></span>
    </div>
  </div>
</div>
```

## API

### Attributes

| Name | Type | Default | Description |
|---|---|---|---|
| `data-orientation` | vertical | `(horizontal)` | Vertical line; stretches to the height of the flex parent (min. 1em). |
| `data-variant` | dashed \| dotted \| fade |  | Line style; fade tapers off at the ends. |
| `data-align` | start \| end | `(centered)` | Label position. |

### CSS classes

| Name | Description |
|---|---|
| `mv-separator` | On `<hr>` (horizontal) or `<div>`. If the element contains text or an icon, it becomes a labeled divider (line, label, line). Without a label, it must be strictly empty (no whitespace). |

### CSS variables

| Name | Default | Description |
|---|---|---|
| `--mv-separator-color` | `var(--mv-border)` | Line color. |
| `--mv-separator-thickness` | `1px` | Thickness (dotted: 2px). |
| `--mv-separator-spacing` | `0` | Spacing on either side of the line. |

## Accessibility

`<hr>` already has role=separator. For a semantic `<div>`: role="separator" + aria-orientation="vertical" when vertical. Purely decorative: role="none" (or aria-hidden="true"). With a label (“or”, “Today”), don’t set role=separator (its children would become presentational): keep a plain `<div>` so the text is read.
