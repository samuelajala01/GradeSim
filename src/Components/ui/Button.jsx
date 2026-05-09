
const variants = {
  primary:
    "bg-accent text-white hover:bg-accent-hover focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  secondary:
    "bg-surface-elevated text-foreground border border-border hover:border-muted",
  ghost: "text-foreground hover:bg-surface-elevated",
  danger:
    "bg-danger text-white hover:bg-danger-hover focus-visible:ring-2 focus-visible:ring-danger",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm rounded-sm",
  md: "px-4 py-2 text-sm rounded-md",
  lg: "px-5 py-2.5 text-base rounded-md",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  disabled,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
