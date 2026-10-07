---
name: marvelous-ui-setup
description: Install, connect, update or repair the Marvelous UI Pack, agent plugin and MCP server. Use for missing tools, agent configuration, plugin or hook activation, version updates and installation conflicts, rather than ordinary interface construction.
---

# Set up Marvelous UI

**Pack root**: the folder two levels above this file. It holds `docs/GUIDE.md`, `docs/MCP.md`, `scripts/init-agent.mjs` and `mcp/server.mjs`.

## Establish the current installation

Inspect the installed Pack version, scope and current agent configuration before choosing a setup command. Use the Pack's `docs/GUIDE.md` for installation, update, restore and uninstall behavior; use `docs/MCP.md` for per-agent connection instructions and project-root boundaries. Read [references/connection-checks.md](references/connection-checks.md) for connection or activation failures.

Use project scope for a single requested project and user scope when the user requests several projects. Preserve existing agent selections and unrelated settings. Keep one Marvelous connection per agent so duplicate plugin and standalone MCP entries do not expose duplicate tools.

Review locally changed files before applying an update or replacing a conflict. A user-level Pack update does not refresh component copies already installed in projects. Use the managed CLI or setup script appropriate to the existing installation rather than rewriting the whole config by hand. Check its current help when options are uncertain.

Hook trust is separate from plugin activation. Inspect and explain the agent's trust state; the user must approve executable hooks through the agent's supported trust flow. Never write approval records or weaken trust checks to make a hook run.

## Verify the connection

After the agent reloads its configuration, verify a real `search_components` call and the version or Pack path in use. For hooks, observe a harmless UI edit in an isolated test project and whether its consultation prerequisite is enforced. Configuration on disk is not proof that a running session has loaded it.

Report the connected agent, scope, Pack version, MCP result and hook state separately. If a restart or user trust action remains necessary, state that the connection or hook is unverified until that action is completed.
