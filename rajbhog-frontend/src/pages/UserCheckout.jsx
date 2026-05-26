// src/pages/UserCheckout.jsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { getMyCart } from "../api/user/cartApi";
import { getMyAddresses } from "../api/user/addressApi";
import { placeOrder } from "../api/user/orderApi";
import { applyCoupon } from "../api/user/couponApi";
import { fetchWallet } from "../api/user/walletApi";
import {
  createPayment,
  createRazorpayOrder,
  verifyPayment,
} from "../api/user/paymentApi";

import {
  ArrowLeft,
  MapPin,
  Package,
  CreditCard,
  Smartphone,
  Building2,
  Truck,
  ShieldCheck,
  X,
  CheckCircle,
  ReceiptText,
  BadgePercent,
  Wallet,
  ChevronRight,
  Clock,
  Zap,
  Lock,
} from "lucide-react";

import "../styles/UserCheckout.css";

/* ── Payment options ─────────────────────────────────────── */
const PAYMENT_OPTIONS = [
  {
    key: "COD",
    icon: <Truck size={18} />,
    title: "Cash on Delivery",
    desc: "Pay when order arrives",
    color: "green",
  },
  {
    key: "UPI",
    icon: <Smartphone size={18} />,
    title: "UPI",
    desc: "GPay, PhonePe, Paytm",
    color: "blue",
  },
  {
    key: "CARD",
    icon: <CreditCard size={18} />,
    title: "Credit / Debit Card",
    desc: "Visa, MasterCard, RuPay",
    color: "violet",
  },
  {
    key: "NET_BANKING",
    icon: <Building2 size={18} />,
    title: "Net Banking",
    desc: "All major banks supported",
    color: "amber",
  },
];

/* ============================================================
   COMPONENT
   ============================================================ */
export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [cartItems, setCartItems] = useState([]);
  const [address, setAddress] = useState(null);
  const [coupon, setCoupon] = useState("");
  const [loading, setLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [wallet, setWallet] = useState(null);
  const [useWallet, setUseWallet] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cartRes, addrRes, walletRes] = await Promise.all([
        getMyCart(),
        getMyAddresses(),
        fetchWallet(),
      ]);
      setCartItems(cartRes.data || []);
      setWallet(walletRes.data);
      const defaultAddress = addrRes.data.find((a) => a.isDefault);
      if (!defaultAddress) {
        toast.error("No default address found. Please add one in Settings.", {
          icon: "📍",
          duration: 4000,
        });
        navigate("/user/settings");
        return;
      }
      setAddress(defaultAddress);
    } catch {
      toast.error("Couldn't load checkout. Please try again.", {
        icon: "⚠️",
        duration: 3500,
      });
    }
  };

  const subtotal = cartItems.reduce((s, i) => s + Number(i.totalPrice), 0);
  const itemCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const total = Math.max(subtotal - discount, 0);
  const walletBalance = wallet?.balance || 0;
  const walletUsed = useWallet ? Math.min(walletBalance, total) : 0;
  const finalPayable = total - walletUsed;
  const isFullyPaid = finalPayable === 0;

  useEffect(() => {
    if (isFullyPaid) setPaymentMethod("WALLET");
  }, [isFullyPaid]);

  useEffect(() => {
    if (location.state?.couponCode && subtotal > 0)
      handleApplyCouponAuto(location.state.couponCode);
  }, [location.state, subtotal]);

  const handleApplyCouponAuto = async (code) => {
    if (appliedCoupon === code) return;
    try {
      const res = await applyCoupon({ code, orderAmount: subtotal });
      setDiscount(Number(res.data.discount));
      setAppliedCoupon(res.data.code);
      setCoupon(res.data.code);
      toast.success(
        `🎉 "${res.data.code}" applied — you save ₹${res.data.discount}!`,
        { duration: 3000 },
      );
    } catch (e) {
      toast.error(e.response?.data?.message || "Coupon could not be applied.", {
        icon: "❌",
        duration: 3500,
      });
    }
  };

  const handleApplyCoupon = async () => {
    if (!coupon.trim()) return;
    setApplyingCoupon(true);
    try {
      const res = await applyCoupon({
        code: coupon.trim(),
        orderAmount: subtotal,
      });
      setDiscount(Number(res.data.discount));
      setAppliedCoupon(res.data.code);
      setCoupon(res.data.code);
      toast.success(
        `✅ "${res.data.code}" applied — saving ₹${res.data.discount}!`,
        { duration: 3000 },
      );
    } catch (e) {
      setDiscount(0);
      setAppliedCoupon(null);
      toast.error(
        e.response?.data?.message || "Invalid or expired coupon code.",
        { icon: "❌", duration: 3500 },
      );
    } finally {
      setApplyingCoupon(false);
    }
  };

  const clearCoupon = () => {
    setCoupon("");
    setAppliedCoupon(null);
    setDiscount(0);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderRes = await placeOrder({
        couponCode: coupon || null,
        useWallet: useWallet || false,
      });
      const orderNumber = orderRes.data.orderNumber;
      const finalAmount = orderRes.data.finalAmount;

      if (finalAmount === 0) {
        toast.success("🎉 Order placed using wallet balance!", {
          duration: 3000,
        });
        navigate("/user/orders");
        return;
      }

      await createPayment(orderNumber, { paymentMethod });

      if (paymentMethod === "COD") {
        toast.success(
          "🎉 Order placed successfully! Cash on delivery selected.",
          { duration: 3000 },
        );
        navigate("/user/orders");
        return;
      }

      const res = await createRazorpayOrder(orderNumber);
      const options = {
        key: "rzp_test_SdPjHhxR9DivA1",
        amount: res.data.amount,
        currency: "INR",
        order_id: res.data.gatewayOrderId,
        handler: async function (response) {
          await verifyPayment({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          toast.success("✅ Payment successful! Your order is confirmed.", {
            duration: 3000,
          });
          navigate("/user/orders");
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      let message =
        e.response?.data?.message ||
        e.response?.data ||
        e.message ||
        "Something went wrong.";
      const msg = message.toLowerCase();
      if (msg.includes("minimum order"))
        message = "Order amount is below the minimum required for this coupon.";
      else if (msg.includes("already used"))
        message = "You've already used this coupon before.";
      toast.error(message, { icon: "⚠️", duration: 4000 });
    } finally {
      setLoading(false);
    }
  };

  if (!cartItems.length || !address) return null;

  return (
    <div className="uck-root">
      {/* ── BACK ROW ─────────────────────────────────────── */}
      <div className="uck-back-row">
        <button className="uck-back-btn" onClick={() => navigate("/user/cart")}>
          <ArrowLeft size={14} />
          <span>Back to Cart</span>
        </button>
      </div>

      {/* ── PAGE HEADER ──────────────────────────────────── */}
      <div className="uck-header">
        <div className="uck-header-left">
          <div className="uck-header-icon">
            <CheckCircle size={22} />
          </div>
          <div className="uck-header-text">
            <h1 className="uck-header-title">Checkout</h1>
            <p className="uck-header-sub">
              Review your order and complete payment
            </p>
          </div>
        </div>
        <div className="uck-header-right">
          <span className="uck-item-badge">
            <Package size={12} />
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
          <span className="uck-secure-badge">
            <Lock size={11} />
            Secure
          </span>
        </div>
      </div>

      {/* ── CONTENT GRID ─────────────────────────────────── */}
      <div className="uck-layout">
        {/* ───────── LEFT / MAIN ───────── */}
        <div className="uck-main">
          {/* DELIVERY ADDRESS */}
          <div className="uck-card">
            <div className="uck-card-head">
              <div className="uck-card-head-left">
                <div className="uck-card-icon uck-icon-violet">
                  <MapPin size={15} />
                </div>
                <h3 className="uck-card-title">Delivery Address</h3>
              </div>
              <span className="uck-badge uck-badge-green">
                <CheckCircle size={10} /> Default
              </span>
            </div>
            <div className="uck-card-body">
              <div className="uck-addr-wrap">
                <div className="uck-addr-icon">
                  <MapPin size={15} />
                </div>
                <div className="uck-addr-content">
                  <p className="uck-addr-line1">{address.addressLine1}</p>
                  {address.addressLine2 && (
                    <p className="uck-addr-line2">{address.addressLine2}</p>
                  )}
                  <p className="uck-addr-city">
                    {address.city}, {address.state} &mdash; {address.pincode}
                  </p>
                </div>
                <button
                  className="uck-change-btn"
                  onClick={() => navigate("/user/settings")}>
                  Change <ChevronRight size={12} />
                </button>
              </div>

              <div className="uck-delivery-eta">
                <Clock size={13} />
                <span>
                  Estimated delivery: <strong>Today, 2–4 hrs</strong>
                </span>
              </div>
            </div>
          </div>

          {/* ORDER ITEMS */}
          <div className="uck-card">
            <div className="uck-card-head">
              <div className="uck-card-head-left">
                <div className="uck-card-icon uck-icon-orange">
                  <Package size={15} />
                </div>
                <h3 className="uck-card-title">Order Items</h3>
              </div>
              <span className="uck-badge uck-badge-muted">
                {cartItems.length}{" "}
                {cartItems.length === 1 ? "product" : "products"}
              </span>
            </div>
            <div className="uck-card-body uck-card-body-np">
              {cartItems.map((item, idx) => (
                <div
                  key={item.id}
                  className={`uck-item${idx < cartItems.length - 1 ? " uck-item-border" : ""}`}>
                  <div className="uck-item-ico">
                    <Package size={16} />
                  </div>
                  <div className="uck-item-info">
                    <p className="uck-item-name">{item.productName}</p>
                    <div className="uck-item-meta">
                      <span className="uck-item-unit">{item.unit}</span>
                      <span className="uck-item-sep">·</span>
                      <span className="uck-item-qty">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="uck-item-price">₹{item.totalPrice}</span>
                </div>
              ))}
            </div>
          </div>

          {/* PAYMENT METHOD */}
          <div className="uck-card">
            <div className="uck-card-head">
              <div className="uck-card-head-left">
                <div className="uck-card-icon uck-icon-blue">
                  <CreditCard size={15} />
                </div>
                <h3 className="uck-card-title">Payment Method</h3>
              </div>
            </div>
            <div className="uck-card-body">
              {!isFullyPaid ? (
                <div className="uck-pay-grid">
                  {PAYMENT_OPTIONS.map((opt) => {
                    const active = paymentMethod === opt.key;
                    return (
                      <div
                        key={opt.key}
                        className={`uck-pay-card${active ? ` uck-pay-active uck-pay-${opt.color}` : ""}`}
                        onClick={() => setPaymentMethod(opt.key)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) =>
                          e.key === "Enter" && setPaymentMethod(opt.key)
                        }>
                        <div className="uck-pay-radio">
                          <span
                            className={`uck-pay-dot${active ? " uck-pay-dot-on" : ""}`}
                          />
                        </div>
                        <div className={`uck-pay-ico uck-pay-ico-${opt.color}`}>
                          {opt.icon}
                        </div>
                        <div className="uck-pay-info">
                          <p className="uck-pay-title">{opt.title}</p>
                          <p className="uck-pay-desc">{opt.desc}</p>
                        </div>
                        {active && (
                          <div className="uck-pay-check">
                            <CheckCircle size={16} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="uck-wallet-paid">
                  <div className="uck-wallet-paid-icon">
                    <Wallet size={20} />
                  </div>
                  <div>
                    <p className="uck-wallet-paid-title">
                      Fully Paid via Wallet
                    </p>
                    <p className="uck-wallet-paid-sub">
                      No additional payment required
                    </p>
                  </div>
                  <CheckCircle size={20} className="uck-wallet-paid-check" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ───────── RIGHT / SIDEBAR ───────── */}
        <div className="uck-sidebar">
          <div className="uck-summary-card">
            {/* Summary header */}
            <div className="uck-sum-head">
              <div className="uck-sum-head-left">
                <div className="uck-card-icon uck-icon-orange">
                  <ReceiptText size={15} />
                </div>
                <h3 className="uck-card-title">Order Summary</h3>
              </div>
            </div>

            <div className="uck-sum-body">
              {/* Price rows */}
              <div className="uck-sum-rows">
                <div className="uck-sum-row">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="uck-sum-row uck-sum-row-disc">
                    <span>
                      Discount
                      {appliedCoupon && (
                        <span className="uck-coupon-inline-tag">
                          {appliedCoupon}
                        </span>
                      )}
                    </span>
                    <span>− ₹{discount.toFixed(2)}</span>
                  </div>
                )}
                {walletUsed > 0 && (
                  <div className="uck-sum-row uck-sum-row-wallet">
                    <span>Wallet Used</span>
                    <span>− ₹{walletUsed.toFixed(2)}</span>
                  </div>
                )}
                <div className="uck-sum-row">
                  <span>Delivery</span>
                  <span className="uck-free-tag">
                    <Zap size={11} /> FREE
                  </span>
                </div>
              </div>

              <div className="uck-hr" />

              {/* COUPON */}
              <div className="uck-coupon-block">
                <p className="uck-coupon-label">
                  <BadgePercent size={13} /> Coupon Code
                </p>
                <div className="uck-coupon-row">
                  <input
                    className={`uck-coupon-input${appliedCoupon ? " uck-coupon-applied" : ""}`}
                    type="text"
                    placeholder="e.g. SAVE10"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                    disabled={!!appliedCoupon}
                  />
                  {appliedCoupon ? (
                    <button
                      className="uck-coupon-clear"
                      onClick={clearCoupon}
                      title="Remove coupon">
                      <X size={13} />
                    </button>
                  ) : (
                    <button
                      className="uck-coupon-apply"
                      onClick={handleApplyCoupon}
                      disabled={applyingCoupon || !coupon.trim()}>
                      {applyingCoupon ? "…" : "Apply"}
                    </button>
                  )}
                </div>
                {appliedCoupon && (
                  <div className="uck-coupon-success-msg">
                    <CheckCircle size={12} />
                    <span>
                      "{appliedCoupon}" — saving ₹{discount.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* WALLET */}
              <div className="uck-wallet-block">
                <div className="uck-wallet-row">
                  <label className="uck-wallet-label">
                    <div className="uck-wallet-checkbox-wrap">
                      <input
                        type="checkbox"
                        checked={useWallet}
                        onChange={(e) => setUseWallet(e.target.checked)}
                        disabled={walletBalance === 0}
                        className="uck-wallet-checkbox"
                      />
                    </div>
                    <div className="uck-wallet-label-content">
                      <Wallet size={14} />
                      <span>Use Wallet Balance</span>
                    </div>
                  </label>
                  <span
                    className={`uck-wallet-balance${walletBalance === 0 ? " uck-wallet-empty" : ""}`}>
                    ₹{walletBalance.toFixed(2)}
                  </span>
                </div>
                {useWallet && walletUsed > 0 && (
                  <div className="uck-wallet-deduct">
                    <CheckCircle size={11} />₹{walletUsed.toFixed(2)} will be
                    deducted from wallet
                  </div>
                )}
                {walletBalance === 0 && (
                  <p className="uck-wallet-empty-note">Your wallet is empty</p>
                )}
              </div>

              <div className="uck-hr" />

              {/* TOTAL */}
              <div className="uck-total-box">
                <div className="uck-total-left">
                  <p className="uck-total-label">Total Payable</p>
                  <p className="uck-total-note">Inclusive of all taxes</p>
                </div>
                <span className="uck-total-amount">
                  ₹{finalPayable.toFixed(2)}
                </span>
              </div>

              {/* Free delivery chip */}
              <div className="uck-delivery-chip">
                <Truck size={13} />
                <span>Free doorstep delivery on this order</span>
              </div>

              {/* PLACE ORDER */}
              <button
                className="uck-place-btn"
                disabled={loading}
                onClick={handlePlaceOrder}>
                {loading ? (
                  <>
                    <span className="uck-btn-spinner" />
                    <span>Processing…</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    <span>Place Order</span>
                  </>
                )}
              </button>

              {/* Secure note */}
              <div className="uck-secure-note">
                <ShieldCheck size={13} />
                <span>100% secure &amp; encrypted checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
