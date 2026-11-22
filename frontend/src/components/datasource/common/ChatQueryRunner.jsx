import { useState, useRef, useEffect, useCallback } from "react";
import { aiAPI, formatApiError } from "../../../utils/api";
import VisualizationPanel from "./VisualizationPanel";
import ExportActions from "./ExportActions";
import VoiceRecorder from "./VoiceRecorder";

function PaginatedTable({ results }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const totalPages = Math.ceil(results.length / itemsPerPage);

  const cols = Array.from(
    results.reduce((set, row) => {
      Object.keys(row ?? {}).forEach((k) => set.add(k));
      return set;
    }, new Set()),
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = results.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Reset to page 1 when results change
  useEffect(() => {
    setCurrentPage(1);
  }, [results]);

  return (
    <div className="border border-ink-700 rounded-lg mt-2">
      <div className="overflow-auto max-h-96 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-ink-800 [&::-webkit-scrollbar-thumb]:bg-ink-600 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-ink-500">
        <table className="min-w-full text-xs">
          <thead className="bg-ink-800 sticky top-0">
            <tr>
              {cols.map((c) => (
                <th
                  key={c}
                  className="text-left text-ink-300 font-semibold px-3 py-2 border-b border-ink-700"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.map((row, idx) => (
              <tr
                key={startIndex + idx}
                className="odd:bg-ink-900 even:bg-ink-950"
              >
                {cols.map((c) => (
                  <td
                    key={c}
                    className="text-ink-200 px-3 py-2 border-b border-ink-800 align-top"
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

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-4 py-3 bg-ink-800/50 border-t border-ink-700">
        <div className="text-xs text-ink-400">
          Showing {startIndex + 1} to {Math.min(endIndex, results.length)} of{" "}
          {results.length} rows
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm bg-ink-700 text-ink-300 rounded hover:bg-ink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            &lt;
          </button>
          <span className="text-xs text-ink-400">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm bg-ink-700 text-ink-300 rounded hover:bg-ink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}

function renderResults(results) {
  if (results == null) return null;

  if (Array.isArray(results)) {
    if (results.length === 0) {
      return <p className="text-ink-400 text-sm">No rows returned.</p>;
    }

    return <PaginatedTable results={results} />;
  }

  // object (pandas stats / etc)
  return (
    <pre className="text-ink-200 bg-ink-900 border border-ink-700 rounded-lg p-3 overflow-auto text-xs mt-2">
      {JSON.stringify(results, null, 2)}
    </pre>
  );
}

export default function ChatQueryRunner({
  datasourceId,
  placeholder,
  sessionId,
  onSessionChange,
  initialMessages,
}) {
  const [messages, setMessages] = useState(initialMessages || []);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [chartDataMap, setChartDataMap] = useState({});
  const currentSessionRef = useRef(sessionId || null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const inputRef = useRef(null);

  // Keep session ref in sync (does NOT reset messages)
  useEffect(() => {
    currentSessionRef.current = sessionId || null;
  }, [sessionId]);

  // Reset messages only when the parent explicitly provides new initialMessages
  const prevInitRef = useRef(initialMessages);
  useEffect(() => {
    if (prevInitRef.current !== initialMessages) {
      prevInitRef.current = initialMessages;
      setMessages(initialMessages || []);
    }
  }, [initialMessages]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Global keyboard event handler
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // If Enter is pressed and input is not focused, submit the form
      if (e.key === "Enter" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        if (inputValue.trim() && !loading) {
          handleSubmit(e);
        }
        return;
      }

      // If a printable character is pressed and input is not focused, focus the input
      if (
        e.key.length === 1 &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        document.activeElement !== inputRef.current &&
        document.activeElement.tagName !== "INPUT" &&
        document.activeElement.tagName !== "TEXTAREA" &&
        !document.activeElement.isContentEditable
      ) {
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [inputValue, loading]);

  // Fetch autocomplete suggestions
  const fetchSuggestions = async (text) => {
    if (!text || text.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      setLoadingSuggestions(true);
      const res = await aiAPI.autocomplete({
        partial_query: text,
        datasource_id: datasourceId,
        limit: 5,
      });

      if (res.data.success && res.data.suggestions) {
        setSuggestions(res.data.suggestions);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.error("Autocomplete error:", err);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Debounced input handler
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for autocomplete
    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300); // 300ms debounce
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    setSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userMessage = inputValue.trim();
    if (!userMessage || loading) return;

    // Clear suggestions and input
    setSuggestions([]);

    // Add user message immediately
    const newUserMessage = {
      id: Date.now(),
      type: "user",
      content: userMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");
    setLoading(true);

    // Add a temporary loading message
    const loadingMessage = {
      id: Date.now() + 1,
      type: "ai",
      content: "",
      loading: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      const payload = {
        query: userMessage,
        datasource_id: datasourceId,
      };
      // Include session_id so backend groups messages together
      if (currentSessionRef.current) {
        payload.session_id = currentSessionRef.current;
      }

      const res = await aiAPI.query(payload);

      // Capture the session_id returned by backend
      if (res.data.session_id) {
        currentSessionRef.current = res.data.session_id;
        onSessionChange?.(res.data.session_id);
      }

      // Remove loading message and add actual response
      setMessages((prev) => {
        const filtered = prev.filter((msg) => !msg.loading);
        return [
          ...filtered,
          {
            id: Date.now() + 2,
            type: "ai",
            content: userMessage,
            response: res.data,
            timestamp: new Date(),
          },
        ];
      });
    } catch (err) {
      const errorMsg =
        formatApiError(err.response?.data) || "Query failed. Please try again.";

      // Remove loading message and add error response
      setMessages((prev) => {
        const filtered = prev.filter((msg) => !msg.loading);
        return [
          ...filtered,
          {
            id: Date.now() + 2,
            type: "ai",
            error: errorMsg,
            timestamp: new Date(),
          },
        ];
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-3">
              <p className="text-5xl text-gradient leading-none font-semibold">
                &ldquo;&nbsp;&rdquo;
              </p>
              <h3 className="text-2xl font-semibold text-ink-100">
                Say something to your data
              </h3>
              <p className="text-ink-400 max-w-md">
                {placeholder ||
                  "Type or speak a question in plain language. TalkBase translates it and shows you the query it wrote."}
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`rounded-2xl px-4 py-3 ${
                  message.type === "user"
                    ? "max-w-[75%] btn-gradient text-ink-950 rounded-br-md"
                    : "w-full surface text-ink-100 rounded-bl-md"
                }`}
              >
                {message.loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-ink-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-ink-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-ink-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="text-sm text-ink-400 ">Translating…</span>
                  </div>
                ) : message.type === "user" ? (
                  <>
                    <p className="eyebrow text-ink-950/60 mb-1">
                      You · english
                    </p>
                    <p className="text-sm whitespace-pre-wrap break-words text-[15px]">
                      {message.content}
                    </p>
                  </>
                ) : message.error ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-red-400">⚠️</span>
                      <span className="text-red-400 font-semibold">Error</span>
                    </div>
                    <p className="text-sm text-red-300 break-words">
                      {message.error}
                    </p>
                  </div>
                ) : message.response ? (
                  <div className="space-y-3">
                    {/* Query Question */}
                    <div className="pb-2 border-b border-ink-700">
                      <p className="text-sm text-ink-300 break-words">
                        {message.content}
                      </p>
                    </div>

                    {/* Generated Query */}
                    <div>
                      <div className="flex items-center space-x-2 text-xs text-ink-400 mb-1">
                        <span className="eyebrow text-lang-300">TalkBase wrote</span>
                        {message.response.confidence && (
                          <span
                            title="LLM Validation Confidence"
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              message.response.confidence >= 0.9
                                ? "bg-green-900/30 text-green-400 border border-green-800"
                                : message.response.confidence >= 0.8
                                  ? "bg-brand-900/30 text-brand-400 border border-brand-800"
                                  : "bg-red-900/30 text-red-400 border border-red-800"
                            }`}
                          >
                            {(message.response.confidence * 100).toFixed(0)}% Confidence
                          </span>
                        )}
                      </div>
                      <pre className="code-block text-xs p-3 overflow-x-auto whitespace-pre-wrap break-words">
                        {message.response.generated_query}
                      </pre>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-3 text-xs text-ink-500">
                      <span className="flex items-center space-x-1">
                        <span>✓</span>
                        <span>
                          {message.response.success ? "Success" : "Failed"}
                        </span>
                      </span>
                      <span>LLM: {message.response.llm_used}</span>
                      {typeof message.response.row_count === "number" && (
                        <span>Rows: {message.response.row_count}</span>
                      )}
                      <span>Type: {message.response.datasource_type}</span>
                      {message.response.normal_form && (
                        <span>Normalization: {message.response.normal_form}</span>
                      )}
                    </div>

                    {/* Error if any */}
                    {message.response.error && (
                      <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-3 py-2 rounded-lg text-sm">
                        {message.response.error}
                      </div>
                    )}

                    {/* Results */}
                    {message.response.results && (
                      <div>
                        <p className="eyebrow mb-1">Answer</p>
                        {renderResults(message.response.results)}
                      </div>
                    )}

                    {/* Visualization Panel - After Results */}
                    {message.response.success && message.response.results && (
                      <VisualizationPanel
                        results={message.response.results}
                        queryContext={message.content}
                        onChartDataChange={(data) =>
                          setChartDataMap((prev) => ({ ...prev, [message.id]: data }))
                        }
                      />
                    )}

                    {/* Export / Email Actions */}
                    {message.response.success && message.response.results && (
                      <ExportActions
                        results={message.response.results}
                        columns={message.response.columns}
                        chartData={chartDataMap[message.id] || null}
                      />
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Fixed at Bottom */}
      <div className="border-t border-white/10 bg-ink-950/60 backdrop-blur px-4 py-4 flex-shrink-0">
        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="bg-ink-800 hover:bg-ink-700 text-ink-300 text-sm px-4 py-2 rounded-full border border-ink-700 transition-colors duration-150 hover:border-brand-600"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder={placeholder || "Say it your way, or use the mic…"}
            disabled={loading}
            className="flex-1 bg-white/5 border border-white/15 rounded-full px-5 py-3 text-ink-50 placeholder-ink-500 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <VoiceRecorder
            disabled={loading}
            onTranscript={(text) => {
              setInputValue((prev) => (prev ? prev + " " + text : text));
              inputRef.current?.focus();
            }}
          />
          <button
            type="submit"
            disabled={loading || !inputValue.trim()}
            className="btn-gradient hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed text-ink-950 rounded-full p-3 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:ring-offset-2 focus:ring-offset-ink-950"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
