import { MvElement, define } from "../../core/element.js";
import { place } from "../../core/position.js";
import { getFocusable } from "../../core/focus.js";
import { ensureId } from "../../core/dom.js";
import { reducedMotion } from "../../core/motion.js";
import { svgEl, ensureFilter } from "../../core/svg.js";

/**
 * Anchor `floating` to `anchor` and keep it placed while `signal` is alive.
 *
 * Differences with core `autoPlace`:
 * - measures the floating element's layout box (offsetWidth/Height), so an
 *   enter transition on `scale` never skews the computed position;
 * - accepts a virtual anchor ({ getBoundingClientRect() }), e.g. a pointer
 *   position for context menus;
 * - `alignOffset` shifts along the alignment axis (submenus align their first
 *   item with the trigger).
 * Returns the `update()` function.
 */
export function anchorFloating(floating, anchor, options = {}, signal) {
  const { alignOffset = 0, ...opts } = options;
  const side = (opts.placement ?? "bottom").split("-")[0];
  const horizontal = side === "left" || side === "right";
  const target = {
    getBoundingClientRect() {
      const r = anchor.getBoundingClientRect();
      if (!alignOffset) return r;
      return new DOMRect(r.x + (horizontal ? 0 : alignOffset), r.y + (horizontal ? alignOffset : 0), r.width, r.height);
    },
  };
  const box = {
    style: floating.style,
    dataset: floating.dataset,
    getBoundingClientRect: () => ({ width: floating.offsetWidth, height: floating.offsetHeight }),
  };
  const isElement = typeof Element !== "undefined" && anchor instanceof Element;
  let raf = 0;
  const run = () => {
    raf = 0;
    if (!floating.isConnected || (isElement && !anchor.isConnected)) return;
    place(box, target, opts);
  };
  if (signal) {
    const schedule = () => { if (!raf) raf = requestAnimationFrame(run); };
    window.addEventListener("scroll", schedule, { capture: true, passive: true, signal });
    window.addEventListener("resize", schedule, { passive: true, signal });
    const ro = new ResizeObserver(schedule);
    ro.observe(floating);
    if (isElement) ro.observe(anchor);
    signal.addEventListener("abort", () => { ro.disconnect(); cancelAnimationFrame(raf); }, { once: true });
  }
  run();
  return run;
}

/** Show a popover, declaring its invoker when supported (keeps light dismiss off the trigger). */
export function showPopoverFrom(el, source) {
  try {
    el.showPopover(source ? { source } : undefined);
  } catch {
    try { el.showPopover(); } catch { return false; }
  }
  return el.matches(":popover-open");
}

// ── Liquid opening (data-open="liquid") ──────────────────────────────
// A goo layer (blur + alpha threshold SVG filter) is drawn behind the panel
// content: a "neck" blob sits on the trigger edge, the "body" blob stretches
// out of it into the panel rectangle; the neck then shrinks and pinches off.

const GOO_ID = "mv-goo-filter";
const LIQUID_IN = 560;
const LIQUID_OUT = 380;

function ensureGooFilter() {
  ensureFilter(GOO_ID, () => svgEl("filter", { x: "-20%", y: "-20%", width: "140%", height: "140%" },
    svgEl("feGaussianBlur", { in: "SourceGraphic", stdDeviation: "6", result: "blur" }),
    svgEl("feColorMatrix", { in: "blur", mode: "matrix", values: "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10" }),
  ));
}

/** Geometry of the liquid morph between `anchor` and the (placed) `panel`. */
function liquidGeometry(panel, anchor) {
  const t = anchor.getBoundingClientRect();
  const left = parseFloat(panel.style.left) || 0;
  const top = parseFloat(panel.style.top) || 0;
  const P = { left, top, width: panel.offsetWidth, height: panel.offsetHeight };
  P.right = P.left + P.width;
  P.bottom = P.top + P.height;
  const side = panel.dataset.side || "bottom";
  const vertical = side === "top" || side === "bottom";
  const clamp = (v, a, b) => Math.min(Math.max(v, a), Math.max(a, b));
  const radius = parseFloat(getComputedStyle(panel).borderTopLeftRadius) || 12;
  // Edge point on the trigger, facing the panel.
  const ex = vertical ? clamp(t.left + t.width / 2, P.left + 18, P.right - 18) : side === "right" ? t.right : t.left;
  const ey = vertical ? (side === "bottom" ? t.bottom : t.top) : clamp(t.top + t.height / 2, P.top + 18, P.bottom - 18);
  const out = side === "bottom" || side === "right" ? 1 : -1;
  const span = vertical ? t.width : t.height;
  const neckW = clamp(span * 0.55, 18, 56);
  const neckH = 12;
  // Goo layer bounds: union of the trigger edge and the panel, padded for the blur.
  const pad = 24;
  const bx = Math.min(P.left, ex - neckW) - pad;
  const by = Math.min(P.top, ey - neckW) - pad;
  const bw = Math.max(P.right, ex + neckW) + pad - bx;
  const bh = Math.max(P.bottom, ey + neckW) + pad - by;
  const box = (x, y, w, h, r) => ({
    left: `${x - bx}px`, top: `${y - by}px`, width: `${Math.max(0, w)}px`, height: `${Math.max(0, h)}px`, borderRadius: `${r}px`,
  });
  // A rect `depth` deep from the panel's near edge, `cross` wide, centred on the edge point.
  const along = (depth, cross) => {
    if (vertical) {
      const x = clamp(ex - cross / 2, P.left, P.right - cross);
      const y = out > 0 ? P.top : P.bottom - depth;
      return [x, y, cross, depth];
    }
    const y = clamp(ey - cross / 2, P.top, P.bottom - cross);
    const x = out > 0 ? P.left : P.right - depth;
    return [x, y, depth, cross];
  };
  const neck = (scale) => {
    const w = neckW * scale;
    const h = neckH * scale;
    return vertical
      ? box(ex - w / 2, ey - h / 2 + out * 3, w, h, 999)
      : box(ex - h / 2 + out * 3, ey - w / 2, h, w, 999);
  };
  const depthFull = vertical ? P.height : P.width;
  const crossFull = vertical ? P.width : P.height;
  return {
    layer: { left: `${bx - left - panel.clientLeft}px`, top: `${by - top - panel.clientTop}px`, width: `${bw}px`, height: `${bh}px` },
    body: {
      drop: box(...along(14, neckW * 0.85), 999),
      stretch: box(...along(depthFull * 0.62, Math.min(crossFull * 0.42, neckW * 2.2)), 999),
      wide: box(P.left - 3, P.top - 3, P.width + 6, P.height + 6, radius + 3),
      full: box(P.left, P.top, P.width, P.height, radius),
      gone: box(...along(0, 0), 0),
    },
    neck,
  };
}

/**
 * Play the liquid morph on `panel` (already placed next to `anchor`).
 * phase "open": stretch out of the trigger; "close": pinch back into it.
 * Calls `done(layer)` once finished; returns { layer, cancel() }.
 */
export function liquidMorph(panel, anchor, phase, done) {
  ensureGooFilter();
  panel.querySelector(":scope > .mv-popover-liquid")?.remove();
  const g = liquidGeometry(panel, anchor);
  const layer = document.createElement("span");
  layer.className = "mv-popover-liquid";
  layer.setAttribute("aria-hidden", "true");
  Object.assign(layer.style, g.layer);
  const neck = document.createElement("i");
  const body = document.createElement("i");
  layer.append(neck, body);
  panel.prepend(layer);

  const b = g.body;
  const open = phase === "open";
  const bodyFrames = open
    ? [
      { ...b.drop, offset: 0, easing: "cubic-bezier(0.3, 0, 0.2, 1)" },
      { ...b.stretch, offset: 0.34, easing: "cubic-bezier(0.25, 0.6, 0.3, 1)" },
      { ...b.wide, offset: 0.72, easing: "ease-in-out" },
      { ...b.full, offset: 1 },
    ]
    : [
      { ...b.full, offset: 0, easing: "cubic-bezier(0.5, 0, 0.7, 0.4)" },
      { ...b.stretch, offset: 0.5, easing: "cubic-bezier(0.3, 0, 0.3, 1)" },
      { ...b.drop, offset: 0.82, easing: "ease-in" },
      { ...b.gone, offset: 1 },
    ];
  const neckFrames = open
    ? [
      { ...g.neck(1), offset: 0 },
      { ...g.neck(1.15), offset: 0.3, easing: "cubic-bezier(0.5, 0, 0.8, 0.5)" },
      { ...g.neck(0.15), offset: 0.64 },
      { ...g.neck(0), offset: 1 },
    ]
    : [
      { ...g.neck(0), offset: 0 },
      { ...g.neck(0), offset: 0.3 },
      { ...g.neck(1.1), offset: 0.72, easing: "ease-in" },
      { ...g.neck(0), offset: 1 },
    ];
  const duration = open ? LIQUID_IN : LIQUID_OUT;
  const anims = [
    body.animate(bodyFrames, { duration, fill: "forwards" }),
    neck.animate(neckFrames, { duration, fill: "forwards" }),
  ];
  let settled = false;
  anims[0].finished.then(() => {
    if (settled) return;
    settled = true;
    done?.(layer);
  }, () => {});
  return {
    layer,
    cancel() {
      settled = true;
      for (const a of anims) a.cancel();
      layer.remove();
    },
  };
}

/**
 * <mv-popover placement="bottom-start" arrow>
 *   <button class="mv-button">Open</button>
 *   <div data-content>…<button data-mv-close>Close</button></div>
 * </mv-popover>
 *
 * Non-modal dialog in the top layer (popover="auto"): click toggle, light
 * dismiss (outside click / Escape), focus moved into the panel and restored.
 */
export class MvPopover extends MvElement {
  static props = {
    open: Boolean,
    placement: { type: String, default: "bottom" },
    offset: { type: Number, default: 8 },
    arrow: Boolean,
  };

  mount() {
    this.trigger = [...this.children].find((c) => !c.hasAttribute("data-content"));
    this.panel = this.querySelector(":scope > [data-content]");
    const p = this.panel;
    if (!p) return;
    p.classList.add("mv-popover");
    p.setAttribute("popover", "auto");
    if (!p.hasAttribute("role")) p.setAttribute("role", "dialog");
    if (!p.hasAttribute("tabindex")) p.tabIndex = -1;
    p.inert = true;
    p.toggleAttribute("data-arrow", this.arrow);
    const title = p.querySelector(".mv-popover-title");
    if (title && !p.hasAttribute("aria-label") && !p.hasAttribute("aria-labelledby")) {
      p.setAttribute("aria-labelledby", ensureId(title, "mv-popover-title"));
    }
    const desc = p.querySelector(".mv-popover-description");
    if (desc && !p.hasAttribute("aria-describedby")) p.setAttribute("aria-describedby", ensureId(desc, "mv-popover-desc"));
    if (this.trigger) {
      this.trigger.setAttribute("aria-haspopup", "dialog");
      this.trigger.setAttribute("aria-expanded", "false");
      this.trigger.setAttribute("aria-controls", ensureId(p, "mv-popover"));
    }
  }

  #wasOpen = false;
  #outside = false;
  #session = null;

  get isOpen() {
    return Boolean(this.panel?.matches(":popover-open"));
  }

  connected(signal) {
    const p = this.panel;
    const t = this.trigger;
    if (!p) return;
    if (t) {
      t.addEventListener("pointerdown", () => { this.#wasOpen = this.isOpen; }, { signal });
      t.addEventListener("click", () => {
        const was = this.#wasOpen;
        this.#wasOpen = false;
        // The light dismiss already closed it on pointerup: don't reopen.
        if (was && !this.isOpen) return;
        this.toggle();
      }, { signal });
    }
    p.addEventListener("click", (e) => {
      const closer = e.target.closest("[data-mv-close]");
      if (closer && closer.closest(".mv-popover") === p) this.hide();
    }, { signal });
    p.addEventListener("beforetoggle", (e) => { if (e.newState === "closed") this.#onClosing(); }, { signal });
    signal.addEventListener("abort", () => this.hide());
    if (this.open) this.show();
  }

  update(name) {
    if (name === "open") this.open ? this.show() : this.hide();
    if (name === "arrow") this.panel?.toggleAttribute("data-arrow", this.arrow);
    if ((name === "placement" || name === "offset") && this.isOpen) this.#place?.();
  }

  toggle() {
    this.isOpen ? this.hide() : this.show();
  }

  #place = null;

  show() {
    const p = this.panel;
    if (!p || this.isOpen) return;
    p.inert = false;
    if (!showPopoverFrom(p, this.trigger)) { p.inert = true; return; }
    this.#session?.abort();
    this.#session = new AbortController();
    const signal = this.#session.signal;
    this.#outside = false;
    if (this.trigger) {
      this.#place = anchorFloating(p, this.trigger, { placement: this.placement, offset: this.offset + (this.arrow ? 2 : 0) }, signal);
      this.trigger.setAttribute("aria-expanded", "true");
    }
    document.addEventListener("pointerdown", (e) => {
      const path = e.composedPath();
      this.#outside = !path.includes(p) && !path.includes(this.trigger);
    }, { capture: true, signal });
    p.dataset.state = "open";
    if (this.#liquidOn()) this.#liquid("open");
    else this.#liquidReset();
    if (!this.open) this.open = true;
    const target = p.querySelector("[autofocus]") ?? getFocusable(p)[0];
    target?.focus({ preventScroll: true });
    this.emit("open");
  }

  #closing = false;
  #morph = null;
  #liquidTimer = 0;

  #liquidOn() {
    return this.dataset.open === "liquid" && Boolean(this.trigger?.isConnected) && !reducedMotion() && typeof this.panel.animate === "function";
  }

  #liquidReset() {
    clearTimeout(this.#liquidTimer);
    this.#morph?.cancel();
    this.#morph = null;
    if (this.panel) delete this.panel.dataset.liquid;
  }

  // Open: the content blooms once the body has stretched out. Close: content fades, then the pinch.
  #liquid(phase) {
    const p = this.panel;
    this.#liquidReset();
    p.dataset.liquid = phase === "open" ? "opening" : "closing";
    if (phase === "open") {
      this.#liquidTimer = setTimeout(() => { if (p.dataset.liquid === "opening") p.dataset.liquid = "blooming"; }, 190);
    }
    this.#morph = liquidMorph(p, this.trigger, phase, (layer) => {
      if (phase === "close") {
        this.#liquidReset();
        return;
      }
      p.dataset.liquid = "settling";
      this.#liquidTimer = setTimeout(() => {
        if (this.#morph?.layer === layer) this.#morph = null;
        layer.remove();
        if (p.dataset.liquid === "settling") delete p.dataset.liquid;
      }, 220);
    });
  }

  hide() {
    if (!this.isOpen || this.#closing) return;
    try { this.panel.hidePopover(); } catch {}
  }

  // Runs for every close path: hide(), outside click, Escape, another auto popover.
  #onClosing() {
    const p = this.panel;
    this.#closing = true;
    this.#session?.abort();
    this.#session = null;
    const active = document.activeElement;
    const focusInside = p.contains(active) || active === document.body || !active;
    if (focusInside && !this.#outside && this.trigger?.isConnected) this.trigger.focus({ preventScroll: true });
    p.inert = true;
    p.dataset.state = "closed";
    if (this.#liquidOn()) this.#liquid("close");
    else this.#liquidReset();
    this.trigger?.setAttribute("aria-expanded", "false");
    if (this.open) this.open = false;
    this.#closing = false;
    this.emit("close");
  }
}

define("mv-popover", MvPopover);
