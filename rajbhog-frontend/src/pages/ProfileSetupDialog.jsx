// src/components/ProfileSetupDialog.jsx
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { updateFullName } from "../api/user/profileApi";
import { addPhone } from "../api/user/phoneApi";
import { addAddress } from "../api/user/addressApi";

import "../styles/ProfileSetupDialog.css";

import {
  User,
  Phone,
  MapPin,
  ArrowRight,
  CheckCircle,
  Loader,
  ShieldCheck,
  Lock,
} from "lucide-react";

/* ── Step metadata ── */
const STEPS = [
  { num: 1, label: "Profile", Icon: User },
  { num: 2, label: "Phone", Icon: Phone },
  { num: 3, label: "Address", Icon: MapPin },
];

/* ── Step dot component ── */
function StepDot({ stepNum, currentStep }) {
  const done = stepNum < currentStep;
  const active = stepNum === currentStep;
  const { Icon } = STEPS.find((s) => s.num === stepNum);

  return (
    <div
      className={[
        "psd__step-dot",
        done ? "psd__step-dot--done" : "",
        active ? "psd__step-dot--active" : "",
      ].join(" ")}>
      {done ? <CheckCircle size={14} /> : <Icon size={14} />}
    </div>
  );
}

/* ============================================================
   MAIN COMPONENT — ALL ORIGINAL LOGIC PRESERVED
   props: open, onSuccess
   ============================================================ */
export default function ProfileSetupDialog({ open, onSuccess }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState({
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
  });

  if (!open) return null;

  /* ── step config for the header ── */
  const stepMeta = {
    1: {
      Icon: User,
      title: "Complete Your Profile",
      sub: "Let's start with your full name",
    },
    2: {
      Icon: Phone,
      title: "Add Phone Number",
      sub: "This will be your primary contact",
    },
    3: {
      Icon: MapPin,
      title: "Add Delivery Address",
      sub: "We'll deliver your orders here",
    },
  };
  const { Icon: StepIcon, title, sub } = stepMeta[step];

  /* ── STEP 1 — original logic, improved toast ── */
  const handleName = async () => {
    if (!fullName.trim()) {
      toast.error("Full name is required");
      return;
    }

    if (fullName.trim().length < 3) {
      toast.error("Name must be at least 3 characters");
      return;
    }
    try {
      setLoading(true);
      await updateFullName(fullName);
      localStorage.setItem("fullName", fullName);
      setStep(2);
    } catch {
      toast.error("Failed to update your name. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── STEP 2 — original logic, improved toast ── */
  const handlePhone = async () => {
    if (!phone.trim()) {
      toast.error("Phone number is required");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error("Enter valid 10-digit mobile number");
      return;
    }
    try {
      setLoading(true);
      const res = await addPhone({ phoneNumber: phone });
      setStep(3);
    } catch {
      toast.error("Failed to save phone number. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── STEP 3 — original logic, improved toast ── */
  const handleAddress = async () => {
    const { addressLine1, city, state, pincode } = address;
    if (!addressLine1.trim()) {
      toast.error("Address Line 1 is required");
      return;
    }

    if (!city.trim()) {
      toast.error("City is required");
      return;
    }

    if (!state.trim()) {
      toast.error("State is required");
      return;
    }

    if (!/^\d{6}$/.test(pincode)) {
      toast.error("Enter valid 6-digit pincode");
      return;
    }
    try {
      setLoading(true);
      const res = await addAddress(address);

      const firstName = getFirstName();
      toast.success(`Welcome ${firstName} 👋 — Your profile is ready!`);
      setTimeout(() => {
        onSuccess(); // close modal
        navigate("/user/dashboard"); // 🔥 redirect
      }, 800);
    } catch {
      toast.error("Failed to save your address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getFirstName = () => {
    return fullName?.trim().split(" ")[0] || "User";
  };

  /* ─────────── RENDER ─────────── */
  return (
    <div className="psd__overlay">
      <div className="psd__dialog">
        {/* ════════ BRANDED HEADER ════════ */}
        <div className="psd__top-strip">
          <div className="psd__top-inner">
            <div className="psd__top-icon">
              <StepIcon size={24} />
            </div>
            <div className="psd__top-text">
              <h2 className="psd__top-title">{title}</h2>
              <p className="psd__top-sub">{sub}</p>
            </div>
          </div>
        </div>

        {/* ════════ STEP INDICATOR ════════ */}
        <div className="psd__steps">
          {STEPS.map(({ num, label }, idx) => (
            <div key={num} className="psd__step-item">
              <div className="psd__step-dot-wrap">
                <StepDot stepNum={num} currentStep={step} />
                <span
                  className={[
                    "psd__step-label",
                    num === step ? "psd__step-label--active" : "",
                    num < step ? "psd__step-label--done" : "",
                  ].join(" ")}>
                  {label}
                </span>
              </div>

              {/* connector line — not after last */}
              {idx < STEPS.length - 1 && (
                <div
                  className={`psd__step-line ${num < step ? "psd__step-line--done" : ""}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* ════════ BODY ════════ */}
        <div className="psd__body">
          {/* ── STEP 1: Full Name ── */}
          {step === 1 && (
            <div className="psd__field">
              <div className="psd__field-label">
                <User size={12} /> Full Name
                <span className="psd__required-dot" />
              </div>
              <input
                type="text"
                className="psd__input"
                placeholder="e.g. Ananya Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleName()}
                autoFocus
              />
            </div>
          )}

          {/* ── STEP 2: Phone ── */}
          {step === 2 && (
            <div className="psd__field">
              <div className="psd__field-label">
                <Phone size={12} /> Phone Number
                <span className="psd__required-dot" />
              </div>
              <input
                type="tel"
                className="psd__input"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePhone()}
                autoFocus
              />
            </div>
          )}

          {/* ── STEP 3: Address ── */}
          {step === 3 && (
            <>
              {/* Address Line 1 */}
              <div className="psd__field">
                <div className="psd__field-label">
                  <MapPin size={12} /> Address Line 1
                  <span className="psd__required-dot" />
                </div>
                <input
                  type="text"
                  className="psd__input"
                  placeholder="House / Flat / Building"
                  value={address.addressLine1}
                  onChange={(e) =>
                    setAddress({ ...address, addressLine1: e.target.value })
                  }
                />
              </div>

              {/* Address Line 2 */}
              <div className="psd__field">
                <div
                  className="psd__field-label"
                  style={{ justifyContent: "space-between" }}>
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <MapPin size={12} /> Address Line 2
                  </span>
                  <span className="psd__optional-tag">optional</span>
                </div>
                <input
                  type="text"
                  className="psd__input"
                  placeholder="Street / Area / Landmark"
                  value={address.addressLine2}
                  onChange={(e) =>
                    setAddress({ ...address, addressLine2: e.target.value })
                  }
                />
              </div>

              {/* City + State (2-col) */}
              <div className="psd__field-row">
                <div className="psd__field">
                  <div className="psd__field-label">
                    <MapPin size={12} /> City
                    <span className="psd__required-dot" />
                  </div>
                  <input
                    type="text"
                    className="psd__input"
                    placeholder="City"
                    value={address.city}
                    onChange={(e) =>
                      setAddress({ ...address, city: e.target.value })
                    }
                  />
                </div>
                <div className="psd__field">
                  <div className="psd__field-label">
                    <MapPin size={12} /> State
                    <span className="psd__required-dot" />
                  </div>
                  <input
                    type="text"
                    className="psd__input"
                    placeholder="State"
                    value={address.state}
                    onChange={(e) =>
                      setAddress({ ...address, state: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Pincode */}
              <div className="psd__field">
                <div className="psd__field-label">
                  <Lock size={12} /> Pincode
                  <span className="psd__required-dot" />
                </div>
                <input
                  type="text"
                  className="psd__input"
                  placeholder="e.g. 500001"
                  value={address.pincode}
                  maxLength={6}
                  onChange={(e) =>
                    setAddress({
                      ...address,
                      pincode: e.target.value.replace(/\D/g, ""),
                    })
                  }
                />
              </div>
            </>
          )}
        </div>

        {/* ════════ FOOTER ════════ */}
        <div className="psd__footer">
          <button
            className="psd__btn-primary"
            disabled={loading}
            onClick={
              step === 1 ? handleName : step === 2 ? handlePhone : handleAddress
            }>
            {loading ? (
              <>
                <span className="psd__btn-spin" /> Saving…
              </>
            ) : step === 3 ? (
              <>
                <CheckCircle size={17} /> Complete Setup
              </>
            ) : (
              <>
                Continue <ArrowRight size={17} />
              </>
            )}
          </button>

          <p className="psd__progress-note">
            <ShieldCheck size={12} />
            Step {step} of {STEPS.length} — your data is secure
          </p>
        </div>
      </div>
    </div>
  );
}
