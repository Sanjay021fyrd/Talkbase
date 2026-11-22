import { Link } from "react-router-dom";
import Logo from "./Logo";

const Footer = () => {
  return (
    <footer className="border-t border-ink-700/60 mt-auto bg-ink-950/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <Logo />
            <p className="text-ink-400 max-w-md mt-4 text-sm leading-relaxed">
              Ask questions about your MySQL, PostgreSQL and spreadsheet data
              in plain language, by typing or speaking. Get back the query, a
              table, a chart and an export.
            </p>
          </div>

          <div>
            <h3 className="text-ink-50 text-sm font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-ink-400 hover:text-brand-300 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="text-ink-400 hover:text-brand-300 transition-colors"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-ink-50 text-sm font-semibold mb-4">Account</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/login"
                  className="text-ink-400 hover:text-brand-300 transition-colors"
                >
                  Log in
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-ink-400 hover:text-brand-300 transition-colors"
                >
                  Create account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-ink-700/60 mt-10 pt-6 text-center">
          <p className="text-ink-500 text-xs">
            © {new Date().getFullYear()} TalkBase. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
