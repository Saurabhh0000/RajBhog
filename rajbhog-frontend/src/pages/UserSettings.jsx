// src/pages/UserSettings.jsx
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { getMyProfile, updateFullName } from "../api/user/profileApi";
import {
  getPhones,
  addPhone,
  makePrimaryPhone,
  deletePhone,
} from "../api/user/phoneApi";
import {
  getMyAddresses,
  addAddress,
  makeDefaultAddress,
  deleteAddress,
} from "../api/user/addressApi";

import "../styles/UserSettings.css";

/* ── icons (inline svg helpers — no extra deps) ── */
const Icon = {
  User: (s = 18) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Mail: (s = 16) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  Phone: (s = 18) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  MapPin: (s = 18) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Check: (s = 16) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Plus: (s = 16) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Trash: (s = 15) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  X: (s = 18) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Alert: (s = 18) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Save: (s = 16) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Star: (s = 14) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
};

/* ============================================================
   MODAL
   ============================================================ */
function Modal({ title, icon, onClose, danger, children }) {
  return (
    <div className="us-modal-bd" onClick={onClose}>
      <div className="us-modal" onClick={(e) => e.stopPropagation()}>
        <div className="us-modal-head">
          <div className="us-modal-title">
            <div
              className={`us-modal-icon ${danger ? "us-modal-icon--danger" : ""}`}>
              {icon}
            </div>
            <h4>{title}</h4>
          </div>
          <button className="us-modal-close" onClick={onClose}>
            {Icon.X(18)}
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalActions({ onCancel, onSave, saveLabel = "Save", danger }) {
  return (
    <div className="us-modal-foot">
      <button className="us-btn-cancel" onClick={onCancel}>
        Cancel
      </button>
      <button
        className={`us-btn-save ${danger ? "us-btn-save--danger" : ""}`}
        onClick={onSave}>
        {danger ? Icon.Trash(15) : Icon.Save(15)}
        {saveLabel}
      </button>
    </div>
  );
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
export default function UserSettings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState("");
  const [phones, setPhones] = useState([]);
  const [addresses, setAddresses] = useState([]);

  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [phoneInput, setPhoneInput] = useState("");
  const [addressInput, setAddressInput] = useState({
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  });

  /* ── LOAD ── */
  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [p, ph, ad] = await Promise.all([
        getMyProfile(),
        getPhones(),
        getMyAddresses(),
      ]);
      setProfile(p.data);
      setFullName(p.data.fullName || "");
      setPhones(ph.data);
      setAddresses(ad.data);
    } catch {
      toast.error("Could not load your account details. Please refresh.");
    }
  };

  /* ── PROFILE ── */
  const saveName = async () => {
    if (!fullName.trim()) {
      toast.error("Full name cannot be empty.");
      return;
    }
    await updateFullName(fullName);
    localStorage.setItem("fullName", fullName);
    toast.success("Your name has been updated successfully.");
    loadAll();
  };

  /* ── PHONE ── */
  const savePhone = async () => {
    if (!/^[0-9]{10}$/.test(phoneInput)) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }
    await addPhone({ phoneNumber: phoneInput });
    toast.success("Phone number added to your account.");
    setPhoneInput("");
    setShowPhoneModal(false);
    loadAll();
  };

  /* ── ADDRESS ── */
  const saveAddress = async () => {
    const { addressLine1, city, state, pincode } = addressInput;
    if (!addressLine1 || !city || !state || !/^[0-9]{6}$/.test(pincode)) {
      toast.error(
        "Please fill all required fields with a valid 6-digit pincode.",
      );
      return;
    }
    await addAddress(addressInput);
    toast.success("Delivery address added successfully.");
    setShowAddressModal(false);
    setAddressInput({
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      isDefault: false,
    });
    loadAll();
  };

  /* ── DELETE ── */
  const confirmDelete = async () => {
    if (deleteTarget.type === "phone") {
      await deletePhone(deleteTarget.id);
      toast.success("Phone number removed from your account.");
    } else {
      await deleteAddress(deleteTarget.id);
      toast.success("Delivery address removed successfully.");
    }
    setDeleteTarget(null);
    loadAll();
  };

  if (!profile) return null;

  const completion =
    (profile.fullName ? 34 : 0) +
    (phones.length > 0 ? 33 : 0) +
    (addresses.length > 0 ? 33 : 0);

  const TABS = [
    { id: "profile", icon: Icon.User(17), label: "Profile" },
    { id: "phones", icon: Icon.Phone(17), label: "Phones" },
    { id: "addresses", icon: Icon.MapPin(17), label: "Addresses" },
  ];

  /* initials for avatar */
  const initials = (profile.fullName || profile.email || "U")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="us-root">
      {/* ══════════════ HEADER ══════════════ */}
      <div className="us-header">
        {/* Avatar + user info */}
        <div className="us-user-row">
          <div className="us-avatar">{initials}</div>
          <div className="us-user-info">
            <h1 className="us-user-name">
              {profile.fullName || "Your Account"}
            </h1>
            <p className="us-user-email">
              {Icon.Mail(13)}
              {profile.email}
            </p>
          </div>
        </div>

        {/* Profile completion */}
        <div className="us-completion">
          <div className="us-completion-top">
            <span className="us-completion-label">Profile Completion</span>
            <span className="us-completion-pct">{completion}%</span>
          </div>
          <div className="us-progress-track">
            <div
              className="us-progress-fill"
              style={{ width: `${completion}%` }}
            />
          </div>
          <div className="us-checklist">
            {[
              { label: "Full Name", done: !!profile.fullName },
              { label: "Phone Number", done: phones.length > 0 },
              { label: "Delivery Address", done: addresses.length > 0 },
            ].map(({ label, done }) => (
              <div
                key={label}
                className={`us-check-item ${done ? "us-check-item--done" : ""}`}>
                {Icon.Check(12)}
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════ TABS ══════════════ */}
      <div className="us-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`us-tab ${activeTab === t.id ? "us-tab--on" : ""}`}
            onClick={() => setActiveTab(t.id)}>
            {t.icon}
            <span>{t.label}</span>
            {t.id === "phones" && (
              <span className="us-tab-badge">{phones.length}</span>
            )}
            {t.id === "addresses" && (
              <span className="us-tab-badge">{addresses.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════════ CONTENT ══════════════ */}

      {/* ── PROFILE TAB ── */}
      {activeTab === "profile" && (
        <div className="us-card">
          <div className="us-card-head">
            <div className="us-card-head-left">
              <div className="us-card-icon">{Icon.User(16)}</div>
              <h3>Personal Information</h3>
            </div>
          </div>
          <div className="us-card-body">
            <div className="us-form-group">
              <label className="us-label">{Icon.User(13)} Full Name</label>
              <input
                className="us-input"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="us-form-group">
              <label className="us-label">{Icon.Mail(13)} Email Address</label>
              <input
                className="us-input us-input--disabled"
                value={profile.email}
                disabled
              />
              <span className="us-hint">Email address cannot be changed</span>
            </div>
            <button className="us-btn-primary" onClick={saveName}>
              {Icon.Save(15)} Save Changes
            </button>
          </div>
        </div>
      )}

      {/* ── PHONES TAB ── */}
      {activeTab === "phones" && (
        <div className="us-card">
          <div className="us-card-head">
            <div className="us-card-head-left">
              <div className="us-card-icon">{Icon.Phone(16)}</div>
              <h3>Phone Numbers</h3>
              <span className="us-count">{phones.length}</span>
            </div>
            <button
              className="us-btn-add"
              onClick={() => setShowPhoneModal(true)}>
              {Icon.Plus(14)} Add Phone
            </button>
          </div>
          <div className="us-card-body">
            {phones.length === 0 ? (
              <div className="us-empty">
                <div className="us-empty-icon">{Icon.Phone(28)}</div>
                <h4>No phone numbers yet</h4>
                <p>Add a phone number so we can reach you about your orders.</p>
                <button
                  className="us-btn-primary"
                  onClick={() => setShowPhoneModal(true)}>
                  {Icon.Plus(15)} Add Your First Phone
                </button>
              </div>
            ) : (
              <div className="us-items">
                {phones.map((p) => (
                  <div className="us-item" key={p.id}>
                    <div className="us-item-icon us-item-icon--phone">
                      {Icon.Phone(17)}
                    </div>
                    <div className="us-item-info">
                      <span className="us-item-val">{p.phoneNumber}</span>
                      {p.isPrimary && (
                        <span className="us-pill us-pill--primary">
                          <Star /> Primary
                        </span>
                      )}
                    </div>
                    <div className="us-item-actions">
                      {!p.isPrimary && (
                        <button
                          className="us-btn-action"
                          onClick={() => makePrimaryPhone(p.id).then(loadAll)}>
                          {Icon.Star(13)} Make Primary
                        </button>
                      )}
                      <button
                        className="us-btn-action us-btn-action--del"
                        onClick={() =>
                          setDeleteTarget({ type: "phone", id: p.id })
                        }>
                        {Icon.Trash(14)} Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ADDRESSES TAB ── */}
      {activeTab === "addresses" && (
        <div className="us-card">
          <div className="us-card-head">
            <div className="us-card-head-left">
              <div className="us-card-icon">{Icon.MapPin(16)}</div>
              <h3>Delivery Addresses</h3>
              <span className="us-count">{addresses.length}</span>
            </div>
            <button
              className="us-btn-add"
              onClick={() => setShowAddressModal(true)}>
              {Icon.Plus(14)} Add Address
            </button>
          </div>
          <div className="us-card-body">
            {addresses.length === 0 ? (
              <div className="us-empty">
                <div className="us-empty-icon">{Icon.MapPin(28)}</div>
                <h4>No addresses saved</h4>
                <p>Save your delivery address for faster checkout.</p>
                <button
                  className="us-btn-primary"
                  onClick={() => setShowAddressModal(true)}>
                  {Icon.Plus(15)} Add Your First Address
                </button>
              </div>
            ) : (
              <div className="us-items">
                {addresses.map((a) => (
                  <div className="us-item" key={a.id}>
                    <div className="us-item-icon us-item-icon--addr">
                      {Icon.MapPin(17)}
                    </div>
                    <div className="us-item-info">
                      <div className="us-addr-block">
                        <span className="us-addr-line">{a.addressLine1}</span>
                        {a.addressLine2 && (
                          <span className="us-addr-line">{a.addressLine2}</span>
                        )}
                        <span className="us-addr-city">
                          {a.city}, {a.state} — {a.pincode}
                        </span>
                      </div>
                      {a.isDefault && (
                        <span className="us-pill us-pill--default">
                          {Icon.Check(11)} Default
                        </span>
                      )}
                    </div>
                    <div className="us-item-actions">
                      {!a.isDefault && (
                        <button
                          className="us-btn-action"
                          onClick={() =>
                            makeDefaultAddress(a.id).then(loadAll)
                          }>
                          {Icon.Check(14)} Make Default
                        </button>
                      )}
                      <button
                        className="us-btn-action us-btn-action--del"
                        onClick={() =>
                          setDeleteTarget({ type: "address", id: a.id })
                        }>
                        {Icon.Trash(14)} Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════ MODALS ══════════════ */}

      {/* Phone modal */}
      {showPhoneModal && (
        <Modal
          title="Add Phone Number"
          icon={Icon.Phone(18)}
          onClose={() => setShowPhoneModal(false)}>
          <div className="us-modal-body">
            <div className="us-form-group">
              <label className="us-label">{Icon.Phone(13)} Phone Number</label>
              <input
                className="us-input"
                placeholder="Enter 10-digit mobile number"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                maxLength="10"
              />
              <span className="us-hint">
                We'll use this number for order updates
              </span>
            </div>
          </div>
          <ModalActions
            onCancel={() => setShowPhoneModal(false)}
            onSave={savePhone}
            saveLabel="Add Phone"
          />
        </Modal>
      )}

      {/* Address modal */}
      {showAddressModal && (
        <Modal
          title="Add Delivery Address"
          icon={Icon.MapPin(18)}
          onClose={() => setShowAddressModal(false)}>
          <div className="us-modal-body">
            <div className="us-form-group">
              <label className="us-label">
                Address Line 1 <span className="us-req">*</span>
              </label>
              <input
                className="us-input"
                placeholder="House no., Building name"
                value={addressInput.addressLine1}
                onChange={(e) =>
                  setAddressInput({
                    ...addressInput,
                    addressLine1: e.target.value,
                  })
                }
              />
            </div>
            <div className="us-form-group">
              <label className="us-label">Address Line 2</label>
              <input
                className="us-input"
                placeholder="Street, Area (optional)"
                value={addressInput.addressLine2}
                onChange={(e) =>
                  setAddressInput({
                    ...addressInput,
                    addressLine2: e.target.value,
                  })
                }
              />
            </div>
            <div className="us-form-row">
              <div className="us-form-group">
                <label className="us-label">
                  City <span className="us-req">*</span>
                </label>
                <input
                  className="us-input"
                  placeholder="City"
                  value={addressInput.city}
                  onChange={(e) =>
                    setAddressInput({ ...addressInput, city: e.target.value })
                  }
                />
              </div>
              <div className="us-form-group">
                <label className="us-label">
                  State <span className="us-req">*</span>
                </label>
                <input
                  className="us-input"
                  placeholder="State"
                  value={addressInput.state}
                  onChange={(e) =>
                    setAddressInput({ ...addressInput, state: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="us-form-group">
              <label className="us-label">
                Pincode <span className="us-req">*</span>
              </label>
              <input
                className="us-input"
                placeholder="6-digit pincode"
                value={addressInput.pincode}
                onChange={(e) =>
                  setAddressInput({ ...addressInput, pincode: e.target.value })
                }
                maxLength="6"
              />
            </div>
          </div>
          <ModalActions
            onCancel={() => setShowAddressModal(false)}
            onSave={saveAddress}
            saveLabel="Save Address"
          />
        </Modal>
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <Modal
          title="Confirm Deletion"
          icon={Icon.Alert(18)}
          onClose={() => setDeleteTarget(null)}
          danger>
          <div className="us-modal-body">
            <div className="us-delete-warn">
              <p>
                Are you sure you want to delete this{" "}
                <strong>{deleteTarget.type}</strong>? This action cannot be
                undone.
              </p>
            </div>
          </div>
          <ModalActions
            danger
            onCancel={() => setDeleteTarget(null)}
            onSave={confirmDelete}
            saveLabel="Yes, Delete"
          />
        </Modal>
      )}
    </div>
  );
}

/* tiny inline for pill */
function Star() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
