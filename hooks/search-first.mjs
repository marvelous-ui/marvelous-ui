#!/usr/bin/env node
// Search-first hook of the Pack's plugin, for Claude Code (Write, Edit, MultiEdit) and Codex (apply_patch).
// SessionStart names the skills. UserPromptSubmit starts a task. A successful marvelous-ui search_components or
// get_component records a consultation for the task that started the call (consultation-state.mjs).
// A UI write in a task without consultation is refused once, with a reminder; the retry goes through.
// Any failure exits 0 without output, so the hook never gets in the way.
import { existsSync, readFileSync } from "node:fs";
import { dirname, extname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { beginConsultation, consultationTask, consulted, firstReminder, prune, recordConsultation, scope, startTask } from "./consultation-state.mjs";

const HOOK_DIR = dirname(fileURLToPath(import.meta.url));
// hooks/ sits at the Pack root; in the library repository, under templates/plugin/.
const PACK = existsSync(join(HOOK_DIR, "../scripts/agent-consult.mjs")) ? resolve(HOOK_DIR, "..") : resolve(HOOK_DIR, "../../..");
const CONSULT_TOOL = /^mcp__.*marvelous[-_]ui__(search_components|get_component)$/;
const MESSAGE = "Marvelous UI: use the marvelous-ui skill for creating or changing web interfaces; use marvelous-ui-theme for styling, "
  + "marvelous-ui-troubleshoot for component failures, and marvelous-ui-setup for installation. Consult the component catalog "
  + "before hand-writing reusable UI. Preserve the requested design and use custom UI when the catalog has no suitable component.";

const EXCLUDED = /(?:^|\/)(?:node_modules|dist|build|out|\.git|\.next|coverage|tests?|__tests__|server|api)(?:\/|$)|\.(?:test|spec)\.[^/]+$/i;
const UI_EXTENSIONS = new Set([".html", ".htm", ".css", ".scss", ".sass", ".less", ".jsx", ".tsx", ".vue", ".svelte", ".astro"]);
const SCRIPT_EXTENSIONS = new Set([".js", ".mjs", ".cjs", ".ts"]);
// Plain scripts count as UI when they build DOM, hold markup, use hyperscript, define custom elements or use React.
const UI_CODE = /(?:createElement|innerHTML|insertAdjacentHTML|attachShadow|html\s*`|<\/?(?:button|input|form|div|section|dialog|span|main|header|nav|p|mv-[\w-]+)(?:\s|>)|classList|querySelector|customElements\.define|\.textContent\s*=|\bh\s*\(\s*['"]|\.render\s*\(|\b(?:React|jsx)\b)/;

function isUiFile(file, content, cwd) {
  const path = isAbsolute(file) ? file : resolve(cwd, file);
  const rel = relative(cwd, path).replaceAll("\\", "/");
  if (EXCLUDED.test(rel)) return false;
  const extension = extname(rel).toLowerCase();
  if (UI_EXTENSIONS.has(extension)) return true;
  if (!SCRIPT_EXTENSIONS.has(extension)) return false;
  // An edit's new text can be plain logic inside a file that builds UI.
  const existing = existsSync(path) ? readFileSync(path, "utf8") : "";
  return UI_CODE.test(`${content}\n${existing}`);
}

function writesUi(input) {
  const tool = input.tool_input ?? {};
  if (["Write", "Edit", "MultiEdit"].includes(input.tool_name)) {
    if (typeof tool.file_path !== "string") return false;
    const texts = [tool.content, tool.new_string, ...(tool.edits ?? []).map((edit) => edit.new_string)];
    return isUiFile(tool.file_path, texts.filter((text) => typeof text === "string").join("\n"), input.cwd);
  }
  if (input.tool_name === "apply_patch") {
    const patch = tool.command ?? tool.patch ?? tool;
    if (typeof patch !== "string") return false;
    // One section per file: "*** Add File:", "*** Update File:" (with an optional "*** Move to:") or "*** Delete File:".
    const sections = [...patch.matchAll(/^\*\*\* (?:Add|Update|Delete) File: (.+)\r?$/gm)];
    return sections.some((match, i) => {
      const part = patch.slice(match.index, sections[i + 1]?.index ?? patch.length);
      const move = part.match(/^\*\*\* Move to: (.+)\r?$/m);
      return isUiFile(match[1].trim(), part, input.cwd) || Boolean(move && isUiFile(move[1].trim(), part, input.cwd));
    });
  }
  return false;
}

const failed = (r) => r.isError === true || Boolean(r.error) || r.success === false || ["failed", "error", "cancelled"].includes(r.status);
/** An MCP result that completed without error. Codex may wrap it in { status, result }. */
function successful(response) {
  if (typeof response === "string") {
    try { response = JSON.parse(response); } catch { return false; }
  }
  // Claude Code passes an MCP result as its bare content blocks (2.1.286).
  if (Array.isArray(response)) return response.every((block) => typeof block?.type === "string");
  if (!response || typeof response !== "object" || failed(response)) return false;
  if (response.result && typeof response.result === "object") response = response.result;
  return !failed(response) && (Array.isArray(response.content) || response.isError === false || response.structuredContent != null);
}

// Shell quoting for the fallback command: PowerShell on Windows, POSIX elsewhere.
const quote = (value) => process.platform === "win32"
  ? `'${String(value).replaceAll("'", "''")}'`
  : `'${String(value).replaceAll("'", "'\\''")}'`;
const output = (value) => process.stdout.write(JSON.stringify(value));

try {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;
  const input = JSON.parse(raw);
  const event = input.hook_event_name;

  if (event === "SessionStart") {
    prune();
    scope(input);
    output({ hookSpecificOutput: { hookEventName: event, additionalContext: MESSAGE } });
  } else if (event === "UserPromptSubmit") {
    startTask(input);
  } else if (event === "PreToolUse" && CONSULT_TOOL.test(input.tool_name)) {
    beginConsultation(input);
  } else if (event === "PostToolUse" && CONSULT_TOOL.test(input.tool_name)) {
    const task = consultationTask(input);
    const { query, slug } = input.tool_input ?? {};
    if (task && successful(input.tool_response)) {
      const context = { ...input, turn_id: task };
      if (input.tool_name.endsWith("__search_components") && typeof query === "string" && query.trim()) recordConsultation(context, query);
      else if (input.tool_name.endsWith("__get_component") && typeof slug === "string") recordConsultation(context, slug, "component");
    }
  } else if (event === "PreToolUse" && writesUi(input) && !consulted(input) && firstReminder(input)) {
    const { project } = scope(input);
    const task = input.turn_id ? ` --task ${quote(input.turn_id)}` : "";
    const fallback = `node ${quote(join(PACK, "scripts/agent-consult.mjs"))} '<UI need>' --project ${quote(project)} --session ${quote(input.session_id)}${task}`;
    output({
      hookSpecificOutput: {
        hookEventName: event,
        permissionDecision: "deny",
        permissionDecisionReason: `${MESSAGE} Before writing this UI, run search_components for each part (or get_component for a known component). `
          + `If MCP is unavailable, consult the local catalog: ${fallback}. `
          + "This reminder shows once per task: retry the write when done, or right away if the library has nothing suitable.",
      },
    });
  }
} catch (error) {
  // Never block the agent on a hook problem; the reason stays in the agent's debug output.
  process.stderr.write(`Marvelous UI hook skipped this event: ${error.message}\n`);
}
process.exit(0);
