/**
 * Motion helpers. Every animated component goes through these so that
 * prefers-reduced-motion and the `data-motion` override are honored.
 */

export const easing = {
  out: "cubic-bezier(0.22, 1, 0.36, 1)",
  in: "cubic-bezier(0.55, 0, 1, 0.45)",
  inOut: "cubic-bezier(0.65, 0, 0.35, 1)",
  emphasized: "cubic-bezier(0.2, 0, 0, 1)",
  linear: "linear",
  spring:
    "linear(0, 0.009, 0.035 2.1%, 0.141, 0.281 6.7%, 0.723 12.9%, 0.938 16.7%, 1.017, 1.077, 1.121, 1.149 24.3%, 1.159, 1.163, 1.161, 1.154 29.9%, 1.129 32.8%, 1.051 39.6%, 1.017 43.1%, 0.991, 0.977 51%, 0.974 53.8%, 0.975 57.1%, 0.997 69.8%, 1.003 76.9%, 1)",
};

export const duration = { instant: 80, fast: 150, normal: 240, slow: 400, slower: 700 };

const mq = typeof matchMedia === "function" ? matchMedia("(prefers-reduced-motion: reduce)") : null;

/**
 * True when motion should be reduced: OS setting, <html data-motion="reduce">, or, when `el` is given, a
 * data-motion="reduce" region around it. A region can only reduce; data-motion="full" is honored on <html> only.
 */
export function reducedMotion(el) {
  if (el?.closest?.('[data-motion="reduce"]')) return true;
  const override = document.documentElement.dataset.motion;
  if (override === "reduce") return true;
  if (override === "full") return false;
  return Boolean(mq?.matches);
}

/** Call `cb(reduced)` whenever the reduced-motion preference changes (for `el`, its region included). */
export function onMotionChange(cb, signal, el) {
  let last = reducedMotion(el);
  const check = () => {
    const now = reducedMotion(el);
    if (now !== last) cb((last = now));
  };
  mq?.addEventListener("change", check, { signal });
  const mo = new MutationObserver(check);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-motion"], subtree: true });
  signal?.addEventListener("abort", () => mo.disconnect(), { once: true });
}

/**
 * Speed factor of an element's frame loops: the nearest data-motion-rate (0 pauses, 0.5 runs at half speed).
 * motion-budget sets it on the loops it slows down; an app can set it on any region.
 */
export function motionRate(el) {
  const rate = parseFloat(el?.closest?.("[data-motion-rate]")?.dataset.motionRate);
  return Number.isFinite(rate) && rate >= 0 ? rate : 1;
}

/** Element.animate() that becomes instant under reduced motion. */
export function animate(el, keyframes, options = {}) {
  const opts = typeof options === "number" ? { duration: options } : { ...options };
  opts.easing ??= easing.out;
  opts.fill ??= "both";
  if (reducedMotion(el)) {
    opts.duration = 0;
    opts.delay = 0;
    opts.iterations = 1;
  }
  return el.animate(keyframes, opts);
}

/**
 * FLIP: measure `elements`, run `mutate()`, then slide every element that moved from its old box to its new one
 * (`transform: translate()` keyframes, no resize). Elements removed or hidden by `mutate` are skipped, a new flip
 * cancels the element's previous one (animation id "mv-flip"), and reduced motion just applies the change.
 * Returns the animations started.
 */
export function flip(elements, mutate, { duration = 220, easing: ease } = {}) {
  const before = new Map([...elements].map((el) => [el, el.getBoundingClientRect()]));
  mutate();
  const out = [];
  for (const [el, r] of before) {
    if (!el.isConnected || el.hidden || reducedMotion(el)) continue;
    const n = el.getBoundingClientRect();
    const dx = r.left - n.left;
    const dy = r.top - n.top;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue;
    for (const a of el.getAnimations()) if (a.id === "mv-flip") a.cancel();
    const a = animate(el, [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], { duration, easing: ease, fill: "none" });
    a.id = "mv-flip";
    out.push(a);
  }
  return out;
}

/**
 * requestAnimationFrame loop that pauses when the target is offscreen or the
 * tab is hidden. `cb(time, dt)`, dt in seconds. Returns { start, stop, running }.
 * With a target: a data-motion="reduce" region around it stops the loop, data-motion-rate scales dt (0 stops it),
 * and the target is marked data-motion-source="loop" so that motion-budget finds it.
 */
export function frameLoop(cb, { target, signal, autostart = true, respectMotion = true } = {}) {
  let raf = 0;
  let last = 0;
  let visible = true;
  let wanted = autostart;
  let rate = motionRate(target);

  const tick = (t) => {
    const dt = last ? Math.min((t - last) / 1000, 0.1) * rate : 0;
    last = t;
    raf = 0;
    cb(t, dt);
    // cb may have called stop() (or start()); only reschedule if still wanted.
    if (!raf && canRun()) raf = requestAnimationFrame(tick);
  };
  const canRun = () => wanted && visible && rate > 0 && !document.hidden && !(respectMotion && reducedMotion(target));
  const sync = () => {
    if (canRun() && !raf) {
      last = 0;
      raf = requestAnimationFrame(tick);
    } else if (!canRun() && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  if (target) {
    if (!target.hasAttribute("data-motion-source")) target.setAttribute("data-motion-source", "loop");
    const mo = new MutationObserver(() => {
      rate = motionRate(target);
      sync();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-motion-rate"], subtree: true });
    signal?.addEventListener("abort", () => mo.disconnect(), { once: true });
  }
  if (target && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    io.observe(target);
    signal?.addEventListener("abort", () => io.disconnect(), { once: true });
  }
  document.addEventListener("visibilitychange", sync, { signal });
  if (respectMotion) onMotionChange(sync, signal, target);
  signal?.addEventListener("abort", () => {
    wanted = false;
    sync();
  }, { once: true });

  sync();
  return {
    start() { if (signal?.aborted) return; wanted = true; sync(); }, // a disconnected element never restarts
    stop() { wanted = false; sync(); },
    get running() { return raf !== 0; },
  };
}

/** Critically-damped-ish spring stepper for JS-driven values. */
export function spring({ stiffness = 170, damping = 26, mass = 1, value = 0 } = {}) {
  let v = 0;
  let x = value;
  let target = value;
  return {
    set(t) { target = t; },
    jump(t) { target = t; x = t; v = 0; },
    get value() { return x; },
    get target() { return target; },
    get settled() { return Math.abs(target - x) < 0.001 && Math.abs(v) < 0.001; },
    step(dt) {
      const steps = Math.max(1, Math.ceil(dt / (1 / 120)));
      const h = dt / steps;
      for (let i = 0; i < steps; i++) {
        const a = (-stiffness * (x - target) - damping * v) / mass;
        v += a * h;
        x += v * h;
      }
      return x;
    },
  };
}

/** Run a DOM update inside a View Transition when supported. */
export function viewTransition(update) {
  if (!document.startViewTransition || reducedMotion()) {
    update();
    return null;
  }
  return document.startViewTransition(update);
}
