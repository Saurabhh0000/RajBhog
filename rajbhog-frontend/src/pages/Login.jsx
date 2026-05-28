import { useEffect, useRef, useState, useCallback } from "react";
import { sendOtp, verifyOtp } from "../api/admin/authApi";
import { addToCart } from "../api/user/cartApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faClock,
  faArrowRotateRight,
  faArrowRight,
  faStar,
  faTruck,
  faShieldHalved,
  faBolt,
  faStore,
  faCircleExclamation,
  faCheckCircle,
  faLocationDot,
  faLeaf,
  faHandshake,
  faTag,
  faChevronLeft,
  faLock,
  faWheatAwn,
  faFire,
  faBagShopping,
  faCircleCheck,
  faKey,
  faXmark,
  faCircleInfo,
  faSparkles,
} from "@fortawesome/free-solid-svg-icons";
import "../styles/Login.css";
import Navbar from "../components/Navbar";

/* ══════════════════════════════════════════════════════════
   TOAST SYSTEM — Branded, beautiful toasts
══════════════════════════════════════════════════════════ */

let toastId = 0;
const toastListeners = new Set();

function emitToast(toast) {
  toastListeners.forEach((cb) => cb(toast));
}

export const toast = {
  success: (title, msg) =>
    emitToast({ id: ++toastId, type: "success", title, msg }),
  error: (title, msg) =>
    emitToast({ id: ++toastId, type: "error", title, msg }),
  info: (title, msg) => emitToast({ id: ++toastId, type: "info", title, msg }),
};

const TOAST_ICONS = {
  success: faCheckCircle,
  error: faCircleExclamation,
  info: faCircleInfo,
};

const TOAST_TITLES = {
  success: "Success",
  error: "Oops!",
  info: "Info",
};

function ToastItem({ toast: t, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(t.id), 4200);
    return () => clearTimeout(timer);
  }, [t.id, onRemove]);

  return (
    <div className={`rb-toast rb-toast--${t.type}`} role="alert">
      <div className="rb-toast-icon">
        <FontAwesomeIcon icon={TOAST_ICONS[t.type]} />
      </div>
      <div className="rb-toast-body">
        <div className="rb-toast-title">{t.title || TOAST_TITLES[t.type]}</div>
        {t.msg && <div className="rb-toast-msg">{t.msg}</div>}
      </div>
      <button
        className="rb-toast-close"
        onClick={() => onRemove(t.id)}
        aria-label="Dismiss">
        <FontAwesomeIcon icon={faXmark} />
      </button>
    </div>
  );
}

function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (t) => setToasts((prev) => [...prev, t]);
    toastListeners.add(handler);
    return () => toastListeners.delete(handler);
  }, []);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  if (!toasts.length) return null;

  return (
    <div className="rb-toast-container" aria-live="polite">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={remove} />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   INLINE ALERT — within the form
══════════════════════════════════════════════════════════ */
function InlineAlert({ type, message, onDismiss }) {
  if (!message) return null;
  return (
    <div className={`rb-inline-msg rb-inline-${type}`} role="alert">
      <FontAwesomeIcon
        icon={type === "error" ? faCircleExclamation : faCheckCircle}
      />
      <span style={{ flex: 1 }}>{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "inherit",
            padding: "0 2px",
            fontSize: "12px",
            opacity: 0.7,
            flexShrink: 0,
          }}
          aria-label="Dismiss">
          <FontAwesomeIcon icon={faXmark} />
        </button>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN LOGIN COMPONENT
══════════════════════════════════════════════════════════ */
export default function Login() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("EMAIL");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpStatus, setOtpStatus] = useState("");
  const [alert, setAlert] = useState({ type: "", message: "" });

  const firstOtpRef = useRef(null);

  /* Timer countdown */
  useEffect(() => {
    if (step === "OTP" && timer > 0) {
      const t = setTimeout(() => setTimer((p) => p - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [step, timer]);

  /* Auto-focus first OTP box */
  useEffect(() => {
    if (step === "OTP") {
      setTimeout(() => document.getElementById("otp-0")?.focus(), 80);
    }
  }, [step]);

  const showAlert = (type, message) => setAlert({ type, message });
  const clearAlert = () => setAlert({ type: "", message: "" });

  /* ─── Send OTP ─────────────────────────────────────────── */
  const handleSendOtp = async () => {
    clearAlert();
    if (!email.trim()) {
      showAlert("error", "Please enter your email address.");
      toast.error("Missing Email", "Enter your email to continue.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showAlert("error", "Enter a valid email address.");
      toast.error("Invalid Email", "Please check your email format.");
      return;
    }
    try {
      setLoading(true);
      await sendOtp(email);
      showAlert("success", "OTP sent! Check your inbox.");
      toast.success("OTP Sent! 📬", `We've sent a 6-digit code to ${email}`);
      setStep("OTP");
      setTimer(30);
    } catch {
      showAlert("error", "Failed to send OTP. Please try again.");
      toast.error("Delivery Failed", "Couldn't send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ─── Verify OTP ───────────────────────────────────────── */
  const handleVerifyOtp = async () => {
    clearAlert();
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      showAlert("error", "Please enter the complete 6-digit OTP.");
      toast.error("Incomplete OTP", "Fill all 6 digits to continue.");
      return;
    }
    try {
      setLoading(true);
      const res = await verifyOtp(email, otpValue);
      setOtpStatus("success");
      const name = email.split("@")[0];
      const welcomeMsg = res.data.isNewUser
        ? `Welcome aboard, ${name}! 🎉 Your account is ready.`
        : `Great to see you again, ${name}! 🙏`;
      showAlert("success", welcomeMsg);
      toast.success(
        res.data.isNewUser ? "Welcome to RajBhog! 🛒" : "Welcome back! 🙏",
        res.data.isNewUser
          ? "Your neighbourhood kirana is ready."
          : "Your cart and orders are waiting.",
      );
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      const pendingCart = localStorage.getItem("pendingCart");
      if (pendingCart) {
        try {
          await addToCart(JSON.parse(pendingCart));
          localStorage.removeItem("pendingCart");
          toast.info("Cart Restored", "We've added your item back to cart.");
          setTimeout(() => {
            window.location.href = "/user/cart";
          }, 900);
          return;
        } catch (err) {
          console.error(err);
          showAlert("error", "Failed to restore cart item.");
        }
      }
      setTimeout(() => {
        window.location.href =
          res.data.role === "ADMIN" ? "/admin/dashboard" : "/user/dashboard";
      }, 900);
    } catch {
      setOtpStatus("error");
      setOtp(["", "", "", "", "", ""]);
      showAlert("error", "Invalid OTP. Please check and try again.");
      toast.error("Wrong Code", "The OTP doesn't match. Please try again.");
      setTimeout(() => {
        setOtpStatus("");
        clearAlert();
        document.getElementById("otp-0")?.focus();
      }, 2200);
    } finally {
      setLoading(false);
    }
  };

  /* ─── OTP Handlers ─────────────────────────────────────── */
  const handleOtpChange = (index, value) => {
    const v = value.replace(/\D/g, "").slice(-1);
    const n = [...otp];
    n[index] = v;
    setOtp(n);
    if (v && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
  };
  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      document.getElementById(`otp-${index - 1}`)?.focus();
    if (e.key === "Enter") handleVerifyOtp();
  };
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      document.getElementById("otp-5")?.focus();
    }
  };

  const handleBack = () => {
    setStep("EMAIL");
    setOtp(["", "", "", "", "", ""]);
    setOtpStatus("");
    clearAlert();
  };

  return (
    <>
      <Navbar />
      <ToastContainer />

      <div className="rb-auth-page">
        <div className="rb-auth-shell">
          {/* ══ LEFT — BRAND PANEL ══ */}
          <div className="rb-brand-panel">
            <span className="rb-blob rb-blob-1" aria-hidden="true" />
            <span className="rb-blob rb-blob-2" aria-hidden="true" />
            <span className="rb-blob rb-blob-3" aria-hidden="true" />
            <span className="rb-blob rb-blob-4" aria-hidden="true" />

            <div className="rb-brand-inner">
              {/* Logo */}
              <div className="rb-logo-row">
                <div className="rb-logo-icon" aria-hidden="true">
                  <FontAwesomeIcon icon={faStore} />
                </div>
                <div className="rb-logo-text">
                  <span className="rb-logo-raj">RAJ</span>
                  <span className="rb-logo-bhog">BHOG</span>
                </div>
              </div>

              {/* Tagline */}
              <div className="rb-brand-headline">
                <p className="rb-brand-tag">जो भी खाए, दोस्त बन जाए</p>
                <p className="rb-brand-desc">
                  Your neighbourhood kirana, now online. Fresh groceries
                  delivered straight from your local store to your doorstep.
                </p>
              </div>

              {/* Highlights */}
              <div className="rb-highlights">
                <HighlightRow
                  icon={faBolt}
                  color="amber"
                  text="Same-day delivery from nearby kiranas"
                />
                <HighlightRow
                  icon={faLeaf}
                  color="green"
                  text="Fresh stock updated every morning"
                />
                <HighlightRow
                  icon={faHandshake}
                  color="sky"
                  text="Support your local store owner directly"
                />
                <HighlightRow
                  icon={faLocationDot}
                  color="rose"
                  text="Hyperlocal — your pin, your store"
                />
              </div>

              {/* Feature grid */}
              <div className="rb-feat-grid">
                <FeatCard
                  icon={faStore}
                  color="orange"
                  label="Local Kirana"
                  sub="Verified stores"
                />
                <FeatCard
                  icon={faTruck}
                  color="sky"
                  label="Fast Delivery"
                  sub="Door-to-door"
                />
                <FeatCard
                  icon={faShieldHalved}
                  color="green"
                  label="Safe & Secure"
                  sub="OTP protected"
                />
                <FeatCard
                  icon={faTag}
                  color="violet"
                  label="Best Prices"
                  sub="Local deals"
                />
              </div>

              {/* Footer pills */}
              <div className="rb-brand-footer">
                <span className="rb-brand-footer-pill">
                  <FontAwesomeIcon icon={faWheatAwn} /> Fresh Groceries
                </span>
                <span className="rb-brand-footer-pill">
                  <FontAwesomeIcon icon={faBagShopping} /> Easy Checkout
                </span>
                <span className="rb-brand-footer-pill">
                  <FontAwesomeIcon icon={faFire} /> Hot Deals
                </span>
              </div>
            </div>
          </div>

          {/* ══ RIGHT — FORM PANEL ══ */}
          <div className="rb-form-panel">
            <div className="rb-form-panel-bg" aria-hidden="true" />
            <div className="rb-form-inner">
              {/* Mobile logo — ≤600px only */}
              <div className="rb-mobile-logo">
                <div className="rb-logo-icon-sm" aria-hidden="true">
                  <FontAwesomeIcon icon={faStore} />
                </div>
                <div className="rb-logo-text">
                  <span className="rb-logo-raj">RAJ</span>
                  <span className="rb-logo-bhog">BHOG</span>
                </div>
              </div>

              {/* Step dots */}
              <div className="rb-step-indicator" aria-label="Step indicator">
                <span
                  className={`rb-step-dot ${step === "EMAIL" ? "active" : ""}`}
                />
                <span
                  className={`rb-step-dot ${step === "OTP" ? "active" : ""}`}
                />
              </div>

              {/* ── EMAIL STEP ── */}
              {step === "EMAIL" && (
                <div className="rb-form-card">
                  <div className="rb-badge">
                    <FontAwesomeIcon icon={faStar} />
                    <span>Trusted by thousands in your city</span>
                  </div>

                  <div className="rb-form-ornament" aria-hidden="true">
                    <span className="rb-form-ornament-line" />
                    <span className="rb-form-ornament-dot" />
                  </div>

                  <h1 className="rb-form-title">
                    Sign in to
                    <br />
                    RajBhog
                  </h1>
                  <p className="rb-form-sub">
                    No password needed — we'll send a one-time code straight to
                    your inbox.
                  </p>

                  <InlineAlert
                    type={alert.type}
                    message={alert.message}
                    onDismiss={clearAlert}
                  />

                  <div className="rb-field">
                    <label className="rb-label" htmlFor="rb-email">
                      <span className="rb-label-icon">
                        <FontAwesomeIcon icon={faEnvelope} />
                      </span>
                      Email address
                    </label>
                    <div className="rb-input-wrap">
                      <span className="rb-input-icon" aria-hidden="true">
                        <FontAwesomeIcon icon={faEnvelope} />
                      </span>
                      <input
                        id="rb-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSendOtp()}
                        className="rb-input"
                        autoComplete="email"
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    className="rb-btn-primary"
                    disabled={loading}
                    onClick={handleSendOtp}>
                    {loading ? (
                      <>
                        <span className="rb-spinner" aria-hidden="true" />
                        <span>Sending OTP…</span>
                      </>
                    ) : (
                      <>
                        <span>Continue</span>
                        <span className="rb-btn-icon">
                          <FontAwesomeIcon icon={faArrowRight} />
                        </span>
                      </>
                    )}
                  </button>

                  <div className="rb-divider">
                    <span className="rb-divider-line" />
                    <span className="rb-divider-text">secured by rajbhog</span>
                    <span className="rb-divider-line" />
                  </div>

                  <div className="rb-trust-row">
                    <span className="rb-trust-chip rb-trust-chip--secure">
                      <FontAwesomeIcon icon={faShieldHalved} /> Secure Login
                    </span>
                    <span className="rb-trust-chip">
                      <FontAwesomeIcon icon={faBolt} /> Instant OTP
                    </span>
                    <span className="rb-trust-chip">
                      <FontAwesomeIcon icon={faCircleCheck} /> Verified
                    </span>
                  </div>

                  {/* Mobile feature strip */}
                  <div className="rb-mobile-strip">
                    <MobileFeature
                      icon={faStore}
                      color="orange"
                      label="Local Kirana"
                    />
                    <MobileFeature
                      icon={faTruck}
                      color="sky"
                      label="Fast Delivery"
                    />
                    <MobileFeature
                      icon={faShieldHalved}
                      color="green"
                      label="Safe & Secure"
                    />
                    <MobileFeature
                      icon={faTag}
                      color="violet"
                      label="Best Prices"
                    />
                  </div>
                </div>
              )}

              {/* ── OTP STEP ── */}
              {step === "OTP" && (
                <div className="rb-form-card">
                  <div className="rb-badge rb-badge--blue">
                    <FontAwesomeIcon icon={faLock} />
                    <span>Verification Step</span>
                  </div>

                  <div className="rb-form-ornament" aria-hidden="true">
                    <span className="rb-form-ornament-line" />
                    <span className="rb-form-ornament-dot" />
                  </div>

                  <h1 className="rb-form-title">
                    Enter your
                    <br />
                    OTP
                  </h1>

                  <div className="rb-otp-info-card">
                    <div className="rb-otp-info-icon" aria-hidden="true">
                      <FontAwesomeIcon icon={faKey} />
                    </div>
                    <div className="rb-otp-info-body">
                      <span className="rb-otp-info-title">Code sent to</span>
                      <span className="rb-otp-info-email">{email}</span>
                    </div>
                  </div>

                  <InlineAlert
                    type={alert.type}
                    message={alert.message}
                    onDismiss={clearAlert}
                  />

                  <label className="rb-otp-label" htmlFor="otp-0">
                    Enter 6-digit code
                  </label>
                  <div
                    className={`rb-otp-row${otpStatus === "error" ? " rb-otp-error" : ""}${otpStatus === "success" ? " rb-otp-success" : ""}`}
                    onPaste={handleOtpPaste}>
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        ref={index === 0 ? firstOtpRef : undefined}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="rb-otp-box"
                        autoComplete={index === 0 ? "one-time-code" : "off"}
                        aria-label={`OTP digit ${index + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    className="rb-btn-primary"
                    onClick={handleVerifyOtp}
                    disabled={loading}>
                    {loading ? (
                      <>
                        <span className="rb-spinner" aria-hidden="true" />
                        <span>Verifying…</span>
                      </>
                    ) : (
                      <>
                        <span>Verify &amp; Continue</span>
                        <span className="rb-btn-icon">
                          <FontAwesomeIcon icon={faArrowRight} />
                        </span>
                      </>
                    )}
                  </button>

                  <div className="rb-resend-row">
                    {timer > 0 ? (
                      <span className="rb-timer">
                        <FontAwesomeIcon icon={faClock} />
                        Resend in <strong>{timer}s</strong>
                      </span>
                    ) : (
                      <button className="rb-link-btn" onClick={handleSendOtp}>
                        <FontAwesomeIcon icon={faArrowRotateRight} />
                        Resend OTP
                      </button>
                    )}
                  </div>

                  <button className="rb-back-btn" onClick={handleBack}>
                    <FontAwesomeIcon icon={faChevronLeft} />
                    Change Email
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════
   SUB-COMPONENTS
══════════════════════════════════════════════════════════ */
const HighlightRow = ({ icon, color, text }) => (
  <div className="rb-hl-item">
    <span className={`rb-hl-dot rb-hl-${color}`} aria-hidden="true">
      <FontAwesomeIcon icon={icon} />
    </span>
    <span className="rb-hl-text">{text}</span>
  </div>
);

const FeatCard = ({ icon, color, label, sub }) => (
  <div className={`rb-feat-card rb-feat-${color}`}>
    <span className="rb-feat-ico" aria-hidden="true">
      <FontAwesomeIcon icon={icon} />
    </span>
    <div className="rb-feat-body">
      <p className="rb-feat-label">{label}</p>
      <p className="rb-feat-sub">{sub}</p>
    </div>
  </div>
);

const MobileFeature = ({ icon, color, label }) => (
  <div className="rb-mf-item">
    <span className={`rb-mf-ico rb-mf-${color}`} aria-hidden="true">
      <FontAwesomeIcon icon={icon} />
    </span>
    <span className="rb-mf-label">{label}</span>
  </div>
);

/* ══════════════════════════════════════════════════════════
   PRODUCT CARD COMPONENTS  — for grid / list views
   (Import and use these wherever you render product listings)
══════════════════════════════════════════════════════════ */

/**
 * GridCard — use in grid view
 * Props: product { id, name, category, price, mrp, discount, rating,
 *                  reviewCount, image, isNew, isSale, isHot }
 * onAddToCart(product), onWishlist(product)
 */
export function GridCard({ product, onAddToCart, onWishlist, isWishlisted }) {
  const discount =
    product.discount ||
    (product.mrp && product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : null);

  const stars = Math.round(product.rating || 0);
  const starStr = "★".repeat(stars) + "☆".repeat(5 - stars);

  return (
    <div className="rb-card">
      <div className="rb-card-img-wrap">
        {product.image ? (
          <img
            className="rb-card-img"
            src={product.image}
            alt={product.name}
            loading="lazy"
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "36px",
              color: "#FDBA74",
            }}>
            🛒
          </div>
        )}

        {/* Badges */}
        <div className="rb-card-badge-wrap">
          {product.isSale && (
            <span className="rb-card-badge rb-card-badge--sale">SALE</span>
          )}
          {product.isNew && (
            <span className="rb-card-badge rb-card-badge--new">NEW</span>
          )}
          {product.isHot && (
            <span className="rb-card-badge rb-card-badge--hot">🔥 HOT</span>
          )}
        </div>

        {/* Wishlist */}
        {onWishlist && (
          <button
            className={`rb-card-wishlist${isWishlisted ? " active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onWishlist(product);
            }}
            aria-label="Add to wishlist">
            {isWishlisted ? "♥" : "♡"}
          </button>
        )}
      </div>

      <div className="rb-card-body">
        {product.category && (
          <div className="rb-card-category">{product.category}</div>
        )}
        <div className="rb-card-name">{product.name}</div>

        {product.rating > 0 && (
          <div className="rb-card-rating">
            <span className="rb-card-stars">{starStr}</span>
            {product.reviewCount > 0 && (
              <span className="rb-card-rating-count">
                ({product.reviewCount})
              </span>
            )}
          </div>
        )}

        <div className="rb-card-price-row">
          <span className="rb-card-price">₹{product.price}</span>
          {product.mrp && product.mrp > product.price && (
            <span className="rb-card-mrp">₹{product.mrp}</span>
          )}
          {discount > 0 && (
            <span className="rb-card-discount">{discount}% off</span>
          )}
        </div>
      </div>

      <div className="rb-card-footer">
        <button
          className="rb-card-add-btn"
          onClick={() => onAddToCart && onAddToCart(product)}>
          <FontAwesomeIcon icon={faBagShopping} />
          Add to Cart
        </button>
      </div>
    </div>
  );
}

/**
 * ListCard — use in list view
 * Same props as GridCard
 */
export function ListCard({ product, onAddToCart, onWishlist, isWishlisted }) {
  const discount =
    product.discount ||
    (product.mrp && product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : null);

  const stars = Math.round(product.rating || 0);
  const starStr = "★".repeat(stars) + "☆".repeat(5 - stars);

  return (
    <div className="rb-list-card">
      <div className="rb-list-card-img-wrap">
        {product.image ? (
          <img
            className="rb-list-card-img"
            src={product.image}
            alt={product.name}
            loading="lazy"
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              color: "#FDBA74",
            }}>
            🛒
          </div>
        )}
      </div>

      <div className="rb-list-card-body">
        <div>
          {product.category && (
            <div className="rb-card-category" style={{ marginBottom: 4 }}>
              {product.category}
            </div>
          )}
          <div className="rb-card-name">{product.name}</div>

          {product.rating > 0 && (
            <div className="rb-card-rating" style={{ marginTop: 4 }}>
              <span className="rb-card-stars">{starStr}</span>
              {product.reviewCount > 0 && (
                <span className="rb-card-rating-count">
                  ({product.reviewCount})
                </span>
              )}
            </div>
          )}
        </div>

        <div className="rb-list-card-actions">
          <div className="rb-card-price-row" style={{ flex: 1 }}>
            <span className="rb-card-price">₹{product.price}</span>
            {product.mrp && product.mrp > product.price && (
              <span className="rb-card-mrp">₹{product.mrp}</span>
            )}
            {discount > 0 && (
              <span className="rb-card-discount">{discount}% off</span>
            )}
          </div>

          <button
            className="rb-list-card-add-btn"
            onClick={() => onAddToCart && onAddToCart(product)}>
            <FontAwesomeIcon icon={faBagShopping} />
            Add
          </button>

          {onWishlist && (
            <button
              className={`rb-card-wishlist${isWishlisted ? " active" : ""}`}
              style={{ position: "static", width: 34, height: 34 }}
              onClick={() => onWishlist(product)}
              aria-label="Wishlist">
              {isWishlisted ? "♥" : "♡"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
