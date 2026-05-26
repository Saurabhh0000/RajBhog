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
  faPercent,
  faShieldHalved,
  faBolt,
  faStore,
  faCircleExclamation,
  faCheckCircle,
  faLocationDot,
  faLeaf,
  faHandshake,
  faTag,
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
      toast.error("Please enter your email");
      return;
    }
    try {
      setLoading(true);
      await sendOtp(email);
      toast.success("OTP sent to your email");
      setStep("OTP");
      setTimer(30);
    } catch {
      toast.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      toast.error("Enter complete OTP");
      return;
    }
    try {
      const res = await verifyOtp(email, otpValue);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      const name = email.split("@")[0];
      const isNewUser = res.data.isNewUser;

      if (isNewUser) {
        toast.success(`Welcome ${name} 🎉\nLet's set up your profile 🚀`, {
          icon: "✨",
          duration: 3000,
        });
      } else {
        toast.success(`Welcome back ${name} 👋`, {
          icon: "🛒",
          duration: 2500,
        });
      }
      // 🔍 CHECK IF CART EXISTS
      const pendingCart = localStorage.getItem("pendingCart");

      if (pendingCart) {
        try {
          const data = JSON.parse(pendingCart);

          await addToCart(data);

          toast.success("Item added to cart 🛒");
          localStorage.removeItem("pendingCart");

          // ✅ REDIRECT TO CART (ONLY IF CART EXISTS)
          setTimeout(() => {
            window.location.href = "/user/cart";
          }, 800);

          return; // 🔥 IMPORTANT (stop further execution)
        } catch (err) {
          console.error(err);
          toast.error("Failed to restore cart");
        }
      }

      setTimeout(() => {
        window.location.href =
          res.data.role === "ADMIN" ? "/admin/dashboard" : "/user/dashboard";
      }, 700);
    } catch {
      setOtpStatus("error");
      setOtp(["", "", "", "", "", ""]);
      toast.error("Invalid OTP");
      setTimeout(() => setOtpStatus(""), 900);
    }
  };

  const handleOtpChange = (index, value) => {
    const v = value.slice(-1);
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
  };

  return (
    <>
      <Navbar />

      <div className="auth-page">
        <div className="auth-card">
          {/* ── LEFT BRAND PANEL ── */}
          <div className="auth-left">
            <div className="brand-content">
              {/* Logo + Name */}
              <div className="brand-header">
                <div className="logo-wrapper">
                  <div className="logo-icon">
                    <FontAwesomeIcon icon={faStore} />
                  </div>
                  <h1 className="brand-title">
                    RAJ<span>BHOG</span>
                  </h1>
                </div>

                {/* Subtitle with spans */}
                <p className="brand-subtitle">
                  <span className="sub-hi">Your neighbourhood kirana,</span> now
                  online. Get{" "}
                  <span className="sub-fresh">
                    <FontAwesomeIcon icon={faLeaf} className="sub-leaf" />
                    fresh groceries
                  </span>
                  <span className="sub-dot" /> daily staples{" "}
                  <span className="sub-dot" /> &amp; more — delivered from your{" "}
                  <span className="sub-loc">
                    <FontAwesomeIcon icon={faLocationDot} />
                    local store
                  </span>{" "}
                  fast &amp; trusted.
                </p>

                {/* Taglines */}
                <div className="brand-taglines">
                  <div className="tagline-item">
                    <span className="tagline-icon tl-orange">
                      <FontAwesomeIcon icon={faBolt} />
                    </span>
                    <span>Same-day delivery from nearby kiranas</span>
                  </div>
                  <div className="tagline-item">
                    <span className="tagline-icon tl-yellow">
                      <FontAwesomeIcon icon={faLeaf} />
                    </span>
                    <span>Fresh stock updated every morning</span>
                  </div>
                  <div className="tagline-item">
                    <span className="tagline-icon tl-green">
                      <FontAwesomeIcon icon={faHandshake} />
                    </span>
                    <span>Support your local store owner directly</span>
                  </div>
                </div>
              </div>

              {/* Feature cards */}
              <div className="brand-features">
                <Feature
                  icon={faStore}
                  title="Local Kirana Network"
                  desc="Shop from verified neighbourhood stores"
                  gradient="fi-orange"
                />
                <Feature
                  icon={faTruck}
                  title="Fast Delivery"
                  desc="Groceries at your door within minutes"
                  gradient="fi-blue"
                />
                <Feature
                  icon={faShieldHalved}
                  title="Secure & Safe"
                  desc="OTP login with full data protection"
                  gradient="fi-green"
                />
                <Feature
                  icon={faTag}
                  title="Best Prices"
                  desc="Daily offers & local discounts always on"
                  gradient="fi-purple"
                />
              </div>
            </div>
          </div>

          {/* ── RIGHT LOGIN PANEL ── */}
          <div className="auth-right">
            <div className="right-blob right-blob-1" />
            <div className="right-blob right-blob-2" />

            <div className="form-container">
              {/* EMAIL STEP */}
              {step === "EMAIL" && (
                <div className="form-card">
                  <div className="form-header">
                    <div className="welcome-badge">
                      <FontAwesomeIcon icon={faStar} />
                      <span>Welcome Back</span>
                    </div>
                    <h2 className="form-title">Login to continue</h2>
                    <p className="form-description">
                      Enter your email to receive a one-time verification code
                      and access your account.
                    </p>
                  </div>

                  <div className="form-body">
                    <label htmlFor="email">Email address</label>
                    <div className="input-wrapper">
                      <div className="input-icon">
                        <FontAwesomeIcon icon={faEnvelope} />
                      </div>
                      <input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSendOtp()}
                      />
                    </div>

                    <button
                      className="primary-btn"
                      disabled={loading}
                      onClick={handleSendOtp}>
                      <span>{loading ? "Sending OTP..." : "Continue"}</span>
                      <FontAwesomeIcon icon={faArrowRight} />
                    </button>
                  </div>

                  {/* Trust chips */}
                  <div className="trust-row">
                    <div className="trust-chip">
                      <FontAwesomeIcon icon={faShieldHalved} />
                      <span>Secure Login</span>
                    </div>
                    <div className="trust-chip">
                      <FontAwesomeIcon icon={faBolt} />
                      <span>Instant OTP</span>
                    </div>
                    <div className="trust-chip">
                      <FontAwesomeIcon icon={faCheckCircle} />
                      <span>Verified</span>
                    </div>
                  </div>
                </div>
              )}

              {/* OTP STEP */}
              {step === "OTP" && (
                <div className="form-card">
                  <div className="form-header">
                    <div className="welcome-badge">
                      <FontAwesomeIcon icon={faShieldHalved} />
                      <span>Verification</span>
                    </div>
                    <h2 className="form-title">Enter OTP</h2>
                    <p className="form-description">
                      Enter the 6-digit code sent to <strong>{email}</strong>
                    </p>
                  </div>

                  <div className="form-body">
                    <div className={`otp-container ${otpStatus}`}>
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) =>
                            handleOtpChange(index, e.target.value)
                          }
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="otp-input"
                        />
                      ))}
                    </div>

                    {otpStatus === "error" && (
                      <div className="error-message">
                        <FontAwesomeIcon icon={faCircleExclamation} />
                        <span>Invalid OTP. Please try again.</span>
                      </div>
                    )}

                    {otpStatus === "success" && (
                      <div className="success-message">
                        <FontAwesomeIcon icon={faCheckCircle} />
                        <span>OTP verified successfully!</span>
                      </div>
                    )}

                    <button className="primary-btn" onClick={handleVerifyOtp}>
                      <span>Verify &amp; Continue</span>
                      <FontAwesomeIcon icon={faArrowRight} />
                    </button>

                    <div className="resend-section">
                      {timer > 0 ? (
                        <div className="timer-display">
                          <FontAwesomeIcon icon={faClock} />
                          <span>&nbsp;Resend code in {timer}s</span>
                        </div>
                      ) : (
                        <button className="link-btn" onClick={handleSendOtp}>
                          <FontAwesomeIcon icon={faArrowRotateRight} />
                          &nbsp;<span>Resend OTP</span>
                        </button>
                      )}
                    </div>

                    <button
                      className="back-btn"
                      onClick={() => {
                        setStep("EMAIL");
                        setOtp(["", "", "", "", "", ""]);
                        setOtpStatus("");
                      }}>
                      ← Change Email
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const Feature = ({ icon, title, desc, gradient }) => (
  <div className="feature-card">
    <div className={`feature-icon-wrapper ${gradient}`}>
      <FontAwesomeIcon icon={icon} />
    </div>
    <div className="feature-content">
      <h4>{title}</h4>
      <p>{desc}</p>
    </div>
  </div>
);
