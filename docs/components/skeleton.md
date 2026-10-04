# Skeleton `.mv-skeleton`

> Loading placeholders with a shimmer synced across the whole page (or a pulse), text, heading, avatar, media and button shapes, and a blurred cross-fade reveal into the loaded content driven by aria-busy.

| | |
|---|---|
| Category | Feedback |
| Type | CSS only (`.mv-skeleton`) |
| Status | stable |
| Keywords | skeleton, placeholder, loading, shimmer, pulse, chargement, reveal |

## When to use

- Content is loading and its layout is known, so placeholders can prevent layout shift
- Lists, cards or profiles are fetched asynchronously and should reveal with a cross-fade once ready
- Many placeholders appear at once and need one synchronized shimmer instead of competing waves

## Install

```bash
node scripts/add.mjs skeleton --out ./src/marvelous
```

AI agent with the Marvelous UI MCP server: `install_components({ slugs: ["skeleton"], target_dir: "<absolute path>/src/marvelous", framework: "react" })`.

Files copied (dependencies included): `tokens/tokens.css`, `core/base.css`, `components/skeleton/skeleton.css`.

## Usage

Canonical markup, to start from and customize with attributes, `data-*` and CSS variables:

```html
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,17rem),1fr));gap:1.5rem;width:100%;align-items:start">

  <!-- Card composition (shimmer) -->
  <div aria-hidden="true" style="display:grid;gap:1rem;padding:1.25rem;border:1px solid var(--mv-border);border-radius:var(--mv-radius-xl);background:var(--mv-surface)">
    <div class="mv-skeleton" data-shape="media"></div>
    <div class="mv-skeleton" data-shape="heading" style="width:70%"></div>
    <div class="mv-skeleton-text">
      <span class="mv-skeleton"></span>
      <span class="mv-skeleton"></span>
      <span class="mv-skeleton"></span>
    </div>
    <div style="display:flex;gap:.5rem">
      <span class="mv-skeleton" data-shape="button"></span>
      <span class="mv-skeleton" data-shape="button" style="width:4.5rem"></span>
    </div>
  </div>

  <!-- List rows (pulse, set on the container) -->
  <div data-skeleton="pulse" aria-hidden="true" style="display:grid;gap:1.1rem;padding:1.25rem;border:1px solid var(--mv-border);border-radius:var(--mv-radius-xl);background:var(--mv-surface)">
    <div style="display:flex;gap:.75rem;align-items:center"><span class="mv-skeleton" data-shape="circle"></span><div class="mv-skeleton-text" style="flex:1"><span class="mv-skeleton" style="width:55%"></span><span class="mv-skeleton" style="width:80%"></span></div></div>
    <div style="display:flex;gap:.75rem;align-items:center"><span class="mv-skeleton" data-shape="circle"></span><div class="mv-skeleton-text" style="flex:1"><span class="mv-skeleton" style="width:40%"></span><span class="mv-skeleton" style="width:70%"></span></div></div>
    <div style="display:flex;gap:.75rem;align-items:center"><span class="mv-skeleton" data-shape="circle"></span><div class="mv-skeleton-text" style="flex:1"><span class="mv-skeleton" style="width:62%"></span><span class="mv-skeleton" style="width:48%"></span></div></div>
    <div style="display:flex;gap:.75rem;align-items:center"><span class="mv-skeleton" data-shape="square" style="--mv-skeleton-size:2.5rem"></span><div class="mv-skeleton-text" style="flex:1"><span class="mv-skeleton" style="width:50%"></span><span class="mv-skeleton" style="width:75%"></span></div></div>
  </div>

  <!-- Reveal: skeleton cross-fades into the loaded content -->
  <div style="display:grid;gap:.75rem">
    <div class="mv-skeleton-reveal" id="sk-demo-reveal" aria-busy="true" aria-live="polite" style="padding:1.25rem;border:1px solid var(--mv-border);border-radius:var(--mv-radius-xl);background:var(--mv-surface)">
      <div data-skeleton aria-hidden="true" style="display:grid;gap:1rem">
        <div style="display:flex;gap:.75rem;align-items:center">
          <span class="mv-skeleton" data-shape="circle" style="--mv-skeleton-size:3rem"></span>
          <div class="mv-skeleton-text" style="flex:1"><span class="mv-skeleton" style="width:60%"></span><span class="mv-skeleton" style="width:40%"></span></div>
        </div>
        <div class="mv-skeleton-text"><span class="mv-skeleton"></span><span class="mv-skeleton"></span></div>
      </div>
      <div data-content style="display:grid;gap:1rem">
        <div style="display:flex;gap:.75rem;align-items:center">
          <span style="display:grid;place-items:center;width:3rem;height:3rem;border-radius:50%;background:var(--mv-accent-subtle);color:var(--mv-accent-fg);font-weight:600">CR</span>
          <div style="display:grid;gap:2px"><strong style="font-size:.875rem">Chloe Reed</strong><span style="font-size:.8125rem;color:var(--mv-fg-muted)">Product designer · London</span></div>
        </div>
        <p style="margin:0;font-size:.875rem;line-height:1.55;color:var(--mv-fg-muted)">Working on the customer portal redesign and the new design system.</p>
      </div>
    </div>
    <button class="mv-button" data-variant="outline" data-size="sm" id="sk-demo-reload" style="justify-self:start">Reload</button>
  </div>
</div>
<script type="module">
  const box = document.getElementById("sk-demo-reveal");
  const btn = document.getElementById("sk-demo-reload");
  let timer = 0;
  const load = () => {
    clearTimeout(timer);
    box.setAttribute("aria-busy", "true");
    timer = setTimeout(() => box.setAttribute("aria-busy", "false"), 1800);
  };
  btn?.addEventListener("click", load);
  if (box) load();
</script>
```

## API

### Attributes

| Name | Type | Default | Description |
|---|---|---|---|
| `data-shape` | text \| heading \| circle \| square \| button \| media |  | Ready-made shapes (circle/square use --mv-skeleton-size). |
| `data-variant` | pulse \| static | `(shimmer)` | Opacity pulse, or no motion. |
| `data-skeleton="pulse"` | on a container |  | Switches every descendant skeleton to pulse. |
| `aria-busy` | true \| false |  | On .mv-skeleton-reveal: loading state. |

### CSS classes

| Name | Description |
|---|---|
| `mv-skeleton` | Loading block (any width/height, 1rem tall by default). |
| `mv-skeleton-text` | Stack of .mv-skeleton lines; the last one is shorter. |
| `mv-skeleton-reveal` | Stacks [data-skeleton] and [data-content]; aria-busy="true" shows the skeleton, "false" reveals the content with a fade + blur. |

### CSS variables

| Name | Default | Description |
|---|---|---|
| `--mv-skeleton-base` |  | Block color (default: text at 8%, adapts to the background). |
| `--mv-skeleton-shine` |  | Shimmer color. |
| `--mv-skeleton-duration` | `2s` | Duration of one cycle. |
| `--mv-skeleton-size` | `2.5rem` | Size of the circle / square shapes. |

## Accessibility

Skeletons are decorative: set aria-hidden="true" on their container, and aria-busy="true" (+ aria-live="polite") on the loading region. The shimmer is synced (background-attachment: fixed) to avoid the flicker of multiple waves. Reduced motion: shimmer and pulse stop, the reveal is instant.
