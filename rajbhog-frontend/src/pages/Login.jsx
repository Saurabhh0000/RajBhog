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
} from "@fortawesome/free-solid-svg-icons";
import "../styles/Login.css";
import Navbar from "../components/Navbar";

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
        style: { background: "#1e1e1e", color: "#fff", fontWeight: 600 },
        icon: "⚠️",
      });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address", {
        style: { background: "#1e1e1e", color: "#fff", fontWeight: 600 },
        icon: "❌",
      });
      return;
    }
    try {
      setLoading(true);
      await sendOtp(email);
      toast.success("OTP sent! Check your inbox 📬", {
        style: { background: "#fff7ed", color: "#c2410c", fontWeight: 700 },
        icon: "✅",
        duration: 3000,
      });
      setStep("OTP");
      setTimer(30);
    } catch {
      toast.error("Failed to send OTP. Please try again.", {
        style: { background: "#1e1e1e", color: "#fff", fontWeight: 600 },
        icon: "❌",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP", {
        style: { background: "#1e1e1e", color: "#fff", fontWeight: 600 },
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
          style: { background: "#fff7ed", color: "#c2410c", fontWeight: 700 },
          icon: "✨",
          duration: 3500,
        });
      } else {
        toast.success(`Welcome back, ${name}! 👋`, {
          style: { background: "#fff7ed", color: "#c2410c", fontWeight: 700 },
          icon: "🛒",
          duration: 2500,
        });
      }

      const pendingCart = localStorage.getItem("pendingCart");
      if (pendingCart) {
        try {
          const data = JSON.parse(pendingCart);
          await addToCart(data);
          toast.success("Item added to cart 🛒", {
            style: { background: "#fff7ed", color: "#c2410c", fontWeight: 700 },
          });
          localStorage.removeItem("pendingCart");
          setTimeout(() => {
            window.location.href = "/user/cart";
          }, 800);
          return;
        } catch (err) {
          console.error(err);
          toast.error("Failed to restore cart", {
            style: { background: "#1e1e1e", color: "#fff", fontWeight: 600 },
          });
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
        style: { background: "#1e1e1e", color: "#fff", fontWeight: 600 },
        icon: "❌",
        duration: 3000,
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
        <div className="rb-auth-card">
          {/* ══ LEFT BRAND PANEL (desktop) / TOP HEADER (mobile) ══ */}
          <div className="rb-brand-panel">
            <div className="rb-brand-inner">
              {/* Logo — always visible */}
              <div className="rb-logo-row">
                <div className="rb-logo-icon">
                  <FontAwesomeIcon icon={faStore} />
                </div>
                <div className="rb-logo-text">
                  <span className="rb-logo-raj">RAJ</span>
                  <span className="rb-logo-bhog">BHOG</span>
                </div>
                {/* Mobile-only tagline next to logo */}
                <p className="rb-mobile-tagline">जो भी खाए, दोस्त बन जाए</p>
              </div>

              {/* Desktop tagline — hidden on mobile */}
              <p className="rb-brand-tagline rb-desktop-only">
                Your neighbourhood kirana, now online.{" "}
                <span className="rb-tag-highlight">
                  <FontAwesomeIcon icon={faLeaf} /> Fresh groceries
                </span>{" "}
                delivered from your{" "}
                <span className="rb-tag-pill">
                  <FontAwesomeIcon icon={faLocationDot} /> local store
                </span>
              </p>

              {/* Highlights — hidden on mobile */}
              <div className="rb-highlights rb-desktop-only">
                <div className="rb-highlight-item">
                  <span className="rb-hl-icon rb-hl-bolt">
                    <FontAwesomeIcon icon={faBolt} />
                  </span>
                  <span>Same-day delivery from nearby kiranas</span>
                </div>
                <div className="rb-highlight-item">
                  <span className="rb-hl-icon rb-hl-leaf">
                    <FontAwesomeIcon icon={faLeaf} />
                  </span>
                  <span>Fresh stock updated every morning</span>
                </div>
                <div className="rb-highlight-item">
                  <span className="rb-hl-icon rb-hl-hand">
                    <FontAwesomeIcon icon={faHandshake} />
                  </span>
                  <span>Support your local store owner directly</span>
                </div>
              </div>

              {/* Feature grid — hidden on mobile */}
              <div className="rb-feature-grid rb-desktop-only">
                <FeatureCard
                  icon={faStore}
                  color="orange"
                  title="Local Kirana"
                  desc="Verified nearby stores"
                />
                <FeatureCard
                  icon={faTruck}
                  color="blue"
                  title="Fast Delivery"
                  desc="At your door in minutes"
                />
                <FeatureCard
                  icon={faShieldHalved}
                  color="green"
                  title="Safe & Secure"
                  desc="OTP + data protection"
                />
                <FeatureCard
                  icon={faTag}
                  color="purple"
                  title="Best Prices"
                  desc="Deals & local discounts"
                />
              </div>
            </div>
          </div>

          {/* ══ RIGHT FORM PANEL ══ */}
          <div className="rb-form-panel">
            <div className="rb-form-inner">
              {step === "EMAIL" && (
                <div className="rb-form-card">
                  <div className="rb-form-badge">
                    <FontAwesomeIcon icon={faStar} />
                    <span>Trusted by thousands in your city</span>
                  </div>

                  <h2 className="rb-form-title">Sign in to your account</h2>
                  <p className="rb-form-sub">
                    We'll send a verification code to your email — no password
                    needed.
                  </p>

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
                    <span>{loading ? "Sending OTP…" : "Continue"}</span>
                    {!loading && <FontAwesomeIcon icon={faArrowRight} />}
                    {loading && <span className="rb-spinner" />}
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
                      <FontAwesomeIcon icon={faCheckCircle} /> Verified
                    </span>
                  </div>

                  {/* Mobile-only feature icon strip */}
                  <div className="rb-mobile-feat-strip">
                    <div className="rb-mf-item">
                      <span className="rb-mf-icon rb-mf-orange">
                        <FontAwesomeIcon icon={faStore} />
                      </span>
                      <span>Local Kirana</span>
                    </div>
                    <div className="rb-mf-item">
                      <span className="rb-mf-icon rb-mf-blue">
                        <FontAwesomeIcon icon={faTruck} />
                      </span>
                      <span>Fast Delivery</span>
                    </div>
                    <div className="rb-mf-item">
                      <span className="rb-mf-icon rb-mf-green">
                        <FontAwesomeIcon icon={faShieldHalved} />
                      </span>
                      <span>Safe & Secure</span>
                    </div>
                    <div className="rb-mf-item">
                      <span className="rb-mf-icon rb-mf-purple">
                        <FontAwesomeIcon icon={faTag} />
                      </span>
                      <span>Best Prices</span>
                    </div>
                  </div>
                </div>
              )}

              {step === "OTP" && (
                <div className="rb-form-card">
                  <div className="rb-form-badge rb-form-badge--verify">
                    <FontAwesomeIcon icon={faLock} />
                    <span>Verification Step</span>
                  </div>

                  <h2 className="rb-form-title">Enter OTP</h2>
                  <p className="rb-form-sub">
                    6-digit code sent to{" "}
                    <strong className="rb-email-highlight">{email}</strong>
                  </p>

                  <label className="rb-label rb-otp-label">
                    Enter 6-digit code
                  </label>
                  <div
                    className={`rb-otp-row ${otpStatus === "error" ? "rb-otp-error" : ""} ${otpStatus === "success" ? "rb-otp-success" : ""}`}
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

                  {otpStatus === "error" && (
                    <div className="rb-msg rb-msg--error">
                      <FontAwesomeIcon icon={faCircleExclamation} />
                      <span>Invalid OTP. Please check and try again.</span>
                    </div>
                  )}
                  {otpStatus === "success" && (
                    <div className="rb-msg rb-msg--success">
                      <FontAwesomeIcon icon={faCheckCircle} />
                      <span>OTP verified! Redirecting…</span>
                    </div>
                  )}

                  <button className="rb-btn-primary" onClick={handleVerifyOtp}>
                    <span>Verify &amp; Continue</span>
                    <FontAwesomeIcon icon={faArrowRight} />
                  </button>

                  <div className="rb-resend-row">
                    {timer > 0 ? (
                      <span className="rb-timer">
                        <FontAwesomeIcon icon={faClock} />
                        &nbsp;Resend code in <strong>{timer}s</strong>
                      </span>
                    ) : (
                      <button className="rb-link-btn" onClick={handleSendOtp}>
                        <FontAwesomeIcon icon={faArrowRotateRight} />
                        &nbsp;Resend OTP
                      </button>
                    )}
                  </div>

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

const FeatureCard = ({ icon, color, title, desc }) => (
  <div className={`rb-feat-card rb-feat-${color}`}>
    <span className="rb-feat-icon">
      <FontAwesomeIcon icon={icon} />
    </span>
    <div>
      <p className="rb-feat-title">{title}</p>
      <p className="rb-feat-desc">{desc}</p>
    </div>
  </div>
);
