import { MvElement, define } from "../../core/element.js";
import { uid } from "../../core/dom.js";

/**
 * <mv-accordion type="single">, an optional enhancement around a CSS accordion:
 *
 * <mv-accordion type="single">
 *   <div class="mv-accordion">
 *     <details class="mv-accordion-item" data-value="a"><summary>…</summary><div class="mv-accordion-content">…</div></details>
 *   </div>
 * </mv-accordion>
 *
 * - type="single": only one item open (native <details name> + JS fallback).
 * - Keyboard: native Tab, Enter and Space only. No arrow keys: they would stop the page
 *   from scrolling (removed from the WAI-ARIA APG accordion pattern in 2026).
 * - Emits mv-change with the list of open values.
 */
export class MvAccordion extends MvElement {
  static props = { type: { type: String, default: "multiple" } };

  #group = uid("mv-accordion");

  get items() {
    return [...this.querySelectorAll("details.mv-accordion-item")].filter((d) => d.closest("mv-accordion") === this);
  }

  /** Values of the open items (data-value, else index). */
  get value() {
    return this.items.filter((d) => d.open).map((d) => this.#valueOf(d));
  }

  set value(values) {
    const wanted = new Set([].concat(values ?? []).map(String));
    let first = true;
    for (const d of this.items) {
      const open = wanted.has(this.#valueOf(d)) && (this.type !== "single" || first);
      if (open) first = false;
      d.open = open;
    }
  }

  mount() {
    this.#applyType();
  }

  connected(signal) {
    // `toggle` does not bubble: listen in the capture phase.
    this.addEventListener("toggle", (e) => {
      const d = e.target;
      if (!(d instanceof HTMLDetailsElement) || !this.items.includes(d)) return;
      if (this.type === "single" && d.open) {
        for (const other of this.items) if (other !== d && other.open) other.open = false;
      }
      this.emit("change", { value: this.value, item: d, open: d.open });
    }, { capture: true, signal });
  }

  update(name) {
    if (name === "type") this.#applyType();
  }

  #applyType() {
    const single = this.type === "single";
    let seenOpen = false;
    for (const d of this.items) {
      if (single) {
        if (!d.name || d.dataset.mvAutoName !== undefined) {
          d.name = this.#group;
          d.dataset.mvAutoName = "";
        }
        if (d.open && seenOpen) d.open = false;
        if (d.open) seenOpen = true;
      } else if (d.dataset.mvAutoName !== undefined) {
        d.removeAttribute("name");
        delete d.dataset.mvAutoName;
      }
    }
  }

  #valueOf(d) {
    return d.dataset.value ?? String(this.items.indexOf(d));
  }
}

define("mv-accordion", MvAccordion);
