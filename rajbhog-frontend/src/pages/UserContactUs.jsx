// src/pages/ContactUs.jsx  — zero logic changes
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Mail,
  Phone,
  User,
  Send,
  MessageSquare,
  CheckCircle2,
  MapPin,
  Clock,
  ShieldCheck,
  Headphones,
} from "lucide-react";
import { submitContact } from "../api/public/contactApi";
import { getMyProfile } from "../api/user/profileApi";
import "../styles/UserContactUs.css";

export default function ContactUs() {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getMyProfile();
        const data = res.data;
        setProfile(data);
        setForm((prev) => ({
          ...prev,
          name: data.fullName || "",
          email: data.email || "",
        }));
      } catch (err) {
        console.error("Profile load failed", err);
      }
    };
    fetchProfile();
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!form.email.trim()) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!form.subject.trim()) {
      toast.error("Please enter a subject for your request.");
      return;
    }
    if (!form.message.trim()) {
      toast.error("Please write a message before submitting.");
      return;
    }
    try {
      setLoading(true);
      await submitContact(form);
      toast.success(
        "Your message has been sent! We'll get back to you within 24 hours.",
      );
      setForm({ ...form, subject: "", message: "" });
    } catch {
      toast.error(
        "Something went wrong. Please try again or email us directly.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ucu__page">
      <div className="ucu__container">
        {/* ══ LEFT PANEL ══ */}
        <aside className="ucu__left">
          <div className="ucu__brand-intro">
            <div className="ucu__brand-icon">
              <Headphones size={26} />
            </div>
            <div>
              <h1 className="ucu__heading">We're here to help</h1>
              <p className="ucu__subheading">
                Have a question or concern? Reach out to the RAJBHOG support
                team — we respond within 24 hours.
              </p>
            </div>
          </div>

          {profile && (
            <div className="ucu__user-card">
              <div className="ucu__user-avatar">
                {profile.fullName?.charAt(0)?.toUpperCase() || (
                  <User size={18} />
                )}
              </div>
              <div className="ucu__user-info">
                <span className="ucu__user-tag">Submitting as</span>
                <strong className="ucu__user-name">{profile.fullName}</strong>
                <span className="ucu__user-email">{profile.email}</span>
              </div>
              <div className="ucu__verified-badge">
                <CheckCircle2 size={15} /> Verified
              </div>
            </div>
          )}

          <div className="ucu__methods">
            <h3 className="ucu__methods-title">Contact Details</h3>

            <a href="mailto:support@rajbhog.com" className="ucu__method-card">
              <div className="ucu__method-icon ucu__method-icon--mail">
                <Mail size={19} />
              </div>
              <div className="ucu__method-body">
                <span className="ucu__method-label">Email Support</span>
                <span className="ucu__method-value">support@rajbhog.com</span>
              </div>
            </a>

            <a href="tel:+919876543210" className="ucu__method-card">
              <div className="ucu__method-icon ucu__method-icon--phone">
                <Phone size={19} />
              </div>
              <div className="ucu__method-body">
                <span className="ucu__method-label">Call Us</span>
                <span className="ucu__method-value">+91 98765 43210</span>
              </div>
            </a>

            <div className="ucu__method-card ucu__method-card--static">
              <div className="ucu__method-icon ucu__method-icon--map">
                <MapPin size={19} />
              </div>
              <div className="ucu__method-body">
                <span className="ucu__method-label">Store Address</span>
                <span className="ucu__method-value">
                  Nokha, Sasaram, Rohtas
                  <br />
                  Bihar — 802215
                </span>
              </div>
            </div>
          </div>

          <div className="ucu__trust-row">
            <div className="ucu__trust-pill">
              <Clock size={13} />
              <span>24-hr response</span>
            </div>
            <div className="ucu__trust-pill">
              <ShieldCheck size={13} />
              <span>Secure &amp; private</span>
            </div>
            <div className="ucu__trust-pill">
              <CheckCircle2 size={13} />
              <span>Expert support</span>
            </div>
          </div>
        </aside>

        {/* ══ RIGHT PANEL — FORM ══ */}
        <section className="ucu__form-panel">
          <div className="ucu__form-header">
            <div className="ucu__form-header-text">
              <h2 className="ucu__form-title">Send us a message</h2>
              <p className="ucu__form-subtitle">
                Fill in the details below and our team will get back to you
                shortly.
              </p>
            </div>
            <div className="ucu__form-badge">
              <MessageSquare size={14} /> Support Request
            </div>
          </div>

          <form className="ucu__form" onSubmit={submit} noValidate>
            {/* Name + Email */}
            <div className="ucu__row-2">
              <div className="ucu__field">
                <label className="ucu__label" htmlFor="ucu-name">
                  Full Name <span className="ucu__req">*</span>
                </label>
                <div className="ucu__input-wrap">
                  <User size={16} className="ucu__input-icon" />
                  <input
                    id="ucu-name"
                    name="name"
                    type="text"
                    className="ucu__input"
                    value={form.name}
                    onChange={onChange}
                    placeholder="Your full name"
                    readOnly={!!profile}
                  />
                  {!!profile && (
                    <span className="ucu__locked-tag">Auto-filled</span>
                  )}
                </div>
              </div>

              <div className="ucu__field">
                <label className="ucu__label" htmlFor="ucu-email">
                  Email Address <span className="ucu__req">*</span>
                </label>
                <div className="ucu__input-wrap">
                  <Mail size={16} className="ucu__input-icon" />
                  <input
                    id="ucu-email"
                    name="email"
                    type="email"
                    className="ucu__input"
                    value={form.email}
                    onChange={onChange}
                    placeholder="you@example.com"
                    readOnly={!!profile}
                  />
                  {!!profile && (
                    <span className="ucu__locked-tag">Auto-filled</span>
                  )}
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="ucu__field">
              <label className="ucu__label" htmlFor="ucu-phone">
                Phone Number <span className="ucu__optional">optional</span>
              </label>
              <div className="ucu__input-wrap">
                <Phone size={16} className="ucu__input-icon" />
                <input
                  id="ucu-phone"
                  name="phone"
                  type="tel"
                  className="ucu__input"
                  value={form.phone}
                  onChange={onChange}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
            </div>

            {/* Subject */}
            <div className="ucu__field">
              <label className="ucu__label" htmlFor="ucu-subject">
                Subject <span className="ucu__req">*</span>
              </label>
              <div className="ucu__input-wrap">
                <MessageSquare size={16} className="ucu__input-icon" />
                <input
                  id="ucu-subject"
                  name="subject"
                  type="text"
                  className="ucu__input"
                  value={form.subject}
                  onChange={onChange}
                  placeholder="Brief description of your issue"
                />
              </div>
            </div>

            {/* Message */}
            <div className="ucu__field">
              <label className="ucu__label" htmlFor="ucu-message">
                Message <span className="ucu__req">*</span>
              </label>
              <textarea
                id="ucu-message"
                name="message"
                className="ucu__textarea"
                rows={5}
                value={form.message}
                onChange={onChange}
                placeholder="Please describe your issue or question in detail…"
              />
              <div className="ucu__char-hint">
                {form.message.length > 0
                  ? `${form.message.length} characters`
                  : "Be as specific as possible — it helps us resolve faster."}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="ucu__submit-btn"
              disabled={loading}>
              {loading ? (
                <>
                  <span className="ucu__spinner" /> Sending your message…
                </>
              ) : (
                <>
                  <Send size={16} /> Send Message
                </>
              )}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
