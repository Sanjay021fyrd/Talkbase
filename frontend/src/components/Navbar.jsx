import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import Logo from "./Logo";

const linkClass = ({ isActive }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
    isActive
      ? "text-ink-50 bg-white/5"
      : "text-ink-300 hover:text-ink-50 hover:bg-white/5"
  }`;

const primaryCta =
  "btn-gradient text-ink-950 text-sm font-semibold px-4 py-2 rounded-xl shadow-lg shadow-brand-500/25 hover:brightness-110 transition";

const Navbar = ({ isAuthenticated, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/");
    setIsMenuOpen(false);
  };

  const close = () => setIsMenuOpen(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-3 sm:px-6 pt-3">
      <nav className="surface max-w-6xl mx-auto rounded-2xl px-4 sm:px-5">
        <div className="flex justify-between items-center h-14">
          <Logo />

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/" end className={linkClass}>
              Home
            </NavLink>
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard" className={linkClass}>
                  Dashboard
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="ml-2 px-4 py-2 rounded-xl text-sm font-semibold text-ink-200 border border-ink-600 hover:border-brand-500/60 hover:text-ink-50 transition"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={linkClass}>
                  Log in
                </NavLink>
                <Link to="/register" className={`ml-2 ${primaryCta}`}>
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-ink-300 hover:text-ink-50 focus:outline-none"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 pt-1 flex flex-col gap-1 border-t border-ink-700/60">
            <NavLink to="/" end onClick={close} className={linkClass}>
              Home
            </NavLink>
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard" onClick={close} className={linkClass}>
                  Dashboard
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="mt-2 px-4 py-2 rounded-xl text-sm font-semibold text-ink-200 border border-ink-600 text-left"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" onClick={close} className={linkClass}>
                  Log in
                </NavLink>
                <Link
                  to="/register"
                  onClick={close}
                  className={`mt-2 text-center ${primaryCta}`}
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
