#!/usr/bin/env node
// Claude Code hook: search Marvelous UI before hand-writing UI.
// PostToolUse on a marvelous-ui MCP tool marks the session as searched.
// PreToolUse on Write of a new UI file, in a session not yet searched, refuses the write once with a reminder;
// the retry goes through. Any failure exits 0, so the hook never gets in the way.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";

const UI_FILES = new Set([".html", ".htm", ".css", ".scss", ".jsx", ".tsx", ".vue", ".svelte", ".astro"]);

const REASON = "Marvelous UI is installed. Before hand-writing this UI, run search_components (marvelous-ui MCP server) "
  + "once per part of it, or read llms.txt in the Marvelous UI Pack, and install the components that fit. "
  + "Write custom code only for what the library lacks, with the --mv-* tokens. "
  + "This reminder shows once per session: retry the write when done.";

try {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;
  const input = JSON.parse(raw);
  const session = String(input.session_id ?? "").replace(/[^\w-]/g, "");
  if (!session) process.exit(0);
  const dir = join(tmpdir(), "marvelous-ui-hooks");
  const marker = join(dir, session);
  const mark = () => { mkdirSync(dir, { recursive: true }); writeFileSync(marker, ""); };

  if (input.hook_event_name === "PostToolUse") {
    mark();
  } else if (input.hook_event_name === "PreToolUse" && input.tool_name === "Write") {
    const file = String(input.tool_input?.file_path ?? "");
    if (UI_FILES.has(extname(file).toLowerCase()) && !existsSync(file) && !existsSync(marker)) {
      mark();
      process.stdout.write(JSON.stringify({
        hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: REASON },
      }));
    }
  }
} catch {}
process.exit(0);
