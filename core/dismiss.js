/**
 * Call `onDismiss(reason)` on outside pointerdown or Escape.
 * `ignore`: extra elements considered "inside" (e.g. the trigger).
 */
export function dismissable(el, onDismiss, { signal, outside = true, escape = true, ignore = [] } = {}) {
  if (outside) {
    document.addEventListener("pointerdown", (e) => {
      const path = e.composedPath();
      if (path.includes(el) || ignore.some((node) => node && path.includes(node))) return;
      onDismiss("outside", e);
    }, { signal, capture: true });
  }
  if (escape) {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !e.defaultPrevented) onDismiss("escape", e);
    }, { signal });
  }
}
