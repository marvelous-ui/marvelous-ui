# Integration diagnostics

## Styled but inert

Check the page origin first: module scripts need HTTP, not `file://`. Inspect failed module requests and imported registration scripts. Confirm the required tag is defined using `customElements.get("mv-<name>")`. In SSR apps, registration must run in the browser. Use the component's canonical markup, including required nested native elements.

## Missing or unexpected styles

Inspect loaded CSS and computed styles. Tokens must load before component CSS. Check app overrides, cascade layers and the component's documented `data-*` variants. With Tailwind v4, declare `@layer theme, base, mv, components, utilities;` before imports. The Pack's `docs/GUIDE.md` defines the supported layering and token behavior.

## Framework or TypeScript diagnostics

Include installation-generated `marvelous.d.ts` in React TypeScript projects. Vue needs `compilerOptions.isCustomElement` for `mv-` tags; Angular needs `CUSTOM_ELEMENTS_SCHEMA`. Read the relevant framework section in `docs/GUIDE.md` for the actual fix and avoid suppressing unrelated errors.

## Controlled state and nested events

Read the component's event and method API. Keep application state synchronized when Escape or the backdrop closes a controlled component. `mv-*` events bubble: a nested date picker or combobox can emit `mv-close`, so an outer dialog's handler must check `event.target === event.currentTarget` before closing that dialog.

## Properties after hydration

For arrays and objects passed before the custom element is registered, wait for `customElements.whenDefined` and assign through the element reference. Verify the property value after upgrade instead of changing it into a serialized attribute unless the API explicitly supports that format.

## Installation boundary or conflicting files

Use `docs/MCP.md`, Where installs can write, to inspect the configured project root and the actual destination. An outside-root refusal writes nothing. Existing content conflicts need inspection before overwrite; preserve local edits and use the Pack's local install script or bundle workflow when the MCP starts from the Pack rather than the app.
