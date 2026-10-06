# Toast `<mv-toaster>`

> Sonner-style stacked notifications: a compact stack that expands on hover, paused timers, swipe to dismiss, promises and in-place updates by id, through an imperative toast() API.

| | |
|---|---|
| Category | Overlays |
| Type | Web Component (`<mv-toaster>`) |
| Status | stable |
| Keywords | toast, sonner, notification, snackbar, swipe, promise, live-region |

## When to use

- Brief feedback must confirm an action, such as Saved or Link copied, without interrupting
- An async operation should show loading, then success or error, in the same notification
- A notification needs an action such as Undo available for a few seconds after a change

**Avoid when**

- The user must make a decision before continuing → use [Dialog](dialog.md) instead

## Install

```bash
node scripts/add.mjs toast --out ./src/marvelous
```

AI agent with the Marvelous UI MCP server: `install_components({ slugs: ["toast"], target_dir: "<absolute path>/src/marvelous", framework: "react" })`.

Files copied (dependencies included): `tokens/tokens.css`, `core/base.css`, `core/element.js`, `core/i18n.js`, `core/motion.js`, `components/toast/toast.js`, `components/toast/toast.css`, `components/toast/toast.d.ts`.

## Usage

Canonical markup, to start from and customize with attributes, `data-*` and CSS variables:

```html
<div id="toast-demo" style="display:grid;gap:1rem;justify-items:center">
  <div style="display:flex;flex-wrap:wrap;gap:.5rem;justify-content:center;max-width:34rem">
    <button class="mv-button" data-variant="outline" data-toast="default">Default</button>
    <button class="mv-button" data-variant="outline" data-toast="success">Success</button>
    <button class="mv-button" data-variant="outline" data-toast="error">Error</button>
    <button class="mv-button" data-variant="outline" data-toast="warning">Warning</button>
    <button class="mv-button" data-variant="outline" data-toast="info">Info</button>
    <button class="mv-button" data-variant="outline" data-toast="promise">Promise</button>
    <button class="mv-button" data-variant="outline" data-toast="update">Update in place</button>
  </div>
  <p style="margin:0;font-size:.8125rem;color:var(--mv-fg-muted);text-align:center">Hover the stack to expand it · swipe a toast to dismiss it · <strong style="color:var(--mv-fg);font-weight:500">Alt + T</strong> to reach it from the keyboard</p>
  <mv-toaster position="bottom-right" close-button></mv-toaster>
</div>
<script type="module">
  // In an app: import { toast } from "./components/toast/toast.js";
  const { toast } = await customElements.whenDefined("mv-toaster");
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const demos = {
    default: () => toast("Event created", {
      description: "Sunday, Dec 6, 2026 at 9:00 AM",
      action: { label: "Undo", onClick: () => toast("Event creation undone") },
    }),
    success: () => toast.success("Changes saved", { description: "Your public profile has been updated." }),
    error: () => toast.error("Couldn't send", {
      description: "The server isn't responding. Check your connection.",
      action: { label: "Retry", onClick: () => demos.promise() },
    }),
    warning: () => toast.warning("Storage almost full", { description: "480 MB left of 15 GB." }),
    info: () => toast.info("New version available", { description: "It will be installed on your next restart." }),
    promise: () => toast.promise(wait(1800), {
      loading: "Importing 24 contacts…",
      success: { message: "24 contacts imported", description: "They now appear in your address book." },
      error: "Import failed",
    }),
    update: async () => {
      const id = "sync-demo";
      for (let i = 1; i <= 3; i++) {
        toast.loading(`Syncing… ${i}/3`, { id, description: "Folder “Client projects”" });
        await wait(900);
      }
      toast.success("Sync complete", { id, description: "3 files updated." });
    },
  };
  document.getElementById("toast-demo").addEventListener("click", (e) => {
    const kind = e.target.closest("[data-toast]")?.dataset.toast;
    if (kind) demos[kind]();
  });
</script>
```

## API

### Attributes

| Name | Type | Default | Description |
|---|---|---|---|
| `position` | top-left \| top-center \| top-right \| bottom-left \| bottom-center \| bottom-right | `bottom-right` | Anchor corner; the stack and swipe direction adapt. |
| `max` | number | `3` | Number of visible toasts (the rest wait, hidden). |
| `duration` | number | `4000` | Default duration (ms). |
| `gap` | number | `14` | Gap between cards when expanded (px). |
| `expand` | boolean |  | Always expanded. |
| `rich-colors` | boolean |  | Tints cards by type. |
| `close-button` | boolean |  | Close button on hover / focus (always visible on touch). |
| `label` | string | `Notifications` | Accessible name of the region. |

### Properties

| Name | Type | Description |
|---|---|---|
| `toasts` | object[] | Read-only: displayed toasts. |
| `region` | HTMLElement \| null | Read-only: the generated `<section class="mv-toaster">` live region, null until the first toast. |
| `strings` | Partial<Record<string, string>> | Overrides for the default text (en-US): regionLabel (accessible name of the region, {label} placeholder for the label attribute), close (close button label when a toast has no closeLabel), loading (toast.promise message when no loading text is given; toast.promise reads it from the target toaster). App-wide translations: setStrings() from core/i18n.js, under the key "toaster". Can be set before the element is defined. |

### Methods

| Name | Description |
|---|---|
| `toast(message, options) → id` | Exported from toast.js (also MvToaster.toast). options: description, type (success \| error \| warning \| info \| loading), action { label, onClick(e, toast) }, cancel { label, onClick }, duration (ms or Infinity), id (same id = in-place update with a small bounce), icon (Node or null), closeButton, dismissible, important, toaster (selector), onDismiss, onAutoClose. Creates an `<mv-toaster>` when needed. SSR (Next, Nuxt, SvelteKit, Astro): import toast.js from a client component and render `<mv-toaster>` on the server as usual; the element adds nothing inside itself until the first toast, so importing it before hydration does not cause a mismatch. |
| `toast.success / .error / .warning / .info / .loading(message, options)` | Typed shortcuts. |
| `toast.promise(promise, { loading, success, error }, options)` | Loading, then success/error in the same card; success/error accept a string, a function of the result or an object { message, description, … }. Returns the promise (with .id). On the very first toast of a page, a promise that settles within 100 ms shows its result directly. |
| `toast.dismiss(id?)` | Dismisses one toast, or all of them. |
| `element.add(options) / element.dismiss(id?)` | Same operations on a specific toaster. |

### Events

| Name | Description |
|---|---|
| `mv-toast` | New toast. detail: { id, type }. |
| `mv-dismiss` | detail: { id, reason } (timeout, swipe, close, escape, action, cancel, dismiss). |

### CSS classes

| Name | Description |
|---|---|
| `mv-toast / -icon / -content / -title / -description / -action / -cancel / -close` | Generated, stylable parts; data-type on .mv-toast. |

### CSS variables

| Name | Default | Description |
|---|---|---|
| `--mv-toast-width` | `22.25rem` | Card width (full width below 600 px). |
| `--mv-toaster-offset` | `1.5rem` | Distance from the screen edges. |
| `--mv-toast-peek` | `12px` | How much each card peeks out in the compact stack. |
| `--mv-toast-bg` |  | Card background. |
| `--mv-toast-radius` |  | Card radius. |

## Accessibility

Section region (implicit role) named “Notifications (Alt+T)”, aria-live=polite (additions and text updates are announced); important:true switches the card to role=alert. The region is created on the first toast (so a server-rendered toaster hydrates cleanly and no empty landmark is listed), and that first toast is inserted 100 ms later, once the screen reader knows the live region; later toasts appear at once. Alt+T moves focus to the latest toast; each card is focusable, Escape dismisses it and focus moves to the next one, then back to the original element. Timers pause on hover, on focus and while the tab is hidden. Animations are reduced automatically (prefers-reduced-motion). Modal dialogs: a modal `<dialog>` makes the rest of the page inert, top layer included, so while one is open the region moves into the topmost modal `<dialog>` (opened with showModal(), mv-dialog and its sheets included) and comes back when it closes; toasts stay visible, clickable, swipeable and reachable with Alt+T, after the dialog content in Tab order. Whenever the region moves (into or out of a modal, or with the element moved in the DOM), cards already on screen lose role=alert, so they are not spoken twice; a card shown in the same task as the move (toast() then showModal()) was never announced, so it is rendered again once the region is known; the next toast waits 100 ms, as the first one does. Known limits: a dialog inside a shadow root, or a modal built without `<dialog>` (aria-modal and a focus trap), is not followed; there, put an mv-toaster inside the modal and target it with the toaster option (toast("Saved", { toaster: "#dialog-toaster" })).
