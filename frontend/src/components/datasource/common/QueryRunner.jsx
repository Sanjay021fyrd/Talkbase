import { useState } from "react";
import Button from "../../Button";
import Input from "../../Input";
import { aiAPI, formatApiError } from "../../../utils/api";

function renderResults(results) {
  if (results == null) return null;

  if (Array.isArray(results)) {
    if (results.length === 0) {
      return <p className="text-ink-400">No rows returned.</p>;
    }

    const cols = Array.from(
      results.reduce((set, row) => {
        Object.keys(row ?? {}).forEach((k) => set.add(k));
        return set;
      }, new Set()),
    );

    return (
      <div className="overflow-auto border border-ink-800 rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-ink-900">
            <tr>
              {cols.map((c) => (
                <th
                  key={c}
                  className="text-left text-ink-300 font-semibold px-4 py-3 border-b border-ink-800"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((row, idx) => (
              <tr key={idx} className="odd:bg-ink-950 even:bg-ink-950">
                {cols.map((c) => (
                  <td
                    key={c}
                    className="text-ink-200 px-4 py-3 border-b border-ink-900 align-top"
                  >
                    {typeof row?.[c] === "object"
                      ? JSON.stringify(row?.[c])
                      : String(row?.[c] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // object (pandas stats / etc)
  return (
    <pre className="text-ink-200 bg-ink-950 border border-ink-800 rounded-lg p-4 overflow-auto">
      {JSON.stringify(results, null, 2)}
    </pre>
  );
}

export default function QueryRunner({ datasourceId, placeholder, title }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [response, setResponse] = useState(null);

  const runQuery = async (e) => {
    e?.preventDefault?.();
    setApiError("");
    setResponse(null);

    if (!datasourceId) {
      setApiError("Missing datasource. Please go back and connect again.");
      return;
    }
    if (!query.trim()) {
      setApiError("Please enter a query.");
      return;
    }

    setLoading(true);
    try {
      const res = await aiAPI.query({
        query: query.trim(),
        datasource_id: datasourceId,
      });
      setResponse(res.data);
    } catch (err) {
      const msg =
        formatApiError(err.response?.data) || "Query failed. Please try again.";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-ink-50 mb-2">{title}</h2>
      <p className="text-ink-400 mb-4">
        Datasource ID: <span className="text-ink-200">{datasourceId}</span>
      </p>

      <form onSubmit={runQuery} className="space-y-4">
        {apiError && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
            {apiError}
          </div>
        )}

        <Input
          label="Ask a question"
          name="naturalQuery"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          disabled={loading}
          required
        />

        <Button type="submit" disabled={loading}>
          {loading ? "Running..." : "Run Query"}
        </Button>
      </form>

      {response && (
        <div className="mt-6 space-y-4">
          <div className="border border-ink-800 rounded-lg p-4 bg-ink-950">
            <p className="text-ink-400 text-sm">Generated query</p>
            <pre className="text-ink-200 overflow-auto">
              {response.generated_query}
            </pre>
            <div className="mt-2 text-ink-500 text-sm flex gap-4 flex-wrap">
              <span>Status: {response.success ? "success" : "failed"}</span>
              <span>LLM: {response.llm_used}</span>
              {typeof response.row_count === "number" && (
                <span>Rows: {response.row_count}</span>
              )}
              <span>Type: {response.datasource_type}</span>
            </div>
            {response.error && (
              <div className="mt-3 bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
                {response.error}
              </div>
            )}
          </div>

          {renderResults(response.results)}
        </div>
      )}
    </div>
  );
}
