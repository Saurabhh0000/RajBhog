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
  Tag,
  ShieldCheck,
  X,
  CheckCircle,
  ReceiptText,
  BadgePercent,
} from "lucide-react";

import "../styles/UserCheckout.css";

/* ── Payment options config ── */
const PAYMENT_OPTIONS = [
  {
    key: "COD",
    icon: <Truck size={20} />,
    title: "Cash on Delivery",
    desc: "Pay when your order arrives",
    color: "green",
  },
  {
    key: "UPI",
    icon: <Smartphone size={20} />,
    title: "UPI",
    desc: "Google Pay, PhonePe, Paytm",
    color: "blue",
  },
  {
    key: "CARD",
    icon: <CreditCard size={20} />,
    title: "Credit / Debit Card",
    desc: "Visa, MasterCard, RuPay",
    color: "violet",
  },
  {
    key: "NET_BANKING",
    icon: <Building2 size={20} />,
    title: "Net Banking",
    desc: "All major banks supported",
    color: "amber",
  },
];

/* ============================================================
   MAIN COMPONENT
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
        fetchWallet(), // ✅ ADD
      ]);

      setCartItems(cartRes.data || []);
      setWallet(walletRes.data); // ✅ ADD

      const defaultAddress = addrRes.data.find((a) => a.isDefault);
      if (!defaultAddress) {
        toast.error("No default address found. Please add one in settings.");
        navigate("/user/settings");
        return;
      }
      setAddress(defaultAddress);
    } catch {
      toast.error("Unable to load checkout details. Please try again.");
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
    if (isFullyPaid) {
      setPaymentMethod("WALLET");
    }
  }, [isFullyPaid]);

  useEffect(() => {
    if (location.state?.couponCode && subtotal > 0) {
      handleApplyCouponAuto(location.state.couponCode); // ✅ APPLY DIRECTLY
    }
  }, [location.state, subtotal]);

  const handleApplyCouponAuto = async (code) => {
    if (appliedCoupon === code) return;
    try {
      const res = await applyCoupon({
        code: code,
        orderAmount: subtotal,
      });

      setDiscount(Number(res.data.discount));
      setAppliedCoupon(res.data.code);
      setCoupon(res.data.code);

      toast.success(`${res.data.code} applied 🎉`);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to apply coupon");
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
        res.data.message || `Coupon "${res.data.code}" applied successfully!`,
      );
    } catch (e) {
      setDiscount(0);
      setAppliedCoupon(null);
      toast.error(
        e.response?.data?.message || "Invalid or expired coupon code.",
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

      // 💰 FULL WALLET PAYMENT
      if (finalAmount === 0) {
        toast.success("Order placed using wallet! 🎉");
        navigate("/user/orders");
        return;
      }

      await createPayment(orderNumber, { paymentMethod });

      if (paymentMethod === "COD") {
        toast.success("Your order has been placed successfully! 🎉");
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
          toast.success("Payment successful! Your order is confirmed. 🎉");
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
        message = "Order amount is too low to apply this coupon.";
      else if (msg.includes("already used"))
        message = "You have already used this coupon.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!cartItems.length || !address) return null;

  return (
    <div className="uck-root">
      {/* ══ BACK BUTTON — above header ══ */}
      <div className="uck-back-row">
        <button className="uck-back-btn" onClick={() => navigate("/user/cart")}>
          <ArrowLeft size={15} /> Back to Cart
        </button>
      </div>

      {/* ══ PAGE HEADER ══ */}
      <div className="uck-header">
        <div className="uck-header-left">
          <div className="uck-header-icon">
            <CheckCircle size={20} />
          </div>
          <div>
            <h1 className="uck-header-title">Checkout</h1>
            <p className="uck-header-sub">
              Review your order and complete payment
            </p>
          </div>
        </div>
        <span className="uck-item-badge">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
      </div>

      {/* ══ CONTENT GRID ══ */}
      <div className="uck-layout">
        {/* ─── LEFT COLUMN ─── */}
        <div className="uck-main">
          {/* DELIVERY ADDRESS */}
          <div className="uck-card">
            <div className="uck-card-head">
              <div className="uck-card-head-left">
                <div className="uck-card-icon uck-card-icon--violet">
                  <MapPin size={16} />
                </div>
                <h3>Delivery Address</h3>
              </div>
              <span className="uck-default-badge">
                <CheckCircle size={11} /> Default
              </span>
            </div>
            <div className="uck-card-body">
              <div className="uck-addr-row">
                <div className="uck-addr-pin">
                  <MapPin size={14} />
                </div>
                <div className="uck-addr-text">
                  <p className="uck-addr-line">{address.addressLine1}</p>
                  {address.addressLine2 && (
                    <p className="uck-addr-line">{address.addressLine2}</p>
                  )}
                  <p className="uck-addr-city">
                    {address.city}, {address.state} — {address.pincode}
                  </p>
                </div>
                <button
                  className="uck-btn-change"
                  onClick={() => navigate("/user/settings")}>
                  Change
                </button>
              </div>
            </div>
          </div>

          {/* ORDER ITEMS */}
          <div className="uck-card">
            <div className="uck-card-head">
              <div className="uck-card-head-left">
                <div className="uck-card-icon">
                  <Package size={16} />
                </div>
                <h3>Order Items</h3>
              </div>
              <span className="uck-count-badge">
                {cartItems.length}{" "}
                {cartItems.length === 1 ? "product" : "products"}
              </span>
            </div>
            <div className="uck-card-body uck-card-body--np">
              {cartItems.map((item, idx) => (
                <div
                  key={item.id}
                  className={`uck-item ${idx < cartItems.length - 1 ? "uck-item--border" : ""}`}>
                  <div className="uck-item-icon">
                    <Package size={17} />
                  </div>
                  <div className="uck-item-info">
                    <p className="uck-item-name">{item.productName}</p>
                    <div className="uck-item-meta">
                      <span className="uck-item-unit">{item.unit}</span>
                      <span className="uck-item-qty">× {item.quantity}</span>
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
                <div className="uck-card-icon uck-card-icon--blue">
                  <CreditCard size={16} />
                </div>
                <h3>Payment Method</h3>
              </div>
            </div>
            <div className="uck-card-body">
              {/* 💰 CHECK IF FULLY PAID BY WALLET */}
              {/* PAYMENT METHOD */}
              {!isFullyPaid ? (
                <div className="uck-payment-grid">
                  {PAYMENT_OPTIONS.map((opt) => (
                    <div
                      key={opt.key}
                      className={`uck-pay-opt ${
                        paymentMethod === opt.key
                          ? `uck-pay-opt--on uck-pay-opt--${opt.color}`
                          : ""
                      }`}
                      onClick={() => setPaymentMethod(opt.key)}>
                      {/* radio */}
                      <div className="uck-pay-radio">
                        <span
                          className={`uck-pay-radio-dot ${
                            paymentMethod === opt.key
                              ? "uck-pay-radio-dot--on"
                              : ""
                          }`}
                        />
                      </div>

                      {/* icon */}
                      <div className={`uck-pay-ico uck-pay-ico--${opt.color}`}>
                        {opt.icon}
                      </div>

                      {/* info */}
                      <div className="uck-pay-info">
                        <p className="uck-pay-title">{opt.title}</p>
                        <p className="uck-pay-desc">{opt.desc}</p>
                      </div>

                      {/* selected check */}
                      {paymentMethod === opt.key && (
                        <div className="uck-pay-check">
                          <CheckCircle size={18} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                /* 🔥 WALLET FULL PAYMENT UI */
                <div className="uck-wallet-full">
                  <div className="uck-wallet-full-box">
                    <CheckCircle size={20} color="#16a34a" />
                    <div>
                      <p className="uck-wallet-full-title">Paid using Wallet</p>
                      <p className="uck-wallet-full-desc">
                        No additional payment required
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── RIGHT SIDEBAR ─── */}
        <div className="uck-sidebar">
          <div className="uck-summary-card">
            {/* Summary heading */}
            <div className="uck-sum-head">
              <div className="uck-sum-head-left">
                <div className="uck-card-icon">
                  <ReceiptText size={16} />
                </div>
                <h3>Order Summary</h3>
              </div>
            </div>

            <div className="uck-sum-body">
              {/* Rows */}
              <div className="uck-sum-rows">
                <div className="uck-sum-row">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="uck-sum-row uck-sum-row--disc">
                    <span className="uck-discount-label">
                      Discount
                      {appliedCoupon && (
                        <span className="uck-coupon-tag">{appliedCoupon}</span>
                      )}
                    </span>
                    <span>− ₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="uck-sum-row">
                  <span>Delivery</span>
                  <span className="uck-free">FREE</span>
                </div>
              </div>

              <div className="uck-divider" />

              {/* COUPON */}
              <div className="uck-coupon-block">
                <label className="uck-coupon-label">
                  <BadgePercent size={13} /> Coupon Code
                </label>
                <div className="uck-coupon-row">
                  <input
                    className={`uck-coupon-input ${appliedCoupon ? "uck-coupon-input--applied" : ""}`}
                    type="text"
                    placeholder="Enter code (e.g. SAVE10)"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                    disabled={!!appliedCoupon}
                  />
                  {appliedCoupon ? (
                    <button className="uck-btn-clear" onClick={clearCoupon}>
                      <X size={13} />
                    </button>
                  ) : (
                    <button
                      className="uck-btn-apply"
                      onClick={handleApplyCoupon}
                      disabled={applyingCoupon || !coupon.trim()}>
                      {applyingCoupon ? "…" : "Apply"}
                    </button>
                  )}
                </div>
                {appliedCoupon && (
                  <div className="uck-coupon-success">
                    <CheckCircle size={12} />
                    <span>
                      "{appliedCoupon}" applied — saving ₹{discount.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* 💰 WALLET */}
              <div className="uck-wallet-box">
                <div className="uck-wallet-row">
                  <label>
                    <input
                      type="checkbox"
                      checked={useWallet}
                      onChange={(e) => setUseWallet(e.target.checked)}
                      disabled={walletBalance === 0}
                    />
                    Use Wallet Balance
                  </label>

                  <span>₹{walletBalance.toFixed(2)}</span>
                </div>

                {useWallet && walletUsed > 0 && (
                  <div className="uck-wallet-used">
                    Wallet Used: − ₹{walletUsed.toFixed(2)}
                  </div>
                )}
              </div>

              <div className="uck-divider" />

              {/* TOTAL */}
              <div className="uck-total-row">
                <div>
                  <p className="uck-total-label">Total Payable</p>
                  <p className="uck-total-note">Inclusive of all taxes</p>
                </div>
                <span className="uck-total-val">
                  ₹{finalPayable.toFixed(2)}
                </span>
              </div>

              {/* Delivery chip */}
              <div className="uck-delivery-chip">
                <Truck size={13} />
                <span>Free doorstep delivery on this order</span>
              </div>

              {/* PLACE ORDER */}
              <button
                className="uck-btn-order"
                disabled={loading}
                onClick={handlePlaceOrder}>
                {loading ? (
                  <>
                    <div className="uck-spinner" />
                    Processing…
                  </>
                ) : (
                  <>
                    <CheckCircle size={17} />
                    Place Order
                  </>
                )}
              </button>

              {/* Secure note */}
              <div className="uck-secure">
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
