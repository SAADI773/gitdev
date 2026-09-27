import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const QUICK_REPOS = [
  "expressjs/express",
  "facebook/react",
  "tailwindlabs/tailwindcss",
  "vercel/next.js",
  "vuejs/core",
];

const ICONS = {
  search: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  spinner: (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="rgba(167,139,250,0.2)" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  strength: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M20 6L9 17l-5-5" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  mistake: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="#f43f5e" strokeWidth="2" />
      <path d="M12 8v5M12 16h.01" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  improvement: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"
        stroke="#f59e0b"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  star: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  external: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
    </svg>
  ),
  copy: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  check: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  shield: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  lightning: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  code: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  layers: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  fileText: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  github: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  ),
  trash: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  chart: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  eye: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  lock: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  gitBranch: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  ),
  arrowLeft: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  folder: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  warning: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
};

function ScoreGauge({ score, grade }) {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let color = "#10b981"; // Green
  if (score < 50) color = "#f43f5e"; // Rose
  else if (score < 68) color = "#f59e0b"; // Amber
  else if (score < 82) color = "#06b6d4"; // Cyan

  return (
    <div className="score-ring-container">
      <svg className="score-ring-svg" viewBox="0 0 76 76">
        <circle className="score-ring-bg" cx="38" cy="38" r={radius} strokeWidth="6" fill="transparent" />
        <circle
          className="score-ring-fill"
          cx="38"
          cy="38"
          r={radius}
          strokeWidth="6"
          stroke={color}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <div className="score-ring-text" style={{ color }}>
        {score}
      </div>
    </div>
  );
}

function Section({ title, icon, items, meta, renderExtra }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ marginBottom: 28 }}>
      <div className="section-header">
        {icon}
        <span>{title}</span>
        <span className="section-count">{items.length}</span>
      </div>
      {items.map((item, i) => {
        const githubFileUrl =
          item.file && item.file !== "general" && meta?.url
            ? `${meta.url}/blob/${meta.branch || "main"}/${item.file}`
            : null;

        return (
          <motion.div
            key={i}
            className="glass item-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <div className="item-top">
              <div>
                <div className="item-title">{item.title}</div>
                {githubFileUrl ? (
                  <a
                    href={githubFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="file-link"
                  >
                    <span>{item.file}</span>
                    {ICONS.external}
                  </a>
                ) : (
                  item.file && item.file !== "general" && (
                    <span className="file-link" style={{ color: "var(--text-muted)" }}>
                      {item.file}
                    </span>
                  )
                )}
              </div>
              {renderExtra && renderExtra(item)}
            </div>
            <div className="item-detail">{item.detail}</div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function App() {
  const [repoUrl, setRepoUrl] = useState("");
  const [forceRefresh, setForceRefresh] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [severityFilter, setSeverityFilter] = useState("all");
  const [toastMessage, setToastMessage] = useState("");
  const [searchHistoryQuery, setSearchHistoryQuery] = useState("");

  // Mode routing: "public" vs "admin"
  const [viewMode, setViewMode] = useState(() => {
    return window.location.hash === "#admin" || window.location.pathname === "/admin"
      ? "admin"
      : "public";
  });

  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState(false);

  useEffect(() => {
    function handleHashChange() {
      if (window.location.hash === "#admin" || window.location.pathname === "/admin") {
        setViewMode("admin");
      }
    }
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Track visit count
  const [visitCount, setVisitCount] = useState(1);
  useEffect(() => {
    try {
      const savedCount = parseInt(localStorage.getItem("gitdev_visit_count") || "0", 10) + 1;
      localStorage.setItem("gitdev_visit_count", savedCount.toString());
      setVisitCount(savedCount);
    } catch {
      // Fallback
    }
  }, []);

  // Track audit history
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("gitdev_audit_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  function saveAuditToHistory(auditData) {
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.meta.name !== auditData.meta.name);
      const updated = [
        {
          ...auditData,
          evaluatedAtFormatted: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
        ...filtered,
      ];
      try {
        localStorage.setItem("gitdev_audit_history", JSON.stringify(updated));
      } catch {
        // Fallback
      }
      return updated;
    });
  }

  function handleDeleteHistoryItem(repoName) {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.meta.name !== repoName);
      localStorage.setItem("gitdev_audit_history", JSON.stringify(updated));
      return updated;
    });
    showToast("Audit log entry removed.");
  }

  function handleClearAllHistory() {
    if (window.confirm("Are you sure you want to clear your entire audit history?")) {
      setHistory([]);
      localStorage.removeItem("gitdev_audit_history");
      showToast("Audit history cleared.");
    }
  }

  function handleInspectHistoryItem(auditData) {
    setResult(auditData);
    setRepoUrl(`https://github.com/${auditData.meta.name}`);
    setViewMode("public");
    setTimeout(() => {
      document.getElementById("results-dashboard")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  function handleAdminUnlock(e) {
    e.preventDefault();
    if (passcode.trim() === "7730" || passcode.trim() === "admin123" || passcode.trim() === "admin") {
      setAdminUnlocked(true);
      setPasscodeError(false);
      showToast("Admin Command Center Unlocked");
    } else {
      setPasscodeError(true);
    }
  }

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  }

  async function handleEvaluate(urlToFetch = repoUrl, bypassCache = forceRefresh) {
    const targetUrl = urlToFetch.trim();
    if (!targetUrl) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: targetUrl, forceRefresh: bypassCache }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Evaluation failed.");
      setResult(data);
      saveAuditToHistory(data);

      setTimeout(() => {
        document.getElementById("results-dashboard")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleQuickPick(repo) {
    const fullUrl = `https://github.com/${repo}`;
    setRepoUrl(fullUrl);
    handleEvaluate(fullUrl);
  }

  function handleCopyMarkdown() {
    if (!result) return;
    const md = `# GitDev Audit: ${result.meta.name}
**Overall Score:** ${result.overallScore}/100 (Grade: ${result.grade || "N/A"})
**Security Rating:** ${result.securityRating || "N/A"} | **Maintainability:** ${result.maintainabilityRating || "N/A"}

## Summary
${result.summary}

### Tech Stack
${(result.techStack || []).join(", ")}

### Strengths
${(result.strengths || []).map((s) => `- **${s.title}**: ${s.detail}`).join("\n")}

### Mistakes
${(result.mistakes || []).map((m) => `- **[${(m.severity || "info").toUpperCase()}] ${m.title}** (${m.file}): ${m.detail}`).join("\n")}

### Improvements
${(result.improvements || []).map((i) => `- **${i.title}**: ${i.detail}`).join("\n")}
`;
    navigator.clipboard.writeText(md);
    showToast("Markdown review copied to clipboard.");
  }

  function handleDownloadJson() {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gitdev-review-${result.meta.name.replace("/", "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Review JSON downloaded.");
  }

  const filteredMistakes = (result?.mistakes || []).filter((m) => {
    if (severityFilter === "all") return true;
    return (m.severity || "").toLowerCase() === severityFilter;
  });

  // Calculate admin analytics
  const totalAudits = history.length;
  const avgScore =
    totalAudits > 0
      ? Math.round(history.reduce((sum, h) => sum + (h.overallScore || 0), 0) / totalAudits)
      : 0;

  const languageCounts = {};
  history.forEach((h) => {
    if (h.meta?.language) {
      languageCounts[h.meta.language] = (languageCounts[h.meta.language] || 0) + 1;
    }
  });
  const topLanguage =
    Object.keys(languageCounts).length > 0
      ? Object.entries(languageCounts).sort((a, b) => b[1] - a[1])[0][0]
      : "N/A";

  const filteredHistory = history.filter((h) => {
    if (!searchHistoryQuery.trim()) return true;
    const q = searchHistoryQuery.toLowerCase();
    return (
      h.meta.name.toLowerCase().includes(q) ||
      (h.meta.language && h.meta.language.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      {toastMessage && <div className="toast">{toastMessage}</div>}

      {/* Main Public Interface */}
      {viewMode === "public" ? (
        <div>
          {/* Header Navigation */}
          <nav className="navbar">
            <div className="nav-container">
              <a href="#" className="nav-brand">
                <img src="/logo.png" alt="GitDev Logo" className="brand-logo-img" />
                <span className="brand-title">GitDev</span>
              </a>

              <div className="nav-links">
                <a href="#auditor" className="nav-link">
                  Auditor
                </a>
                <a href="#features" className="nav-link">
                  Features
                </a>
                <a href="#how-it-works" className="nav-link">
                  How It Works
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="nav-btn"
                >
                  {ICONS.github}
                  <span>GitHub</span>
                </a>
              </div>
            </div>
          </nav>

          <main className="container">
            {/* Hero Section */}
            <section className="hero-section" id="auditor">
              <div className="brand-badge">
                {ICONS.lightning}
                <span>Powered by Gemini 2.0 Flash & GitHub API</span>
              </div>
              <h1 className="hero-title">Automated AI Code Audits for Any GitHub Repository</h1>
              <p className="hero-subtitle">
                Instantly evaluate codebase architecture, detect security vulnerabilities, highlight
                code smells, and uncover high-impact quick wins.
              </p>

              {/* Search Bar Console */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleEvaluate();
                }}
                className="search-form"
              >
                <div className="glass search-bar">
                  <span className="search-icon">{ICONS.search}</span>
                  <input
                    type="text"
                    className="search-input"
                    placeholder="https://github.com/owner/repo"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                  />
                  <button className="btn-primary" type="submit" disabled={loading}>
                    {loading ? (
                      <motion.div
                        className="spinner"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
                        style={{ width: 18, height: 18, margin: 0 }}
                      >
                        {ICONS.spinner}
                      </motion.div>
                    ) : (
                      ICONS.search
                    )}
                    <span>{loading ? "Auditing..." : "Audit Repository"}</span>
                  </button>
                </div>

                <div className="search-options">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={forceRefresh}
                      onChange={(e) => setForceRefresh(e.target.checked)}
                    />
                    <span>Bypass cached review</span>
                  </label>
                </div>

                <div className="quick-picks">
                  <span className="quick-picks-label">Quick test repos:</span>
                  {QUICK_REPOS.map((r) => (
                    <button key={r} type="button" className="chip-btn" onClick={() => handleQuickPick(r)}>
                      {r}
                    </button>
                  ))}
                </div>
              </form>

              {error && (
                <div className="error-box">
                  {ICONS.warning}
                  <span>{error}</span>
                </div>
              )}

              <AnimatePresence>
                {loading && (
                  <motion.div
                    className="glass loading-box"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <motion.div
                      className="spinner"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
                    >
                      {ICONS.spinner}
                    </motion.div>
                    <div className="loading-text">Performing Repository Audit</div>
                    <div className="loading-subtext">
                      Fetching file tree, extracting key source files, and running Gemini AI evaluation...
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* Results Dashboard */}
            {result && (
              <section id="results-dashboard" style={{ paddingTop: 30, marginBottom: 60 }}>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                  {/* Header Card */}
                  <div className="glass repo-header-card">
                    <div className="repo-info">
                      <h2>
                        <a
                          href={result.meta.url}
                          target="_blank"
                          rel="noreferrer"
                          className="repo-link"
                        >
                          {result.meta.name}
                          {ICONS.external}
                        </a>
                      </h2>
                      <p className="repo-desc">
                        {result.meta.description || "No repository description provided."}
                      </p>
                      <div className="repo-badges">
                        {result.meta.language && (
                          <span className="badge">
                            {ICONS.code} {result.meta.language}
                          </span>
                        )}
                        {result.meta.stars !== undefined && (
                          <span className="badge">
                            {ICONS.star} {result.meta.stars.toLocaleString()} stars
                          </span>
                        )}
                        {result.meta.branch && (
                          <span className="badge">
                            {ICONS.gitBranch} {result.meta.branch}
                          </span>
                        )}
                        {result.isCached && (
                          <span className="badge badge-cached">
                            {ICONS.lightning} Cached Evaluation
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 3-Metrics Grid */}
                  <div className="metrics-grid">
                    <div className="glass metric-card">
                      <ScoreGauge score={result.overallScore} grade={result.grade} />
                      <div className="metric-meta">
                        <h3>Overall Quality</h3>
                        <div className="metric-grade">
                          Score {result.overallScore}{" "}
                          <span className={`grade-${(result.grade || "B")[0]}`}>
                            ({result.grade || "B"})
                          </span>
                        </div>
                        <div className="metric-sub">Architectural & code health score</div>
                      </div>
                    </div>

                    <div className="glass metric-card">
                      <div
                        className={`metric-grade grade-${result.securityRating || "A"}`}
                        style={{ fontSize: "2.4rem", width: 64, textAlign: "center" }}
                      >
                        {result.securityRating || "A"}
                      </div>
                      <div className="metric-meta">
                        <h3>Security Posture</h3>
                        <div className="metric-grade">Rating {result.securityRating || "A"}</div>
                        <div className="metric-sub">Vulnerability & hygiene status</div>
                      </div>
                    </div>

                    <div className="glass metric-card">
                      <div
                        className={`metric-grade grade-${result.maintainabilityRating || "A"}`}
                        style={{ fontSize: "2.4rem", width: 64, textAlign: "center" }}
                      >
                        {result.maintainabilityRating || "A"}
                      </div>
                      <div className="metric-meta">
                        <h3>Maintainability</h3>
                        <div className="metric-grade">
                          Rating {result.maintainabilityRating || "A"}
                        </div>
                        <div className="metric-sub">Readability & structure grade</div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="glass summary-card">
                    <div className="card-title">
                      {ICONS.fileText} Executive Summary
                    </div>
                    <div className="summary-text">{result.summary}</div>

                    {result.architectureOverview && (
                      <div className="arch-box">
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {ICONS.layers}
                          <span>
                            <strong>Architecture Pattern:</strong> {result.architectureOverview}
                          </span>
                        </div>
                      </div>
                    )}

                    {result.techStack?.length > 0 && (
                      <div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--text-muted)",
                            marginBottom: 8,
                            fontWeight: 600,
                          }}
                        >
                          DETECTED TECH STACK
                        </div>
                        <div className="tech-tags">
                          {result.techStack.map((tech, i) => (
                            <span className="tech-tag" key={i}>
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick Wins Card */}
                  {result.quickWins?.length > 0 && (
                    <div className="glass quick-wins-card">
                      <div className="card-title" style={{ color: "var(--accent-emerald)" }}>
                        {ICONS.lightning} High Impact Quick Wins
                      </div>
                      <ul className="quick-win-list">
                        {result.quickWins.map((win, i) => (
                          <li key={i} className="quick-win-item">
                            <span className="quick-win-icon">{ICONS.check}</span>
                            <span>{win}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Filter Bar & Export Actions */}
                  <div className="filter-action-bar">
                    <div className="filter-chips">
                      <button
                        className={`filter-chip ${severityFilter === "all" ? "active" : ""}`}
                        onClick={() => setSeverityFilter("all")}
                      >
                        All Concerns ({(result.mistakes || []).length})
                      </button>
                      <button
                        className={`filter-chip ${severityFilter === "high" ? "active" : ""}`}
                        onClick={() => setSeverityFilter("high")}
                      >
                        High Severity
                      </button>
                      <button
                        className={`filter-chip ${severityFilter === "medium" ? "active" : ""}`}
                        onClick={() => setSeverityFilter("medium")}
                      >
                        Medium
                      </button>
                      <button
                        className={`filter-chip ${severityFilter === "low" ? "active" : ""}`}
                        onClick={() => setSeverityFilter("low")}
                      >
                        Low
                      </button>
                    </div>

                    <div className="export-btns">
                      <button className="btn-secondary" onClick={handleCopyMarkdown}>
                        {ICONS.copy}
                        <span>Copy Markdown</span>
                      </button>
                      <button className="btn-secondary" onClick={handleDownloadJson}>
                        {ICONS.fileText}
                        <span>Export JSON</span>
                      </button>
                    </div>
                  </div>

                  {/* Strengths */}
                  <Section
                    title="Exemplary Strengths"
                    icon={ICONS.strength}
                    items={result.strengths}
                    meta={result.meta}
                  />

                  {/* Mistakes */}
                  <Section
                    title="Mistakes & Code Smells"
                    icon={ICONS.mistake}
                    items={filteredMistakes}
                    meta={result.meta}
                    renderExtra={(item) =>
                      item.severity && (
                        <span className={`severity-pill ${item.severity}`}>
                          {item.severity}
                        </span>
                      )
                    }
                  />

                  {/* Improvements */}
                  <Section
                    title="Actionable Improvements"
                    icon={ICONS.improvement}
                    items={result.improvements}
                    meta={result.meta}
                  />

                  {/* Files Sampled */}
                  {result.filesReviewed?.length > 0 && (
                    <div className="glass files-card">
                      <div className="card-title">
                        {ICONS.folder} Sampled Files ({result.filesReviewed.length})
                      </div>
                      <div className="files-grid">
                        {result.filesReviewed.map((f, i) => (
                          <div key={i} className="file-badge">
                            <span>{f.path}</span>
                            <span className="file-size">{(f.size / 1024).toFixed(1)} KB</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </section>
            )}

            {/* Feature Showcase Grid */}
            <section className="features-section" id="features">
              <div className="section-head">
                <div className="section-tag">ENGINEERED FOR DEVELOPERS</div>
                <h2 className="section-title-text">Why Developers Love GitDev</h2>
              </div>

              <div className="features-grid">
                <div className="glass feature-card">
                  <div className="feature-icon-box">{ICONS.lightning}</div>
                  <h3>Parallel Context Batching</h3>
                  <p>
                    Pulls key source files, configs, and documentation concurrently over GitHub's raw API
                    in milliseconds.
                  </p>
                </div>

                <div className="glass feature-card">
                  <div className="feature-icon-box">{ICONS.shield}</div>
                  <h3>Security & Vulnerability Ratings</h3>
                  <p>
                    Identifies hardcoded secrets, unhandled errors, missing rate limiters, and insecure
                    input handling.
                  </p>
                </div>

                <div className="glass feature-card">
                  <div className="feature-icon-box">{ICONS.layers}</div>
                  <h3>Monorepo & Subfolder Auditing</h3>
                  <p>
                    Seamlessly target specific packages or subfolders in large monorepo codebases.
                  </p>
                </div>

                <div className="glass feature-card">
                  <div className="feature-icon-box">{ICONS.code}</div>
                  <h3>Clickable Code Citations</h3>
                  <p>
                    Every flagged mistake and improvement links directly to the target source file path on GitHub.
                  </p>
                </div>

                <div className="glass feature-card">
                  <div className="feature-icon-box">{ICONS.fileText}</div>
                  <h3>Markdown & JSON Export</h3>
                  <p>
                    Export structured review summaries straight into pull request comments, issue trackers, or Slack.
                  </p>
                </div>

                <div className="glass feature-card">
                  <div className="feature-icon-box">{ICONS.star}</div>
                  <h3>Instant In-Memory Caching</h3>
                  <p>
                    Repeated requests hit high-speed TTL caches for instant results without wasting API tokens.
                  </p>
                </div>
              </div>
            </section>

            {/* How It Works Steps */}
            <section className="steps-section" id="how-it-works">
              <div className="section-head">
                <div className="section-tag">AUTOMATED WORKFLOW</div>
                <h2 className="section-title-text">How GitDev Audits Code</h2>
              </div>

              <div className="steps-grid">
                <div className="glass step-card">
                  <div className="step-number">01</div>
                  <h4>Paste Repository Link</h4>
                  <p>Provide any public GitHub repository or subfolder URL to initiate the audit.</p>
                </div>

                <div className="glass step-card">
                  <div className="step-number">02</div>
                  <h4>Context Sampling</h4>
                  <p>GitDev selects high-priority architecture files, configs, and source code modules.</p>
                </div>

                <div className="glass step-card">
                  <div className="step-number">03</div>
                  <h4>Gemini AI Evaluation</h4>
                  <p>Gemini 2.0 Flash analyzes code quality and generates actionable grades and quick wins.</p>
                </div>
              </div>
            </section>
          </main>

          {/* Footer */}
          <footer className="footer">
            <div className="footer-container">
              <div className="footer-brand">
                <img src="/logo.png" alt="GitDev Logo" />
                <span>GitDev — AI Repository Auditor</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span>Powered by Google Gemini 2.0 Flash & GitHub API</span>
                <span
                  className="footer-admin-link"
                  onClick={() => setViewMode("admin")}
                >
                  {ICONS.lock} Admin Portal
                </span>
              </div>
            </div>
          </footer>
        </div>
      ) : (
        /* Dedicated Admin Portal View */
        <div className="container admin-portal">
          <div className="glass admin-top-bar">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img src="/logo.png" alt="GitDev" style={{ width: 32, height: 32, borderRadius: 8 }} />
              <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>GitDev Command Center</div>
              <span className="admin-status-pill">
                <span className="status-dot"></span>
                SYSTEM ONLINE
              </span>
            </div>

            <button
              className="btn-secondary"
              onClick={() => setViewMode("public")}
            >
              {ICONS.arrowLeft}
              <span>Return to Public Website</span>
            </button>
          </div>

          {!adminUnlocked ? (
            /* Passcode Lock Screen */
            <div className="glass admin-lock-card">
              <div className="admin-lock-icon">{ICONS.lock}</div>
              <h2>Admin Authentication Required</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: 6 }}>
                Enter your security PIN/Passcode to unlock system analytics and repo logs.
              </p>

              <form onSubmit={handleAdminUnlock}>
                <input
                  type="password"
                  className="admin-pass-input"
                  placeholder="••••"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  autoFocus
                />
                {passcodeError && (
                  <div style={{ color: "var(--accent-rose)", fontSize: "0.82rem", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    {ICONS.warning}
                    <span>Invalid Security Passcode (Try PIN: 7730)</span>
                  </div>
                )}
                <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                  Unlock Admin Dashboard
                </button>
              </form>
            </div>
          ) : (
            /* Unlocked Admin Analytics & History Dashboard */
            <div>
              {/* 4 Stats Grid */}
              <div className="stats-grid">
                <div className="glass stat-card">
                  <div className="stat-icon">{ICONS.eye}</div>
                  <div>
                    <div className="stat-value">{visitCount}</div>
                    <div className="stat-label">Total Site Visits</div>
                  </div>
                </div>

                <div className="glass stat-card">
                  <div className="stat-icon">{ICONS.chart}</div>
                  <div>
                    <div className="stat-value">{totalAudits}</div>
                    <div className="stat-label">Repos Evaluated</div>
                  </div>
                </div>

                <div className="glass stat-card">
                  <div className="stat-icon">{ICONS.star}</div>
                  <div>
                    <div className="stat-value">{avgScore} / 100</div>
                    <div className="stat-label">Global Avg Score</div>
                  </div>
                </div>

                <div className="glass stat-card">
                  <div className="stat-icon">{ICONS.code}</div>
                  <div>
                    <div className="stat-value" style={{ fontSize: "1.4rem" }}>
                      {topLanguage}
                    </div>
                    <div className="stat-label">Top Language</div>
                  </div>
                </div>
              </div>

              {/* History Log Table Card */}
              <div className="glass history-card-container">
                <div className="history-header">
                  <div className="history-title-group">
                    <h3>Evaluated Repositories Log</h3>
                    <p>Tracked user activity and repository audit reports</p>
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <div className="history-search">
                      {ICONS.search}
                      <input
                        type="text"
                        placeholder="Search logs by repo or language..."
                        value={searchHistoryQuery}
                        onChange={(e) => setSearchHistoryQuery(e.target.value)}
                      />
                    </div>

                    {history.length > 0 && (
                      <button className="btn-secondary" onClick={handleClearAllHistory}>
                        {ICONS.trash}
                        <span>Clear All Logs</span>
                      </button>
                    )}
                  </div>
                </div>

                {filteredHistory.length === 0 ? (
                  <div className="empty-history">
                    {searchHistoryQuery
                      ? "No audit records match your search."
                      : "No audit logs recorded yet."}
                  </div>
                ) : (
                  <div className="history-list">
                    {filteredHistory.map((item, index) => (
                      <div key={index} className="history-item">
                        <div className="history-item-left">
                          <div
                            className="history-grade-pill"
                            style={{
                              color:
                                item.overallScore >= 80
                                  ? "#10b981"
                                  : item.overallScore >= 68
                                  ? "#06b6d4"
                                  : item.overallScore >= 50
                                  ? "#f59e0b"
                                  : "#f43f5e",
                            }}
                          >
                            {item.grade || "B"}
                          </div>
                          <div>
                            <div className="history-repo-name">{item.meta.name}</div>
                            <div className="history-repo-meta">
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                                {ICONS.star} {item.meta.stars || 0} stars
                              </span>
                              <span>•</span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                                {ICONS.code} {item.meta.language || "Unknown"}
                              </span>
                              <span>•</span>
                              <span>Score: {item.overallScore}/100</span>
                              <span>•</span>
                              <span>{item.evaluatedAtFormatted || "Recently"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="history-item-right">
                          <button
                            className="btn-secondary"
                            onClick={() => handleInspectHistoryItem(item)}
                          >
                            Inspect Audit
                          </button>
                          <button
                            className="btn-icon-danger"
                            title="Delete log entry"
                            onClick={() => handleDeleteHistoryItem(item.meta.name)}
                          >
                            {ICONS.trash}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
