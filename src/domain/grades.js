/**
 * Column indices per row: Course, Units/credits, Grade (points), derived Score (units * grade).
 * Only rows that pass `isRowComplete` contribute to GPA aggregates.
 */

export const COL = {
  COURSE: 0,
  UNITS: 1,
  GRADE: 2,
  SCORE: 3,
};

/**
 * Derive numeric score column from units & grade strings.
 */
export function computeRowScoreCells(row) {
  const unit = parseFloat(row[COL.UNITS]);
  const grade = parseFloat(row[COL.GRADE]);
  if (
    Number.isFinite(unit) &&
    Number.isFinite(grade) &&
    row[COL.UNITS] !== "" &&
    row[COL.GRADE] !== ""
  ) {
    return Math.round(unit * grade).toString();
  }
  return "";
}

/**
 * Same validation as legacy Home: nonempty course/units/grade and numeric units & grade.
 */
export function isRowComplete(row) {
  const course = row[COL.COURSE];
  const u = row[COL.UNITS];
  const g = row[COL.GRADE];
  if (!course?.trim?.() || u === "" || g === "") return false;
  const unit = parseFloat(u);
  const grade = parseFloat(g);
  return Number.isFinite(unit) && Number.isFinite(grade);
}

export function rowQualityPoints(row) {
  if (!isRowComplete(row)) return { points: 0, units: 0 };
  const units = parseFloat(row[COL.UNITS]);
  const grade = parseFloat(row[COL.GRADE]);
  return {
    points: units * grade,
    units,
  };
}

export function semesterTotals(table) {
  let totalQuality = 0;
  let totalUnits = 0;
  for (const row of table.data) {
    const { points, units } = rowQualityPoints(row);
    if (units <= 0) continue;
    totalQuality += points;
    totalUnits += units;
  }
  return { totalQuality, totalUnits };
}

export function semesterGpa(table) {
  const { totalQuality, totalUnits } = semesterTotals(table);
  if (!totalUnits) return 0;
  return totalQuality / totalUnits;
}

export function semesterGpaFormatted(table, digits = 2) {
  return semesterGpa(table).toFixed(digits);
}

export function aggregateTotals(tables) {
  let totalQuality = 0;
  let totalUnits = 0;
  for (const table of tables) {
    const t = semesterTotals(table);
    totalQuality += t.totalQuality;
    totalUnits += t.totalUnits;
  }
  return { totalQuality, totalUnits };
}

export function cgpa(tables) {
  const { totalQuality, totalUnits } = aggregateTotals(tables);
  if (!totalUnits) return 0;
  return totalQuality / totalUnits;
}

export function cgpaFormatted(tables, digits = 2) {
  return cgpa(tables).toFixed(digits);
}

export function totalCompletedUnitsAcross(tables) {
  return aggregateTotals(tables).totalUnits;
}

/** Sum of rounded per-row Score column (matches table display). */
export function totalDisplayScoreSumAcross(tables) {
  let sum = 0;
  for (const table of tables) {
    for (const row of table.data) {
      if (!isRowComplete(row)) continue;
      sum += parseFloat(row[COL.SCORE]) || 0;
    }
  }
  return sum;
}

export function totalWeightedScoreSumAcross(tables) {
  let sum = 0;
  for (const table of tables) {
    for (const row of table.data) {
      const { units, grade } = rowParsed(row);
      if (units > 0 && Number.isFinite(grade)) sum += units * grade;
    }
  }
  return sum;
}

function rowParsed(row) {
  const units = parseFloat(row[COL.UNITS]);
  const grade = parseFloat(row[COL.GRADE]);
  return {
    units: Number.isFinite(units) ? units : 0,
    grade: Number.isFinite(grade) ? grade : NaN,
  };
}

/** Course count excluding header rows — all data rows */
export function totalCourseRows(tables) {
  return tables.reduce((n, t) => n + t.data.length, 0);
}

/**
 * Needed score X on remainder with weight `weight` (0–1): goal = avg*(1-w) + X*w
 * Solves: X = (goal - current*(1-w)) / w
 */
export function requiredScoreWeightedAverage({
  currentAverage,
  goalAverage,
  remainderWeight,
}) {
  const w = remainderWeight;
  if (!(w > 0 && w <= 1)) return { valid: false, needed: NaN };
  const needed = (goalAverage - currentAverage * (1 - w)) / w;
  return { valid: Number.isFinite(needed), needed };
}
