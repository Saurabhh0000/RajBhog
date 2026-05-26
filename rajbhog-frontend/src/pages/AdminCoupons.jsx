import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  fetchCoupons,
  createCoupon,
  updateCoupon,
  toggleCouponStatus,
} from "../api/admin/adminCouponApi";

import "../styles/AdminCoupons.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTicket,
  faPlus,
  faSearch,
  faPercent,
  faIndianRupeeSign,
  faToggleOn,
  faToggleOff,
  faCalendarXmark,
  faEdit,
  faTimes,
  faCheck,
  faTag,
  faUsers,
  faClock,
  faFilter,
  faCheckCircle,
  faBan,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

/* ============================================================
   MAIN COMPONENT — backend logic unchanged
   ============================================================ */
export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    code: "",
    discountType: "PERCENT",
    discountValue: 0,
    minOrderAmount: 0,
    expiryAt: "",
    maxUsage: 1,
    isActive: true,

    showBanner: false,
    bannerText: "",
    userType: "ALL",
  });

  const loadCoupons = () => {
    setLoading(true);
    fetchCoupons()
      .then((res) => setCoupons(res.data))
      .catch(() => toast.error("Failed to load coupons"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  /* ---- filter ---- */
  const filtered = useMemo(() => {
    return coupons.filter((c) => {
      const matchSearch = c.code.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && c.isActive) ||
        (statusFilter === "INACTIVE" && !c.isActive);
      const matchType = typeFilter === "ALL" || c.discountType === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [coupons, search, statusFilter, typeFilter]);

  /* ---- stats ---- */
  const stats = {
    total: coupons.length,
    active: coupons.filter((c) => c.isActive).length,
    expired: coupons.filter(
      (c) => c.expiryAt && new Date(c.expiryAt) < new Date(),
    ).length,
    totalUsage: coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0),
  };

  /* ---- form ---- */
  const resetForm = () => {
    setForm({
      code: "",
      discountType: "PERCENT",
      discountValue: 0,
      minOrderAmount: 0,
      expiryAt: "",
      maxUsage: 1,
      isActive: true,

      showBanner: false,
      bannerText: "",
      userType: "ALL",
    });
    setEditing(null);
    setShowForm(false);
  };

  const submitForm = () => {
    if (form.showBanner && !form.bannerText.trim()) {
      toast.error("Banner text is required when banner is enabled");
      return;
    }
    const api = editing ? updateCoupon(editing.id, form) : createCoupon(form);

    api
      .then(() => {
        toast.success(`Coupon ${editing ? "updated" : "created"} successfully`);
        resetForm();
        loadCoupons();
      })
      .catch((e) => toast.error(e?.response?.data?.message || "Action failed"));
  };

  const handleToggle = (coupon) => {
    toggleCouponStatus(coupon.id)
      .then(() => {
        toast.success(
          `Coupon ${coupon.isActive ? "deactivated" : "activated"}`,
        );
        loadCoupons();
      })
      .catch(() => toast.error("Action failed"));
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      ...c,
      expiryAt: c.expiryAt ? c.expiryAt.slice(0, 16) : "",
      showBanner: c.showBanner ?? false,
      bannerText: c.bannerText ?? "",
      userType: c.userType ?? "ALL",
    });
    setShowForm(true);
  };

  /* ============================================================ */

  return (
    <div className="acp__wrapper">
      <div className="acp__container">
        {/* ── Header ── */}
        <div className="acp__header">
          <div className="acp__header-left">
            <div className="acp__header-icon">
              <FontAwesomeIcon icon={faTicket} />
            </div>
            <div>
              <h1 className="acp__title">Coupon Management</h1>
              <p className="acp__subtitle">
                Create and manage discount coupons
              </p>
            </div>
          </div>
          <button className="acp__btn-create" onClick={() => setShowForm(true)}>
            <FontAwesomeIcon icon={faPlus} />
            <span>Create Coupon</span>
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="acp__stats">
          <div className="acp__stat acp__stat--indigo">
            <div className="acp__stat-icon">
              <FontAwesomeIcon icon={faTag} />
            </div>
            <div className="acp__stat-body">
              <span className="acp__stat-label">Total</span>
              <strong className="acp__stat-value">{stats.total}</strong>
            </div>
          </div>
          <div className="acp__stat acp__stat--green">
            <div className="acp__stat-icon">
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
            <div className="acp__stat-body">
              <span className="acp__stat-label">Active</span>
              <strong className="acp__stat-value">{stats.active}</strong>
            </div>
          </div>
          <div className="acp__stat acp__stat--red">
            <div className="acp__stat-icon">
              <FontAwesomeIcon icon={faClock} />
            </div>
            <div className="acp__stat-body">
              <span className="acp__stat-label">Expired</span>
              <strong className="acp__stat-value">{stats.expired}</strong>
            </div>
          </div>
          <div className="acp__stat acp__stat--amber">
            <div className="acp__stat-icon">
              <FontAwesomeIcon icon={faUsers} />
            </div>
            <div className="acp__stat-body">
              <span className="acp__stat-label">Total Usage</span>
              <strong className="acp__stat-value">{stats.totalUsage}</strong>
            </div>
          </div>
        </div>

        {/* ── Controls ── */}
        <div className="acp__controls">
          {/* search */}
          <div className="acp__search">
            <span className="acp__search-ico">
              <FontAwesomeIcon icon={faSearch} />
            </span>
            <input
              type="text"
              className="acp__search-input"
              placeholder="Search by coupon code…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="acp__search-clear"
                onClick={() => setSearch("")}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>

          <div className="acp__ctrl-divider" />

          {/* status filter tabs */}
          <div className="acp__filter-tabs">
            <button
              className={`acp__filter-tab t--all ${statusFilter === "ALL" ? "t--active" : ""}`}
              onClick={() => setStatusFilter("ALL")}>
              <FontAwesomeIcon icon={faFilter} />
              <span>All</span>
            </button>
            <button
              className={`acp__filter-tab t--active-s ${statusFilter === "ACTIVE" ? "t--active" : ""}`}
              onClick={() => setStatusFilter("ACTIVE")}>
              <FontAwesomeIcon icon={faCheckCircle} />
              <span>Active</span>
            </button>
            <button
              className={`acp__filter-tab t--inactive ${statusFilter === "INACTIVE" ? "t--active" : ""}`}
              onClick={() => setStatusFilter("INACTIVE")}>
              <FontAwesomeIcon icon={faBan} />
              <span>Inactive</span>
            </button>
          </div>

          <div className="acp__ctrl-divider" />

          {/* type filter tabs */}
          <div className="acp__filter-tabs">
            <button
              className={`acp__filter-tab t--all ${typeFilter === "ALL" ? "t--active" : ""}`}
              onClick={() => setTypeFilter("ALL")}>
              <span>All Types</span>
            </button>
            <button
              className={`acp__filter-tab t--pct ${typeFilter === "PERCENT" ? "t--active" : ""}`}
              onClick={() => setTypeFilter("PERCENT")}>
              <FontAwesomeIcon icon={faPercent} />
              <span>%</span>
            </button>
            <button
              className={`acp__filter-tab t--flat ${typeFilter === "FLAT" ? "t--active" : ""}`}
              onClick={() => setTypeFilter("FLAT")}>
              <FontAwesomeIcon icon={faIndianRupeeSign} />
              <span>Flat</span>
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="acp__loading">
            <div className="acp__spinner" />
            <p>Loading coupons…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="acp__empty">
            <div className="acp__empty-icon">
              <FontAwesomeIcon icon={faTicket} />
            </div>
            <h3 className="acp__empty-title">No Coupons Found</h3>
            <p className="acp__empty-desc">
              {search || statusFilter !== "ALL" || typeFilter !== "ALL"
                ? "Try adjusting your filters or search."
                : "Create your first coupon to offer discounts."}
            </p>
            {!search && statusFilter === "ALL" && typeFilter === "ALL" && (
              <button
                className="acp__btn-create-first"
                onClick={() => setShowForm(true)}>
                <FontAwesomeIcon icon={faPlus} /> Create First Coupon
              </button>
            )}
          </div>
        ) : (
          <div className="acp__grid">
            {filtered.map((c) => (
              <CouponCard
                key={c.id}
                coupon={c}
                onEdit={() => openEdit(c)}
                onToggle={() => handleToggle(c)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {showForm && (
        <div className="acp__modal-backdrop" onClick={resetForm}>
          <div className="acp__modal" onClick={(e) => e.stopPropagation()}>
            {/* header */}
            <div className="acp__modal-header">
              <div className="acp__modal-title">
                <div className="acp__modal-title-icon">
                  <FontAwesomeIcon icon={editing ? faEdit : faPlus} />
                </div>
                <h3>{editing ? "Edit Coupon" : "Create New Coupon"}</h3>
              </div>
              <button className="acp__modal-close" onClick={resetForm}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            {/* body */}
            <div className="acp__modal-body">
              {/* Coupon Code */}
              <div className="acp__field">
                <label className="acp__label">
                  <FontAwesomeIcon icon={faTag} /> Coupon Code
                </label>
                <input
                  type="text"
                  className="acp__input acp__input--code"
                  placeholder="e.g. SAVE20"
                  value={form.code}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value.toUpperCase() })
                  }
                />
              </div>

              {/* Discount Type + Value */}
              <div className="acp__field-row">
                <div className="acp__field">
                  <label className="acp__label">
                    <FontAwesomeIcon icon={faPercent} /> Discount Type
                  </label>
                  <select
                    className="acp__select"
                    value={form.discountType}
                    onChange={(e) =>
                      setForm({ ...form, discountType: e.target.value })
                    }>
                    <option value="PERCENT">Percentage</option>
                    <option value="FLAT">Flat Amount</option>
                  </select>
                </div>
                <div className="acp__field">
                  <label className="acp__label">
                    <FontAwesomeIcon icon={faIndianRupeeSign} /> Discount Value
                  </label>
                  <input
                    type="number"
                    className="acp__input"
                    placeholder="e.g. 20"
                    value={form.discountValue}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        discountValue: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              {/* Min Order + Max Usage */}
              <div className="acp__field-row">
                <div className="acp__field">
                  <label className="acp__label">
                    <FontAwesomeIcon icon={faIndianRupeeSign} /> Min Order
                    Amount
                  </label>
                  <input
                    type="number"
                    className="acp__input"
                    placeholder="e.g. 500"
                    value={form.minOrderAmount}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        minOrderAmount: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="acp__field">
                  <label className="acp__label">
                    <FontAwesomeIcon icon={faUsers} /> Max Usage
                  </label>
                  <input
                    type="number"
                    className="acp__input"
                    placeholder="e.g. 100"
                    value={form.maxUsage}
                    onChange={(e) =>
                      setForm({ ...form, maxUsage: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              {/* Expiry */}
              <div className="acp__field">
                <label className="acp__label">
                  <FontAwesomeIcon icon={faCalendarXmark} /> Expiry Date & Time
                </label>
                <input
                  type="datetime-local"
                  className="acp__input"
                  value={form.expiryAt}
                  onChange={(e) =>
                    setForm({ ...form, expiryAt: e.target.value })
                  }
                />
              </div>

              {/* Banner Toggle */}
              <div className="acp__field">
                <label className="acp__label">Show Banner</label>
                <select
                  className="acp__select"
                  value={form.showBanner}
                  onChange={(e) =>
                    setForm({ ...form, showBanner: e.target.value === "true" })
                  }>
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>

              {/* Banner Text */}
              <div className="acp__field">
                <label className="acp__label">Banner Text</label>
                <input
                  type="text"
                  className="acp__input"
                  placeholder="e.g. Get ₹100 OFF on orders above ₹500"
                  value={form.bannerText}
                  onChange={(e) =>
                    setForm({ ...form, bannerText: e.target.value })
                  }
                />
              </div>

              {/* User Type */}
              <div className="acp__field">
                <label className="acp__label">User Type</label>
                <select
                  className="acp__select"
                  value={form.userType}
                  onChange={(e) =>
                    setForm({ ...form, userType: e.target.value })
                  }>
                  <option value="ALL">All Users</option>
                  <option value="NEW_USER">New Users</option>
                  <option value="RETURNING">Returning Users</option>
                  <option value="PREMIUM">Premium Users</option>
                </select>
              </div>
            </div>

            {/* footer */}
            <div className="acp__modal-footer">
              <button className="acp__btn-cancel" onClick={resetForm}>
                Cancel
              </button>
              <button className="acp__btn-save" onClick={submitForm}>
                <FontAwesomeIcon icon={faCheck} />
                {editing ? "Update Coupon" : "Create Coupon"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   COUPON CARD
   ============================================================ */
function CouponCard({ coupon: c, onEdit, onToggle }) {
  const isExpired = new Date(c.expiryAt) < new Date();
  const usagePct = c.maxUsage > 0 ? (c.usedCount / c.maxUsage) * 100 : 0;
  const isPct = c.discountType === "PERCENT";

  const cardMod = isExpired
    ? "acp__card--expired"
    : c.isActive
      ? "acp__card--active"
      : "acp__card--inactive";

  /* usage bar colour */
  const barColor =
    usagePct >= 100 ? "#dc2626" : usagePct >= 75 ? "#f59e0b" : "#059669";

  return (
    <div className={`acp__card ${cardMod}`}>
      {/* ── Head: code + badges ── */}
      <div className="acp__card-head">
        <div className="acp__card-code-wrap">
          <div className="acp__code-icon">
            <FontAwesomeIcon icon={faTicket} />
          </div>
          <span className="acp__code">{c.code}</span>
        </div>
        <div className="acp__card-badges">
          {isExpired && (
            <span className="acp__badge acp__badge--expired">
              <FontAwesomeIcon icon={faClock} /> Expired
            </span>
          )}
          <span
            className={`acp__badge ${c.isActive ? "acp__badge--active" : "acp__badge--inactive"}`}>
            {c.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* ── Discount banner ── */}
      <div className="acp__discount-banner">
        <div className={`acp__discount-icon ${isPct ? "pct" : "flat"}`}>
          <FontAwesomeIcon icon={isPct ? faPercent : faIndianRupeeSign} />
        </div>
        <div className="acp__discount-text">
          <span className="acp__discount-value">
            {isPct ? `${c.discountValue}%` : `₹${c.discountValue}`}
          </span>
          <span className="acp__discount-label">
            {isPct ? "Percentage Off" : "Flat Discount"}
          </span>
        </div>
      </div>

      {/* ── Details ── */}
      <div className="acp__card-details">
        <div className="acp__detail-row">
          <FontAwesomeIcon icon={faIndianRupeeSign} />
          Min Order: ₹{c.minOrderAmount}
        </div>
        <div className="acp__detail-row">
          <FontAwesomeIcon icon={faCalendarXmark} />
          Expires:{" "}
          {new Date(c.expiryAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </div>
      </div>

      {/* ── Usage bar ── */}
      <div className="acp__usage">
        <div className="acp__usage-head">
          <span className="acp__usage-lbl">Usage</span>
          <span className="acp__usage-count">
            {c.usedCount} / {c.maxUsage}
          </span>
        </div>
        <div className="acp__usage-bar">
          <div
            className="acp__usage-fill"
            style={{
              width: `${Math.min(usagePct, 100)}%`,
              background: barColor,
            }}
          />
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="acp__card-foot">
        <button className="acp__btn-edit" onClick={onEdit}>
          <FontAwesomeIcon icon={faEdit} /> Edit
        </button>
        <button
          className={`acp__btn-toggle ${c.isActive ? "on" : "off"}`}
          onClick={onToggle}>
          <FontAwesomeIcon icon={c.isActive ? faToggleOn : faToggleOff} />
          {c.isActive ? "Deactivate" : "Activate"}
        </button>
      </div>
    </div>
  );
}
