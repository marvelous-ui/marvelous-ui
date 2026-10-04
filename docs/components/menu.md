# Menu `<mv-menu>`

> Full-featured dropdown menu: checkboxes, radio items, submenus with a safe-triangle, shortcuts, typeahead and APG keyboard navigation; opt-in data-motion="glide" (opens from the trigger’s corner, a single highlight that glides between items, submenus that slide in).

| | |
|---|---|
| Category | Overlays |
| Type | Web Component (`<mv-menu>`) |
| Status | stable |
| Also installs | [popover](popover.md) |
| Keywords | dropdown, dropdown-menu, menu-button, submenu, typeahead, checkbox, radio, animated-dropdown, glide, highlight-pill |

## When to use

- A button opens a list of actions, such as a row's Edit, Duplicate and Delete
- Actions need checkable items, radio groups, shortcuts or nested submenus
- An account or overflow menu must open from a trigger with full keyboard and typeahead support

**Avoid when**

- The user is choosing a value to submit with a form → use [Select](select.md) instead
- The panel holds a form or rich interactive content rather than a list of actions → use [Popover](popover.md) instead

## Install

```bash
node scripts/add.mjs menu --out ./src/marvelous
```

AI agent with the Marvelous UI MCP server: `install_components({ slugs: ["menu"], target_dir: "<absolute path>/src/marvelous", framework: "react" })`.

Files copied (dependencies included): `tokens/tokens.css`, `core/base.css`, `core/dom.js`, `core/element.js`, `core/focus.js`, `core/i18n.js`, `core/motion.js`, `core/position.js`, `core/svg.js`, `components/popover/popover.js`, `components/popover/popover.css`, `core/dismiss.js`, `components/menu/menu.js`, `components/menu/menu.css`.

## Usage

Canonical markup, to start from and customize with attributes, `data-*` and CSS variables:

```html
<div id="menu-demo" style="display:grid;gap:1.25rem;justify-items:center">
  <div style="display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center">
    <mv-menu>
      <button class="mv-button" data-variant="outline">My account
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
      </button>
      <div data-content style="--mv-menu-width:14rem">
        <div class="mv-menu-label">Maya Chen</div>
        <button role="menuitem" value="profile">Profile <span class="mv-menu-shortcut">⇧⌘P</span></button>
        <button role="menuitem" value="billing">Billing <span class="mv-menu-shortcut">⌘B</span></button>
        <button role="menuitem" value="settings">Settings <span class="mv-menu-shortcut">⌘,</span></button>
        <hr>
        <button role="menuitem" value="team">Team</button>
        <div data-submenu>
          <button role="menuitem">Invite members</button>
          <div data-content>
            <button role="menuitem" value="invite-email">By email</button>
            <button role="menuitem" value="invite-link">Copy invite link</button>
            <hr>
            <button role="menuitem" value="invite-more">More options…</button>
          </div>
        </div>
        <button role="menuitem" value="new-team">New team <span class="mv-menu-shortcut">⌘T</span></button>
        <hr>
        <button role="menuitem" value="support">Support</button>
        <button role="menuitem" value="api" disabled>API</button>
        <hr>
        <button role="menuitem" value="logout">Log out <span class="mv-menu-shortcut">⇧⌘Q</span></button>
      </div>
    </mv-menu>

    <mv-menu>
      <button class="mv-button" data-variant="outline">View</button>
      <div data-content style="--mv-menu-width:13rem">
        <div class="mv-menu-label" data-inset>Interface</div>
        <button role="menuitemcheckbox" aria-checked="true" value="status-bar" data-keep-open>Status bar</button>
        <button role="menuitemcheckbox" value="minimap" data-keep-open>Minimap</button>
        <button role="menuitemcheckbox" value="activity" aria-disabled="true">Activity panel</button>
        <hr>
        <div role="group" data-name="position">
          <div class="mv-menu-label" data-inset>Panel position</div>
          <button role="menuitemradio" value="top">Top</button>
          <button role="menuitemradio" value="bottom" aria-checked="true">Bottom</button>
          <button role="menuitemradio" value="right">Right</button>
        </div>
      </div>
    </mv-menu>

    <mv-menu placement="bottom-end">
      <button class="mv-button" data-variant="ghost" data-size="icon" aria-label="File actions">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>
      </button>
      <div data-content>
        <button role="menuitem" value="rename"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.4 3.6a2 2 0 0 1 2.9 2.9L7 18.8 3 20l1.2-4z"/></svg>Rename</button>
        <button role="menuitem" value="duplicate"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M4 16V5a1 1 0 0 1 1-1h11"/></svg>Duplicate <span class="mv-menu-shortcut">⌘D</span></button>
        <button role="menuitem" value="archive"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="5" rx="1"/><path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9M10 13h4"/></svg>Archive</button>
        <hr>
        <button role="menuitem" value="delete" data-variant="destructive"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>Delete <span class="mv-menu-shortcut">⌫</span></button>
      </div>
    </mv-menu>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center;align-items:center">
    <span style="font-size:.75rem;color:var(--mv-fg-muted)">data-motion="glide":</span>
    <mv-menu data-motion="glide">
      <button class="mv-button" data-variant="secondary">Project
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
      </button>
      <div data-content style="--mv-menu-width:14.5rem">
        <button role="menuitem" value="open"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>Open <span class="mv-menu-shortcut">⌘O</span></button>
        <button role="menuitem" value="rename"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.4 3.6a2 2 0 0 1 2.9 2.9L7 18.8 3 20l1.2-4z"/></svg>Rename</button>
        <div data-submenu>
          <button role="menuitem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13"/></svg>Export</button>
          <div data-content>
            <button role="menuitem" value="export-pdf">PDF</button>
            <button role="menuitem" value="export-png">PNG image</button>
            <button role="menuitem" value="export-csv">CSV spreadsheet</button>
          </div>
        </div>
        <hr>
        <div role="group" data-name="view">
          <div class="mv-menu-label" data-inset>View</div>
          <button role="menuitemradio" value="list" aria-checked="true" data-keep-open>List</button>
          <button role="menuitemradio" value="board" data-keep-open>Board</button>
          <button role="menuitemradio" value="calendar" data-keep-open>Calendar</button>
        </div>
        <hr>
        <button role="menuitem" value="trash" data-variant="destructive"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>Move to trash</button>
      </div>
    </mv-menu>
    <mv-menu data-motion="glide" placement="top-end">
      <button class="mv-button" data-variant="outline">Opens upward</button>
      <div data-content>
        <button role="menuitem" value="duplicate">Duplicate</button>
        <button role="menuitem" value="move">Move…</button>
        <button role="menuitem" value="pin">Pin to top</button>
      </div>
    </mv-menu>
  </div>
  <p data-role="out" aria-live="polite" style="margin:0;font-size:.8125rem;color:var(--mv-fg-muted)">Pick an action…</p>
</div>
<script type="module">
  const root = document.getElementById("menu-demo");
  const out = root.querySelector('[data-role="out"]');
  root.addEventListener("mv-select", (e) => {
    const { label, checked } = e.detail;
    out.textContent = checked === undefined ? `Action: ${label}` : `${label}: ${checked ? "on" : "off"}`;
  });
</script>
```

## API

### Attributes

| Name | Type | Default | Description |
|---|---|---|---|
| `placement` | top \| bottom \| left \| right[-start\|-end] | `bottom-start` | Panel position relative to the trigger (automatic flip/shift). |
| `offset` | number | `6` | Distance from the trigger (px). |
| `open` | boolean |  | Opens/closes programmatically (reflects the state). |
| `data-motion` | "glide" |  | Opt-in (on mv-menu, mv-context-menu or an ancestor): the panel blooms from the corner closest to the trigger (based on data-side / data-align), a single highlight pill glides from item to item (hover and keyboard) instead of per-item backgrounds, and submenus slide out from their row. Without the attribute, rendering is unchanged. |

### Properties

| Name | Type | Description |
|---|---|---|
| `isOpen` | boolean | Read-only. |
| `menu` | MenuPanel | Reusable engine (class exported by menu.js, used by Context Menu). |

### Methods

| Name | Description |
|---|---|
| `show({ focus })` | Opens; focus = "first" \| "last" \| "panel". |
| `hide({ focus })` | Closes every level; focus=true returns focus to the trigger. |

### Events

| Name | Description |
|---|---|
| `mv-select` | Cancelable (preventDefault keeps the menu open). detail: { value, label, item, checked?, group? }. |
| `mv-open` | After opening. |
| `mv-close` | After closing. |

### Content structure

| Name | Description |
|---|---|
| `first child` | Trigger: aria-haspopup=menu, aria-expanded and aria-controls are set automatically. |
| `[data-content]` | Menu panel (role=menu). |
| `<button role=menuitem>` | Action item; value (or data-value) → detail.value; disabled or aria-disabled; data-variant="destructive". |
| `role=menuitemcheckbox / menuitemradio` | Checkable items (aria-checked). Radios are exclusive within their [role=group] (data-name → detail.group). |
| `[data-keep-open]` | On an item: keeps the menu open after selection. |
| `[data-submenu]` | Wraps a menuitem trigger + a nested [data-content]: submenu (hover, → / ←). Items, groups, separators and submenus added later (async lists) are enhanced automatically. |
| `<hr>` | Separator. |

### CSS classes

| Name | Description |
|---|---|
| `mv-menu-label` | Group label; data-inset aligns it with checkable items. |
| `mv-menu-shortcut` | Right-aligned shortcut hint (ignored by typeahead). |
| `mv-menu-header` | Free-form header block (avatar + name…). |
| `mv-menu-pill` | Highlight pill created by the engine in glide mode (aria-hidden); tinted red on a destructive item. Uses --mv-menu-highlight. |

### CSS variables

| Name | Default | Description |
|---|---|---|
| `--mv-menu-width` | `auto` | Fixed panel width. |
| `--mv-menu-min-width` | `11rem` | Minimum width. |
| `--mv-menu-item-height` | `2rem` | Minimum item height. |
| `--mv-menu-highlight` |  | Active item background. |
| `--mv-menu-bg` |  | Panel background. |
| `--mv-menu-radius` |  | Panel corner radius. |

## Accessibility

APG “Menu Button” and “Menu” patterns: Enter/Space/↓ open on the first item, ↑ on the last; ↑↓ Home/End navigate (roving focus, wrapping), letters trigger typeahead (accent-insensitive), → opens a submenu and ← closes it, Escape closes and returns focus to the trigger, Tab closes and continues tabbing. aria-checked on checkable items, aria-expanded on submenu triggers. Hover moves focus (like Radix).
