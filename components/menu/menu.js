import { MvElement, define } from "../../core/element.js";
import { roving } from "../../core/focus.js";
import { dismissable } from "../../core/dismiss.js";
import { ensureId } from "../../core/dom.js";
import { anchorFloating } from "../popover/popover.js";

const ITEM = '[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]';
const SUB_OPEN_DELAY = 90;
const GRACE_MS = 350;
const TYPEAHEAD_RESET = 600;

const normalize = (s) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();

/** Visible label of an item, without its shortcut hint. */
function itemLabel(item) {
  if (item.dataset.label) return item.dataset.label;
  let text = "";
  for (const node of item.childNodes) {
    if (node.nodeType === 1 && node.matches(".mv-menu-shortcut, [aria-hidden='true'], svg, mv-icon")) continue;
    text += node.textContent;
  }
  return text.replace(/\s+/g, " ").trim();
}

const isDisabled = (el) => el.disabled || el.getAttribute("aria-disabled") === "true";

function inTriangle([px, py], [ax, ay], [bx, by], [cx, cy]) {
  const d1 = (px - bx) * (ay - by) - (ax - bx) * (py - by);
  const d2 = (px - cx) * (by - cy) - (bx - cx) * (py - cy);
  const d3 = (px - ax) * (cy - ay) - (cx - ax) * (py - ay);
  const neg = d1 < 0 || d2 < 0 || d3 < 0;
  const pos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(neg && pos);
}

/**
 * MenuPanel: the reusable menu engine shared by <mv-menu> and <mv-context-menu>.
 *
 * Owns one `[data-content]` panel: ARIA roles, top-layer display
 * (popover="manual"), positioning, roving focus, typeahead, check/radio
 * items, pointer highlight and nested submenus (`[data-submenu]` wrappers).
 *
 *   const menu = new MenuPanel(panel, {
 *     onSelect(item, detail) { return true },   // false keeps the menu open
 *     onDismiss(reason) {},                       // root asks to close everything
 *   });
 *   menu.connect(signal);
 *   menu.open({ anchor, placement, offset, focus: "first" | "last" | "panel" });
 */
export class MenuPanel {
  constructor(panel, { parent = null, trigger = null, onSelect, onDismiss } = {}) {
    this.panel = panel;
    this.parent = parent;
    this.trigger = trigger;
    this.onSelect = onSelect;
    this.onDismiss = onDismiss;
    this.subs = new Map(); // trigger item → MenuPanel
    this.openSub = null;
    this.#setup();
  }

  get root() {
    let m = this;
    while (m.parent) m = m.parent;
    return m;
  }

  get isOpen() {
    return this.panel.matches(":popover-open");
  }

  /** Enabled, visible items of this panel (excludes nested submenu items). */
  items() {
    return [...this.panel.querySelectorAll(ITEM)].filter((el) => el.closest(".mv-menu") === this.panel && !el.hidden);
  }

  #setup() {
    const p = this.panel;
    p.classList.add("mv-menu");
    p.setAttribute("role", "menu");
    p.setAttribute("popover", "manual");
    p.tabIndex = -1;
    p.inert = true;
    ensureId(p, "mv-menu");
    if (this.trigger) p.setAttribute("aria-labelledby", ensureId(this.trigger, "mv-menu-trigger"));
    this.#enhance();
  }

  /** Items, groups, separators and submenus of this panel. Reruns on items added later and skips the ones done. */
  #enhance() {
    const p = this.panel;
    for (const el of p.querySelectorAll(ITEM)) {
      // Done items keep their state: roving() owns their tabIndex once the menu is live.
      if (el.closest("[data-content]") !== p || el.classList.contains("mv-menu-item")) continue;
      el.classList.add("mv-menu-item");
      if (el.localName === "button" && !el.hasAttribute("type")) el.type = "button";
      el.tabIndex = -1;
      if (el.matches('[role="menuitemcheckbox"], [role="menuitemradio"]') && !el.hasAttribute("aria-checked")) {
        el.setAttribute("aria-checked", "false");
      }
    }
    for (const group of p.querySelectorAll('[role="group"]')) {
      const label = group.querySelector(":scope > .mv-menu-label");
      if (label && !group.hasAttribute("aria-labelledby") && !group.hasAttribute("aria-label")) {
        group.setAttribute("aria-labelledby", ensureId(label, "mv-menu-label"));
      }
    }
    for (const hr of p.querySelectorAll(":scope > hr, :scope > [role='group'] > hr")) {
      hr.classList.add("mv-menu-separator");
    }

    for (const wrap of p.querySelectorAll("[data-submenu]")) {
      if (wrap.closest("[data-content]") !== p) continue;
      const trigger = wrap.querySelector(`:scope > :is(${ITEM})`);
      const content = wrap.querySelector(":scope > [data-content]");
      if (!trigger || !content || this.subs.get(trigger)?.panel === content) continue;
      trigger.classList.add("mv-menu-sub-trigger");
      trigger.setAttribute("aria-haspopup", "menu");
      trigger.setAttribute("aria-expanded", "false");
      trigger.setAttribute("aria-controls", ensureId(content, "mv-menu"));
      const sub = new MenuPanel(content, { parent: this, trigger, onSelect: this.onSelect, onDismiss: this.onDismiss });
      content.dataset.sub = "";
      this.subs.set(trigger, sub);
    }
  }

  #rove = null;
  #typed = "";
  #typedTimer = 0;
  #subTimer = 0;
  #grace = null;
  #session = null;

  /** Bind listeners while `signal` is alive (call from the host's connected()). */
  connect(signal) {
    const p = this.panel;
    this.#rove = roving(p, () => this.items(), { orientation: "vertical", loop: true, signal });
    p.addEventListener("keydown", (e) => this.#onKeydown(e), { signal });
    p.addEventListener("click", (e) => this.#onClick(e), { signal });
    p.addEventListener("pointermove", (e) => this.#onPointerMove(e), { signal });
    p.addEventListener("pointerleave", (e) => this.#onPointerLeave(e), { signal });
    // data-motion="glide": one highlight pill follows the active row.
    p.addEventListener("focusin", () => { cancelAnimationFrame(this.#pillRaf); this.#syncPill(); }, { signal });
    p.addEventListener("focusout", () => {
      cancelAnimationFrame(this.#pillRaf);
      this.#pillRaf = requestAnimationFrame(() => this.#syncPill());
    }, { signal });
    for (const [trigger, sub] of this.subs) this.#connectSub(trigger, sub, signal);
    // Items rendered later (async lists) get the same roles, classes and submenus.
    const mo = new MutationObserver(() => {
      // A submenu whose trigger or panel left the DOM is unbound, so a re-render can wire it again.
      for (const [trigger, sub] of this.subs) if (!p.contains(trigger) || !p.contains(sub.panel)) this.#dropSub(trigger);
      this.#enhance();
      for (const [trigger, sub] of this.subs) if (!this.#subCtl.has(trigger)) this.#connectSub(trigger, sub, signal);
    });
    mo.observe(p, { childList: true, subtree: true });
    signal.addEventListener("abort", () => {
      mo.disconnect();
      clearTimeout(this.#subTimer);
      clearTimeout(this.#typedTimer);
      cancelAnimationFrame(this.#pillRaf);
      this.close();
    });
  }

  #subCtl = new Map(); // trigger → AbortController of that submenu's listeners

  #connectSub(trigger, sub, signal) {
    const ctl = new AbortController();
    signal.addEventListener("abort", () => ctl.abort(), { once: true, signal: ctl.signal });
    this.#subCtl.set(trigger, ctl);
    sub.connect(ctl.signal);
    trigger.addEventListener("pointerleave", (e) => this.#armGrace(e, sub), { signal: ctl.signal });
  }

  #dropSub(trigger) {
    const sub = this.subs.get(trigger);
    if (this.openSub === sub) this.openSub = null;
    this.#subCtl.get(trigger)?.abort();
    this.#subCtl.delete(trigger);
    this.subs.delete(trigger);
  }

  /** Opt-in motion (`data-motion="glide"` on the host or any ancestor). */
  get glide() {
    return Boolean(this.panel.closest('[data-motion="glide"]'));
  }

  // ── Glide highlight ───────────────────────────────────────
  #pill = null;
  #pillRaf = 0;

  #syncPill() {
    const p = this.panel;
    if (!this.glide) {
      this.#pill?.removeAttribute("data-visible");
      return;
    }
    if (!this.#pill) {
      this.#pill = document.createElement("span");
      this.#pill.className = "mv-menu-pill";
      this.#pill.setAttribute("aria-hidden", "true");
      p.prepend(this.#pill);
    }
    const pill = this.#pill;
    const active = document.activeElement;
    let target = this.isOpen && active !== p && active?.closest?.(ITEM) && active.closest(".mv-menu") === p ? active.closest(ITEM) : null;
    if (!target && this.openSub) target = this.openSub.trigger;
    if (!target || !this.isOpen) {
      pill.removeAttribute("data-visible");
      return;
    }
    // Layout offsets (not rects): the panel may still be scaling in.
    let x = 0;
    let y = 0;
    let el = target;
    while (el && el !== p) {
      x += el.offsetLeft;
      y += el.offsetTop;
      el = el.offsetParent;
    }
    if (el !== p) {
      const pr = p.getBoundingClientRect();
      const r = target.getBoundingClientRect();
      x = r.left - pr.left - p.clientLeft + p.scrollLeft;
      y = r.top - pr.top - p.clientTop + p.scrollTop;
    }
    const snap = !pill.hasAttribute("data-visible");
    pill.toggleAttribute("data-snap", snap);
    pill.dataset.variant = target.dataset.variant ?? "";
    pill.style.translate = `${x}px ${y}px`;
    pill.style.width = `${target.offsetWidth}px`;
    pill.style.height = `${target.offsetHeight}px`;
    if (snap) pill.getBoundingClientRect();
    pill.removeAttribute("data-snap");
    pill.setAttribute("data-visible", "");
  }

  /**
   * Show the panel anchored to `anchor` (element or virtual rect).
   * focus: "first" | "last" | "panel" | null
   */
  open({ anchor, placement = "bottom-start", offset = 6, alignOffset = 0, focus = "panel" } = {}) {
    const p = this.panel;
    if (!this.isOpen) {
      p.inert = false;
      try { p.showPopover(); } catch { p.inert = true; return false; }
      p.dataset.state = "open";
      this.trigger?.setAttribute("aria-expanded", "true");
    }
    this.#session?.abort();
    this.#session = new AbortController();
    if (anchor) anchorFloating(p, anchor, { placement, offset, alignOffset }, this.#session.signal);
    this.#focus(focus);
    return true;
  }

  close() {
    clearTimeout(this.#subTimer);
    this.#grace = null;
    this.openSub?.close();
    this.openSub = null;
    this.#session?.abort();
    this.#session = null;
    const p = this.panel;
    this.#pill?.removeAttribute("data-visible");
    if (!this.isOpen) return;
    p.inert = true;
    p.dataset.state = "closed";
    this.trigger?.setAttribute("aria-expanded", "false");
    try { p.hidePopover(); } catch {}
  }

  /** Session signal (aborted when the panel closes). */
  get session() {
    return this.#session?.signal;
  }

  #focus(where) {
    if (!where) return;
    const items = this.items().filter((el) => !isDisabled(el));
    const target = where === "first" ? items[0] : where === "last" ? items.at(-1) : null;
    if (target) this.#rove.focus(target);
    else this.panel.focus({ preventScroll: true });
  }

  #ownEvent(e) {
    return e.target === this.panel || e.target.closest?.(".mv-menu") === this.panel;
  }

  #item(e) {
    const item = e.target.closest?.(ITEM);
    return item && item.closest(".mv-menu") === this.panel ? item : null;
  }

  // ── Submenus ──────────────────────────────────────────────
  #openSub(trigger, focus) {
    const sub = this.subs.get(trigger);
    if (!sub || isDisabled(trigger)) return;
    if (this.openSub && this.openSub !== sub) this.openSub.close();
    this.openSub = sub;
    sub.open({ anchor: trigger, placement: "right-start", offset: 4, alignOffset: -5, focus });
  }

  #closeSub() {
    clearTimeout(this.#subTimer);
    this.openSub?.close();
    this.openSub = null;
  }

  // Safe triangle between the pointer and the submenu's near edge.
  #armGrace(e, sub) {
    if (this.openSub !== sub || !sub.isOpen) return;
    const r = sub.panel.getBoundingClientRect();
    const right = r.left >= e.clientX;
    const edge = right ? r.left : r.right;
    const apex = [e.clientX + (right ? -3 : 3), e.clientY];
    this.#grace = { poly: [apex, [edge, r.top - 8], [edge, r.bottom + 8]], until: performance.now() + GRACE_MS };
  }

  #inGrace(e) {
    const g = this.#grace;
    if (!g) return false;
    if (performance.now() > g.until || !inTriangle([e.clientX, e.clientY], ...g.poly)) {
      this.#grace = null;
      return false;
    }
    return true;
  }

  // ── Events ────────────────────────────────────────────────
  #onPointerMove(e) {
    if (e.pointerType === "touch" || !this.#ownEvent(e)) return;
    if (this.#inGrace(e)) return;
    const item = this.#item(e);
    if (!item || isDisabled(item)) {
      if (!this.openSub && document.activeElement !== this.panel && this.panel.contains(document.activeElement)) {
        this.panel.focus({ preventScroll: true });
      }
      return;
    }
    if (document.activeElement !== item) this.#rove.focus(item);
    clearTimeout(this.#subTimer);
    if (this.subs.has(item)) {
      if (this.openSub !== this.subs.get(item)) this.#subTimer = setTimeout(() => this.#openSub(item, null), SUB_OPEN_DELAY);
    } else if (this.openSub) {
      this.#subTimer = setTimeout(() => this.#closeSub(), SUB_OPEN_DELAY);
    }
  }

  #onPointerLeave(e) {
    if (e.pointerType === "touch" || this.openSub) return;
    clearTimeout(this.#subTimer);
    if (this.panel.contains(document.activeElement) && document.activeElement !== this.panel) {
      this.panel.focus({ preventScroll: true });
    }
  }

  #onClick(e) {
    if (!this.#ownEvent(e)) return;
    const item = this.#item(e);
    if (!item) return;
    e.preventDefault();
    if (isDisabled(item)) return;
    if (this.subs.has(item)) {
      clearTimeout(this.#subTimer);
      this.#openSub(item, e.detail === 0 ? "first" : null);
      return;
    }
    this.activate(item);
  }

  /** Run an item: toggle check/radio state, emit through onSelect, close unless kept open. */
  activate(item) {
    const role = item.getAttribute("role");
    let checked;
    if (role === "menuitemcheckbox") {
      checked = item.getAttribute("aria-checked") !== "true";
      item.setAttribute("aria-checked", String(checked));
    } else if (role === "menuitemradio") {
      const scope = item.closest('[role="group"]') ?? this.panel;
      for (const r of scope.querySelectorAll('[role="menuitemradio"]')) {
        if (r.closest(".mv-menu") === this.panel) r.setAttribute("aria-checked", String(r === item));
      }
      checked = true;
    }
    const detail = {
      value: item.value || item.dataset.value || itemLabel(item),
      label: itemLabel(item),
      item,
      ...(checked === undefined ? {} : { checked }),
      ...(role === "menuitemradio" ? { group: item.closest('[role="group"]')?.dataset.name ?? null } : {}),
    };
    const keep = item.hasAttribute("data-keep-open");
    const proceed = this.onSelect?.(item, detail) !== false;
    if (proceed && !keep) this.root.onDismiss?.("select");
  }

  #onKeydown(e) {
    if (!this.#ownEvent(e)) return;
    const item = this.#item(e);
    const onPanel = e.target === this.panel;
    switch (e.key) {
      case "ArrowDown":
      case "ArrowUp":
      case "Home":
      case "End":
        if (onPanel) {
          e.preventDefault();
          this.#focus(e.key === "ArrowDown" || e.key === "Home" ? "first" : "last");
        }
        return;
      case "ArrowRight":
        if (item && this.subs.has(item)) {
          e.preventDefault();
          this.#openSub(item, "first");
        }
        return;
      case "ArrowLeft":
        if (this.parent) {
          e.preventDefault();
          e.stopPropagation();
          const trigger = this.trigger;
          this.parent.#closeSub();
          trigger?.focus({ preventScroll: true });
        }
        return;
      case "Escape":
        e.preventDefault();
        e.stopPropagation();
        this.root.onDismiss?.("escape");
        return;
      case "Tab":
        // Close and let the browser move focus from the (restored) trigger.
        this.root.onDismiss?.("tab");
        return;
      default:
        if (e.key.length === 1 && e.key !== " " && !e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          this.#typeahead(e.key);
        }
    }
  }

  #typeahead(char) {
    clearTimeout(this.#typedTimer);
    this.#typed += normalize(char);
    this.#typedTimer = setTimeout(() => (this.#typed = ""), TYPEAHEAD_RESET);
    const items = this.items().filter((el) => !isDisabled(el));
    const current = items.indexOf(document.activeElement);
    const repeated = [...this.#typed].every((c) => c === this.#typed[0]);
    const query = repeated ? this.#typed[0] : this.#typed;
    // Repeating one letter cycles through matches; a longer string refines from the current item.
    const start = repeated ? current + 1 : Math.max(current, 0);
    const ordered = [...items.slice(start), ...items.slice(0, start)];
    const match = ordered.find((el) => normalize(itemLabel(el)).startsWith(query));
    if (match) {
      this.#rove.focus(match);
      if (this.openSub && this.subs.get(match) !== this.openSub) this.#closeSub();
    }
  }
}

/**
 * <mv-menu placement="bottom-start">
 *   <button class="mv-button">Options</button>
 *   <div data-content>
 *     <div class="mv-menu-label">Mon compte</div>
 *     <button role="menuitem" value="profile">Profile <span class="mv-menu-shortcut">⇧⌘P</span></button>
 *     <hr>
 *     <button role="menuitemcheckbox" aria-checked="true">Status bar</button>
 *     <div role="group" data-name="density"><button role="menuitemradio">Compact</button>…</div>
 *     <div data-submenu><button role="menuitem">Share</button><div data-content>…</div></div>
 *     <button role="menuitem" data-variant="destructive">Delete</button>
 *   </div>
 * </mv-menu>
 */
export class MvMenu extends MvElement {
  static props = {
    open: Boolean,
    placement: { type: String, default: "bottom-start" },
    offset: { type: Number, default: 6 },
  };

  mount() {
    this.trigger = [...this.children].find((c) => !c.hasAttribute("data-content"));
    const panel = this.querySelector(":scope > [data-content]");
    if (!panel) return;
    this.menu = new MenuPanel(panel, {
      trigger: this.trigger,
      onSelect: (item, detail) => this.emit("select", detail, { cancelable: true }),
      onDismiss: (reason) => this.hide({ focus: reason !== "outside" }),
    });
    if (this.trigger) {
      this.trigger.setAttribute("aria-haspopup", "menu");
      this.trigger.setAttribute("aria-expanded", "false");
      this.trigger.setAttribute("aria-controls", panel.id);
    }
  }

  get isOpen() {
    return Boolean(this.menu?.isOpen);
  }

  connected(signal) {
    const t = this.trigger;
    if (!this.menu) return;
    this.menu.connect(signal);
    if (t) {
      t.addEventListener("click", (e) => {
        if (this.isOpen) this.hide({ focus: true });
        else this.show({ focus: e.detail === 0 ? "first" : "panel" });
      }, { signal });
      t.addEventListener("keydown", (e) => {
        if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
        e.preventDefault();
        this.show({ focus: e.key === "ArrowDown" ? "first" : "last" });
      }, { signal });
    }
    if (this.open) this.show({ focus: null });
  }

  update(name) {
    if (name === "open") this.open ? this.show() : this.hide();
  }

  show({ focus = "first" } = {}) {
    const m = this.menu;
    if (!m || m.isOpen) return;
    if (!m.open({ anchor: this.trigger, placement: this.placement, offset: this.offset, focus })) return;
    dismissable(m.panel, () => this.hide({ focus: false }), { signal: m.session, ignore: [this.trigger] });
    if (!this.open) this.open = true;
    this.emit("open");
  }

  hide({ focus = true } = {}) {
    const m = this.menu;
    if (!m?.isOpen) return;
    m.close();
    if (focus) this.trigger?.focus({ preventScroll: true });
    if (this.open) this.open = false;
    this.emit("close");
  }
}

define("mv-menu", MvMenu);
