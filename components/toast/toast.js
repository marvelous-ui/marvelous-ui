import { MvElement, define } from "../../core/element.js";
import { animate, easing, reducedMotion } from "../../core/motion.js";

/** Default text (en-US); override per key with the `strings` property, or app-wide with setStrings() (core/i18n.js). */
const STRINGS = {
  regionLabel: "{label} (Alt+T)",
  close: "Close notification",
  loading: "Loading…",
};

const fill = (template, vars) => String(template ?? "").replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

// Marks a toast whose message is a default text (toast.promise without `loading`): the key in STRINGS.
// A symbol, so it never shows in `toasts` or in the toast objects given to callbacks.
const AUTO = Symbol("mv-toast-auto");

// Static, trusted markup only (never user data).
const svg = (body) =>
  `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
const ICONS = {
  success: svg('<circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/><path d="m8 12.5 2.7 2.7L16.2 9.6" style="stroke:var(--_icon-fg)"/>'),
  error: svg('<circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/><path d="M12 7.5v5.2M12 16.3v.2" style="stroke:var(--_icon-fg)"/>'),
  warning: svg('<path d="M10.3 3.9 2.4 17.6A2 2 0 0 0 4.1 20.6h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" fill="currentColor" stroke="none"/><path d="M12 9v4.2M12 16.8v.2" style="stroke:var(--_icon-fg)"/>'),
  info: svg('<circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/><path d="M12 11v5.3M12 7.7v.2" style="stroke:var(--_icon-fg)"/>'),
  close: svg('<path d="M18 6 6 18M6 6l12 12"/>'),
};

const TYPES = ["default", "success", "error", "warning", "info", "loading"];
const SWIPE_DISTANCE = 45;
const SWIPE_VELOCITY = 0.11; // px per ms
const EXIT_MS = 400;
// A live region inserted in the same task as its content is not announced (screen readers only
// read changes to a region they already know). The region is created on the first toast, so that
// first toast waits this long before it is inserted; later toasts are inserted at once.
const ANNOUNCE_DELAY = 100;

let seq = 0;

/**
 * <mv-toaster position="bottom-right" max="3"></mv-toaster>
 *
 * Toast region rendered in the top layer (popover="manual"). Toasts stack as
 * a collapsed deck, expand on hover/focus, pause while the user interacts and
 * can be swiped away. Use the `toast()` API exported by this module.
 *
 * SSR and hydration: the element leaves its children alone until the first toast.
 * A server-rendered <mv-toaster> (Next, Nuxt, SvelteKit, Astro) therefore keeps the
 * exact markup the server sent, even when this module is imported before hydration.
 *
 * Modal dialogs: a modal <dialog> makes everything outside it inert, top layer included
 * (Chromium, Firefox and WebKit alike), so a region shown above it could be seen but not
 * clicked, focused or read. While a modal is open, the region therefore lives inside the
 * topmost one, and comes back into this element when it closes.
 */
export class MvToaster extends MvElement {
  static props = {
    position: { type: String, default: "bottom-right" },
    max: { type: Number, default: 3 },
    duration: { type: Number, default: 4000 },
    gap: { type: Number, default: 14 },
    expand: Boolean,
    richColors: Boolean,
    closeButton: Boolean,
    label: { type: String, default: "Notifications" },
  };

  #toasts = []; // newest first
  #pending = [];
  #hovering = false;
  #focusWithin = false;
  #dragging = false;
  #paused = false;
  #lastFocus = null;
  #warmup = 0; // timer while a freshly created (or moved) region waits before its next toast
  #mo = null; // watches dialogs opening and closing
  #opened = new WeakMap(); // modal dialog -> when it opened, to find the topmost one
  #openings = 0;
  #away = false; // the region currently lives in a modal dialog, outside this element

  /** The generated <section class="mv-toaster">, or null until the first toast. */
  region = null;
  list = null;

  #strings = {};

  constructor() {
    super();
    // A value set before the element was defined (frameworks do this).
    if (Object.hasOwn(this, "strings")) { const v = this.strings; delete this.strings; this.strings = v; }
  }

  /** Default text merged with overrides: { regionLabel ({label}), close, loading }. */
  get strings() { return { ...STRINGS, ...this.#strings }; }
  set strings(value) {
    this.#strings = value && typeof value === "object" ? { ...value } : {};
    if (this.isMounted) this.#relabel();
  }

  // Re-applies every text that came from strings: region name, default close labels, default messages.
  #relabel() {
    if (!this.region) return;
    this.#syncAttributes();
    const s = this.strings;
    for (const t of this.#live()) {
      const o = t.opts;
      if (o.closeLabel == null) t.el.querySelector(":scope > .mv-toast-close")?.setAttribute("aria-label", s.close);
      if (o[AUTO]) {
        o.message = s[o[AUTO]];
        const title = t.el.querySelector(":scope > .mv-toast-content > .mv-toast-title");
        // Only a real change: rewriting the same text in the live region could be announced again.
        if (title && title.textContent !== (o.message ?? "")) title.textContent = o.message ?? "";
      }
    }
  }

  connected(signal) {
    this.#watch(signal);
    // Document-level listeners only: the toaster's own DOM is untouched until a toast arrives.
    document.addEventListener("visibilitychange", () => this.#sync(), { signal });
    // Alt+T jumps to the notifications (and back with Escape / Tab).
    document.addEventListener("keydown", (e) => {
      if (!e.altKey || e.code !== "KeyT" || !this.#live().length) return;
      e.preventDefault();
      this.#lastFocus = this.region.contains(document.activeElement) ? this.#lastFocus : document.activeElement;
      this.#live()[0].el.focus();
    }, { signal });

    signal.addEventListener("abort", () => {
      for (const t of this.#toasts) clearTimeout(t.timer);
      clearTimeout(this.#warmup);
      this.#warmup = 0;
      try { this.region?.hidePopover(); } catch {}
      // Removed while the region sat in a dialog: bring it back so it leaves with this element.
      if (this.#away) { this.#away = false; this.append(this.region); }
    });

    // Moved in the DOM: the region already exists, show it again (inside a modal if one is open).
    if (this.region) { this.#bindRegion(signal); this.#rehome(); }
    this.#flush();
  }

  // Built lazily, on the first toast. Returns true when it was just created.
  #ensureRegion() {
    if (this.region) return false;
    const r = (this.region = document.createElement("section"));
    r.className = "mv-toaster";
    r.setAttribute("popover", "manual");
    r.setAttribute("aria-live", "polite");
    r.setAttribute("aria-relevant", "additions text");
    r.setAttribute("aria-atomic", "false");
    r.tabIndex = -1;
    // Inside a swipeable sheet (mv-dialog swipe), swiping a toast must not drag the sheet.
    r.setAttribute("data-mv-no-drag", "");
    this.list = document.createElement("ol");
    this.list.className = "mv-toaster-list";
    r.append(this.list);
    const host = this.#host();
    host.append(r);
    this.#setAway(host !== this);
    this.#syncAttributes();
    this.#layout();
    this.#bindRegion(this.signal);
    return true;
  }

  // ── Modal dialogs ─────────────────────────────────────────
  // showModal() and close() toggle the `open` attribute: that is the only signal every engine gives.
  #watch(signal) {
    this.#mo = new MutationObserver((records) => this.#onMutations(records));
    this.#observe();
    signal.addEventListener("abort", () => { this.#mo?.disconnect(); this.#mo = null; }, { once: true });
  }

  #observe() {
    // While the region is inside a dialog, also watch removals: a framework may unmount an open dialog.
    this.#mo?.observe(document.documentElement, { attributes: true, attributeFilter: ["open"], subtree: true, childList: this.#away });
  }

  #onMutations(records) {
    for (const r of records) {
      if (r.type === "attributes" && r.target.localName === "dialog" && r.target.matches(":modal")) {
        this.#opened.set(r.target, ++this.#openings);
      }
    }
    this.#rehome();
  }

  #setAway(away) {
    if (away === this.#away) return;
    this.#away = away;
    this.#observe();
  }

  // Where the region must live: the topmost modal dialog (the rest of the page is inert), or this element.
  #host() {
    let top = null;
    let best = -1;
    // Tree order, then opening order: a modal already open when this toaster connected counts as the oldest.
    for (const d of document.querySelectorAll("dialog:modal")) {
      const n = this.#opened.get(d) ?? 0;
      if (n >= best) { best = n; top = d; }
    }
    return top && !top.contains(this) ? top : this;
  }

  // Moves the region where it can be used. Returns true when it moved.
  #rehome() {
    const r = this.region;
    if (!r || !this.isConnected) return false;
    const host = this.#host();
    if (r.parentNode === host) return false;
    // Cards already on screen were announced; a reinserted role=alert would be spoken a second time.
    for (const t of this.#live()) t.el.removeAttribute("role");
    host.append(r); // removal hides the popover; showing it again puts it above the dialog
    try { r.showPopover(); } catch {}
    this.#setAway(host !== this);
    this.#hovering = this.#focusWithin = false;
    this.#sync();
    // Screen readers rediscover a moved live region: the next toast waits, as for the first one.
    clearTimeout(this.#warmup);
    this.#warmup = setTimeout(() => this.#flush(), ANNOUNCE_DELAY);
    return true;
  }

  #bindRegion(signal) {
    const r = this.region;
    try { r.showPopover(); } catch {}
    r.addEventListener("pointerenter", () => { this.#hovering = true; this.#sync(); }, { signal });
    r.addEventListener("pointerleave", () => { this.#hovering = false; this.#sync(); }, { signal });
    // Only keyboard focus expands/pauses: a mouse click on a card must not pin the stack open.
    r.addEventListener("focusin", (e) => { this.#focusWithin = e.target.matches(":focus-visible"); this.#sync(); }, { signal });
    r.addEventListener("focusout", (e) => {
      if (!r.contains(e.relatedTarget)) { this.#focusWithin = false; this.#sync(); }
    }, { signal });
    r.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      const t = this.#toasts.find((x) => x.el.contains(e.target));
      if (!t) return;
      e.preventDefault();
      this.#remove(t, "escape");
    }, { signal });
  }

  // Inserts the queued toasts, once the element is connected and its region is ready.
  #flush() {
    this.#warmup = 0;
    for (const opts of this.#pending.splice(0)) this.add(opts);
  }

  #queue(options) {
    // A queued toast updated by id (toast.promise settling quickly) stays one entry.
    const i = this.#pending.findIndex((o) => o.id === options.id);
    if (i === -1) this.#pending.push(options);
    else this.#pending[i] = { ...this.#pending[i], ...options };
    if (i !== -1 && !Object.hasOwn(options, AUTO)) delete this.#pending[i][AUTO];
  }

  update(name) {
    this.#syncAttributes();
    if (name === "expand" || name === "max" || name === "gap") this.#sync();
  }

  #syncAttributes() {
    const r = this.region;
    if (!r) return;
    const [y = "bottom", x = "right"] = this.position.split("-");
    r.dataset.y = y === "top" ? "top" : "bottom";
    r.dataset.x = ["left", "center", "right"].includes(x) ? x : "right";
    r.toggleAttribute("data-rich-colors", this.richColors);
    r.setAttribute("aria-label", fill(this.strings.regionLabel, { label: this.label }));
    r.style.setProperty("--_gap", `${this.gap}px`);
  }

  #live() {
    return this.#toasts.filter((t) => !t.removed);
  }

  // ── Public API ────────────────────────────────────────────
  /** Add or update (same id) a toast. Returns its id. */
  add(options = {}) {
    const id = options.id ?? `mv-toast-${++seq}`;
    if (!this.isMounted || !this.isConnected) {
      this.#queue({ ...options, id });
      return id;
    }
    // Pending dialog changes first: `dialog.close(); toast("Saved")` must not land in the closed dialog.
    const records = this.#mo?.takeRecords();
    if (records?.length) this.#onMutations(records);
    else this.#rehome();
    if (this.#ensureRegion() || this.#warmup) {
      this.#queue({ ...options, id });
      this.#warmup ||= setTimeout(() => this.#flush(), ANNOUNCE_DELAY);
      return id;
    }
    const existing = this.#toasts.find((t) => t.id === id && !t.removed);
    if (existing) {
      this.#update(existing, options);
      return id;
    }
    const t = { id, opts: { ...options, id }, el: document.createElement("li"), height: 0, timer: 0, remaining: 0 };
    t.el.className = "mv-toast";
    t.el.tabIndex = 0;
    this.#render(t);
    this.#bindSwipe(t);
    this.#toasts.unshift(t);
    this.list.prepend(t.el);
    this.#bringToFront();
    this.#measure(t);
    this.#layout();
    void t.el.offsetHeight; // commit the entering state before the transition
    t.el.dataset.mounted = "";
    this.#resetTimer(t);
    this.#sync();
    this.emit("toast", { id, type: t.type });
    return id;
  }

  /** Dismiss one toast (or all when `id` is omitted). */
  dismiss(id) {
    // Toasts still waiting to be shown are dropped without being displayed.
    this.#pending = id === undefined ? [] : this.#pending.filter((o) => o.id !== id);
    for (const t of this.#live()) if (id === undefined || t.id === id) this.#remove(t, "dismiss");
  }

  get toasts() {
    return this.#live().map((t) => ({ ...t.opts, type: t.type }));
  }

  // ── Rendering ─────────────────────────────────────────────
  #render(t) {
    const o = t.opts;
    if (o[AUTO]) o.message = this.strings[o[AUTO]];
    t.type = TYPES.includes(o.type) ? o.type : "default";
    t.duration = t.type === "loading" ? Infinity : o.duration ?? this.duration;
    const el = t.el;
    el.dataset.type = t.type;
    // The region is the polite live region; important toasts interrupt as alerts.
    el.setAttribute("aria-atomic", "true");
    if (o.important) el.setAttribute("role", "alert");
    else el.removeAttribute("role");
    el.replaceChildren();

    const iconHTML = t.type === "loading" ? null : ICONS[t.type];
    if (o.icon !== null && (o.icon || iconHTML || t.type === "loading")) {
      const icon = document.createElement("span");
      icon.className = "mv-toast-icon";
      icon.setAttribute("aria-hidden", "true");
      if (o.icon instanceof Node) icon.append(o.icon);
      else if (t.type === "loading") icon.append(Object.assign(document.createElement("span"), { className: "mv-toast-spinner" }));
      else icon.innerHTML = iconHTML;
      el.append(icon);
    }

    const content = document.createElement("div");
    content.className = "mv-toast-content";
    const title = document.createElement("div");
    title.className = "mv-toast-title";
    setContent(title, o.message);
    content.append(title);
    if (o.description) {
      const desc = document.createElement("div");
      desc.className = "mv-toast-description";
      setContent(desc, o.description);
      content.append(desc);
    }
    el.append(content);

    for (const [key, cls] of [["cancel", "mv-toast-cancel"], ["action", "mv-toast-action"]]) {
      const a = o[key];
      if (!a?.label) continue;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = cls;
      btn.textContent = a.label;
      btn.addEventListener("click", (e) => {
        a.onClick?.(e, this.#publicToast(t));
        if (!e.defaultPrevented) this.#remove(t, key);
      });
      el.append(btn);
    }

    if ((o.closeButton ?? this.closeButton) && o.dismissible !== false) {
      const close = document.createElement("button");
      close.type = "button";
      close.className = "mv-toast-close";
      close.setAttribute("aria-label", o.closeLabel ?? this.strings.close);
      close.innerHTML = ICONS.close;
      close.addEventListener("click", () => this.#remove(t, "close"));
      el.append(close);
    }
  }

  #update(t, options) {
    t.opts = { ...t.opts, ...options, id: t.id };
    if (!Object.hasOwn(options, AUTO)) delete t.opts[AUTO];
    const prev = t.height;
    this.#render(t);
    this.#measure(t);
    this.#layout();
    this.#resetTimer(t);
    this.#sync();
    // Subtle bump so the change is noticed (skipped under reduced motion by animate()).
    animate(t.el, [{ scale: 1 }, { scale: prev && t.height !== prev ? 1.015 : 1.03 }, { scale: 1 }], {
      duration: 320,
      easing: easing.out,
      fill: "none",
    });
  }

  #publicToast(t) {
    return { ...t.opts, type: t.type, dismiss: () => this.#remove(t, "dismiss") };
  }

  #measure(t) {
    const el = t.el;
    el.style.height = "auto";
    t.height = el.offsetHeight;
    el.style.height = "";
  }

  // A modal dialog opened after the toaster sits above it in the top layer.
  #bringToFront() {
    const r = this.region;
    if (!document.querySelector("dialog:modal") || !r.matches(":popover-open")) return;
    try { r.hidePopover(); r.showPopover(); } catch {}
  }

  // ── Layout: CSS does the motion, JS feeds it indices and offsets ──
  #layout() {
    const live = this.#live();
    const gap = this.gap;
    let offset = 0;
    live.forEach((t, i) => {
      const s = t.el.style;
      s.setProperty("--i", i);
      s.setProperty("--offset", `${offset}px`);
      s.setProperty("--h", `${t.height}px`);
      s.zIndex = String(live.length - i);
      t.el.toggleAttribute("data-front", i === 0);
      t.el.toggleAttribute("data-hidden", i >= this.max);
      t.el.inert = i >= this.max;
      offset += t.height + gap;
    });
    this.region.style.setProperty("--_front-h", `${live[0]?.height ?? 0}px`);
    this.region.style.setProperty("--_stack-h", `${Math.max(0, offset - gap)}px`);
  }

  #sync() {
    const live = this.#live();
    if (!live.length) this.#hovering = false;
    const expanded = this.expand || this.#hovering || this.#focusWithin || this.#dragging;
    this.region?.toggleAttribute("data-expanded", Boolean(expanded && live.length));
    const paused = this.#hovering || this.#focusWithin || this.#dragging || document.hidden;
    if (paused !== this.#paused) {
      this.#paused = paused;
      for (const t of live) paused ? this.#pauseTimer(t) : this.#startTimer(t);
    }
  }

  // ── Timers ────────────────────────────────────────────────
  #resetTimer(t) {
    clearTimeout(t.timer);
    t.timer = 0;
    t.remaining = t.duration;
    if (!this.#paused) this.#startTimer(t);
  }

  #startTimer(t) {
    if (t.removed || t.timer || !Number.isFinite(t.remaining)) return;
    t.startedAt = performance.now();
    t.timer = setTimeout(() => this.#remove(t, "timeout"), Math.max(0, t.remaining));
  }

  #pauseTimer(t) {
    if (!t.timer) return;
    clearTimeout(t.timer);
    t.timer = 0;
    t.remaining -= performance.now() - t.startedAt;
  }

  // ── Removal ───────────────────────────────────────────────
  #remove(t, reason) {
    if (t.removed) return;
    t.removed = true;
    clearTimeout(t.timer);
    const hadFocus = t.el.contains(document.activeElement) && document.activeElement.matches(":focus-visible");
    t.el.dataset.removed = reason === "swipe" ? "swipe" : "";
    t.el.inert = true;
    this.#layout();
    this.#sync();
    if (hadFocus) {
      const next = this.#live()[0];
      if (next) next.el.focus();
      else if (this.#lastFocus?.isConnected) this.#lastFocus.focus();
      else this.region.focus();
    }
    setTimeout(() => {
      t.el.remove();
      this.#toasts = this.#toasts.filter((x) => x !== t);
    }, reducedMotion() ? 0 : EXIT_MS);
    const pub = this.#publicToast(t);
    if (reason === "timeout") t.opts.onAutoClose?.(pub);
    else t.opts.onDismiss?.(pub);
    this.emit("dismiss", { id: t.id, reason });
  }

  // ── Swipe to dismiss ──────────────────────────────────────
  #bindSwipe(t) {
    const el = t.el;
    let drag = null;
    const dirs = () => {
      const r = this.region.dataset;
      return {
        y: r.y === "top" ? [-1] : [1],
        x: r.x === "left" ? [-1] : r.x === "right" ? [1] : [-1, 1],
      };
    };
    el.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || t.removed || t.opts.dismissible === false) return;
      if (e.target.closest("button, a, input, textarea, select")) return;
      drag = { x: e.clientX, y: e.clientY, t: performance.now(), axis: null, delta: 0, id: e.pointerId };
    });
    el.addEventListener("pointermove", (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      if (!drag.axis) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 4) return;
        drag.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
        el.setPointerCapture(e.pointerId);
        el.dataset.swiping = "";
        this.#dragging = true;
        this.#sync();
      }
      const raw = drag.axis === "x" ? dx : dy;
      const allowed = dirs()[drag.axis].includes(Math.sign(raw));
      // Rubber band against the forbidden direction.
      const value = allowed ? raw : raw / (1.5 + Math.abs(raw) / 20);
      drag.delta = raw;
      drag.allowed = allowed;
      el.style.setProperty("--swipe-x", `${drag.axis === "x" ? value : 0}px`);
      el.style.setProperty("--swipe-y", `${drag.axis === "y" ? value : 0}px`);
    });
    const end = () => {
      if (!drag) return;
      const { axis, delta, allowed } = drag;
      const velocity = Math.abs(delta) / Math.max(1, performance.now() - drag.t);
      drag = null;
      if (!axis) return;
      delete el.dataset.swiping;
      this.#dragging = false;
      if (allowed && (Math.abs(delta) >= SWIPE_DISTANCE || velocity > SWIPE_VELOCITY)) {
        const size = axis === "x" ? el.offsetWidth : el.offsetHeight;
        const out = Math.sign(delta) * (size + 32);
        el.style.setProperty(axis === "x" ? "--swipe-x" : "--swipe-y", `${out}px`);
        this.#remove(t, "swipe");
      } else {
        el.style.setProperty("--swipe-x", "0px");
        el.style.setProperty("--swipe-y", "0px");
      }
      this.#sync();
    };
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
  }
}

function setContent(el, value) {
  if (value instanceof Node) el.append(value);
  else el.textContent = value ?? "";
}

// ── Imperative API ─────────────────────────────────────────
function getToaster(selector) {
  if (typeof document === "undefined") return null;
  let el = document.querySelector(selector ?? "mv-toaster");
  if (!el && !selector) {
    el = document.createElement("mv-toaster");
    document.body.append(el);
  }
  return el;
}

/**
 * toast("Saved", { description, type, action: { label, onClick }, cancel, duration, id, icon,
 *                       closeButton, dismissible, important, toaster, onDismiss, onAutoClose })
 * Returns the toast id. Calling again with the same `id` updates it in place.
 */
export function toast(message, options = {}) {
  const toaster = getToaster(options.toaster);
  if (!toaster || typeof toaster.add !== "function") return options.id ?? null;
  return toaster.add({ ...options, message });
}

for (const type of ["success", "error", "warning", "info", "loading"]) {
  toast[type] = (message, options = {}) => toast(message, { ...options, type });
}

/** Dismiss a toast by id, or every toast when omitted. */
toast.dismiss = (id, { toaster } = {}) => {
  if (typeof document === "undefined") return;
  const targets = toaster ? [document.querySelector(toaster)] : document.querySelectorAll("mv-toaster");
  for (const el of targets) el?.dismiss?.(id);
};

/**
 * toast.promise(promise, { loading, success, error, description? }, options?)
 * `success` / `error` can be strings, functions of the result, or option objects ({ message, description, … }).
 * Resolves/rejects like the original promise; the toast id is available as `.id` on the returned promise.
 */
toast.promise = (promise, messages = {}, options = {}) => {
  const p = typeof promise === "function" ? promise() : promise;
  // Without a `loading` message, the toaster's default text (its strings, in its language) is used.
  const auto = messages.loading == null ? { [AUTO]: "loading" } : null;
  const loading = auto ? getToaster(options.toaster)?.strings?.loading ?? STRINGS.loading : messages.loading;
  const id = toast(loading, { ...options, type: "loading", description: messages.description, ...auto });
  const settle = (type, value) => {
    let out = messages[type];
    if (typeof out === "function") out = out(value);
    if (out === undefined || out === null) return toast.dismiss(id);
    const opts = typeof out === "object" && !(typeof Node !== "undefined" && out instanceof Node) ? out : { message: out };
    toast(opts.message, { ...options, description: undefined, ...opts, id, type });
  };
  const result = Promise.resolve(p).then(
    (value) => { settle("success", value); return value; },
    (err) => { settle("error", err); throw err; },
  );
  result.catch(() => {}); // the caller may not handle rejections
  result.id = id;
  return result;
};

MvToaster.toast = toast;

define("mv-toaster", MvToaster);
