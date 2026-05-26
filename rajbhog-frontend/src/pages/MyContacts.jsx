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
} from "lucide-react";
import toast from "react-hot-toast";
import { getMyContacts } from "../api/public/contactApi";
import "../styles/MyContacts.css";

/* ── status → accent colour (top strip on grid card) ── */
function statusAccent(status = "") {
  const map = {
    OPEN: "#f59e0b",
    IN_PROGRESS: "#3b82f6",
    RESOLVED: "#059669",
    CLOSED: "#64748b",
  };
  return map[status.toUpperCase()] || "#8b4513";
}

/* ── status → icon ── */
function StatusIcon({ status, size = 14 }) {
  const s = (status || "").toUpperCase();
  if (s === "OPEN") return <AlertCircle size={size} />;
  if (s === "IN_PROGRESS") return <Clock size={size} />;
  if (s === "RESOLVED") return <CheckCircle size={size} />;
  if (s === "CLOSED") return <XCircle size={size} />;
  return <MessageCircle size={size} />;
}

/* ── readable status label ── */
function statusLabel(status = "") {
  return status.replace("_", " ");
}

/* ── format date ── */
function fmtDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* ── filter tabs config ── */
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

  /* ── LOAD — original logic, improved toast ── */
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const res = await getMyContacts();
      setContacts(res.data || []);
    } catch {
      toast.error("Failed to load support tickets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── STATUS HELPERS — original logic ── */
  const getStatusIcon = (status) => <StatusIcon status={status} size={14} />;
  const getStatusLabel = (status) => statusLabel(status);

  /* ── FILTER + SEARCH — original logic ── */
  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const matchesFilter = filter === "ALL" || contact.status === filter;
      const matchesSearch =
        contact.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.message.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [contacts, filter, searchTerm]);

  /* ── STATUS COUNTS — original logic ── */
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
        <div className="mct__loading-spinner" />
        <p>Loading your support tickets…</p>
      </div>
    );
  }

  /* ─────────────── EMPTY ─────────────── */
  if (!contacts.length) {
    return (
      <div className="mct__empty">
        <div className="mct__empty-card">
          <div className="mct__empty-icon-wrap">
            <Headphones size={44} />
          </div>
          <h3 className="mct__empty-title">No support tickets yet</h3>
          <p className="mct__empty-sub">
            Whenever you reach out to RAJBHOG support, your tickets will appear
            here so you can track their progress and status.
          </p>
          <div className="mct__empty-hint">
            💡 Tip — Use the Contact Us page to raise a new support request
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
          <div className="mct__header-inner">
            <div className="mct__header-icon">
              <Headphones size={24} />
            </div>
            <div className="mct__header-text">
              <h1 className="mct__header-title">My Support Tickets</h1>
              <p className="mct__header-sub">
                {contacts.length} {contacts.length === 1 ? "ticket" : "tickets"}{" "}
                raised with RAJBHOG support
              </p>
            </div>
          </div>
        </div>

        {/* ══════════ STAT CARDS ══════════ */}
        <div className="mct__stats">
          <div className="mct__stat mct__stat--total">
            <div className="mct__stat-icon">
              <Inbox size={18} />
            </div>
            <div className="mct__stat-info">
              <span className="mct__stat-label">Total Tickets</span>
              <strong className="mct__stat-value">{statusCounts.ALL}</strong>
            </div>
          </div>

          <div className="mct__stat mct__stat--open">
            <div className="mct__stat-icon">
              <AlertCircle size={18} />
            </div>
            <div className="mct__stat-info">
              <span className="mct__stat-label">Open</span>
              <strong className="mct__stat-value">{statusCounts.OPEN}</strong>
            </div>
          </div>

          <div className="mct__stat mct__stat--inprog">
            <div className="mct__stat-icon">
              <Clock size={18} />
            </div>
            <div className="mct__stat-info">
              <span className="mct__stat-label">In Progress</span>
              <strong className="mct__stat-value">
                {statusCounts.IN_PROGRESS}
              </strong>
            </div>
          </div>

          <div className="mct__stat mct__stat--resolved">
            <div className="mct__stat-icon">
              <CheckCircle size={18} />
            </div>
            <div className="mct__stat-info">
              <span className="mct__stat-label">Resolved</span>
              <strong className="mct__stat-value">
                {statusCounts.RESOLVED}
              </strong>
            </div>
          </div>
          <div className="mct__stat mct__stat--closed">
            <div className="mct__stat-icon">
              <XCircle size={18} />
            </div>
            <div className="mct__stat-info">
              <span className="mct__stat-label">Closed</span>
              <strong className="mct__stat-value">{statusCounts.CLOSED}</strong>
            </div>
          </div>
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

          <div className="mct__ctrl-div" />

          {/* filter tabs with icons */}
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
                {label}
                <span className="mct__ftab-badge">
                  {statusCounts[key] ?? 0}
                </span>
              </button>
            ))}
          </div>

          <div className="mct__ctrl-div" />

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
        <div className="mct__meta">
          <span className="mct__meta-count">
            Showing <strong>{filteredContacts.length}</strong> of{" "}
            {contacts.length} tickets
          </span>
        </div>

        {/* ══════════ CONTENT ══════════ */}
        {filteredContacts.length === 0 ? (
          <div className="mct__no-results">
            <Filter size={48} />
            <h4>No tickets match your search</h4>
            <p>
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
          /* ── LIST VIEW ── */
          <div className="mct__list">
            {filteredContacts.map((c) => {
              const cls = c.status.toLowerCase();
              return (
                <div key={c.id} className={`mct__lrow s-${cls}`}>
                  <div className="mct__lrow-ico">
                    <MessageCircle size={17} />
                  </div>

                  <div className="mct__lrow-info">
                    <div className="mct__lrow-subject">{c.subject}</div>
                    <div className="mct__lrow-msg">{c.message}</div>
                    <div className="mct__lrow-meta">
                      {c.name && (
                        <span className="mct__lrow-meta-item">
                          <User size={11} /> {c.name}
                        </span>
                      )}
                      {c.email && (
                        <span className="mct__lrow-meta-item">
                          <Mail size={11} /> {c.email}
                        </span>
                      )}
                      {c.phone && (
                        <span className="mct__lrow-meta-item">
                          <Phone size={11} /> {c.phone}
                        </span>
                      )}
                      {c.resolutionMessage && (
                        <div className="mct__resolution">
                          <strong>Resolution:</strong> {c.resolutionMessage}
                          <div className="mct__resolution-note">
                            ✔ Updated by support team
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <span className={`mct__pill mct__pill--${cls}`}>
                    {getStatusIcon(c.status)}
                    {getStatusLabel(c.status)}
                  </span>

                  <div className="mct__lrow-right">
                    <span className="mct__lrow-id">#{c.id}</span>
                    <span className="mct__lrow-date">
                      <Calendar size={10} /> {fmtDate(c.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── GRID VIEW — premium, no overlap ── */
          <div className="mct__grid">
            {filteredContacts.map((c) => {
              const cls = c.status.toLowerCase();

              return (
                <div
                  key={c.id}
                  className="mct__gcard"
                  style={{ "--card-accent": statusAccent(c.status) }}>
                  {/* HEAD: ticket id + date + status pill */}
                  <div className="mct__gcard-head">
                    <div className="mct__gcard-head-left">
                      <span className="mct__gcard-id">Ticket #{c.id}</span>
                      <span className="mct__gcard-date">
                        <Calendar size={11} /> {fmtDate(c.createdAt)}
                      </span>
                    </div>
                    <span className={`mct__pill mct__pill--${cls}`}>
                      {getStatusIcon(c.status)}
                      {getStatusLabel(c.status)}
                    </span>
                  </div>

                  {/* BODY: subject + message + meta chips */}
                  <div className="mct__gcard-body">
                    <p className="mct__gcard-subject">{c.subject}</p>
                    <p className="mct__gcard-msg">"{c.message}"</p>
                    {c.resolutionMessage && (
                      <div className="mct__resolution">
                        <strong>Resolution:</strong> {c.resolutionMessage}
                        <div className="mct__resolution-note">
                          ✔ Updated by support team
                        </div>
                      </div>
                    )}

                    {/* contact meta */}
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

                  {/* FOOTER: status indicator + ticket id */}
                  <div className="mct__gcard-foot">
                    <span className={`mct__gcard-status-row s-${cls}`}>
                      {c.status === "RESOLVED" && (
                        <>
                          <CheckCircle size={14} /> Resolved
                        </>
                      )}

                      {c.status === "CLOSED" && (
                        <>
                          <XCircle size={14} /> Closed
                        </>
                      )}

                      {c.status === "IN_PROGRESS" && (
                        <>
                          <Clock size={14} /> In Progress
                        </>
                      )}

                      {c.status === "OPEN" && (
                        <>
                          <AlertCircle size={14} /> Open
                        </>
                      )}
                    </span>
                    <span className="mct__gcard-ticket-id">#{c.id}</span>
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
