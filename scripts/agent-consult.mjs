#!/usr/bin/env node
// Offline catalog consultation, for when the MCP server is unavailable: prints the llms.txt lines matching the
// UI need, then records the consultation in the search-first hook's state, for the project, session and task.
//   node scripts/agent-consult.mjs "<UI need>" --project <directory> --session <session_id> [--task <turn_id>]
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const option = (name) => { const i = args.indexOf(`--${name}`); return i < 0 ? undefined : args[i + 1]; };

try {
  const [query] = args;
  const project = option("project");
  const session = option("session");
  const task = option("task");
  if (!query || query.startsWith("--") || !project || !session) {
    throw new Error('Usage: node scripts/agent-consult.mjs "<UI need>" --project <directory> --session <session_id> [--task <turn_id>]');
  }
  const words = query.toLowerCase().split(/[^\p{L}\p{N}-]+/u).filter((word) => word.length > 2);
  if (!words.length) throw new Error("Use a meaningful component query.");
  const catalog = readFileSync(join(ROOT, "llms.txt"), "utf8");
  const matches = catalog.split(/\r?\n/).filter((line) => words.some((word) => line.toLowerCase().includes(word))).slice(0, 15);
  console.log(matches.length ? matches.join("\n") : "No matching catalog lines. Read docs/GUIDE.md and the component docs before deciding whether custom UI is needed.");

  // hooks/ in the Pack, templates/plugin/hooks/ in the library repository.
  const packed = join(ROOT, "hooks", "consultation-state.mjs");
  const state = existsSync(packed) ? packed : join(ROOT, "templates", "plugin", "hooks", "consultation-state.mjs");
  const { recordConsultation } = await import(pathToFileURL(state).href);
  recordConsultation({ cwd: project, session_id: session, turn_id: task }, query, "catalog");
  console.log("Local catalog consultation recorded for this task.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
