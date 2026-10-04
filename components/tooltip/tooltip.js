import { MvElement, define } from "../../core/element.js";
import { autoPlace } from "../../core/position.js";
import { ensureId, ariaList } from "../../core/dom.js";

// Tooltips opened within this window after another closed skip their delay.
const SKIP_WINDOW = 300;
let lastClosedAt = 0;

/**
 * <mv-tooltip text="Copy" placement="top">
 *   <button>…</button>
 * </mv-tooltip>
 * Rich content: put a child with [data-content] instead of `text`.
 */
export class MvTooltip extends MvElement {
  static props = {
    text: String,
    placement: { type: String, default: "top" },
    delay: { type: Number, default: 500 },
    offset: { type: Number, default: 8 },
    open: Boolean,
    disabled: Boolean,
  };

  mount() {
    this.trigger = [...this.children].find((c) => !c.hasAttribute("data-content"));
    this.bubble = this.querySelector(":scope > [data-content]") ?? document.createElement("div");
    if (!this.bubble.isConnected) {
      this.bubble.setAttribute("data-content", "");
      this.bubble.textContent = this.text ?? "";
      this.append(this.bubble);
    }
    this.bubble.classList.add("mv-tooltip");
    this.bubble.setAttribute("role", "tooltip");
    this.bubble.setAttribute("popover", "manual");
    if (this.trigger) ariaList.add(this.trigger, ensureId(this.bubble, "mv-tooltip"));
  }

  connected(signal) {
    const t = this.trigger;
    if (!t) return;
    let timer = 0;
    const show = (instant) => {
      clearTimeout(timer);
      if (this.disabled) return;
      const wait = instant || Date.now() - lastClosedAt < SKIP_WINDOW ? 0 : this.delay;
      timer = setTimeout(() => (this.open = true), wait);
    };
    const hide = () => {
      clearTimeout(timer);
      if (this.open) this.open = false;
    };
    t.addEventListener("pointerenter", (e) => { if (e.pointerType !== "touch") show(false); }, { signal });
    t.addEventListener("pointerleave", hide, { signal });
    t.addEventListener("focusin", (e) => { if (e.target.matches(":focus-visible")) show(true); }, { signal });
    t.addEventListener("focusout", hide, { signal });
    t.addEventListener("pointerdown", hide, { signal });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && this.open) hide(); }, { signal });
    signal.addEventListener("abort", () => { clearTimeout(timer); this.#hide(); });
    if (this.open) this.#show();
  }

  update(name) {
    if (name === "open") this.open ? this.#show() : this.#hide();
    if (name === "text" && this.bubble && !this.bubble.children.length) this.bubble.textContent = this.text ?? "";
  }

  #placer = null;
  #show() {
    if (!this.bubble || !this.trigger) return;
    this.#placer?.abort();
    this.#placer = new AbortController();
    try { this.bubble.showPopover(); } catch {}
    autoPlace(this.bubble, this.trigger, { placement: this.placement, offset: this.offset }, this.#placer.signal);
    this.bubble.dataset.state = "open";
    this.emit("open");
  }

  #hide() {
    if (!this.bubble) return;
    this.#placer?.abort();
    this.#placer = null;
    if (this.bubble.matches(":popover-open")) {
      this.bubble.dataset.state = "closed";
      try { this.bubble.hidePopover(); } catch {}
      lastClosedAt = Date.now();
      this.emit("close");
    }
  }
}

define("mv-tooltip", MvTooltip);
