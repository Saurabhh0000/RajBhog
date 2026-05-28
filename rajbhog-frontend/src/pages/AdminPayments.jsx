// src/pages/AdminPayments.jsx
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  fetchAllPayments,
  updatePaymentStatus,
} from "../api/admin/adminPaymentApi";

import "../styles/AdminPayments.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCreditCard,
  faSearch,
  faFilter,
  faIndianRupeeSign,
  faCheckCircle,
  faClock,
  faTimesCircle,
  faHashtag,
  faReceipt,
  faThLarge,
  faList,
  faTimes,
  faMobileAlt,
  faCalendar,
} from "@fortawesome/free-solid-svg-icons";

/* ============================================================
   STATUS CONFIG
   ============================================================ */
const STATUS_CFG = {
  PAID: { icon: faCheckCircle, cls: "paid", label: "Paid" },
  PENDING: { icon: faClock, cls: "pending", label: "Pending" },
  REFUNDED: { icon: faTimesCircle, cls: "refunded", label: "Refunded" },
};

/* payment method → css class */
function methodClass(method = "") {
  const m = method.toUpperCase();
  if (m === "UPI") return "upi";
  if (m === "CARD") return "card";
  if (m === "COD") return "cod";
  if (m === "NET_BANKING") return "net-banking";
  return "default";
}

/* ============================================================
   MAIN COMPONENT — all backend logic unchanged
   ============================================================ */
export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("grid");

  const loadPayments = () => {
    setLoading(true);
    fetchAllPayments()
      .then((res) => setPayments(res.data))
      .catch(() => toast.error("Failed to load payments"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPayments();
  }, []);

  /* ---- filter ---- */
  const filtered = useMemo(() => {
    return payments.filter((p) => {
      const matchSearch =
        p.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        (p.transactionId || "").toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "ALL" || p.paymentStatus === statusFilter;
      const matchMethod =
        methodFilter === "ALL" || p.paymentMethod === methodFilter;
      return matchSearch && matchStatus && matchMethod;
    });
  }, [payments, search, statusFilter, methodFilter]);

  /* ---- stats ---- */
  const stats = {
    total: payments.length,
    paid: payments.filter((p) => p.paymentStatus === "PAID").length,
    pending: payments.filter((p) => p.paymentStatus === "PENDING").length,
    refunded: payments.filter((p) => p.paymentStatus === "REFUNDED").length,
  };

  const changeStatus = (orderNumber, status) => {
    updatePaymentStatus(orderNumber, status)
      .then(() => {
        toast.success("Payment status updated");
        loadPayments();
      })
      .catch((e) =>
        toast.error(e?.response?.data?.message || "Action not allowed"),
      );
  };

  /* ============================================================ */

  return (
    <div className="apay__wrapper">
      <div className="apay__container">
        {/* ── Header ── */}
        <div className="apay__header">
          <div className="apay__header-left">
            <div className="apay__header-icon">
              <FontAwesomeIcon icon={faCreditCard} />
            </div>
            <div>
              <h1 className="apay__title">Payment Management</h1>
              <p className="apay__subtitle">
                Track and manage all payment transactions
              </p>
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="apay__stats">
          <div className="apay__stat apay__stat--total">
            <div className="apay__stat-icon">
              <FontAwesomeIcon icon={faCreditCard} />
            </div>
            <div className="apay__stat-info">
              <span className="apay__stat-label">Total</span>
              <strong className="apay__stat-value">{stats.total}</strong>
            </div>
          </div>
          <div className="apay__stat apay__stat--paid">
            <div className="apay__stat-icon">
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
            <div className="apay__stat-info">
              <span className="apay__stat-label">Paid</span>
              <strong className="apay__stat-value">{stats.paid}</strong>
            </div>
          </div>
          <div className="apay__stat apay__stat--pending">
            <div className="apay__stat-icon">
              <FontAwesomeIcon icon={faClock} />
            </div>
            <div className="apay__stat-info">
              <span className="apay__stat-label">Pending</span>
              <strong className="apay__stat-value">{stats.pending}</strong>
            </div>
          </div>
          <div className="apay__stat apay__stat--refunded">
            <div className="apay__stat-icon">
              <FontAwesomeIcon icon={faTimesCircle} />
            </div>
            <div className="apay__stat-info">
              <span className="apay__stat-label">Refunded</span>
              <strong className="apay__stat-value">{stats.refunded}</strong>
            </div>
          </div>
        </div>

        {/* ── Controls ── */}
        <div className="apay__controls">
          {/* search */}
          <div className="apay__search">
            <span className="apay__search-ico">
              <FontAwesomeIcon icon={faSearch} />
            </span>
            <input
              type="text"
              className="apay__search-input"
              placeholder="Search by order number or transaction ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="apay__search-clear"
                onClick={() => setSearch("")}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>

          <div className="apay__ctrl-divider" />

          {/* status filter tabs */}
          <div className="apay__filter-tabs">
            <button
              className={`apay__filter-tab t--all ${statusFilter === "ALL" ? "t--active" : ""}`}
              onClick={() => setStatusFilter("ALL")}>
              <FontAwesomeIcon icon={faFilter} />
              <span>All</span>
            </button>
            <button
              className={`apay__filter-tab t--paid ${statusFilter === "PAID" ? "t--active" : ""}`}
              onClick={() => setStatusFilter("PAID")}>
              <FontAwesomeIcon icon={faCheckCircle} />
              <span>Paid</span>
            </button>
            <button
              className={`apay__filter-tab t--pending ${statusFilter === "PENDING" ? "t--active" : ""}`}
              onClick={() => setStatusFilter("PENDING")}>
              <FontAwesomeIcon icon={faClock} />
              <span>Pending</span>
            </button>
            <button
              className={`apay__filter-tab t--refunded ${statusFilter === "REFUNDED" ? "t--active" : ""}`}
              onClick={() => setStatusFilter("REFUNDED")}>
              <FontAwesomeIcon icon={faTimesCircle} />
              <span>Refunded</span>
            </button>
          </div>

          <div className="apay__ctrl-divider" />

          {/* method filter */}
          <div className="apay__method-wrap">
            <span className="apay__method-ico">
              <FontAwesomeIcon icon={faMobileAlt} />
            </span>
            <select
              className="apay__method-sel"
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}>
              <option value="ALL">All Methods</option>
              <option value="UPI">UPI</option>
              <option value="CARD">Card</option>
              <option value="COD">COD</option>
              <option value="NET_BANKING">Net Banking</option>
            </select>
          </div>

          <div className="apay__ctrl-divider" />

          {/* view toggle */}
          <div className="apay__view-toggle">
            <button
              className={`apay__view-btn ${viewMode === "grid" ? "apay__view-btn--on" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Grid view">
              <FontAwesomeIcon icon={faThLarge} />
            </button>
            <button
              className={`apay__view-btn ${viewMode === "list" ? "apay__view-btn--on" : ""}`}
              onClick={() => setViewMode("list")}
              title="List view">
              <FontAwesomeIcon icon={faList} />
            </button>
          </div>
        </div>

        {/* ── Results bar ── */}
        {!loading && (
          <div className="apay__results-bar">
            <span className="apay__results-count">
              Showing <strong>{filtered.length}</strong> of {payments.length}{" "}
              payments
            </span>
          </div>
        )}

        {/* ── Content ── */}
        {loading ? (
          <div className="apay__loading">
            <div className="apay__spinner" />
            <p>Loading payments…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="apay__empty">
            <div className="apay__empty-icon">
              <FontAwesomeIcon icon={faCreditCard} />
            </div>
            <h3>No Payments Found</h3>
            <p>
              {search || statusFilter !== "ALL" || methodFilter !== "ALL"
                ? "Try adjusting your filters or search."
                : "All payment records will appear here."}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="apay__grid">
            {filtered.map((p) => (
              <PaymentCard
                key={p.orderNumber}
                payment={p}
                onStatusChange={changeStatus}
              />
            ))}
          </div>
        ) : (
          /* List — scrollable table on desktop, stacked cards on mobile */
          <div className="apay__list-panel">
            {/* Desktop table */}
            <div className="apay__table-scroll">
              <table className="apay__table">
                <thead>
                  <tr>
                    <th>
                      <FontAwesomeIcon icon={faHashtag} /> Order No.
                    </th>
                    <th>
                      <FontAwesomeIcon icon={faIndianRupeeSign} /> Amount
                    </th>
                    <th>
                      <FontAwesomeIcon icon={faMobileAlt} /> Method
                    </th>
                    <th>
                      <FontAwesomeIcon icon={faFilter} /> Status
                    </th>
                    <th>
                      <FontAwesomeIcon icon={faReceipt} /> Transaction ID
                    </th>
                    <th>
                      <FontAwesomeIcon icon={faCalendar} /> Date
                    </th>
                    <th>Update</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <TableRow
                      key={p.orderNumber}
                      payment={p}
                      onStatusChange={changeStatus}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: stacked cards */}
            <div className="apay__mobile-cards">
              {filtered.map((p) => (
                <PaymentCard
                  key={p.orderNumber}
                  payment={p}
                  onStatusChange={changeStatus}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   PAYMENT CARD (grid)
   ============================================================ */
function PaymentCard({ payment: p, onStatusChange }) {
  const cfg = STATUS_CFG[p.paymentStatus] || STATUS_CFG.PENDING;
  const mCls = methodClass(p.paymentMethod);
  const isLocked = p.paymentStatus === "REFUNDED";

  return (
    <div className={`apay__card s-${cfg.cls}`}>
      {/* head: order number + status badge */}
      <div className="apay__card-head">
        <div className="apay__card-order">
          <FontAwesomeIcon icon={faHashtag} />
          {p.orderNumber}
        </div>
        <span className={`apay__status-badge ${cfg.cls}`}>
          <FontAwesomeIcon icon={cfg.icon} />
          {cfg.label}
        </span>
      </div>

      {/* amount banner */}
      <div className="apay__amount-banner">
        <div className="apay__amount-icon">
          <FontAwesomeIcon icon={faIndianRupeeSign} />
        </div>
        <div className="apay__amount-text">
          <span className="apay__amount-lbl">Amount</span>
          <span className="apay__amount-val">
            ₹{Number(p.amount).toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* body: method, txn id, date */}
      <div className="apay__card-body">
        {/* payment method */}
        <div className="apay__detail-row">
          <FontAwesomeIcon icon={faMobileAlt} />
          <div className="apay__detail-row-text">
            <span className="apay__detail-lbl">Method</span>
            <span className={`apay__method-pill ${mCls}`}>
              {p.paymentMethod || "—"}
            </span>
          </div>
        </div>

        {/* transaction ID */}
        <div className="apay__detail-row">
          <FontAwesomeIcon icon={faReceipt} />
          <div className="apay__detail-row-text">
            <span className="apay__detail-lbl">Transaction ID</span>
            <span className="apay__txn-id">{p.transactionId || "—"}</span>
          </div>
        </div>

        {/* date */}
        <div className="apay__detail-row">
          <FontAwesomeIcon icon={faCalendar} />
          <div className="apay__detail-row-text">
            <span className="apay__detail-lbl">Date & Time</span>
            <span className="apay__detail-val">
              {new Date(p.createdAt).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* footer: status update select */}
      <div className="apay__card-foot">
        <select
          className="apay__status-sel"
          disabled={isLocked}
          value={p.paymentStatus}
          onChange={(e) => onStatusChange(p.orderNumber, e.target.value)}>
          <option value="PAID">Paid</option>
          <option value="PENDING">Pending</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>
    </div>
  );
}

/* ============================================================
   TABLE ROW (list view)
   ============================================================ */
function TableRow({ payment: p, onStatusChange }) {
  const cfg = STATUS_CFG[p.paymentStatus] || STATUS_CFG.PENDING;
  const mCls = methodClass(p.paymentMethod);
  const isLocked = p.paymentStatus === "REFUNDED";

  return (
    <tr className={`apay__tr apay__tr--${cfg.cls}`}>
      {/* order no */}
      <td>
        <div className="apay__td-order">
          <span className="apay__td-hash">#</span>
          {p.orderNumber}
        </div>
      </td>

      {/* amount */}
      <td>
        <span className="apay__td-amount">
          ₹{Number(p.amount).toLocaleString("en-IN")}
        </span>
      </td>

      {/* method */}
      <td>
        <span className={`apay__method-pill ${mCls}`}>
          {p.paymentMethod || "—"}
        </span>
      </td>

      {/* status */}
      <td>
        <span className={`apay__status-badge ${cfg.cls}`}>
          <FontAwesomeIcon icon={cfg.icon} />
          {cfg.label}
        </span>
      </td>

      {/* transaction id */}
      <td>
        <span className="apay__td-txn">{p.transactionId || "—"}</span>
      </td>

      {/* date */}
      <td>
        <span className="apay__td-date">
          {new Date(p.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      </td>

      {/* update select */}
      <td>
        <select
          className="apay__td-sel"
          disabled={isLocked}
          value={p.paymentStatus}
          onChange={(e) => onStatusChange(p.orderNumber, e.target.value)}>
          <option value="PAID">Paid</option>
          <option value="PENDING">Pending</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </td>
    </tr>
  );
}
