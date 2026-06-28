/**
 * Best-effort transcript / grade list parsing from free text or CSV-like lines.
 * @returns {{ courses: { courseName: string, credits: number, grade: number }[], warnings: string[] }}
 */

const GRADE_ALIASES = new Map([
  ["A+", 5.0],
  ["A",  5.0],
  ["A-", 4.5],
  ["B+", 4.0],
  ["B",  3.5],
  ["B-", 3.0],
  ["C+", 2.5],
  ["C",  2.0],
  ["C-", 1.5],
  ["D+", 1.0],
  ["D",  0.5],
  ["F",  0],
  ["P",  0],
  ["NP", 0],
  ["S",  0],
  ["U",  0],
]);

function parseGradeToken(token) {
  const raw = String(token ?? "").trim();
  if (!raw) return null;
  const numeric = Number(raw);
  if (Number.isFinite(numeric)) return numeric;
  const normalized = raw.replace(/\s+/g, "").toUpperCase();
  return GRADE_ALIASES.has(normalized) ? GRADE_ALIASES.get(normalized) : null;
}

/** Strip leading serial numbers like "1.", "2)", "3:" from a name string */
function stripSerial(name) {
  return name.replace(/^\d+[.):\s]+/, "").trim();
}

function pushCourse(out, name, credits, grade) {
  const c = Number(credits);
  const g = parseGradeToken(grade);
  if (!Number.isFinite(c) || !Number.isFinite(g) || c < 0 || c > 99) return false;
  const n = stripSerial(String(name ?? "").trim().replace(/\s+/g, " "));
  if (n.length < 1) return false;
  out.courses.push({ courseName: n.slice(0, 120), credits: c, grade: g });
  return true;
}

function tryParseLine(line, out) {
  const raw = line.trim();
  if (!raw) return;

  if (/^(course|code|subject|title|credits?|units?|grade|sn|s\/n|#)\b/i.test(raw)) return;

  const delimited = raw.includes("\t") || /[,;|]/.test(raw);
  const pattern = delimited ? /[\t,;|]+/ : /\s+/;
  const parts = raw.split(pattern).map((p) => p.trim()).filter(Boolean);

  if (parts.length >= 3) {
    for (let i = 0; i < parts.length - 1; i++) {
      const credits = Number(parts[i]);
      const grade = parseGradeToken(parts[i + 1]);
      if (!Number.isFinite(credits) || grade === null) continue;

      const rawName = parts.slice(0, i).join(" ").trim();
      const name = stripSerial(rawName);
      if (name.length >= 1 && pushCourse(out, name, credits, grade)) return;

      // fallback: only use parts[0] as name if it's not a bare number (serial)
      const fallback = parts[0];
      if (fallback && !/^\d+$/.test(fallback)) {
        if (pushCourse(out, fallback, credits, grade)) return;
      }
    }
  }

  let m = raw.match(
    /^(.+?)[\t,;|]\s*(\d+(?:\.\d+)?)\s*[\t,;|]\s*([A-F][+-]?|P|NP|S|U|\d+(?:\.\d+)?)\s*(?:[\t,;|]\s*\d+(?:\.\d+)?)?\s*$/i
  );
  if (m) {
    if (pushCourse(out, m[1], m[2], m[3])) return;
  }

  m = raw.match(
    /^(.+?)\s+(\d+(?:\.\d+)?)\s+([A-F][+-]?|P|NP|S|U|\d+(?:\.\d+)?)\s*(?:\s+\d+(?:\.\d+)?)?\s*$/i
  );
  if (m) {
    const name = m[1].replace(/[—–-]\s*$/, "").replace(/^\d+[.):\s]+/, "").trim();
    if (name.length >= 2 && /^[A-Za-z0-9]/.test(name)) {
      if (pushCourse(out, name, m[2], m[3])) return;
    }
  }

  m = raw.match(
    /^([A-Za-z]{2,}\d{3,}[A-Za-z0-9-]*)\s*[\t ,|;]+\s*(\d+(?:\.\d+)?)\s*[\t ,|;]+\s*([A-F][+-]?|P|NP|S|U|\d+(?:\.\d+)?)/i
  );
  if (m) {
    if (pushCourse(out, m[1], m[2], m[3])) return;
  }
}

export function parseTranscriptHeuristic(text) {
  const out = { courses: [], warnings: [] };
  if (!text || typeof text !== "string") {
    out.warnings.push("Empty input.");
    return out;
  }

  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    const before = out.courses.length;
    tryParseLine(line, out);
    if (out.courses.length === before && line.length > 4 && /\d/.test(line)) {
      out.warnings.push(`Skipped (unrecognized pattern): ${line.slice(0, 80)}`);
    }
  }

  if (out.courses.length === 0) {
    out.warnings.push(
      "No rows parsed. Try CSV (Course, Credits, Grade), tab-separated rows, or use AI assist."
    );
  }

  return out;
}