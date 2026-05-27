// src/pages/UserCart.jsx
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getMyCart,
  updateQuantity,
  removeItem,
  clearCart,
} from "../api/user/cartApi";
import { getMyAddresses } from "../api/user/addressApi";
import { getAvailableCoupons } from "../api/user/couponApi";
import { useNavigate } from "react-router-dom";
import "../styles/UserCart.css";

import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  MapPin,
  ArrowRight,
  Package,
  CheckCircle,
  ShoppingBag,
  AlertTriangle,
  Receipt,
  Tag,
  Zap,
  BadgePercent,
  ChevronRight,
  Star,
} from "lucide-react";

/* ============================================================
   MAIN COMPONENT — ALL ORIGINAL LOGIC PRESERVED
   ============================================================ */
export default function UserCart() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ── Load cart ── */
  const loadCart = async () => {
    try {
      const res = await getMyCart();
      setItems(res.data || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  /* ── Load addresses ── */
  const loadAddresses = async () => {
    try {
      const res = await getMyAddresses();
      const def = res.data?.find((a) => a.isDefault);
      if (def) setDefaultAddress(def);
      else if (res.data?.length > 0) setDefaultAddress(res.data[0]);
    } catch {
      setDefaultAddress(null);
    }
  };

  useEffect(() => {
    loadCart();
    loadAddresses();
  }, []);

  /* ── Update quantity ── */
  const handleQtyChange = async (id, qty) => {
    if (qty < 1) return;
    try {
      await updateQuantity(id, qty);
      toast.success("Quantity updated!", { icon: "✅", duration: 2000 });
      loadCart();
    } catch (e) {
      toast.error(
        e.response?.data?.message ||
          "Couldn't update quantity. Please try again.",
        { icon: "⚠️", duration: 3000 },
      );
    }
  };

  /* ── Remove item ── */
  const handleRemove = async (id) => {
    await removeItem(id);
    toast.success("Item removed from cart.", { icon: "🗑️", duration: 2500 });
    loadCart();
  };

  /* ── Clear cart ── */
  const handleClear = async () => {
    await clearCart();
    toast.success("Your cart has been cleared.", {
      icon: "🧹",
      duration: 2500,
    });
    setItems([]);
  };

  /* ── Proceed to checkout ── */
  const proceedToCheckout = () => {
    if (!defaultAddress) {
      toast.error("Please add a delivery address before checkout.", {
        icon: "📍",
        duration: 3500,
      });
      navigate("/user/settings");
      return;
    }
    navigate("/user/checkout");
  };

  const subtotal = items.reduce((s, i) => s + Number(i.totalPrice), 0);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    if (subtotal <= 0) return;
    getAvailableCoupons(subtotal)
      .then((res) => setCoupons(res.data))
      .catch(() => setCoupons([]));
  }, [subtotal]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="ucart__loading-page">
        <div className="ucart__loading-ring" />
        <p className="ucart__loading-text">Loading your cart…</p>
      </div>
    );
  }

  /* ── Empty ── */
  if (items.length === 0) {
    return (
      <div className="ucart__empty-page">
        <div className="ucart__empty-card">
          <div className="ucart__empty-icon">
            <ShoppingCart size={42} />
          </div>
          <h3 className="ucart__empty-title">Your cart is empty</h3>
          <p className="ucart__empty-sub">
            Looks like you haven't added anything yet. Explore fresh groceries,
            cooking oils, spices and more from RAJBHOG.
          </p>
          <div className="ucart__empty-tip">
            💡 Browse categories or search for products to add them to your cart
          </div>
          <button
            className="ucart__shop-btn"
            onClick={() => navigate("/user/categories")}>
            <ShoppingBag size={15} />
            <span>Start Shopping</span>
          </button>
        </div>
      </div>
    );
  }

  /* ============================================================
     CART WITH ITEMS
     ============================================================ */
  return (
    <div className="ucart__page">
      <div className="ucart__inner">
        {/* ══ HEADER ══ */}
        <div className="ucart__header">
          <div className="ucart__header-left">
            <div className="ucart__header-icon">
              <ShoppingCart size={22} />
            </div>
            <div className="ucart__header-text">
              <h1 className="ucart__header-title">Shopping Cart</h1>
              <p className="ucart__header-sub">
                {itemCount} {itemCount === 1 ? "item" : "items"} in your basket
              </p>
            </div>
          </div>
          <button className="ucart__clear-btn" onClick={handleClear}>
            <Trash2 size={13} />
            <span>Clear Cart</span>
          </button>
        </div>

        {/* ══ BODY GRID ══ */}
        <div className="ucart__body">
          {/* ─── ITEM LIST ─── */}
          <div className="ucart__items-col">
            <div className="ucart__items-list">
              {items.map((item, idx) => (
                <div key={item.id} className="ucart__item">
                  {/* Colored top accent */}
                  <div className="ucart__item-accent" />

                  {/* Item head: icon + name/unit + remove btn */}
                  <div className="ucart__item-head">
                    <div className="ucart__item-icon-wrap">
                      <Package size={20} />
                    </div>

                    <div className="ucart__item-details">
                      <p className="ucart__item-name" title={item.productName}>
                        {item.productName}
                      </p>
                      <div className="ucart__item-tags">
                        <span className="ucart__unit-tag">{item.unit}</span>
                        <span className="ucart__unit-price-tag">
                          <Tag size={10} /> ₹{item.price} each
                        </span>
                      </div>
                    </div>

                    <button
                      className="ucart__remove-btn"
                      onClick={() => handleRemove(item.id)}
                      aria-label={`Remove ${item.productName}`}
                      title="Remove item">
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Item foot: unit price | qty stepper | total */}
                  <div className="ucart__item-foot">
                    <div className="ucart__price-info">
                      <span className="ucart__price-label">Unit Price</span>
                      <span className="ucart__price-value">₹{item.price}</span>
                    </div>

                    <div className="ucart__qty-ctrl">
                      <button
                        className="ucart__qty-btn ucart__qty-minus"
                        disabled={item.quantity === 1}
                        onClick={() =>
                          handleQtyChange(item.id, item.quantity - 1)
                        }
                        aria-label="Decrease quantity">
                        <Minus size={13} />
                      </button>
                      <input
                        className="ucart__qty-display"
                        type="number"
                        value={item.quantity}
                        readOnly
                        aria-label="Quantity"
                      />
                      <button
                        className="ucart__qty-btn ucart__qty-plus"
                        onClick={() =>
                          handleQtyChange(item.id, item.quantity + 1)
                        }
                        aria-label="Increase quantity">
                        <Plus size={13} />
                      </button>
                    </div>

                    <div className="ucart__item-total">
                      <span className="ucart__total-label">Total</span>
                      <span className="ucart__total-value">
                        ₹{item.totalPrice}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── ORDER SUMMARY SIDEBAR ─── */}
          <div className="ucart__summary-col">
            <div className="ucart__summary-card">
              {/* Summary header */}
              <div className="ucart__sum-head">
                <div className="ucart__sum-head-icon">
                  <Receipt size={15} />
                </div>
                <span className="ucart__sum-head-title">Order Summary</span>
              </div>

              <div className="ucart__sum-body">
                {/* Available offers / coupons */}
                {coupons.length > 0 && (
                  <div className="ucart__offers-block">
                    <div className="ucart__offers-label">
                      <BadgePercent size={13} />
                      <span>Available Offers</span>
                    </div>
                    <div className="ucart__offers-list">
                      {coupons.slice(0, 2).map((c, idx) => (
                        <div
                          key={c.id}
                          className={`ucart__offer-card${idx === 0 ? " ucart__offer-card--best" : ""}`}
                          onClick={() =>
                            navigate("/user/checkout", {
                              state: { couponCode: c.code },
                            })
                          }
                          role="button"
                          tabIndex={0}>
                          {idx === 0 && (
                            <span className="ucart__offer-best-badge">
                              <Star size={9} /> BEST
                            </span>
                          )}
                          <p className="ucart__offer-desc">{c.bannerText}</p>
                          <div className="ucart__offer-row">
                            <span className="ucart__offer-hint">
                              Tap to apply at checkout
                            </span>
                            <span className="ucart__offer-code">{c.code}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price rows */}
                <div className="ucart__price-rows">
                  <div className="ucart__price-row">
                    <span>
                      Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"}
                      )
                    </span>
                    <span className="ucart__price-row-val">
                      ₹{subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="ucart__price-row">
                    <span>Delivery Fee</span>
                    <span className="ucart__price-row-free">
                      <Zap size={11} /> FREE
                    </span>
                  </div>
                </div>

                <div className="ucart__dashed-hr" />

                {/* Total payable */}
                <div className="ucart__total-box">
                  <div>
                    <p className="ucart__total-box-label">Total Payable</p>
                    <p className="ucart__total-box-note">All taxes included</p>
                  </div>
                  <span className="ucart__total-box-amount">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>

                {/* Delivery address */}
                <div className="ucart__addr-block">
                  <div className="ucart__addr-block-label">
                    <MapPin size={13} /> Delivery Address
                  </div>

                  {defaultAddress ? (
                    <div className="ucart__addr-content">
                      <p className="ucart__addr-line1">
                        {defaultAddress.addressLine1}
                      </p>
                      <p className="ucart__addr-city">
                        {defaultAddress.city}, {defaultAddress.state}
                      </p>
                      <div className="ucart__addr-footer">
                        <span className="ucart__addr-default-badge">
                          <CheckCircle size={10} /> Default
                        </span>
                        <button
                          className="ucart__addr-change-btn"
                          onClick={() => navigate("/user/settings")}>
                          Change <ChevronRight size={11} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="ucart__addr-missing">
                      <AlertTriangle size={24} />
                      <p>No delivery address set</p>
                      <button
                        className="ucart__add-addr-btn"
                        onClick={() => navigate("/user/settings")}>
                        <MapPin size={12} /> Add Address
                      </button>
                    </div>
                  )}
                </div>

                {/* Checkout CTA */}
                <button
                  className="ucart__checkout-btn"
                  disabled={!defaultAddress}
                  onClick={proceedToCheckout}>
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={17} />
                </button>

                {!defaultAddress && (
                  <p className="ucart__checkout-disabled-note">
                    Add a delivery address to enable checkout
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
