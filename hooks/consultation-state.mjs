// Local records of the search-first hook, shared with scripts/agent-consult.mjs (the offline fallback).
// One folder per project and session. A task is one user prompt: consultations and the reminder belong to it,
// so a search from an earlier prompt does not cover new UI. Records expire after a day; idle folders are pruned.
import { createHash, randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const DAY = 24 * 60 * 60 * 1000;
const PENDING_TTL = 10 * 60 * 1000;
const KINDS = ["search", "component", "catalog"];
const REMINDED = "reminded";
const OPT_OUT = /\b(?:without|do not use|don't use|avoid|sans|n['’]utilise(?:z)? pas)\s+(?:the\s+)?marvelous(?:\s+ui)?\b/i;

const hash = (value) => createHash("sha256").update(value).digest("hex");
const read = (file) => (existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : null);
// The fallback runs in an ordinary shell, without the hook-only PLUGIN_DATA environment: both use the system temp folder.
const stateRoot = () => process.env.MARVELOUS_HOOK_STATE_DIR || join(tmpdir(), "marvelous-ui-consultations-v2");
const taskDir = (s) => join(s.dir, hash(s.task));

function atomic(file, value) {
  const temporary = `${file}.${randomUUID()}.tmp`;
  writeFileSync(temporary, JSON.stringify(value));
  renameSync(temporary, file);
}

/** The state folder of this project and session, the current task, and the user's opt-out for that task. */
export function scope(input) {
  if (typeof input.session_id !== "string" || !input.session_id || typeof input.cwd !== "string" || !input.cwd) throw new Error("session_id and cwd are required");
  const project = resolve(input.cwd);
  const dir = join(stateRoot(), hash(`${process.platform === "win32" ? project.toLowerCase() : project}\0${input.session_id}`));
  mkdirSync(dir, { recursive: true });
  const current = read(join(dir, "task.json"));
  // Codex sends a turn_id with every event; Claude Code does not, so its task comes from the last UserPromptSubmit.
  const task = String(input.turn_id || current?.id || "session");
  return { dir, project, task, optOut: current?.id === task && current.optOut === true };
}

/** UserPromptSubmit: starts a task, with the explicit opt-out of its prompt ("without Marvelous UI"). */
export function startTask(input) {
  const { dir } = scope(input);
  const prompt = typeof input.prompt === "string" ? input.prompt : "";
  atomic(join(dir, "task.json"), { id: String(input.turn_id || randomUUID()), optOut: OPT_OUT.test(prompt) });
}

/** Records a successful consultation for the task; parallel consultations write independent files. */
export function recordConsultation(input, query, kind = "search") {
  const dir = taskDir(scope(input));
  mkdirSync(dir, { recursive: true });
  atomic(join(dir, `${randomUUID()}.json`), { kind, query: String(query).slice(0, 500), at: Date.now() });
}

const requestKey = (input) => String(input.tool_use_id || hash(`${input.tool_name}\0${input.tool_input?.query ?? input.tool_input?.slug ?? ""}`));

/** PreToolUse of a consultation: remembers which task started it, so a late result cannot cover a newer task. */
export function beginConsultation(input) {
  const s = scope(input);
  const dir = join(s.dir, "pending");
  mkdirSync(dir, { recursive: true });
  atomic(join(dir, `${randomUUID()}.json`), { key: requestKey(input), task: s.task, at: Date.now() });
}

/** PostToolUse of a consultation: the task that started it, or null when it cannot be told safely. */
export function consultationTask(input) {
  const s = scope(input);
  const dir = join(s.dir, "pending");
  const key = requestKey(input);
  const matches = existsSync(dir)
    ? readdirSync(dir).filter((file) => file.endsWith(".json"))
      .map((file) => ({ file, item: read(join(dir, file)) }))
      .filter(({ item }) => item.key === key && Date.now() - item.at < PENDING_TTL)
    : [];
  if (matches.length === 1) {
    unlinkSync(join(dir, matches[0].file));
    return matches[0].item.task;
  }
  // Without an event ID, concurrent equal requests cannot safely be attached to a newer task.
  if (matches.length > 1) {
    for (const match of matches) unlinkSync(join(dir, match.file));
    return null;
  }
  return input.turn_id ? String(input.turn_id) : s.task === "session" ? "session" : null;
}

/** True when the current task has a successful consultation of the last day, or the user opted out. */
export function consulted(input) {
  const s = scope(input);
  if (s.optOut) return true;
  const dir = taskDir(s);
  if (!existsSync(dir)) return false;
  const now = Date.now();
  return readdirSync(dir).some((file) => {
    if (!file.endsWith(".json")) return false;
    const item = read(join(dir, file));
    return KINDS.includes(item?.kind) && Number.isFinite(item.at) && item.at <= now && now - item.at < DAY;
  });
}

/** True the first time only for the current task: the hook refuses one write per task, never more. */
export function firstReminder(input) {
  const dir = taskDir(scope(input));
  mkdirSync(dir, { recursive: true });
  try {
    writeFileSync(join(dir, REMINDED), "", { flag: "wx" });
    return true;
  } catch (error) {
    if (error.code === "EEXIST") return false;
    throw error;
  }
}

/** SessionStart: removes the folders of sessions idle for more than two days. */
export function prune(now = Date.now()) {
  const root = stateRoot();
  if (!existsSync(root)) return;
  for (const name of readdirSync(root)) {
    const dir = join(root, name);
    try {
      if (now - statSync(dir).mtimeMs > 2 * DAY) rmSync(dir, { recursive: true, force: true });
    } catch {}
  }
}
