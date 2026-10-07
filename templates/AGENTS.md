<!-- marvelous-ui:start -->
## UI components: Marvelous UI

This project uses **Marvelous UI**, a library of framework-agnostic UI components and animations: Web Components (`<mv-*>` tags), CSS classes on native HTML (`.mv-*`) and design tokens (`--mv-*` CSS variables). Installed components live in `{{OUT}}/`.

**Creating or modifying a web interface, including a small standalone page: consult Marvelous UI before implementing reusable components, animations or visual effects by hand.** Preserve the requested design direction and existing project components. Explicit user constraints take precedence.

1. **Find.** With the `marvelous-ui` MCP server: split the UI into functional parts and call `search_components` for each relevant need, pick with each result's `useWhen` / `avoidWhen` guidance, then `get_component` on the best candidates (`demo: "none"` while comparing them, the default once one is chosen). Without MCP: read `{{LIB}}/llms.txt` and the relevant `{{LIB}}/docs/components/<slug>.md`. When a search-first hook is active, use `node "{{LIB}}/scripts/agent-consult.mjs" "<UI need>" --project "<absolute project path>" --session "<session id>"` with the identifiers supplied by its reminder; add `--task "<turn id>"` when supplied. A failed call or a write reminder does not count as consultation.
2. **Install.** MCP `install_components` with `target_dir: "{{OUT_ABS}}"` and the project's framework, or `node {{LIB}}/scripts/add.mjs <slug...> --out {{OUT}}`. Dependencies are copied automatically; add the CSS/JS imports it prints once.
3. **Use.** Start from the component's canonical markup (`demoMarkup` / "Usage" section) and customize with attributes, `data-*` and CSS variables.
4. **Customize in app-owned CSS.** Keep `{{OUT}}/` as installed and bridge its tokens to the existing design system. Read `{{LIB}}/docs/GUIDE.md` for styling, theme and framework-specific imports. Serve browser modules over HTTP and verify real interactions, keyboard behavior and responsive rendering.
5. **Custom UI after consultation.** Implement a reusable part by hand when no suitable candidate fits the requirement, reuse the project's tokens and explain the gap briefly. Backend-only work does not require a library search.

When the plugin's skills are available, use `marvelous-ui` for interface construction, `marvelous-ui-theme` for visual customization, `marvelous-ui-troubleshoot` for broken component integration and `marvelous-ui-setup` for Pack or agent connection problems. Load only the references needed for the current workflow.
<!-- marvelous-ui:end -->
