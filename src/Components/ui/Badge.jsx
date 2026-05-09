
export function Badge({ children, variant = "default", className = "" }) {
  const styles = {
    default: "bg-surface-elevated text-muted border border-border",
    accent: "bg-accent/15 text-accent border border-accent/30",
    success: "bg-success/15 text-success border border-success/30",
    danger: "bg-danger/15 text-danger border border-danger/30",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-sm ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
