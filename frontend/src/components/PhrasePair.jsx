/** A tiny "translation strip" used on auth pages: human phrase -> query. */
const PAIRS = [
  ["show me customers who haven't ordered this year", "SELECT * FROM customers WHERE last_order < '2026-01-01';"],
  ["average salary by department", "SELECT department, AVG(salary) FROM staff GROUP BY department;"],
  ["top 5 products by units sold", "SELECT name, SUM(qty) AS units FROM sales GROUP BY name ORDER BY units DESC LIMIT 5;"],
];

const PhrasePair = ({ index = 0 }) => {
  const [human, code] = PAIRS[index % PAIRS.length];
  return (
    <div className="mb-8 space-y-2 text-left">
      <div className="inline-block max-w-full rounded-xl rounded-bl-sm bg-brand-500/12 border border-brand-400/30 px-3.5 py-2 text-sm text-brand-50 font-display ">
        “{human}”
      </div>
      <div className="flex justify-end">
        <pre className="code-block text-[11px] leading-snug px-3 py-2 max-w-full overflow-x-auto whitespace-pre-wrap">
          {code}
        </pre>
      </div>
    </div>
  );
};

export default PhrasePair;
