# Badge `.mv-badge`

> Pure-CSS badge: 7 variants (soft or solid tints), animatable status dot, icon, remove button, pill/square, 3 sizes, and a counter positioned on the corner of an avatar or icon.

| | |
|---|---|
| Category | Primitives |
| Type | CSS only (`.mv-badge`) |
| Status | stable |
| Keywords | badge, chip, tag, pill, status, counter, notification, dot |

## When to use

- A short status label must sit next to an item, such as Paid, Failed or Beta
- An unread count or presence dot must be pinned to the corner of an icon or avatar
- Removable tags or active filters need a compact chip with a remove button

**Avoid when**

- The item is a primary action the user is expected to click → use [Button](button.md) instead
- The status would be conveyed by color alone without a readable label

## Install

```bash
node scripts/add.mjs badge --out ./src/marvelous
```

AI agent with the Marvelous UI MCP server: `install_components({ slugs: ["badge"], target_dir: "<absolute path>/src/marvelous", framework: "react" })`.

Files copied (dependencies included): `tokens/tokens.css`, `core/base.css`, `components/badge/badge.css`.

## Usage

Canonical markup, to start from and customize with attributes, `data-*` and CSS variables:

```html
<div id="mv-badge-demo" style="display:grid;gap:1.75rem;justify-items:center;width:min(100%,44rem)">
  <div style="display:flex;flex-wrap:wrap;gap:.5rem;justify-content:center">
    <span class="mv-badge">New</span>
    <span class="mv-badge" data-variant="secondary">Draft</span>
    <span class="mv-badge" data-variant="outline">Archived</span>
    <span class="mv-badge" data-variant="success"><span class="mv-badge-dot"></span>Paid</span>
    <span class="mv-badge" data-variant="warning"><span class="mv-badge-dot"></span>Pending</span>
    <span class="mv-badge" data-variant="danger"><span class="mv-badge-dot"></span>Failed</span>
    <span class="mv-badge" data-variant="info">Beta</span>
    <span class="mv-badge" data-variant="danger" data-appearance="solid" data-shape="pill"><span class="mv-badge-dot" data-pulse></span>Live</span>
  </div>

  <div style="display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;justify-content:center">
    <span class="mv-badge" data-variant="info" data-shape="pill">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
      Verified
    </span>
    <span class="mv-badge" data-variant="outline" data-shape="square" style="font-family:var(--mv-font-mono)">v2.4.0</span>
    <a class="mv-badge" data-variant="secondary" data-shape="pill" href="#">
      What’s new
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
    </a>
    <span class="mv-badge" data-variant="outline"><span class="mv-badge-dot" style="--mv-badge-dot:var(--mv-success)"></span>Operational</span>
    <span style="display:inline-flex;gap:.375rem;align-items:center;margin-inline-start:.5rem">
      <span class="mv-badge" data-size="sm">Small</span>
      <span class="mv-badge">Medium</span>
      <span class="mv-badge" data-size="lg">Large</span>
    </span>
  </div>

  <div style="display:flex;flex-wrap:wrap;gap:.375rem;justify-content:center" data-tags aria-label="Skills">
    <span class="mv-badge" data-variant="secondary" data-shape="pill">Design<button type="button" class="mv-badge-remove" aria-label="Remove Design"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button></span>
    <span class="mv-badge" data-variant="secondary" data-shape="pill">Accessibility<button type="button" class="mv-badge-remove" aria-label="Remove Accessibility"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button></span>
    <span class="mv-badge" data-variant="secondary" data-shape="pill">Web Components<button type="button" class="mv-badge-remove" aria-label="Remove Web Components"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button></span>
    <span class="mv-badge" data-variant="outline">Rust<button type="button" class="mv-badge-remove" aria-label="Remove Rust"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button></span>
  </div>

  <div style="display:flex;flex-wrap:wrap;gap:2rem;align-items:center;justify-content:center">
    <span class="mv-badge-anchor">
      <button class="mv-button" data-variant="outline" data-size="icon" aria-label="Notifications, 3 unread">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/></svg>
      </button>
      <span class="mv-badge" data-variant="danger" data-appearance="solid" data-position="top-right" aria-hidden="true">3</span>
    </span>

    <span class="mv-badge-anchor">
      <span style="display:grid;place-items:center;width:2.5rem;height:2.5rem;border-radius:50%;background:linear-gradient(135deg,var(--mv-accent),var(--mv-info));color:var(--mv-fg-on-accent);font-weight:600;font-size:.875rem" role="img" aria-label="Lena Müller, 128 messages">LM</span>
      <span class="mv-badge" data-position="top-right" style="--mv-badge-offset:.25rem" aria-hidden="true">99+</span>
    </span>

    <span class="mv-badge-anchor">
      <span style="display:grid;place-items:center;width:2.5rem;height:2.5rem;border-radius:50%;background:var(--mv-bg-emphasis);color:var(--mv-fg);font-weight:600;font-size:.875rem" role="img" aria-label="Hiro Tanaka, online">HT</span>
      <span class="mv-badge" data-variant="success" data-appearance="solid" data-position="bottom-right" style="--mv-badge-offset:.25rem" aria-hidden="true"></span>
    </span>

    <span class="mv-badge-anchor">
      <button class="mv-button" data-variant="ghost" data-size="icon" aria-label="Messages, new messages">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
      </button>
      <span class="mv-badge" data-position="top-right" style="--mv-badge-offset:.5rem" aria-hidden="true"></span>
    </span>

    <span style="display:inline-flex;align-items:center;gap:.5rem;font-size:.875rem">
      Inbox <span class="mv-badge" data-variant="secondary" data-shape="pill" data-size="sm">24</span>
    </span>
  </div>
</div>
<script type="module">
  document.querySelector("#mv-badge-demo [data-tags]").addEventListener("click", (e) => {
    const btn = e.target.closest(".mv-badge-remove");
    if (!btn) return;
    const badge = btn.closest(".mv-badge");
    const next = badge.nextElementSibling?.querySelector(".mv-badge-remove") ?? badge.previousElementSibling?.querySelector(".mv-badge-remove");
    badge.remove();
    next?.focus();
  });
</script>
```

## API

### Attributes

| Name | Type | Default | Description |
|---|---|---|---|
| `data-variant` | secondary \| outline \| success \| warning \| danger \| info | `(solid accent)` | Visual style; semantic variants are tinted. |
| `data-appearance` | solid |  | Semantic variant in solid color (counters, strong statuses). |
| `data-shape` | pill \| square | `(rounded)` | Corner shape. |
| `data-size` | sm \| lg | `(md)` | Height 18 / 22 / 26px. |
| `data-position` | top-right \| top-left \| bottom-right \| bottom-left |  | Counter positioned on the corner of the parent .mv-badge-anchor, cut out by a ring; empty = plain dot (unread, presence). |

### CSS classes

| Name | Description |
|---|---|
| `mv-badge` | On `<span>`, or `<a>`/`<button>` for an interactive badge (hover + focus). |
| `mv-badge-dot` | Status dot; takes the variant’s tint or --mv-badge-dot. data-pulse: “live” ripple. |
| `mv-badge-remove` | Remove `<button>` inside the badge (the removal itself is up to you). |
| `mv-badge-anchor` | Relative container around an avatar/icon to place a .mv-badge[data-position] on it. |

### CSS variables

| Name | Default | Description |
|---|---|---|
| `--mv-badge-radius` | `var(--mv-radius-sm)` | Default radius. |
| `--mv-badge-dot` |  | Dot color. |
| `--mv-badge-offset` | `0px` | Inward offset of the positioned badge (useful on a round avatar). |
| `--mv-badge-ring` | `var(--mv-bg)` | Color of the positioned badge’s cut-out ring (set it to the background color). |

## Accessibility

A badge is text: it’s read as is. Don’t convey information through color alone (keep a label: “Paid”, “Failed”). Positioned counter: mark it aria-hidden="true" and carry the information in the trigger’s accessible name (aria-label="Notifications, 3 unread"). Remove button: explicit aria-label (“Remove Design”) and move focus to the neighboring badge after removal. The data-pulse ripple is disabled with reduced motion.
