
export function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-60 ${className}`}
      {...props}
    />
  );
}

export function Label({ children, htmlFor, className = "" }) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-medium text-foreground mb-1.5 ${className}`}
    >
      {children}
    </label>
  );
}

export function Select({ children, className = "", ...props }) {
  return (
    <select
      className={`w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
