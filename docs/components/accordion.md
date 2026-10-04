# Accordion `<mv-accordion>`

> CSS accordion on native `<details>`: animated height (::details-content + interpolate-size), chevron or plus/minus, bordered, separated and card variants; optional `<mv-accordion type="single">`. Also covers Collapsible.

| | |
|---|---|
| Category | Data display |
| Type | Web Component (`<mv-accordion>`) |
| Status | stable |
| Keywords | accordion, accordéon, collapsible, details, faq, disclosure, expand |

## When to use

- Secondary content must be tucked away so users can expand only the sections they care about
- Several collapsible sections should allow only one open at a time, like a settings group or help panel
- A single show-more toggle is needed around extra details, using the standalone collapsible
- Hidden text must stay findable with in-page search and readable by crawlers

**Avoid when**

- Users switch between parallel views of equal importance rather than expanding sections → use [Tabs](tabs.md) instead
- The content is critical and must be seen by everyone; hiding it behind a toggle reduces its visibility

## Install

```bash
node scripts/add.mjs accordion --out ./src/marvelous
```

AI agent with the Marvelous UI MCP server: `install_components({ slugs: ["accordion"], target_dir: "<absolute path>/src/marvelous", framework: "react" })`.

Files copied (dependencies included): `tokens/tokens.css`, `core/base.css`, `core/dom.js`, `core/element.js`, `core/i18n.js`, `components/accordion/accordion.css`, `components/accordion/accordion.js`.

## Usage

Canonical markup, to start from and customize with attributes, `data-*` and CSS variables:

```html
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,20rem),1fr));gap:2.5rem;width:100%;align-items:start">

  <!-- Default + single (native name group) -->
  <mv-accordion type="single">
    <div class="mv-accordion">
      <details class="mv-accordion-item" data-value="shipping" open>
        <summary>How long does shipping take?</summary>
        <div class="mv-accordion-content">
          <p>Orders placed before 2 p.m. ship the same day. Allow 1-2 business days within the continental US and 3-5 business days for Canada and Mexico.</p>
        </div>
      </details>
      <details class="mv-accordion-item" data-value="returns">
        <summary>Can I return an item?</summary>
        <div class="mv-accordion-content">
          <p>Yes, you have 30 days from delivery. The return label is available in your account, and refunds are issued within 5 days.</p>
        </div>
      </details>
      <details class="mv-accordion-item" data-value="payment">
        <summary>Which payment methods do you accept?</summary>
        <div class="mv-accordion-content">
          <p>Credit cards (Visa, Mastercard, American Express), Apple Pay, PayPal and ACH transfer for business accounts.</p>
        </div>
      </details>
      <details class="mv-accordion-item" data-value="invoice">
        <summary>How do I get an invoice?</summary>
        <div class="mv-accordion-content">
          <p>Every invoice is emailed when your order ships and can be downloaded as a PDF from the “Orders” tab.</p>
        </div>
      </details>
    </div>
  </mv-accordion>

  <!-- Bordered, icons + subtitles, plus/minus -->
  <div class="mv-accordion" data-variant="bordered" data-icon="plus">
    <details class="mv-accordion-item" open>
      <summary>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
        <span class="mv-accordion-heading">Account security<span class="mv-accordion-subtitle">Password, two-factor authentication</span></span>
      </summary>
      <div class="mv-accordion-content">
        <p>Turn on two-factor authentication to protect your account: you’ll be asked for a one-time code every time you sign in on a new device.</p>
      </div>
    </details>
    <details class="mv-accordion-item">
      <summary>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
        <span class="mv-accordion-heading">Notifications<span class="mv-accordion-subtitle">Email, mobile, weekly digest</span></span>
      </summary>
      <div class="mv-accordion-content">
        <p>Choose the events you care about: new mentions, comments on your documents or due-date reminders.</p>
      </div>
    </details>
    <details class="mv-accordion-item">
      <summary>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
        <span class="mv-accordion-heading">Billing<span class="mv-accordion-subtitle">Team plan · $228/year</span></span>
      </summary>
      <div class="mv-accordion-content">
        <p>Next charge on Nov 1, 2026 to the card ending in 4242. Invoices remain available for 10 years.</p>
      </div>
    </details>
  </div>

  <!-- Separated -->
  <div class="mv-accordion" data-variant="separated">
    <details class="mv-accordion-item">
      <summary>Can I switch plans mid-year?</summary>
      <div class="mv-accordion-content"><p>Yes, the difference is prorated and appears on your next invoice.</p></div>
    </details>
    <details class="mv-accordion-item" open>
      <summary>Where is my data hosted?</summary>
      <div class="mv-accordion-content"><p>All data is hosted in Virginia and Frankfurt, encrypted at rest and in transit.</p></div>
    </details>
    <details class="mv-accordion-item">
      <summary>Do you offer a nonprofit discount?</summary>
      <div class="mv-accordion-content"><p>Registered nonprofits get 50% off with proof of their nonprofit status.</p></div>
    </details>
  </div>

  <!-- Card + collapsible -->
  <div style="display:grid;gap:1.5rem">
    <mv-accordion type="single">
      <div class="mv-accordion" data-variant="card" data-icon="start">
        <details class="mv-accordion-item" open>
          <summary>Step 1 · Import your contacts</summary>
          <div class="mv-accordion-content"><p>Drop in a CSV file or connect Google Contacts. Duplicates are merged automatically.</p></div>
        </details>
        <details class="mv-accordion-item">
          <summary>Step 2 · Create a segment</summary>
          <div class="mv-accordion-content"><p>Filter by city, sign-up date or last purchase to target your campaigns.</p></div>
        </details>
      </div>
    </mv-accordion>

    <details class="mv-collapsible" style="font-size:.875rem">
      <summary style="display:flex;align-items:center;gap:.5rem;font-weight:500">
        @camille has 3 starred repositories
        <svg class="mv-accordion-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
      </summary>
      <div class="mv-accordion-content" style="display:grid;gap:.5rem;padding-top:.75rem">
        <code style="padding:.5rem .75rem;border:1px solid var(--mv-border);border-radius:var(--mv-radius-md);font-family:var(--mv-font-mono);font-size:.8125rem;color:var(--mv-fg)">marvelous/ui</code>
        <code style="padding:.5rem .75rem;border:1px solid var(--mv-border);border-radius:var(--mv-radius-md);font-family:var(--mv-font-mono);font-size:.8125rem;color:var(--mv-fg)">marvelous/tokens</code>
        <code style="padding:.5rem .75rem;border:1px solid var(--mv-border);border-radius:var(--mv-radius-md);font-family:var(--mv-font-mono);font-size:.8125rem;color:var(--mv-fg)">marvelous/icons</code>
      </div>
    </details>
  </div>
</div>
```

## API

### Attributes

| Name | Type | Default | Description |
|---|---|---|---|
| `type` | single \| multiple | `multiple` | On `<mv-accordion>`: single allows only one open item (native name attribute set automatically, JS fallback). |
| `data-variant` | bordered \| separated \| card | `(simple dividers)` | On .mv-accordion: a single outlined box, separate boxes, or filled tiles where the open item lifts. |
| `data-icon` | chevron \| plus \| start \| none | `chevron` | On .mv-accordion or an item: chevron on the right, plus that turns into minus, chevron before the label, or no indicator. |
| `name` | string |  | Native on `<details>`: same name = exclusive group, no JS. |
| `open` | boolean |  | Native on `<details>`: open on load. |
| `data-value` | string |  | On an item: value reported in mv-change (its index otherwise). |

### Properties

| Name | Type | Description |
|---|---|---|
| `value` | string[] | Values of the open items; assign it to open/close items programmatically. |

### Events

| Name | Description |
|---|---|
| `mv-change` | An item opened or closed. detail: { value: string[], item, open }. |

### Content structure

| Name | Description |
|---|---|
| `details.mv-accordion-item > summary` | Trigger; optional leading `<svg>` icon, .mv-accordion-heading + .mv-accordion-subtitle for a two-line header. |
| `.mv-accordion-content` | Panel content (fade + blur on open). |

### CSS classes

| Name | Description |
|---|---|
| `mv-accordion` | Items container. |
| `mv-accordion-item` | On `<details>`: one accordion item. |
| `mv-accordion-content` | Content panel. |
| `mv-accordion-heading / -subtitle` | Title and subtitle inside the `<summary>`. |
| `mv-collapsible` | Collapsible: a standalone `<details class="mv-collapsible">`, same height animation, free-form `<summary>` (style it yourself, e.g. mv-button). |
| `mv-accordion-chevron` | On an `<svg>` inside a `<summary>`: rotates 180° on open. |

## Accessibility

Built on native `<details>`/`<summary>`: button role, expanded state announced, Enter/Space. `<mv-accordion>` adds Up/Down/Home/End between triggers. Closed content is out of the accessibility tree and still findable with Ctrl+F (opens automatically). Reduced motion: instant open. Browsers without ::details-content: instant open.
