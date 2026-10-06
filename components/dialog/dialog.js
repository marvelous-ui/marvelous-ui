import { MvElement, define, targetSelector } from "../../core/element.js";
import { ensureId } from "../../core/dom.js";
import { reducedMotion } from "../../core/motion.js";

/**
 * <mv-dialog>: wraps a native <dialog> (top layer, focus trap, Esc, inert page).
 *
 * <mv-dialog>
 *   <button data-mv-open>Open</button>
 *   <dialog>… <button data-mv-close>Close</button></dialog>
 * </mv-dialog>
 *
 * Variants on the <dialog>: data-variant="sheet" + data-side="right|left|top|bottom".
 * Triggers outside the element: <button data-mv-open="#my-dialog">.
 * `modeless`: opens without a backdrop and leaves the page usable (a side panel next to a board);
 * Escape inside it still closes it and focus goes back to the trigger.
 */
export class MvDialog extends MvElement {
  static props = { open: Boolean, persistent: Boolean, swipe: Boolean, modeless: Boolean };

  // Frameworks (Angular, a late v-if, a re-render) may add or swap the <dialog> after the host connects,
  // so the child is looked up whenever it is needed and its listeners follow it.
  #bound = null;
  #bindCtl = null;
  #mo = null;
  #roled = new WeakSet(); // <dialog>s that received role=alertdialog from `persistent`
  #returnFocus = null; // modeless only: the native dialog restores focus after showModal()

  /** The child <dialog>, or null while it has not been rendered yet. */
  get dialog() {
    return this.#attach();
  }

  connected(signal) {
    this.addEventListener("click", (e) => {
      const d = this.dialog;
      if (!d) return;
      const opener = e.target.closest("[data-mv-open]");
      if (opener && !d.contains(opener) && opener.closest("mv-dialog") === this && !targetSelector(opener.dataset.mvOpen)) {
        this.show();
        return;
      }
      const closer = e.target.closest("[data-mv-close]");
      // Its own closers only: a closer of a nested mv-dialog closes that one, not every dialog around it.
      if (closer && d.contains(closer) && closer.closest("mv-dialog") === this) this.close(closer.value || closer.dataset.mvClose || "");
    }, { signal });

    this.#mo = new MutationObserver(() => this.#attach());
    this.#mo.observe(this, { childList: true });
    signal.addEventListener("abort", () => {
      this.#mo?.disconnect();
      this.#mo = null;
      this.#unbind();
    }, { once: true });

    this.#attach();
  }

  update(name) {
    if (name === "open") this.open ? this.show() : this.close();
    else if (name === "persistent") { const d = this.dialog; if (d) this.#decorate(d); }
    else if (name === "swipe" && this.#bound) this.#bind(this.#bound);
  }

  show() {
    const d = this.dialog;
    if (!d || d.open || !d.isConnected) return;
    this.#decorate(d); // the title may have been rendered after the <dialog> itself
    if (!this.emit("before-open", null, { cancelable: true })) return;
    d.returnValue = "";
    d.style.removeProperty("translate");
    d.toggleAttribute("data-modeless", this.modeless);
    if (this.modeless) {
      this.#returnFocus = document.activeElement;
      d.show();
    } else d.showModal();
    if (!this.open) this.open = true;
    this.emit("open");
  }

  close(returnValue = "") {
    const d = this.dialog;
    if (!d?.open) return;
    d.close(returnValue);
  }

  // Finds the current <dialog> child and binds it if it is new. Cheap and idempotent.
  #attach() {
    const d = this.querySelector(":scope > dialog");
    if (!this.isMounted || !this.signal) return d;
    if (d === this.#bound) return d;
    const had = this.#bound;
    this.#unbind();
    if (!d) {
      if (had && this.open) this.open = false; // the open <dialog> was removed with its content
      return null;
    }
    this.#decorate(d);
    this.#bind(d);
    if (this.open && !d.open) queueMicrotask(() => { if (this.#bound === d && this.open) this.show(); });
    return d;
  }

  #decorate(d) {
    d.classList.add("mv-dialog");
    const title = d.querySelector(".mv-dialog-title, h1, h2, h3");
    if (title && !d.hasAttribute("aria-label") && !d.hasAttribute("aria-labelledby")) {
      d.setAttribute("aria-labelledby", ensureId(title, "mv-dialog-title"));
    }
    const desc = d.querySelector(".mv-dialog-description");
    if (desc && !d.hasAttribute("aria-describedby")) {
      d.setAttribute("aria-describedby", ensureId(desc, "mv-dialog-desc"));
    }
    if (this.persistent && d.getAttribute("role") !== "alertdialog") {
      d.setAttribute("role", "alertdialog");
      this.#roled.add(d);
    } else if (!this.persistent && this.#roled.has(d)) {
      d.removeAttribute("role");
      this.#roled.delete(d);
    }
  }

  #unbind() {
    this.#bindCtl?.abort();
    this.#bindCtl = null;
    this.#bound = null;
  }

  #bind(d) {
    this.#bindCtl?.abort();
    this.#bindCtl = new AbortController();
    this.#bound = d;
    const { signal } = this.#bindCtl;

    // Light dismiss on backdrop click (clicks on the dialog box itself are ignored).
    d.addEventListener("pointerdown", (e) => { this.#downOnBackdrop = e.target === d && outside(d, e); }, { signal });
    d.addEventListener("click", (e) => {
      if (this.persistent || !this.#downOnBackdrop) return;
      if (e.target === d && outside(d, e)) this.close("dismiss");
    }, { signal });
    d.addEventListener("cancel", (e) => { if (this.persistent) e.preventDefault(); }, { signal });
    // A modeless <dialog> gets no native cancel: Escape from inside it closes it.
    d.addEventListener("keydown", (e) => {
      if (e.key !== "Escape" || !d.hasAttribute("data-modeless") || this.persistent || e.defaultPrevented) return;
      e.preventDefault();
      this.close("dismiss");
    }, { signal });
    d.addEventListener("close", () => {
      const back = this.#returnFocus;
      this.#returnFocus = null;
      const active = document.activeElement;
      if (back?.isConnected && (!active || active === document.body || d.contains(active))) back.focus({ preventScroll: true });
      if (this.open) this.open = false;
      this.emit("close", { returnValue: d.returnValue });
    }, { signal });

    if (this.swipe) this.#bindSwipe(d, signal);
  }

  #downOnBackdrop = false;

  // Drag-to-dismiss for sheets/drawers.
  #bindSwipe(d, signal) {
    const side = () => d.dataset.side ?? "bottom";
    let start = null;
    d.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || e.target.closest("input, textarea, select, button, a, [contenteditable], [data-mv-no-drag]")) return;
      if (e.target === d && outside(d, e)) return;
      start = { x: e.clientX, y: e.clientY, t: performance.now(), size: side() === "left" || side() === "right" ? d.offsetWidth : d.offsetHeight };
      d.setPointerCapture(e.pointerId);
      d.dataset.dragging = "";
    }, { signal });
    d.addEventListener("pointermove", (e) => {
      if (!start) return;
      const s = side();
      const delta = s === "bottom" ? e.clientY - start.y : s === "top" ? start.y - e.clientY : s === "right" ? e.clientX - start.x : start.x - e.clientX;
      const offset = delta > 0 ? delta : delta / 4; // rubber band against the edge
      const px = s === "bottom" ? `0 ${offset}px` : s === "top" ? `0 ${-offset}px` : s === "right" ? `${offset}px 0` : `${-offset}px 0`;
      d.style.translate = px;
      start.delta = delta;
    }, { signal });
    const end = () => {
      if (!start) return;
      const { delta = 0, t, size } = start;
      const velocity = delta / Math.max(1, performance.now() - t);
      start = null;
      delete d.dataset.dragging;
      if (delta > size * 0.35 || velocity > 0.6) {
        this.close("swipe");
      } else {
        d.style.removeProperty("translate");
      }
      if (reducedMotion()) d.style.removeProperty("translate");
    };
    d.addEventListener("pointerup", end, { signal });
    d.addEventListener("pointercancel", end, { signal });
  }
}

function outside(dialog, e) {
  const r = dialog.getBoundingClientRect();
  return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
}

// External triggers: <button data-mv-open="#id"> anywhere in the document.
if (typeof document !== "undefined" && !window.__mvDialogDelegation) {
  window.__mvDialogDelegation = true;
  document.addEventListener("click", (e) => {
    const opener = e.target.closest("[data-mv-open]");
    const sel = targetSelector(opener?.dataset.mvOpen);
    if (!sel) return;
    const host = document.querySelector(sel);
    const el = host?.localName === "dialog" ? host.closest("mv-dialog") : host;
    if (el instanceof MvDialog) el.show();
  });
}

define("mv-dialog", MvDialog);
