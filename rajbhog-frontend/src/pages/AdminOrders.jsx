// src/pages/AdminOrders.jsx
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  fetchAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
} from "../api/admin/adminOrderApi";

import "../styles/AdminOrders.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faSearch,
  faFilter,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faCreditCard,
  faIndianRupeeSign,
  faClipboardCheck,
  faChartLine,
  faBoxOpen,
  faSyncAlt,
  faTableCells,
  faList,
  faXmark,
  faHashtag,
  faTruck,
  faAt,
} from "@fortawesome/free-solid-svg-icons";

/* ── STATUS CONFIG ── */
const OS_CFG = {
  PLACED: { label: "Placed", icon: faClock, cls: "s-placed" },
  CONFIRMED: { label: "Confirmed", icon: faClipboardCheck, cls: "s-confirmed" },
  PACKED: { label: "Packed", icon: faBox, cls: "s-packed" },
  OUT_FOR_DELIVERY: {
    label: "Out for delivery",
    icon: faTruck,
    cls: "s-out_for_delivery",
  },
  DELIVERED: { label: "Delivered", icon: faCheckCircle, cls: "s-delivered" },

  CANCELLED: { label: "Cancelled", icon: faTimesCircle, cls: "s-cancelled" },

  // 🔥 ADD THESE
  RETURN_REQUESTED: {
    label: "Return Requested",
    icon: faSyncAlt,
    cls: "s-return_requested",
  },
  RETURN_APPROVED: {
    label: "Return Approved",
    icon: faCheckCircle,
    cls: "s-return_approved",
  },
  RETURN_REJECTED: {
    label: "Return Rejected",
    icon: faTimesCircle,
    cls: "s-return_rejected",
  },
};

const PAY_CFG = {
  PENDING: { cls: "pending" },
  PAID: { cls: "paid" },
  REFUNDED: { cls: "refunded" },
};

/* ── GRID CARD ── */
function OrderCard({ order: o, onOrderStatusChange, onPaymentStatusChange }) {
  const osCfg = OS_CFG[o.orderStatus] || OS_CFG.PLACED;
  const payCfg = PAY_CFG[o.paymentStatus] || PAY_CFG.PENDING;
  const nextPay = o.paymentStatus === "PAID" ? "REFUNDED" : "PAID";
  const payBtnLabel = o.paymentStatus === "PAID" ? "Refund" : "Mark Paid";

  return (
    <div className={`aor-card ${osCfg.cls}`}>
      {/* head — gradient bg + order number + status pill */}
      <div className={`aor-card-head aor-card-head--${osCfg.cls}`}>
        <div className="aor-order-num">
          <FontAwesomeIcon icon={faHashtag} />
          {o.orderNumber}
        </div>
        <span className={`aor-pill aor-pill--${osCfg.cls}`}>
          <FontAwesomeIcon icon={osCfg.icon} />
          {osCfg.label}
        </span>
      </div>

      {/* body */}
      <div className="aor-card-body">
        <div className="aor-info-row">
          <div className="aor-info-icon">
            <FontAwesomeIcon icon={faAt} />
          </div>
          <div className="aor-info-text">
            <span className="aor-info-label">Customer</span>
            <span className="aor-info-value">{o.customerEmail}</span>
          </div>
        </div>

        <div className="aor-info-row">
          <div className="aor-info-icon">
            <FontAwesomeIcon icon={faIndianRupeeSign} />
          </div>
          <div className="aor-info-text">
            <span className="aor-info-label">Amount</span>
            <span className="aor-info-value aor-info-value--amt">
              ₹{Number(o.finalAmount).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        <div className="aor-info-row">
          <div className="aor-info-icon">
            <FontAwesomeIcon icon={faCreditCard} />
          </div>
          <div className="aor-info-text">
            <span className="aor-info-label">Payment</span>
            <span className={`aor-pay-pill aor-pay-pill--${payCfg.cls}`}>
              {o.paymentStatus}
            </span>
          </div>
        </div>
      </div>

      {/* footer */}
      <div className="aor-card-foot">
        <select
          className="aor-order-sel"
          value={o.orderStatus}
          onChange={(e) => onOrderStatusChange(o.orderNumber, e.target.value)}>
          <option value="PLACED">Placed</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PACKED">Packed</option>
          <option value="OUT_FOR_DELIVERY">Out For Delivery</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="RETURN_REQUESTED">Return Requested</option>
          <option value="RETURN_APPROVED">Return Approved</option>
          <option value="RETURN_REJECTED">Return Rejected</option>
        </select>
        {o.orderStatus === "RETURN_REQUESTED" && (
          <div className="aor-return-actions">
            <button
              className="aor-approve-btn"
              onClick={() =>
                onOrderStatusChange(o.orderNumber, "RETURN_APPROVED")
              }>
              Approve
            </button>

            <button
              className="aor-reject-btn"
              onClick={() =>
                onOrderStatusChange(o.orderNumber, "RETURN_REJECTED")
              }>
              Reject
            </button>
          </div>
        )}
        <button
          className={`aor-pay-btn aor-pay-btn--${payCfg.cls}`}
          onClick={() => onPaymentStatusChange(o.orderNumber, nextPay)}>
          <FontAwesomeIcon icon={faCreditCard} />
          {payBtnLabel}
        </button>
      </div>
    </div>
  );
}

/* ── TABLE ROW ── */
function TableRow({ order: o, onOrderStatusChange, onPaymentStatusChange }) {
  const osCfg = OS_CFG[o.orderStatus] || OS_CFG.PLACED;
  const payCfg = PAY_CFG[o.paymentStatus] || PAY_CFG.PENDING;
  const nextPay = o.paymentStatus === "PAID" ? "REFUNDED" : "PAID";
  const payBtnLabel = o.paymentStatus === "PAID" ? "Refund" : "Mark Paid";

  return (
    <tr className={`aor-tr aor-tr--${osCfg.cls}`}>
      {/* Order No — full, no truncation */}
      <td>
        <div className="aor-td-order">
          <FontAwesomeIcon icon={faHashtag} className="aor-td-hash" />
          <span className="aor-td-ordernum">{o.orderNumber}</span>
        </div>
      </td>

      {/* Customer email */}
      <td>
        <div className="aor-td-email">
          <FontAwesomeIcon icon={faAt} className="aor-td-ico" />
          <span>{o.customerEmail}</span>
        </div>
      </td>

      {/* Amount */}
      <td>
        <span className="aor-td-amt">
          ₹{Number(o.finalAmount).toLocaleString("en-IN")}
        </span>
      </td>

      {/* Status pill */}
      <td>
        <span className={`aor-pill aor-pill--${osCfg.cls}`}>
          <FontAwesomeIcon icon={osCfg.icon} />
          {osCfg.label}
        </span>
      </td>

      {/* Update order status */}
      <td>
        <select
          className="aor-order-sel"
          value={o.orderStatus}
          onChange={(e) => onOrderStatusChange(o.orderNumber, e.target.value)}>
          <option value="PLACED">Placed</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PACKED">Packed</option>
          <option value="OUT_FOR_DELIVERY">Out For Delivery</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="RETURN_REQUESTED">Return Requested</option>
          <option value="RETURN_APPROVED">Return Approved</option>
          <option value="RETURN_REJECTED">Return Rejected</option>
        </select>
      </td>

      <td>
        {o.orderStatus === "RETURN_REQUESTED" && (
          <div className="aor-return-actions">
            <button
              className="aor-approve-btn"
              onClick={() =>
                onOrderStatusChange(o.orderNumber, "RETURN_APPROVED")
              }>
              Approve
            </button>

            <button
              className="aor-reject-btn"
              onClick={() =>
                onOrderStatusChange(o.orderNumber, "RETURN_REJECTED")
              }>
              Reject
            </button>
          </div>
        )}
      </td>

      {/* Payment action */}
      <td>
        <button
          className={`aor-pay-btn aor-pay-btn--${payCfg.cls}`}
          onClick={() => onPaymentStatusChange(o.orderNumber, nextPay)}>
          <FontAwesomeIcon icon={faCreditCard} />
          {payBtnLabel}
        </button>
      </td>
    </tr>
  );
}

/* ── MAIN COMPONENT — all logic unchanged ── */
export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("grid");

  const loadOrders = () => {
    setLoading(true);
    fetchAllOrders()
      .then((res) => setOrders(res.data))
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filtered = useMemo(
    () =>
      orders.filter((o) => {
        const matchSearch =
          o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
          o.customerEmail.toLowerCase().includes(search.toLowerCase());
        const matchOrder =
          orderFilter === "ALL" || o.orderStatus === orderFilter;
        const matchPayment =
          paymentFilter === "ALL" || o.paymentStatus === paymentFilter;
        return matchSearch && matchOrder && matchPayment;
      }),
    [orders, search, orderFilter, paymentFilter],
  );

  const stats = {
    total: orders.length,
    placed: orders.filter((o) => o.orderStatus === "PLACED").length,
    confirmed: orders.filter((o) => o.orderStatus === "CONFIRMED").length,
    packed: orders.filter((o) => o.orderStatus === "PACKED").length,
    out_for_delivery: orders.filter((o) => o.orderStatus === "OUT_FOR_DELIVERY")
      .length,
    delivered: orders.filter((o) => o.orderStatus === "DELIVERED").length,
    cancelled: orders.filter((o) => o.orderStatus === "CANCELLED").length,

    // 🔥 ADD THESE
    return_requested: orders.filter((o) => o.orderStatus === "RETURN_REQUESTED")
      .length,
    return_approved: orders.filter((o) => o.orderStatus === "RETURN_APPROVED")
      .length,
    return_rejected: orders.filter((o) => o.orderStatus === "RETURN_REJECTED")
      .length,

    totalRevenue: orders
      .filter((o) => o.orderStatus !== "CANCELLED")
      .reduce((sum, o) => sum + Number(o.finalAmount || 0), 0),
  };

  function changeOrderStatus(orderNumber, status) {
    updateOrderStatus(orderNumber, status)
      .then(() => {
        toast.success("Order status updated");
        loadOrders();
      })
      .catch((e) =>
        toast.error(e?.response?.data?.message || "Action not allowed"),
      );
  }

  function changePaymentStatus(orderNumber, status) {
    updatePaymentStatus(orderNumber, status)
      .then(() => {
        toast.success("Payment status updated");
        loadOrders();
      })
      .catch((e) =>
        toast.error(e?.response?.data?.message || "Action not allowed"),
      );
  }

  const STAT_ROWS = [
    { variant: "total", icon: faChartLine, label: "Total", val: stats.total },
    { variant: "placed", icon: faClock, label: "Placed", val: stats.placed },
    {
      variant: "confirmed",
      icon: faClipboardCheck,
      label: "Confirmed",
      val: stats.confirmed,
    },
    {
      variant: "packed",
      icon: faBox,
      label: "Packed",
      val: stats.packed,
    },
    {
      variant: "out_for_delivery",
      icon: faTruck,
      label: "Out for Delivery",
      val: stats.out_for_delivery,
    },
    {
      variant: "delivered",
      icon: faCheckCircle,
      label: "Delivered",
      val: stats.delivered,
    },
    {
      variant: "cancelled",
      icon: faTimesCircle,
      label: "Cancelled",
      val: stats.cancelled,
    },
    {
      variant: "return_requested",
      icon: faSyncAlt,
      label: "Return Requested",
      val: stats.return_requested,
    },
    {
      variant: "return_approved",
      icon: faCheckCircle,
      label: "Return Approved",
      val: stats.return_approved,
    },
    {
      variant: "return_rejected",
      icon: faTimesCircle,
      label: "Return Rejected",
      val: stats.return_rejected,
    },
  ];

  return (
    <div className="aor-root">
      {/* ── Header ── */}
      <div className="aor-topbar">
        <div className="aor-topbar-left">
          <div className="aor-topbar-icon">
            <FontAwesomeIcon icon={faBox} />
          </div>
          <div>
            <h1 className="aor-page-title">Order Management</h1>
            <p className="aor-page-sub">Track and manage all customer orders</p>
          </div>
        </div>
        <button className="aor-btn-refresh" onClick={loadOrders}>
          <FontAwesomeIcon icon={faSyncAlt} /> Refresh
        </button>
      </div>

      {/* ── Stat cards — same layout as Category Management ── */}
      <div className="aor-stats">
        {STAT_ROWS.map(({ variant, icon, label, val }) => (
          <div key={variant} className={`aor-stat aor-stat--${variant}`}>
            <div className="aor-stat-icon">
              <FontAwesomeIcon icon={icon} />
            </div>
            <div className="aor-stat-info">
              <span className="aor-stat-label">{label}</span>
              <strong className="aor-stat-value">{val}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* ── Revenue banner ── */}
      <div className="aor-revenue">
        <div className="aor-rev-icon">
          <FontAwesomeIcon icon={faIndianRupeeSign} />
        </div>
        <div className="aor-rev-body">
          <span className="aor-rev-label">Total Revenue (excl. cancelled)</span>
          <span className="aor-rev-value">
            ₹{stats.totalRevenue.toLocaleString("en-IN")}
          </span>
        </div>
        <span className="aor-rev-badge">
          <FontAwesomeIcon icon={faCheckCircle} /> Active
        </span>
      </div>

      {/* ── Controls — same as Category Management ── */}
      <div className="aor-controls">
        {/* search */}
        <div className="aor-search-wrap">
          <FontAwesomeIcon icon={faSearch} className="aor-search-icon" />
          <input
            type="text"
            className="aor-search"
            placeholder="Search by order number or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="aor-search-clear" onClick={() => setSearch("")}>
              <FontAwesomeIcon icon={faXmark} />
            </button>
          )}
        </div>

        <div className="aor-ctrl-div" />

        {/* order status filter */}
        <div className="aor-filter-wrap">
          <FontAwesomeIcon icon={faFilter} className="aor-filter-ico" />
          <select
            className="aor-filter-sel"
            value={orderFilter}
            onChange={(e) => setOrderFilter(e.target.value)}>
            <option value="ALL">All Status</option>
            <option value="PLACED">Placed</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PACKED">Packed</option>
            <option value="OUT_FOR_DELIVERY">Out For Delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="RETURN_REQUESTED">Return Requested</option>
            <option value="RETURN_APPROVED">Return Approved</option>
            <option value="RETURN_REJECTED">Return Rejected</option>
          </select>
        </div>

        {/* payment filter */}
        <div className="aor-filter-wrap">
          <FontAwesomeIcon icon={faCreditCard} className="aor-filter-ico" />
          <select
            className="aor-filter-sel"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}>
            <option value="ALL">All Payments</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>

        <div className="aor-ctrl-div" />

        {/* view toggle */}
        <div className="aor-view-toggle">
          <button
            className={`aor-view-btn ${viewMode === "grid" ? "aor-view-btn--on" : ""}`}
            onClick={() => setViewMode("grid")}
            title="Grid view">
            <FontAwesomeIcon icon={faTableCells} />
          </button>
          <button
            className={`aor-view-btn ${viewMode === "list" ? "aor-view-btn--on" : ""}`}
            onClick={() => setViewMode("list")}
            title="List view">
            <FontAwesomeIcon icon={faList} />
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="aor-state">
          <div className="aor-spinner" />
          <p>Loading orders…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="aor-state">
          <div className="aor-empty-icon">
            <FontAwesomeIcon icon={faBoxOpen} />
          </div>
          <h2>No Orders Found</h2>
          <p>
            {search || orderFilter !== "ALL" || paymentFilter !== "ALL"
              ? "Try adjusting your filters or search query."
              : "Orders will appear here once customers start ordering."}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="aor-grid">
          {filtered.map((o) => (
            <OrderCard
              key={o.orderNumber}
              order={o}
              onOrderStatusChange={changeOrderStatus}
              onPaymentStatusChange={changePaymentStatus}
            />
          ))}
        </div>
      ) : (
        /* List view — scrollable table on desktop, stacked cards on mobile */
        <div className="aor-table-panel">
          {/* Desktop: horizontal-scroll table — order ID never truncates */}
          <div className="aor-table-scroll">
            <table className="aor-table">
              <thead>
                <tr>
                  <th>
                    <FontAwesomeIcon icon={faHashtag} /> Order No.
                  </th>
                  <th>
                    <FontAwesomeIcon icon={faAt} /> Customer
                  </th>
                  <th>
                    <FontAwesomeIcon icon={faIndianRupeeSign} /> Amount
                  </th>
                  <th>
                    <FontAwesomeIcon icon={faBox} /> Status
                  </th>
                  <th>
                    <FontAwesomeIcon icon={faSyncAlt} /> Update Status
                  </th>
                  <th>
                    <FontAwesomeIcon icon={faCreditCard} /> Payment
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <TableRow
                    key={o.orderNumber}
                    order={o}
                    onOrderStatusChange={changeOrderStatus}
                    onPaymentStatusChange={changePaymentStatus}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: stacked cards (table-scroll is hidden on mobile) */}
          <div className="aor-mobile-cards">
            {filtered.map((o) => (
              <OrderCard
                key={o.orderNumber}
                order={o}
                onOrderStatusChange={changeOrderStatus}
                onPaymentStatusChange={changePaymentStatus}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
