import { useMemo } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useAuth } from "../context/AuthContext";
import { useGradeData } from "../context/GradeDataContext";
import { COL, isRowComplete, semesterGpa, cgpaFormatted } from "../domain/grades";
import { Card, CardHeader } from "../Components/ui/Card";
import { Badge } from "../Components/ui/Badge";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const NEUTRAL = {
  muted: "#5c6778",
  border: "#2d3548",
  accentMuted: "rgba(91, 141, 239, 0.35)",
  accent: "rgba(91, 141, 239, 0.92)",
};

function gradeLetterBucket(points) {
  if (points >= 4.5) return "A";
  if (points >= 3.5) return "B";
  if (points >= 2.5) return "C";
  if (points >= 1.5) return "D";
  return "F";
}

function computeDistribution(tables) {
  const dist = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  tables.forEach((table) => {
    table.data.forEach((row) => {
      if (!isRowComplete(row)) return;
      const g = parseFloat(row[COL.GRADE]);
      if (!Number.isFinite(g)) return;
      if (g <= 0) return;
      const k = gradeLetterBucket(g);
      dist[k]++;
    });
  });
  return dist;
}

export default function Analytics() {
  const { currentUser } = useAuth();
  const { tables } = useGradeData();
  const first = currentUser?.profileData?.firstName || "there";

  const cgpaDisplay = cgpaFormatted(tables);
  const dist = useMemo(() => computeDistribution(tables), [tables]);

  const semesterGpas = tables.map((t) => semesterGpa(t));

  const barData = {
    labels: tables.map((t) => t.name),
    datasets: [
      {
        label: "Semester GPA",
        data: semesterGpas,
        backgroundColor: NEUTRAL.accentMuted,
        borderColor: NEUTRAL.accent,
        borderWidth: 1,
      },
    ],
  };

  const pieData = {
    labels: ["A", "B", "C", "D", "F"],
    datasets: [
      {
        data: Object.values(dist),
        backgroundColor: [
          NEUTRAL.accent,
          NEUTRAL.muted + "aa",
          "#7a8494",
          "#9a7580",
          "#556070",
        ],
        borderColor: NEUTRAL.border,
        borderWidth: 1,
      },
    ],
  };

  const chartOpts = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: NEUTRAL.muted } },
      },
      scales: {
        x: {
          ticks: { color: NEUTRAL.muted },
          grid: { color: NEUTRAL.border },
        },
        y: {
          ticks: { color: NEUTRAL.muted },
          grid: { color: NEUTRAL.border },
          beginAtZero: true,
        },
      },
    }),
    []
  );

  const pieOpts = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: NEUTRAL.muted } },
      },
    }),
    []
  );

  return (
    <main className="min-h-screen w-full overflow-auto bg-background p-6 sm:p-10 lg:p-12 pt-24 lg:pt-12 scrollbar-thin">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
              Analytics
            </h1>
            <p className="text-sm text-muted mt-2">
              Snapshot for {first} — synced with your dashboard in real time.
            </p>
          </div>
          <Badge variant="accent">CGPA {cgpaDisplay}</Badge>
        </div>

        {tables.length === 0 ? (
          <Card padded>
            <p className="text-muted text-sm">
              No semester data yet. Add semesters on the dashboard first.
            </p>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <Card padded>
                <div className="text-xs uppercase tracking-wide text-muted">
                  Semesters
                </div>
                <p className="text-3xl font-semibold mt-2 text-foreground tabular-nums">
                  {tables.length}
                </p>
              </Card>
              <Card padded>
                <div className="text-xs uppercase tracking-wide text-muted">
                  Overall CGPA
                </div>
                <p className="text-3xl font-semibold mt-2 text-accent tabular-nums">
                  {cgpaDisplay}
                </p>
              </Card>
              <Card padded className="sm:col-span-2 lg:col-span-1">
                <div className="text-xs uppercase tracking-wide text-muted">
                  Course rows
                </div>
                <p className="text-3xl font-semibold mt-2 text-foreground tabular-nums">
                  {tables.reduce((n, t) => n + t.data.length, 0)}
                </p>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader title="Semester GPAs" />
                <div className="h-64 pb-4">
                  <Bar data={barData} options={chartOpts} />
                </div>
              </Card>
              <Card>
                <CardHeader
                  title="Grade distribution"
                  description="Letter buckets derived from numeric points (approximate)."
                />
                <div className="h-64 pb-4 flex justify-center">
                  <Pie data={pieData} options={pieOpts} />
                </div>
              </Card>
            </div>

            <Card>
              <CardHeader title="Counts by letter bucket" />
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {Object.entries(dist).map(([letter, count]) => (
                  <div
                    key={letter}
                    className="rounded-md border border-border bg-surface-elevated px-3 py-4 text-center"
                  >
                    <div className="text-2xl font-semibold tabular-nums text-foreground">
                      {count}
                    </div>
                    <div className="text-xs text-muted uppercase mt-1">
                      {letter}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </main>
  );
}
