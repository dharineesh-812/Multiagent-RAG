import React, { useState, useEffect } from "react";
import { searchRAG, getChunks } from "../rag/ragEngine";
import { renderMarkdown } from "../utils/markdown";

export default function KnowledgeExplorer() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initial load: show all chunks in the system
    const allChunks = getChunks();
    const formatted = allChunks.map(chunk => ({
      chunk,
      score: 1.0,
      type: "browse"
    }));
    setResults(formatted);
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const apiKey = localStorage.getItem("gemini_api_key");
      if (!query.trim()) {
        // Clear query -> browse all matching category
        const allChunks = getChunks();
        const filtered = allChunks
          .filter(c => category === "all" || c.category === category)
          .map(c => ({ chunk: c, score: 1.0, type: "browse" }));
        setResults(filtered);
      } else {
        const searchResults = await searchRAG(query.trim(), category, apiKey);
        setResults(searchResults);
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Run search when category filter changes
  useEffect(() => {
    handleSearch();
  }, [category]);

  const getCategoryBadgeColor = (cat) => {
    switch (cat) {
      case "dsa": return "rgba(76, 175, 80, 0.15)";
      case "company": return "rgba(3, 169, 244, 0.15)";
      case "cs_core": return "rgba(255, 193, 7, 0.15)";
      case "hr": return "rgba(244, 67, 54, 0.15)";
      case "aptitude": return "rgba(156, 39, 176, 0.15)";
      default: return "rgba(255, 255, 255, 0.05)";
    }
  };

  const getCategoryTextColor = (cat) => {
    switch (cat) {
      case "dsa": return "var(--color-dsa)";
      case "company": return "var(--color-company)";
      case "cs_core": return "var(--color-cscore)";
      case "hr": return "var(--color-hr)";
      case "aptitude": return "var(--color-resume)";
      default: return "var(--text-muted)";
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <div className="glass-card" style={{ marginBottom: "24px" }}>
        <h2 style={{ marginBottom: "8px" }}>📚 RAG Knowledge Base Explorer</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "20px" }}>
          Search and browse through placement preparation resources. When a Gemini API key is configured, searches utilize vector embeddings (`text-embedding-004`) for semantic matching.
        </p>

        {/* Search form */}
        <form onSubmit={handleSearch} className="rag-search-bar">
          <input
            type="text"
            className="text-input"
            placeholder="Search keywords (e.g. 'Amazon interview experience', 'normalization', 'STAR method')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ borderRadius: "24px", paddingLeft: "24px" }}
          />
          <button type="submit" className="btn btn-primary" style={{ borderRadius: "24px", minWidth: "120px" }} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {/* Category filters */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
          {["all", "dsa", "company", "cs_core", "hr", "aptitude"].map((cat) => (
            <button
              key={cat}
              type="button"
              className="btn btn-secondary"
              style={{
                padding: "6px 14px",
                fontSize: "0.8rem",
                borderRadius: "16px",
                background: category === cat ? "var(--text-primary)" : "var(--bg-surface-hover)",
                color: category === cat ? "var(--bg-main)" : "var(--text-primary)",
                borderColor: category === cat ? "var(--text-primary)" : "var(--border-color)"
              }}
              onClick={() => setCategory(cat)}
            >
              {cat === "all" ? "All Documents" : cat.toUpperCase().replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
          <div className="agent-typing" style={{ justifyContent: "center", marginBottom: "12px" }}>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
          Retrieving matching document chunks...
        </div>
      ) : results.length === 0 ? (
        <div className="glass-card" style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
          No documents found matching your search. Try adjusting terms or broadening filters.
        </div>
      ) : (
        <div className="rag-results">
          {results.map((res, index) => {
            const cat = res.chunk.category;
            return (
              <div 
                key={res.chunk.id} 
                className="glass-card rag-result-card"
                style={{ 
                  borderLeftColor: getCategoryTextColor(cat),
                  animationDelay: `${index * 0.05}s`
                }}
              >
                <div className="rag-result-header">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span 
                      className="badge" 
                      style={{ 
                        backgroundColor: getCategoryBadgeColor(cat),
                        color: getCategoryTextColor(cat),
                        border: `1px solid ${getCategoryTextColor(cat)}`
                      }}
                    >
                      {cat.replace("_", " ")}
                    </span>
                    <strong style={{ fontSize: "0.95rem" }}>
                      {res.chunk.parentTitle}
                    </strong>
                  </div>
                  
                  {res.type === "vector" && (
                    <span className="rag-score-tag">
                      ⚡ Semantic Vector Match ({Math.round(res.score * 100)}%)
                    </span>
                  )}
                  {res.type === "keyword" && (
                    <span className="rag-score-tag" style={{ color: "var(--color-resume)" }}>
                      🔍 Keyword Match ({Math.round(res.score * 100)}%)
                    </span>
                  )}
                  {res.type === "browse" && (
                    <span className="rag-score-tag" style={{ color: "var(--text-muted-dark)" }}>
                      🗂️ Document Library
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: "1.1rem", marginBottom: "12px", color: "var(--text-primary)" }}>
                  {res.chunk.title}
                </h3>

                <div 
                  className="rag-chunk-content markdown-content"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(res.chunk.content) }}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
