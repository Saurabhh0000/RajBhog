// src/pages/MyContacts.jsx
import { useEffect, useState, useMemo } from "react";
import {
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Mail,
  Phone,
  User,
  Search,
  LayoutGrid,
  List,
  Filter,
  X,
  Headphones,
  Inbox,
  ChevronRight,
  ShieldCheck,
  Hash,
  SlidersHorizontal,
} from "lucide-react";
import toast from "react-hot-toast";
import { getMyContacts } from "../api/public/contactApi";
import "../styles/MyContacts.css";

/* ─── Toast styles ─────────────────────────────────────── */
const toastCfg = {
  error: {
    style: {
      background: "#fff1f2",
      color: "#9f1239",
      fontWeight: 700,
      fontSize: "13.5px",
      borderLeft: "4px solid #f43f5e",
      padding: "12px 18px",
      borderRadius: "12px",
      boxShadow: "0 8px 24px rgba(244,63,94,0.16)",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    },
    duration: 4000,
    icon: "❌",
  },
};

/* ─── status → accent colour ───────────────────────────── */
function statusAccent(status = "") {
  const map = {
    OPEN: "#f59e0b",
    IN_PROGRESS: "#3b82f6",
    RESOLVED: "#059669",
    CLOSED: "#64748b",
  };
  return map[status.toUpperCase()] || "#8b4513";
}

/* ─── status → icon ────────────────────────────────────── */
function StatusIcon({ status, size = 14 }) {
  const s = (status || "").toUpperCase();
  if (s === "OPEN") return <AlertCircle size={size} />;
  if (s === "IN_PROGRESS") return <Clock size={size} />;
  if (s === "RESOLVED") return <CheckCircle size={size} />;
  if (s === "CLOSED") return <XCircle size={size} />;
  return <MessageCircle size={size} />;
}

/* ─── readable label ───────────────────────────────────── */
function statusLabel(status = "") {
  return status.replace("_", " ");
}

/* ─── format date ──────────────────────────────────────── */
function fmtDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* ─── filter tabs config ────────────────────────────────── */
const FILTERS = [
  { key: "ALL", label: "All", Icon: Inbox },
  { key: "OPEN", label: "Open", Icon: AlertCircle },
  { key: "IN_PROGRESS", label: "In Progress", Icon: Clock },
  { key: "RESOLVED", label: "Resolved", Icon: CheckCircle },
  { key: "CLOSED", label: "Closed", Icon: XCircle },
];

/* ============================================================
   MAIN COMPONENT — ALL ORIGINAL LOGIC PRESERVED
   ============================================================ */
export default function MyContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list");

  /* ── load ── */
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const res = await getMyContacts();
      setContacts(res.data || []);
    } catch {
      toast.error(
        "Failed to load support tickets. Please try again.",
        toastCfg.error,
      );
    } finally {
      setLoading(false);
    }
  };

  /* ── helpers ── */
  const getStatusIcon = (status) => <StatusIcon status={status} size={14} />;
  const getStatusLabel = (status) => statusLabel(status);

  /* ── filter + search ── */
  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const matchesFilter = filter === "ALL" || contact.status === filter;
      const matchesSearch =
        contact.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.message.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [contacts, filter, searchTerm]);

  /* ── counts ── */
  const statusCounts = {
    ALL: contacts.length,
    OPEN: contacts.filter((c) => c.status === "OPEN").length,
    IN_PROGRESS: contacts.filter((c) => c.status === "IN_PROGRESS").length,
    RESOLVED: contacts.filter((c) => c.status === "RESOLVED").length,
    CLOSED: contacts.filter((c) => c.status === "CLOSED").length,
  };

  /* ─────────────── LOADING ─────────────── */
  if (loading) {
    return (
      <div className="mct__loading-page">
        <div className="mct__loading-ring">
          <div className="mct__loading-spinner" />
        </div>
        <p className="mct__loading-text">Loading your support tickets…</p>
        <span className="mct__loading-sub">Fetching from RAJBHOG support</span>
      </div>
    );
  }

  /* ─────────────── EMPTY ─────────────── */
  if (!contacts.length) {
    return (
      <div className="mct__empty">
        <div className="mct__empty-card">
          <div className="mct__empty-glow" aria-hidden="true" />
          <div className="mct__empty-icon-wrap">
            <Headphones size={40} />
          </div>
          <h3 className="mct__empty-title">No support tickets yet</h3>
          <p className="mct__empty-sub">
            Whenever you reach out to RAJBHOG support, your tickets will appear
            here so you can track their progress and status.
          </p>
          <div className="mct__empty-hint">
            <span className="mct__empty-hint-icon">💡</span>
            <span>
              Use the <strong>Contact Us</strong> page to raise a new support
              request
            </span>
          </div>
        </div>
      </div>
    );
  }

  /* ─────────────── MAIN ─────────────── */
  return (
    <div className="mct__page">
      <div className="mct__inner">
        {/* ══════════ HERO HEADER ══════════ */}
        <div className="mct__header">
          <span
            className="mct__header-blob mct__header-blob-1"
            aria-hidden="true"
          />
          <span
            className="mct__header-blob mct__header-blob-2"
            aria-hidden="true"
          />
          <div className="mct__header-inner">
            <div className="mct__header-icon">
              <Headphones size={22} />
            </div>
            <div className="mct__header-text">
              <h1 className="mct__header-title">My Support Tickets</h1>
              <p className="mct__header-sub">
                {contacts.length} {contacts.length === 1 ? "ticket" : "tickets"}{" "}
                raised with RAJBHOG support
              </p>
            </div>
            <div className="mct__header-badge">
              <ShieldCheck size={14} />
              <span>RAJBHOG Support</span>
            </div>
          </div>
        </div>

        {/* ══════════ STAT CARDS ══════════ */}
        <div className="mct__stats">
          <StatCard
            mod="total"
            icon={<Inbox size={18} />}
            label="Total Tickets"
            value={statusCounts.ALL}
          />
          <StatCard
            mod="open"
            icon={<AlertCircle size={18} />}
            label="Open"
            value={statusCounts.OPEN}
          />
          <StatCard
            mod="inprog"
            icon={<Clock size={18} />}
            label="In Progress"
            value={statusCounts.IN_PROGRESS}
          />
          <StatCard
            mod="resolved"
            icon={<CheckCircle size={18} />}
            label="Resolved"
            value={statusCounts.RESOLVED}
          />
          <StatCard
            mod="closed"
            icon={<XCircle size={18} />}
            label="Closed"
            value={statusCounts.CLOSED}
          />
        </div>

        {/* ══════════ CONTROLS BAR ══════════ */}
        <div className="mct__controls">
          {/* search */}
          <div className="mct__search">
            <span className="mct__search-ico">
              <Search size={15} />
            </span>
            <input
              type="text"
              className="mct__search-input"
              placeholder="Search by subject or message…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="mct__search-clear"
                onClick={() => setSearchTerm("")}>
                <X size={11} />
              </button>
            )}
          </div>

          {/* filter section label */}
          <div className="mct__ctrl-section">
            <span className="mct__ctrl-label">
              <SlidersHorizontal size={13} /> Filter
            </span>
            <div className="mct__filter-tabs">
              {FILTERS.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  className={[
                    "mct__ftab",
                    `mct__ftab--${key.toLowerCase()}`,
                    filter === key ? "mct__ftab--on" : "",
                  ].join(" ")}
                  onClick={() => setFilter(key)}>
                  <Icon size={13} />
                  <span className="mct__ftab-label">{label}</span>
                  <span className="mct__ftab-badge">
                    {statusCounts[key] ?? 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* view toggle */}
          <div className="mct__view-toggle">
            <button
              className={`mct__view-btn ${viewMode === "list" ? "mct__view-btn--on" : ""}`}
              onClick={() => setViewMode("list")}
              title="List view">
              <List size={15} />
            </button>
            <button
              className={`mct__view-btn ${viewMode === "grid" ? "mct__view-btn--on" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Grid view">
              <LayoutGrid size={15} />
            </button>
          </div>
        </div>

        {/* ══════════ RESULTS META ══════════ */}
        <div className="mct__meta-bar">
          <span className="mct__meta-count">
            Showing <strong>{filteredContacts.length}</strong> of{" "}
            {contacts.length} tickets
          </span>
          {(filter !== "ALL" || searchTerm) && (
            <button
              className="mct__meta-clear"
              onClick={() => {
                setFilter("ALL");
                setSearchTerm("");
              }}>
              <X size={11} /> Clear filters
            </button>
          )}
        </div>

        {/* ══════════ CONTENT ══════════ */}
        {filteredContacts.length === 0 ? (
          <div className="mct__no-results">
            <div className="mct__no-results-icon">
              <Filter size={36} />
            </div>
            <h4 className="mct__no-results-title">
              No tickets match your search
            </h4>
            <p className="mct__no-results-sub">
              {searchTerm
                ? `No results for "${searchTerm}". Try different keywords.`
                : `You have no "${getStatusLabel(filter)}" tickets right now.`}
            </p>
            <button
              className="mct__btn-clear"
              onClick={() => {
                setFilter("ALL");
                setSearchTerm("");
              }}>
              <X size={12} /> Clear Filters
            </button>
          </div>
        ) : viewMode === "list" ? (
          /* ────── LIST VIEW ────── */
          <div className="mct__list">
            {filteredContacts.map((c) => {
              const cls = c.status.toLowerCase();
              return (
                <div key={c.id} className={`mct__lrow s-${cls}`}>
                  {/* left icon */}
                  <div className="mct__lrow-ico">
                    <MessageCircle size={16} />
                  </div>

                  {/* body */}
                  <div className="mct__lrow-info">
                    <div className="mct__lrow-subject">{c.subject}</div>
                    <div className="mct__lrow-msg">"{c.message}"</div>

                    <div className="mct__lrow-meta">
                      {c.name && (
                        <span className="mct__meta-chip">
                          <User size={11} /> {c.name}
                        </span>
                      )}
                      {c.email && (
                        <span className="mct__meta-chip">
                          <Mail size={11} /> {c.email}
                        </span>
                      )}
                      {c.phone && (
                        <span className="mct__meta-chip">
                          <Phone size={11} /> {c.phone}
                        </span>
                      )}
                    </div>

                    {c.resolutionMessage && (
                      <div className="mct__resolution">
                        <ShieldCheck size={13} className="mct__res-icon" />
                        <div>
                          <strong>Resolution:</strong> {c.resolutionMessage}
                          <div className="mct__resolution-note">
                            ✔ Updated by support team
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* pill */}
                  <span className={`mct__pill mct__pill--${cls}`}>
                    {getStatusIcon(c.status)}
                    {getStatusLabel(c.status)}
                  </span>

                  {/* right meta */}
                  <div className="mct__lrow-right">
                    <span className="mct__lrow-id">
                      <Hash size={9} />
                      {c.id}
                    </span>
                    <span className="mct__lrow-date">
                      <Calendar size={10} /> {fmtDate(c.createdAt)}
                    </span>
                  </div>

                  <ChevronRight size={14} className="mct__lrow-chevron" />
                </div>
              );
            })}
          </div>
        ) : (
          /* ────── GRID VIEW ────── */
          <div className="mct__grid">
            {filteredContacts.map((c) => {
              const cls = c.status.toLowerCase();
              return (
                <div
                  key={c.id}
                  className="mct__gcard"
                  style={{ "--card-accent": statusAccent(c.status) }}>
                  {/* top accent strip */}
                  <span className="mct__gcard-strip" aria-hidden="true" />

                  {/* head */}
                  <div className="mct__gcard-head">
                    <div className="mct__gcard-head-left">
                      <span className="mct__gcard-id">
                        <Hash size={9} /> Ticket {c.id}
                      </span>
                      <span className="mct__gcard-date">
                        <Calendar size={11} /> {fmtDate(c.createdAt)}
                      </span>
                    </div>
                    <span className={`mct__pill mct__pill--${cls}`}>
                      {getStatusIcon(c.status)}
                      {getStatusLabel(c.status)}
                    </span>
                  </div>

                  {/* body */}
                  <div className="mct__gcard-body">
                    <p className="mct__gcard-subject">{c.subject}</p>
                    <p className="mct__gcard-msg">"{c.message}"</p>

                    {c.resolutionMessage && (
                      <div className="mct__resolution">
                        <ShieldCheck size={13} className="mct__res-icon" />
                        <div>
                          <strong>Resolution:</strong> {c.resolutionMessage}
                          <div className="mct__resolution-note">
                            ✔ Updated by support team
                          </div>
                        </div>
                      </div>
                    )}

                    {(c.name || c.email || c.phone) && (
                      <div className="mct__gcard-meta">
                        {c.name && (
                          <span className="mct__meta-chip">
                            <User size={11} /> {c.name}
                          </span>
                        )}
                        {c.email && (
                          <span className="mct__meta-chip">
                            <Mail size={11} /> {c.email}
                          </span>
                        )}
                        {c.phone && (
                          <span className="mct__meta-chip">
                            <Phone size={11} /> {c.phone}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* foot */}
                  <div className="mct__gcard-foot">
                    <span className={`mct__gcard-status-row s-${cls}`}>
                      <StatusIcon status={c.status} size={13} />
                      {getStatusLabel(c.status)}
                    </span>
                    <span className="mct__gcard-ticket-id">
                      <Hash size={9} />
                      {c.id}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── StatCard sub-component ─────────────────────────────── */
function StatCard({ mod, icon, label, value }) {
  return (
    <div className={`mct__stat mct__stat--${mod}`}>
      <div className="mct__stat-icon">{icon}</div>
      <div className="mct__stat-info">
        <span className="mct__stat-label">{label}</span>
        <strong className="mct__stat-value">{value}</strong>
      </div>
    </div>
  );
}
