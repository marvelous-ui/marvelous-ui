# Card `.mv-card`

> Composable card (media, header, action, content, footer): outline, elevated, ghost and muted variants, plus a fully clickable card.

| | |
|---|---|
| Category | Data display |
| Type | CSS only (`.mv-card`) |
| Status | stable |
| Keywords | card, stat, media, interactive |

## When to use

- Related content must be grouped in a bordered or elevated surface with header, body and footer
- A grid of articles, projects or resources where each whole card links to a detail page
- A dashboard tile shows one key figure with its trend next to a label

## Install

```bash
node scripts/add.mjs card --out ./src/marvelous
```

AI agent with the Marvelous UI MCP server: `install_components({ slugs: ["card"], target_dir: "<absolute path>/src/marvelous", framework: "react" })`.

Files copied (dependencies included): `tokens/tokens.css`, `core/base.css`, `components/card/card.css`.

## Usage

Canonical markup, to start from and customize with attributes, `data-*` and CSS variables:

```html
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));gap:1rem;width:100%;max-width:56rem">
  <article class="mv-card">
    <header class="mv-card-header">
      <h3 class="mv-card-title">Monthly revenue</h3>
      <p class="mv-card-description">September 2026</p>
    </header>
    <div class="mv-card-content">
      <div class="mv-card-stat">$48,290</div>
      <span class="mv-card-trend">▲ 12.4% vs August</span>
    </div>
  </article>

  <article class="mv-card" data-interactive>
    <figure class="mv-card-media"><img alt="" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 225'%3E%3Cdefs%3E%3ClinearGradient id='a' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23c4b5fd'/%3E%3Cstop offset='1' stop-color='%234c1d95'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='225' fill='url(%23a)'/%3E%3Ccircle cx='300' cy='60' r='80' fill='%23fff' opacity='.12'/%3E%3Ccircle cx='80' cy='200' r='110' fill='%23000' opacity='.12'/%3E%3C/svg%3E"></figure>
    <header class="mv-card-header">
      <h3 class="mv-card-title"><a class="mv-card-link" href="#card">Design tokens guide</a></h3>
      <p class="mv-card-description">Fully clickable card that lifts on hover.</p>
    </header>
  </article>

  <article class="mv-card" data-variant="elevated">
    <header class="mv-card-header">
      <h3 class="mv-card-title">Invite your team</h3>
      <p class="mv-card-description">3 seats left on your plan.</p>
      <div class="mv-card-action"><button class="mv-button" data-variant="ghost" data-size="icon" aria-label="More options"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg></button></div>
    </header>
    <div class="mv-card-content">
      <input class="mv-input" placeholder="name@company.com" style="width:100%;height:2.25rem;padding:0 .75rem;border:1px solid var(--mv-input);border-radius:var(--mv-radius-md);background:var(--mv-bg);color:inherit">
    </div>
    <footer class="mv-card-footer" data-bordered>
      <button class="mv-button" data-size="sm">Send invite</button>
    </footer>
  </article>
</div>
```

## API

### Attributes

| Name | Type | Description |
|---|---|---|
| `data-variant` | elevated \| ghost \| muted | Style (default: outline). |
| `data-size` | sm | Reduced padding. |
| `data-interactive` | boolean | Lift on hover, media zoom, focus ring. |

### CSS classes

| Name | Description |
|---|---|
| `mv-card` | Container. |
| `mv-card-media` | Leading image/video `<figure>` (ratio via --mv-card-media-ratio). |
| `mv-card-header / -title / -description / -action` | Header; -action sits at the top right. |
| `mv-card-content` | Body. |
| `mv-card-footer` | Footer; data-bordered for a separated, tinted footer. |
| `mv-card-link` | Link stretched over the whole card (with data-interactive). |
| `mv-card-stat / mv-card-trend` | Key figure and trend (data-direction="down"). |

### CSS variables

| Name | Default | Description |
|---|---|---|
| `--mv-card-padding` | `var(--mv-space-6)` | Inner padding. |
| `--mv-card-radius` | `var(--mv-radius-xl)` | Radius. |
| `--mv-card-media-ratio` | `16 / 9` | Media aspect ratio. |

## Accessibility

Clickable card: a single link (.mv-card-link) in the title; other controls stay reachable on top (z-index).
