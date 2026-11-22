import { Link } from "react-router-dom";

/**
 * TalkBase mark: two speech bubbles.
 * Sky = the human question, violet = the query it is translated into.
 */
export const LogoMark = ({ className = "w-9 h-9" }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
    {/* human bubble */}
    <path
      d="M10 8h28a7 7 0 0 1 7 7v16a7 7 0 0 1-7 7H24l-9 8v-8h-5a7 7 0 0 1-7-7V15a7 7 0 0 1 7-7Z"
      fill="#7dd3fc"
    />
    <circle cx="17" cy="23" r="2.4" fill="#0b0d17" />
    <circle cx="25" cy="23" r="2.4" fill="#0b0d17" />
    <circle cx="33" cy="23" r="2.4" fill="#0b0d17" />
    {/* machine bubble */}
    <path
      d="M30 26h24a7 7 0 0 1 7 7v15a7 7 0 0 1-7 7h-4v8l-9-8H30a7 7 0 0 1-7-7V33a7 7 0 0 1 7-7Z"
      fill="#c4b5fd"
      stroke="#0b0d17"
      strokeWidth="3"
    />
    <path
      d="M35 36l-5 5.5 5 5.5M49 36l5 5.5-5 5.5M44.5 34l-5 15"
      stroke="#0b0d17"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Logo = ({ to = "/", size = "md" }) => {
  const mark = size === "lg" ? "w-11 h-11" : "w-9 h-9";
  const text = size === "lg" ? "text-3xl" : "text-xl";
  return (
    <Link to={to} className="flex items-center gap-2.5 group">
      <LogoMark
        className={`${mark} group-hover:-rotate-6 transition-transform duration-300`}
      />
      <span
        className={`${text} font-semibold tracking-tight text-ink-50`}
      >
        Talk<span className="text-gradient">Base</span>
      </span>
    </Link>
  );
};

export default Logo;
