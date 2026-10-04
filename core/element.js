/**
 * MvElement: tiny base class for Marvelous UI custom elements (light DOM).
 *
 * Lifecycle:
 *   mount()             : once, on first connection (build DOM, read children)
 *   connected(signal)   : on every connection; everything bound with `signal`
 *                         is torn down automatically on disconnection
 *   update(name, old, value): after a declared prop/attribute changed
 *
 * Declare reactive props (mirrored to kebab-case attributes):
 *   static props = { open: Boolean, delay: { type: Number, default: 300 } }
 */
import { appStrings, hasTables, installStrings, localeOf, textProps, track } from "./i18n.js";

// SSR-safe: importing a component on the server must not crash.
const Base = globalThis.HTMLElement ?? class {};

export class MvElement extends Base {
  static props = {};
  // Purchase id: "mv-mark:" + 16 zeros in the repository and the Free pack; a licensed download carries its buyer's
  // id here and in --mv-mark (tokens.css). Same length always; nothing reads it at run time.
  static mark = "mv-mark:0000000000000000";

  static get observedAttributes() {
    return Object.keys(this.props).map(toKebab);
  }

  #controller = null;
  #mounted = false;
  #pending = null;

  constructor() {
    super();
    // Capture values set on the instance before upgrade (frameworks do this).
    // A subclass's own accessor may use private fields that do not exist yet
    // during super(), so those values wait for the first connection.
    for (const key of Object.keys(this.constructor.props)) {
      if (Object.prototype.hasOwnProperty.call(this, key)) {
        if (!installedSetters.has(findSetter(this, key))) {
          (this.#pending ??= []).push(key);
          continue;
        }
        const value = this[key];
        delete this[key];
        this[key] = value;
      }
    }
  }

  /** AbortSignal valid while the element is connected. */
  get signal() {
    return this.#controller?.signal;
  }

  get isMounted() {
    return this.#mounted;
  }

  connectedCallback() {
    if (this.#pending) {
      for (const key of this.#pending) {
        if (!Object.prototype.hasOwnProperty.call(this, key)) continue;
        const value = this[key];
        delete this[key];
        this[key] = value;
      }
      this.#pending = null;
    }
    this.#controller?.abort();
    this.#controller = new AbortController();
    track(this, true);
    const run = () => {
      if (!this.isConnected) return;
      if (!this.#mounted) {
        this.#mounted = true;
        this.mount?.();
      }
      this.connected?.(this.#controller.signal);
    };
    // Children are not parsed yet when a classic script upgrades during parsing.
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", run, { once: true, signal: this.#controller.signal });
    } else {
      run();
    }
  }

  disconnectedCallback() {
    this.#controller?.abort();
    this.#controller = null;
    track(this, false);
    this.disconnected?.();
  }

  attributeChangedCallback(attr, oldValue, newValue) {
    if (oldValue === newValue || !this.#mounted) return;
    const key = toCamel(attr);
    this.update?.(key, parseValue(this.constructor.props[key], oldValue), this[key]);
  }

  /** Dispatch a bubbling `mv-<type>` CustomEvent. Returns false if cancelled. */
  emit(type, detail, { cancelable = false } = {}) {
    return this.dispatchEvent(
      new CustomEvent(`mv-${type}`, { detail, bubbles: true, composed: true, cancelable }),
    );
  }
}

/** Register a custom element once (safe with HMR / multiple copies). */
export function define(tag, ctor) {
  if (typeof customElements === "undefined") return ctor;
  installProps(ctor);
  installStrings(ctor);
  if (!customElements.get(tag)) customElements.define(tag, ctor);
  return ctor;
}

const installedSetters = new WeakSet();

function findSetter(obj, key) {
  for (let p = Object.getPrototypeOf(obj); p; p = Object.getPrototypeOf(p)) {
    const d = Object.getOwnPropertyDescriptor(p, key);
    if (d) return d.set;
  }
}

function installProps(ctor) {
  if (Object.prototype.hasOwnProperty.call(ctor, "__mvPropsInstalled")) return;
  Object.defineProperty(ctor, "__mvPropsInstalled", { value: true });
  const texts = [];
  for (const [key, spec] of Object.entries(ctor.props ?? {})) {
    if (Object.getOwnPropertyDescriptor(ctor.prototype, key)) continue;
    const attr = toKebab(key);
    const type = typeof spec === "function" ? spec : spec.type;
    const fallback = typeof spec === "function" ? undefined : spec.default;
    const locale = typeof spec === "function" ? undefined : spec.locale; // LOCALE / PAGE_LOCALE (i18n.js)
    if (type === String && typeof fallback === "string" && !locale) texts.push([key, attr]);
    Object.defineProperty(ctor.prototype, key, {
      configurable: true,
      get() {
        if (type === Boolean) return this.hasAttribute(attr);
        if (locale) return localeOf(this, this.getAttribute(attr), locale);
        const raw = this.getAttribute(attr);
        if (raw === null) {
          // A text default ("Notifications") is translatable by its prop name in the app's table (core/i18n.js).
          if (typeof fallback === "string" && type === String && hasTables()) {
            const text = appStrings(this)?.[key];
            if (typeof text === "string") return text;
          }
          return fallback ?? (type === Number ? undefined : null);
        }
        return type === Number ? toNumber(raw, fallback) : raw;
      },
      set(value) {
        if (type === Boolean) this.toggleAttribute(attr, Boolean(value));
        else if (value === null || value === undefined) this.removeAttribute(attr);
        else this.setAttribute(attr, String(value));
      },
    });
    installedSetters.add(Object.getOwnPropertyDescriptor(ctor.prototype, key).set);
  }
  textProps(ctor, texts);
}

function parseValue(spec, raw) {
  const type = typeof spec === "function" ? spec : spec?.type;
  if (type === Boolean) return raw !== null;
  if (type === Number) return raw === null ? undefined : toNumber(raw, spec?.default);
  return raw;
}

// A number attribute that does not parse ("abc", "") falls back to the default instead of spreading NaN.
const toNumber = (raw, fallback) => {
  const n = raw.trim() === "" ? NaN : Number(raw);
  return Number.isNaN(n) ? fallback : n;
};

// A trigger attribute that may name its target (data-mv-open="#id") or not: React renders a bare JSX flag
// (<button data-mv-open>) as "true", which is no selector. Returns the selector, or "" when there is none.
export const targetSelector = (value) => (value && value !== "true" ? value : "");

export const toKebab = (s) => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
export const toCamel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
