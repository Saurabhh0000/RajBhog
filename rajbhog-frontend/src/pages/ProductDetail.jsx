// src/pages/UserProductDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  getProductBySlug,
  getProductsByCategorySlug,
} from "../api/public/productApi";
import { getVariantsByProduct } from "../api/public/variantApi";
import { addToCart } from "../api/user/cartApi";
import { getReviewsByVariant } from "../api/user/reviewApi";

import "../styles/ProductDetail.css";

import {
  ArrowLeft,
  ShoppingCart,
  Package,
  ShieldCheck,
  Leaf,
  Truck,
  Clock,
  Scale,
  AlertCircle,
  ArrowRight,
  Info,
  Star,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Tag,
  Eye,
} from "lucide-react";

/* ──────────────────────────────────────────────────
   HELPERS
   ────────────────────────────────────────────────── */

/* stars display (no click) */
function Stars({ rating, size = 14 }) {
  const filled = Math.floor(Number(rating) || 0);
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= filled ? "upd__star-f" : "upd__star-e"}
          fill={i <= filled ? "#f59e0b" : "none"}
          strokeWidth={i <= filled ? 0 : 1.5}
        />
      ))}
    </>
  );
}

/* ──────────────────────────────────────────────────
   RELATED CARD  — premium with hover overlay
   ────────────────────────────────────────────────── */
function RelatedCard({ product, onAdd, onView }) {
  return (
    <div className="upd__rel-card" onClick={onView}>
      {/* image box with hover overlay */}
      <div className="upd__rel-img-box">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="upd__rel-img"
          />
        ) : (
          <div className="upd__rel-img-placeholder">
            <Package size={36} />
          </div>
        )}

        {/* overlay chip on hover */}
        <div className="upd__rel-img-overlay">
          <span className="upd__rel-overlay-chip">
            <Eye size={12} /> View
          </span>
        </div>
      </div>

      {/* body */}
      <div className="upd__rel-body">
        <p className="upd__rel-name">{product.name}</p>
        {product.description && (
          <p className="upd__rel-desc">
            {product.description.slice(0, 70)}
            {product.description.length > 70 ? "…" : ""}
          </p>
        )}

        {/* footer */}
        <div className="upd__rel-footer">
          <span className="upd__rel-tag">
            <Tag size={9} /> RAJBHOG
          </span>
          <button
            className="upd__rel-btn"
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}>
            View <ArrowRight size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN COMPONENT — ALL ORIGINAL LOGIC PRESERVED
   ============================================================ */
export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  /* ── state (all original) ── */
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  /* ── LOAD PRODUCT — original logic ── */
  useEffect(() => {
    async function load() {
      try {
        const prodRes = await getProductBySlug(slug);
        const productData = prodRes.data;

        const varRes = await getVariantsByProduct(productData.id);
        const activeVariants = varRes.data.filter((v) => v.isActive);

        setProduct({
          ...productData,
          name: productData.name || activeVariants[0]?.productName,
        });
        setVariants(activeVariants);
        if (activeVariants.length > 0) setSelectedVariant(activeVariants[0]);

        /* related products — original logic */
        if (productData.categorySlug) {
          try {
            const relRes = await getProductsByCategorySlug(
              productData.categorySlug,
            );
            const others = (relRes.data || [])
              .filter((p) => p.slug !== slug)
              .slice(0, 6);
            setRelatedProducts(others);
          } catch {
            /* silent — related is non-critical */
          }
        }
      } catch {
        toast.error("Failed to load product. Please try again.");
      } finally {
        setPageLoading(false);
      }
    }
    load();
  }, [slug]);

  /* ── FETCH REVIEWS — original logic ── */
  useEffect(() => {
    if (!selectedVariant) return;
    setReviewsLoading(true);
    setReviews([]);
    getReviewsByVariant(selectedVariant.id)
      .then((res) => setReviews(res.data || []))
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));
  }, [selectedVariant]);

  /* ── ADD TO CART — original logic ── */
  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    try {
      setLoading(true);
      await addToCart({ productVariantId: selectedVariant.id, quantity: 1 });
      toast.success("Added to cart successfully 🛒");
    } catch {
      toast.error("Couldn't add to cart. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── derived ── */
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const desc = product?.description || "";
  const descShort = desc.slice(0, 200);
  const hasMore = desc.length > 200;
  const isOutOfStock = selectedVariant ? selectedVariant.stock === 0 : false;

  /* ─────────── PAGE LOADING ─────────── */
  if (pageLoading) {
    return (
      <div className="upd__loading">
        <div className="upd__loading-card">
          <div className="upd__spinner" />
          <p>Loading product…</p>
        </div>
      </div>
    );
  }

  /* ─────────── NOT FOUND ─────────── */
  if (!product) {
    return (
      <div className="upd__notfound">
        <div className="upd__notfound-card">
          <div className="upd__notfound-ico">
            <Package size={40} />
          </div>
          <h3 className="upd__notfound-title">Product Not Found</h3>
          <p className="upd__notfound-sub">
            We couldn't find the product you're looking for. It may have been
            removed or the link may be incorrect.
          </p>
          <button className="upd__btn-go-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  /* ─────────── MAIN RENDER ─────────── */
  return (
    <div className="upd__page">
      {/* ════════════════════ NAV ════════════════════ */}
      <nav className="upd__nav">
        <button className="upd__back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className="upd__crumb">
          <a href="/">Home</a>
          <span className="upd__crumb-sep">›</span>
          <span>Products</span>
          <span className="upd__crumb-sep">›</span>
          <span className="upd__crumb-cur">{product.name}</span>
        </div>
      </nav>

      {/* ════════════════════ BODY ════════════════════ */}
      <div className="upd__body">
        {/* ── 2-COL MAIN ── */}
        <div className="upd__grid">
          {/* LEFT */}
          <div className="upd__left">
            {/* image */}
            <div className="upd__img-card">
              <div className="upd__img-box">
                {product.imageUrl ? (
                  <img
                    className="upd__img-main"
                    src={product.imageUrl}
                    alt={product.name}
                  />
                ) : (
                  <div className="upd__img-fallback">
                    <Package size={64} />
                    <span>No image available</span>
                  </div>
                )}
              </div>

              {/* trust pills */}
              <div className="upd__trust-row">
                <span className="upd__trust-pill">
                  <ShieldCheck size={11} /> Quality Assured
                </span>
                <span className="upd__trust-dot" />
                <span className="upd__trust-pill">
                  <Leaf size={11} /> 100% Pure
                </span>
                <span className="upd__trust-dot" />
                <span className="upd__trust-pill">
                  <Truck size={11} /> Doorstep Delivery
                </span>
                <span className="upd__trust-dot" />
                <span className="upd__trust-pill">
                  <Clock size={11} /> Always Fresh
                </span>
              </div>
            </div>

            {/* description */}
            {desc && (
              <div className="upd__desc-card">
                <div className="upd__desc-lbl">
                  <Info size={13} /> About this product
                </div>
                <p className="upd__desc-text">
                  {showFullDesc ? desc : descShort}
                  {hasMore && !showFullDesc && "…"}
                </p>
                {hasMore && (
                  <button
                    className="upd__desc-toggle"
                    onClick={() => setShowFullDesc((v) => !v)}>
                    {showFullDesc ? (
                      <>
                        <ChevronUp size={13} /> Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown size={13} /> Read more
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="upd__right">
            {/* hero */}
            <div className="upd__hero-card">
              <div className="upd__store-tag">
                <Package size={10} /> RAJBHOG
              </div>

              <div className="upd__name-row">
                <h1 className="upd__product-name">{product.name}</h1>
                {reviews.length > 0 && (
                  <div className="upd__rating-chip">
                    <span className="upd__rating-chip-score">{avgRating}</span>
                    <Star
                      size={12}
                      fill="#f59e0b"
                      strokeWidth={0}
                      className="upd__rating-chip-star"
                    />
                    <span className="upd__rating-chip-count">
                      ({reviews.length})
                    </span>
                  </div>
                )}
              </div>

              {reviews.length > 0 && (
                <div className="upd__stars-row">
                  <Stars rating={Number(avgRating)} size={15} />
                </div>
              )}

              <p className="upd__product-tagline">
                Handpicked from the finest sources — trusted by families across
                India
              </p>

              {selectedVariant && (
                <div className="upd__price-zone">
                  <span className="upd__price-main">
                    ₹{selectedVariant.price}
                  </span>
                  <span className="upd__price-note">
                    Inclusive of all taxes
                  </span>
                </div>
              )}
            </div>

            {/* variants */}
            <div className="upd__variant-card">
              <div className="upd__card-label">
                <Scale size={13} /> Select Pack Size
              </div>
              <div className="upd__variant-list">
                {variants.map((v) => {
                  const isLow = v.stock > 0 && v.stock <= 5;
                  const isOut = v.stock === 0;
                  return (
                    <div
                      key={v.id}
                      className={[
                        "upd__vrow",
                        selectedVariant?.id === v.id ? "upd__vrow--active" : "",
                        isOut ? "upd__vrow--disabled" : "",
                      ].join(" ")}
                      onClick={() => v.stock > 0 && setSelectedVariant(v)}>
                      <div className="upd__vrow-radio">
                        <span className="upd__vrow-radio-dot" />
                      </div>
                      <div className="upd__vrow-info">
                        <span className="upd__vrow-unit">{v.unit}</span>
                        <div className="upd__vrow-stock">
                          {isOut && (
                            <span className="upd__stock-pill upd__stock-pill--out">
                              Out of stock
                            </span>
                          )}
                          {isLow && (
                            <span className="upd__stock-pill upd__stock-pill--low">
                              Only {v.stock} left!
                            </span>
                          )}
                          {!isOut && !isLow && (
                            <span className="upd__stock-pill upd__stock-pill--in">
                              In stock
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="upd__vrow-price">₹{v.price}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* actions */}
            <div className="upd__action-card">
              {isOutOfStock ? (
                <div className="upd__out-msg">
                  <AlertCircle size={15} /> This variant is currently out of
                  stock
                </div>
              ) : (
                <button
                  className="upd__btn-primary"
                  disabled={!selectedVariant || loading}
                  onClick={handleAddToCart}>
                  <ShoppingCart size={17} />
                  {loading ? "Adding to cart…" : "Add to Cart"}
                </button>
              )}

              <button
                className="upd__btn-secondary"
                onClick={() => navigate("/user/cart")}>
                <ArrowRight size={16} /> Proceed to Cart
              </button>

              {/* assurance strip */}
              <div className="upd__assurance-row">
                {[
                  { icon: <Truck size={13} />, label: "Doorstep Delivery" },
                  {
                    icon: <ShieldCheck size={13} />,
                    label: "Quality Verified",
                  },
                  { icon: <Leaf size={13} />, label: "100% Pure" },
                  { icon: <Clock size={13} />, label: "Always Fresh" },
                ].map(({ icon, label }) => (
                  <div key={label} className="upd__assurance-item">
                    <span className="upd__assurance-ico">{icon}</span>
                    <span className="upd__assurance-lbl">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════ RELATED PRODUCTS ════════════════════ */}
        {relatedProducts.length > 0 && (
          <section className="upd__related">
            {/* header */}
            <div className="upd__related-head">
              <div className="upd__related-head-left">
                <div className="upd__related-icon">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h2 className="upd__related-title">You May Also Like</h2>
                  <p className="upd__related-sub">
                    More fresh picks from the same category
                  </p>
                </div>
              </div>

              {product.categorySlug && (
                <button
                  className="upd__related-see-all"
                  onClick={() =>
                    navigate(`/user/category/${product.categorySlug}`)
                  }>
                  See all <ArrowRight size={13} />
                </button>
              )}
            </div>

            {/* cards grid */}
            <div className="upd__related-grid">
              {relatedProducts.map((rp) => (
                <RelatedCard
                  key={rp.id}
                  product={rp}
                  onView={() => navigate(`/user/product/${rp.slug}`)}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ════════════════════ MOBILE STICKY BAR ════════════════════ */}
      {selectedVariant && (
        <div className="upd__sticky-bar">
          <div className="upd__sticky-price">
            <span className="upd__sticky-price-val">
              ₹{selectedVariant.price}
            </span>
            <span className="upd__sticky-price-note">
              {selectedVariant.unit}
            </span>
          </div>
          <button
            className="upd__sticky-btn"
            disabled={isOutOfStock || loading}
            onClick={handleAddToCart}>
            <ShoppingCart size={16} />
            {loading
              ? "Adding…"
              : isOutOfStock
                ? "Out of Stock"
                : "Add to Cart"}
          </button>
        </div>
      )}
    </div>
  );
}
