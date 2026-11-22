const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  className = "",
  disabled = false,
  fullWidth = false,
}) => {
  const baseClasses =
    "inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

  const variants = {
    primary:
      "btn-gradient text-ink-950 shadow-lg shadow-brand-500/25 hover:shadow-brand-400/40 hover:brightness-110",
    secondary:
      "bg-ink-800 text-brand-300 border border-brand-500/40 hover:bg-ink-700 hover:border-brand-400",
    danger: "bg-red-600 text-ink-50 hover:bg-red-500 focus-visible:ring-red-400",
    ghost:
      "bg-transparent text-brand-300 border border-ink-600 hover:border-brand-500/60 hover:bg-brand-500/10",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${widthClass} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
