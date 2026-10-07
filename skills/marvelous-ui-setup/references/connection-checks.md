# Connection and activation checks

## Missing MCP tools

Verify Node.js meets the Pack requirement and the configured path resolves to `mcp/server.mjs`. Compare the active agent configuration with `docs/MCP.md`. Reload the agent or its MCP servers after a config change; a still-open session may keep its old tool list.

If startup reports `Cannot find package '@modelcontextprotocol/server'`, verify dependencies in the actual Pack used by the agent. Run `npm ci` there when the requested setup authorizes dependency installation, then reload the connection.

## Refused installation destination

Inspect `MARVELOUS_PROJECT_ROOT` or the server's working directory. The project-scoped setup supplies the root automatically. User plugin servers may start from the Pack, so use `scripts/add.mjs --out <absolute project destination>` or `get_install_bundle` for that app instead of weakening the MCP boundary.

## Skills or hooks absent

Check the installed Pack contains all four skill folders, their relative references and the hook files advertised by its manifest. Confirm the agent supports this plugin format and has loaded the new version. Check hook trust through the agent's native mechanism separately from plugin enablement. Preserve customized skill files during migration.

## Hook reminders repeat

Capture the event's project, session and task identifiers and whether a successful component search occurred in that context. A failed MCP call or a denied write is not consultation. If MCP is unavailable, read the local catalog using `scripts/agent-consult.mjs` with the identifiers supplied by the reminder, then inspect the relevant component docs. Diagnose mismatched identifiers or unsupported event formats rather than editing the hook state manually.

## Update and restore conflicts

Use the CLI preview and conflict report before replacement. Preserve locally changed files. The Pack's `docs/GUIDE.md` defines ownership, saved archives, restoration and uninstall semantics; inspect those before any cleanup. Keep authentication credentials private while investigating setup.
