# Framework integration

Read only the section for the project's framework. Use the Pack's `docs/GUIDE.md` for complete snippets and the selected component's doc for its content structure and API.

## HTML and static pages

Publish the installed folder through the app's HTTP server. Load tokens before component styles and register component JS with `type="module"`. A page opened with `file://` can appear styled while browser module loading fails. Use the project's server or an HTTP static server to verify interaction.

## React 19 and TypeScript

Use custom element tags directly. React 19 supports event props named `on` plus the exact event name, such as `onmv-close`. Keep `marvelous.d.ts`, produced by installation, within the TypeScript project's include paths. For named exports from JS modules without declarations, use the project's JS typing configuration as described in `docs/GUIDE.md`.

## Next.js and other SSR frameworks

Import CSS at the appropriate app entrypoint. Register elements on the client, after the browser environment exists. Arrays and objects assigned before registration may not reach the custom element's property setter: assign them through a ref after `customElements.whenDefined("mv-combobox")`, adapting the element name to the API used.

## Vue and Nuxt

Configure `compilerOptions.isCustomElement` for names starting with `mv-`. Vue events use their actual event name, for example `@mv-close`. In Nuxt, register JS through a client plugin and include component CSS through the app's style configuration.

## Svelte and Angular

Svelte accepts the tags directly; use the event syntax supported by the installed Svelte version. In SvelteKit, keep DOM registration in the client environment. Angular requires `CUSTOM_ELEMENTS_SCHEMA` in the component or module using the tags.

## Astro

Publish the installed assets or import them through Astro's build pipeline. Load component registration in browser scripts. Follow the same HTTP and module requirements as static HTML.

## Bubbling events in every framework

`mv-*` events bubble. A combobox or date picker inside a dialog can emit its own `mv-close`. A handler controlling the outer dialog must verify `event.target === event.currentTarget` before closing the outer state.

## Tailwind v4

Declare `@layer theme, base, mv, components, utilities;` before style imports so utilities override component styles in the intended layer order.
