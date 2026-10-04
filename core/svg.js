/** SVG helpers: an element factory and a registry of shared filters. */

export const SVG_NS = "http://www.w3.org/2000/svg";

/** Create an SVG element from a tag, attributes and children (false, null and undefined are skipped). */
export function svgEl(tag, attrs = {}, ...children) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === false || v === null || v === undefined) continue;
    node.setAttribute(k, v === true ? "" : v);
  }
  node.append(...children.flat().filter((c) => c !== null && c !== undefined && c !== false));
  return node;
}

const containers = new WeakMap(); // document or shadow root → <defs>

/**
 * Define the filter `id` once per document (or per shadow root, for `scope` = node.getRootNode()) and return
 * "url(#id)". `build()` returns the <filter> element, id left out; it only runs the first time, so identical
 * filters are shared instead of copied into every instance. Filters live in one hidden <svg data-mv-filters>.
 */
export function ensureFilter(id, build, scope = document) {
  const url = `url(#${id})`;
  if (scope.getElementById(id)) return url;
  let defs = containers.get(scope);
  if (!defs?.isConnected) {
    defs = svgEl("defs");
    const svg = svgEl("svg", { "data-mv-filters": "", "aria-hidden": "true", focusable: "false", width: "0", height: "0", style: "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none" }, defs);
    (scope.body ?? scope).append(svg);
    containers.set(scope, defs);
  }
  const filter = build();
  filter.setAttribute("id", id);
  if (!filter.hasAttribute("color-interpolation-filters")) filter.setAttribute("color-interpolation-filters", "sRGB");
  defs.append(filter);
  return url;
}
