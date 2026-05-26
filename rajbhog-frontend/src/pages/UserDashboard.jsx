// src/pages/UserDashboard.jsx
import { useEffect, useMemo, useState, useRef } from "react";
import "../styles/UserDashboard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingCart,
  faArrowRight,
  faTruck,
  faWallet,
  faBoxOpen,
  faCheckCircle,
  faClock,
  faBan,
  faThLarge,
  faList,
  faCalendarAlt,
  faIndianRupeeSign,
  faBox,
  faBoxes,
  faClipboardCheck,
} from "@fortawesome/free-solid-svg-icons";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { getCategories } from "../api/public/categoryApi";
import { getBannerCoupons } from "../api/user/couponApi";
import { getMyOrders } from "../api/user/orderApi";

/* ── status → CSS class ── */
function statusClass(s = "") {
  return "udb__status udb__status--" + s.toLowerCase();
}

/* ── status → icon ── */
function statusIcon(status) {
  const map = {
    DELIVERED: faCheckCircle,
    PENDING: faClock,
    CANCELLED: faBan,
    PROCESSING: faTruck,
    PLACED: faCheckCircle,
    CONFIRMED: faClipboardCheck,
    PACKED: faBoxes,
    OUT_FOR_DELIVERY: faTruck,
    SHIPPED: faTruck,
    RETURN_REQUESTED: faClock,
    RETURN_APPROVED: faCheckCircle,
    RETURN_REJECTED: faBan,
  };
  return map[status] || faClock;
}

/* ── status → top accent colour ── */
function statusAccent(status) {
  const map = {
    DELIVERED: "#059669",
    PLACED: "#0284c7",
    CONFIRMED: "#3b82f6",
    SHIPPED: "#7c3aed",
    CANCELLED: "#ef4444",
    PENDING: "#f59e0b",
    PACKED: "#8b5cf6",
    OUT_FOR_DELIVERY: "#f97316",
    PROCESSING: "#0284c7",
    RETURN_REQUESTED: "#f59e0b",
    RETURN_APPROVED: "#059669",
    RETURN_REJECTED: "#ef4444",
  };
  return map[status] || "#8b4513";
}

/* ── format date ── */
function fmtDate(str) {
  return new Date(str).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* ============================================================
   MAIN COMPONENT  —  ALL ORIGINAL LOGIC PRESERVED
   ============================================================ */
export default function UserDashboard() {
  const navigate = useNavigate();
  const { profile } = useOutletContext();

  const [categories, setCategories] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderView, setOrderView] = useState("list");

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data || []))
      .catch(() => setCategories([]))
      .finally(() => setLoadingCategories(false));
  }, []);

  useEffect(() => {
    getMyOrders()
      .then((res) => setOrders(res.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoadingOrders(false));
  }, []);

  useEffect(() => {
    getBannerCoupons()
      .then((res) => setCoupons(res.data))
      .catch(() => setCoupons([]));
  }, []);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const deliveredOrders = orders.filter(
      (o) => o.orderStatus === "DELIVERED",
    ).length;
    const activeOrders = orders.filter(
      (o) => o.orderStatus !== "DELIVERED" && o.orderStatus !== "CANCELLED",
    ).length;
    const cancelledOrders = orders.filter(
      (o) => o.orderStatus === "CANCELLED",
    ).length;
    const pendingOrders = orders.filter(
      (o) => o.orderStatus === "PENDING",
    ).length;
    const returnRequested = orders.filter(
      (o) => o.orderStatus === "RETURN_REQUESTED",
    ).length;
    const returnApproved = orders.filter(
      (o) => o.orderStatus === "RETURN_APPROVED",
    ).length;
    const returnRejected = orders.filter(
      (o) => o.orderStatus === "RETURN_REJECTED",
    ).length;
    const totalSpent = orders.reduce(
      (sum, o) => sum + Number(o.finalAmount || 0),
      0,
    );
    const avgOrderValue =
      totalOrders > 0 ? (totalSpent / totalOrders).toFixed(2) : 0;
    const lastOrderDate =
      orders.length > 0
        ? new Date(orders[0].createdAt).toLocaleDateString()
        : "N/A";
    const confirmedOrders = orders.filter(
      (o) => o.orderStatus === "CONFIRMED",
    ).length;
    const packedOrders = orders.filter(
      (o) => o.orderStatus === "PACKED",
    ).length;
    const outForDelivery = orders.filter(
      (o) => o.orderStatus === "OUT_FOR_DELIVERY",
    ).length;
    return {
      totalOrders,
      deliveredOrders,
      activeOrders,
      cancelledOrders,
      pendingOrders,
      totalSpent,
      avgOrderValue,
      lastOrderDate,
      confirmedOrders,
      packedOrders,
      outForDelivery,
      returnRequested,
      returnApproved,
      returnRejected,
    };
  }, [orders]);

  return (
    <div className="udb__page">
      <div className="udb__inner">
        {/* ── HERO HEADER ── */}
        <div className="udb__header">
          <h1 className="udb__greeting">
            Welcome back,&nbsp;<span>{profile?.fullName || "Customer"}</span> 👋
          </h1>
          <p className="udb__greeting-sub">
            Here's a complete snapshot of your shopping activity at RAJBHOG
          </p>
        </div>

        {/* ── 3 PRIMARY STAT CARDS ── */}
        <div className="udb__stats">
          <StatCard
            variant="blue"
            icon={faShoppingCart}
            label="Total Orders"
            value={stats.totalOrders}
          />
          <StatCard
            variant="amber"
            icon={faTruck}
            label="Active Deliveries"
            value={stats.activeOrders}
          />
          <StatCard
            variant="green"
            icon={faWallet}
            label="Total Spent"
            value={`₹${stats.totalSpent.toLocaleString()}`}
          />
        </div>

        {/* ── 9 MINI STAT CARDS ── */}
        <div className="udb__mini-stats">
          <MiniCard
            color="green"
            icon={faCheckCircle}
            label="Delivered"
            value={stats.deliveredOrders}
            bg="#ecfdf5"
            fg="#047857"
            bdr="#a7f3d0"
          />
          <MiniCard
            color="blue"
            icon={faClipboardCheck}
            label="Confirmed"
            value={stats.confirmedOrders}
            bg="#eff6ff"
            fg="#1d4ed8"
            bdr="#bfdbfe"
          />
          <MiniCard
            color="violet"
            icon={faBoxes}
            label="Packed"
            value={stats.packedOrders}
            bg="#f5f3ff"
            fg="#7c3aed"
            bdr="#ddd6fe"
          />
          <MiniCard
            color="orange"
            icon={faTruck}
            label="Out for Delivery"
            value={stats.outForDelivery}
            bg="#fff7ed"
            fg="#c2410c"
            bdr="#fdba74"
          />
          <MiniCard
            color="amber"
            icon={faClock}
            label="Pending"
            value={stats.pendingOrders}
            bg="#fffbeb"
            fg="#b45309"
            bdr="#fde68a"
          />
          <MiniCard
            color="red"
            icon={faBan}
            label="Cancelled"
            value={stats.cancelledOrders}
            bg="#fef2f2"
            fg="#dc2626"
            bdr="#fecaca"
          />
          <MiniCard
            color="blue"
            icon={faClock}
            label="Return Requested"
            value={stats.returnRequested}
            bg="#eff6ff"
            fg="#2563eb"
            bdr="#bfdbfe"
          />
          <MiniCard
            color="green"
            icon={faCheckCircle}
            label="Return Approved"
            value={stats.returnApproved}
            bg="#ecfdf5"
            fg="#059669"
            bdr="#a7f3d0"
          />
          <MiniCard
            color="red"
            icon={faBan}
            label="Return Rejected"
            value={stats.returnRejected}
            bg="#fef2f2"
            fg="#dc2626"
            bdr="#fecaca"
          />
        </div>

        {/* ── COUPON BANNER SLIDER ── */}
        {coupons.length > 0 && <CouponSlider coupons={coupons} />}

        {/* ── CATEGORIES ── */}
        <div className="udb__section">
          <div className="udb__section-head">
            <div className="udb__section-title">
              <FontAwesomeIcon icon={faThLarge} /> Shop by Category
            </div>
            <button
              className="udb__view-all"
              onClick={() => navigate("/user/categories")}>
              View All <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>
          <div className="udb__section-body">
            {loadingCategories ? (
              <div className="udb__loading">
                <div className="udb__spinner" />
                <p>Loading categories…</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="udb__orders-empty">
                <p>No categories available</p>
              </div>
            ) : (
              <div className="udb__cat-grid">
                {categories.slice(0, 8).map((cat) => (
                  <div
                    key={cat.id}
                    className="udb__cat-item"
                    onClick={() => navigate(`/user/category/${cat.slug}`)}>
                    <div className="udb__cat-img-wrap">
                      {cat.imageUrl ? (
                        <img
                          src={cat.imageUrl}
                          alt={cat.name}
                          className="udb__cat-img"
                        />
                      ) : (
                        <div className="udb__cat-placeholder">
                          {cat.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="udb__cat-name">{cat.name}</span>
                    <FontAwesomeIcon
                      icon={faArrowRight}
                      className="udb__cat-arrow"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── ORDER ACTIVITY ── */}
        <div className="udb__section">
          <div className="udb__section-head">
            <div className="udb__section-title">
              <FontAwesomeIcon icon={faBox} /> Order Activity
            </div>
            <div className="udb__orders-controls">
              <button
                className="udb__view-all"
                onClick={() => navigate("/user/orders")}>
                View All <FontAwesomeIcon icon={faArrowRight} />
              </button>
              <div className="udb__view-toggle">
                <button
                  className={`udb__view-btn ${orderView === "list" ? "udb__view-btn--on" : ""}`}
                  onClick={() => setOrderView("list")}
                  title="List view">
                  <FontAwesomeIcon icon={faList} />
                </button>
                <button
                  className={`udb__view-btn ${orderView === "grid" ? "udb__view-btn--on" : ""}`}
                  onClick={() => setOrderView("grid")}
                  title="Grid view">
                  <FontAwesomeIcon icon={faThLarge} />
                </button>
              </div>
            </div>
          </div>

          {loadingOrders ? (
            <div className="udb__loading">
              <div className="udb__spinner" />
              <p>Loading your orders…</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="udb__orders-empty">
              <div className="udb__orders-empty-ico">
                <FontAwesomeIcon icon={faShoppingCart} />
              </div>
              <h4>No Orders Yet</h4>
              <p>
                You haven't placed any orders with RAJBHOG yet. Start shopping
                to see your activity here.
              </p>
              <button
                className="udb__btn-shop"
                onClick={() => navigate("/user/categories")}>
                <FontAwesomeIcon icon={faShoppingCart} /> Start Shopping
              </button>
            </div>
          ) : orderView === "list" ? (
            <div className="udb__orders-list">
              {orders.slice(0, 6).map((o) => (
                <div
                  key={o.orderNumber}
                  className="udb__order-lrow"
                  onClick={() => navigate(`/user/orders/${o.orderNumber}`)}>
                  <div className="udb__order-lrow-ico">
                    <FontAwesomeIcon icon={faBoxOpen} />
                  </div>
                  <div className="udb__order-lrow-info">
                    <div className="udb__order-lrow-num">#{o.orderNumber}</div>
                    <div className="udb__order-lrow-date">
                      <FontAwesomeIcon
                        icon={faCalendarAlt}
                        style={{ marginRight: 4, fontSize: 10 }}
                      />
                      {fmtDate(o.createdAt)}
                    </div>
                  </div>
                  <div className="udb__order-lrow-right">
                    <span className={statusClass(o.orderStatus)}>
                      <FontAwesomeIcon icon={statusIcon(o.orderStatus)} />
                      {o.orderStatus.replace(/_/g, " ")}
                    </span>
                    <span className="udb__order-lrow-amt">
                      ₹{Number(o.finalAmount).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="udb__orders-grid">
              {orders.slice(0, 6).map((o) => (
                <div
                  key={o.orderNumber}
                  className="udb__order-gcard"
                  style={{ "--card-accent": statusAccent(o.orderStatus) }}
                  onClick={() => navigate(`/user/orders/${o.orderNumber}`)}>
                  <div className="udb__order-gcard-head">
                    <div className="udb__order-gcard-num">
                      <span className="udb__order-gcard-num-ico">
                        <FontAwesomeIcon icon={faBoxOpen} />
                      </span>
                      #{o.orderNumber}
                    </div>
                    <span
                      className={`udb__order-gcard-status ${statusClass(o.orderStatus)}`}>
                      <FontAwesomeIcon icon={statusIcon(o.orderStatus)} />
                      {o.orderStatus.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="udb__order-gcard-body">
                    <div className="udb__gcrow">
                      <div className="udb__gcrow-ico">
                        <FontAwesomeIcon icon={faIndianRupeeSign} />
                      </div>
                      <div className="udb__gcrow-info">
                        <span className="udb__gcrow-lbl">Order Amount</span>
                        <span className="udb__gcrow-val udb__gcrow-val--amt">
                          ₹{Number(o.finalAmount).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="udb__gcrow">
                      <div className="udb__gcrow-ico">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                      </div>
                      <div className="udb__gcrow-info">
                        <span className="udb__gcrow-lbl">Placed On</span>
                        <span className="udb__gcrow-val">
                          {fmtDate(o.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="udb__order-gcard-foot">
                    <span className="udb__gclink">
                      View Details <FontAwesomeIcon icon={faArrowRight} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── STAT CARD ── */
function StatCard({ variant, icon, label, value }) {
  return (
    <div className={`udb__stat-card udb__stat-card--${variant}`}>
      <div className="udb__stat-icon">
        <FontAwesomeIcon icon={icon} />
      </div>
      <div className="udb__stat-info">
        <span className="udb__stat-label">{label}</span>
        <strong className="udb__stat-value">{value}</strong>
      </div>
    </div>
  );
}

/* ── MINI CARD ── */
function MiniCard({ color, icon, label, value, bg, fg, bdr }) {
  return (
    <div className="udb__mini-card" data-color={color}>
      <div
        className="udb__mini-icon"
        style={{ background: bg, color: fg, border: `1px solid ${bdr}` }}>
        <FontAwesomeIcon icon={icon} />
      </div>
      <div className="udb__mini-info">
        <span className="udb__mini-label">{label}</span>
        <strong className="udb__mini-val" style={{ color: fg }}>
          {value}
        </strong>
      </div>
    </div>
  );
}

/* ── COUPON SLIDER ── */
function CouponSlider({ coupons }) {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const getCardWidth = () => {
    if (!trackRef.current) return 400;
    const card = trackRef.current.querySelector(".udb__coupon-card");
    if (!card) return 400;
    return card.offsetWidth + 12; /* 12 = CSS gap */
  };

  useEffect(() => {
    if (paused || coupons.length <= 1) return;
    const id = setInterval(() => {
      setActive((prev) => {
        const next = prev + 1 >= coupons.length ? 0 : prev + 1;
        trackRef.current?.scrollTo({
          left: next * getCardWidth(),
          behavior: "smooth",
        });
        return next;
      });
    }, 3200);
    return () => clearInterval(id);
  }, [paused, coupons.length]);

  const scrollTo = (idx) => {
    if (!trackRef.current) return;
    const clamped = Math.max(0, Math.min(idx, coupons.length - 1));
    trackRef.current.scrollTo({
      left: clamped * getCardWidth(),
      behavior: "smooth",
    });
    setActive(clamped);
  };

  return (
    <div className="udb__cs-root">
      {coupons.length > 1 && (
        <button
          className="udb__cs-arrow udb__cs-arrow--left"
          onClick={() => scrollTo(active - 1)}
          disabled={active === 0}
          aria-label="Previous coupon">
          <ChevronLeft size={18} />
        </button>
      )}

      <div
        className="udb__coupon-banner udb__cs-track"
        ref={trackRef}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onScroll={(e) => {
          const w = getCardWidth();
          if (w > 0) setActive(Math.round(e.target.scrollLeft / w));
        }}>
        {coupons.map((c) => (
          <div key={c.id} className="udb__coupon-card">
            <div className="udb__coupon-left-panel">
              <div className="udb__coupon-serrated-right" />
              <div className="udb__coupon-brand">
                <span className="udb__coupon-brand-raj">RAJ</span>
                <span className="udb__coupon-brand-bhog">BHOG</span>
              </div>
              <div className="udb__coupon-barcode">
                {[...Array(9)].map((_, i) => (
                  <span
                    key={i}
                    className={`udb__bar udb__bar--${i % 3 === 0 ? "thick" : "thin"}`}
                  />
                ))}
              </div>
              <div className="udb__coupon-main-text">
                <span className="udb__coupon-big">SPECIAL</span>
                <span className="udb__coupon-sale">OFFER</span>
              </div>
              <p className="udb__coupon-desc">{c.bannerText}</p>
            </div>
            <div className="udb__coupon-right-panel">
              <div className="udb__coupon-serrated-left" />
              <div className="udb__coupon-rays">
                {[...Array(12)].map((_, i) => (
                  <span
                    key={i}
                    className="udb__ray"
                    style={{ transform: `rotate(${i * 30}deg)` }}
                  />
                ))}
              </div>
              <p className="udb__coupon-top-label">COUPON</p>
              <div className="udb__coupon-circle">
                <span className="udb__coupon-code-val">{c.code}</span>
                <span className="udb__coupon-use-label">USE CODE</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {coupons.length > 1 && (
        <button
          className="udb__cs-arrow udb__cs-arrow--right"
          onClick={() => scrollTo(active + 1)}
          disabled={active === coupons.length - 1}
          aria-label="Next coupon">
          <ChevronRight size={18} />
        </button>
      )}

      {coupons.length > 1 && (
        <div className="udb__cs-dots">
          {coupons.map((_, i) => (
            <button
              key={i}
              className={`udb__cs-dot ${i === active ? "udb__cs-dot--on" : ""}`}
              onClick={() => scrollTo(i)}
              aria-label={`Coupon ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
