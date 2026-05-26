// src/pages/ProductList.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Search,
  ArrowUpDown,
  Package,
  ArrowRight,
  ArrowLeft,
  LayoutGrid,
  List,
  X,
  ShoppingBasket,
  Sparkles,
  Tag,
  CheckCircle,
  Star,
  Leaf,
} from "lucide-react";
import { getProductsByCategorySlug } from "../api/public/productApi";
import "../styles/ProductList.css";

/* ── slug → human-readable title ── */
function slugToTitle(slug = "") {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/* ── slug → marketing tagline ── */
function slugTagline(slug = "") {
  const map = {
    "edible-oils-ghee": "Pure & healthy cooking essentials, sourced with care",
    "staples-grains": "Daily kitchen staples for every Indian home",
    "spices-masalas": "Authentic flavors that bring every dish alive",
    "pulses-dals": "Protein-rich dals & legumes for wholesome meals",
    "sugar-salt-sweeteners": "Everyday pantry must-haves at honest prices",
    "dairy-bakery": "Fresh dairy picks to brighten your mornings",
    "instant-food": "Quick & delicious — ready in minutes",
    "dry-fruits-nuts": "Nutritious & premium dry fruits for healthy snacking",
    "snacks-biscuits": "Crunchy, tasty treats the whole family will love",
    beverages: "Tea, coffee & refreshing drinks for every mood",
    "puja-essentials": "Daily pooja needs, delivered with devotion",
    "baby-care": "Gentle, safe & trusted products for your little one",
    "personal-care": "Daily hygiene essentials for a fresh, confident you",
    "chocolates-confectionery":
      "Sweet treats & confections to delight every taste bud",
    "household-essentials": "Everything your home needs, in one place",
    "sauces-spreads": "Taste enhancers that make every meal special",
  };
  return map[slug] || "Carefully selected products for your everyday needs";
}

/* ── product card taglines ── */
const TAGLINES = [
  "Premium quality guaranteed",
  "Trusted by families",
  "Fresh & pure",
  "Best in class",
  "Handpicked for you",
  "Top-rated pick",
  "Kirana favourite",
  "Daily essential",
];

function getTagline(id) {
  return TAGLINES[id % TAGLINES.length];
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
export default function ProductList() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getProductsByCategorySlug(slug)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Failed to load products", err))
      .finally(() => setLoading(false));
  }, [slug]);

  /* ── filter + sort (A→Z / Z→A) ── */
  const filtered = useMemo(() => {
    let list = [...products];

    if (search.trim()) {
      const kw = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(kw) ||
          (p.description || "").toLowerCase().includes(kw),
      );
    }

    if (sort === "az") list.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "za") list.sort((a, b) => b.name.localeCompare(a.name));

    return list;
  }, [products, search, sort]);

  const title = slugToTitle(slug);
  const tagline = slugTagline(slug);
  const hasFilter = search.trim() !== "" || sort !== "";

  return (
    <section className="plist__page">
      {/* ══════════ HEADER ══════════ */}
      <div className="plist__header">
        <div className="plist__header-inner">
          <button className="plist__back-btn" onClick={() => navigate("/")}>
            <ArrowLeft size={16} />
            Back to Home
          </button>

          <div className="plist__breadcrumb">
            <a href="/">Home</a>
            <span>›</span>
            <span>Products</span>
            <span>›</span>
            <span style={{ color: "rgba(255,215,181,0.9)" }}>{title}</span>
          </div>

          <div className="plist__cat-badge">
            <Sparkles size={11} />
            RAJBHOG Collection
          </div>

          <h1 className="plist__cat-title">{title}</h1>
          <p className="plist__cat-sub">{tagline}</p>

          {!loading && (
            <div className="plist__header-stats">
              <span className="plist__header-stat">
                <ShoppingBasket size={14} />
                <strong>{products.length}</strong>&nbsp;products available
              </span>
              <span className="plist__header-stat-sep" />
              <span className="plist__header-stat">
                <CheckCircle size={14} />
                Quality checked
              </span>
              <span className="plist__header-stat-sep" />
              <span className="plist__header-stat">
                <Leaf size={14} />
                100% pure
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ══════════ CONTROLS ══════════ */}
      <div className="plist__controls-wrap">
        <div className="plist__controls">
          <div className="plist__search">
            <span className="plist__search-ico">
              <Search size={15} />
            </span>
            <input
              type="text"
              className="plist__search-input"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="plist__search-clear"
                onClick={() => setSearch("")}>
                <X size={11} />
              </button>
            )}
          </div>

          <div className="plist__ctrl-divider" />

          {/* ── A→Z / Z→A sort ── */}
          <div className="plist__sort-wrap">
            <ArrowUpDown size={14} className="plist__sort-ico" />
            <select
              className="plist__sort-sel"
              value={sort}
              onChange={(e) => setSort(e.target.value)}>
              <option value="">Sort by</option>
              <option value="az">Name: A → Z</option>
              <option value="za">Name: Z → A</option>
            </select>
          </div>

          <div className="plist__ctrl-divider" />

          <div className="plist__view-toggle">
            <button
              className={`plist__view-btn ${viewMode === "grid" ? "plist__view-btn--on" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Grid view">
              <LayoutGrid size={15} />
            </button>
            <button
              className={`plist__view-btn ${viewMode === "list" ? "plist__view-btn--on" : ""}`}
              onClick={() => setViewMode("list")}
              title="List view">
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ══════════ RESULTS META ══════════ */}
      {!loading && (
        <div className="plist__meta">
          <span className="plist__meta-count">
            Showing <strong>{filtered.length}</strong> of {products.length}{" "}
            products
          </span>
          <span className="plist__meta-tag">
            <Tag size={11} />
            {title}
          </span>
        </div>
      )}

      {/* ══════════ CONTENT ══════════ */}
      {loading ? (
        <div className="plist__loading">
          <div className="plist__spinner" />
          <p className="plist__loading-text">Loading products…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="plist__content">
          <div className="plist__empty">
            <div className="plist__empty-icon">
              {hasFilter ? (
                <Search size={34} color="#8b4513" />
              ) : (
                <Package size={34} color="#8b4513" />
              )}
            </div>
            <h3>
              {hasFilter ? "No products match your search" : "No Products Yet"}
            </h3>
            <p>
              {hasFilter
                ? `We couldn't find any products matching "${search}" in ${title}. Try a different keyword or clear your search.`
                : `We're adding products to the ${title} category soon. Check back shortly or explore our other categories.`}
            </p>
            {hasFilter && (
              <div className="plist__empty-hint">
                💡 Tip: Try shorter or simpler search terms — e.g. "oil" instead
                of "refined oil"
              </div>
            )}
            {hasFilter && (
              <button
                className="plist__cta-btn"
                style={{ marginTop: 4 }}
                onClick={() => {
                  setSearch("");
                  setSort("");
                }}>
                Clear Filters
              </button>
            )}
            {!hasFilter && (
              <button
                className="plist__cta-btn"
                style={{ marginTop: 4 }}
                onClick={() => navigate("/")}>
                <ArrowLeft size={14} /> Browse Other Categories
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="plist__content">
          {viewMode === "grid" ? (
            <div className="plist__grid">
              {filtered.map((product, idx) => (
                <GridCard
                  key={product.id}
                  product={product}
                  tagline={getTagline(idx)}
                  categoryTitle={title}
                  onNavigate={() => navigate(`/product/${product.slug}`)}
                />
              ))}
            </div>
          ) : (
            <div className="plist__list">
              {filtered.map((product, idx) => (
                <ListCard
                  key={product.id}
                  product={product}
                  tagline={getTagline(idx)}
                  onNavigate={() => navigate(`/product/${product.slug}`)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/* ============================================================
   GRID CARD  — no hover pill, equal height via flex
   ============================================================ */
function GridCard({ product, tagline, categoryTitle, onNavigate }) {
  return (
    <div className="plist__card" onClick={onNavigate}>
      {/* image */}
      <div className="plist__card-img-wrap">
        {product.imageUrl ? (
          <>
            <img
              className="plist__card-img"
              src={product.imageUrl}
              alt={product.name}
              loading="lazy"
            />
            <div className="plist__card-img-overlay" />
          </>
        ) : (
          <div className="plist__card-no-img">
            <Package size={40} />
            <span>No image</span>
          </div>
        )}

        {/* category pill only — hover pill removed */}
        <span className="plist__card-cat-pill">{categoryTitle}</span>
      </div>

      {/* body — flex:1 makes all bodies stretch equally */}
      <div className="plist__card-body">
        <h3 className="plist__card-name">{product.name}</h3>

        {/* always reserve description space so cards align */}
        <p className="plist__card-desc">{product.description || "\u00A0"}</p>

        <div className="plist__card-tags">
          <span className="plist__tag plist__tag--brand">
            <Star size={9} /> RAJBHOG
          </span>
          <span className="plist__tag plist__tag--green">
            <Leaf size={9} /> Pure
          </span>
        </div>
      </div>

      {/* footer — pinned to bottom */}
      <div className="plist__card-footer">
        <span className="plist__tagline">{tagline}</span>
        <button
          className="plist__cta-btn"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate();
          }}>
          View <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   LIST CARD
   ============================================================ */
function ListCard({ product, tagline, onNavigate }) {
  return (
    <div className="plist__lcard" onClick={onNavigate}>
      <div className="plist__lcard-img-wrap">
        {product.imageUrl ? (
          <img
            className="plist__lcard-img"
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
          />
        ) : (
          <div className="plist__lcard-no-img">
            <Package size={32} />
          </div>
        )}
      </div>

      <div className="plist__lcard-body">
        <h3 className="plist__lcard-name">{product.name}</h3>

        {product.description && (
          <p className="plist__lcard-desc">{product.description}</p>
        )}

        <div className="plist__lcard-tags">
          <span className="plist__tag plist__tag--brand">
            <Star size={9} /> RAJBHOG
          </span>
          <span className="plist__tag plist__tag--green">
            <Leaf size={9} /> Pure
          </span>
        </div>

        <span className="plist__lcard-tagline">{tagline}</span>
      </div>

      <div className="plist__lcard-action">
        <button
          className="plist__cta-btn"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate();
          }}>
          View <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}
