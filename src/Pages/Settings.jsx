import { useState, useEffect } from "react";
import { Card, CardHeader } from "../Components/ui/Card";
import { Label } from "../Components/ui/Input";
import { Select } from "../Components/ui/Input";
import { Button } from "../Components/ui/Button";

function applyTheme(value) {
  const v = value === "light" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", v);
}

export default function Settings() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark"
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    () => localStorage.getItem("notificationsEnabled") === "true"
  );
  const [gpaScale, setGpaScale] = useState(
    () => localStorage.getItem("gpaScale") || "4.0"
  );

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("gpaScale", gpaScale);
  }, [gpaScale]);

  useEffect(() => {
    localStorage.setItem(
      "notificationsEnabled",
      notificationsEnabled ? "true" : "false"
    );
  }, [notificationsEnabled]);

  return (
    <main className="min-h-screen w-full overflow-auto bg-background p-6 sm:p-10 lg:p-12 pt-24 lg:pt-12">
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            Settings
          </h1>
          <p className="text-sm text-muted mt-2">
            Preferences persist in this browser.
          </p>
        </div>

        <Card>
          <CardHeader title="Appearance" />
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select
              id="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </Select>
          </div>
        </Card>

        <Card>
          <CardHeader title="Grading assumptions" />
          <div className="space-y-2">
            <Label htmlFor="gpaScale">GPA scale hint (Predictor)</Label>
            <Select
              id="gpaScale"
              value={gpaScale}
              onChange={(e) => setGpaScale(e.target.value)}
            >
              <option value="4.0">4.0</option>
              <option value="5.0">5.0</option>
              <option value="10.0">10.0</option>
            </Select>
          </div>
        </Card>

        <Card>
          <CardHeader title="Notifications" />
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={() => setNotificationsEnabled((x) => !x)}
              className="rounded border-border text-accent bg-surface-elevated focus:ring-accent"
            />
            <span className="text-sm text-foreground">
              Placeholder preference (no push notifications wired)
            </span>
          </label>
          <div className="mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => applyTheme(theme)}
            >
              Re-apply theme
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}
