// src/pages/UserWallet.jsx
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchWallet, fetchWalletTransactions } from "../api/user/walletApi";
import "../styles/UserWallet.css";

/* ── Inline SVG icons (no external deps) ── */
const IcoWallet = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
    <circle cx="17" cy="15" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);
const IcoArrowDown = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <polyline points="19 12 12 19 5 12" />
  </svg>
);
const IcoArrowUp = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);
const IcoSearch = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IcoList = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);
const IcoGrid = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);
const IcoEmpty = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
    <path d="M8 15h4M15 15h1" strokeDasharray="2 1" />
  </svg>
);

/* ── format date helper ── */
function fmtDate(str) {
  return new Date(str).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ============================================================
   MAIN COMPONENT — ALL ORIGINAL LOGIC PRESERVED
   ============================================================ */
const UserWallet = () => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("list");

  /* ── LOAD DATA — original logic ── */
  useEffect(() => {
    Promise.all([fetchWallet(), fetchWalletTransactions()])
      .then(([walletRes, txRes]) => {
        setWallet(walletRes.data);
        setTransactions(txRes.data);
      })
      .catch((e) => {
        toast.error(
          e?.response?.data?.message ||
            "Failed to load wallet. Please try again.",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  /* ── FILTER — original logic ── */
  const filtered = transactions.filter((tx) => {
    const matchesFilter = filter === "ALL" || tx.type === filter;
    const query = search.toLowerCase();
    const matchesSearch =
      !query ||
      tx.description?.toLowerCase().includes(query) ||
      tx.reference?.toLowerCase().includes(query) ||
      String(tx.amount).includes(query);
    return matchesFilter && matchesSearch;
  });

  /* ── TOTALS — original logic ── */
  const totalCredit = transactions
    .filter((t) => t.type === "CREDIT")
    .reduce((s, t) => s + t.amount, 0);
  const totalDebit = transactions
    .filter((t) => t.type === "DEBIT")
    .reduce((s, t) => s + t.amount, 0);

  /* ── LOADING ── */
  if (loading) {
    return (
      <div className="uwt__loading">
        <div className="uwt__spinner" />
        <p>Loading your wallet…</p>
      </div>
    );
  }

  /* ── RENDER ── */
  return (
    <div className="uwt__page">
      <div className="uwt__inner">
        {/* ════════════ HERO HEADER ════════════ */}
        <div className="uwt__header">
          <div className="uwt__header-inner">
            <div className="uwt__header-icon">
              <IcoWallet />
            </div>
            <div>
              <h2 className="uwt__header-title">My Wallet</h2>
              <p className="uwt__header-sub">
                Manage your balance &amp; transactions
              </p>
            </div>
          </div>
        </div>

        {/* ════════════ SUMMARY GRID ════════════ */}
        <div className="uwt__summary">
          {/* Balance card */}
          <div className="uwt__balance-card">
            <p className="uwt__balance-lbl">Available Balance</p>
            <h1 className="uwt__balance-amt">
              ₹{(wallet?.balance || 0).toLocaleString("en-IN")}
            </h1>
            <span className="uwt__balance-badge">
              <span className="uwt__balance-dot" /> Active
            </span>
          </div>

          {/* Credit stat */}
          <div className="uwt__stat-card uwt__stat-card--credit">
            <div className="uwt__stat-ico">
              <IcoArrowDown />
            </div>
            <div className="uwt__stat-info">
              <span className="uwt__stat-lbl">Total Received</span>
              <span className="uwt__stat-val">
                +₹{totalCredit.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Debit stat */}
          <div className="uwt__stat-card uwt__stat-card--debit">
            <div className="uwt__stat-ico">
              <IcoArrowUp />
            </div>
            <div className="uwt__stat-info">
              <span className="uwt__stat-lbl">Total Spent</span>
              <span className="uwt__stat-val">
                −₹{totalDebit.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* ════════════ TRANSACTIONS PANEL ════════════ */}
        <div className="uwt__panel">
          {/* toolbar */}
          <div className="uwt__toolbar">
            <span className="uwt__panel-title">Transaction History</span>

            <div className="uwt__toolbar-right">
              {/* search */}
              <div className="uwt__search-wrap">
                <span className="uwt__search-ico">
                  <IcoSearch />
                </span>
                <input
                  className="uwt__search-input"
                  type="text"
                  placeholder="Search transactions…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* filter pills */}
              <div className="uwt__filter-pills">
                {[
                  { key: "ALL", label: "All" },
                  { key: "CREDIT", label: "Received" },
                  { key: "DEBIT", label: "Spent" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    className={[
                      "uwt__pill",
                      filter === key ? "uwt__pill--on" : "",
                      key === "CREDIT" ? "uwt__pill--credit" : "",
                      key === "DEBIT" ? "uwt__pill--debit" : "",
                    ].join(" ")}
                    onClick={() => setFilter(key)}>
                    {label}
                  </button>
                ))}
              </div>

              {/* view toggle */}
              <div className="uwt__view-toggle">
                <button
                  className={`uwt__view-btn ${viewMode === "list" ? "uwt__view-btn--on" : ""}`}
                  onClick={() => setViewMode("list")}
                  title="List view">
                  <IcoList />
                </button>
                <button
                  className={`uwt__view-btn ${viewMode === "grid" ? "uwt__view-btn--on" : ""}`}
                  onClick={() => setViewMode("grid")}
                  title="Grid view">
                  <IcoGrid />
                </button>
              </div>
            </div>
          </div>

          {/* result count */}
          {filtered.length > 0 && (
            <p className="uwt__count">
              {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
            </p>
          )}

          {/* ── EMPTY STATE ── */}
          {filtered.length === 0 ? (
            <div className="uwt__empty">
              <div className="uwt__empty-ico">
                <IcoEmpty />
              </div>
              <h4>No transactions found</h4>
              <p>
                {search || filter !== "ALL"
                  ? "Try adjusting your search or filter."
                  : "Your transaction history will appear here once you make or receive a payment."}
              </p>
              {(search || filter !== "ALL") && (
                <button
                  className="uwt__empty-reset"
                  onClick={() => {
                    setSearch("");
                    setFilter("ALL");
                  }}>
                  Clear filters
                </button>
              )}
            </div>
          ) : viewMode === "list" ? (
            /* ── LIST VIEW ── */
            <div className="uwt__list">
              {filtered.map((tx) => (
                <div className="uwt__row" key={tx.transactionRef}>
                  <div
                    className={`uwt__row-badge uwt__row-badge--${tx.type === "CREDIT" ? "credit" : "debit"}`}>
                    {tx.type === "CREDIT" ? <IcoArrowDown /> : <IcoArrowUp />}
                  </div>

                  <div className="uwt__row-info">
                    <p className="uwt__row-title">
                      {tx.type === "CREDIT"
                        ? "Refund Received"
                        : "Payment Made"}
                    </p>
                    <p className="uwt__row-desc">{tx.description}</p>
                    {tx.reference && (
                      <p className="uwt__row-ref">
                        Order #{tx.reference.replace("ORDER_", "")}
                      </p>
                    )}
                  </div>

                  <div className="uwt__row-right">
                    <span
                      className={`uwt__row-amt uwt__row-amt--${tx.type === "CREDIT" ? "credit" : "debit"}`}>
                      {tx.type === "CREDIT" ? "+" : "−"}₹
                      {tx.amount.toLocaleString("en-IN")}
                    </span>
                    <span className="uwt__row-date">
                      {fmtDate(tx.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* ── GRID VIEW ── */
            <div className="uwt__grid">
              {filtered.map((tx) => (
                <div
                  className={`uwt__gcard uwt__gcard--${tx.type === "CREDIT" ? "credit" : "debit"}`}
                  key={tx.transactionRef}>
                  <div className="uwt__gcard-top">
                    <div
                      className={`uwt__gcard-badge uwt__gcard-badge--${tx.type === "CREDIT" ? "credit" : "debit"}`}>
                      {tx.type === "CREDIT" ? <IcoArrowDown /> : <IcoArrowUp />}
                    </div>
                    <span
                      className={`uwt__gcard-amt uwt__gcard-amt--${tx.type === "CREDIT" ? "credit" : "debit"}`}>
                      {tx.type === "CREDIT" ? "+" : "−"}₹
                      {tx.amount.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <p className="uwt__gcard-title">
                    {tx.type === "CREDIT" ? "Refund Received" : "Payment Made"}
                  </p>
                  <p className="uwt__gcard-desc">{tx.description}</p>
                  {tx.reference && (
                    <p className="uwt__gcard-ref">
                      Order #{tx.reference.replace("ORDER_", "")}
                    </p>
                  )}
                  <p className="uwt__gcard-date">{fmtDate(tx.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserWallet;
