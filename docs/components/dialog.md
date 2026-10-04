# Dialog `<mv-dialog>`

> Animated native `<dialog>` modal; also covers Alert Dialog (persistent), Sheet (4 sides) and a mobile Drawer with swipe to close.

| | |
|---|---|
| Category | Overlays |
| Type | Web Component (`<mv-dialog>`) |
| Status | stable |
| Keywords | modal, dialog, alert-dialog, confirm, sheet, drawer, side-panel, slide-over, swipe |

## When to use

- A blocking confirmation is needed before a destructive or irreversible action
- A short form or detail view must stay in context without leaving the page
- A side sheet must slide in from an edge for settings, filters or a cart
- On mobile, a bottom drawer the user can swipe away fits better than a centered modal

**Avoid when**

- The message is transient feedback that shouldn't interrupt the user → use [Toast](toast.md) instead
- The content is a small panel anchored to a trigger that shouldn't block the page → use [Popover](popover.md) instead
- The flow has many steps or needs its own URL; use a dedicated page instead

## Install

```bash
node scripts/add.mjs dialog --out ./src/marvelous
```

AI agent with the Marvelous UI MCP server: `install_components({ slugs: ["dialog"], target_dir: "<absolute path>/src/marvelous", framework: "react" })`.

Files copied (dependencies included): `tokens/tokens.css`, `core/base.css`, `core/dom.js`, `core/element.js`, `core/i18n.js`, `core/motion.js`, `components/dialog/dialog.js`, `components/dialog/dialog.css`.

## Usage

Canonical markup, to start from and customize with attributes, `data-*` and CSS variables:

```html
<div style="display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center">
  <mv-dialog>
    <button class="mv-button" data-mv-open>Edit profile</button>
    <dialog>
      <button class="mv-dialog-close" data-mv-close aria-label="Close"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
      <header class="mv-dialog-header">
        <h2 class="mv-dialog-title">Edit profile</h2>
        <p class="mv-dialog-description">Changes are saved when you click Save.</p>
      </header>
      <form method="dialog" style="display:grid;gap:.75rem">
        <label style="display:grid;gap:.35rem;font-size:.875rem">Name
          <input class="mv-input" value="Ada Lovelace">
        </label>
        <div class="mv-dialog-footer">
          <button type="button" class="mv-button" data-variant="outline" data-mv-close>Cancel</button>
          <button class="mv-button" value="save">Save</button>
        </div>
      </form>
    </dialog>
  </mv-dialog>

  <mv-dialog persistent>
    <button class="mv-button" data-variant="destructive" data-mv-open>Delete…</button>
    <dialog style="--mv-dialog-width:26rem">
      <header class="mv-dialog-header">
        <h2 class="mv-dialog-title">Delete project?</h2>
        <p class="mv-dialog-description">This action can’t be undone. All data will be lost.</p>
      </header>
      <div class="mv-dialog-footer">
        <button class="mv-button" data-variant="outline" data-mv-close="cancel">Cancel</button>
        <button class="mv-button" data-variant="destructive" data-mv-close="confirm">Delete</button>
      </div>
    </dialog>
  </mv-dialog>

  <mv-dialog>
    <button class="mv-button" data-variant="outline" data-mv-open>Side panel</button>
    <dialog data-variant="sheet" data-side="right">
      <button class="mv-dialog-close" data-mv-close aria-label="Close"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
      <header class="mv-dialog-header">
        <h2 class="mv-dialog-title">Filters</h2>
        <p class="mv-dialog-description">Slides in from the right.</p>
      </header>
    </dialog>
  </mv-dialog>

  <mv-dialog swipe>
    <button class="mv-button" data-variant="outline" data-mv-open>Mobile drawer</button>
    <dialog data-variant="sheet" data-side="bottom">
      <header class="mv-dialog-header">
        <h2 class="mv-dialog-title">Drawer</h2>
        <p class="mv-dialog-description">Swipe down to close it.</p>
      </header>
      <div style="height:30vh"></div>
    </dialog>
  </mv-dialog>
</div>
```

## API

### Attributes

| Name | Type | Description |
|---|---|---|
| `open` | boolean | Opens/closes the modal. |
| `persistent` | boolean | Alert mode: no closing via Escape or outside click, role=alertdialog (follows later changes). |
| `swipe` | boolean | Swipe to close (sheets / drawers); can be turned on or off at any time. |

### Methods

| Name | Description |
|---|---|
| `show()` | Opens as a modal. |
| `close(returnValue?)` | Closes with a return value. |

### Events

| Name | Description |
|---|---|
| `mv-before-open` | Cancelable (preventDefault). |
| `mv-open` | After opening. |
| `mv-close` | detail.returnValue: value of the [data-mv-close] button, or “dismiss” / “swipe”. |

### Content structure

| Name | Description |
|---|---|
| `[data-mv-open]` | Internal trigger; for an external one: data-mv-open="#id". |
| `<dialog>` | Content; data-variant="sheet" + data-side="right\|left\|top\|bottom". May be rendered or replaced after the element connects (Angular, a late v-if): it is looked up when needed, and a pending open applies once it exists. |
| `[data-mv-close]` | Closes; its value becomes returnValue. |

### CSS classes

| Name | Description |
|---|---|
| `mv-dialog-header / -title / -description / -footer / -close` | Content layout. |

### CSS variables

| Name | Default | Description |
|---|---|---|
| `--mv-dialog-width` | `30rem` | Width (sheet: 24rem). |
| `--mv-dialog-radius` |  | Radius. |
| `--mv-dialog-backdrop-blur` | `3px` | Backdrop blur. |

## Accessibility

Focus trapped and restored by the native `<dialog>`, inert page, Escape. aria-labelledby/-describedby wired automatically from .mv-dialog-title / .mv-dialog-description, checked again at each opening so a title rendered late by a framework is still used.
