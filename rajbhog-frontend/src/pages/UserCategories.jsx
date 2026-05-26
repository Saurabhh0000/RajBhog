// src/pages/UserCategories.jsx
import { useEffect, useState, useMemo } from "react";
import { getCategories } from "../api/public/categoryApi";
import { useNavigate } from "react-router-dom";
import "../styles/UserCategories.css";

import {
  Search,
  X,
  ArrowUpDown,
  LayoutGrid,
  List,
  ArrowRight,
  ShoppingBasket,
  Tag,
} from "lucide-react";

/* ============================================================
   MAIN COMPONENT — original logic (getCategories) unchanged
   ============================================================ */
export default function UserCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default"); // "az" | "za" | "default"
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  const navigate = useNavigate();

  /* ── FETCH CATEGORIES — original logic ── */
  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data || []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  /* ── FILTER + SORT (derived, no backend call) ── */
  const filtered = useMemo(() => {
    let list = [...categories];

    /* search */
    if (search.trim()) {
      const kw = search.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(kw));
    }

    /* sort */
    if (sort === "az") list.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "za") list.sort((a, b) => b.name.localeCompare(a.name));

    return list;
  }, [categories, search, sort]);

  /* ============================================================ */
  return (
    <div className="ucat__page">
      <div className="ucat__inner">
        {/* ══════════ HERO HEADER ══════════ */}
        <div className="ucat__header">
          <div className="ucat__header-inner">
            <h1 className="ucat__title">
              All <span>Categories</span>
            </h1>
            <p className="ucat__subtitle">
              Browse everything RAJBHOG has to offer — fresh groceries, staples,
              oils &amp; more
            </p>
          </div>
        </div>

        {/* ══════════ CONTROLS ══════════ */}
        <div className="ucat__controls">
          {/* search */}
          <div className="ucat__search">
            <span className="ucat__search-ico">
              <Search size={15} />
            </span>
            <input
              type="text"
              className="ucat__search-input"
              placeholder="Search categories…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="ucat__search-clear"
                onClick={() => setSearch("")}>
                <X size={11} />
              </button>
            )}
          </div>

          <div className="ucat__ctrl-div" />

          {/* sort */}
          <div className="ucat__sort-wrap">
            <ArrowUpDown size={14} className="ucat__sort-ico" />
            <select
              className="ucat__sort-sel"
              value={sort}
              onChange={(e) => setSort(e.target.value)}>
              <option value="default">Default</option>
              <option value="az">A → Z</option>
              <option value="za">Z → A</option>
            </select>
          </div>

          <div className="ucat__ctrl-div" />

          {/* view toggle */}
          <div className="ucat__view-toggle">
            <button
              className={`ucat__view-btn ${viewMode === "grid" ? "ucat__view-btn--on" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Grid view">
              <LayoutGrid size={15} />
            </button>
            <button
              className={`ucat__view-btn ${viewMode === "list" ? "ucat__view-btn--on" : ""}`}
              onClick={() => setViewMode("list")}
              title="List view">
              <List size={15} />
            </button>
          </div>
        </div>

        {/* ══════════ RESULTS META ══════════ */}
        {!loading && (
          <div className="ucat__meta">
            <span className="ucat__meta-count">
              Showing <strong>{filtered.length}</strong> of {categories.length}{" "}
              categories
            </span>
          </div>
        )}

        {/* ══════════ CONTENT ══════════ */}
        {loading ? (
          <div className="ucat__loading">
            <div className="ucat__spinner" />
            <p>Loading categories…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="ucat__empty">
            <div className="ucat__empty-icon">
              <ShoppingBasket size={30} />
            </div>
            <h3>{search ? "No results found" : "No Categories Yet"}</h3>
            <p>
              {search
                ? `We couldn't find any categories matching "${search}". Try a different keyword.`
                : "Categories will appear here once they are available."}
            </p>
            {search && (
              <button className="ucat__empty-btn" onClick={() => setSearch("")}>
                <X size={13} /> Clear Search
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          /* ── GRID VIEW — glassy premium cards ── */
          <div className="ucat__grid">
            {filtered.map((cat) => (
              <GlassCard
                key={cat.id}
                cat={cat}
                onClick={() => navigate(`/user/category/${cat.slug}`)}
              />
            ))}
          </div>
        ) : (
          /* ── LIST VIEW ── */
          <div className="ucat__list">
            {filtered.map((cat) => (
              <div
                key={cat.id}
                className="ucat__lrow"
                onClick={() => navigate(`/user/category/${cat.slug}`)}>
                {/* thumbnail */}
                <div className="ucat__lrow-thumb">
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt={cat.name} />
                  ) : (
                    <div className="ucat__lrow-thumb-placeholder">
                      {cat.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* info */}
                <div className="ucat__lrow-info">
                  <div className="ucat__lrow-name">{cat.name}</div>
                  <div className="ucat__lrow-sub">
                    <Tag size={10} style={{ marginRight: 4 }} />
                    RAJBHOG Collection
                  </div>
                </div>

                {/* arrow */}
                <ArrowRight size={14} className="ucat__lrow-arrow" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   GLASS CARD — grid view component
   ============================================================ */
function GlassCard({ cat, onClick }) {
  return (
    <div className="ucat__gcard" onClick={onClick}>
      {/* image strip */}
      <div className="ucat__gcard-img-strip">
        {cat.imageUrl ? (
          <>
            <img
              src={cat.imageUrl}
              alt={cat.name}
              className="ucat__gcard-img"
            />
            <div className="ucat__gcard-overlay" />
          </>
        ) : (
          <div className="ucat__gcard-placeholder">{cat.name.charAt(0)}</div>
        )}
      </div>

      {/* category name */}
      <div className="ucat__gcard-name">{cat.name}</div>

      {/* explore chip */}
      <div className="ucat__gcard-chip">
        Explore <ArrowRight size={10} />
      </div>
    </div>
  );
}
