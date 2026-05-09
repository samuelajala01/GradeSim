import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useGradeData } from "../context/GradeDataContext";
import { COL } from "../domain/grades";
import { ImportCoursesPanel } from "../Components/ImportCoursesPanel";
import { Button } from "../Components/ui/Button";
import { Card, CardHeader } from "../Components/ui/Card";
import { Input } from "../Components/ui/Input";
import { Label } from "../Components/ui/Input";
import { Badge } from "../Components/ui/Badge";

export default function Home() {
  const { currentUser } = useAuth();
  const {
    tables,
    summary,
    addSemester,
    deleteSemester,
    updateCell,
    addRow,
    deleteRow,
    semesterGpaFormatted,
    hasUnsavedChanges,
  } = useGradeData();

  const [semesterName, setSemesterName] = useState("");
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState(null);

  const fn = currentUser?.profileData?.firstName || "there";

  const submitSemester = (e) => {
    e?.preventDefault();
    const name = semesterName.trim();
    if (!name) {
      alert("Enter a semester name.");
      return;
    }
    addSemester(name);
    setSemesterName("");
  };

  return (
    <main className="min-h-screen w-full overflow-auto bg-background p-6 sm:p-10 lg:p-12 pt-24 lg:pt-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <div className="flex flex-wrap items-baseline gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              Dashboard
            </h1>
            <span className="text-muted text-sm">
              Signed in as {fn}
            </span>
          </div>
          <p className="text-muted max-w-2xl text-sm leading-relaxed">
            Track semesters, credits, and grade points. Imports support PDF /
            CSV / TXT extraction with optional AI assist.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <div className="rounded-md border border-border bg-surface px-4 py-3 min-w-[8rem]">
            <div className="text-xs text-muted uppercase tracking-wide">
              CGPA
            </div>
            <div className="text-xl font-semibold text-accent">{summary.cgpa}</div>
          </div>
          <div className="rounded-md border border-border bg-surface px-4 py-3 min-w-[8rem]">
            <div className="text-xs text-muted uppercase tracking-wide">
              Total units
            </div>
            <div className="text-xl font-semibold text-foreground">
              {summary.totalUnits}
            </div>
          </div>
          <div className="rounded-md border border-border bg-surface px-4 py-3 min-w-[8rem]">
            <div className="text-xs text-muted uppercase tracking-wide">
              Total score
            </div>
            <div className="text-xl font-semibold text-foreground">
              {summary.totalScoreDisplay}
            </div>
          </div>
          <Badge variant={hasUnsavedChanges ? "accent" : "success"} className="self-center py-2">
            {hasUnsavedChanges ? "Saving…" : "Synced locally"}
          </Badge>
        </div>

        <Card className="mb-10">
          <CardHeader
            title="New semester"
            description="Create a labeled block for one term."
            actions={
              <Button size="sm" type="submit" form="new-sem-form">
                Add
              </Button>
            }
          />
          <form id="new-sem-form" className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={submitSemester}>
            <div className="flex-1">
              <Label htmlFor="sem-input">Semester name</Label>
              <Input
                id="sem-input"
                value={semesterName}
                onChange={(e) => setSemesterName(e.target.value)}
                placeholder="e.g. Fall 2025"
              />
            </div>
          </form>
        </Card>

        <ImportCoursesPanel />

        {tables.length === 0 ? (
          <Card padded className="text-center py-16">
            <p className="text-muted mb-4">
              No semesters yet. Add one above or import from a file.
            </p>
          </Card>
        ) : (
          <div className="space-y-10">
            {tables.map((table, tableIndex) => (
              <Card key={`${table.name}-${tableIndex}`}>
                <CardHeader
                  title={table.name}
                  actions={
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="accent">
                        GPA {semesterGpaFormatted(tableIndex)}
                      </Badge>
                      <Button
                        size="sm"
                        variant="secondary"
                        type="button"
                        onClick={() => addRow(tableIndex)}
                      >
                        Add course
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        type="button"
                        onClick={() => setConfirmDeleteIndex(tableIndex)}
                      >
                        Delete semester
                      </Button>
                    </div>
                  }
                />

                <div className="overflow-x-auto rounded-md border border-border scrollbar-thin">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-surface-elevated border-b border-border">
                        <th className="p-3 text-left font-medium text-muted w-10">
                          #
                        </th>
                        {table.colNames.map((name, i) => (
                          <th
                            key={i}
                            className="p-3 text-left font-medium text-foreground"
                          >
                            {name}
                          </th>
                        ))}
                        <th className="p-3 w-14" />
                      </tr>
                    </thead>
                    <tbody>
                      {table.data.map((row, rowIndex) => (
                        <tr
                          key={rowIndex}
                          className="border-b border-border/70 hover:bg-surface-elevated/80"
                        >
                          <td className="p-2 text-center text-muted">
                            {rowIndex + 1}
                          </td>
                          {row.map((cell, colIndex) => (
                            <td key={colIndex} className="p-2">
                              <Input
                                type={
                                  colIndex === COL.UNITS || colIndex === COL.GRADE
                                    ? "number"
                                    : "text"
                                }
                                value={cell}
                                disabled={colIndex === COL.SCORE}
                                min={
                                  colIndex === COL.UNITS ||
                                  colIndex === COL.GRADE
                                    ? 0
                                    : undefined
                                }
                                step={
                                  colIndex === COL.GRADE ? "0.1" : "1"
                                }
                                className={`${
                                  colIndex === COL.SCORE
                                    ? "text-accent font-medium cursor-not-allowed opacity-90"
                                    : ""
                                } ${colIndex === COL.UNITS || colIndex === COL.GRADE ? "text-center font-mono tabular-nums text-sm py-2" : ""}`}
                                onChange={(e) =>
                                  updateCell(
                                    tableIndex,
                                    rowIndex,
                                    colIndex,
                                    e.target.value
                                  )
                                }
                                placeholder={
                                  colIndex === COL.COURSE
                                    ? "Course"
                                    : colIndex === COL.UNITS
                                      ? "Units"
                                      : colIndex === COL.GRADE
                                        ? "Points"
                                        : ""
                                }
                              />
                            </td>
                          ))}
                          <td className="p-2 text-center align-middle">
                            <button
                              type="button"
                              onClick={() =>
                                deleteRow(tableIndex, rowIndex)
                              }
                              className="p-2 rounded-md text-muted hover:text-danger hover:bg-surface transition-colors"
                              title="Remove row"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {confirmDeleteIndex !== null && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4"
          role="dialog"
          aria-modal
        >
          <Card className="max-w-md w-full">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              Delete semester?
            </h3>
            <p className="text-sm text-muted mb-6">
              This removes “{tables[confirmDeleteIndex]?.name}” from your device.
              Local data only — confirm to continue.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => setConfirmDeleteIndex(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                type="button"
                onClick={() => {
                  deleteSemester(confirmDeleteIndex);
                  setConfirmDeleteIndex(null);
                }}
              >
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </main>
  );
}
