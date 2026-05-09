
export function Card({ children, className = "", padded = true }) {
  return (
    <div
      className={`rounded-md border border-border bg-surface shadow-card ${padded ? "p-6" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, description, actions }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between mb-6">
      <div>
        {title && (
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        )}
        {description && (
          <p className="text-sm text-muted mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">{actions}</div>}
    </div>
  );
}
