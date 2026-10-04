#!/usr/bin/env node
// Connect a web project to Marvelous UI for AI coding agents, whatever the agent:
//   - AGENTS.md: the usage rules, read by Codex, Cursor, VS Code Copilot, Antigravity, Devin Desktop, Zed…
//     (and by Claude Code through an @AGENTS.md import in CLAUDE.md)
//   - the project's MCP config for each selected client, pointing at this library's MCP server
//
//   node /path/to/marvelous-ui/scripts/init-agent.mjs [project-dir] [--out src/marvelous]
//        [--clients claude,cursor,vscode,antigravity,devin,gemini | all] [--dry]
// Idempotent: re-running updates the Marvelous UI block and entries, and leaves the rest untouched.
//
//   node /path/to/marvelous-ui/scripts/init-agent.mjs --plugin
// Prints, for each agent, the commands that register the plugin shipped at the root of the Pack
// (.claude-plugin/, plugin.json, skills/). Writes nothing and runs nothing: the user runs them.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, resolve, relative, dirname } from "node:path";
import { ROOT, toPosix } from "./lib/registry.mjs";

const args = process.argv.slice(2);
const HAS_PLUGIN = existsSync(join(ROOT, ".claude-plugin", "plugin.json")) && existsSync(join(ROOT, "plugin.json"));
if (args.includes("--plugin")) {
  if (!HAS_PLUGIN) {
    console.error(`No plugin manifest in ${toPosix(ROOT)}: the plugin ships at the root of the Free and Pro packs.`);
    process.exit(1);
  }
  const pack = toPosix(ROOT);
  const win = ROOT.replaceAll("/", "\\");
  console.log(`Marvelous UI plugin → ${pack}

This folder is an agent plugin: a skill with the usage rules, plus the MCP server. Register it once per agent
and it serves every project. This script changes nothing: run the commands yourself.
First run npm ci in ${pack}: the MCP server needs its two dependencies, no agent installs them,
and Codex and Cursor copy this folder (node_modules included) when you register it.

  Claude Code    claude plugin marketplace add "${pack}"
                 claude plugin install marvelous-ui@marvelous-ui
                 (in a session: /plugin marketplace add ${pack}, then /plugin install marvelous-ui@marvelous-ui)
  Codex          codex plugin marketplace add "${pack}"
                 codex plugin add marvelous-ui@marvelous-ui
                 (Codex installs a copy: run codex plugin add again after each Pack update)
  Cursor         copy this folder into ~/.cursor/plugins/local/marvelous-ui, then run Developer: Reload Window
                 (a copy: Cursor skips symlinks that point outside that folder; copy it again after each update)
                   macOS, Linux   mkdir -p ~/.cursor/plugins/local && cp -R "${pack}" ~/.cursor/plugins/local/marvelous-ui
                   Windows        New-Item -ItemType Directory -Force "$env:USERPROFILE\\.cursor\\plugins\\local" | Out-Null
                                  Copy-Item -Recurse "${win}" "$env:USERPROFILE\\.cursor\\plugins\\local\\marvelous-ui"
  VS Code        user settings.json → "chat.pluginLocations": { "${pack}": true }
  Devin          devin plugins install --local "${pack}"
  Antigravity    no plugin yet: run this script without --plugin to write the project's .agents/mcp_config.json

Installs: Claude Code gives the MCP server your project folder, so install_components writes straight into it.
The other agents start the server from this folder: the agent then installs with scripts/add.mjs (the skill says how).
Per agent, use either the plugin or the project MCP config written without --plugin, not both (tools would appear twice).
Moving from the Free pack to the Pro pack: remove the old marketplace first
(claude plugin marketplace remove marvelous-ui, codex plugin marketplace remove marvelous-ui), then add the new folder.
Details: ${pack}/docs/MCP.md`);
  process.exit(0);
}
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i > -1 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : fallback;
};
const dry = args.includes("--dry");
const VALUED = ["--out", "--clients"];
const project = resolve(args.find((a, i) => !a.startsWith("--") && !VALUED.includes(args[i - 1])) ?? ".");
if (!existsSync(project)) {
  console.error(`Project not found: ${project}`);
  process.exit(1);
}
if (resolve(project) === ROOT) {
  console.error("Run this against your web project, not the Marvelous UI folder itself.");
  process.exit(1);
}

const LIB = toPosix(ROOT);
const SERVER = `${LIB}/mcp/server.mjs`;
const out = toPosix(opt("out", existsSync(join(project, "src")) ? "src/marvelous" : "marvelous"));
const outAbs = toPosix(resolve(project, out));

// Project-level clients. The others (Codex, Zed, Claude Desktop, user-level files) are per user: printed at the end.
// Every format below takes an `env` object for a stdio server, so each entry pins MARVELOUS_PROJECT_ROOT to this
// project: install_components then writes here even when the client starts the server from another folder.
const PROJECT_ROOT = toPosix(project);
const stdio = (extra = {}) => ({ ...extra, command: "node", args: [SERVER], env: { MARVELOUS_PROJECT_ROOT: PROJECT_ROOT } });
const PROJECT_CLIENTS = {
  claude: { file: ".mcp.json", key: "mcpServers", entry: stdio(), detect: ["CLAUDE.md", ".claude", ".mcp.json"] },
  cursor: { file: ".cursor/mcp.json", key: "mcpServers", entry: stdio(), detect: [".cursor", ".cursorrules"] },
  vscode: { file: ".vscode/mcp.json", key: "servers", entry: stdio({ type: "stdio" }), detect: [".vscode", ".github/copilot-instructions.md"] },
  // Antigravity, the successor of Gemini CLI: workspace MCP servers live in .agents/mcp_config.json.
  antigravity: { file: ".agents/mcp_config.json", key: "mcpServers", entry: stdio(), detect: [".agents"] },
  // Devin Desktop (ex-Windsurf, default Devin Local agent) and Devin CLI 3000.3+: project file .devin/mcp_config.json.
  devin: { file: ".devin/mcp_config.json", key: "mcpServers", entry: stdio(), detect: [".devin", ".windsurf"] },
  // Gemini CLI: since 18/06/2026, only served for Gemini Code Assist Standard/Enterprise licenses and paid API keys.
  gemini: { file: ".gemini/settings.json", key: "mcpServers", entry: stdio(), detect: [".gemini", "GEMINI.md"] },
};
const requested = opt("clients", null);
const clients = requested === "all"
  ? Object.keys(PROJECT_CLIENTS)
  : requested
    ? requested.split(",").map((c) => c.trim()).filter(Boolean)
    : Object.keys(PROJECT_CLIENTS).filter((c) => c === "claude" || PROJECT_CLIENTS[c].detect.some((f) => existsSync(join(project, f))));
const unknown = clients.filter((c) => !PROJECT_CLIENTS[c]);
if (unknown.length) {
  console.error(`Unknown client(s): ${unknown.join(", ")}. Project-level clients: ${Object.keys(PROJECT_CLIENTS).join(", ")}.`);
  process.exit(1);
}

const log = [];
const write = (rel, content) => {
  const abs = join(project, rel);
  if (!dry) {
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, content);
  }
};

// 1. AGENTS.md: replace the Marvelous UI block if present, append it otherwise.
const START = "<!-- marvelous-ui:start -->";
const END = "<!-- marvelous-ui:end -->";
const block = readFileSync(join(ROOT, "templates", "AGENTS.md"), "utf8").trim()
  .replaceAll("{{OUT_ABS}}", outAbs).replaceAll("{{OUT}}", out).replaceAll("{{LIB}}", LIB);
const agentsPath = join(project, "AGENTS.md");
const agents = existsSync(agentsPath) ? readFileSync(agentsPath, "utf8") : "";
const a = agents.indexOf(START);
const b = agents.indexOf(END);
const nextAgents = a > -1 && b > a
  ? agents.slice(0, a) + block + agents.slice(b + END.length)
  : `${agents.trimEnd()}${agents.trim() ? "\n\n" : ""}${block}\n`;
if (nextAgents !== agents) {
  write("AGENTS.md", nextAgents);
  log.push(`${agents ? "~" : "+"} AGENTS.md (Marvelous UI rules)`);
} else log.push("= AGENTS.md (up to date)");

// 2. Claude Code reads CLAUDE.md: import AGENTS.md from it.
if (clients.includes("claude")) {
  const claudePath = join(project, "CLAUDE.md");
  const claude = existsSync(claudePath) ? readFileSync(claudePath, "utf8") : "";
  if (/^@AGENTS\.md\s*$/m.test(claude) || claude.includes(START)) log.push("= CLAUDE.md (already imports AGENTS.md)");
  else {
    write("CLAUDE.md", claude ? `${claude.trimEnd()}\n\n@AGENTS.md\n` : "@AGENTS.md\n");
    log.push(`${claude ? "~" : "+"} CLAUDE.md (@AGENTS.md import)`);
  }
}

// 3. MCP config per client (merged into the existing file).
for (const name of clients) {
  const { file, key, entry } = PROJECT_CLIENTS[name];
  const abs = join(project, file);
  let config = {};
  if (existsSync(abs)) {
    try {
      config = JSON.parse(readFileSync(abs, "utf8"));
    } catch {
      log.push(`! ${file}: not plain JSON (comments?), left untouched. Add under "${key}": "marvelous-ui": ${JSON.stringify(entry)}`);
      continue;
    }
  }
  const before = JSON.stringify(config);
  config[key] = { ...(config[key] ?? {}), "marvelous-ui": entry };
  if (JSON.stringify(config) === before) { log.push(`= ${file} (${name})`); continue; }
  write(file, JSON.stringify(config, null, 2) + "\n");
  log.push(`${before === "{}" ? "+" : "~"} ${file} (${name})`);
}

console.log(`${dry ? "[dry run] " : ""}Marvelous UI → ${toPosix(project)}
${log.map((l) => `  ${l}`).join("\n")}

Components will be installed in ${out}/ (change with --out).
${requested ? "" : `Not detected in this project, so not configured: ${Object.keys(PROJECT_CLIENTS).filter((c) => !clients.includes(c)).join(", ")}.
Using one of them? Run again with --clients ${[...clients, "cursor", "vscode"].filter((c, i, a) => a.indexOf(c) === i).join(",")} (or --clients all).
`}Restart your agent (or reload its MCP servers) so it picks up "marvelous-ui".

Per-user setup, for agents without a project file or to cover every project (no MARVELOUS_PROJECT_ROOT
here: the server then finds the project from the folder the agent starts it in). Run once:
  Codex          codex mcp add marvelous-ui -- node ${SERVER}
  Claude Code    claude mcp add --scope user marvelous-ui -- node ${SERVER}   (all projects, optional)
  Devin Desktop  ~/.config/devin/mcp_config.json (macOS, Linux) or %APPDATA%\\devin\\mcp_config.json (Windows)
                 → "mcpServers": { "marvelous-ui": { "command": "node", "args": ["${SERVER}"] } }
                 (Windsurf before the rename: ~/.codeium/windsurf/mcp_config.json, same entry)
  Antigravity    ~/.gemini/config/mcp_config.json → same "mcpServers" entry
  Zed            settings.json → "context_servers": { "marvelous-ui": { "command": "node", "args": ["${SERVER}"] } }
Details: ${LIB}/docs/MCP.md${HAS_PLUGIN ? `
Prefer a plugin that serves every project? node ${LIB}/scripts/init-agent.mjs --plugin` : ""}`);
if (relative(project, ROOT).startsWith("..") === false) console.warn("\n! The library sits inside this project: keep it out of your bundler's scope.");
