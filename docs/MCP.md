# Marvelous UI for AI coding agents

Marvelous UI is built to be used by AI coding agents as much as by people. Whatever agent you use (Claude Code, Codex, Cursor, VS Code Copilot, Antigravity, Devin Desktop, Zed…), it gets two things:

1. **An MCP server** (`mcp/server.mjs`): the agent searches the library by need, reads each component's real API and canonical markup, and installs components with their dependencies into your project. It follows the open [Model Context Protocol](https://modelcontextprotocol.io), so any MCP-capable agent can use it.
2. **Plain Markdown docs** that need no MCP at all: [`llms.txt`](../llms.txt) (the catalog, in the [llms.txt](https://llmstxt.org) format), [`COMPONENTS.md`](COMPONENTS.md), one page per component in [`docs/components/`](components/), and an `AGENTS.md` block with usage rules for your project.

Everything is generated from the same source (each component's `meta.json`), so people and agents read the same descriptions.

Requirements: Node.js 20 or later. The public setup command is `npx marvelous-ui-library@latest init`, run from your project folder. It installs the Free pack without an account or e-mail. Choose `project` or `user` installation interactively, or pass `--scope project|user`; noninteractive setup defaults to `project`. Project setup writes agent instructions and MCP configuration where supported. User setup detects Codex, Claude Code, Cursor and OpenCode, then lets you choose several by number or name. `--clients all` connects the detected supported agents; `--clients none` installs only the Pack. In automation, use `--scope user --clients codex,cursor,opencode`, `all` or `none`; the first noninteractive user setup defaults to `none` without this option. Codex and Claude Code need their command-line tools for automatic setup. After setup, restart your agent, reload Cursor, or reload its MCP servers.

The local Pack workflow below is also available. If you use it, run `npm ci` once in the Marvelous UI folder: it installs the MCP server's two dependencies at the exact versions locked in `package-lock.json` (the components themselves have none).

## Setup from a downloaded Pack

From the Marvelous UI folder, point the setup script at your web project:

```bash
node scripts/init-agent.mjs /path/to/your-app
```

It is safe to re-run and only touches what belongs to Marvelous UI:

| File in your project | Why |
|---|---|
| `AGENTS.md` | Adds (or updates) a Marvelous UI block: "search the library before hand-writing UI", how to install, theming and framework rules. `AGENTS.md` is the cross-agent convention read by Codex, Cursor, VS Code Copilot, Antigravity, Devin Desktop, Zed and more. |
| `CLAUDE.md` | Adds an `@AGENTS.md` import so Claude Code reads the same rules. |
| `.mcp.json` | Registers the MCP server for Claude Code. |
| `.cursor/mcp.json`, `.vscode/mcp.json`, `.agents/mcp_config.json`, `.devin/mcp_config.json`, `.gemini/settings.json` | Same for Cursor, VS Code, Antigravity, Devin Desktop and Gemini CLI, when the project already uses them (`.cursor/`, `.vscode/`, `.agents/`, `.devin/` or `.windsurf/`, `.gemini/` or `GEMINI.md`), or with `--clients`. |

Every MCP entry it writes sets `"env": { "MARVELOUS_PROJECT_ROOT": "<your project>" }`, so `install_components` writes into this project even if the agent starts the server from another folder ([Where installs can write](#where-installs-can-write)).

Options:

- `--out src/marvelous`: where components get installed (default `src/marvelous`, or `marvelous` when there is no `src/`).
- `--clients claude,cursor,vscode,antigravity,devin,gemini` or `--clients all` (all six): pick the agents explicitly.
- `--dry`: show what would change without writing.

Then restart your agent (or reload its MCP servers) and ask for UI as usual, for example: *"Add a pricing section with a monthly/yearly toggle and an FAQ below it."*

> The generated configs contain two absolute paths: your Marvelous UI folder and your project (`MARVELOUS_PROJECT_ROOT`). In a team, either keep both at the same path on every machine, or register the server per user (below) and commit only `AGENTS.md`.

## Install as a plugin

The Pack folder is also an agent plugin: a `marvelous-ui` skill with the usage rules (the same as the `AGENTS.md` block) plus the MCP server. Registered once, it serves every project. It ships in two formats: Claude Code (`.claude-plugin/`, `.mcp.json`) and [Agent Plugins 1.0](https://agent-plugins.org) (`plugin.json`, `mcp.json`, `skills/`).

For a Pack downloaded without the CLI (the Free ZIP, or a clone of this repository), run `npm ci` in its folder first, then print the manual commands:

```bash
node scripts/init-agent.mjs --plugin
```

It writes nothing and runs nothing: you run the commands yourself.

| Agent | Register the plugin (`<MARVELOUS_DIR>` = the Pack folder) |
|---|---|
| Claude Code | `claude plugin marketplace add <MARVELOUS_DIR>` then `claude plugin install marvelous-ui@marvelous-ui` (in a session: `/plugin marketplace add`, `/plugin install`) |
| Codex | `codex plugin marketplace add <MARVELOUS_DIR>` then `codex plugin add marvelous-ui@marvelous-ui` |
| Cursor | Copy the folder to `~/.cursor/plugins/local/marvelous-ui` (a copy, not a symlink), then **Developer: Reload Window** |
| OpenCode | Add the skill in `~/.config/opencode/skills/marvelous-ui` and the server in `~/.config/opencode/opencode.json` (see [OpenCode](#opencode)) |
| VS Code | User `settings.json`: `"chat.pluginLocations": { "<MARVELOUS_DIR>": true }` |
| Devin | `devin plugins install --local <MARVELOUS_DIR>` |
| Antigravity | No plugin yet: use the project setup above (`.agents/mcp_config.json`) |

- **Search first (Claude Code).** The plugin adds a hook: when the agent is about to create an HTML, CSS or component file without having called a Marvelous UI tool in the session, the write is refused once with a reminder to search the library, and the retry goes through. It stays quiet for the rest of the session.
- **Installs.** Claude Code gives the server your project folder, so `install_components` writes straight into it. The other agents start the server from the plugin folder: the skill then has the agent install with `scripts/add.mjs --out <absolute path>`.
- **One or the other.** For a given agent, use the plugin or the project MCP config, not both: the tools would appear twice.
- **Copies.** Codex and Cursor work on a copy of the folder (with `node_modules`). The CLI refreshes selected user agent connections after a user Pack update. Refresh a manually installed copy yourself.

The CLI can also disconnect the agents it connected: `npx marvelous-ui-library@latest uninstall --scope user`. It removes the shared Pack and its managed connections. `uninstall --scope project` removes that project's Pack; copied components and project agent configuration files remain for review. The CLI leaves unrelated agent entries alone.

## Manual setup per agent

Replace `<MARVELOUS_DIR>` with the absolute path of your Marvelous UI folder (forward slashes work on Windows too). In a project-level file you can add `"env": { "MARVELOUS_PROJECT_ROOT": "<absolute path of your project>" }` to the entry, as `init-agent` does; leave it out of a user-level file, which serves every project.

### Claude Code

```bash
# every project on this machine
claude mcp add --scope user marvelous-ui -- node <MARVELOUS_DIR>/mcp/server.mjs
# this project only (writes .mcp.json, shareable)
claude mcp add --scope project marvelous-ui -- node <MARVELOUS_DIR>/mcp/server.mjs
```

### Codex (CLI, IDE extension, app)

```bash
codex mcp add marvelous-ui -- node <MARVELOUS_DIR>/mcp/server.mjs
```

or in `~/.codex/config.toml`:

```toml
[mcp_servers.marvelous-ui]
command = "node"
args = ["<MARVELOUS_DIR>/mcp/server.mjs"]
```

Codex reads `AGENTS.md` natively.

### Cursor

`.cursor/mcp.json` in the project (or `~/.cursor/mcp.json` for every project):

```json
{ "mcpServers": { "marvelous-ui": { "command": "node", "args": ["<MARVELOUS_DIR>/mcp/server.mjs"] } } }
```

### OpenCode

For user-wide use, put the Pack skill in `~/.config/opencode/skills/marvelous-ui/SKILL.md` and set its Pack root to the absolute `<MARVELOUS_DIR>` path. Add this entry to `~/.config/opencode/opencode.json` (or `opencode.jsonc` if that is your existing config):

```json
{ "mcp": { "marvelous-ui": { "type": "local", "command": ["node", "<MARVELOUS_DIR>/mcp/server.mjs"], "enabled": true } } }
```

The CLI writes both entries when OpenCode is selected for user setup. It preserves unrelated settings and removes only its managed entries on user uninstall.

### VS Code (GitHub Copilot agent mode)

`.vscode/mcp.json` (note the `servers` key):

```json
{ "servers": { "marvelous-ui": { "type": "stdio", "command": "node", "args": ["<MARVELOUS_DIR>/mcp/server.mjs"] } } }
```

### Antigravity (successor of Gemini CLI)

`.agents/mcp_config.json` in the project (or `~/.gemini/config/mcp_config.json` for every project):

```json
{ "mcpServers": { "marvelous-ui": { "command": "node", "args": ["<MARVELOUS_DIR>/mcp/server.mjs"] } } }
```

Antigravity uses `serverUrl` only for remote servers; Marvelous UI runs locally, so `command` / `args` is all it needs.

### Devin Desktop (formerly Windsurf)

`.devin/mcp_config.json` in the project, or for every project `~/.config/devin/mcp_config.json` (macOS, Linux) or `%APPDATA%\devin\mcp_config.json` (Windows):

```json
{ "mcpServers": { "marvelous-ui": { "command": "node", "args": ["<MARVELOUS_DIR>/mcp/server.mjs"] } } }
```

These are the paths of the default Devin Local agent (and of Devin CLI 3000.3+). A Windsurf install from before the rename used `~/.codeium/windsurf/mcp_config.json`, with the same content; Devin's current docs no longer list it, so prefer the paths above.

### Gemini CLI (Gemini Code Assist Standard or Enterprise)

Since June 18, 2026, Gemini CLI only serves Gemini Code Assist Standard and Enterprise licenses and paid API keys; free, Google AI Pro and Ultra accounts moved to Antigravity (above). If you still use it: `.gemini/settings.json` in the project (or `~/.gemini/settings.json`):

```json
{ "mcpServers": { "marvelous-ui": { "command": "node", "args": ["<MARVELOUS_DIR>/mcp/server.mjs"] } } }
```

### Zed

In Zed's `settings.json`:

```json
{ "context_servers": { "marvelous-ui": { "command": "node", "args": ["<MARVELOUS_DIR>/mcp/server.mjs"] } } }
```

### Claude Desktop and other MCP clients

Any client that launches stdio MCP servers works with the same `command` / `args` pair: `node <MARVELOUS_DIR>/mcp/server.mjs`.

## Agents without MCP

Point the agent at the Markdown docs. Adding the `AGENTS.md` block (`node scripts/init-agent.mjs <project>` does it) is enough: it tells the agent to read `llms.txt`, open `docs/components/<slug>.md` for the chosen component, and install with `node <MARVELOUS_DIR>/scripts/add.mjs <slug...> --out src/marvelous`.

## How the agent picks components

The server tells connected agents to search the library before writing UI by hand, and to:

1. split the request into parts (navbar, hero, pricing, form, toast…) and run one `search_components` per part. Queries can be plain language ("animated gradient background for a hero"); common synonyms are understood (modal → dialog, dropdown → menu/select, notification → toast…);
2. compare the candidates using the guidance returned with every result: `useWhen` (situations the component is made for) and `avoidWhen` (common wrong picks, with the better-suited component in `instead`), then read `get_component` for the best ones (API, canonical markup, accessibility notes, beta/stable status);
3. install every chosen component in one `install_components` call, apply the framework snippet it returns, and reproduce the canonical markup;
4. customize with attributes, `data-*` and CSS variables, and write custom code only when nothing fits.

## Tools

| Tool | What it does |
|---|---|
| `search_components` | Search by need or keywords: names, keywords, descriptions, use cases, APIs. Best matches first, each with its `useWhen` / `avoidWhen` guidance. |
| `list_components` | List by category, kind or status, with counts per category. Brief rows (slug, name, category, kind, status) by default so the whole catalog fits in one reply; `detail: "full"` adds descriptions and is paged (`offset`, `next_offset`). |
| `get_component` | Full API (attributes, properties, methods, events, content structure, classes, CSS variables), accessibility notes, canonical markup, dependencies, source code on request. `demo`: `markup` (default, without the demo page's own `<style>` blocks), `full`, or `none` to compare candidates on their API alone. |
| `install_components` | Copies components **and all their dependencies** (tokens, core helpers, other components) into `target_dir`, a folder of your project (see [Where installs can write](#where-installs-can-write)), then returns the integration snippet for `html`, `react`, `next`, `vue`, `nuxt`, `svelte`, `sveltekit`, `angular` or `astro`. Supports `dry_run` and `overwrite`. |
| `get_install_bundle` | Same, but returns the files' content, for agents that write files themselves (remote sandboxes). |
| `get_design_tokens` | The CSS variables (summary or full file) and how to re-theme. |

Resources: `marvelous://registry` (full JSON index), `marvelous://tokens`, `marvelous://component/{slug}` (meta, markup and source).

Prompts: `build-ui` (`goal`, `framework?`) walks the agent through assembling an interface from the library before writing anything custom.

## Where installs can write

`install_components` only writes inside your project:

- **Project root.** Your agent starts the server from your project folder, so the root is the nearest folder above the server's working directory that holds `.git`, then `package.json`; without either, the working directory itself. Your home folder and a drive or filesystem root never count as a project. If your client starts MCP servers somewhere else, set `"env": { "MARVELOUS_PROJECT_ROOT": "/absolute/path/to/your-app" }` in the server's config (or its `cwd` option, where the client has one). The project-level files written by `init-agent` already set it.
- **`target_dir`.** An absolute path inside the root, or a path relative to the project root above (for example `src/marvelous`). Symbolic links are resolved before the check, so a link pointing out of the project is refused. A refused call writes nothing.
- **Existing files.** A file that is already there with the same content is left alone (`Unchanged`). A file with a different content (an older Marvelous UI version, or your own edits) is never replaced silently: the call is refused, lists those files and writes nothing. Call again with `overwrite: true` to replace them; the reply lists them under `Overwritten`. `dry_run: true` shows all of this without writing.

The tool is marked `destructiveHint: true`, so clients that ask before destructive actions will ask you.

## Troubleshooting

| Symptom | Fix |
|---|---|
| The agent doesn't list `marvelous-ui` | Restart the agent after changing its config; check that `node --version` is 20+ and the path points at `mcp/server.mjs`. |
| `Cannot find package '@modelcontextprotocol/server'` | Run `npm ci` in the Marvelous UI folder. |
| `install_components` answers "outside the project root" or "No project root" | The server was not started from your project. Set `MARVELOUS_PROJECT_ROOT` in its config ([Where installs can write](#where-installs-can-write)), or let the agent use `get_install_bundle` and write the files itself. |
| `install_components` answers "Refused: … already exist with a different content" | Your project has other versions of these files. Check them (your own edits would be lost), then ask the agent to reinstall with `overwrite: true`. |
| The agent writes UI by hand anyway | Make sure the project's `AGENTS.md` has the Marvelous UI block (re-run `init-agent`), or ask explicitly: "use Marvelous UI". |
| Components render unstyled | The CSS imports printed by the install step are missing (tokens first, then components). |
