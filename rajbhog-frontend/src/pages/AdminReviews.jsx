import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  fetchAllReviews,
  updateReviewStatus,
} from "../api/admin/adminReviewApi";

import "../styles/AdminReviews.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faCheckCircle,
  faTimesCircle,
  faSearch,
  faFilter,
  faBox,
  faComments,
  faClock,
  faCalendar,
  faThLarge,
  faList,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

/* ============================================================
   HELPERS
   ============================================================ */
function StarRow({ rating, size = 16 }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <FontAwesomeIcon
          key={i}
          icon={faStar}
          className={i <= rating ? "arv__star-filled" : "arv__star-empty"}
          style={{ fontSize: size }}
        />
      ))}
    </span>
  );
}

/* ============================================================
   MAIN COMPONENT — all backend logic unchanged
   ============================================================ */
export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [ratingFilter, setRatingFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("grid");

  const loadReviews = () => {
    setLoading(true);
    fetchAllReviews()
      .then((res) => setReviews(res.data))
      .catch(() => toast.error("Failed to load reviews"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReviews();
  }, []);

  /* ---- filter ---- */
  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      const matchSearch =
        r.productName.toLowerCase().includes(search.toLowerCase()) ||
        (r.comment || "").toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "APPROVED" && r.approved) ||
        (statusFilter === "PENDING" && !r.approved);
      const matchRating =
        ratingFilter === "ALL" || r.rating === Number(ratingFilter);
      return matchSearch && matchStatus && matchRating;
    });
  }, [reviews, search, statusFilter, ratingFilter]);

  /* ---- stats ---- */
  const stats = {
    total: reviews.length,
    approved: reviews.filter((r) => r.approved).length,
    pending: reviews.filter((r) => !r.approved).length,
    avgRating: reviews.length
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : "0.0",
  };

  const changeStatus = (id, approved) => {
    updateReviewStatus(id, approved)
      .then(() => {
        toast.success(approved ? "Review approved" : "Review rejected");
        loadReviews();
      })
      .catch(() => toast.error("Action failed"));
  };

  /* ============================================================ */

  return (
    <div className="arv__wrapper">
      <div className="arv__container">
        {/* ── Header ── */}
        <div className="arv__header">
          <div className="arv__header-left">
            <div className="arv__header-icon">
              <FontAwesomeIcon icon={faComments} />
            </div>
            <div>
              <h1 className="arv__title">Review Management</h1>
              <p className="arv__subtitle">
                Monitor and manage customer feedback
              </p>
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="arv__stats">
          <div className="arv__stat arv__stat--total">
            <div className="arv__stat-icon">
              <FontAwesomeIcon icon={faComments} />
            </div>
            <div className="arv__stat-info">
              <span className="arv__stat-label">Total Reviews</span>
              <strong className="arv__stat-value">{stats.total}</strong>
            </div>
          </div>
          <div className="arv__stat arv__stat--approved">
            <div className="arv__stat-icon">
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
            <div className="arv__stat-info">
              <span className="arv__stat-label">Approved</span>
              <strong className="arv__stat-value">{stats.approved}</strong>
            </div>
          </div>
          <div className="arv__stat arv__stat--pending">
            <div className="arv__stat-icon">
              <FontAwesomeIcon icon={faClock} />
            </div>
            <div className="arv__stat-info">
              <span className="arv__stat-label">Pending</span>
              <strong className="arv__stat-value">{stats.pending}</strong>
            </div>
          </div>
          <div className="arv__stat arv__stat--rating">
            <div className="arv__stat-icon">
              <FontAwesomeIcon icon={faStar} />
            </div>
            <div className="arv__stat-info">
              <span className="arv__stat-label">Avg Rating</span>
              <strong className="arv__stat-value">
                {stats.avgRating}
                <span className="arv__stat-suffix">★</span>
              </strong>
            </div>
          </div>
        </div>

        {/* ── Controls ── */}
        <div className="arv__controls">
          {/* search */}
          <div className="arv__search">
            <span className="arv__search-ico">
              <FontAwesomeIcon icon={faSearch} />
            </span>
            <input
              type="text"
              className="arv__search-input"
              placeholder="Search by product or comment…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="arv__search-clear"
                onClick={() => setSearch("")}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>

          <div className="arv__ctrl-divider" />

          {/* status filter tabs */}
          <div className="arv__filter-tabs">
            <button
              className={`arv__filter-tab t--all ${statusFilter === "ALL" ? "t--active" : ""}`}
              onClick={() => setStatusFilter("ALL")}>
              <FontAwesomeIcon icon={faFilter} />
              <span>All</span>
            </button>
            <button
              className={`arv__filter-tab t--approved ${statusFilter === "APPROVED" ? "t--active" : ""}`}
              onClick={() => setStatusFilter("APPROVED")}>
              <FontAwesomeIcon icon={faCheckCircle} />
              <span>Approved</span>
            </button>
            <button
              className={`arv__filter-tab t--pending ${statusFilter === "PENDING" ? "t--active" : ""}`}
              onClick={() => setStatusFilter("PENDING")}>
              <FontAwesomeIcon icon={faClock} />
              <span>Pending</span>
            </button>
          </div>

          <div className="arv__ctrl-divider" />

          {/* rating filter */}
          <div className="arv__rating-wrap">
            <span className="arv__rating-ico">
              <FontAwesomeIcon icon={faStar} />
            </span>
            <select
              className="arv__rating-sel"
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}>
              <option value="ALL">All Ratings</option>
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r} Star{r !== 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="arv__ctrl-divider" />

          {/* view toggle */}
          <div className="arv__view-toggle">
            <button
              className={`arv__view-btn ${viewMode === "grid" ? "arv__view-btn--on" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Grid view">
              <FontAwesomeIcon icon={faThLarge} />
            </button>
            <button
              className={`arv__view-btn ${viewMode === "list" ? "arv__view-btn--on" : ""}`}
              onClick={() => setViewMode("list")}
              title="List view">
              <FontAwesomeIcon icon={faList} />
            </button>
          </div>
        </div>

        {/* ── Results bar ── */}
        {!loading && (
          <div className="arv__results-bar">
            <span className="arv__results-count">
              Showing <strong>{filtered.length}</strong> of {reviews.length}{" "}
              reviews
            </span>
          </div>
        )}

        {/* ── Content ── */}
        {loading ? (
          <div className="arv__loading">
            <div className="arv__spinner" />
            <p>Loading reviews…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="arv__empty">
            <div className="arv__empty-icon">
              <FontAwesomeIcon icon={faComments} />
            </div>
            <h3>No Reviews Found</h3>
            <p>
              {search || statusFilter !== "ALL" || ratingFilter !== "ALL"
                ? "Try adjusting your filters or search query."
                : "Customer reviews will appear here once submitted."}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="arv__grid">
            {filtered.map((r) => (
              <ReviewCard key={r.id} review={r} onStatusChange={changeStatus} />
            ))}
          </div>
        ) : (
          <div className="arv__list">
            <div className="arv__list-head">
              <span>Product</span>
              <span className="arv__lh-stars">Rating</span>
              <span className="arv__lh-status">Status</span>
              <span className="arv__lh-comment">Comment</span>
              <span className="arv__lh-date">Date</span>
              <span>Actions</span>
            </div>
            {filtered.map((r) => (
              <ListRow key={r.id} review={r} onStatusChange={changeStatus} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   GRID CARD — premium 4-zone layout
   ============================================================ */
function ReviewCard({ review: r, onStatusChange }) {
  const statusCls = r.approved ? "is-approved" : "is-pending";

  return (
    <div className={`arv__card ${statusCls}`}>
      {/* ── Head: product icon + name + unit + badge ── */}
      <div className="arv__card-head">
        <div className="arv__card-product">
          <div className="arv__card-product-icon">
            <FontAwesomeIcon icon={faBox} />
          </div>
          <div className="arv__card-product-info">
            <span className="arv__card-product-name" title={r.productName}>
              {r.productName}
            </span>
            {r.unit && <span className="arv__card-unit">{r.unit}</span>}
          </div>
        </div>
        <span className={`arv__badge ${r.approved ? "approved" : "pending"}`}>
          <FontAwesomeIcon icon={r.approved ? faCheckCircle : faClock} />
          {r.approved ? "Approved" : "Pending"}
        </span>
      </div>

      {/* ── Stars banner ── */}
      <div className="arv__stars-row">
        <StarRow rating={r.rating} size={16} />
        <span className="arv__rating-num">{r.rating}.0</span>
      </div>

      {/* ── Body: comment + meta ── */}
      <div className="arv__card-body">
        {r.comment ? (
          <p className="arv__comment">"{r.comment}"</p>
        ) : (
          <p className="arv__comment-empty">No comment provided.</p>
        )}
        <div className="arv__meta">
          <span className="arv__meta-item">
            <FontAwesomeIcon icon={faCalendar} />
            {new Date(r.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
          <span className="arv__meta-item">
            <FontAwesomeIcon icon={faClock} />
            {new Date(r.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      {/* ── Footer: action buttons ── */}
      <div className="arv__card-foot">
        {!r.approved ? (
          <button
            className="arv__btn-approve"
            onClick={() => onStatusChange(r.id, true)}>
            <FontAwesomeIcon icon={faCheckCircle} /> Approve Review
          </button>
        ) : (
          <button
            className="arv__btn-reject"
            onClick={() => onStatusChange(r.id, false)}>
            <FontAwesomeIcon icon={faTimesCircle} /> Reject Review
          </button>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   LIST ROW
   ============================================================ */
function ListRow({ review: r, onStatusChange }) {
  const statusCls = r.approved ? "is-approved" : "is-pending";

  return (
    <div className={`arv__lrow ${statusCls}`}>
      <div className="arv__lrow-inner">
        {/* product */}
        <div className="arv__lrow-product">
          <div className="arv__lrow-product-icon">
            <FontAwesomeIcon icon={faBox} />
          </div>
          <span className="arv__lrow-product-name" title={r.productName}>
            {r.productName}
          </span>
        </div>

        {/* stars */}
        <div className="arv__lrow-stars">
          <StarRow rating={r.rating} size={12} />
        </div>

        {/* status */}
        <div className="arv__lrow-status">
          <span className={`arv__badge ${r.approved ? "approved" : "pending"}`}>
            <FontAwesomeIcon icon={r.approved ? faCheckCircle : faClock} />
            {r.approved ? "Approved" : "Pending"}
          </span>
        </div>

        {/* comment */}
        <div className="arv__lrow-comment">
          {r.comment ? `"${r.comment}"` : "—"}
        </div>

        {/* date */}
        <div className="arv__lrow-date">
          {new Date(r.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </div>

        {/* actions */}
        <div className="arv__lrow-actions">
          {!r.approved ? (
            <button
              className="arv__lrow-approve"
              onClick={() => onStatusChange(r.id, true)}>
              <FontAwesomeIcon icon={faCheckCircle} /> Approve
            </button>
          ) : (
            <button
              className="arv__lrow-reject"
              onClick={() => onStatusChange(r.id, false)}>
              <FontAwesomeIcon icon={faTimesCircle} /> Reject
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
