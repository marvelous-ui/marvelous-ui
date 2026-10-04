import { MvElement, define } from "../../core/element.js";
import { roving } from "../../core/focus.js";
import { ensureId, h } from "../../core/dom.js";

/**
 * <mv-tabs value="account" data-variant="underline|pill|segmented">
 *   <div role="tablist" aria-label="Settings">
 *     <button role="tab" data-value="account">Account</button>
 *     <button role="tab" data-value="security">Security</button>
 *   </div>
 *   <div role="tabpanel" data-value="account">…</div>
 *   <div role="tabpanel" data-value="security">…</div>
 * </mv-tabs>
 *
 * Wrappers are allowed anywhere between the host, the tablist, the tabs and the panels (a framework component that
 * renders its own root, a layout div). The host owns the first tablist and every panel that are not inside one of
 * its panels or a nested <mv-tabs>, and the tabs whose nearest tablist is that list.
 * Panels are matched by data-value, or by order when they have none.
 */
const PARTS = "[role=tablist],[role=tab],[role=tabpanel]";

export class MvTabs extends MvElement {
  static props = {
    value: String,
    activation: { type: String, default: "automatic" },
    orientation: { type: String, default: "horizontal" },
  };

  #current = null;
  #list = null;
  #indicator = null;
  #rover = null;
  #roverCtl = null;
  #ro = null;
  #syncing = false;

  get list() {
    for (const el of this.querySelectorAll("[role=tablist]")) if (this.#owns(el)) return el;
    return null;
  }

  get tabs() {
    const list = this.#list ?? this.list;
    if (!list) return [];
    return [...list.querySelectorAll("[role=tab]")].filter((t) => t.parentElement.closest("[role=tablist]") === list);
  }

  get panels() {
    return [...this.querySelectorAll("[role=tabpanel]")].filter((p) => this.#owns(p));
  }

  /** The currently selected tab element. */
  get selectedTab() {
    return this.#current;
  }

  connected(signal) {
    // Delegated to the host: survives a re-rendered tablist; a nested <mv-tabs> keeps its own tabs.
    this.addEventListener("click", (e) => {
      const tab = e.target.closest?.("[role=tab]");
      if (!tab || isDisabled(tab) || !this.tabs.includes(tab)) return;
      this.#select(tab, { emit: true });
    }, { signal });

    // When focus leaves the list (manual mode), Tab should return to the selected tab.
    this.addEventListener("focusout", (e) => {
      const list = this.#list;
      if (list?.contains(e.target) && !list.contains(e.relatedTarget) && this.#current) this.#rover?.sync(this.#current);
    }, { signal });

    this.#ro = new ResizeObserver(() => this.#place(false));
    signal.addEventListener("abort", () => {
      this.#ro?.disconnect();
      this.#ro = null;
      this.#list = null;
    }, { once: true });
    document.fonts?.ready.then(() => { if (!signal.aborted) this.#place(false); });

    // Tabs, panels or wrappers added or removed later (frameworks). Other changes inside the panels are ignored.
    const mo = new MutationObserver((records) => {
      if (records.some((r) => touchesParts(r.addedNodes) || touchesParts(r.removedNodes))) this.#refresh();
    });
    mo.observe(this, { childList: true, subtree: true });
    signal.addEventListener("abort", () => mo.disconnect(), { once: true });

    this.#refresh();
  }

  update(name) {
    if (name === "value" && !this.#syncing) {
      const tab = this.#tabFor(this.value);
      if (tab && tab !== this.#current) this.#select(tab);
    }
    if (name === "orientation" && this.signal && this.#list) {
      this.#list.setAttribute("aria-orientation", this.#orientation());
      this.#bindRover(this.signal);
      this.#place(false);
    }
  }

  /** Select a tab by value (or index). */
  select(value) {
    const tab = this.#tabFor(String(value));
    if (tab) this.#select(tab, { emit: true });
  }

  valueOf(tab) {
    return tab.dataset.value ?? tab.getAttribute("value") ?? String(this.tabs.indexOf(tab));
  }

  // Ours unless one of our panels or a nested <mv-tabs> sits in between.
  #owns(el) {
    return el.parentElement?.closest("mv-tabs, [role=tabpanel]") === this;
  }

  #orientation() {
    return this.orientation === "vertical" ? "vertical" : "horizontal";
  }

  #tabFor(value) {
    if (value == null) return null;
    return this.tabs.find((t) => this.valueOf(t) === value) ?? null;
  }

  #panelFor(tab, panels = this.panels, tabs = this.tabs) {
    const v = this.valueOf(tab);
    return panels.find((p) => p.dataset.value === v) ?? (panels.some((p) => p.dataset.value) ? null : panels[tabs.indexOf(tab)]) ?? null;
  }

  #initialTab() {
    const tabs = this.tabs;
    return this.#tabFor(this.value)
      ?? tabs.find((t) => t.getAttribute("aria-selected") === "true" && !isDisabled(t))
      ?? tabs.find((t) => !isDisabled(t))
      ?? null;
  }

  // (Re)bind to the current tablist, wire the parts and keep a valid selection.
  #refresh() {
    const list = this.list;
    if (list !== this.#list) {
      this.#list = list;
      this.#roverCtl?.abort();
      this.#rover = null;
      if (!list) {
        this.#current = null;
        return;
      }
      this.#indicator = list.querySelector(":scope > .mv-tabs-indicator") ?? h("span", { class: "mv-tabs-indicator", "aria-hidden": "true" });
      if (this.#indicator.parentElement !== list) list.prepend(this.#indicator);
      this.#ro?.observe(list);
      this.#bindRover(this.signal);
    }
    if (!list) return;
    this.#wire();
    for (const tab of this.tabs) this.#ro?.observe(tab);
    const keep = this.tabs.includes(this.#current) ? this.#current : this.#initialTab();
    if (keep) this.#select(keep, { instant: true });
  }

  #wire() {
    const list = this.#list;
    if (!list) return;
    list.setAttribute("aria-orientation", this.#orientation());
    const tabs = this.tabs;
    const panels = this.panels;
    for (const tab of tabs) {
      if (tab.localName === "button" && !tab.hasAttribute("type")) tab.type = "button";
      const panel = this.#panelFor(tab, panels, tabs);
      ensureId(tab, "mv-tab");
      if (!panel) continue;
      tab.setAttribute("aria-controls", ensureId(panel, "mv-tabpanel"));
      panel.setAttribute("aria-labelledby", tab.id);
      if (!panel.hasAttribute("tabindex")) panel.tabIndex = 0;
    }
  }

  #bindRover(signal) {
    this.#roverCtl?.abort();
    if (!signal || !this.#list) return;
    this.#roverCtl = new AbortController();
    signal.addEventListener("abort", () => this.#roverCtl?.abort(), { once: true });
    this.#rover = roving(this.#list, () => this.tabs, {
      orientation: this.#orientation(),
      signal: this.#roverCtl.signal,
      onMove: (tab) => { if (this.activation !== "manual") this.#select(tab, { emit: true }); },
    });
    if (this.#current) this.#rover.sync(this.#current);
  }

  #select(tab, { emit = false, instant = false } = {}) {
    const prev = this.#current;
    const tabs = this.tabs;
    const panels = this.panels;
    const panel = this.#panelFor(tab, panels, tabs);
    for (const t of tabs) t.setAttribute("aria-selected", String(t === tab));
    for (const p of panels) p.hidden = p !== panel;
    this.#current = tab;
    if (!this.#list?.contains(document.activeElement)) this.#rover?.sync(tab);
    const value = this.valueOf(tab);
    if (this.value !== value) {
      this.#syncing = true;
      this.value = value;
      this.#syncing = false;
    }
    this.#place(!instant && Boolean(prev));
    if (emit && prev !== tab) this.emit("change", { value, previous: prev ? this.valueOf(prev) : null, tab, panel });
  }

  // Move the sliding indicator onto the selected tab (read layout, then write). Measured with rects, so a wrapper
  // between the list and the tab (positioned or not) does not shift it, then divided by the list's scale, so a
  // transformed ancestor (a zoomed preview) does not either.
  #place(animate) {
    const ind = this.#indicator;
    const tab = this.#current;
    const list = this.#list;
    if (!ind || !tab || !list) return;
    const w = tab.offsetWidth;
    const hgt = tab.offsetHeight;
    if (!w && !hgt) return; // hidden container; ResizeObserver will call again
    const lr = list.getBoundingClientRect();
    const tr = tab.getBoundingClientRect();
    const sx = (list.offsetWidth && lr.width / list.offsetWidth) || 1;
    const sy = (list.offsetHeight && lr.height / list.offsetHeight) || 1;
    const x = (tr.left - lr.left) / sx - list.clientLeft + list.scrollLeft;
    const y = (tr.top - lr.top) / sy - list.clientTop + list.scrollTop;
    if (!animate) ind.dataset.instant = "";
    ind.style.setProperty("--mv-tabs-x", `${round(x)}px`);
    ind.style.setProperty("--mv-tabs-y", `${round(y)}px`);
    ind.style.setProperty("--mv-tabs-w", `${w}px`);
    ind.style.setProperty("--mv-tabs-h", `${hgt}px`);
    ind.dataset.ready = "";
    if (!animate) {
      void ind.offsetWidth; // commit the jump before re-enabling transitions
      delete ind.dataset.instant;
    }
  }
}

function isDisabled(el) {
  return el.disabled || el.getAttribute("aria-disabled") === "true";
}

function round(n) {
  return Math.round(n * 100) / 100;
}

// Did a DOM change add or remove a tablist, a tab or a panel (or a wrapper holding one)?
function touchesParts(nodes) {
  for (const n of nodes) if (n.nodeType === 1 && (n.matches(PARTS) || n.querySelector(PARTS))) return true;
  return false;
}

define("mv-tabs", MvTabs);
