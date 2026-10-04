/** Focus management: focusable lookup, focus trap, roving tabindex. */

const FOCUSABLE = [
  "a[href]", "area[href]", "button:not([disabled])", "input:not([disabled]):not([type=hidden])",
  "select:not([disabled])", "textarea:not([disabled])", "iframe", "summary",
  "[contenteditable]:not([contenteditable=false])", "[tabindex]:not([tabindex='-1'])",
].join(",");

export function getFocusable(root) {
  return [...root.querySelectorAll(FOCUSABLE)].filter(
    (el) => !el.closest("[inert]") && el.getClientRects().length > 0,
  );
}

/** Keep Tab / Shift+Tab inside `root` while `signal` is alive. */
export function trapFocus(root, signal) {
  root.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    const items = getFocusable(root);
    if (!items.length) {
      e.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, { signal });
}

/**
 * Roving tabindex over `getItems()` inside `container`.
 * orientation: "horizontal" | "vertical" | "both"
 * Returns { focus(index), sync() }.
 */
export function roving(container, getItems, { orientation = "horizontal", loop = true, signal, onMove } = {}) {
  const keys = {
    horizontal: { prev: ["ArrowLeft"], next: ["ArrowRight"] },
    vertical: { prev: ["ArrowUp"], next: ["ArrowDown"] },
    both: { prev: ["ArrowLeft", "ArrowUp"], next: ["ArrowRight", "ArrowDown"] },
  }[orientation];

  const enabled = () => getItems().filter((el) => !el.disabled && el.getAttribute("aria-disabled") !== "true" && !el.closest("[inert]"));

  const sync = (active) => {
    const items = getItems();
    const current = active ?? items.find((el) => el.tabIndex === 0) ?? enabled()[0];
    for (const el of items) el.tabIndex = el === current ? 0 : -1;
  };

  const focus = (el) => {
    if (!el) return;
    sync(el);
    el.focus();
    onMove?.(el);
  };

  container.addEventListener("keydown", (e) => {
    const items = enabled();
    const index = items.indexOf(document.activeElement);
    if (index === -1) return;
    let next = null;
    if (keys.prev.includes(e.key)) next = items[index - 1] ?? (loop ? items.at(-1) : null);
    else if (keys.next.includes(e.key)) next = items[index + 1] ?? (loop ? items[0] : null);
    else if (e.key === "Home") next = items[0];
    else if (e.key === "End") next = items.at(-1);
    if (next) {
      e.preventDefault();
      focus(next);
    }
  }, { signal });

  container.addEventListener("focusin", (e) => {
    if (getItems().includes(e.target)) sync(e.target);
  }, { signal });

  sync();
  return { focus, sync };
}

/**
 * Typeahead: typed letters move to the next item whose label starts with the
 * typed string (accent/case-insensitive).
 */
export function typeahead(container, getItems, { getLabel = (el) => el.textContent, onMatch, signal, timeout = 600 } = {}) {
  let buffer = "";
  let timer = 0;
  const fold = (s) => String(s ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
  container.addEventListener("keydown", (e) => {
    if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey || (e.key === " " && !buffer)) return;
    buffer += fold(e.key);
    clearTimeout(timer);
    timer = setTimeout(() => (buffer = ""), timeout);
    const items = getItems();
    const current = items.indexOf(document.activeElement);
    const ordered = [...items.slice(current + 1), ...items.slice(0, current + 1)];
    const match = ordered.find((el) => fold(getLabel(el)).startsWith(buffer));
    if (match) {
      e.preventDefault();
      onMatch ? onMatch(match) : match.focus();
    }
  }, { signal });
}
