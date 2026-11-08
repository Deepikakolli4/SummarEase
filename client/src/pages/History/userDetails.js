import React, { useEffect, useState } from "react";
import apiClient from "../../utils/apiClient";
import { Link } from "react-router-dom";
import "./history.css";

const UserDetails = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [fromInput, setFromInput] = useState("");
  const [toInput, setToInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");
  const [typeInput, setTypeInput] = useState("");
  const [filters, setFilters] = useState({ from: "", to: "", language: "", type: "" });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    if (!localStorage.getItem("accessToken")) {
      setError("Sign in to view your history.");
      setLoading(false);
      return () => {
        active = false;
      };
    }

    apiClient.get("/user/history", {
      params: {
        page,
        limit: pagination.limit,
        ...(filters.from && { from: filters.from }),
        ...(filters.to && { to: filters.to }),
        ...(filters.language && { language: filters.language }),
        ...(filters.type && { type: filters.type }),
      },
    }).then((response) => {
      if (active) {
        setHistory(response.data.data || []);
        setPagination(response.data.pagination || { page, limit: 10, total: 0, totalPages: 0 });
      }
    }).catch((requestError) => {
      if (active) setError(requestError.response?.data?.message || "Could not load your history.");
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [filters, page, pagination.limit]);

  const applyFilters = (event) => {
    event.preventDefault();
    if (fromInput && toInput && fromInput > toInput) {
      setError("Start date must be on or before end date.");
      return;
    }
    setFilters({ from: fromInput, to: toInput, language: languageInput.trim(), type: typeInput });
    setPage(1);
  };

  const resetFilters = () => {
    setFromInput("");
    setToInput("");
    setLanguageInput("");
    setTypeInput("");
    setFilters({ from: "", to: "", language: "", type: "" });
    setPage(1);
    setError("");
  };

  const copySummary = async (item) => {
    try {
      await navigator.clipboard.writeText(item.summary);
      setFeedback("Summary copied.");
    } catch {
      setFeedback("Could not copy the summary. Check clipboard permissions.");
    }
  };

  const deleteSummary = async (item) => {
    if (!window.confirm("Delete this saved summary? This cannot be undone.")) return;

    setDeletingId(item._id);
    setFeedback("");
    try {
      await apiClient.delete(`/user/history/${item._id}`);
      setHistory((currentHistory) => currentHistory.filter((entry) => entry._id !== item._id));
      setPagination((currentPagination) => {
        const total = Math.max(0, currentPagination.total - 1);
        return { ...currentPagination, total, totalPages: Math.ceil(total / currentPagination.limit) };
      });
      if (history.length === 1 && page > 1) setPage((currentPage) => currentPage - 1);
      setFeedback("History entry deleted.");
    } catch (requestError) {
      setFeedback(requestError.response?.data?.message || "Could not delete the history entry.");
    } finally {
      setDeletingId("");
    }
  };

  const downloadSummary = (item) => {
    const markdown = `# Summary\n\nURL: ${item.url}\nLanguage: ${item.language}\nDate: ${new Date(item.createdAt).toLocaleString()}\n\n${item.summary}\n`;
    const file = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const fileUrl = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = `summary-${new Date(item.createdAt).toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(fileUrl);
  };

  return (
    <main className="history-page">
      <header className="history-hero">
        <p className="history-kicker">HISTORY</p>
        <h1>Your recent reads</h1>
        <p className="history-subtitle">Saved to your account.</p>
      </header>
      <div className="history-divider" />
      <form className="history-filters" onSubmit={applyFilters}>
        <div className="history-filter-field">
          <label htmlFor="history-from">From</label>
          <input id="history-from" type="date" value={fromInput} onChange={(event) => setFromInput(event.target.value)} />
        </div>
        <div className="history-filter-field">
          <label htmlFor="history-to">To</label>
          <input id="history-to" type="date" value={toInput} onChange={(event) => setToInput(event.target.value)} />
        </div>
        <div className="history-filter-field history-language-filter">
          <label htmlFor="history-language">Language</label>
          <input id="history-language" type="search" value={languageInput} onChange={(event) => setLanguageInput(event.target.value)} placeholder="Filter language" />
        </div>
        <div className="history-filter-field history-type-filter">
          <label htmlFor="history-type">Type</label>
          <select id="history-type" value={typeInput} onChange={(event) => setTypeInput(event.target.value)}>
            <option value="">All types</option>
            <option value="video">YouTube video</option>
            <option value="article">Blog / article</option>
          </select>
        </div>
        <div className="history-filter-actions">
          <button className="history-apply" type="submit">Apply filters</button>
          <button className="history-reset" type="button" onClick={resetFilters}>Reset</button>
        </div>
      </form>
      {error && !loading && <p className="history-filter-error" role="alert">{error}</p>}
      {loading ? (
        <section className="history-empty"><p>Loading your history...</p></section>
      ) : error && !history.length ? (
        <section className="history-empty">
          <p>{error}</p>
          {error === "Sign in to view your history." && <Link className="history-cta" to="/login">Sign in</Link>}
        </section>
      ) : history.length > 0 ? (
        <>
          {feedback && <p className="history-feedback" role="status">{feedback}</p>}
          <div className="history-table-wrap">
            <table className="history-table">
              <caption className="visually-hidden">Your saved video summaries</caption>
              <thead>
                <tr>
                  <th scope="col">URL</th>
                  <th scope="col">Date</th>
                  <th scope="col">Language</th>
                  <th scope="col">Type</th>
                  <th scope="col">Copy</th>
                  <th scope="col">Download</th>
                  <th scope="col">View</th>
                  <th scope="col">Delete</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item._id}>
                    <td className="history-url-cell">
                      <a href={item.url} target="_blank" rel="noreferrer" title={item.url}>{item.url}</a>
                    </td>
                    <td><time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleDateString()}</time></td>
                    <td>{item.language}</td>
                    <td>{item.sourceType === 'article' ? 'Blog / article' : 'YouTube video'}</td>
                    <td><button className="history-action" type="button" onClick={() => copySummary(item)}>Copy</button></td>
                    <td><button className="history-action" type="button" onClick={() => downloadSummary(item)}>Download</button></td>
                    <td><button className="history-action" type="button" onClick={() => setSelectedItem(item)}>View</button></td>
                    <td><button className="history-action history-delete-action" type="button" onClick={() => deleteSummary(item)} disabled={deletingId === item._id}>{deletingId === item._id ? "Deleting..." : "Delete"}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="history-pagination" aria-label="History pagination">
            <p>
              {pagination.total === 0 ? "No entries" : `Showing ${(page - 1) * pagination.limit + 1}-${Math.min(page * pagination.limit, pagination.total)} of ${pagination.total}`}
            </p>
            <div className="history-page-actions">
              <button className="history-action" type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1 || loading}>Previous</button>
              <span>Page {page} of {Math.max(1, pagination.totalPages)}</span>
              <button className="history-action" type="button" onClick={() => setPage((current) => current + 1)} disabled={page >= pagination.totalPages || loading}>Next</button>
            </div>
          </div>
        </>
      ) : (
        <section className="history-empty">
          <p>{filters.from || filters.to || filters.language ? "No summaries match these filters." : "Nothing here yet."}</p>
          {filters.from || filters.to || filters.language ? (
            <button className="history-cta" type="button" onClick={resetFilters}>Clear filters</button>
          ) : (
            <Link className="history-cta" to="/analyze">Analyze a link</Link>
          )}
        </section>
      )}

      {selectedItem && (
        <div className="history-modal-backdrop" onClick={(event) => {
          if (event.target === event.currentTarget) setSelectedItem(null);
        }}>
          <section className="history-modal" role="dialog" aria-modal="true" aria-labelledby="history-modal-title">
            <header className="history-modal-header">
              <div>
                <h2 id="history-modal-title">Summary</h2>
                <a href={selectedItem.url} target="_blank" rel="noreferrer">{selectedItem.url}</a>
                <p>{selectedItem.language} · {new Date(selectedItem.createdAt).toLocaleString()}</p>
              </div>
              <button className="history-action" type="button" onClick={() => setSelectedItem(null)}>Close</button>
            </header>
            <div className="history-modal-summary">{selectedItem.summary}</div>
            <footer className="history-modal-actions">
              <button className="history-action" type="button" onClick={() => copySummary(selectedItem)}>Copy summary</button>
              <button className="history-action" type="button" onClick={() => downloadSummary(selectedItem)}>Download</button>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
};

export default UserDetails;
