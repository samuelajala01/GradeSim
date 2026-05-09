/**
 * Best-effort transcript / grade list parsing from free text or CSV-like lines.
 * @returns {{ courses: { courseName: string, credits: number, grade: number }[], warnings: string[] }}
 */

function pushCourse(out, name, credits, grade) {
  const c = Number(credits);
  const g = Number(grade);
  if (!Number.isFinite(c) || !Number.isFinite(g) || c < 0 || c > 99)
    return false;
  const n = String(name || "").trim().replace(/\s+/g, " ");
  if (n.length < 1) return false;
  out.courses.push({
    courseName: n.slice(0, 120),
    credits: c,
    grade: g,
  });
  return true;
}

function tryParseLine(line, out) {
  const raw = line.trim();
  if (!raw) return;

  if (/^(course|code|subject|title|credits?|units?|grade|sn|#)\b/i.test(raw))
    return;

  let m = raw.match(
    /^(.+?)[\t,;|]\s*(\d+(?:\.\d+)?)\s*[\t,;|]\s*(\d+(?:\.\d+)?)\s*$/
  );
  if (m) {
    if (pushCourse(out, m[1], m[2], m[3])) return;
  }

  m = raw.match(
    /^(.+?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s*$/
  );
  if (m) {
    const name = m[1].replace(/[—–-]\s*$/, "").trim();
    if (name.length >= 2 && /^[A-Za-z0-9]/.test(name))
      if (pushCourse(out, name, m[2], m[3])) return;
  }

  m = raw.match(
    /^([A-Za-z]{2,}\d{3,}[A-Za-z0-9-]*)\s*[\t ,|;]+\s*(\d+(?:\.\d+)?)\s*[\t ,|;]+\s*(\d+(?:\.\d+)?)/
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
    if (out.courses.length === before && line.length > 4) {
      if (/\d/.test(line))
        out.warnings.push(`Skipped (unrecognized pattern): ${line.slice(0, 80)}`);
    }
  }

  if (out.courses.length === 0) {
    out.warnings.push(
      "No rows parsed. Try CSV (Course, Credits, Grade), tab-separated rows, or use AI assist if enabled."
    );
  }

  return out;
}
