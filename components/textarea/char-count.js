import { MvElement, define } from "../../core/element.js";
import { ensureId } from "../../core/dom.js";

/**
 * <textarea id="bio" class="mv-textarea" maxlength="280"></textarea>
 * <mv-char-count for="bio"></mv-char-count>
 *
 * Live character counter for a textarea/input. `max` falls back to the
 * control's maxlength. Without maxlength the limit is "soft": typing past it
 * is allowed but the control becomes invalid (setCustomValidity) so it shows
 * the error style and blocks form submission.
 */
export class MvCharCount extends MvElement {
  static props = {
    for: String,
    max: Number,
    mode: { type: String, default: "count" }, // count → "12 / 280" · remaining → "268"
    warnAt: { type: Number, default: 0.9 },   // ratio at which data-state="near" kicks in
  };

  #control = null;
  #out = null;
  #sr = null;
  #live = null;
  #bind = null;
  #state = "";
  #customValidity = false;

  mount() {
    this.#out = document.createElement("span");
    this.#out.dataset.part = "value";
    this.#out.setAttribute("aria-hidden", "true");
    // Description read on focus (wired through aria-describedby)
    this.#sr = document.createElement("span");
    this.#sr.className = "mv-sr-only";
    this.#sr.dataset.part = "description";
    // Polite announcement only when crossing a threshold, not on every keystroke
    this.#live = document.createElement("span");
    this.#live.className = "mv-sr-only";
    this.#live.setAttribute("role", "status");
    this.replaceChildren(this.#out, this.#sr, this.#live);
  }

  connected(signal) {
    this.#attach();
    signal.addEventListener("abort", () => this.#detach());
  }

  update(name) {
    if (name === "for") { if (this.isConnected) this.#attach(); }
    else this.refresh();
  }

  /** Re-read the control's value (call after setting `.value` programmatically). */
  refresh() {
    const c = this.#control;
    if (!c || !this.#out) return;
    const len = c.value.length;
    const max = this.max ?? (c.maxLength > 0 ? c.maxLength : undefined);

    if (!max) {
      this.#out.textContent = String(len);
      this.#sr.textContent = `${len} character${len === 1 ? "" : "s"}`;
      this.#setState("");
      return;
    }

    const remaining = max - len;
    const state = remaining < 0 ? "over" : len >= max * this.warnAt ? "near" : "";
    this.style.setProperty("--mv-char-progress", String(Math.min(len / max, 1)));
    this.#out.textContent = this.mode === "remaining" ? (remaining < 0 ? `−${-remaining}` : String(remaining)) : `${len} / ${max}`;
    this.#sr.textContent = remaining >= 0
      ? `${remaining} character${remaining === 1 ? "" : "s"} left of ${max}`
      : `${-remaining} character${remaining < -1 ? "s" : ""} over the limit, maximum ${max}`;

    // Soft limit (no native maxlength): flag the control as invalid.
    if (!(c.maxLength > 0) && typeof c.setCustomValidity === "function") {
      if (state === "over") { c.setCustomValidity(`Maximum ${max} characters.`); this.#customValidity = true; }
      else if (this.#customValidity) { c.setCustomValidity(""); this.#customValidity = false; }
    }
    this.#setState(state);
  }

  #setState(state) {
    if (state === this.#state) return;
    const announce = state && state !== this.#state;
    this.#state = state;
    if (state) this.dataset.state = state;
    else delete this.dataset.state;
    if (announce) this.#live.textContent = this.#sr.textContent;
  }

  #resolve() {
    if (this.for) {
      const root = this.getRootNode();
      return root.getElementById?.(this.for) ?? document.getElementById(this.for);
    }
    const scope = this.closest(".mv-field, .mv-textarea-group, label, fieldset, form");
    return scope?.querySelector("textarea, input") ?? this.previousElementSibling;
  }

  #attach() {
    this.#detach();
    const c = this.#resolve();
    if (!c || !("value" in c)) return;
    this.#control = c;
    this.#bind = new AbortController();
    const { signal } = this.#bind;
    c.addEventListener("input", () => this.refresh(), { signal });
    c.form?.addEventListener("reset", () => queueMicrotask(() => this.refresh()), { signal });
    const id = ensureId(this.#sr, "mv-char-count");
    const ids = (c.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean);
    if (!ids.includes(id)) c.setAttribute("aria-describedby", [...ids, id].join(" "));
    this.refresh();
  }

  #detach() {
    this.#bind?.abort();
    this.#bind = null;
    const c = this.#control;
    if (!c) return;
    const id = this.#sr?.id;
    const ids = (c.getAttribute("aria-describedby") ?? "").split(/\s+/).filter((x) => x && x !== id);
    if (ids.length) c.setAttribute("aria-describedby", ids.join(" "));
    else c.removeAttribute("aria-describedby");
    if (this.#customValidity) { c.setCustomValidity(""); this.#customValidity = false; }
    this.#control = null;
  }
}

define("mv-char-count", MvCharCount);
