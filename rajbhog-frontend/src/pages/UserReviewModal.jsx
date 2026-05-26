// src/components/UserReviewModal.jsx
import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Star, MessageSquare, Send, AlertCircle } from "lucide-react";
import "../styles/UserReviewModal.css";

/* ── Star rating labels ── */
const STAR_LABELS = {
  1: { label: "Poor", emoji: "😞" },
  2: { label: "Fair", emoji: "😐" },
  3: { label: "Good", emoji: "🙂" },
  4: { label: "Very Good", emoji: "😊" },
  5: { label: "Excellent", emoji: "🤩" },
};

/* ============================================================
   MAIN COMPONENT — ALL ORIGINAL LOGIC PRESERVED
   props: orderItemId, onClose, onSubmit
   ============================================================ */
export default function UserReviewModal({ orderItemId, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const activeRating = hover || rating;

  /* ── SUBMIT — original logic ── */
  const handleSubmit = async () => {
    if (!rating) {
      setError("Please select a star rating before submitting.");
      return;
    }
    setError("");
    try {
      setLoading(true);
      await onSubmit({ orderItemId, rating, comment });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  /* ─────────── RENDER ─────────── */
  return createPortal(
    <div className="urm__overlay" onClick={onClose}>
      <div className="urm__modal" onClick={(e) => e.stopPropagation()}>
        {/* ════════ HEADER ════════ */}
        <div className="urm__header">
          <div className="urm__header-left">
            <div className="urm__header-icon">
              <Star size={14} fill="#f59e0b" strokeWidth={0} />
            </div>
            <span className="urm__header-title">Write a Review</span>
          </div>
          <button
            className="urm__close-btn"
            onClick={onClose}
            aria-label="Close">
            <X size={15} />
          </button>
        </div>

        {/* ════════ SCROLLABLE BODY ════════ */}
        <div className="urm__body">
          {/* HERO */}
          <div className="urm__hero">
            <div className="urm__hero-icon">
              <Star size={30} fill="#f59e0b" strokeWidth={0} />
            </div>
            <h2 className="urm__title">How was your experience?</h2>
            <p className="urm__subtitle">
              Your honest review helps other RAJBHOG customers make better
              choices
            </p>
          </div>

          {/* STAR RATING */}
          <div className="urm__stars-card">
            <p className="urm__stars-label">Rate this product</p>

            <div className="urm__stars-row">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className={`urm__star-btn ${star <= activeRating ? "urm__star-btn--on" : ""}`}
                  onClick={() => {
                    setRating(star);
                    setError("");
                  }}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}>
                  <Star
                    size={40}
                    fill={star <= activeRating ? "#f59e0b" : "none"}
                    stroke={star <= activeRating ? "#f59e0b" : "#cfc0b0"}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>

            {activeRating > 0 ? (
              <div className={`urm__chip urm__chip--s${activeRating}`}>
                <span className="urm__chip-emoji">
                  {STAR_LABELS[activeRating].emoji}
                </span>
                <span className="urm__chip-text">
                  {STAR_LABELS[activeRating].label}
                </span>
              </div>
            ) : (
              <div className="urm__chip urm__chip--empty">
                Tap a star to rate
              </div>
            )}
          </div>

          {/* ERROR */}
          {error && (
            <div className="urm__error-box">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {/* COMMENT */}
          <div className="urm__comment-section">
            <div className="urm__comment-top">
              <label className="urm__comment-label" htmlFor="urm-comment">
                <MessageSquare size={12} />
                Your Review
              </label>
              <span className="urm__optional-tag">optional</span>
            </div>

            <textarea
              id="urm-comment"
              className="urm__textarea"
              placeholder="What did you like or dislike? Share your honest experience…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              rows={4}
            />

            <div className="urm__char-row">
              <span
                className={`urm__char-current ${comment.length > 450 ? "urm__char-current--warn" : ""}`}>
                {comment.length}
              </span>
              <span>/ 500</span>
            </div>
          </div>
        </div>
        {/* end body */}

        {/* ════════ FOOTER ════════ */}
        <div className="urm__footer">
          <button className="urm__btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="urm__btn-submit"
            onClick={handleSubmit}
            disabled={loading}>
            {loading ? (
              <>
                <span className="urm__spinner" />
                Submitting…
              </>
            ) : (
              <>
                <Send size={14} />
                Submit Review
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
