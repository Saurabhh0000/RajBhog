// src/pages/ProductDetail.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  Star,
  Package,
  ShieldCheck,
  Leaf,
  Truck,
  Clock,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { getProductBySlug } from "../api/public/productApi";
import { getVariantsByProduct } from "../api/public/variantApi";
import { addToCart } from "../api/user/cartApi";
import { getReviewsByVariant } from "../api/user/reviewApi";
import "../styles/PublicProductDetail.css";
import toast from "react-hot-toast";

/* ── helpers ── */
function StarRow({ rating, size = 14 }) {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= Math.floor(rating) ? "ppd__star-f" : "ppd__star-e"}
          fill={i <= Math.floor(rating) ? "#f59e0b" : "none"}
          strokeWidth={i <= Math.floor(rating) ? 0 : 1.5}
        />
      ))}
    </>
  );
}

function getInitials(name = "") {
  const parts = (name || "").trim().split(" ").filter(Boolean);
  if (!parts.length) return "U";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(str) {
  if (!str) return "";
  return new Date(str).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showFullDesc, setShowFullDesc] = useState(false);

  /* ── fetch product ── */
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getProductBySlug(slug)
      .then((res) => {
        const productData = res.data;
        setProduct(productData);
        return getVariantsByProduct(productData.id);
      })
      .then((res) => {
        const activeVariants = res.data.filter((v) => v.isActive);
        setVariants(activeVariants);
        const firstAvailable = activeVariants.find((v) => v.stock > 0);
        setSelectedVariant(firstAvailable || null);
      })
      .catch((err) => {
        console.error("Failed to load product", err);
        setProduct(null);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  /* ── fetch reviews ── */
  useEffect(() => {
    if (!selectedVariant) return;
    setReviewsLoading(true);
    setReviews([]);
    getReviewsByVariant(selectedVariant.id)
      .then((res) => setReviews(res.data || []))
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));
  }, [selectedVariant]);

  /* ── quantity ── */
  const handleQuantityChange = (newQty) => {
    if (selectedVariant && newQty >= 1 && newQty <= selectedVariant.stock) {
      setQuantity(newQty);
    }
  };

  /* ── discount ── */
  const calculateDiscount = () => {
    if (product?.originalPrice && selectedVariant?.price) {
      const d =
        ((product.originalPrice - selectedVariant.price) /
          product.originalPrice) *
        100;
      return Math.round(d);
    }
    return 0;
  };

  /* ── add to cart ── */
  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    const isLoggedIn = token && token !== "undefined" && token !== "null";

    if (!isLoggedIn) {
      localStorage.setItem(
        "pendingCart",
        JSON.stringify({ productVariantId: selectedVariant.id, quantity }),
      );
      toast.error("Login to continue");
      navigate("/login", { state: { redirectTo: `/product/${slug}` } });
      return;
    }

    try {
      await addToCart({
        productId: product.id,
        variantId: selectedVariant.id,
        quantity,
      });
      toast.success("Added to cart 🛒");
    } catch {
      toast.error("Failed to add");
    }
  };

  /* ── derived ── */
  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : 0;

  const discount = calculateDiscount();
  const desc = product?.description || "";
  const descPreview = desc.slice(0, 200);
  const hasMoreDesc = desc.length > 200;

  /* ── loading ── */
  if (loading) {
    return (
      <div className="ppd__page-loading">
        <div className="ppd__page-spinner" />
        <p>Loading product…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="ppd__page-loading">
        <Package size={40} color="#c4ae9a" />
        <p>Product not found</p>
      </div>
    );
  }

  return (
    <div className="ppd__page">
      {/* ══════════ TOPBAR ══════════ */}
      <div className="ppd__topbar">
        <button className="ppd__back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={15} /> Back
        </button>

        <nav className="ppd__breadcrumb">
          <a href="/">Home</a>
          <span className="ppd__breadcrumb-sep">›</span>
          <span>Products</span>
          <span className="ppd__breadcrumb-sep">›</span>
          <span className="ppd__breadcrumb-cur">{product.name}</span>
        </nav>
      </div>

      {/* ══════════ BODY ══════════ */}
      <div className="ppd__body">
        <div className="ppd__main">
          {/* ─── LEFT: image + rating block ─── */}
          <div className="ppd__main-left">
            {/* Image panel */}
            <div className="ppd__img-panel">
              <div className="ppd__img-box">
                {product.imageUrl ? (
                  <img
                    className="ppd__img"
                    src={product.imageUrl}
                    alt={product.name}
                  />
                ) : (
                  <div className="ppd__no-img">
                    <Package size={56} />
                    <span>No image available</span>
                  </div>
                )}

                {/* RAJBHOG brand watermark pill */}
                <div className="ppd__img-brand-pill">RAJBHOG</div>
              </div>
            </div>

            {/* ── RATING BLOCK — beside/below image on desktop ── */}
            {reviews.length > 0 && (
              <div className="ppd__rating-block">
                <div className="ppd__rating-score-big">{avgRating}</div>
                <div className="ppd__rating-right">
                  <div className="ppd__stars-row">
                    <StarRow rating={Number(avgRating)} size={15} />
                  </div>
                  <div className="ppd__rating-meta">
                    {reviews.length}{" "}
                    {reviews.length === 1 ? "review" : "reviews"}
                  </div>
                </div>
              </div>
            )}

            {/* ── TRUST STRIP ── */}
            <div className="ppd__trust-strip">
              <div className="ppd__trust-item">
                <div className="ppd__trust-ico">
                  <ShieldCheck size={14} />
                </div>
                <span>Quality Assured</span>
              </div>
              <div className="ppd__trust-item">
                <div className="ppd__trust-ico">
                  <Truck size={14} />
                </div>
                <span>Doorstep Delivery</span>
              </div>
              <div className="ppd__trust-item">
                <div className="ppd__trust-ico">
                  <Clock size={14} />
                </div>
                <span>Always Fresh</span>
              </div>
              <div className="ppd__trust-item">
                <div className="ppd__trust-ico">
                  <Leaf size={14} />
                </div>
                <span>100% Pure</span>
              </div>
            </div>
          </div>

          {/* ─── RIGHT: info + order ─── */}
          <div className="ppd__main-right">
            <div className="ppd__right">
              {/* ── NAME CARD ── */}
              <div className="ppd__info-card">
                <div className="ppd__brand-tag">
                  <Package size={10} /> RAJBHOG Collection
                </div>
                <h1 className="ppd__product-name">{product.name}</h1>
                <p className="ppd__product-tagline">
                  Handpicked from the finest sources — trusted by Indian
                  families
                </p>

                {/* inline rating for mobile (hidden on desktop) */}
                {reviews.length > 0 && (
                  <div className="ppd__mobile-rating">
                    <StarRow rating={Number(avgRating)} size={13} />
                    <span className="ppd__mobile-rating-score">
                      {avgRating}
                    </span>
                    <span className="ppd__mobile-rating-count">
                      ({reviews.length}{" "}
                      {reviews.length === 1 ? "review" : "reviews"})
                    </span>
                  </div>
                )}
              </div>

              {/* ── PRICE CARD ── */}
              {selectedVariant && (
                <div className="ppd__price-card">
                  <div className="ppd__price-header">
                    <span className="ppd__price-label-sm">Price</span>
                    {discount > 0 && (
                      <span className="ppd__discount-pill">
                        {discount}% OFF
                      </span>
                    )}
                  </div>
                  <div className="ppd__price-row">
                    <span className="ppd__price-current">
                      ₹{selectedVariant.price}
                    </span>
                    {product.originalPrice && discount > 0 && (
                      <span className="ppd__price-original">
                        ₹{product.originalPrice}
                      </span>
                    )}
                  </div>
                  <p className="ppd__price-note">Inclusive of all taxes</p>
                </div>
              )}

              {/* ── VARIANTS CARD ── */}
              <div className="ppd__variant-card">
                <div className="ppd__card-head-row">
                  <span className="ppd__section-label">Select Pack Size</span>
                  {selectedVariant && (
                    <span className="ppd__selected-hint">
                      Selected: {selectedVariant.unit}
                    </span>
                  )}
                </div>
                <div className="ppd__variant-grid">
                  {variants.map((v) => {
                    const isLow = v.stock > 0 && v.stock <= 5;
                    const isOut = v.stock === 0;
                    return (
                      <div
                        key={v.id}
                        className={`ppd__variant ${
                          selectedVariant?.id === v.id
                            ? "ppd__variant--selected"
                            : ""
                        } ${isOut ? "ppd__variant--disabled" : ""}`}
                        onClick={() => !isOut && setSelectedVariant(v)}>
                        <span className="ppd__variant-unit">{v.unit}</span>
                        <span className="ppd__variant-price">₹{v.price}</span>
                        {isOut && (
                          <span className="ppd__stock ppd__stock--out">
                            Out of stock
                          </span>
                        )}
                        {isLow && (
                          <span className="ppd__stock ppd__stock--low">
                            Only {v.stock} left
                          </span>
                        )}
                        {!isOut && !isLow && (
                          <span className="ppd__stock ppd__stock--in">
                            In stock
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── QUANTITY CARD ── */}
              {selectedVariant && selectedVariant.stock > 0 && (
                <div className="ppd__qty-card">
                  <div className="ppd__card-head-row">
                    <span className="ppd__section-label">Quantity</span>
                    <span className="ppd__selected-hint">
                      {selectedVariant.stock} units available
                    </span>
                  </div>
                  <div className="ppd__qty-row">
                    <div className="ppd__qty-control">
                      <button
                        className="ppd__qty-btn"
                        disabled={quantity <= 1}
                        onClick={() => handleQuantityChange(quantity - 1)}>
                        −
                      </button>
                      <span className="ppd__qty-sep" />
                      <input
                        className="ppd__qty-val"
                        type="number"
                        value={quantity}
                        readOnly
                      />
                      <span className="ppd__qty-sep" />
                      <button
                        className="ppd__qty-btn"
                        disabled={quantity >= selectedVariant.stock}
                        onClick={() => handleQuantityChange(quantity + 1)}>
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── ACTION CARD ── */}
              <div className="ppd__action-card">
                {selectedVariant?.stock === 0 ? (
                  <div className="ppd__out-msg">
                    This variant is currently out of stock
                  </div>
                ) : (
                  <button
                    className="ppd__btn-add"
                    disabled={!selectedVariant}
                    onClick={handleAddToCart}>
                    <ShoppingCart size={16} />
                    Add to Cart
                  </button>
                )}
                <button
                  className="ppd__btn-cart"
                  onClick={() => navigate("/user/cart")}>
                  View Cart →
                </button>

                <div className="ppd__delivery-rows">
                  <div className="ppd__delivery-row">
                    <div className="ppd__delivery-ico">
                      <Truck size={12} />
                    </div>
                    Doorstep delivery available
                  </div>
                  <div className="ppd__delivery-row">
                    <div className="ppd__delivery-ico">
                      <ShieldCheck size={12} />
                    </div>
                    Quality verified before dispatch
                  </div>
                  <div className="ppd__delivery-row">
                    <div className="ppd__delivery-ico">
                      <Leaf size={12} />
                    </div>
                    100% pure &amp; authentic product
                  </div>
                </div>
              </div>

              {/* ── DESCRIPTION CARD ── */}
              {desc && (
                <div className="ppd__desc-card">
                  <span className="ppd__section-label">About this Product</span>
                  <p className="ppd__desc-text">
                    {showFullDesc ? desc : descPreview}
                    {hasMoreDesc && !showFullDesc && "…"}
                  </p>
                  {hasMoreDesc && (
                    <button
                      className="ppd__desc-toggle"
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
          </div>
        </div>

        {/* ══════════ REVIEWS ══════════ */}
        <div className="ppd__reviews">
          <div className="ppd__reviews-head">
            <div className="ppd__reviews-title">
              <Star size={17} fill="#f59e0b" strokeWidth={0} />
              Customer Reviews
            </div>
            {reviews.length > 0 && (
              <div className="ppd__avg-badge">
                <span className="ppd__avg-score">{avgRating}</span>
                <div className="ppd__stars-inline">
                  <StarRow rating={Number(avgRating)} size={12} />
                </div>
                <span className="ppd__avg-count">
                  {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                </span>
              </div>
            )}
          </div>

          {reviewsLoading ? (
            <div className="ppd__reviews-loading">
              <div className="ppd__reviews-spinner" />
              Loading reviews…
            </div>
          ) : reviews.length === 0 ? (
            <div className="ppd__reviews-empty">
              <div className="ppd__reviews-empty-icon">
                <MessageSquare size={26} color="#8b4513" />
              </div>
              <h4>No reviews yet</h4>
              <p>Be the first to review this product after purchase.</p>
            </div>
          ) : (
            <div className="ppd__reviews-list">
              {reviews.map((r) => (
                <div key={r.id} className="ppd__review-item">
                  <div className="ppd__review-avatar">
                    {getInitials(r.userName)}
                  </div>
                  <div className="ppd__review-body">
                    <div className="ppd__review-top">
                      <span className="ppd__review-name">
                        {r.userName || "Customer"}
                      </span>
                      <span className="ppd__review-date">
                        {formatDate(r.createdAt)}
                      </span>
                    </div>
                    <div className="ppd__review-stars">
                      <StarRow rating={r.rating} size={12} />
                    </div>
                    {r.comment ? (
                      <p className="ppd__review-comment">"{r.comment}"</p>
                    ) : (
                      <p className="ppd__review-no-comment">
                        No comment provided.
                      </p>
                    )}
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
