/**
 * Anchor positioning for floating elements (popover, tooltip, menu).
 * The floating element is placed with `position: fixed` (works in the top
 * layer too). Supports flip + shift and exposes `data-side` / `data-align`
 * plus `--mv-origin` (transform-origin) for enter animations.
 *
 * placement: "top" | "bottom" | "left" | "right" with optional "-start" | "-end"
 */
export function place(floating, anchor, { placement = "bottom", offset = 8, alignOffset = 0, padding = 8, flip = true, shift = true } = {}) {
  const [side0, align = "center"] = placement.split("-");
  // `anchor` may be an element or a virtual anchor: { getBoundingClientRect() } or { x, y } (pointer point).
  const a = typeof anchor.getBoundingClientRect === "function"
    ? anchor.getBoundingClientRect()
    : { left: anchor.x, right: anchor.x, top: anchor.y, bottom: anchor.y, width: 0, height: 0 };
  // Untransformed size: enter animations (scale) must not skew the measurement.
  // Stand-in objects without offset* fall back to their getBoundingClientRect().
  const f = floating.offsetWidth !== undefined
    ? { width: floating.offsetWidth, height: floating.offsetHeight }
    : floating.getBoundingClientRect();
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;

  const fits = (side) => {
    if (side === "top") return a.top - offset - f.height >= padding;
    if (side === "bottom") return a.bottom + offset + f.height <= vh - padding;
    if (side === "left") return a.left - offset - f.width >= padding;
    return a.right + offset + f.width <= vw - padding;
  };
  const opposite = { top: "bottom", bottom: "top", left: "right", right: "left" };
  let side = side0;
  if (flip && !fits(side) && fits(opposite[side])) side = opposite[side];

  let x;
  let y;
  const vertical = side === "top" || side === "bottom";
  if (vertical) {
    y = side === "top" ? a.top - offset - f.height : a.bottom + offset;
    x = align === "start" ? a.left : align === "end" ? a.right - f.width : a.left + a.width / 2 - f.width / 2;
  } else {
    x = side === "left" ? a.left - offset - f.width : a.right + offset;
    y = align === "start" ? a.top : align === "end" ? a.bottom - f.height : a.top + a.height / 2 - f.height / 2;
  }

  if (vertical) x += alignOffset; else y += alignOffset;

  if (shift) {
    x = Math.min(Math.max(x, padding), Math.max(padding, vw - f.width - padding));
    y = Math.min(Math.max(y, padding), Math.max(padding, vh - f.height - padding));
  }

  floating.style.position = "fixed";
  floating.style.inset = "auto";
  floating.style.margin = "0";
  floating.style.left = `${Math.round(x)}px`;
  floating.style.top = `${Math.round(y)}px`;
  floating.dataset.side = side;
  floating.dataset.align = align;

  // Arrow offset + transform origin relative to the anchor center
  const ax = a.left + a.width / 2 - x;
  const ay = a.top + a.height / 2 - y;
  floating.style.setProperty("--mv-arrow-x", `${Math.round(ax)}px`);
  floating.style.setProperty("--mv-arrow-y", `${Math.round(ay)}px`);
  const origin = vertical
    ? `${Math.round(ax)}px ${side === "top" ? "100%" : "0%"}`
    : `${side === "left" ? "100%" : "0%"} ${Math.round(ay)}px`;
  floating.style.setProperty("--mv-origin", origin);
  return { side, align, x, y };
}

/** Keep `floating` positioned while `signal` is alive (scroll, resize, size changes). */
export function autoPlace(floating, anchor, options = {}, signal) {
  let raf = 0;
  const run = () => {
    raf = 0;
    if (anchor.isConnected === false || !floating.isConnected) return;
    place(floating, anchor, options);
  };
  const schedule = () => { if (!raf) raf = requestAnimationFrame(run); };
  window.addEventListener("scroll", schedule, { capture: true, passive: true, signal });
  window.addEventListener("resize", schedule, { passive: true, signal });
  const ro = new ResizeObserver(schedule);
  ro.observe(floating);
  if (anchor instanceof Element) ro.observe(anchor);
  signal?.addEventListener("abort", () => { ro.disconnect(); cancelAnimationFrame(raf); }, { once: true });
  run();
  return run;
}
