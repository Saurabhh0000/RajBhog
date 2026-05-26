import { useEffect, useState } from "react";
import { fetchAdminDashboard } from "../api/admin/adminDashboardApi";
import "../styles/AdminDashboard.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faUserShield,
  faBox,
  faClock,
  faTruck,
  faStore,
  faBan,
  faEnvelopeOpenText,
  faStarHalfStroke,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";

/* ============================================================
   CARD CONFIG
   accent class  →  matches .ac-* in CSS
   tag           →  short category pill (top-right)
   footerText    →  subtle descriptor at bottom
   ============================================================ */

const CARDS = [
  {
    key: "totalUsers",
    icon: faUsers,
    label: "Customers",
    accent: "ac-blue",
    tag: "Users",
    footerText: "Registered accounts",
  },
  {
    key: "totalAdmins",
    icon: faUserShield,
    label: "Admins",
    accent: "ac-violet",
    tag: "Staff",
    footerText: "Platform administrators",
  },
  {
    key: "totalOrders",
    icon: faBox,
    label: "Total Orders",
    accent: "ac-amber",
    tag: "All time",
    footerText: "Orders placed overall",
  },
  {
    key: "pendingOrders",
    icon: faClock,
    label: "Pending Orders",
    accent: "ac-orange",
    tag: "In queue",
    footerText: "Awaiting fulfilment",
  },
  {
    key: "deliveredOrders",
    icon: faTruck,
    label: "Delivered Orders",
    accent: "ac-green",
    tag: "Completed",
    footerText: "Successfully delivered",
  },
  {
    key: "totalProducts",
    icon: faStore,
    label: "Products",
    accent: "ac-cyan",
    tag: "Catalogue",
    footerText: "Active product listings",
  },
  {
    key: "outOfStockVariants",
    icon: faBan,
    label: "Out of Stock",
    accent: "ac-rose",
    tag: "Alert",
    footerText: "Variants needing restock",
  },
  {
    key: "openContacts",
    icon: faEnvelopeOpenText,
    label: "Open Contacts",
    accent: "ac-indigo",
    tag: "Inbox",
    footerText: "Unresolved messages",
  },
  {
    key: "pendingReviews",
    icon: faStarHalfStroke,
    label: "Pending Reviews",
    accent: "ac-pink",
    tag: "Awaiting",
    footerText: "Reviews to moderate",
  },
];

/* ============================================================
   MAIN — backend logic unchanged
   ============================================================ */

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchAdminDashboard()
      .then((res) => setStats(res.data))
      .catch((err) => {
        console.error("Dashboard API error:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner" />
        <span className="loading-label">Loading dashboard…</span>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="dashboard-error">
        <FontAwesomeIcon icon={faTriangleExclamation} className="error-icon" />
        <span className="error-msg">Failed to load dashboard data</span>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* ── Header ── */}
      <div className="dashboard-header">
        <div className="header-left">
          <span className="dashboard-eyebrow">Control Center</span>
          <h1 className="dashboard-title">Admin Dashboard</h1>
        </div>
        <div className="live-badge">
          <span className="live-dot" />
          <span className="live-text">Live Overview</span>
        </div>
      </div>

      <p className="section-label">Platform Metrics</p>

      {/* ── Cards ── */}
      <div className="dashboard-grid">
        {CARDS.map((card) => (
          <StatCard
            key={card.key}
            icon={card.icon}
            label={card.label}
            value={stats[card.key]}
            accent={card.accent}
            tag={card.tag}
            footerText={card.footerText}
          />
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   STAT CARD — strict 4-row layout
   Row 1 · icon (left)  +  tag pill (right)   — space-between
   Row 2 · big number
   Row 3 · label
   Row 4 · footer (hidden on mobile)
   ============================================================ */

function StatCard({ icon, label, value, accent, tag, footerText }) {
  const display = value == null ? "—" : Number(value).toLocaleString();

  return (
    <div className={`stat-card ${accent}`}>
      {/* Row 1 — icon + tag (strict space-between, both vertically centred) */}
      <div className="card-row-top">
        <div className="card-icon">
          <FontAwesomeIcon icon={icon} />
        </div>
        <span className="card-tag">{tag}</span>
      </div>

      {/* Row 2 — number (hero element) */}
      <span
        className="card-number"
        style={{
          fontFamily: "Plus Jakarta Sans, sans-serif",
          fontWeight: 800,
          fontSize: "30px",
        }}>
        {display}
      </span>

      {/* Row 3 — label */}
      <span className="card-label">{label}</span>

      {/* Row 4 — footer */}
      <div className="card-footer">
        <span className="card-footer-text">{footerText}</span>
      </div>
    </div>
  );
}
