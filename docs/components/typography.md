# Typography `.mv-prose`

> Long-form text styles on one class: headings, lists, quotes, inline and block code, keys, tables, figures, definition lists and disclosures get a steady vertical rhythm and a capped reading measure, in 3 sizes. Components placed inside keep their own look, and mv-not-prose opts any subtree out.

| | |
|---|---|
| Category | Animated text |
| Type | CSS only (`.mv-prose`) |
| Status | stable |
| Keywords | typography, prose, article, long-form, markdown, blog, docs, rich-text, lead |

## When to use

- Rendered Markdown or CMS HTML (blog posts, docs, changelogs) must read well without adding a class to every element
- Legal pages, help articles or release notes need consistent headings, lists and tables at a comfortable line length
- A sidebar or help panel shows rich text in a smaller size with the same rhythm as the main article

**Avoid when**

- The text is a UI label, card body or short marketing line rather than a flowing document

## Install

```bash
node scripts/add.mjs typography --out ./src/marvelous
```

AI agent with the Marvelous UI MCP server: `install_components({ slugs: ["typography"], target_dir: "<absolute path>/src/marvelous", framework: "react" })`.

Files copied (dependencies included): `tokens/tokens.css`, `core/base.css`, `components/typography/typography.css`.

## Usage

Quick start, the smallest working markup:

```html
<article class="mv-prose">
  <h1>Release notes</h1>
  <p class="mv-prose-lead">What changed in version 4.2.</p>
  <p>Plain HTML from your CMS or Markdown renderer, styled as it is.</p>
</article>
```

Canonical markup, to start from and customize with attributes, `data-*` and CSS variables:

```html
<div id="mv-typography-demo" style="display:flex;flex-wrap:wrap;align-items:flex-start;justify-content:center;gap:3rem 3.5rem;width:100%;max-width:74rem;margin-inline:auto">
  <article class="mv-prose" style="flex:1 1 34rem;min-width:0">
    <p><small>Engineering blog · September 18, 2026 · 8 min read</small></p>
    <h1>How we cut checkout latency by 38% without touching the database</h1>
    <p class="mv-prose-lead">Our checkout page was fast in Frankfurt and slow in São Paulo. Moving three read-only calls to the edge fixed most of it, and taught us where caching stops being safe.</p>

    <p>For most of 2025, the <a href="#results">p95 time to interactive</a> of our checkout sat just under two seconds. That was fine on a fiber line, and <strong>painful on a 4G connection in Lagos or Jakarta</strong>, where a third of our new customers come from. The database was never the problem: it answered in under 20 ms. The time went into <em>round trips</em>, and most of them repeated work the server had already done a minute earlier.</p>
    <p>We measured <abbr title="Time to First Byte">TTFB</abbr> per region for six weeks before changing anything. The pattern was clear: <mark>every request paid for the same three lookups</mark>, the tax rules, the shipping zones and the currency table, which change a few times a month at most.</p>

    <h2 id="where-the-time-went">Where the time went</h2>
    <p>A checkout render made eleven calls to internal services. We sorted them by how often their answer changed:</p>
    <ul>
      <li><strong>Per request:</strong> cart contents, stock levels and the customer's saved addresses.</li>
      <li><strong>Per day or less:</strong> data we could safely cache.
        <ul>
          <li>Tax rules for 64 countries, keyed by <code>country</code> and <code>postalPrefix</code></li>
          <li>Shipping zones and carrier cut-off times</li>
          <li>Exchange rates, refreshed every 15 minutes</li>
        </ul>
      </li>
      <li><strong>Never, in practice:</strong> the list of supported locales, still fetched on every page.</li>
    </ul>

    <figure>
      <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 720 360' font-family='Inter, ui-sans-serif, system-ui, sans-serif'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%231c1830'/%3E%3Cstop offset='1' stop-color='%23120f1f'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='720' height='360' fill='url(%23bg)'/%3E%3Crect x='120' y='26' width='12' height='12' rx='3' fill='%23ffffff' fill-opacity='.22'/%3E%3Ctext x='138' y='36' fill='%23c9c4dd' font-size='13'%3EBefore%3C/text%3E%3Crect x='204' y='26' width='12' height='12' rx='3' fill='%23a78bfa'/%3E%3Ctext x='222' y='36' fill='%23c9c4dd' font-size='13'%3EAfter edge caching%3C/text%3E%3Ctext x='672' y='36' fill='%23a8a3bf' font-size='12' text-anchor='end'%3Ep95 TTFB%3C/text%3E%3Cline x1='120' y1='62' x2='120' y2='308' stroke='%23ffffff' stroke-opacity='.08'/%3E%3Ctext x='120' y='330' fill='%23a8a3bf' font-size='12' text-anchor='middle'%3E0 ms%3C/text%3E%3Cline x1='258' y1='62' x2='258' y2='308' stroke='%23ffffff' stroke-opacity='.08'/%3E%3Ctext x='258' y='330' fill='%23a8a3bf' font-size='12' text-anchor='middle'%3E200 ms%3C/text%3E%3Cline x1='396' y1='62' x2='396' y2='308' stroke='%23ffffff' stroke-opacity='.08'/%3E%3Ctext x='396' y='330' fill='%23a8a3bf' font-size='12' text-anchor='middle'%3E400 ms%3C/text%3E%3Cline x1='534' y1='62' x2='534' y2='308' stroke='%23ffffff' stroke-opacity='.08'/%3E%3Ctext x='534' y='330' fill='%23a8a3bf' font-size='12' text-anchor='middle'%3E600 ms%3C/text%3E%3Cline x1='672' y1='62' x2='672' y2='308' stroke='%23ffffff' stroke-opacity='.08'/%3E%3Ctext x='672' y='330' fill='%23a8a3bf' font-size='12' text-anchor='middle'%3E800 ms%3C/text%3E%3Ctext x='104' y='94' fill='%23e9e6f5' font-size='14' font-weight='500' text-anchor='end'%3EFrankfurt%3C/text%3E%3Crect x='120' y='72' width='124.19999999999999' height='14' rx='4' fill='%23ffffff' fill-opacity='.22'/%3E%3Ctext x='252.2' y='83.5' fill='%23a8a3bf' font-size='12'%3E180%3C/text%3E%3Crect x='120' y='92' width='96.6' height='14' rx='4' fill='%23a78bfa'/%3E%3Ctext x='224.6' y='103.5' fill='%23ddd6fe' font-size='12' font-weight='600'%3E140%3C/text%3E%3Ctext x='104' y='156' fill='%23e9e6f5' font-size='14' font-weight='500' text-anchor='end'%3EVirginia%3C/text%3E%3Crect x='120' y='134' width='144.89999999999998' height='14' rx='4' fill='%23ffffff' fill-opacity='.22'/%3E%3Ctext x='272.9' y='145.5' fill='%23a8a3bf' font-size='12'%3E210%3C/text%3E%3Crect x='120' y='154' width='103.5' height='14' rx='4' fill='%23a78bfa'/%3E%3Ctext x='231.5' y='165.5' fill='%23ddd6fe' font-size='12' font-weight='600'%3E150%3C/text%3E%3Ctext x='104' y='218' fill='%23e9e6f5' font-size='14' font-weight='500' text-anchor='end'%3ESingapore%3C/text%3E%3Crect x='120' y='196' width='358.8' height='14' rx='4' fill='%23ffffff' fill-opacity='.22'/%3E%3Ctext x='486.8' y='207.5' fill='%23a8a3bf' font-size='12'%3E520%3C/text%3E%3Crect x='120' y='216' width='200.10000000000002' height='14' rx='4' fill='%23a78bfa'/%3E%3Ctext x='328.1' y='227.5' fill='%23ddd6fe' font-size='12' font-weight='600'%3E290%3C/text%3E%3Ctext x='104' y='280' fill='%23e9e6f5' font-size='14' font-weight='500' text-anchor='end'%3ES%C3%A3o Paulo%3C/text%3E%3Crect x='120' y='258' width='510.6' height='14' rx='4' fill='%23ffffff' fill-opacity='.22'/%3E%3Ctext x='638.6' y='269.5' fill='%23a8a3bf' font-size='12'%3E740%3C/text%3E%3Crect x='120' y='278' width='248.39999999999998' height='14' rx='4' fill='%23a78bfa'/%3E%3Ctext x='376.4' y='289.5' fill='%23ddd6fe' font-size='12' font-weight='600'%3E360%3C/text%3E%3C/svg%3E" alt="Bar chart of p95 checkout TTFB by region, before and after edge caching: Frankfurt 180 to 140 ms, Virginia 210 to 150 ms, Singapore 520 to 290 ms, São Paulo 740 to 360 ms." width="720" height="360">
      <figcaption>Figure 1. p95 time to first byte by region, two weeks before and after the change.</figcaption>
    </figure>

    <h3>Reading the traces</h3>
    <p>We started from production traces rather than benchmarks. The workflow that worked for us:</p>
    <ol>
      <li>Sample 1% of checkout requests with full spans.</li>
      <li>Group the spans by service and by region, then rank them by total time.
        <ol>
          <li>Anything above 50 ms at p95 went on the list.</li>
          <li>Anything called more than once per request went to the top.</li>
        </ol>
      </li>
      <li>Check each candidate against its change log before caching it.</li>
    </ol>
    <p>To open the same view in the trace explorer, press <kbd><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>F</kbd></kbd> and filter on <code>route:/checkout</code>.</p>

    <pre tabindex="0"><code>$ trace query --route /checkout --since 14d --by service,region
service        region      p95     calls/req
tax-rules      sa-east-1   212ms   1
shipping       sa-east-1   188ms   2
fx-rates       ap-south-1  141ms   1</code></pre>

    <div class="mv-card" data-variant="muted">
      <div class="mv-card-header">
        <p class="mv-card-title">Never cache anything tied to a customer</p>
        <p class="mv-card-description">Prices after discounts, stock and addresses stay on the origin. Components inside an article keep their own styles.</p>
      </div>
    </div>

    <h2 id="the-fix">The fix</h2>
    <p>Each of the three lookups now lives in a small edge function with a short time to live and a stale-while-revalidate window. When the origin publishes new tax rules, it purges the key, so a stale answer lasts seconds rather than minutes.</p>

    <figure>
<pre tabindex="0"><code class="language-ts">export async function taxRules(country: string, request: Request) {
  const key = `tax:${country}`;
  const cached = await cache.get(key);
  if (cached) return cached;
  const rules = await origin.fetch(`/tax/${country}`, request);
  await cache.put(key, rules, { ttl: 300, staleWhileRevalidate: 60 });
  return rules;
}</code></pre>
      <figcaption>edge/tax-rules.ts</figcaption>
    </figure>

    <p><a class="mv-button" data-variant="outline" href="#the-fix">Read the caching runbook</a></p>

    <figure>
      <blockquote>
        <p>The fastest request is the one you already answered. The hard part is knowing, for each answer, how long it stays true.</p>
      </blockquote>
      <figcaption><cite>Ingrid Johansson</cite>, Staff Engineer, Payments</figcaption>
    </figure>

    <h3 id="results">Results</h3>
    <p>After two weeks at 100% of traffic, the gains were largest where the network was worst:</p>
    <div role="region" aria-label="Checkout latency by region" tabindex="0">
      <table>
        <caption>p95 time to first byte, in milliseconds, 14 days before and after.</caption>
        <thead>
          <tr><th scope="col">Region</th><th scope="col" data-align="end">Before</th><th scope="col" data-align="end">After</th><th scope="col" data-align="end">Change</th></tr>
        </thead>
        <tbody>
          <tr><th scope="row">Frankfurt</th><td data-align="end">180</td><td data-align="end">140</td><td data-align="end">-22%</td></tr>
          <tr><th scope="row">Virginia</th><td data-align="end">210</td><td data-align="end">150</td><td data-align="end">-29%</td></tr>
          <tr><th scope="row">Singapore</th><td data-align="end">520</td><td data-align="end">290</td><td data-align="end">-44%</td></tr>
          <tr><th scope="row">São Paulo</th><td data-align="end">740</td><td data-align="end">360</td><td data-align="end">-51%</td></tr>
        </tbody>
      </table>
    </div>

    <h4>What we would do differently</h4>
    <dl>
      <dt>Start with the purge, not the cache</dt>
      <dd>A cache without a reliable invalidation path is a bug waiting for a tax change. We built the purge endpoint second, and should have built it first.</dd>
      <dt>Measure the cold path</dt>
      <dd>The first visitor after a purge pays the full cost. Watch the p99, not only the p95.</dd>
    </dl>

    <aside class="mv-not-prose" style="display:flex;gap:.875rem;align-items:center;margin-block:2rem;padding:1rem 1.125rem;border:1px solid var(--mv-border);border-radius:var(--mv-radius-lg);background:var(--mv-bg-subtle);font-size:var(--mv-text-sm);line-height:1.45">
      <span aria-hidden="true" style="display:grid;place-items:center;flex:none;width:2.5rem;height:2.5rem;border-radius:var(--mv-radius-full);background:var(--mv-accent-subtle);color:var(--mv-accent-fg);font-weight:600">PR</span>
      <p style="margin:0;color:var(--mv-fg-muted)"><strong style="color:var(--mv-fg);font-weight:600">Priya Raman</strong> leads the checkout platform team. This card opts out with <code style="font-family:var(--mv-font-mono);font-size:.8125rem">mv-not-prose</code>, so it keeps its own compact layout.</p>
    </aside>

    <h5>Methodology</h5>
    <details>
      <summary>How the numbers were collected</summary>
      <p>Real user monitoring from 2.4 million checkout sessions between August 21 and September 18, 2026, excluding bots and sessions shorter than one second. Regions are the edge location that served the request.</p>
    </details>

    <hr>

    <h6>Footnote</h6>
    <p><small>The <del>12%</del> <ins>9%</ins> of requests that still miss the cache are mostly first visits after a purge. Thanks to Mateo Silva and Aiko Tanaka for reviewing this post.</small></p>
  </article>

  <aside style="flex:0 1 20rem;min-width:0;padding:1.25rem 1.375rem;border:1px solid var(--mv-border);border-radius:var(--mv-radius-lg);background:var(--mv-surface)">
    <div class="mv-prose" data-size="sm">
      <h2>Release notes 4.2</h2>
      <p><small>Released October 2, 2026</small></p>
      <p>Smaller type and the same rhythm, for sidebars, changelogs and help panels.</p>
      <ul>
        <li>Edge caching for <code>tax-rules</code>, <code>shipping</code> and <code>fx-rates</code></li>
        <li>New purge endpoint, see the <a href="#the-fix">runbook</a></li>
        <li>Checkout p95 down <strong>38%</strong> worldwide</li>
      </ul>
      <blockquote><p>Upgrade in place: no migration needed.</p></blockquote>
    </div>
  </aside>
</div>
```

## API

### Attributes

| Name | Type | Default | Description |
|---|---|---|---|
| `data-size` | sm \| lg | `(base)` | On .mv-prose: 14 / 16 / 18 px body text. Every margin is in em, so the rhythm scales with it. |
| `data-align` | end \| center |  | On th or td: cell alignment (numbers). |

### CSS classes

| Name | Description |
|---|---|
| `mv-prose` | Container, on `<article>`, `<main>` or `<div>`. Styles its native descendants: h1 to h6, p, a, strong, em, small, mark, abbr, del, ins, sub, sup, ul/ol (nested), blockquote, cite, code, samp, pre, kbd, hr, table, figure, img, video, iframe, dl, details. |
| `mv-prose-lead` | Lead paragraph (standfirst) under the title: larger and muted. |
| `mv-not-prose` | Escape hatch: the element and its whole subtree keep the host styles, untouched by mv-prose. |

### CSS variables

| Name | Default | Description |
|---|---|---|
| `--mv-prose-measure` | `68ch` | Maximum line length of the container. Use none to fill the parent. |
| `--mv-prose-body` |  | Body text color. |
| `--mv-prose-headings` | `var(--mv-fg)` | Headings, strong text, table headers and code color. |
| `--mv-prose-links` | `var(--mv-accent-fg)` | Link color. |
| `--mv-prose-muted` | `var(--mv-fg-subtle)` | List markers, captions and figure captions. |
| `--mv-prose-rule` | `var(--mv-border)` | Rules, h2 underline, table rows, pre and details borders. |
| `--mv-prose-quote-border` | `var(--mv-accent)` | Blockquote side border. |
| `--mv-prose-code-bg` | `var(--mv-bg-muted)` | Inline code background. |
| `--mv-prose-pre-bg` | `var(--mv-bg-subtle)` | Code block background. |
| `--mv-prose-radius` | `var(--mv-radius-lg)` | Radius of pre, images, videos and details. |
| `--mv-prose-font` | `var(--mv-font-sans)` | Body font family. |
| `--mv-prose-heading-font` | `var(--mv-font-display)` | Headings font family. |
| `--mv-prose-scroll-margin` | `5rem` | Space kept above a heading reached by an anchor link (sticky headers). |

## Accessibility

Pure CSS on native elements: the document outline, lists, tables and disclosures keep their semantics. Colors come from the tokens (body text and captions at 4.5:1 or more in both themes), links stay underlined, and links, summary, a focusable pre and a focusable table wrapper get a visible focus ring. Give a long `<pre>` tabindex="0", and wrap a wide table in a plain `<div role="region" aria-label="…" tabindex="0">` so keyboard users can scroll it sideways. In forced colors, inline code keeps an outline, keys keep their border and `<mark>` uses the system Mark colors. No animation. The scoping relies on CSS @scope (all current engines); older browsers show the plain host styles.
