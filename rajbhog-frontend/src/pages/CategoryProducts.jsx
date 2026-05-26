// src/pages/CategoryProducts.jsx
import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCategories } from "../api/public/categoryApi";
import { getProductsByCategory } from "../api/public/productApi";
import "../styles/CategoryProducts.css";

import {
  ArrowLeft,
  Package,
  LayoutGrid,
  List,
  Search,
  X,
  ArrowUpDown,
  Eye,
  ShoppingBag,
  Tag,
  Layers,
} from "lucide-react";

/* ============================================================
   MAIN COMPONENT — ALL ORIGINAL LOGIC PRESERVED
   ============================================================ */
export default function CategoryProducts() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("");

  /* ── UI state (no backend) ── */
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [viewMode, setViewMode] = useState("grid");

  /* ── LOAD — original logic ── */
  useEffect(() => {
    async function load() {
      try {
        const catRes = await getCategories();
        const category = catRes.data.find((c) => c.slug === slug);

        if (!category) {
          setProducts([]);
          setCategoryName(slug.replace(/-/g, " "));
          return;
        }

        setCategoryName(category.name);
        const prodRes = await getProductsByCategory(category.id);
        setProducts(prodRes.data);
      } catch {
        setProducts([]);
        setCategoryName(slug.replace(/-/g, " "));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [slug]);

  /* ── FILTER + SORT (client-side) ── */
  const filtered = useMemo(() => {
    let list = [...products];

    if (search.trim()) {
      const kw = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(kw) ||
          (p.description || "").toLowerCase().includes(kw),
      );
    }

    if (sort === "az") list.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "za") list.sort((a, b) => b.name.localeCompare(a.name));

    return list;
  }, [products, search, sort]);

  /* ─────────── LOADING ─────────── */
  if (loading) {
    return (
      <div className="cpr__loading">
        <div className="cpr__loading-card">
          <div className="cpr__spinner" />
          <p>Loading products…</p>
        </div>
      </div>
    );
  }

  /* ─────────── NO PRODUCTS IN CATEGORY ─────────── */
  if (!products.length) {
    return (
      <div className="cpr__empty">
        <div className="cpr__empty-card">
          <div className="cpr__empty-icon">
            <Package size={44} />
          </div>
          <h3 className="cpr__empty-title">No Products Available</h3>
          <p className="cpr__empty-sub">
            We're currently updating the{" "}
            <strong style={{ color: "#6f3b18" }}>{categoryName}</strong>{" "}
            category. Fresh products will be added soon — check back later!
          </p>
          <div className="cpr__empty-hint">
            💡 Tip — Browse other categories to find what you need
          </div>
          <button className="cpr__btn-browse" onClick={() => navigate("/")}>
            <Layers size={16} />
            Browse All Categories
          </button>
        </div>
      </div>
    );
  }

  /* ─────────── MAIN ─────────── */
  return (
    <div className="cpr__page">
      <div className="cpr__inner">
        {/* ══════════ TOPBAR ══════════ */}
        <div className="cpr__topbar">
          <button className="cpr__back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={15} /> Back
          </button>
          <nav className="cpr__crumb">
            <a href="/">Home</a>
            <span className="cpr__crumb-sep">›</span>
            <span>Categories</span>
            <span className="cpr__crumb-sep">›</span>
            <span
              className="cpr__crumb-cur"
              style={{ textTransform: "capitalize" }}>
              {categoryName}
            </span>
          </nav>
        </div>

        {/* ══════════ HERO BANNER ══════════ */}
        <div className="cpr__hero">
          <div className="cpr__hero-inner">
            <div className="cpr__hero-left">
              <div className="cpr__hero-tag">
                <Tag size={11} /> Category
              </div>
              <h1
                className="cpr__hero-title"
                style={{ textTransform: "capitalize" }}>
                {categoryName}
              </h1>
            </div>
            <div className="cpr__product-count-badge">
              <ShoppingBag size={15} />
              {products.length} {products.length === 1 ? "Product" : "Products"}
            </div>
          </div>
        </div>

        {/* ══════════ CONTROLS BAR ══════════ */}
        <div className="cpr__controls">
          {/* search */}
          <div className="cpr__search">
            <span className="cpr__search-ico">
              <Search size={15} />
            </span>
            <input
              type="text"
              className="cpr__search-input"
              placeholder={`Search in ${categoryName}…`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="cpr__search-clear"
                onClick={() => setSearch("")}>
                <X size={11} />
              </button>
            )}
          </div>

          <div className="cpr__ctrl-div" />

          {/* sort */}
          <div className="cpr__sort-wrap">
            <ArrowUpDown size={14} className="cpr__sort-ico" />
            <select
              className="cpr__sort-sel"
              value={sort}
              onChange={(e) => setSort(e.target.value)}>
              <option value="default">Default</option>
              <option value="az">A → Z</option>
              <option value="za">Z → A</option>
            </select>
          </div>

          <div className="cpr__ctrl-div" />

          {/* view toggle */}
          <div className="cpr__view-toggle">
            <button
              className={`cpr__view-btn ${viewMode === "grid" ? "cpr__view-btn--on" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Grid view">
              <LayoutGrid size={15} />
            </button>
            <button
              className={`cpr__view-btn ${viewMode === "list" ? "cpr__view-btn--on" : ""}`}
              onClick={() => setViewMode("list")}
              title="List view">
              <List size={15} />
            </button>
          </div>
        </div>

        {/* ══════════ META ══════════ */}
        <div className="cpr__meta">
          <span className="cpr__meta-count">
            Showing <strong>{filtered.length}</strong> of {products.length}{" "}
            products
          </span>
        </div>

        {/* ══════════ CONTENT ══════════ */}
        {filtered.length === 0 ? (
          <div className="cpr__no-results">
            <Search size={48} />
            <h4>No products match your search</h4>
            <p>
              No results for <strong>"{search}"</strong> in {categoryName}. Try
              a different keyword.
            </p>
            <button
              className="cpr__btn-clear-search"
              onClick={() => setSearch("")}>
              <X size={12} /> Clear Search
            </button>
          </div>
        ) : viewMode === "grid" ? (
          /* ── GRID VIEW ── */
          <div className="cpr__grid">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="cpr__gcard"
                onClick={() => navigate(`/user/product/${p.slug}`)}>
                {/* image */}
                <div className="cpr__gcard-img-wrap">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="cpr__gcard-img"
                    />
                  ) : (
                    <div className="cpr__gcard-img-placeholder">
                      <Package size={52} />
                    </div>
                  )}

                  {/* hover overlay */}
                  <div className="cpr__gcard-overlay">
                    <span className="cpr__hover-chip">
                      <Eye size={13} /> View Details
                    </span>
                  </div>

                  {/* floating category pill */}
                  <span className="cpr__gcard-cat">
                    <Tag size={9} /> RAJBHOG
                  </span>
                </div>

                {/* info */}
                <div className="cpr__gcard-info">
                  <p className="cpr__gcard-name">{p.name}</p>
                  {p.description && (
                    <p className="cpr__gcard-desc">
                      {p.description.slice(0, 70)}
                      {p.description.length > 70 ? "…" : ""}
                    </p>
                  )}
                </div>

                {/* footer button */}
                <div className="cpr__gcard-foot">
                  <button className="cpr__btn-view">
                    <Eye size={13} /> View Product
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ── LIST VIEW ── */
          <div className="cpr__list">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="cpr__lrow"
                onClick={() => navigate(`/product/${p.slug}`)}>
                {/* thumbnail */}
                <div className="cpr__lrow-thumb">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} />
                  ) : (
                    <div className="cpr__lrow-thumb-ph">
                      <Package size={28} />
                    </div>
                  )}
                </div>

                {/* info */}
                <div className="cpr__lrow-info">
                  <div className="cpr__lrow-name">{p.name}</div>
                  {p.description && (
                    <p className="cpr__lrow-desc">
                      {p.description.slice(0, 120)}
                      {p.description.length > 120 ? "…" : ""}
                    </p>
                  )}
                </div>

                {/* action */}
                <div className="cpr__lrow-right">
                  <button className="cpr__btn-view-sm">
                    <Eye size={13} /> View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
