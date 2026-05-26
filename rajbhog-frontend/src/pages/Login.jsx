import { useEffect, useState } from "react";
import toast from "react-hot-toast";
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
} from "@fortawesome/free-solid-svg-icons";
import "../styles/Login.css";
import Navbar from "../components/Navbar";

/* ── Toast helper styles ─────────────────────────────────── */
const toastStyle = {
  success: {
    style: {
      background: "#fff7ed",
      color: "#9a3412",
      fontWeight: 700,
      fontSize: "13.5px",
      borderLeft: "4px solid #ff6a00",
      padding: "12px 18px",
      borderRadius: "12px",
      boxShadow: "0 8px 24px rgba(255,106,0,0.18)",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    },
    duration: 3000,
  },
  error: {
    style: {
      background: "#fff1f2",
      color: "#9f1239",
      fontWeight: 700,
      fontSize: "13.5px",
      borderLeft: "4px solid #f43f5e",
      padding: "12px 18px",
      borderRadius: "12px",
      boxShadow: "0 8px 24px rgba(244,63,94,0.16)",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    },
    duration: 3500,
  },
  info: {
    style: {
      background: "#f0f9ff",
      color: "#075985",
      fontWeight: 700,
      fontSize: "13.5px",
      borderLeft: "4px solid #0ea5e9",
      padding: "12px 18px",
      borderRadius: "12px",
      boxShadow: "0 8px 24px rgba(14,165,233,0.14)",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    },
    duration: 3000,
  },
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("EMAIL");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpStatus, setOtpStatus] = useState("");

  useEffect(() => {
    if (step === "OTP" && timer > 0) {
      const t = setTimeout(() => setTimer((t) => t - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [step, timer]);

  const handleSendOtp = async () => {
    if (!email) {
      toast.error("Please enter your email address", {
        ...toastStyle.error,
        icon: "⚠️",
      });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Enter a valid email address", {
        ...toastStyle.error,
        icon: "❌",
      });
      return;
    }
    try {
      setLoading(true);
      await sendOtp(email);
      toast.success("OTP sent! Check your inbox 📬", {
        ...toastStyle.success,
        icon: "✅",
      });
      setStep("OTP");
      setTimer(30);
    } catch {
      toast.error("Failed to send OTP. Please try again.", {
        ...toastStyle.error,
        icon: "❌",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP", {
        ...toastStyle.error,
        icon: "⚠️",
      });
      return;
    }
    try {
      const res = await verifyOtp(email, otpValue);
      setOtpStatus("success");

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      const name = email.split("@")[0];
      const isNewUser = res.data.isNewUser;

      if (isNewUser) {
        toast.success(`Welcome, ${name}! Let's set up your profile 🚀`, {
          ...toastStyle.success,
          icon: "✨",
          duration: 3500,
        });
      } else {
        toast.success(`Welcome back, ${name}! 👋`, {
          ...toastStyle.success,
          icon: "🛒",
          duration: 2500,
        });
      }

      const pendingCart = localStorage.getItem("pendingCart");
      if (pendingCart) {
        try {
          const data = JSON.parse(pendingCart);
          await addToCart(data);
          toast.success("Item added to cart 🛒", { ...toastStyle.success });
          localStorage.removeItem("pendingCart");
          setTimeout(() => {
            window.location.href = "/user/cart";
          }, 800);
          return;
        } catch (err) {
          console.error(err);
          toast.error("Failed to restore cart", { ...toastStyle.error });
        }
      }

      setTimeout(() => {
        window.location.href =
          res.data.role === "ADMIN" ? "/admin/dashboard" : "/user/dashboard";
      }, 700);
    } catch {
      setOtpStatus("error");
      setOtp(["", "", "", "", "", ""]);
      toast.error("Invalid OTP. Please try again.", {
        ...toastStyle.error,
        icon: "❌",
      });
      setTimeout(() => {
        setOtpStatus("");
        document.getElementById("otp-0")?.focus();
      }, 900);
    }
  };

  const handleOtpChange = (index, value) => {
    const v = value.replace(/\D/g, "").slice(-1);
    const n = [...otp];
    n[index] = v;
    setOtp(n);
    if (v && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
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

  return (
    <>
      <Navbar />
      <div className="rb-auth-page">
        <div className="rb-auth-shell">
          {/* ══ LEFT BRAND PANEL ══ */}
          <div className="rb-brand-panel">
            {/* Decorative blobs */}
            <span className="rb-blob rb-blob-1" />
            <span className="rb-blob rb-blob-2" />
            <span className="rb-blob rb-blob-3" />

            <div className="rb-brand-inner">
              {/* Logo */}
              <div className="rb-logo-row">
                <div className="rb-logo-icon">
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

              {/* Bottom brand strip */}
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

          {/* ══ RIGHT FORM PANEL ══ */}
          <div className="rb-form-panel">
            <div className="rb-form-inner">
              {/* Mobile logo header — visible only on small screens */}
              <div className="rb-mobile-logo">
                <div className="rb-logo-icon-sm">
                  <FontAwesomeIcon icon={faStore} />
                </div>
                <div className="rb-logo-text">
                  <span className="rb-logo-raj">RAJ</span>
                  <span className="rb-logo-bhog">BHOG</span>
                </div>
              </div>

              {step === "EMAIL" && (
                <div className="rb-form-card">
                  {/* Header badge */}
                  <div className="rb-badge">
                    <FontAwesomeIcon icon={faStar} />
                    <span>Trusted by thousands in your city</span>
                  </div>

                  <h2 className="rb-form-title">Sign in to RajBhog</h2>
                  <p className="rb-form-sub">
                    No password needed — we'll send a one-time code straight to
                    your inbox.
                  </p>

                  {/* Email field */}
                  <div className="rb-field">
                    <label className="rb-label" htmlFor="rb-email">
                      Email address
                    </label>
                    <div className="rb-input-wrap">
                      <span className="rb-input-icon">
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
                      />
                    </div>
                  </div>

                  <button
                    className="rb-btn-primary"
                    disabled={loading}
                    onClick={handleSendOtp}>
                    {loading ? (
                      <>
                        <span className="rb-spinner" />
                        <span>Sending OTP…</span>
                      </>
                    ) : (
                      <>
                        <span>Continue</span>
                        <FontAwesomeIcon icon={faArrowRight} />
                      </>
                    )}
                  </button>

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

              {step === "OTP" && (
                <div className="rb-form-card">
                  {/* Verification badge */}
                  <div className="rb-badge rb-badge--blue">
                    <FontAwesomeIcon icon={faLock} />
                    <span>Verification Step</span>
                  </div>

                  <h2 className="rb-form-title">Enter your OTP</h2>
                  <p className="rb-form-sub">
                    A 6-digit code was sent to{" "}
                    <strong className="rb-email-hl">{email}</strong>
                  </p>

                  {/* OTP boxes */}
                  <label className="rb-label rb-otp-label">
                    Enter 6-digit code
                  </label>
                  <div
                    className={`rb-otp-row${otpStatus === "error" ? " rb-otp-error" : ""}${otpStatus === "success" ? " rb-otp-success" : ""}`}
                    onPaste={handleOtpPaste}>
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="rb-otp-box"
                        autoComplete="one-time-code"
                      />
                    ))}
                  </div>

                  {/* Inline feedback */}
                  {otpStatus === "error" && (
                    <div className="rb-inline-msg rb-inline-error">
                      <FontAwesomeIcon icon={faCircleExclamation} />
                      <span>Invalid OTP. Please check and try again.</span>
                    </div>
                  )}
                  {otpStatus === "success" && (
                    <div className="rb-inline-msg rb-inline-success">
                      <FontAwesomeIcon icon={faCheckCircle} />
                      <span>OTP verified! Redirecting…</span>
                    </div>
                  )}

                  <button className="rb-btn-primary" onClick={handleVerifyOtp}>
                    <span>Verify &amp; Continue</span>
                    <FontAwesomeIcon icon={faArrowRight} />
                  </button>

                  {/* Resend row */}
                  <div className="rb-resend-row">
                    {timer > 0 ? (
                      <span className="rb-timer">
                        <FontAwesomeIcon icon={faClock} />
                        &nbsp;Resend in <strong>{timer}s</strong>
                      </span>
                    ) : (
                      <button className="rb-link-btn" onClick={handleSendOtp}>
                        <FontAwesomeIcon icon={faArrowRotateRight} />
                        &nbsp;Resend OTP
                      </button>
                    )}
                  </div>

                  {/* Change email */}
                  <button
                    className="rb-back-btn"
                    onClick={() => {
                      setStep("EMAIL");
                      setOtp(["", "", "", "", "", ""]);
                      setOtpStatus("");
                    }}>
                    <FontAwesomeIcon icon={faChevronLeft} />
                    &nbsp;Change Email
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
    <span className={`rb-hl-dot rb-hl-${color}`}>
      <FontAwesomeIcon icon={icon} />
    </span>
    <span className="rb-hl-text">{text}</span>
  </div>
);

const FeatCard = ({ icon, color, label, sub }) => (
  <div className={`rb-feat-card rb-feat-${color}`}>
    <span className="rb-feat-ico">
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
    <span className={`rb-mf-ico rb-mf-${color}`}>
      <FontAwesomeIcon icon={icon} />
    </span>
    <span className="rb-mf-label">{label}</span>
  </div>
);
