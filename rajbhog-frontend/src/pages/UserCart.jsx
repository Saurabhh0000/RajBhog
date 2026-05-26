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

  /* ── LOAD CART — original logic ── */
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

  /* ── LOAD ADDRESSES — original logic ── */
  const loadAddresses = async () => {
    try {
      const res = await getMyAddresses();
      const def = res.data?.find((a) => a.isDefault);
      if (def) {
        setDefaultAddress(def);
      } else if (res.data?.length > 0) {
        setDefaultAddress(res.data[0]);
      }
    } catch {
      setDefaultAddress(null);
    }
  };

  useEffect(() => {
    loadCart();
    loadAddresses();
  }, []);

  /* ── UPDATE QTY — original logic ── */
  const handleQtyChange = async (id, qty) => {
    if (qty < 1) return;
    try {
      await updateQuantity(id, qty);
      toast.success("Quantity updated successfully");
      loadCart();
    } catch (e) {
      toast.error(
        e.response?.data?.message ||
          "Couldn't update quantity. Please try again.",
      );
    }
  };

  /* ── REMOVE ITEM — original logic ── */
  const handleRemove = async (id) => {
    await removeItem(id);
    toast.success("Item removed from cart");
    loadCart();
  };

  /* ── CLEAR CART — original logic ── */
  const handleClear = async () => {
    await clearCart();
    toast.success("Your cart has been cleared");
    setItems([]);
  };

  /* ── PROCEED — original logic ── */
  const proceedToCheckout = () => {
    if (!defaultAddress) {
      toast.error("Please add a delivery address before checkout");
      navigate("/user/settings");
      return;
    }
    navigate("/user/checkout");
  };

  const subtotal = items.reduce((sum, i) => sum + Number(i.totalPrice), 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => {
    if (subtotal <= 0) return;
    getAvailableCoupons(subtotal)
      .then((res) => setCoupons(res.data))
      .catch(() => setCoupons([]));
  }, [subtotal]);

  /* ── LOADING STATE ── */
  if (loading) {
    return (
      <div className="ucart__empty">
        <div className="ucart__empty-card">
          <div
            className="ucart__empty-icon-wrap"
            style={{ background: "#f1f5f9", borderColor: "#e2e8f0" }}>
            <ShoppingCart size={44} color="#94a3b8" />
          </div>
          <p
            style={{
              fontSize: 14,
              color: "#94a3b8",
              fontWeight: 600,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
            Loading your cart…
          </p>
        </div>
      </div>
    );
  }

  /* ── EMPTY STATE ── */
  if (items.length === 0) {
    return (
      <div className="ucart__empty">
        <div className="ucart__empty-card">
          <div className="ucart__empty-icon-wrap">
            <ShoppingCart size={44} />
          </div>
          <h3 className="ucart__empty-title">Your cart is empty</h3>
          <p className="ucart__empty-sub">
            Looks like you haven't added anything yet. Explore fresh groceries,
            cooking oils, spices and more from RAJBHOG.
          </p>
          <div className="ucart__empty-hint">
            💡 Tip — Browse categories or search for products to add them to
            your cart
          </div>
          <button
            className="ucart__btn-shop"
            onClick={() => navigate("/user/categories")}>
            <ShoppingBag size={16} /> Start Shopping
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
        {/* ══════════ HEADER ══════════ */}
        <div className="ucart__header">
          <div className="ucart__header-inner">
            <div className="ucart__title-group">
              <div className="ucart__title-icon">
                <ShoppingCart size={22} />
              </div>
              <h1 className="ucart__title">Shopping Cart</h1>
              <span className="ucart__item-badge">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            </div>
            <button className="ucart__btn-clear" onClick={handleClear}>
              <Trash2 size={14} /> Clear Cart
            </button>
          </div>
        </div>

        {/* ══════════ MAIN CONTENT ══════════ */}
        <div className="ucart__content">
          {/* ── ITEMS LIST ── */}
          <div className="ucart__items">
            {items.map((item) => (
              <div key={item.id} className="ucart__item">
                {/* head: icon + name + unit + remove */}
                <div className="ucart__item-head">
                  <div className="ucart__item-left">
                    <div className="ucart__item-ico">
                      <Package size={22} />
                    </div>
                    <div className="ucart__item-meta">
                      <span
                        className="ucart__item-name"
                        title={item.productName}>
                        {item.productName}
                      </span>
                      <span className="ucart__item-unit">{item.unit}</span>
                      <span className="ucart__item-unit-price-mob">
                        <Tag size={11} />₹{item.price} each
                      </span>
                    </div>
                  </div>
                  <button
                    className="ucart__btn-remove"
                    onClick={() => handleRemove(item.id)}
                    aria-label={`Remove ${item.productName}`}
                    title="Remove item">
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* foot: unit price | qty stepper | item total */}
                <div className="ucart__item-foot">
                  <div className="ucart__price-chip">
                    <span className="ucart__price-chip-lbl">Unit Price</span>
                    <span className="ucart__price-chip-val">₹{item.price}</span>
                  </div>

                  <div className="ucart__qty-stepper">
                    <button
                      className="ucart__qty-btn"
                      disabled={item.quantity === 1}
                      onClick={() =>
                        handleQtyChange(item.id, item.quantity - 1)
                      }
                      aria-label="Decrease quantity">
                      <Minus size={14} />
                    </button>
                    <div className="ucart__qty-sep" />
                    <input
                      className="ucart__qty-num"
                      type="number"
                      value={item.quantity}
                      readOnly
                      aria-label="Quantity"
                    />
                    <div className="ucart__qty-sep" />
                    <button
                      className="ucart__qty-btn"
                      onClick={() =>
                        handleQtyChange(item.id, item.quantity + 1)
                      }
                      aria-label="Increase quantity">
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="ucart__total-chip">
                    <span className="ucart__total-chip-lbl">Total</span>
                    <span className="ucart__total-chip-val">
                      ₹{item.totalPrice}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── ORDER SUMMARY ── */}
          <div className="ucart__summary">
            <div className="ucart__summary-head">
              <div className="ucart__summary-head-ico">
                <Receipt size={16} />
              </div>
              <span className="ucart__summary-title">Order Summary</span>
            </div>

            <div className="ucart__summary-body">
              {/* ── AVAILABLE OFFERS ── */}
              {coupons.length > 0 && (
                <div className="ucart__offer-box">
                  <div className="ucart__offer-head">
                    <Tag size={13} /> Available Offers
                  </div>
                  <div className="ucart__offer-list">
                    {coupons.slice(0, 2).map((c, index) => (
                      <div
                        key={c.id}
                        className={`ucart__offer-item ${index === 0 ? "ucart__offer-item--best" : ""}`}
                        onClick={() =>
                          navigate("/user/checkout", {
                            state: { couponCode: c.code },
                          })
                        }>
                        {index === 0 && (
                          <span className="ucart__best-tag">BEST</span>
                        )}
                        <p className="ucart__offer-text">{c.bannerText}</p>
                        <div className="ucart__offer-footer">
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

              {/* subtotal */}
              <div className="ucart__bill-row">
                <span>
                  Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
                </span>
                <span className="ucart__bill-val">₹{subtotal.toFixed(2)}</span>
              </div>

              {/* delivery */}
              <div className="ucart__bill-row">
                <span>Delivery Fee</span>
                <span className="ucart__bill-free">
                  <CheckCircle size={12} /> FREE
                </span>
              </div>

              <hr className="ucart__summary-dashed" />

              {/* total */}
              <div className="ucart__total-row">
                <span className="ucart__total-lbl">Total Payable</span>
                <span className="ucart__total-val">₹{subtotal.toFixed(2)}</span>
              </div>

              {/* delivery address */}
              <div className="ucart__addr-block">
                <div className="ucart__addr-head">
                  <MapPin size={14} /> Delivery Address
                </div>
                {defaultAddress ? (
                  <div>
                    <p className="ucart__addr-line1">
                      {defaultAddress.addressLine1}
                    </p>
                    <p className="ucart__addr-city">
                      {defaultAddress.city}, {defaultAddress.state}
                    </p>
                    <span className="ucart__addr-badge">
                      <CheckCircle size={10} /> Default
                    </span>
                  </div>
                ) : (
                  <div className="ucart__addr-warn">
                    <AlertTriangle size={28} />
                    <p>No delivery address set yet</p>
                    <button
                      className="ucart__btn-add-addr"
                      onClick={() => navigate("/user/settings")}>
                      <MapPin size={12} /> Add Address
                    </button>
                  </div>
                )}
              </div>

              {/* checkout button */}
              <button
                className="ucart__btn-checkout"
                disabled={!defaultAddress}
                onClick={proceedToCheckout}>
                Proceed to Checkout <ArrowRight size={17} />
              </button>

              {!defaultAddress && (
                <p className="ucart__checkout-note">
                  Add a delivery address to enable checkout
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
