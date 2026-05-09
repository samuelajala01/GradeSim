import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/Button";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/analytics", label: "Analytics" },
  { to: "/predictor", label: "Predictor" },
  { to: "/settings", label: "Settings" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed top-4 right-4 z-50 lg:hidden rounded-md border border-border bg-surface p-2.5 shadow-card text-foreground"
        aria-expanded={open}
        aria-label="Toggle menu"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      <aside
        className={[
          "fixed lg:sticky top-0 z-40 h-screen w-56 shrink-0 border-r border-border bg-surface",
          "flex flex-col px-4 py-8 lg:translate-x-0 shadow-card lg:shadow-none transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        <div className="px-3 mb-10">
          <Link
            to="/"
            className="text-xl font-semibold tracking-tight text-foreground"
            onClick={() => setOpen(false)}
          >
            Grade<span className="text-accent">Sim</span>
          </Link>
          <p className="text-xs text-muted mt-1 leading-snug">
            GPA planner & importer
          </p>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-surface-elevated border border-transparent hover:border-border transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted hover:text-foreground"
            onClick={() => {
              handleLogout();
              setOpen(false);
            }}
          >
            Log out
          </Button>
        </div>
      </aside>

      {open && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
