---
name: marvelous-ui-troubleshoot
description: Diagnose and fix broken Marvelous UI integrations, including inert components, missing imports or styles, custom element registration, framework typing, bubbling events and rendering problems. Use when existing mv-* components fail to behave or display as expected.
---

# Troubleshoot Marvelous UI

**Pack root**: the folder two levels above this file. It holds `docs/GUIDE.md`, `docs/MCP.md` and `docs/components/`.

Reproduce the reported behavior and inspect the actual browser error, network request, event or framework diagnostic. Read the affected component's API with `get_component` or its Pack doc before changing markup or handlers. Preserve the installed component source and diagnose app integration first.

Read [references/diagnostics.md](references/diagnostics.md) for the observed failure category. The Pack's `docs/GUIDE.md` is the shared source for framework snippets and imports. If the problem is the agent connection rather than the rendered component, use `marvelous-ui-setup` when available.

Make the narrow correction supported by the evidence. When a replacement component is needed, consult the library through `marvelous-ui` before implementing a new reusable interface.

Reproduce the original interaction after the correction. Verify the concrete element, its state and the relevant event or request, including a nested-component case if the failure involves bubbling. Report the cause, the correction and the behavior actually verified; an import that compiles does not establish browser behavior.
