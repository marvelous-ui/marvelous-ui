/**
 * i18n: one language per component, and one place where an app gives its translations.
 *
 * Text (labels, aria, live announcements). Each component keeps its en-US defaults in code. Per key, it shows:
 *   its own `strings` property  >  the app's table for its language (setStrings)  >  the en-US default.
 * Its language is the nearest non-empty [lang] (its own, an ancestor's, <html lang>), "en-US" without any:
 * the same attribute a screen reader reads to pick its voice, so text and voice always agree.
 *
 *   import { setStrings } from ".../core/i18n.js";
 *   setStrings("fr", { "app-shell": { skip: "Aller au contenu" }, toaster: { close: "Fermer" } });
 *
 * A table is keyed by tag without "mv-" ("app-shell", "toaster" for <mv-toaster>); "mv-app-shell" works too.
 * Besides `strings` keys, it translates text defaults of attributes by prop name ({ pagination: { prevLabel } }):
 * an attribute set on the element still wins.
 * "fr" serves fr, fr-FR, fr-CA… (a closer "fr-CA" table wins). Calls merge. Already rendered components
 * re-render when a table is added or a [lang] changes.
 *
 * Numbers and dates. A `locale` attribute wins. `locale="auto"` follows the language above. Without the
 * attribute, a component keeps its documented default (en-US for LOCALE props), unless the app registered
 * its language with setStrings (an empty table is enough): then formatting follows the language too.
 *
 * SSR-safe: nothing touches the DOM at import. The registry lives on globalThis (Symbol.for), so several
 * copies of this file (bundles, duplicated installs) share it.
 */

export const DEFAULT_LANG = "en-US";

const store = (globalThis[Symbol.for("mv.i18n")] ??= { tables: new Map(), live: new Set(), observing: false });
const overrides = new WeakMap(); // element → the plain object last given to its `strings` setter
const wrapped = new WeakSet(); // classes whose `strings` accessor goes through the registry
const texts = new WeakMap(); // class → [[prop, attribute]] of its String props with a text default

/** Language of an element's text: the nearest non-empty [lang], else <html lang>, else en-US. */
export function langOf(el) {
  const near = el?.closest?.('[lang]:not([lang=""])')?.getAttribute("lang");
  if (near) return near;
  const root = typeof document !== "undefined" ? document.documentElement?.getAttribute("lang") : "";
  return root || DEFAULT_LANG;
}

/** Registered table key serving `lang` ("fr-CA" → "fr-ca", else "fr"), or null. */
function tableKey(lang) {
  if (!store.tables.size || !lang) return null;
  let key = String(lang).toLowerCase();
  for (;;) {
    if (store.tables.has(key)) return key;
    const cut = key.lastIndexOf("-");
    if (cut < 1) return null;
    key = key.slice(0, cut);
  }
}

/** True once the app registered any table (cheap guard before a lookup). */
export const hasTables = () => store.tables.size > 0;

/** True when the app registered translations (possibly empty) serving this language. */
export const hasLang = (lang) => tableKey(lang) !== null;

/**
 * Formatting locale (Intl) for an element whose `locale` attribute is `value`.
 * `fallback`: "en-US" for a fixed default, or "page" to follow the language like "auto".
 */
export function localeOf(el, value, fallback = DEFAULT_LANG) {
  if (value && value !== "auto") return value;
  const lang = langOf(el);
  if (value === "auto" || fallback === "page" || hasLang(lang)) return lang;
  return fallback;
}

/** Prop spec: `locale` attribute, en-US by default ("auto" or a registered language follows the page). */
export const LOCALE = Object.freeze({ type: String, default: DEFAULT_LANG, locale: DEFAULT_LANG });
/** Prop spec: `locale` attribute that follows the page language by default. */
export const PAGE_LOCALE = Object.freeze({ type: String, locale: "page" });

/** The app's strings for this element in its language, or null. */
export function appStrings(el) {
  const key = tableKey(langOf(el));
  if (!key) return null;
  const table = store.tables.get(key);
  const tag = el.localName ?? "";
  return table[tag.replace(/^mv-/, "")] ?? table[tag] ?? null;
}

/**
 * Give translations for many components at once. `lang`: BCP 47 tag ("fr", "pt-BR").
 * `table`: { "<tag without mv->": { key: text | { one, other } } }. Merges with earlier calls.
 */
export function setStrings(lang, table = {}) {
  if (!lang || typeof lang !== "string") throw new TypeError("setStrings(lang, table): lang must be a language tag");
  const key = lang.toLowerCase();
  const into = store.tables.get(key) ?? {};
  for (const [name, texts] of Object.entries(table ?? {})) {
    if (!texts || typeof texts !== "object") continue;
    const comp = name.replace(/^mv-/, "");
    into[comp] = { ...into[comp], ...texts };
  }
  store.tables.set(key, into);
  observeLang();
  refresh();
}

/** The registered table for a language (a copy), e.g. to check coverage. */
export function getStrings(lang) {
  const key = tableKey(lang);
  return key ? structuredClone(store.tables.get(key)) : {};
}

/** Remove every registered table (tests, language packs swapped at run time). */
export function clearStrings() {
  store.tables.clear();
  refresh();
}

/** Re-render components that show strings or text defaults, under `root` (default: all). */
export function refresh(root) {
  for (const el of [...store.live]) {
    if (!el.isConnected) { store.live.delete(el); continue; }
    if (root && root !== el && !root.contains?.(el)) continue;
    if (!el.isMounted) continue;
    try {
      if (wrapped.has(el.constructor)) el.strings = overrides.get(el) ?? {};
      // Text defaults of attributes (label="Notifications"): the component re-applies them like an attribute change.
      for (const [key, attr] of texts.get(el.constructor) ?? []) {
        if (!el.hasAttribute(attr)) el.update?.(key, undefined, el[key]);
      }
    } catch (e) { queueMicrotask(() => { throw e; }); }
  }
}

function observeLang() {
  if (store.observing || typeof MutationObserver === "undefined" || typeof document === "undefined") return;
  store.observing = true;
  new MutationObserver((records) => {
    const roots = new Set(records.map((r) => r.target));
    for (const root of roots) refresh(root);
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"], subtree: true });
}

/**
 * Called by define(): routes a class's `strings` accessor through the registry. The component's own getter
 * still gives defaults + its overrides; the app's table slots in between. Without any table, the getter's
 * value is returned untouched, so nothing changes for a page that never calls setStrings.
 * A class with `static i18n = "manual"` places appStrings(this) itself (e.g. below texts from its markup).
 */
export function installStrings(ctor) {
  let proto = ctor.prototype, d;
  while (proto && !(d = Object.getOwnPropertyDescriptor(proto, "strings"))) proto = Object.getPrototypeOf(proto);
  if (!d?.get || !d?.set) return;
  if (wrapped.has(d.get)) { wrapped.add(ctor); return; }
  const { get, set } = d;
  const manual = ctor.i18n === "manual";
  const wget = function () {
    const base = get.call(this);
    if (manual) return base;
    const app = store.tables.size ? appStrings(this) : null;
    if (!app) return base;
    const own = overrides.get(this);
    return own ? layer(layer(base, app), own) : layer(base, app);
  };
  const wset = function (value) {
    overrides.set(this, value && typeof value === "object" ? { ...value } : null);
    set.call(this, value);
  };
  wrapped.add(wget);
  wrapped.add(ctor);
  Object.defineProperty(ctor.prototype, "strings", { configurable: true, enumerable: d.enumerable, get: wget, set: wset });
}

const plain = (v) => v !== null && typeof v === "object" && Object.getPrototypeOf(v) === Object.prototype;

/** { ...under, ...over }, one level deep for nested groups (names: {…}, plural forms { one, other }). */
function layer(under, over) {
  const out = { ...under };
  for (const [k, v] of Object.entries(over)) out[k] = plain(v) && plain(under?.[k]) ? { ...under[k], ...v } : v;
  return out;
}

/** Called by define() (installProps): String props whose default is a text, translatable by prop name. */
export function textProps(ctor, list) {
  if (list.length) texts.set(ctor, list);
}

/** Called by MvElement on (dis)connection: components with strings or text defaults re-render when the language changes. */
export function track(el, on) {
  if (!wrapped.has(el.constructor) && !texts.has(el.constructor)) return;
  if (on) store.live.add(el);
  else store.live.delete(el);
}
