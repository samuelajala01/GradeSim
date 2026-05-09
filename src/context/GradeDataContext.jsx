import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import debounce from "lodash/debounce";
import { GRADE_TABLE_STORAGE_KEY } from "../constants/gradeStorage";
import {
  COL,
  computeRowScoreCells,
  cgpaFormatted,
  semesterGpaFormatted,
  totalCompletedUnitsAcross,
  totalDisplayScoreSumAcross,
  totalCourseRows,
  aggregateTotals,
} from "../domain/grades";

const GradeDataContext = createContext(null);

const emptyColNames = ["Course", "Course Unit", "Grade", "Score"];

function createEmptyRow() {
  return ["", "", "", ""];
}

function createTable(name) {
  return {
    name,
    rows: 4,
    cols: 4,
    colNames: [...emptyColNames],
    data: [createEmptyRow()],
  };
}

function normalizeLoadedTables(parsed) {
  if (!Array.isArray(parsed)) return [];
  return parsed.map((t) => ({
    ...t,
    data: Array.isArray(t.data) ? t.data : [createEmptyRow()],
    colNames: Array.isArray(t.colNames) ? t.colNames : [...emptyColNames],
  }));
}

export function GradeDataProvider({ children }) {
  const [tables, setTablesState] = useState(() => {
    try {
      const raw = localStorage.getItem(GRADE_TABLE_STORAGE_KEY);
      if (!raw) return [];
      return normalizeLoadedTables(JSON.parse(raw));
    } catch {
      return [];
    }
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const persist = useMemo(
    () =>
      debounce((data) => {
        try {
          localStorage.setItem(GRADE_TABLE_STORAGE_KEY, JSON.stringify(data));
          setHasUnsavedChanges(false);
        } catch (e) {
          console.error("Grade save failed:", e);
        }
      }, 450),
    []
  );

  const flushSave = useCallback(() => {
    persist.flush();
  }, [persist]);

  const setTables = useCallback((updater) => {
    setTablesState((prev) => {
      const next =
        typeof updater === "function" ? updater(prev) : updater;
      return Array.isArray(next) ? next : prev;
    });
  }, []);

  const saveSoon = useCallback(
    (data) => {
      setHasUnsavedChanges(true);
      persist(data);
    },
    [persist]
  );

  useEffect(() => () => persist.cancel(), [persist]);

  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        try {
          localStorage.setItem(
            GRADE_TABLE_STORAGE_KEY,
            JSON.stringify(tables)
          );
        } catch {
          /* ignore */
        }
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [tables, hasUnsavedChanges]);

  const addSemester = useCallback((name) => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    setTables((prev) => {
      const next = [...prev, createTable(trimmed)];
      saveSoon(next);
      return next;
    });
    return true;
  }, [saveSoon, setTables]);

  const deleteSemester = useCallback((index) => {
    setTables((prev) => {
      const next = prev.filter((_, i) => i !== index);
      saveSoon(next);
      return next;
    });
  }, [saveSoon, setTables]);

  const updateCell = useCallback(
    (tableIndex, rowIndex, colIndex, value) => {
      if (
        (colIndex === COL.UNITS || colIndex === COL.GRADE) &&
        value !== ""
      ) {
        if (colIndex === COL.UNITS) {
          if (Number.isNaN(parseFloat(value))) return;
        } else if (Number.isNaN(parseFloat(value))) return;
      }

      setTables((prev) => {
        const next = [...prev];
        const table = {
          ...next[tableIndex],
          data: next[tableIndex].data.map((r) => [...r]),
        };
        const newRow = [...table.data[rowIndex]];
        newRow[colIndex] = value;

        if (colIndex === COL.UNITS || colIndex === COL.GRADE) {
          newRow[COL.SCORE] = computeRowScoreCells(newRow);
        }

        table.data[rowIndex] = newRow;
        next[tableIndex] = table;
        saveSoon(next);
        return next;
      });
    },
    [saveSoon, setTables]
  );

  const addRow = useCallback((tableIndex) => {
    setTables((prev) => {
      const next = [...prev];
      const data = [...next[tableIndex].data, createEmptyRow()];
      next[tableIndex] = { ...next[tableIndex], data };
      saveSoon(next);
      return next;
    });
  }, [saveSoon, setTables]);

  const deleteRow = useCallback((tableIndex, rowIndex) => {
    setTables((prev) => {
      const data = [...prev[tableIndex].data];
      data.splice(rowIndex, 1);
      let next;
      if (data.length === 0) {
        next = prev.filter((_, i) => i !== tableIndex);
      } else {
        next = [...prev];
        next[tableIndex] = { ...next[tableIndex], data };
      }
      saveSoon(next);
      return next;
    });
  }, [saveSoon, setTables]);

  /**
   * @param {'new'|number} target - NEW creates semester with `newSemesterName`, else index
   */
  const importCourses = useCallback(
    (target, parsedRows, newSemesterName) => {
      const rowsFromImport = parsedRows.map((p) => {
        const credits = Number(p.credits);
        const grade = Number(p.grade);
        const r = ["", "", "", ""];
        r[COL.COURSE] = String(p.courseName || "").trim() || `Course`;
        r[COL.UNITS] =
          Number.isFinite(credits) && credits >= 0 ? String(credits) : "";
        r[COL.GRADE] =
          Number.isFinite(grade) ? String(grade) : "";
        r[COL.SCORE] = computeRowScoreCells(r);
        return r;
      }).filter((r) => r[COL.COURSE] !== "");

      if (rowsFromImport.length === 0) return;

      setTables((prev) => {
        let next;
        if (target === "new") {
          const name = (newSemesterName || "Imported semester").trim();
          const t = createTable(name);
          t.data = rowsFromImport;
          next = [...prev, t];
        } else {
          const ti = typeof target === "number" ? target : parseInt(target, 10);
          if (ti < 0 || ti >= prev.length) return prev;
          const table = prev[ti];
          next = [...prev];
          next[ti] = {
            ...table,
            data: [...table.data, ...rowsFromImport],
          };
        }
        saveSoon(next);
        return next;
      });
    },
    [saveSoon, setTables]
  );

  const summary = useMemo(
    () => ({
      cgpa: cgpaFormatted(tables),
      totalUnits: totalCompletedUnitsAcross(tables),
      totalScoreDisplay: totalDisplayScoreSumAcross(tables),
      totalQualitySum: aggregateTotals(tables).totalQuality,
      courseCount: totalCourseRows(tables),
    }),
    [tables]
  );

  const value = useMemo(
    () => ({
      tables,
      summary,
      hasUnsavedChanges,
      flushSave,
      addSemester,
      deleteSemester,
      updateCell,
      addRow,
      deleteRow,
      importCourses,
      semesterGpaFormatted: (ti) =>
        semesterGpaFormatted(tables[ti] || { data: [] }),
      GRADE_STORAGE_KEY: GRADE_TABLE_STORAGE_KEY,
    }),
    [
      tables,
      summary,
      hasUnsavedChanges,
      flushSave,
      addSemester,
      deleteSemester,
      updateCell,
      addRow,
      deleteRow,
      importCourses,
    ]
  );

  return (
    <GradeDataContext.Provider value={value}>{children}</GradeDataContext.Provider>
  );
}

export function useGradeData() {
  const ctx = useContext(GradeDataContext);
  if (!ctx)
    throw new Error("useGradeData must be used within GradeDataProvider");
  return ctx;
}
