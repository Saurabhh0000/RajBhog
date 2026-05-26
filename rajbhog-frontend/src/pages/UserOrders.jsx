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
  ArrowRight,
  CalendarDays,
  IndianRupee,
  Trash2,
  Filter,
  RotateCcw,
} from "lucide-react";

import { getMyOrders, cancelOrder, requestReturn } from "../api/user/orderApi";
import { addReview } from "../api/user/reviewApi";
import UserReviewModal from "../pages/UserReviewModal";
import "../styles/UserOrders.css";
import ReturnModal from "../pages/ReturnModal";

/* ── status → CSS class ── */
function pillClass(s = "") {
  return "uord__pill uord__pill--" + s.toLowerCase();
}

/* ── status → top accent colour ── */
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

/* ── format date ── */
function fmtDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* ── filter labels ── */
const FILTERS = [
  { key: "ALL", label: "All" },
  { key: "PLACED", label: "Placed" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "PACKED", label: "Packed" },
  { key: "OUT_FOR_DELIVERY", label: "On the way" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "RETURN_REQUESTED", label: "Return Requested" },
  { key: "RETURN_APPROVED", label: "Return Approved" },
  { key: "RETURN_REJECTED", label: "Return Rejected" },
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

  /* ── LOAD — original logic ── */
  const loadOrders = async () => {
    try {
      const res = await getMyOrders();
      setOrders(res.data || []);
    } catch {
      toast.error("Failed to load your orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  /* ── CANCEL — original logic ── */
  const handleCancel = async (orderNumber) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await cancelOrder(orderNumber);
      toast.success("Order cancelled successfully");
      loadOrders();
    } catch (e) {
      toast.error(
        e.response?.data?.message ||
          "Unable to cancel this order. Please contact support.",
      );
    }
  };

  /* ── FILTER + SEARCH (client-side) — original logic ── */
  const filtered = useMemo(() => {
    let list = [...orders];
    if (filter !== "ALL") {
      list = list.filter((o) => (o.orderStatus || "").toUpperCase() === filter);
    }
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

  /* ── TAB COUNTS — original logic ── */
  const tabCount = (key) =>
    key === "ALL"
      ? orders.length
      : orders.filter((o) => (o.orderStatus || "").toUpperCase() === key)
          .length;

  /* ─────────── LOADING ─────────── */
  if (loading) {
    return (
      <div className="uord__loading-page">
        <div className="uord__loading-spinner" />
        <p>Loading your orders…</p>
      </div>
    );
  }

  /* ─────────── EMPTY ─────────── */
  if (!orders.length) {
    return (
      <div className="uord__empty">
        <div className="uord__empty-card">
          <div className="uord__empty-icon-wrap">
            <ShoppingBag size={44} />
          </div>
          <h3 className="uord__empty-title">No orders yet</h3>
          <p className="uord__empty-sub">
            You haven't placed any orders with RAJBHOG yet. Explore fresh
            groceries, cooking oils, spices and more — and place your first
            order today.
          </p>
          <div className="uord__empty-hint">
            💡 Tip — Browse categories to find what you need
          </div>
          <button className="uord__btn-browse" onClick={() => navigate("/")}>
            <ShoppingBag size={16} /> Browse Products
          </button>
        </div>
      </div>
    );
  }

  /* ─────────── MAIN ─────────── */
  return (
    <div className="uord__page">
      <div className="uord__inner">
        {/* ══════════ HEADER ══════════ */}
        <div className="uord__header">
          <div className="uord__header-inner">
            <div className="uord__header-icon">
              <Package size={24} />
            </div>
            <div className="uord__header-text">
              <h1 className="uord__header-title">My Orders</h1>
              <p className="uord__header-sub">
                {orders.length} {orders.length === 1 ? "order" : "orders"}{" "}
                placed with RAJBHOG
              </p>
            </div>
          </div>
        </div>

        {/* ══════════ CONTROLS  ══════════
            Row 1: [Search .............. ] [List|Grid]
            Row 2: [All] [Placed] [Confirmed] ... (scrollable)
        ══════════════════════════════════ */}
        <div className="uord__controls">
          {/* ── ROW 1: search + view toggle ── */}
          <div className="uord__controls-row1">
            <div className="uord__search">
              <span className="uord__search-ico">
                <Search size={15} />
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
                  <X size={11} />
                </button>
              )}
            </div>

            <div className="uord__view-toggle">
              <button
                className={`uord__view-btn ${viewMode === "list" ? "uord__view-btn--on" : ""}`}
                onClick={() => setViewMode("list")}
                title="List view">
                <List size={15} />
              </button>
              <button
                className={`uord__view-btn ${viewMode === "grid" ? "uord__view-btn--on" : ""}`}
                onClick={() => setViewMode("grid")}
                title="Grid view">
                <LayoutGrid size={15} />
              </button>
            </div>
          </div>

          {/* ── ROW 2: filter tabs (horizontally scrollable) ── */}
          <div className="uord__filter-tabs">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                className={`uord__ftab ${filter === f.key ? "uord__ftab--on" : ""}`}
                onClick={() => setFilter(f.key)}>
                {f.label}
                <span className="uord__ftab-badge">{tabCount(f.key)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ══════════ RESULTS META ══════════ */}
        <div className="uord__meta">
          <span className="uord__meta-count">
            Showing <strong>{filtered.length}</strong> of {orders.length} orders
          </span>
        </div>

        {/* ══════════ CONTENT ══════════ */}
        {filtered.length === 0 ? (
          <div className="uord__no-results">
            <Filter size={48} />
            <h4>No orders match your filter</h4>
            <p>
              {search
                ? `No results for "${search}". Try a different order number.`
                : `You have no "${filter.toLowerCase()}" orders yet.`}
            </p>
            <button
              className="uord__btn-clear-filter"
              onClick={() => {
                setFilter("ALL");
                setSearch("");
              }}>
              <X size={12} /> Clear Filters
            </button>
          </div>
        ) : viewMode === "list" ? (
          /* ── LIST VIEW ── */
          <div className="uord__list">
            {filtered.map((order) => {
              const isDelivered =
                (order.orderStatus || "").toUpperCase() === "DELIVERED";
              const canCancel = ["PLACED", "CONFIRMED"].includes(
                (order.orderStatus || "").toUpperCase(),
              );
              const hasItems = order.items?.length > 0;
              const cls = (order.orderStatus || "").toLowerCase();
              return (
                <div
                  key={order.orderNumber}
                  className={`uord__lrow s-${cls}`}
                  onClick={() => navigate(`/user/orders/${order.orderNumber}`)}>
                  <div className="uord__lrow-ico">
                    <Package size={18} />
                  </div>

                  <div className="uord__lrow-info">
                    <div className="uord__lrow-num">#{order.orderNumber}</div>
                    <div className="uord__lrow-date">
                      <CalendarDays size={10} style={{ marginRight: 4 }} />
                      {fmtDate(order.createdAt)}
                    </div>
                  </div>

                  <span className={pillClass(order.orderStatus)}>
                    {order.orderStatus}
                  </span>

                  <div className="uord__lrow-mid">
                    <span className="uord__lrow-amt">
                      ₹{Number(order.finalAmount).toLocaleString()}
                    </span>
                  </div>

                  <div
                    className="uord__lrow-actions"
                    onClick={(e) => e.stopPropagation()}>
                    <button
                      className="uord__btn-sm uord__btn-sm--view"
                      onClick={() =>
                        navigate(`/user/orders/${order.orderNumber}`)
                      }>
                      <Eye size={12} /> View
                    </button>
                    {canCancel && (
                      <button
                        className="uord__btn-sm uord__btn-sm--cancel"
                        onClick={() => handleCancel(order.orderNumber)}>
                        <Trash2 size={12} /> Cancel
                      </button>
                    )}
                    {isDelivered && hasItems && (
                      <button
                        className="uord__btn-sm uord__btn-sm--review"
                        onClick={() => setReviewItem(order.items[0].id)}>
                        <Star size={12} /> Review
                      </button>
                    )}
                    {["DELIVERED", "RETURN_REJECTED"].includes(
                      (order.orderStatus || "").toUpperCase(),
                    ) && (
                      <button
                        className="uord__btn-sm uord__btn-sm--return"
                        onClick={() => setReturnOrder(order.orderNumber)}>
                        <RotateCcw size={12} /> Return
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── GRID VIEW ── */
          <div className="uord__grid">
            {filtered.map((order) => {
              const isDelivered =
                (order.orderStatus || "").toUpperCase() === "DELIVERED";
              const canCancel = ["PLACED", "CONFIRMED"].includes(
                (order.orderStatus || "").toUpperCase(),
              );
              const hasItems = order.items?.length > 0;
              return (
                <div
                  key={order.orderNumber}
                  className="uord__gcard"
                  style={{ "--card-accent": statusAccent(order.orderStatus) }}
                  onClick={() => navigate(`/user/orders/${order.orderNumber}`)}>
                  <div className="uord__gcard-head">
                    <div className="uord__gcard-num">
                      <span className="uord__gcard-num-ico">
                        <Package size={14} />
                      </span>
                      <span className="uord__gcard-num-txt">
                        #{order.orderNumber}
                      </span>
                    </div>
                    <span className={pillClass(order.orderStatus)}>
                      {order.orderStatus}
                    </span>
                  </div>

                  <div className="uord__gcard-body">
                    <div className="uord__gcrow">
                      <div className="uord__gcrow-ico">
                        <IndianRupee size={13} />
                      </div>
                      <div className="uord__gcrow-info">
                        <span className="uord__gcrow-lbl">Order Amount</span>
                        <span className="uord__gcrow-val uord__gcrow-val--amt">
                          ₹{Number(order.finalAmount).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="uord__gcrow">
                      <div className="uord__gcrow-ico">
                        <CalendarDays size={13} />
                      </div>
                      <div className="uord__gcrow-info">
                        <span className="uord__gcrow-lbl">Placed On</span>
                        <span className="uord__gcrow-val">
                          {fmtDate(order.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className="uord__gcard-foot"
                    onClick={(e) => e.stopPropagation()}>
                    <button
                      className="uord__btn-full uord__btn-full--view"
                      onClick={() =>
                        navigate(`/user/orders/${order.orderNumber}`)
                      }>
                      <Eye size={13} /> View Details
                    </button>
                    {canCancel && (
                      <button
                        className="uord__btn-full uord__btn-full--cancel"
                        onClick={() => handleCancel(order.orderNumber)}>
                        <Trash2 size={13} /> Cancel
                      </button>
                    )}
                    {isDelivered && hasItems && (
                      <button
                        className="uord__btn-full uord__btn-full--review"
                        onClick={() => setReviewItem(order.items[0].id)}>
                        <Star size={13} /> Review
                      </button>
                    )}
                    {["DELIVERED", "RETURN_REJECTED"].includes(
                      (order.orderStatus || "").toUpperCase(),
                    ) && (
                      <button
                        className="uord__btn-full uord__btn-full--return"
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

        {/* ══════════ RETURN MODAL ══════════ */}
        {returnOrder && (
          <ReturnModal
            orderNumber={returnOrder}
            onClose={() => setReturnOrder(null)}
            onSubmit={async (reason) => {
              try {
                await requestReturn(returnOrder, reason);
                toast.success("Return requested successfully");
                setReturnOrder(null);
                loadOrders();
              } catch (e) {
                toast.error(
                  e.response?.data?.message || "Failed to request return",
                );
              }
            }}
          />
        )}

        {/* ══════════ REVIEW MODAL ══════════ */}
        {reviewItem && (
          <UserReviewModal
            orderItemId={reviewItem}
            onClose={() => setReviewItem(null)}
            onSubmit={async (data) => {
              await addReview(data);
              toast.success(
                "Thank you! Your review has been submitted successfully.",
              );
              setReviewItem(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
