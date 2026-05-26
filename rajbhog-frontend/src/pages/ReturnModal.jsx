import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { X, RotateCcw, AlertCircle, ChevronDown, Check } from "lucide-react";
import "../styles/ReturnModal.css";

const RETURN_REASONS = [
  "Item damaged or defective",
  "Wrong item delivered",
  "Item not as described",
  "Poor quality product",
  "Changed my mind",
  "Other",
];

export default function ReturnModal({ orderNumber, onClose, onSubmit }) {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const btnRef = useRef(null);
  const listRef = useRef(null);
  const [listStyle, setListStyle] = useState({});

  useEffect(() => {
    if (!dropdownOpen || !btnRef.current) return;

    const rect = btnRef.current.getBoundingClientRect();
    const vpHeight = window.innerHeight;

    // ✅ temporarily render below first
    const tempHeight = 260; // safe max height

    const spaceBelow = vpHeight - rect.bottom;
    const openUp = spaceBelow < tempHeight;

    setListStyle({
      position: "fixed",
      top: openUp ? rect.top - tempHeight - 6 : rect.bottom + 6,
      left: rect.left,
      width: rect.width,
      zIndex: 99999,
    });
  }, [dropdownOpen]);

  useEffect(() => {
    if (!dropdownOpen) return;

    const handler = (e) => {
      if (
        btnRef.current &&
        !btnRef.current.contains(e.target) &&
        listRef.current &&
        !listRef.current.contains(e.target)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  const dropdownRef = useRef(null);

  /* Close on outside click */
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  const isOther = selectedReason === "Other";
  const finalReason = isOther ? customReason.trim() : selectedReason;
  const canSubmit = finalReason.length > 0 && !submitting;

  const handleSelect = (reason) => {
    setSelectedReason(reason);
    setCustomReason("");
    setDropdownOpen(false);
  };

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast.error("Please select a return reason before submitting.");
      return;
    }
    if (isOther && !customReason.trim()) {
      toast.error("Please describe your reason in the text box below.");
      return;
    }
    try {
      setSubmitting(true);
      await onSubmit(finalReason);
      toast.success(
        `Return request for Order #${orderNumber} submitted! We'll process it within 3–5 business days.`,
      );
      onClose();
    } catch {
      toast.error("Failed to submit. Please try again or contact support.");
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="rtm__overlay" onClick={onClose}>
      <div className="rtm__modal" onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className="rtm__header">
          <div className="rtm__header-left">
            <div className="rtm__header-icon">
              <RotateCcw size={18} />
            </div>
            <div>
              <h3 className="rtm__title">Request a Return</h3>
              <p className="rtm__order-tag">Order #{orderNumber}</p>
            </div>
          </div>
          <button
            className="rtm__close-btn"
            onClick={onClose}
            aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {/* BODY — scrollable */}
        <div className="rtm__body">
          {/* Notice */}
          <div className="rtm__notice">
            <AlertCircle size={15} className="rtm__notice-icon" />
            <p>
              Our team will review your return request within{" "}
              <strong>24–48 hours</strong> of submission.
            </p>
          </div>

          {/* Reason field */}
          <div className="rtm__field">
            <label className="rtm__label">
              Return Reason <span className="rtm__req">*</span>
            </label>

            <div className="rtm__dropdown-wrap">
              <button
                ref={btnRef}
                type="button"
                className={`rtm__dropdown-btn
        ${dropdownOpen ? "rtm__dropdown-btn--open" : ""}
        ${selectedReason ? "rtm__dropdown-btn--selected" : ""}`}
                onClick={() => setDropdownOpen((o) => !o)}>
                <span>{selectedReason || "Select a reason…"}</span>
                <ChevronDown
                  size={16}
                  className={`rtm__dropdown-chevron ${
                    dropdownOpen ? "rtm__dropdown-chevron--up" : ""
                  }`}
                />
              </button>

              {dropdownOpen &&
                createPortal(
                  <ul
                    ref={listRef}
                    className="rtm__dropdown-list"
                    style={listStyle}>
                    {RETURN_REASONS.map((reason) => (
                      <li
                        key={reason}
                        className={`rtm__dropdown-item ${
                          selectedReason === reason
                            ? "rtm__dropdown-item--active"
                            : ""
                        }`}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setSelectedReason(reason);
                          setDropdownOpen(false);
                        }}>
                        {reason}
                      </li>
                    ))}
                  </ul>,
                  document.body,
                )}
            </div>
          </div>

          {/* Custom textarea — only for "Other" */}
          {isOther && (
            <div className="rtm__field">
              <label className="rtm__label">
                Describe your reason <span className="rtm__req">*</span>
              </label>
              <textarea
                className="rtm__textarea"
                placeholder="Tell us more about your return reason…"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                maxLength={400}
                rows={4}
              />
              <div className="rtm__char-count">{customReason.length} / 400</div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="rtm__footer">
          <button className="rtm__btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="rtm__btn-submit"
            onClick={handleSubmit}
            disabled={!canSubmit}>
            {submitting ? (
              <>
                <span className="rtm__spinner" /> Submitting…
              </>
            ) : (
              <>
                <RotateCcw size={14} /> Submit Return
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
