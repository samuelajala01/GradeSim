import { useMemo, useState } from "react";
import {
  cgpaFormatted,
  aggregateTotals,
  requiredScoreWeightedAverage,
} from "../domain/grades";
import { useGradeData } from "../context/GradeDataContext";
import { Card, CardHeader } from "../Components/ui/Card";
import { Input } from "../Components/ui/Input";
import { Label } from "../Components/ui/Input";

function readScale() {
  const v =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("gpaScale") || "4.0"
      : "4.0";
  const n = parseFloat(String(v).replace(/[^\d.]/g, "")) || 4;
  return n;
}

/** Planning tools only — formulas documented inline. */
export default function Predictor() {
  const { tables } = useGradeData();
  const scaleMax = readScale();
  const liveCgpa = useMemo(() => cgpaFormatted(tables), [tables]);

  const [tab, setTab] = useState("remainder");

  const [avgSoFar, setAvgSoFar] = useState("78");
  const [weightRemainder, setWeightRemainder] = useState("0.35");
  const [desiredOverall, setDesiredOverall] = useState("82");

  const [extraCreditsStr, setExtraCreditsStr] = useState("12");
  const [guessNewGpaStr, setGuessNewGpaStr] = useState("3.7");

  const remainderResult = useMemo(() => {
    const curAvg = parseFloat(avgSoFar);
    const wRem = parseFloat(weightRemainder);
    const desire = parseFloat(desiredOverall);
    return requiredScoreWeightedAverage({
      currentAverage: curAvg,
      goalAverage: desire,
      remainderWeight: wRem,
    });
  }, [avgSoFar, weightRemainder, desiredOverall]);

  const hypotheticalCgpaDisplay = useMemo(() => {
    const { totalQuality, totalUnits } = aggregateTotals(tables);
    const extraU = parseFloat(extraCreditsStr);
    const hypothetical = parseFloat(guessNewGpaStr);
    if (
      !(Number.isFinite(extraU) && extraU >= 0) ||
      !(Number.isFinite(hypothetical) && hypothetical >= 0)
    )
      return "—";
    const denom = totalUnits + extraU;
    if (!(denom > 0)) return "—";
    return ((totalQuality + hypothetical * extraU) / denom).toFixed(2);
  }, [tables, extraCreditsStr, guessNewGpaStr]);

  const remainderValid =
    remainderResult.valid &&
    Number.isFinite(remainderResult.needed) &&
    parseFloat(weightRemainder) > 0 &&
    parseFloat(weightRemainder) <= 1;

  const tabs = [
    { key: "remainder", label: "Final weight (%)" },
    { key: "cgpa_hypothetical", label: "Hypothetical block" },
  ];

  return (
    <main className="min-h-screen w-full bg-background overflow-auto p-6 sm:p-10 lg:p-12 pt-24 lg:pt-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            Predictor
          </h1>
          <p className="text-sm text-muted mt-2 max-w-2xl leading-relaxed">
            Rough planning aids only. Settings GPA scale ({scaleMax.toFixed(1)})
            informs input caps only.
          </p>
          <p className="text-xs text-muted mt-2">
            Live CGPA from saved semesters:{" "}
            <span className="text-accent font-semibold tabular-nums">
              {liveCgpa}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap rounded-md border border-border bg-surface p-1 gap-1 w-fit">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`px-4 py-2 text-sm font-medium rounded-sm transition-colors ${
                tab === key
                  ? "bg-accent text-white"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "remainder" && (
          <Card>
            <CardHeader
              title="What score is needed on the remainder?"
              description="overall = avgSoFar × (1 − w) + X × w  →  X = (goal − avgSoFar × (1 − w)) / w"
            />
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="avg">Current average (%)</Label>
                <Input
                  id="avg"
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  value={avgSoFar}
                  onChange={(e) => setAvgSoFar(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="w">Remainder weight (0–1)</Label>
                <Input
                  id="w"
                  type="number"
                  min={0.01}
                  max={1}
                  step="0.01"
                  value={weightRemainder}
                  onChange={(e) => setWeightRemainder(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="goal">Target overall (%)</Label>
                <Input
                  id="goal"
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  value={desiredOverall}
                  onChange={(e) => setDesiredOverall(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-6 rounded-md border border-border bg-surface-elevated px-4 py-4">
              {remainderValid ? (
                <>
                  <p className="text-sm text-muted">
                    Required score on weighted remainder:
                  </p>
                  <p className="text-3xl font-semibold text-accent tabular-nums mt-1">
                    {remainderResult.needed.toFixed(1)}%
                  </p>
                  {remainderResult.needed > 100 && (
                    <p className="text-sm text-danger mt-2">
                      Above 100% in this simplified model — may be unreachable.
                    </p>
                  )}
                  {remainderResult.needed < 0 && (
                    <p className="text-sm text-success mt-2">
                      Below 0% in the model implies you&apos;re already above the
                      target threshold before the weighted remainder.
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted">
                  Enter remainder weight strictly between 0 and 1 and numeric
                  averages.
                </p>
              )}
            </div>
          </Card>
        )}

        {tab === "cgpa_hypothetical" && (
          <Card>
            <CardHeader
              title="Extra credits projection"
              description="Uses Σ(units × points) across complete dashboard rows plus a hypothetical credit block."
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="extra">Extra credit hours</Label>
                <Input
                  id="extra"
                  type="number"
                  min={0}
                  step="1"
                  value={extraCreditsStr}
                  onChange={(e) => setExtraCreditsStr(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="gpaGuess">
                  GPA points on those credits (0–{scaleMax.toFixed(1)})
                </Label>
                <Input
                  id="gpaGuess"
                  type="number"
                  min={0}
                  max={scaleMax}
                  step="0.01"
                  value={guessNewGpaStr}
                  onChange={(e) => setGuessNewGpaStr(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-6 rounded-md border border-border bg-surface-elevated px-4 py-4">
              <p className="text-sm text-muted">Projected combined CGPA:</p>
              <p className="text-3xl font-semibold text-accent tabular-nums mt-1">
                {hypotheticalCgpaDisplay}
              </p>
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}
