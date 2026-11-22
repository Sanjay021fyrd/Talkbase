const Card = ({ children, className = "", hover = false, ...props }) => {
  const hoverClass = hover
    ? "hover:border-brand-400/40 hover:shadow-2xl hover:shadow-brand-500/10 hover:-translate-y-0.5"
    : "";

  const clickableClass = props.onClick ? "cursor-pointer" : "";

  return (
    <div
      className={`surface rounded-2xl p-6 transition-all duration-300 ${hoverClass} ${clickableClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
