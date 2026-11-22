import { Link } from "react-router-dom";
import Button from "../components/Button";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="font-mono text-sm text-brand-300 mb-4">
          SELECT * FROM pages WHERE url = &apos;this one&apos;;
        </p>
        <h1 className="text-8xl sm:text-9xl font-bold text-gradient mb-2">
          404
        </h1>
        <h2 className="text-2xl sm:text-3xl font-bold text-ink-50 mb-3">
          0 rows returned
        </h2>
        <p className="text-ink-300 mb-8 max-w-md mx-auto">
          The page you are looking for does not exist or has moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button>Back to home</Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="ghost">Go to dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
