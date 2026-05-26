import { useState } from "react";
import toast from "react-hot-toast";
import {
  Mail,
  Phone,
  User,
  Send,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import { submitContact } from "../api/public/contactApi";
import "../styles/ContactUs.css";
import Navbar from "../components/Navbar";

export default function ContactUs() {
  const [loading, setLoading] = useState(false);

  const loggedInUser = localStorage.getItem("fullName");

  const [form, setForm] = useState({
    name: loggedInUser || "",
    email: localStorage.getItem("email") || "",
    phone: "",
    subject: "",
    message: "",
  });

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      await submitContact(form);
      toast.success("Support request submitted 🎉");

      setForm({
        ...form,
        subject: "",
        message: "",
      });
    } catch {
      toast.error("Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="contact-page">
        <div className="contact-container">
          {/* LEFT INFO SECTION */}
          <div className="contact-info">
            <div className="info-header">
              <div className="icon-badge">
                <MessageSquare size={28} />
              </div>
              <h1>Get in Touch</h1>
              <p>
                Have questions? We're here to help. Our support team typically
                responds within 24 hours.
              </p>
            </div>

            {loggedInUser && (
              <div className="logged-user-card">
                <div className="user-avatar">
                  <User size={20} />
                </div>
                <div className="user-info">
                  <span className="user-label">Logged in as</span>
                  <strong>{loggedInUser}</strong>
                </div>
                <CheckCircle2 size={18} className="verified-icon" />
              </div>
            )}

            <div className="contact-methods">
              <div className="method-card">
                <div className="method-icon">
                  <Mail size={22} />
                </div>
                <div className="method-content">
                  <h3>Email Us</h3>
                  <a href="mailto:support@rajbhog.com">support@rajbhog.com</a>
                </div>
              </div>

              <div className="method-card">
                <div className="method-icon">
                  <Phone size={22} />
                </div>
                <div className="method-content">
                  <h3>Call Us</h3>
                  <a href="tel:+919876543210">+91 98765 43210</a>
                </div>
              </div>
            </div>

            <div className="support-features">
              <div className="feature-item">
                <CheckCircle2 size={16} />
                <span>24-hour response time</span>
              </div>
              <div className="feature-item">
                <CheckCircle2 size={16} />
                <span>Expert support team</span>
              </div>
              <div className="feature-item">
                <CheckCircle2 size={16} />
                <span>Secure & confidential</span>
              </div>
            </div>
          </div>

          {/* RIGHT FORM SECTION */}
          <div className="contact-form-wrapper">
            <div className="contact-form">
              <h2>Submit a Support Request</h2>
              <p className="form-subtitle">
                Fill out the form below and we'll get back to you as soon as
                possible.
              </p>

              <div className="form-grid">
                <div className="input-group">
                  <label htmlFor="name">
                    Full Name <span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <User size={18} className="input-icon" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={onChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="email">
                    Email Address <span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <Mail size={18} className="input-icon" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={onChange}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="phone">Phone Number</label>
                <div className="input-wrapper">
                  <Phone size={18} className="input-icon" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={onChange}
                    placeholder="+91 XXXXX XXXXX (optional)"
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="subject">
                  Subject <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <MessageSquare size={18} className="input-icon" />
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    value={form.subject}
                    onChange={onChange}
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="message">
                  Message <span className="required">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  value={form.message}
                  onChange={onChange}
                  placeholder="Please provide detailed information about your request..."
                  required
                />
              </div>

              <button
                type="button"
                onClick={submit}
                className="submit-btn"
                disabled={loading}>
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Send Message
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
