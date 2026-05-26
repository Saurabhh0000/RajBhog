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
} from "@fortawesome/free-solid-svg-icons";

/* ============================================================
   STATUS CONFIG
   ============================================================ */
const STATUS_CFG = {
  OPEN: { label: "Open", icon: faCircleExclamation, mod: "open" },
  IN_PROGRESS: { label: "In Progress", icon: faSpinner, mod: "prog" },
  RESOLVED: { label: "Resolved", icon: faCircleCheck, mod: "done" },
  CLOSED: { label: "Closed", icon: faClose, mod: "clo" },
};

/* helper — first-two initials */
const getInitials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

/* ============================================================
   MAIN COMPONENT
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
      .catch(() => toast.error("Failed to load contacts"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadContacts();
  }, []);

  /* ---- filter (no sort needed) ---- */
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

  const stats = {
    total: contacts.length,
    open: contacts.filter((c) => c.status === "OPEN").length,
    progress: contacts.filter((c) => c.status === "IN_PROGRESS").length,
    resolved: contacts.filter((c) => c.status === "RESOLVED").length,
    closed: contacts.filter((c) => c.status === "CLOSED").length,
  };

  const changeStatus = (id, currentStatus) => {
    const data = resolutionMap[id];

    // ✅ HARD fallback
    let finalStatus = currentStatus;

    if (data && typeof data.status === "string") {
      finalStatus = data.status;
    }

    console.log("FINAL STATUS:", finalStatus);

    // 🚨 ABSOLUTE SAFETY
    if (!finalStatus || typeof finalStatus !== "string") {
      toast.error("Invalid status ❗");
      return;
    }

    // 🚨 REQUIRED MESSAGE
    if (
      (finalStatus === "RESOLVED" || finalStatus === "CLOSED") &&
      (!data?.message || data.message.trim() === "")
    ) {
      toast.error("Resolution message required ❗");
      return;
    }

    updateContactStatus(id, {
      status: finalStatus,
      resolutionMessage: data?.message || "",
    })
      .then(() => {
        toast.success("Status updated & email sent ✅");
        setResolutionMap({});
        loadContacts();
      })
      .catch(() => toast.error("Update failed"));
  };

  /* ============================================================ */

  return (
    <div className="acm__wrapper">
      <div className="acm__container">
        {/* ── Header ── */}
        <div className="acm__header">
          <div className="acm__header-left">
            <div className="acm__header-icon">
              <FontAwesomeIcon icon={faHeadset} />
            </div>
            <div>
              <h1 className="acm__title">Contact Management</h1>
              <p className="acm__subtitle">
                Track and respond to customer support requests
              </p>
            </div>
          </div>
          <span className="acm__header-badge">{stats.total} Contacts</span>
        </div>

        {/* ── Stats ── */}
        <div className="acm__stats">
          <div className="acm__stat acm__stat--indigo">
            <div className="acm__stat-icon">
              <FontAwesomeIcon icon={faComments} />
            </div>
            <div className="acm__stat-body">
              <span className="acm__stat-label">Total</span>
              <strong className="acm__stat-value">{stats.total}</strong>
            </div>
          </div>
          <div className="acm__stat acm__stat--amber">
            <div className="acm__stat-icon">
              <FontAwesomeIcon icon={faCircleExclamation} />
            </div>
            <div className="acm__stat-body">
              <span className="acm__stat-label">Open</span>
              <strong className="acm__stat-value">{stats.open}</strong>
            </div>
          </div>
          <div className="acm__stat acm__stat--blue">
            <div className="acm__stat-icon">
              <FontAwesomeIcon icon={faSpinner} />
            </div>
            <div className="acm__stat-body">
              <span className="acm__stat-label">In Progress</span>
              <strong className="acm__stat-value">{stats.progress}</strong>
            </div>
          </div>
          <div className="acm__stat acm__stat--green">
            <div className="acm__stat-icon">
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
            <div className="acm__stat-body">
              <span className="acm__stat-label">Resolved</span>
              <strong className="acm__stat-value">{stats.resolved}</strong>
            </div>
          </div>
          <div className="acm__stat acm__stat--closed">
            <div className="acm__stat-icon">
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
            <div className="acm__stat-body">
              <span className="acm__stat-label">Closed</span>
              <strong className="acm__stat-value">{stats.closed}</strong>
            </div>
          </div>
        </div>

        {/* ── Controls ── */}
        <div className="acm__controls">
          {/* search */}
          <div className="acm__search">
            <span className="acm__search-ico">
              <FontAwesomeIcon icon={faSearch} />
            </span>
            <input
              type="text"
              className="acm__search-input"
              placeholder="Search name, email, phone or subject…"
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

          <div className="acm__ctrl-divider" />

          {/* filter tabs — All | Open | In Progress | Resolved */}
          <div className="acm__filter-tabs">
            <button
              className={`acm__filter-tab acm__tab--all ${statusFilter === "ALL" ? "acm__tab--active" : ""}`}
              onClick={() => setStatusFilter("ALL")}>
              <FontAwesomeIcon icon={faFilter} />
              <span>All</span>
            </button>
            <button
              className={`acm__filter-tab acm__tab--open ${statusFilter === "OPEN" ? "acm__tab--active" : ""}`}
              onClick={() => setStatusFilter("OPEN")}>
              <FontAwesomeIcon icon={faCircleExclamation} />
              <span>Open</span>
            </button>
            <button
              className={`acm__filter-tab acm__tab--prog ${statusFilter === "IN_PROGRESS" ? "acm__tab--active" : ""}`}
              onClick={() => setStatusFilter("IN_PROGRESS")}>
              <FontAwesomeIcon icon={faSpinner} />
              <span>In Progress</span>
            </button>
            <button
              className={`acm__filter-tab acm__tab--res ${statusFilter === "RESOLVED" ? "acm__tab--active" : ""}`}
              onClick={() => setStatusFilter("RESOLVED")}>
              <FontAwesomeIcon icon={faCircleCheck} />
              <span>Resolved</span>
            </button>
            <button
              className={`acm__filter-tab acm__tab--clo ${statusFilter === "CLOSED" ? "acm__tab--active" : ""}`}
              onClick={() => setStatusFilter("CLOSED")}>
              <FontAwesomeIcon icon={faClose} />
              <span>Closed</span>
            </button>
          </div>

          <div className="acm__ctrl-divider" />

          {/* view toggle */}
          <div className="acm__view-toggle">
            <button
              className={`acm__view-btn ${viewMode === "grid" ? "acm__view-btn--on" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Grid view">
              <FontAwesomeIcon icon={faTableCells} />
            </button>
            <button
              className={`acm__view-btn ${viewMode === "list" ? "acm__view-btn--on" : ""}`}
              onClick={() => setViewMode("list")}
              title="List view">
              <FontAwesomeIcon icon={faList} />
            </button>
          </div>
        </div>

        {/* ── Results bar ── */}
        {!loading && (
          <div className="acm__results-bar">
            <span className="acm__results-count">
              Showing <strong>{filtered.length}</strong> of {contacts.length}{" "}
              contacts
            </span>
          </div>
        )}

        {/* ── Content ── */}
        {loading ? (
          <div className="acm__loading">
            <div className="acm__spinner" />
            <p>Loading contacts…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="acm__empty">
            <div className="acm__empty-icon">
              <FontAwesomeIcon icon={faHeadset} />
            </div>
            <h3 className="acm__empty-title">No contacts found</h3>
            <p className="acm__empty-desc">
              {search || statusFilter !== "ALL"
                ? "Try adjusting your search or filters."
                : "Customer queries will appear here once received."}
            </p>
            {(search || statusFilter !== "ALL") && (
              <button
                className="acm__empty-reset"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("ALL");
                }}>
                Reset filters
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
            <div className="acm__list-header">
              <span className="acm__lh-contact">Contact</span>
              <span className="acm__lh-subject">Subject</span>
              <span className="acm__lh-date">Date</span>
              <span className="acm__lh-status">Status</span>
              <span className="acm__lh-update">Update</span>
              <span className="acm__lh-exp"></span>
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

/* ============================================================
   PREMIUM CONTACT CARD
   ============================================================ */
function ContactCard({
  contact: c,
  onStatusChange,
  resolutionMap,
  setResolutionMap,
}) {
  const sm = STATUS_CFG[c.status] || STATUS_CFG.OPEN;

  return (
    <div className={`acm__card acm__card--${sm.mod}`}>
      {/* ── Head: gradient bg + initials avatar + name/email + badge ── */}
      <div className="acm__card-head">
        <div className="acm__card-user">
          <div className="acm__card-avatar">{getInitials(c.name)}</div>
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

      {/* ── Meta chips: phone + date + time ── */}
      <div className="acm__card-chips">
        {c.phone && (
          <span className="acm__chip">
            <FontAwesomeIcon icon={faPhone} />
            {c.phone}
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

      {/* ── Body: subject + message ── */}
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

      {/* ── Footer: status select ── */}
      <div className="acm__card-foot">
        <span className="acm__card-foot-lbl">
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
        {(resolutionMap[c.id]?.status === "RESOLVED" ||
          resolutionMap[c.id]?.status === "CLOSED") && (
          <textarea
            className="acm__resolution-input"
            placeholder="Enter resolution message..."
            value={resolutionMap[c.id]?.message || ""}
            onChange={(e) =>
              setResolutionMap((prev) => ({
                ...prev,
                [c.id]: {
                  ...prev[c.id],
                  message: e.target.value,
                },
              }))
            }
          />
        )}
        {(resolutionMap[c.id]?.status === "RESOLVED" ||
          resolutionMap[c.id]?.status === "CLOSED") && (
          <button
            className="acm__update-btn"
            disabled={!c.status && !resolutionMap[c.id]?.status}
            onClick={() => onStatusChange(c.id, c.status)}>
            Update
          </button>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   LIST ROW (expandable)
   ============================================================ */
function ListRow({
  contact: c,
  onStatusChange,
  resolutionMap,
  setResolutionMap,
}) {
  const sm = STATUS_CFG[c.status] || STATUS_CFG.OPEN;
  const [open, setOpen] = useState(false);

  return (
    <div className={`acm__lrow acm__lrow--${sm.mod}`}>
      <div className="acm__lrow-main" onClick={() => setOpen(!open)}>
        {/* contact */}
        <div className="acm__lrow-contact">
          <div className="acm__lrow-avatar">{getInitials(c.name)}</div>
          <div className="acm__lrow-identity">
            <span className="acm__lrow-name">{c.name}</span>
            <span className="acm__lrow-email">
              <FontAwesomeIcon icon={faAt} />
              {c.email}
            </span>
          </div>
        </div>

        {/* subject */}
        <div className="acm__lrow-subject">
          <span>{c.subject}</span>
        </div>

        {/* date */}
        <div className="acm__lrow-date">
          <FontAwesomeIcon icon={faCalendar} />
          {new Date(c.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </div>

        {/* status */}
        <div className="acm__lrow-status">
          <span className={`acm__pill acm__pill--${sm.mod}`}>
            <FontAwesomeIcon icon={sm.icon} />
            <span className="acm__pill-resp">{sm.label}</span>
          </span>
        </div>

        {/* update select */}
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
          {(resolutionMap[c.id]?.status === "RESOLVED" ||
            resolutionMap[c.id]?.status === "CLOSED") && (
            <textarea
              className="acm__resolution-input"
              placeholder="Enter resolution message..."
              value={resolutionMap[c.id]?.message || ""}
              onChange={(e) =>
                setResolutionMap((prev) => ({
                  ...prev,
                  [c.id]: {
                    ...prev[c.id],
                    message: e.target.value,
                  },
                }))
              }
            />
          )}
          {(resolutionMap[c.id]?.status === "RESOLVED" ||
            resolutionMap[c.id]?.status === "CLOSED") && (
            <button
              className="acm__update-btn"
              disabled={!c.status && !resolutionMap[c.id]?.status}
              onClick={() => onStatusChange(c.id, c.status)}>
              Update
            </button>
          )}
        </div>

        {/* expand */}
        <div className="acm__lrow-exp">
          <button
            className={`acm__lrow-exp-btn ${open ? "acm__lrow-exp-btn--on" : ""}`}>
            <FontAwesomeIcon icon={open ? faChevronUp : faChevronDown} />
          </button>
        </div>
      </div>

      {/* expanded detail */}
      {open && (
        <div className="acm__lrow-detail">
          <div className="acm__lrow-detail-grid">
            <div className="acm__lrow-detail-item">
              <p className="acm__lrow-detail-lbl">
                <FontAwesomeIcon icon={faPhone} /> Phone
              </p>
              <p className="acm__lrow-detail-val">{c.phone || "—"}</p>
            </div>
            <div className="acm__lrow-detail-item">
              <p className="acm__lrow-detail-lbl">Message</p>
              <p className="acm__lrow-detail-val">{c.message}</p>
            </div>
            <div className="acm__lrow-detail-item">
              <p className="acm__lrow-detail-lbl">
                <FontAwesomeIcon icon={faClock} /> Received
              </p>
              <p className="acm__lrow-detail-val">
                {new Date(c.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
