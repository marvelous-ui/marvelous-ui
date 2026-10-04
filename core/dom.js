/** Small DOM + math helpers shared by Marvelous UI components. */

let counter = 0;
/** Stable unique id for aria wiring. */
export const uid = (prefix = "mv") => `${prefix}-${(++counter).toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const mapRange = (v, inMin, inMax, outMin, outMax) =>
  outMin + ((v - inMin) * (outMax - outMin)) / (inMax - inMin);
export const random = (min, max) => min + Math.random() * (max - min);

/** addEventListener that returns its own remover and accepts a signal. */
export function on(target, type, handler, options = {}) {
  target.addEventListener(type, handler, options);
  return () => target.removeEventListener(type, handler, options);
}

/** Ensure an element has an id and return it. */
export function ensureId(el, prefix) {
  if (!el.id) el.id = uid(prefix);
  return el.id;
}

/** Read a CSS custom property (or any property) as a trimmed string. */
export const cssVar = (el, name) => getComputedStyle(el).getPropertyValue(name).trim();

/** Parse a CSS time ("240ms" | "0.4s") into milliseconds. */
export function parseTime(value, fallback = 0) {
  if (!value) return fallback;
  const n = parseFloat(value);
  if (Number.isNaN(n)) return fallback;
  return value.trim().endsWith("ms") ? n : n * 1000;
}

/** Create an element from a tag, attributes and children. */
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === false || v === null || v === undefined) continue;
    if (k === "class") el.className = v;
    else if (k === "style" && typeof v === "object") Object.assign(el.style, v);
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? "" : v);
  }
  el.append(...children.flat().filter((c) => c !== null && c !== undefined && c !== false));
  return el;
}

/** Split text into span-wrapped words/chars, keeping it accessible. */
export function splitText(el, { by = "chars", className = "mv-split" } = {}) {
  const text = el.textContent ?? "";
  el.setAttribute("aria-label", text.trim());
  el.textContent = "";
  const parts = [];
  const words = text.split(/(\s+)/);
  let index = 0;
  for (const word of words) {
    if (/^\s+$/.test(word)) {
      el.append(document.createTextNode(word));
      continue;
    }
    if (!word) continue;
    const wordEl = h("span", { class: `${className}-word`, "aria-hidden": "true" });
    if (by === "words") {
      wordEl.textContent = word;
      wordEl.style.setProperty("--mv-i", index++);
      parts.push(wordEl);
    } else {
      for (const ch of Array.from(word)) {
        const charEl = h("span", { class: `${className}-char` }, ch);
        charEl.style.setProperty("--mv-i", index++);
        wordEl.append(charEl);
        parts.push(charEl);
      }
    }
    el.append(wordEl);
  }
  el.style.setProperty("--mv-count", index);
  return parts;
}

/** Add/remove ids in a space-separated ARIA attribute (aria-describedby, aria-labelledby, aria-controls…). */
export const ariaList = {
  add(el, id, attr = "aria-describedby") {
    const ids = new Set((el.getAttribute(attr) ?? "").split(/\s+/).filter(Boolean));
    ids.add(id);
    el.setAttribute(attr, [...ids].join(" "));
  },
  remove(el, id, attr = "aria-describedby") {
    const ids = (el.getAttribute(attr) ?? "").split(/\s+/).filter((x) => x && x !== id);
    ids.length ? el.setAttribute(attr, ids.join(" ")) : el.removeAttribute(attr);
  },
};

/** Split a comma-separated list, ignoring commas inside parentheses: "oklch(1 0 0), rgb(1,2,3)" → 2 items. */
export function parseList(value) {
  const out = [];
  let depth = 0;
  let cur = "";
  for (const ch of String(value ?? "")) {
    if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    if (ch === "," && depth === 0) {
      if (cur.trim()) out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

/** Visually hidden text for screen readers (more robust than aria-label on generic elements). */
export function srOnly(text) {
  const s = document.createElement("span");
  s.className = "mv-sr-only";
  s.textContent = text;
  return s;
}

/** Normalize for accent/case-insensitive matching ("Élan" → "elan"). */
export const fold = (s) => String(s ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

const relativeFormats = new Map();
/** Cached Intl.RelativeTimeFormat (numeric: "auto") for a locale, en-US for an invalid tag, null without Intl. */
function relativeFormat(locale) {
  const key = locale || "en-US";
  if (relativeFormats.has(key)) return relativeFormats.get(key);
  let rtf = null;
  if (typeof Intl !== "undefined" && Intl.RelativeTimeFormat) {
    try { rtf = new Intl.RelativeTimeFormat(key, { numeric: "auto" }); } catch { rtf = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" }); }
  }
  relativeFormats.set(key, rtf);
  return rtf;
}

/**
 * Time elapsed since `time` (ms), in words: "12 seconds ago", "3 minutes ago", "yesterday". Each unit is rounded
 * from the previous one (seconds, minutes, hours, days). Under `recent` seconds it returns `recentText`, by default
 * the locale's "now"; `seconds: false` goes straight from recent to minutes.
 */
export function timeAgo(time, { now = Date.now(), locale = "en-US", recent = 5, recentText, seconds = true } = {}) {
  const rtf = relativeFormat(locale);
  const s = Math.round((now - time) / 1000);
  if (!rtf) return recentText ?? "now";
  if (s < recent) return recentText ?? rtf.format(0, "second");
  if (seconds && s < 60) return rtf.format(-s, "second");
  const m = Math.round(s / 60);
  if (m < 60) return rtf.format(-m, "minute");
  const hrs = Math.round(m / 60);
  if (hrs < 24) return rtf.format(-hrs, "hour");
  return rtf.format(-Math.round(hrs / 24), "day");
}

/** Grapheme-safe split (emoji, combining marks). */
export function graphemes(text) {
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    return [...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text)].map((s) => s.segment);
  }
  return Array.from(text);
}
