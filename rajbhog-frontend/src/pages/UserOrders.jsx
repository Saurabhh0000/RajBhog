// src/pages/UserOrders.jsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  Package,
  ShoppingBag,
  Eye,
  Star,
  X,
  Search,
  LayoutGrid,
  List,
  CalendarDays,
  IndianRupee,
  Trash2,
  Filter,
  RotateCcw,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  ChevronRight,
} from "lucide-react";

import { getMyOrders, cancelOrder, requestReturn } from "../api/user/orderApi";
import { addReview } from "../api/user/reviewApi";
import UserReviewModal from "../pages/UserReviewModal";
import ReturnModal from "../pages/ReturnModal";
import "../styles/UserOrders.css";

/* ── Status pill class ── */
function pillClass(s = "") {
  return "uord__pill uord__pill--" + s.toLowerCase();
}

/* ── Status → left-border accent color ── */
function statusAccent(s = "") {
  const map = {
    PLACED: "#0284c7",
    CONFIRMED: "#3b82f6",
    PACKED: "#8b5cf6",
    OUT_FOR_DELIVERY: "#f97316",
    SHIPPED: "#7c3aed",
    DELIVERED: "#059669",
    CANCELLED: "#ef4444",
    RETURN_REQUESTED: "#f59e0b",
    RETURN_APPROVED: "#10b981",
    RETURN_REJECTED: "#ef4444",
  };
  return map[s.toUpperCase()] || "#8b4513";
}

/* ── Format date ── */
function fmtDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* ── Filter tab config ── */
const FILTERS = [
  { key: "ALL", label: "All" },
  { key: "PLACED", label: "Placed" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "PACKED", label: "Packed" },
  { key: "OUT_FOR_DELIVERY", label: "On the way" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "RETURN_REQUESTED", label: "Return Req." },
  { key: "RETURN_APPROVED", label: "Return OK" },
  { key: "RETURN_REJECTED", label: "Rej." },
  { key: "CANCELLED", label: "Cancelled" },
];

/* ============================================================
   MAIN COMPONENT — ALL ORIGINAL LOGIC PRESERVED
   ============================================================ */
export default function UserOrders() {
  const navigate = useNavigate();

  const [reviewItem, setReviewItem] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returnOrder, setReturnOrder] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("list");

  /* ── Load orders ── */
  const loadOrders = async () => {
    try {
      const res = await getMyOrders();
      setOrders(res.data || []);
    } catch {
      toast.error("Couldn't load your orders. Please refresh and try again.", {
        icon: "⚠️",
        duration: 3500,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  /* ── Cancel order ── */
  const handleCancel = async (orderNumber) => {
    if (!window.confirm("Cancel this order? This action cannot be undone."))
      return;
    try {
      await cancelOrder(orderNumber);
      toast.success(`Order #${orderNumber} cancelled successfully.`, {
        icon: "✅",
        duration: 3000,
      });
      loadOrders();
    } catch (e) {
      toast.error(
        e.response?.data?.message ||
          "Unable to cancel this order. Please contact support.",
        { icon: "❌", duration: 3500 },
      );
    }
  };

  /* ── Filter + search (client-side) ── */
  const filtered = useMemo(() => {
    let list = [...orders];
    if (filter !== "ALL")
      list = list.filter((o) => (o.orderStatus || "").toUpperCase() === filter);
    if (search.trim()) {
      const kw = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNumber?.toLowerCase().includes(kw) ||
          String(o.finalAmount).includes(kw),
      );
    }
    return list;
  }, [orders, filter, search]);

  /* ── Tab counts ── */
  const tabCount = (key) =>
    key === "ALL"
      ? orders.length
      : orders.filter((o) => (o.orderStatus || "").toUpperCase() === key)
          .length;

  /* ─────────── LOADING ─────────── */
  if (loading) {
    return (
      <div className="uord__loading-page">
        <div className="uord__loading-ring" />
        <p className="uord__loading-text">Loading your orders…</p>
      </div>
    );
  }

  /* ─────────── EMPTY ─────────── */
  if (!orders.length) {
    return (
      <div className="uord__empty-page">
        <div className="uord__empty-card">
          <div className="uord__empty-icon">
            <ShoppingBag size={40} />
          </div>
          <h3 className="uord__empty-title">No orders yet</h3>
          <p className="uord__empty-sub">
            You haven't placed any orders with RAJBHOG yet. Explore fresh
            groceries, daily staples, spices and more — and place your first
            order today.
          </p>
          <div className="uord__empty-tip">
            💡 Browse categories to find what you need
          </div>
          <button className="uord__browse-btn" onClick={() => navigate("/")}>
            <ShoppingBag size={15} />
            <span>Browse Products</span>
          </button>
        </div>
      </div>
    );
  }

  /* ─────────── MAIN ─────────── */
  return (
    <div className="uord__page">
      <div className="uord__inner">
        {/* ══ PAGE HEADER ══ */}
        <div className="uord__header">
          <div className="uord__header-body">
            <div className="uord__header-icon">
              <Package size={22} />
            </div>
            <div className="uord__header-text">
              <h1 className="uord__header-title">My Orders</h1>
              <p className="uord__header-sub">
                {orders.length} {orders.length === 1 ? "order" : "orders"}{" "}
                placed with RAJBHOG
              </p>
            </div>
          </div>
          <div className="uord__header-stats">
            <div className="uord__stat">
              <span className="uord__stat-val">
                {
                  orders.filter(
                    (o) => (o.orderStatus || "").toUpperCase() === "DELIVERED",
                  ).length
                }
              </span>
              <span className="uord__stat-lbl">Delivered</span>
            </div>
            <div className="uord__stat-div" />
            <div className="uord__stat">
              <span className="uord__stat-val">
                {
                  orders.filter((o) =>
                    [
                      "PLACED",
                      "CONFIRMED",
                      "PACKED",
                      "OUT_FOR_DELIVERY",
                    ].includes((o.orderStatus || "").toUpperCase()),
                  ).length
                }
              </span>
              <span className="uord__stat-lbl">Active</span>
            </div>
          </div>
        </div>

        {/* ══ CONTROLS ══ */}
        <div className="uord__controls">
          {/* Row 1: search + view toggle */}
          <div className="uord__controls-top">
            <div className="uord__search-wrap">
              <span className="uord__search-icon">
                <Search size={14} />
              </span>
              <input
                type="text"
                className="uord__search-input"
                placeholder="Search by order number or amount…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  className="uord__search-clear"
                  onClick={() => setSearch("")}>
                  <X size={12} />
                </button>
              )}
            </div>
            <div className="uord__view-toggle">
              <button
                className={`uord__view-btn${viewMode === "list" ? " uord__view-btn--on" : ""}`}
                onClick={() => setViewMode("list")}
                title="List view">
                <List size={15} />
              </button>
              <button
                className={`uord__view-btn${viewMode === "grid" ? " uord__view-btn--on" : ""}`}
                onClick={() => setViewMode("grid")}
                title="Grid view">
                <LayoutGrid size={15} />
              </button>
            </div>
          </div>

          {/* Row 2: filter tabs — horizontal scroll */}
          <div className="uord__filter-row">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                className={`uord__ftab${filter === f.key ? " uord__ftab--on" : ""}`}
                onClick={() => setFilter(f.key)}>
                <span>{f.label}</span>
                <span className="uord__ftab-count">{tabCount(f.key)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ══ RESULTS META ══ */}
        <div className="uord__results-meta">
          <span className="uord__results-text">
            Showing <strong>{filtered.length}</strong> of {orders.length} orders
          </span>
          {(search || filter !== "ALL") && (
            <button
              className="uord__clear-all"
              onClick={() => {
                setSearch("");
                setFilter("ALL");
              }}>
              <X size={11} /> Clear
            </button>
          )}
        </div>

        {/* ══ CONTENT ══ */}
        {filtered.length === 0 ? (
          /* No results */
          <div className="uord__no-results">
            <div className="uord__no-results-icon">
              <Filter size={36} />
            </div>
            <h4 className="uord__no-results-title">No orders match</h4>
            <p className="uord__no-results-sub">
              {search
                ? `No results for "${search}". Try a different order number.`
                : `You have no "${filter.toLowerCase().replace(/_/g, " ")}" orders yet.`}
            </p>
            <button
              className="uord__clear-filter-btn"
              onClick={() => {
                setFilter("ALL");
                setSearch("");
              }}>
              <X size={12} /> Clear Filters
            </button>
          </div>
        ) : viewMode === "list" ? (
          /* ══ LIST VIEW ══ */
          <div className="uord__list">
            {filtered.map((order) => {
              const status = (order.orderStatus || "").toUpperCase();
              const isDelivered = status === "DELIVERED";
              const canCancel = ["PLACED", "CONFIRMED"].includes(status);
              const canReturn = ["DELIVERED", "RETURN_REJECTED"].includes(
                status,
              );
              const hasItems = order.items?.length > 0;
              const accent = statusAccent(order.orderStatus);
              return (
                <div
                  key={order.orderNumber}
                  className="uord__lrow"
                  style={{ "--row-accent": accent }}
                  onClick={() => navigate(`/user/orders/${order.orderNumber}`)}>
                  {/* Icon */}
                  <div className="uord__lrow-ico">
                    <Package size={17} />
                  </div>

                  {/* Info */}
                  <div className="uord__lrow-info">
                    <p className="uord__lrow-num">#{order.orderNumber}</p>
                    <div className="uord__lrow-meta">
                      <span className="uord__lrow-date">
                        <CalendarDays size={10} />
                        {fmtDate(order.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Status pill */}
                  <span className={pillClass(order.orderStatus)}>
                    {order.orderStatus?.replace(/_/g, " ")}
                  </span>

                  {/* Amount */}
                  <span className="uord__lrow-amt">
                    ₹{Number(order.finalAmount).toLocaleString()}
                  </span>

                  {/* Actions — stop propagation so click doesn't open detail */}
                  <div
                    className="uord__lrow-actions"
                    onClick={(e) => e.stopPropagation()}>
                    <button
                      className="uord__act-btn uord__act-btn--view"
                      onClick={() =>
                        navigate(`/user/orders/${order.orderNumber}`)
                      }
                      title="View order">
                      <Eye size={13} />
                      <span>View</span>
                    </button>
                    {canCancel && (
                      <button
                        className="uord__act-btn uord__act-btn--cancel"
                        onClick={() => handleCancel(order.orderNumber)}
                        title="Cancel order">
                        <Trash2 size={13} />
                        <span>Cancel</span>
                      </button>
                    )}
                    {isDelivered && hasItems && (
                      <button
                        className="uord__act-btn uord__act-btn--review"
                        onClick={() => setReviewItem(order.items[0].id)}
                        title="Write a review">
                        <Star size={13} />
                        <span>Review</span>
                      </button>
                    )}
                    {canReturn && (
                      <button
                        className="uord__act-btn uord__act-btn--return"
                        onClick={() => setReturnOrder(order.orderNumber)}
                        title="Request return">
                        <RotateCcw size={13} />
                        <span>Return</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ══ GRID VIEW ══ */
          <div className="uord__grid">
            {filtered.map((order) => {
              const status = (order.orderStatus || "").toUpperCase();
              const isDelivered = status === "DELIVERED";
              const canCancel = ["PLACED", "CONFIRMED"].includes(status);
              const canReturn = ["DELIVERED", "RETURN_REJECTED"].includes(
                status,
              );
              const hasItems = order.items?.length > 0;
              const accent = statusAccent(order.orderStatus);
              return (
                <div
                  key={order.orderNumber}
                  className="uord__gcard"
                  style={{ "--card-accent": accent }}
                  onClick={() => navigate(`/user/orders/${order.orderNumber}`)}>
                  {/* Color-coded top bar */}
                  <div className="uord__gcard-bar" />

                  {/* Card head */}
                  <div className="uord__gcard-head">
                    <div className="uord__gcard-id">
                      <div className="uord__gcard-pkg-icon">
                        <Package size={13} />
                      </div>
                      <span className="uord__gcard-num">
                        #{order.orderNumber}
                      </span>
                    </div>
                    <span className={pillClass(order.orderStatus)}>
                      {order.orderStatus?.replace(/_/g, " ")}
                    </span>
                  </div>

                  {/* Card body */}
                  <div className="uord__gcard-body">
                    <div className="uord__ginfo-row">
                      <div className="uord__ginfo-icon">
                        <IndianRupee size={13} />
                      </div>
                      <div>
                        <p className="uord__ginfo-label">Order Amount</p>
                        <p className="uord__ginfo-value uord__ginfo-value--amount">
                          ₹{Number(order.finalAmount).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="uord__ginfo-row">
                      <div className="uord__ginfo-icon">
                        <CalendarDays size={13} />
                      </div>
                      <div>
                        <p className="uord__ginfo-label">Placed On</p>
                        <p className="uord__ginfo-value">
                          {fmtDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card footer — actions */}
                  <div
                    className="uord__gcard-foot"
                    onClick={(e) => e.stopPropagation()}>
                    <button
                      className="uord__gact-btn uord__gact-btn--view"
                      onClick={() =>
                        navigate(`/user/orders/${order.orderNumber}`)
                      }>
                      <Eye size={13} /> View Details
                    </button>
                    {canCancel && (
                      <button
                        className="uord__gact-btn uord__gact-btn--cancel"
                        onClick={() => handleCancel(order.orderNumber)}>
                        <Trash2 size={13} /> Cancel
                      </button>
                    )}
                    {isDelivered && hasItems && (
                      <button
                        className="uord__gact-btn uord__gact-btn--review"
                        onClick={() => setReviewItem(order.items[0].id)}>
                        <Star size={13} /> Review
                      </button>
                    )}
                    {canReturn && (
                      <button
                        className="uord__gact-btn uord__gact-btn--return"
                        onClick={() => setReturnOrder(order.orderNumber)}>
                        <RotateCcw size={13} /> Return
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══ RETURN MODAL ══ */}
        {returnOrder && (
          <ReturnModal
            orderNumber={returnOrder}
            onClose={() => setReturnOrder(null)}
            onSubmit={async (reason) => {
              try {
                await requestReturn(returnOrder, reason);
                toast.success("Return request submitted successfully.", {
                  icon: "✅",
                  duration: 3000,
                });
                setReturnOrder(null);
                loadOrders();
              } catch (e) {
                toast.error(
                  e.response?.data?.message ||
                    "Failed to submit return request.",
                  { icon: "❌", duration: 3500 },
                );
              }
            }}
          />
        )}

        {/* ══ REVIEW MODAL ══ */}
        {reviewItem && (
          <UserReviewModal
            orderItemId={reviewItem}
            onClose={() => setReviewItem(null)}
            onSubmit={async (data) => {
              await addReview(data);
              toast.success("Thank you! Your review has been submitted.", {
                icon: "⭐",
                duration: 3000,
              });
              setReviewItem(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
