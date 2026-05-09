import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { FileUp } from "lucide-react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Input } from "./ui/Input";
import { Label } from "./ui/Input";
import { Select } from "./ui/Input";
import { Badge } from "./ui/Badge";
import { useGradeData } from "../context/GradeDataContext";
import { extractTextFromFile } from "../services/fileExtract";
import { parseTranscriptHeuristic } from "../services/transcriptHeuristic";
import { parseTranscriptWithGemini } from "../services/transcriptGemini";

/** Browsers often omit or mislabel MIME types; include common fallbacks so files are not silently rejected. */
const ACCEPT = {
  "application/pdf": [".pdf"],
  "application/x-pdf": [".pdf"],
  "application/octet-stream": [".pdf", ".csv", ".txt"],
  "text/plain": [".txt", ".csv"],
  "text/csv": [".csv"],
};

const geminiKey = () => import.meta.env.VITE_GEMINI_API_KEY || "";

async function mergeParseResults(text, useGeminiFlag) {
  const key = geminiKey();

  if (useGeminiFlag && key) {
    const ai = await parseTranscriptWithGemini(text, key);
    if (!ai.error && ai.courses.length > 0) {
      return {
        courses: ai.courses,
        warnings: ["AI-assisted parse — review each row before merging."],
      };
    }
    const heur = parseTranscriptHeuristic(text);
    const w = [...heur.warnings];
    if (ai.error) w.unshift(`Gemini: ${ai.error}`);
    else if (!ai.courses.length) w.unshift("Gemini returned no courses.");
    return { courses: heur.courses, warnings: w };
  }

  return parseTranscriptHeuristic(text);
}

export function ImportCoursesPanel() {
  const { tables, importCourses } = useGradeData();
  const [courses, setCourses] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [useGemini, setUseGemini] = useState(false);
  /** 'new' | number (append indices) */
  const [mergeTarget, setMergeTarget] = useState("new");
  const [newSemesterName, setNewSemesterName] = useState("Imported semester");

  const runParseOnText = useCallback(async (text) => {
    setError(null);
    const result = await mergeParseResults(text, useGemini);
    setCourses(result.courses);
    setWarnings(result.warnings);
    if (!result.courses.length && !result.warnings.some((x) => /gemini/i.test(x)))
      setWarnings([
        ...(result.warnings || []),
        "No rows found. Toggle AI assist if your transcript layout is irregular.",
      ]);
  }, [useGemini]);

  const onDrop = useCallback(
    async (acceptedFiles, fileRejections) => {
      setCourses([]);
      setWarnings([]);
      setError(null);

      const rejectionHints = fileRejections.map((r) => {
        const bits = (r.errors || []).map((e) => `${e.code}: ${e.message}`);
        return `${r.file?.name ?? "file"} — ${bits.join("; ")}`;
      });

      if (!acceptedFiles.length) {
        if (rejectionHints.length)
          setError(rejectionHints.join(" · ") || "File type not accepted.");
        return;
      }

      setBusy(true);
      try {
        const textParts = [];
        for (const f of acceptedFiles) {
          textParts.push(await extractTextFromFile(f));
        }
        const combined = textParts.join("\n\n--- next file ---\n\n");
        await runParseOnText(combined);
        if (rejectionHints.length > 0) {
          const note = [
            `${rejectionHints.length} file(s) skipped (wrong type):`,
            ...rejectionHints,
          ];
          setWarnings((prev) => [...note, ...prev]);
        }
      } catch (e) {
        console.error(e);
        setError(e.message || "Failed to read file.");
      } finally {
        setBusy(false);
      }
    },
    [runParseOnText]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    maxFiles: 5,
    disabled: busy,
    validator: (file) => {
      const n = (file.name || "").toLowerCase();
      if (/\.(pdf|txt|csv)$/i.test(n)) return null;
      return {
        code: "file-invalid-type",
        message: "Use a .pdf, .txt, or .csv file.",
      };
    },
  });

  const handleApply = () => {
    if (!courses.length) return;

    if (mergeTarget === "new") {
      importCourses("new", courses, newSemesterName);
    } else {
      const idx = typeof mergeTarget === "number"
        ? mergeTarget
        : parseInt(String(mergeTarget), 10);
      if (!Number.isFinite(idx) || idx < 0 || idx >= tables.length) return;
      importCourses(idx, courses, null);
    }
    setCourses([]);
    setWarnings([]);
  };

  const geminiAvailable = !!geminiKey();

  useEffect(() => {
    setMergeTarget((prev) => {
      if (!tables.length) return "new";
      if (prev === "new") return prev;
      if (typeof prev === "number" && prev >= tables.length)
        return Math.min(prev, tables.length - 1);
      return prev;
    });
  }, [tables.length]);

  return (
    <Card className="mb-10">
      <h3 className="text-base font-semibold text-foreground mb-1">
        Import from file
      </h3>
      <p className="text-sm text-muted mb-4">
        Upload PDF, CSV, or TXT. Text is extracted and parsed into credits and
        grade points — verify the preview before merging into a semester.
      </p>

      <div className="mb-4">
        {geminiAvailable ? (
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="rounded border-border text-accent focus:ring-accent bg-surface-elevated"
              checked={useGemini}
              onChange={(e) => setUseGemini(e.target.checked)}
            />
            <span className="text-sm text-foreground inline-flex items-center gap-2">
              Use Gemini to interpret
              <Badge variant="accent">AI</Badge>
            </span>
          </label>
        ) : (
          <p className="text-xs text-muted">
            Tip: Set <code className="text-accent">VITE_GEMINI_API_KEY</code> for
            optional AI parsing (client-exposed keys should be tightly scoped).
          </p>
        )}
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-md px-6 py-8 text-center cursor-pointer transition-colors
          ${isDragActive ? "border-accent bg-accent/5" : "border-border hover:border-muted bg-surface-elevated"}
          ${busy ? "opacity-60 pointer-events-none" : ""}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <FileUp className="h-9 w-9 text-accent" aria-hidden />
          {isDragActive ? (
            <p className="text-sm text-foreground">Drop files here …</p>
          ) : (
            <p className="text-sm text-muted">
              Drag & drop PDF, CSV, or TXT — or click to browse
            </p>
          )}
        </div>
      </div>

      {busy && (
        <p className="text-sm text-muted mt-3">Extracting text…</p>
      )}
      {error && <p className="text-sm text-danger mt-3">{error}</p>}

      {warnings.length > 0 && (
        <ul className="mt-3 text-xs text-muted list-disc list-inside space-y-1 max-h-28 overflow-auto scrollbar-thin">
          {warnings.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      )}

      {courses.length > 0 && (
        <>
          <div className="mt-4 overflow-x-auto max-h-52 overflow-y-auto scrollbar-thin rounded-md border border-border">
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0 bg-surface-elevated border-b border-border">
                <tr>
                  <th className="p-2 font-medium text-foreground">Course</th>
                  <th className="p-2 font-medium text-foreground">Credits</th>
                  <th className="p-2 font-medium text-foreground">Grade</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c, i) => (
                  <tr key={i} className="border-b border-border/60">
                    <td className="p-2 text-foreground">{c.courseName}</td>
                    <td className="p-2 text-foreground">{c.credits}</td>
                    <td className="p-2 text-foreground">{c.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="merge-target">Merge into</Label>
              <Select
                id="merge-target"
                value={
                  mergeTarget === "new" ? "new" : String(mergeTarget)
                }
                onChange={(e) => {
                  const v = e.target.value;
                  setMergeTarget(v === "new" ? "new" : parseInt(v, 10));
                }}
              >
                <option value="new">New semester</option>
                {tables.map((t, idx) => (
                  <option key={idx} value={String(idx)}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </div>
            {mergeTarget === "new" ? (
              <div>
                <Label htmlFor="new-sem-name">Semester name</Label>
                <Input
                  id="new-sem-name"
                  value={newSemesterName}
                  onChange={(e) => setNewSemesterName(e.target.value)}
                />
              </div>
            ) : (
              <div className="hidden sm:block" aria-hidden />
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" onClick={handleApply}>
              Merge {courses.length} course{courses.length === 1 ? "" : "s"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setCourses([]);
                setWarnings([]);
              }}
            >
              Clear preview
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
