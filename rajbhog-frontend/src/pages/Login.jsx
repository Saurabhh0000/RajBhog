import { useEffect, useRef, useState } from "react";
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
} from "@fortawesome/free-solid-svg-icons";
import "../styles/Login.css";
import Navbar from "../components/Navbar";

/* ──────────────────────────────────────────────────────────
   Inline message — replaces toast for form feedback
────────────────────────────────────────────────────────── */
function InlineAlert({ type, message, onDismiss }) {
  if (!message) return null;
  return (
    <div className={`rb-inline-msg rb-inline-${type}`}>
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
          ✕
        </button>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Main Login component
────────────────────────────────────────────────────────── */
export default function Login() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("EMAIL");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpStatus, setOtpStatus] = useState(""); // "" | "error" | "success"

  /* Inline alert state */
  const [alert, setAlert] = useState({ type: "", message: "" }); // type: "error" | "success" | "info"

  const firstOtpRef = useRef(null);

  /* ── Timer countdown ─────────────────────────────────── */
  useEffect(() => {
    if (step === "OTP" && timer > 0) {
      const t = setTimeout(() => setTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [step, timer]);

  /* Auto-focus first OTP box when step changes */
  useEffect(() => {
    if (step === "OTP") {
      setTimeout(() => {
        document.getElementById("otp-0")?.focus();
      }, 80);
    }
  }, [step]);

  const showAlert = (type, message) => setAlert({ type, message });
  const clearAlert = () => setAlert({ type: "", message: "" });

  /* ── Send OTP ─────────────────────────────────────────── */
  const handleSendOtp = async () => {
    clearAlert();
    if (!email.trim()) {
      showAlert("error", "Please enter your email address.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showAlert("error", "Enter a valid email address.");
      return;
    }
    try {
      setLoading(true);
      await sendOtp(email);
      showAlert("success", "OTP sent! Please check your inbox.");
      setStep("OTP");
      setTimer(30);
    } catch {
      showAlert("error", "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Verify OTP ───────────────────────────────────────── */
  const handleVerifyOtp = async () => {
    clearAlert();
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      showAlert("error", "Please enter the complete 6-digit OTP.");
      return;
    }
    try {
      setLoading(true);
      const res = await verifyOtp(email, otpValue);
      setOtpStatus("success");
      showAlert("success", "OTP verified! Redirecting you now…");

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      const name = email.split("@")[0];
      const isNewUser = res.data.isNewUser;

      if (isNewUser) {
        showAlert("success", `Welcome, ${name}! Setting up your profile…`);
      } else {
        showAlert("success", `Welcome back, ${name}!`);
      }

      const pendingCart = localStorage.getItem("pendingCart");
      if (pendingCart) {
        try {
          const data = JSON.parse(pendingCart);
          await addToCart(data);
          localStorage.removeItem("pendingCart");
          setTimeout(() => {
            window.location.href = "/user/cart";
          }, 800);
          return;
        } catch (err) {
          console.error(err);
          showAlert("error", "Failed to restore cart item.");
        }
      }

      setTimeout(() => {
        window.location.href =
          res.data.role === "ADMIN" ? "/admin/dashboard" : "/user/dashboard";
      }, 800);
    } catch {
      setOtpStatus("error");
      setOtp(["", "", "", "", "", ""]);
      showAlert("error", "Invalid OTP. Please check and try again.");
      setTimeout(() => {
        setOtpStatus("");
        clearAlert();
        document.getElementById("otp-0")?.focus();
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  /* ── OTP input handlers ───────────────────────────────── */
  const handleOtpChange = (index, value) => {
    const v = value.replace(/\D/g, "").slice(-1);
    const n = [...otp];
    n[index] = v;
    setOtp(n);
    if (v && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
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

  /* ── Go back to email step ────────────────────────────── */
  const handleBack = () => {
    setStep("EMAIL");
    setOtp(["", "", "", "", "", ""]);
    setOtpStatus("");
    clearAlert();
  };

  return (
    <>
      <Navbar />
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
                  delivered straight from your local store.
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
              {/* Mobile logo — shown only ≤600px */}
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

                  <h1 className="rb-form-title">Sign in to RajBhog</h1>
                  <p className="rb-form-sub">
                    No password needed — we'll send a one-time code straight to
                    your inbox.
                  </p>

                  {/* Inline alert */}
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

                  {/* Divider */}
                  <div className="rb-divider">
                    <span className="rb-divider-line" />
                    <span className="rb-divider-text">secured login</span>
                    <span className="rb-divider-line" />
                  </div>

                  {/* Trust chips */}
                  <div className="rb-trust-row">
                    <span className="rb-trust-chip">
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

                  <h1 className="rb-form-title">Enter your OTP</h1>

                  {/* OTP info card */}
                  <div className="rb-otp-info-card">
                    <div className="rb-otp-info-icon" aria-hidden="true">
                      <FontAwesomeIcon icon={faKey} />
                    </div>
                    <div className="rb-otp-info-body">
                      <span className="rb-otp-info-title">Code sent to</span>
                      <span className="rb-otp-info-email">{email}</span>
                    </div>
                  </div>

                  {/* Inline alert */}
                  <InlineAlert
                    type={alert.type}
                    message={alert.message}
                    onDismiss={clearAlert}
                  />

                  {/* OTP boxes */}
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

                  {/* Resend row */}
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

                  {/* Back to email */}
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

/* ── Sub-components ──────────────────────────────────────── */
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
