import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Button from "../components/Button";
import Card from "../components/Card";

const MIC_PATH =
  "M12 15a3 3 0 003-3V6a3 3 0 10-6 0v6a3 3 0 003 3zm0 0v4m-4 0h8M5 11a7 7 0 0014 0";

/* Sample questions for the live demo on the hero */
const DEMOS = [
  {
    chip: "Top categories",
    q: "Top 3 categories by revenue this quarter?",
    sql: `SELECT category, SUM(total) AS revenue
FROM orders
WHERE order_date >= now() - interval '3 months'
GROUP BY category
ORDER BY revenue DESC
LIMIT 3;`,
    cols: ["category", "revenue"],
    rows: [
      ["Electronics", "184,200"],
      ["Home", "126,750"],
      ["Sports", "97,310"],
    ],
    bars: [100, 69, 53],
  },
  {
    chip: "New customers",
    q: "How many customers signed up each month?",
    sql: `SELECT date_trunc('month', created_at) AS month,
       COUNT(*) AS customers
FROM customers
GROUP BY 1
ORDER BY 1;`,
    cols: ["month", "customers"],
    rows: [
      ["Aug", "412"],
      ["Sep", "468"],
      ["Oct", "531"],
    ],
    bars: [78, 88, 100],
  },
  {
    chip: "Low stock",
    q: "Which products are running low on stock?",
    sql: `SELECT name, stock
FROM products
WHERE stock < 20
ORDER BY stock;`,
    cols: ["product", "stock"],
    rows: [
      ["USB-C hub", "4"],
      ["Desk lamp", "9"],
      ["Webcam", "14"],
    ],
    bars: [28, 64, 100],
  },
];

const BAR_COLORS = ["#7dd3fc", "#c4b5fd", "#a7f3d0"];

const works = [
  {
    name: "PostgreSQL",
    body: "Connect with host, port and credentials. The schema is read automatically.",
  },
  {
    name: "MySQL",
    body: "The same plain-language experience, with MySQL-flavoured queries.",
  },
  {
    name: "CSV and Excel",
    body: "Upload a file and it becomes a table you can ask questions about straight away.",
  },
];

const features = [
  {
    title: "Natural-language queries",
    body: "Ask about a MySQL or PostgreSQL database in everyday words. TalkBase reads your schema and writes a safe, read-only SELECT.",
    icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4",
  },
  {
    title: "Spreadsheet analysis",
    body: "Upload a CSV or Excel file and ask questions about it. Pandas does the calculating behind the scenes.",
    icon: "M3 10h18M3 14h18M9 4v16M15 4v16M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
  },
  {
    title: "Voice input",
    body: "Hold the mic and speak. Speech in any language is transcribed and translated into an English question.",
    icon: MIC_PATH,
  },
  {
    title: "Charts",
    body: "Get chart suggestions for any result and render interactive Plotly charts in one click.",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
  {
    title: "Autocomplete",
    body: "Suggestions appear as you type, built from your real table and column names.",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
  },
  {
    title: "Chat history and export",
    body: "Every conversation is saved so you can resume it. Export results as CSV or email them from the app.",
    icon: "M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4",
  },
];

const steps = [
  {
    n: "1",
    title: "Connect",
    body: "Link a database or upload a file. TalkBase reads the schema so it knows your tables and columns.",
  },
  {
    n: "2",
    title: "Ask",
    body: "Type or speak a question. It is translated into SQL or Pandas, validated and checked to be read-only.",
  },
  {
    n: "3",
    title: "Understand",
    body: "See the query it wrote, the result table, chart suggestions and one-click export.",
  },
];

const Icon = ({ d, className = "w-5 h-5" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

/** Interactive demo: pick a question, watch the query type out and the answer appear. */
const AuroraDemo = () => {
  const [active, setActive] = useState(0);
  const [typed, setTyped] = useState("");
  const [grown, setGrown] = useState(false);
  const [listening, setListening] = useState(false);
  const d = DEMOS[active];

  useEffect(() => {
    let n = 0;
    setTyped("");
    setGrown(false);
    const grow = setTimeout(() => setGrown(true), 60);
    const t = setInterval(() => {
      n += 2;
      setTyped(d.sql.slice(0, n));
      if (n >= d.sql.length) clearInterval(t);
    }, 16);
    return () => {
      clearTimeout(grow);
      clearInterval(t);
    };
  }, [d]);

  const next = () => setActive((i) => (i + 1) % DEMOS.length);

  const listen = () => {
    if (listening) return;
    setListening(true);
    setTimeout(() => {
      setListening(false);
      next();
    }, 1300);
  };

  return (
    <div className="text-left">
      {/* input pill */}
      <div className="surface rounded-full flex items-center gap-2 pl-5 pr-1.5 py-1.5">
        <span className="flex-1 text-sm text-ink-400 truncate">
          {d.q}
        </span>
        <button
          type="button"
          onClick={listen}
          aria-label="Try the microphone"
          className={`w-9 h-9 rounded-full bg-white/10 text-ink-100 flex items-center justify-center hover:bg-white/15 transition ${
            listening ? "animate-mic-pulse" : ""
          }`}
        >
          <Icon d={MIC_PATH} className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={next}
          className="btn-gradient text-ink-950 text-sm font-semibold rounded-full h-9 px-5 hover:brightness-110 transition"
        >
          Ask
        </button>
      </div>

      {/* question chips */}
      <div className="flex flex-wrap gap-2 mt-3">
        {DEMOS.map((x, i) => (
          <button
            key={x.chip}
            type="button"
            onClick={() => setActive(i)}
            className={`px-3.5 py-1.5 rounded-full text-xs border transition ${
              i === active
                ? "bg-violet-300/25 border-violet-300 text-white"
                : "bg-white/5 border-white/20 text-ink-200 hover:bg-white/10"
            }`}
          >
            {x.chip}
          </button>
        ))}
      </div>

      {/* answer panels */}
      <div className="grid sm:grid-cols-2 gap-3 mt-4">
        <div className="surface rounded-2xl p-4">
          <p className="eyebrow mb-2">You asked</p>
          <div className="ml-auto w-max max-w-full rounded-2xl rounded-br-sm bg-gradient-to-r from-brand-400 to-indigo-400 text-ink-950 text-[13px] px-3 py-1.5">
            {d.q}
          </div>
          <p className="eyebrow mt-4 mb-1.5 text-lang-300">
            TalkBase wrote
          </p>
          <pre className="code-block text-[12px] leading-relaxed p-3 whitespace-pre-wrap min-h-[7.5rem]">
            {typed}
            <span className="animate-caret">▍</span>
          </pre>
        </div>

        <div className="surface rounded-2xl p-4">
          <p className="eyebrow mb-2">Answer</p>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-ink-400">
                {d.cols.map((c, i) => (
                  <th
                    key={c}
                    className={`pb-1.5 font-normal ${i ? "text-right" : "text-left"}`}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.rows.map(([a, b]) => (
                <tr key={a} className="border-t border-white/10 text-ink-100">
                  <td className="py-1.5">{a}</td>
                  <td className="py-1.5 text-right font-mono">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-end gap-3 h-24 mt-4">
            {d.bars.map((h, i) => (
              <div
                key={d.rows[i][0]}
                className="flex-1 h-full flex flex-col justify-end items-center gap-1 text-[10px] text-ink-400"
              >
                <div
                  className="w-full rounded-t-md transition-[height] duration-700 ease-out"
                  style={{
                    height: grown ? `${h}%` : "0%",
                    background: BAR_COLORS[i % BAR_COLORS.length],
                  }}
                />
                <span>{d.rows[i][0]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const [user] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-36 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1 text-xs font-medium text-ink-200 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-lang-400" />
            MySQL · PostgreSQL · CSV · Excel
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.08] text-ink-50">
            What do you want
            <br />
            <span className="text-gradient">to know about your data?</span>
          </h1>

          <p className="mt-6 text-lg text-ink-300 max-w-2xl mx-auto">
            Ask in plain language, by typing or speaking. TalkBase writes the
            SQL or Pandas, runs it read-only, and brings back a table, a chart
            and an export.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            {!user ? (
              <>
                <Button
                  onClick={() => navigate("/register")}
                  className="text-base px-7 py-3"
                >
                  Get started free
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/login")}
                  className="text-base px-7 py-3"
                >
                  Log in
                </Button>
              </>
            ) : (
              <Button
                onClick={() => navigate("/dashboard")}
                className="text-base px-7 py-3"
              >
                Open dashboard
              </Button>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-14 animate-slide-in-right">
          <AuroraDemo />
        </div>
      </section>

      {/* Works with */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="eyebrow mb-2">works with</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-ink-50">
              Your databases and your spreadsheets
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {works.map((w) => (
              <Card key={w.name} hover>
                <h3 className="text-2xl font-semibold text-ink-50 mb-2">
                  {w.name}
                </h3>
                <p className="text-ink-300 text-sm leading-relaxed">{w.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="eyebrow mb-2">how it works</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-ink-50">
              Connect. Ask. Understand.
            </h2>
          </div>

          <ol className="space-y-4">
            {steps.map((s) => (
              <li
                key={s.n}
                className="surface rounded-2xl p-5 sm:p-6 flex gap-5 items-start"
              >
                <span className="text-5xl leading-none font-semibold text-gradient">
                  {s.n}
                </span>
                <div>
                  <h3 className="text-xl font-semibold text-ink-50 mb-1">
                    {s.title}
                  </h3>
                  <p className="text-ink-300 text-sm sm:text-base leading-relaxed">
                    {s.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="eyebrow mb-2">features</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-ink-50">
              Everything you need to talk to your data
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card key={f.title} hover>
                <div className="w-10 h-10 rounded-xl bg-white/8 border border-white/15 text-brand-300 flex items-center justify-center mb-4">
                  <Icon d={f.icon} />
                </div>
                <h3 className="text-lg font-semibold text-ink-50 mb-2">
                  {f.title}
                </h3>
                <p className="text-ink-300 text-sm leading-relaxed">{f.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Closing call to action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto surface rounded-3xl text-center px-6 py-14 relative overflow-hidden">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[34rem] h-48 bg-violet-300/20 blur-3xl rounded-full pointer-events-none" />
          <h2 className="relative text-3xl sm:text-4xl font-semibold text-ink-50">
            Ready to <span className="text-gradient">ask</span> your data?
          </h2>
          <p className="relative text-ink-300 mt-3 mb-8">
            Connect a source and ask your first question in under a minute.
          </p>
          <Button
            className="relative text-base px-8 py-3"
            onClick={() => navigate(user ? "/dashboard" : "/register")}
          >
            {user ? "Open dashboard" : "Get started"}
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;
