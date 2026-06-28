// src/Components/ImportCoursesPanel.jsx
// Adjust utility import paths if needed (e.g. ../lib/ instead of ../utils/)

import { useState, useEffect, useRef } from "react";
import { Upload, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { useGradeData } from "../context/GradeDataContext";
import { COL } from "../domain/grades";
import { extractTextFromFile } from "../services/fileExtract";
import { parseTranscriptHeuristic } from "../services/transcriptHeuristic";
import { parseTranscriptWithGemini } from "../services/transcriptGemini";
import { Card, CardHeader } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? "";

export function ImportCoursesPanel() {
  const { tables, addSemester, batchImportCourses } = useGradeData();

  const [phase, setPhase] = useState("idle"); // idle | extracting | preview | importing | done
  const [parsed, setParsed] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [error, setError] = useState("");
  const [targetIdx, setTargetIdx] = useState(0);   // -1 = create new semester
  const [newName, setNewName] = useState("");
  const [aiMode, setAiMode] = useState(false);
  const [pendingImport, setPendingImport] = useState(null); // { idx, courses }
  const fileRef = useRef(null);

  // After addSemester commits to state, the pending import fires here.
  // This avoids reading stale tables.length immediately after addSemester().
  useEffect(() => {
    if (!pendingImport) return;
    const { idx, courses } = pendingImport;
    if (idx >= tables.length) return; // semester not in state yet — wait
    batchImportCourses(idx, courses);
    setPendingImport(null);
    setPhase("done");
    setTimeout(reset, 2000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tables.length, pendingImport]);

  function reset() {
    setPhase("idle");
    setParsed([]);
    setWarnings([]);
    setError("");
    setNewName("");
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhase("extracting");
    setError("");
    setParsed([]);
    setWarnings([]);

    try {
      const text = await extractTextFromFile(file);

      let result;
      if (aiMode && GEMINI_KEY) {
        result = await parseTranscriptWithGemini(text, GEMINI_KEY);
        if (result.error || result.courses.length === 0) {
          const fallback = parseTranscriptHeuristic(text);
          setWarnings([
            `AI failed${result.error ? ": " + result.error : ""}. Falling back to heuristic.`,
            ...(fallback.warnings ?? []),
          ]);
          result = fallback;
        }
      } else {
        result = parseTranscriptHeuristic(text);
        setWarnings(result.warnings ?? []);
      }

      if (!result.courses.length) {
        setError("No courses parsed. Try CSV/TXT format or enable AI assist.");
        setPhase("idle");
        return;
      }

      setParsed(result.courses);
      setTargetIdx(tables.length > 0 ? 0 : -1);
      setPhase("preview");
    } catch (err) {
      setError(err.message || "Failed to read file.");
      setPhase("idle");
    }
  }

  function handleImport() {
    if (!parsed.length) return;

    if (targetIdx === -1) {
      const name = newName.trim();
      if (!name) {
        setError("Enter a name for the new semester.");
        return;
      }
      const expectedIdx = tables.length; // addSemester will append here
      addSemester(name);
      setPendingImport({ idx: expectedIdx, courses: parsed }); // useEffect takes it from here
      setPhase("importing");
      return;
    }

    batchImportCourses(targetIdx, parsed);
    setPhase("done");
    setTimeout(reset, 2000);
  }

  return (
    <Card className="mb-10">
      <CardHeader
        title="Import courses"
        description="Upload a PDF, CSV, or TXT transcript to bulk-fill a semester."
      />

      <div className="space-y-4 pb-2">
        {/* AI toggle */}
        <label className="inline-flex items-center gap-2 text-sm text-muted cursor-pointer select-none">
          <input
            type="checkbox"
            className="accent-accent"
            checked={aiMode}
            onChange={(e) => setAiMode(e.target.checked)}
          />
          Use AI assist (Gemini)
          {aiMode && !GEMINI_KEY && (
            <span className="text-danger text-xs ml-1">
              — VITE_GEMINI_API_KEY not set
            </span>
          )}
        </label>

        {/* Upload zone — only shown when idle */}
        {phase === "idle" && (
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg py-10 cursor-pointer hover:border-accent transition-colors">
            <Upload size={22} className="text-muted mb-2" />
            <span className="text-sm text-muted">
              Click to upload{" "}
              <strong className="text-foreground">PDF, CSV, or TXT</strong>
            </span>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.csv,.txt"
              className="hidden"
              onChange={handleFile}
            />
          </label>
        )}

        {/* Loading states */}
        {(phase === "extracting" || phase === "importing") && (
          <div className="flex items-center gap-2 text-muted text-sm py-4">
            <Loader2 size={16} className="animate-spin" />
            {phase === "extracting" ? "Extracting text…" : "Importing courses…"}
          </div>
        )}

        {/* Success */}
        {phase === "done" && (
          <div className="flex items-center gap-2 text-sm py-4">
            <CheckCircle size={16} className="text-accent" />
            <span className="text-muted">
              Imported{" "}
              <strong className="text-foreground">{parsed.length}</strong>{" "}
              course{parsed.length !== 1 ? "s" : ""} successfully.
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 text-danger text-sm rounded-md bg-surface-elevated border border-border p-3">
            <AlertTriangle size={15} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Parse warnings */}
        {warnings.length > 0 && (
          <details className="text-xs text-muted border border-border rounded-md px-3 py-2">
            <summary className="cursor-pointer">
              {warnings.length} parsing warning{warnings.length !== 1 ? "s" : ""} — expand
            </summary>
            <ul className="mt-2 space-y-1 pl-3 list-disc">
              {warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </details>
        )}

        {/* Preview & semester selection */}
        {phase === "preview" && parsed.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              <strong className="text-foreground">{parsed.length}</strong> course
              {parsed.length !== 1 ? "s" : ""} detected. Select a semester:
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <select
                className="rounded-md border border-border bg-surface text-foreground text-sm px-3 py-2 flex-1 focus:outline-none focus:ring-1 focus:ring-accent"
                value={targetIdx}
                onChange={(e) => setTargetIdx(Number(e.target.value))}
              >
                {tables.map((t, i) => (
                  <option key={i} value={i}>
                    {t.name}
                  </option>
                ))}
                <option value={-1}>+ New semester…</option>
              </select>

              {targetIdx === -1 && (
                <Input
                  placeholder="Semester name (e.g. First Semester 24/25)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="flex-1"
                />
              )}
            </div>

            {/* Course preview table */}
            <div className="overflow-auto rounded-md border border-border max-h-56 scrollbar-thin">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-surface-elevated border-b border-border">
                  <tr>
                    <th className="p-2 text-left font-medium text-muted">Course</th>
                    <th className="p-2 text-center font-medium text-muted w-20">Credits</th>
                    <th className="p-2 text-center font-medium text-muted w-24">Grade pts</th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.map((c, i) => (
                    <tr
                      key={i}
                      className="border-b border-border/50 hover:bg-surface-elevated/70"
                    >
                      <td className="p-2 text-foreground">{c.courseName}</td>
                      <td className="p-2 text-center tabular-nums">{c.credits}</td>
                      <td className="p-2 text-center tabular-nums text-accent">{c.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleImport}>
                Import to{" "}
                {targetIdx === -1
                  ? `"${newName.trim() || "new semester"}"`
                  : `"${tables[targetIdx]?.name}"`}
              </Button>
              <Button variant="secondary" onClick={reset}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}