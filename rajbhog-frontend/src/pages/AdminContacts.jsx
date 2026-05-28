import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  fetchAllContacts,
  updateContactStatus,
} from "../api/admin/adminContactApi";
import "../styles/AdminContacts.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faSearch,
  faFilter,
  faPhone,
  faClock,
  faCircleCheck,
  faSpinner,
  faComments,
  faHeadset,
  faChartLine,
  faMessage,
  faCalendar,
  faAt,
  faCheckCircle,
  faTableCells,
  faList,
  faTimes,
  faCircleExclamation,
  faChevronDown,
  faChevronUp,
  faClose,
  faPaperPlane,
  faUserHeadset,
  faBullhorn,
} from "@fortawesome/free-solid-svg-icons";

/* ── Status config ── */
const STATUS_CFG = {
  OPEN: { label: "Open", icon: faCircleExclamation, mod: "open" },
  IN_PROGRESS: { label: "In Progress", icon: faSpinner, mod: "prog" },
  RESOLVED: { label: "Resolved", icon: faCircleCheck, mod: "done" },
  CLOSED: { label: "Closed", icon: faClose, mod: "clo" },
};

/* ── Initials helper ── */
const getInitials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

/* ============================================================
   MAIN COMPONENT — ALL ORIGINAL LOGIC PRESERVED
   ============================================================ */
export default function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("grid");
  const [resolutionMap, setResolutionMap] = useState({});

  const loadContacts = () => {
    setLoading(true);
    fetchAllContacts()
      .then((res) => setContacts(res.data))
      .catch(() =>
        toast.error("Failed to load contacts. Please refresh.", {
          icon: "⚠️",
          duration: 3500,
        }),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadContacts();
  }, []);

  /* ── Client-side filter ── */
  const filtered = useMemo(() => {
    return contacts.filter((c) => {
      const q = search.toLowerCase();
      const matchSearch =
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q));
      const matchStatus = statusFilter === "ALL" || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [contacts, search, statusFilter]);

  /* ── Stats ── */
  const stats = {
    total: contacts.length,
    open: contacts.filter((c) => c.status === "OPEN").length,
    progress: contacts.filter((c) => c.status === "IN_PROGRESS").length,
    resolved: contacts.filter((c) => c.status === "RESOLVED").length,
    closed: contacts.filter((c) => c.status === "CLOSED").length,
  };

  /* ── Change status ── */
  const changeStatus = (id, currentStatus) => {
    const data = resolutionMap[id];
    let finalStatus = currentStatus;
    if (data && typeof data.status === "string") finalStatus = data.status;

    if (!finalStatus || typeof finalStatus !== "string") {
      toast.error("Invalid status selected.", { icon: "❌", duration: 3000 });
      return;
    }
    if (
      (finalStatus === "RESOLVED" || finalStatus === "CLOSED") &&
      (!data?.message || data.message.trim() === "")
    ) {
      toast.error("Please enter a resolution message before updating.", {
        icon: "✍️",
        duration: 3500,
      });
      return;
    }

    updateContactStatus(id, {
      status: finalStatus,
      resolutionMessage: data?.message || "",
    })
      .then(() => {
        toast.success("Status updated & confirmation email sent to customer.", {
          icon: "✅",
          duration: 3000,
        });
        setResolutionMap({});
        loadContacts();
      })
      .catch(() =>
        toast.error("Failed to update status. Please try again.", {
          icon: "❌",
          duration: 3500,
        }),
      );
  };

  /* ============================================================ */
  return (
    <div className="acm__wrapper">
      <div className="acm__container">
        {/* ══ HEADER ══ */}
        <div className="acm__header">
          <div className="acm__header-body">
            <div className="acm__header-icon">
              <FontAwesomeIcon icon={faHeadset} />
            </div>
            <div className="acm__header-text">
              <h1 className="acm__title">Contact Management</h1>
              <p className="acm__subtitle">
                Track and respond to customer support requests
              </p>
            </div>
          </div>
          <span className="acm__header-badge">
            <FontAwesomeIcon icon={faComments} /> {stats.total} Contacts
          </span>
        </div>

        {/* ══ STATS ══ */}
        <div className="acm__stats">
          <StatCard
            icon={faComments}
            color="indigo"
            label="Total"
            value={stats.total}
          />
          <StatCard
            icon={faCircleExclamation}
            color="amber"
            label="Open"
            value={stats.open}
          />
          <StatCard
            icon={faSpinner}
            color="blue"
            label="In Progress"
            value={stats.progress}
          />
          <StatCard
            icon={faCircleCheck}
            color="green"
            label="Resolved"
            value={stats.resolved}
          />
          <StatCard
            icon={faClose}
            color="red"
            label="Closed"
            value={stats.closed}
          />
        </div>

        {/* ══ CONTROLS ══ */}
        <div className="acm__controls">
          {/* Row 1: search + view toggle */}
          <div className="acm__controls-top">
            <div className="acm__search">
              <span className="acm__search-ico">
                <FontAwesomeIcon icon={faSearch} />
              </span>
              <input
                type="text"
                className="acm__search-input"
                placeholder="Search by name, email, phone or subject…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  className="acm__search-clear"
                  onClick={() => setSearch("")}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              )}
            </div>
            <div className="acm__view-toggle">
              <button
                className={`acm__view-btn${viewMode === "grid" ? " acm__view-btn--on" : ""}`}
                onClick={() => setViewMode("grid")}
                title="Grid view">
                <FontAwesomeIcon icon={faTableCells} />
              </button>
              <button
                className={`acm__view-btn${viewMode === "list" ? " acm__view-btn--on" : ""}`}
                onClick={() => setViewMode("list")}
                title="List view">
                <FontAwesomeIcon icon={faList} />
              </button>
            </div>
          </div>

          {/* Row 2: scrollable filter tabs */}
          <div className="acm__filter-row">
            {[
              { key: "ALL", mod: "all", icon: faFilter, label: "All" },
              {
                key: "OPEN",
                mod: "open",
                icon: faCircleExclamation,
                label: "Open",
              },
              {
                key: "IN_PROGRESS",
                mod: "prog",
                icon: faSpinner,
                label: "In Progress",
              },
              {
                key: "RESOLVED",
                mod: "res",
                icon: faCircleCheck,
                label: "Resolved",
              },
              { key: "CLOSED", mod: "clo", icon: faClose, label: "Closed" },
            ].map((f) => (
              <button
                key={f.key}
                className={`acm__ftab acm__ftab--${f.mod}${statusFilter === f.key ? " acm__ftab--on" : ""}`}
                onClick={() => setStatusFilter(f.key)}>
                <FontAwesomeIcon icon={f.icon} />
                <span>{f.label}</span>
                <span className="acm__ftab-count">
                  {f.key === "ALL"
                    ? stats.total
                    : f.key === "OPEN"
                      ? stats.open
                      : f.key === "IN_PROGRESS"
                        ? stats.progress
                        : f.key === "RESOLVED"
                          ? stats.resolved
                          : stats.closed}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ══ RESULTS META ══ */}
        {!loading && (
          <div className="acm__results-meta">
            <span className="acm__results-text">
              Showing <strong>{filtered.length}</strong> of {contacts.length}{" "}
              contacts
            </span>
            {(search || statusFilter !== "ALL") && (
              <button
                className="acm__clear-all"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("ALL");
                }}>
                <FontAwesomeIcon icon={faTimes} /> Clear
              </button>
            )}
          </div>
        )}

        {/* ══ CONTENT ══ */}
        {loading ? (
          <div className="acm__loading-state">
            <div className="acm__spinner" />
            <p>Loading contacts…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="acm__empty-state">
            <div className="acm__empty-icon">
              <FontAwesomeIcon icon={faHeadset} />
            </div>
            <h3 className="acm__empty-title">No contacts found</h3>
            <p className="acm__empty-sub">
              {search || statusFilter !== "ALL"
                ? "Try adjusting your search or filter to see more results."
                : "Customer queries will appear here once received."}
            </p>
            {(search || statusFilter !== "ALL") && (
              <button
                className="acm__empty-reset"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("ALL");
                }}>
                Reset Filters
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="acm__grid">
            {filtered.map((c) => (
              <ContactCard
                key={c.id}
                contact={c}
                onStatusChange={changeStatus}
                resolutionMap={resolutionMap}
                setResolutionMap={setResolutionMap}
              />
            ))}
          </div>
        ) : (
          <div className="acm__list">
            <div className="acm__list-head">
              <span className="acm__lh-contact">Contact</span>
              <span className="acm__lh-subject">Subject</span>
              <span className="acm__lh-date">Date</span>
              <span className="acm__lh-status">Status</span>
              <span className="acm__lh-update">Update</span>
              <span />
            </div>
            {filtered.map((c) => (
              <ListRow
                key={c.id}
                contact={c}
                onStatusChange={changeStatus}
                resolutionMap={resolutionMap}
                setResolutionMap={setResolutionMap}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Stat Card ── */
function StatCard({ icon, color, label, value }) {
  return (
    <div className={`acm__stat acm__stat--${color}`}>
      <div className="acm__stat-icon">
        <FontAwesomeIcon icon={icon} />
      </div>
      <div className="acm__stat-body">
        <span className="acm__stat-label">{label}</span>
        <strong className="acm__stat-value">{value}</strong>
      </div>
    </div>
  );
}

/* ============================================================
   CONTACT CARD  (grid view)
   ============================================================ */
function ContactCard({
  contact: c,
  onStatusChange,
  resolutionMap,
  setResolutionMap,
}) {
  const sm = STATUS_CFG[c.status] || STATUS_CFG.OPEN;
  const needsMessage =
    resolutionMap[c.id]?.status === "RESOLVED" ||
    resolutionMap[c.id]?.status === "CLOSED";

  return (
    <div className={`acm__card acm__card--${sm.mod}`}>
      {/* Colored top accent bar */}
      <div className="acm__card-bar" />

      {/* Head */}
      <div className={`acm__card-head acm__card-head--${sm.mod}`}>
        <div className="acm__card-user">
          <div className={`acm__card-avatar acm__card-avatar--${sm.mod}`}>
            {getInitials(c.name)}
          </div>
          <div className="acm__card-identity">
            <span className="acm__card-name" title={c.name}>
              {c.name}
            </span>
            <span className="acm__card-email">
              <FontAwesomeIcon icon={faAt} />
              {c.email}
            </span>
          </div>
        </div>
        <span className={`acm__pill acm__pill--${sm.mod}`}>
          <FontAwesomeIcon icon={sm.icon} />
          {sm.label}
        </span>
      </div>

      {/* Meta chips */}
      <div className="acm__card-chips">
        {c.phone && (
          <span className="acm__chip">
            <FontAwesomeIcon icon={faPhone} /> {c.phone}
          </span>
        )}
        <span className="acm__chip">
          <FontAwesomeIcon icon={faCalendar} />
          {new Date(c.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
        <span className="acm__chip">
          <FontAwesomeIcon icon={faClock} />
          {new Date(c.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      {/* Body */}
      <div className="acm__card-body">
        <div className="acm__card-section">
          <p className="acm__card-section-lbl">
            <FontAwesomeIcon icon={faMessage} /> Subject
          </p>
          <p className="acm__card-subject">{c.subject}</p>
        </div>
        <div className="acm__card-divider" />
        <p className="acm__card-message">{c.message}</p>
      </div>

      {/* Footer — status update */}
      <div className="acm__card-foot">
        <div className="acm__foot-row">
          <span className="acm__foot-lbl">
            <FontAwesomeIcon icon={faChartLine} /> Update Status
          </span>
          <select
            className="acm__card-sel"
            value={resolutionMap[c.id]?.status || c.status}
            onChange={(e) =>
              setResolutionMap((prev) => ({
                ...prev,
                [c.id]: {
                  status: e.target.value,
                  message: prev[c.id]?.message || "",
                },
              }))
            }>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        {needsMessage && (
          <>
            <textarea
              className="acm__resolution-textarea"
              placeholder="Enter resolution message to send to customer…"
              rows={3}
              value={resolutionMap[c.id]?.message || ""}
              onChange={(e) =>
                setResolutionMap((prev) => ({
                  ...prev,
                  [c.id]: { ...prev[c.id], message: e.target.value },
                }))
              }
            />
            <button
              className="acm__update-btn"
              onClick={() => onStatusChange(c.id, c.status)}>
              <FontAwesomeIcon icon={faPaperPlane} /> Send Update
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   LIST ROW  (expandable)
   ============================================================ */
function ListRow({
  contact: c,
  onStatusChange,
  resolutionMap,
  setResolutionMap,
}) {
  const sm = STATUS_CFG[c.status] || STATUS_CFG.OPEN;
  const [open, setOpen] = useState(false);
  const needsMessage =
    resolutionMap[c.id]?.status === "RESOLVED" ||
    resolutionMap[c.id]?.status === "CLOSED";

  return (
    <div className={`acm__lrow acm__lrow--${sm.mod}`}>
      <div className="acm__lrow-main" onClick={() => setOpen(!open)}>
        {/* Contact */}
        <div className="acm__lrow-contact">
          <div className={`acm__lrow-avatar acm__lrow-avatar--${sm.mod}`}>
            {getInitials(c.name)}
          </div>
          <div className="acm__lrow-identity">
            <span className="acm__lrow-name">{c.name}</span>
            <span className="acm__lrow-email">
              <FontAwesomeIcon icon={faAt} /> {c.email}
            </span>
          </div>
        </div>

        {/* Subject */}
        <div className="acm__lrow-subject">{c.subject}</div>

        {/* Date */}
        <div className="acm__lrow-date">
          <FontAwesomeIcon icon={faCalendar} />
          {new Date(c.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </div>

        {/* Status pill */}
        <div className="acm__lrow-status">
          <span className={`acm__pill acm__pill--${sm.mod}`}>
            <FontAwesomeIcon icon={sm.icon} />
            <span className="acm__pill-label">{sm.label}</span>
          </span>
        </div>

        {/* Update select */}
        <div className="acm__lrow-update" onClick={(e) => e.stopPropagation()}>
          <select
            className="acm__lrow-sel"
            value={resolutionMap[c.id]?.status || c.status}
            onChange={(e) =>
              setResolutionMap((prev) => ({
                ...prev,
                [c.id]: {
                  status: e.target.value,
                  message: prev[c.id]?.message || "",
                },
              }))
            }>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        {/* Expand toggle */}
        <div className="acm__lrow-exp">
          <button className={`acm__exp-btn${open ? " acm__exp-btn--on" : ""}`}>
            <FontAwesomeIcon icon={open ? faChevronUp : faChevronDown} />
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {open && (
        <div className="acm__lrow-detail">
          <div className="acm__detail-grid">
            <div className="acm__detail-item">
              <p className="acm__detail-lbl">
                <FontAwesomeIcon icon={faPhone} /> Phone
              </p>
              <p className="acm__detail-val">{c.phone || "—"}</p>
            </div>
            <div className="acm__detail-item">
              <p className="acm__detail-lbl">
                <FontAwesomeIcon icon={faMessage} /> Message
              </p>
              <p className="acm__detail-val">{c.message}</p>
            </div>
            <div className="acm__detail-item">
              <p className="acm__detail-lbl">
                <FontAwesomeIcon icon={faClock} /> Received
              </p>
              <p className="acm__detail-val">
                {new Date(c.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {needsMessage && (
            <div className="acm__detail-resolution">
              <p className="acm__detail-lbl">
                <FontAwesomeIcon icon={faMessage} /> Resolution Message
              </p>
              <textarea
                className="acm__resolution-textarea"
                placeholder="Enter resolution message to send to customer…"
                rows={3}
                value={resolutionMap[c.id]?.message || ""}
                onChange={(e) =>
                  setResolutionMap((prev) => ({
                    ...prev,
                    [c.id]: { ...prev[c.id], message: e.target.value },
                  }))
                }
              />
              <button
                className="acm__update-btn"
                onClick={() => onStatusChange(c.id, c.status)}>
                <FontAwesomeIcon icon={faPaperPlane} /> Send Update
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
