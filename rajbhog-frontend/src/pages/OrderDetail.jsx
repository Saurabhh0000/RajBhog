// src/pages/OrderDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getOrderByNumber,
  cancelOrder,
  getInvoice,
  requestReturn,
} from "../api/user/orderApi";
import "../styles/OrderDetail.css";
import ReturnModal from "../pages/ReturnModal";

import {
  ArrowLeft,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  FileText,
  ShoppingCart,
  CreditCard,
  IndianRupee,
  ShieldCheck,
  BadgeCheck,
  Printer,
  Download,
  X,
  Banknote,
  Hash,
  Receipt,
  HelpCircle,
  AlertTriangle,
  Wallet,
  Building,
  CheckSquare,
  CircleAlert,
  ClipboardList,
  Star,
  PartyPopper,
  CheckCircle2,
  RefreshCcw,
} from "lucide-react";

/* ── Status config ── */
const STATUS_CFG = {
  PLACED: { label: "Order Placed", color: "placed", Icon: CheckSquare },
  CONFIRMED: { label: "Confirmed", color: "confirmed", Icon: BadgeCheck },
  PACKED: { label: "Packed", color: "packed", Icon: Package },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", color: "ofd", Icon: Truck },
  DELIVERED: { label: "Delivered", color: "delivered", Icon: CheckCircle },

  CANCELLED: { label: "Cancelled", color: "cancelled", Icon: XCircle },

  // 🔥 ADD THESE
  RETURN_REQUESTED: {
    label: "Return Requested",
    color: "return-requested",
    Icon: RefreshCcw,
  },
  RETURN_APPROVED: {
    label: "Return Approved",
    color: "return-approved",
    Icon: CheckCircle2,
  },
  RETURN_REJECTED: {
    label: "Return Rejected",
    color: "return-rejected",
    Icon: XCircle,
  },
};

const TIMELINE_ORDER = [
  "PLACED",
  "CONFIRMED",
  "PACKED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "RETURN_REQUESTED",
  "RETURN_APPROVED",
  "RETURN_REJECTED",
];

function getTimeline(status) {
  // ❌ CANCEL FLOW
  if (status === "CANCELLED") {
    return ["PLACED", "CANCELLED"];
  }

  // 🔁 RETURN FLOW (ALL CASES)
  if (
    status === "RETURN_REQUESTED" ||
    status === "RETURN_APPROVED" ||
    status === "RETURN_REJECTED"
  ) {
    const base = [
      "PLACED",
      "CONFIRMED",
      "PACKED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
    ];

    if (status === "RETURN_REQUESTED") {
      return [...base, "RETURN_REQUESTED"];
    }

    return [...base, "RETURN_REQUESTED", status];
  }

  // ✅ NORMAL FLOW
  return TIMELINE_ORDER.slice(0, TIMELINE_ORDER.indexOf(status) + 1);
}

/* ── Payment icon helper ── */
function PaymentIcon({ method, size = 16 }) {
  const m = (method || "").toLowerCase();
  if (m.includes("upi")) return <CreditCard size={size} />;
  if (m.includes("card") || m.includes("credit") || m.includes("debit"))
    return <CreditCard size={size} />;
  if (m.includes("net") || m.includes("banking"))
    return <Building size={size} />;
  if (m.includes("wallet")) return <Wallet size={size} />;
  return <Banknote size={size} />;
}

/* ── Format date ── */
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ── Is online payment ── */
function isOnlinePayment(method) {
  if (!method) return false;
  const m = method.toLowerCase();
  return !m.includes("cash") && !m.includes("cod");
}

/* ============================================================
   MAIN COMPONENT — ALL ORIGINAL LOGIC PRESERVED
   ============================================================ */
export default function OrderDetail() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState(null);

  const [returnOrder, setReturnOrder] = useState(null);

  /* ── LOAD ORDER — original logic ── */
  const loadOrder = async () => {
    try {
      const res = await getOrderByNumber(orderNumber);
      setOrder(res.data);
    } catch {
      toast.error("Order not found. Redirecting to your orders.");
      navigate("/user/orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderNumber]);

  /* ── CANCEL — original logic, improved toast ── */
  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await cancelOrder(order.orderNumber);
      toast.success("Your order has been cancelled successfully.");
      loadOrder();
    } catch (e) {
      toast.error(
        e?.response?.data?.message ||
          "Unable to cancel this order at the moment.",
      );
    }
  };

  const submitReturn = async () => {
    if (!returnReason.trim()) {
      toast.error("Please enter return reason");
      return;
    }

    try {
      setReturnLoading(true);
      await requestReturn(order.orderNumber, returnReason);
      toast.success("Return request submitted");
      setShowReturnModal(false);
      setReturnReason("");
      loadOrder();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to request return");
    } finally {
      setReturnLoading(false);
    }
  };
  /* ── INVOICE actions — original logic ── */
  const handleViewInvoice = async () => {
    try {
      const res = await getInvoice(order.orderNumber);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setInvoiceUrl(url);
      setShowInvoice(true);
    } catch {
      toast.error("Failed to load invoice. Please try again.");
    }
  };

  const closeInvoice = () => {
    if (invoiceUrl) URL.revokeObjectURL(invoiceUrl);
    setShowInvoice(false);
    setInvoiceUrl(null);
  };

  const handleDownload = async () => {
    try {
      const res = await getInvoice(order.orderNumber);
      const url = URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice_${order.orderNumber}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download invoice. Please try again.");
    }
  };

  const handlePrint = () => {
    if (!invoiceUrl) return;
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = invoiceUrl;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      iframe.contentWindow.print();
    };
  };

  /* ── LOADING ── */
  if (loading || !order) {
    return (
      <div className="od-loading">
        <div className="od-spinner" />
        <p>Loading order details…</p>
      </div>
    );
  }

  /* ── derived ── */
  const statusCfg = STATUS_CFG[order.orderStatus] || STATUS_CFG.PLACED;
  const StatusIco = statusCfg.Icon;
  const timeline = getTimeline(order.orderStatus);
  const canCancel = ["PLACED", "CONFIRMED"].includes(order.orderStatus);
  const isOnline = isOnlinePayment(order.paymentMethod);

  /* ── STEP descriptions ── */
  const STEP_DESC = {
    PLACED: "Your order has been successfully placed.",
    CONFIRMED: "Our team has confirmed your order.",
    PACKED: "Your order is packed and ready for dispatch.",
    OUT_FOR_DELIVERY: "Your order is on its way to you.",
    DELIVERED: "Your order has been delivered. Enjoy!",
    CANCELLED: "This order was cancelled.",
    RETURN_REQUESTED: "You have requested a return.",
    RETURN_APPROVED: "Your return has been approved. Refund initiated.",
    RETURN_REJECTED: "Your return request was rejected.",
  };

  /* ─────────── RENDER ─────────── */
  return (
    <div className="od-root">
      {/* ════════════════════ TOPBAR ════════════════════ */}
      <div className="od-topbar">
        <button className="od-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={15} /> Back to Orders
        </button>

        <div className="od-topbar-main">
          <div className="od-order-ref">
            <span className="od-ref-label">Order Reference</span>
            <span className="od-ref-val">#{order.orderNumber}</span>
          </div>
          <span className={`od-status-pill od-status-pill--${statusCfg.color}`}>
            <StatusIco size={13} /> {statusCfg.label}
          </span>
        </div>

        <div className="od-topbar-date">
          <Clock size={13} />
          Ordered on {fmtDate(order.createdAt)}
        </div>
      </div>

      {/* ════════════════════ LAYOUT ════════════════════ */}
      <div className="od-layout">
        {/* ─────────── LEFT COLUMN ─────────── */}
        <div className="od-main">
          {/* ORDER TIMELINE */}
          <div className="od-card">
            <div className="od-card-head">
              <div className="od-card-icon">
                <Clock size={15} />
              </div>
              <h3>Order Timeline</h3>
            </div>
            <div className="od-card-body">
              <div className="od-timeline">
                {timeline.map((status, idx) => {
                  const cfg = STATUS_CFG[status] || STATUS_CFG.PLACED;
                  const Icon = cfg.Icon;

                  // step state logic
                  const isCompleted = idx < timeline.length - 1;
                  const isCurrent = idx === timeline.length - 1;

                  const cls = isCurrent
                    ? "current"
                    : isCompleted
                      ? "completed"
                      : "pending";

                  return (
                    <div key={status} className={`od-step od-step--${cls}`}>
                      <div className="od-step-dot">
                        <Icon size={cls === "pending" ? 14 : 15} />
                      </div>

                      {idx < timeline.length - 1 && (
                        <div className={`od-step-line od-step-line--${cls}`} />
                      )}

                      <div className="od-step-text">
                        <p className="od-step-title">{cfg.label}</p>
                        <p className="od-step-desc">{STEP_DESC[status]}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ORDER ITEMS */}
          <div className="od-card">
            <div className="od-card-head">
              <div className="od-card-icon">
                <ShoppingCart size={15} />
              </div>
              <h3>Order Items</h3>
              <span className="od-count-pill">
                {order.items.length}{" "}
                {order.items.length === 1 ? "item" : "items"}
              </span>
            </div>
            <div className="od-card-body od-card-body--np">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className={`od-item-row ${idx < order.items.length - 1 ? "od-item-row--border" : ""}`}>
                  <div className="od-item-icon">
                    <Package size={18} />
                  </div>
                  <div className="od-item-info">
                    <p className="od-item-name">{item.productName}</p>
                    <div className="od-item-meta">
                      <span className="od-item-unit">{item.unit}</span>
                      <span className="od-item-qty">× {item.quantity}</span>
                    </div>
                  </div>
                  <span className="od-item-price">₹{item.totalPrice}</span>
                </div>
              ))}
            </div>
          </div>

          {/* DELIVERY ADDRESS */}
          <div className="od-card">
            <div className="od-card-head">
              <div className="od-card-icon od-card-icon--violet">
                <MapPin size={15} />
              </div>
              <h3>Delivery Address</h3>
            </div>
            <div className="od-card-body">
              <div className="od-address-box">
                <div className="od-address-pin">
                  <MapPin size={14} />
                </div>
                <p className="od-address-text">{order.deliveryAddress}</p>
              </div>
            </div>
          </div>

          {/* PAYMENT DETAILS (online payments — main column) */}
          {isOnline && (
            <div className="od-card od-card--payment">
              <div className="od-card-head">
                <div className="od-card-icon od-card-icon--green">
                  <PaymentIcon method={order.paymentMethod} />
                </div>
                <h3>Payment Details</h3>
                <span className="od-paid-pill">
                  <CheckCircle size={11} /> Paid
                </span>
              </div>
              <div className="od-card-body">
                <div className="od-payment-grid">
                  <div className="od-pay-row">
                    <div className="od-pay-row-left">
                      <div className="od-pay-ico">
                        <PaymentIcon method={order.paymentMethod} />
                      </div>
                      <div>
                        <span className="od-pay-label">Payment Method</span>
                        <span className="od-pay-val">
                          {order.paymentMethod || "Online Payment"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="od-pay-row">
                    <div className="od-pay-row-left">
                      <div className="od-pay-ico od-pay-ico--green">
                        <CheckCircle size={16} />
                      </div>
                      <div>
                        <span className="od-pay-label">Payment Status</span>
                        <span className="od-pay-val od-pay-val--green">
                          {order.paymentStatus || "Paid"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {order.transactionId && (
                    <div className="od-pay-row">
                      <div className="od-pay-row-left">
                        <div className="od-pay-ico">
                          <Hash size={16} />
                        </div>
                        <div>
                          <span className="od-pay-label">Transaction ID</span>
                          <span className="od-pay-val od-pay-val--mono">
                            {order.transactionId}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="od-pay-row od-pay-row--highlight">
                    <div className="od-pay-row-left">
                      <div className="od-pay-ico od-pay-ico--brand">
                        <IndianRupee size={16} />
                      </div>
                      <div>
                        <span className="od-pay-label">Amount Paid</span>
                        <span className="od-pay-val od-pay-val--amount">
                          ₹{order.finalAmount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CANCELLATION INFO */}
          {order.cancellationCharge > 0 && (
            <div className="od-card od-card--warn">
              <div className="od-card-head od-card-head--warn">
                <div className="od-card-icon od-card-icon--warn">
                  <AlertTriangle size={15} />
                </div>
                <h3>Cancellation Information</h3>
              </div>
              <div className="od-card-body">
                <div className="od-cancel-row">
                  <span className="od-cancel-label">Cancellation Charge</span>
                  <span className="od-cancel-val od-cancel-val--red">
                    − ₹{order.cancellationCharge}
                  </span>
                </div>
                <div className="od-cancel-row od-cancel-row--refund">
                  <span className="od-cancel-label">Refund Amount</span>
                  <span className="od-cancel-val od-cancel-val--green">
                    ₹{order.refundAmount}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─────────── RIGHT SIDEBAR ─────────── */}
        <div className="od-sidebar">
          {/* ORDER SUMMARY */}
          <div className="od-card od-card--summary">
            <div className="od-card-head">
              <div className="od-card-icon">
                <ClipboardList size={15} />
              </div>
              <h3>Order Summary</h3>
            </div>
            <div className="od-card-body">
              {/* bill rows */}
              <div className="od-summary-rows">
                <div className="od-sum-row">
                  <span className="od-sum-row-lbl">Items Total</span>
                  <span className="od-sum-row-val">₹{order.totalAmount}</span>
                </div>
                <div className="od-sum-row">
                  <span className="od-sum-row-lbl">Delivery Charge</span>
                  <span
                    className={`od-sum-row-val ${order.deliveryCharge === 0 ? "od-free" : ""}`}>
                    {order.deliveryCharge === 0
                      ? "FREE"
                      : `₹${order.deliveryCharge}`}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="od-sum-row od-sum-row--disc">
                    <span className="od-sum-row-lbl">
                      Coupon Discount
                      {order.couponCode && (
                        <span className="od-coupon-tag">
                          {order.couponCode}
                        </span>
                      )}
                    </span>
                    <span className="od-sum-row-val">− ₹{order.discount}</span>
                  </div>
                )}
              </div>

              <div className="od-sum-divider" />

              {/* total */}
              <div className="od-sum-total">
                <div>
                  <p className="od-sum-total-label">Total Amount</p>
                  <p className="od-sum-total-note">Inclusive of all taxes</p>
                </div>
                <span className="od-sum-total-val">₹{order.finalAmount}</span>
              </div>

              {/* PAYMENT in sidebar */}
              <div className="od-card" style={{ marginBottom: 0 }}>
                <div className="od-card-head">
                  <div className="od-card-icon od-card-icon--green">
                    <PaymentIcon method={order.paymentMethod} />
                  </div>
                  <h3>Payment</h3>
                </div>

                {isOnline ? (
                  <div className="od-card-body">
                    <div className="od-payment-grid">
                      <div className="od-pay-row">
                        <div className="od-pay-row-left">
                          <div className="od-pay-ico">
                            <PaymentIcon method={order.paymentMethod} />
                          </div>
                          <div>
                            <span className="od-pay-label">Method</span>
                            <span className="od-pay-val">
                              {order.paymentMethod}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="od-pay-row">
                        <div className="od-pay-row-left">
                          <div className="od-pay-ico od-pay-ico--green">
                            <CheckCircle size={16} />
                          </div>
                          <div>
                            <span className="od-pay-label">Status</span>
                            <span className="od-pay-val od-pay-val--green">
                              {order.paymentStatus || "Paid"}
                            </span>
                          </div>
                        </div>
                      </div>
                      {order.transactionId && (
                        <div className="od-pay-row">
                          <div className="od-pay-row-left">
                            <div className="od-pay-ico">
                              <Hash size={16} />
                            </div>
                            <div>
                              <span className="od-pay-label">
                                Transaction ID
                              </span>
                              <span className="od-pay-val od-pay-val--mono">
                                {order.transactionId}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="od-pay-row od-pay-row--highlight">
                        <div className="od-pay-row-left">
                          <div className="od-pay-ico od-pay-ico--brand">
                            <IndianRupee size={16} />
                          </div>
                          <div>
                            <span className="od-pay-label">Amount Paid</span>
                            <span className="od-pay-val od-pay-val--amount">
                              ₹{order.finalAmount}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="od-card-body">
                    <div className="od-payment-grid">
                      <div className="od-pay-row">
                        <div className="od-pay-row-left">
                          <div className="od-pay-ico">
                            <Banknote size={16} />
                          </div>
                          <div>
                            <span className="od-pay-label">Payment Method</span>
                            <span className="od-pay-val">Cash on Delivery</span>
                          </div>
                        </div>
                      </div>
                      <div className="od-pay-row">
                        <div className="od-pay-row-left">
                          <div className="od-pay-ico">
                            <IndianRupee size={16} />
                          </div>
                          <div>
                            <span className="od-pay-label">Amount to Pay</span>
                            <span className="od-pay-val od-pay-val--amount">
                              ₹{order.finalAmount}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* cancel button */}
              {canCancel && (
                <>
                  <div className="od-sum-divider" />
                  <button className="od-btn-cancel" onClick={handleCancel}>
                    <XCircle size={15} /> Cancel Order
                  </button>
                </>
              )}

              {/* help */}
              <div className="od-help">
                <HelpCircle size={18} />
                <span>Need help with this order?</span>
                <button
                  className="od-help-btn"
                  onClick={() => navigate("/user/support")}>
                  Contact Support
                </button>
              </div>
            </div>
          </div>

          {/* DELIVERY STATUS CARD */}
          {order.orderStatus !== "CANCELLED" &&
            order.orderStatus !== "DELIVERED" && (
              <div className="od-card od-card--delivery">
                <div className="od-card-head">
                  <div className="od-card-icon od-card-icon--blue">
                    <Truck size={15} />
                  </div>
                  <h3>Delivery Status</h3>
                </div>
                <div className="od-card-body">
                  <div className="od-delivery-feature">
                    <div className="od-df-ico">
                      <ShieldCheck size={13} />
                    </div>
                    <div>
                      <p className="od-df-title">Safe &amp; Secure Delivery</p>
                      <p className="od-df-sub">
                        Your order is being handled with care.
                      </p>
                    </div>
                  </div>
                  <div className="od-delivery-feature">
                    <div className="od-df-ico">
                      <MapPin size={13} />
                    </div>
                    <div>
                      <p className="od-df-title">Doorstep Delivery</p>
                      <p className="od-df-sub">
                        Delivered right to your address.
                      </p>
                    </div>
                  </div>
                  <div className="od-delivery-feature">
                    <div className="od-df-ico">
                      <BadgeCheck size={13} />
                    </div>
                    <div>
                      <p className="od-df-title">Quality Checked</p>
                      <p className="od-df-sub">
                        Every item verified before dispatch.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* DELIVERED SUCCESS */}
          {order.orderStatus === "DELIVERED" && (
            <div className="od-card od-card--success">
              <div className="od-card-body od-delivered-body">
                <div className="od-delivered-ico">
                  <CheckCircle size={30} />
                </div>
                <p className="od-delivered-title">Order Delivered!</p>
                <p className="od-delivered-sub">
                  Thank you for shopping with RAJBHOG. We hope you enjoy your
                  purchase!
                </p>
                <button className="od-btn-invoice" onClick={handleViewInvoice}>
                  <FileText size={15} /> View Invoice
                </button>
                {["DELIVERED", "RETURN_REJECTED"].includes(
                  order.orderStatus,
                ) && (
                  <button
                    className="od-btn-return"
                    onClick={() => setReturnOrder(order.orderNumber)}>
                    <RefreshCcw size={15} /> Return Order
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {returnOrder && (
        <ReturnModal
          orderNumber={returnOrder}
          onClose={() => setReturnOrder(null)}
          onSubmit={async (reason) => {
            try {
              await requestReturn(returnOrder, reason);
              toast.success("Return request submitted");
              setReturnOrder(null);
              loadOrder();
            } catch (e) {
              toast.error(
                e?.response?.data?.message || "Failed to request return",
              );
            }
          }}
        />
      )}

      {/* ════════════════════ INVOICE MODAL ════════════════════ */}
      {showInvoice && (
        <div className="invoice-modal">
          <div className="invoice-box">
            {/* header */}
            <div className="invoice-header">
              <div className="invoice-header-left">
                <div className="invoice-header-ico">
                  <Receipt size={15} />
                </div>
                <h3>Invoice — #{order.orderNumber}</h3>
              </div>
              <button className="invoice-close" onClick={closeInvoice}>
                <X size={15} />
              </button>
            </div>

            {/* PDF frame */}
            <iframe
              src={invoiceUrl}
              className="invoice-frame"
              title="Invoice Preview"
            />

            {/* actions */}
            <div className="invoice-actions">
              <button
                className="invoice-btn invoice-btn--print"
                onClick={handlePrint}>
                <Printer size={15} /> Print Invoice
              </button>
              <button
                className="invoice-btn invoice-btn--download"
                onClick={handleDownload}>
                <Download size={15} /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
