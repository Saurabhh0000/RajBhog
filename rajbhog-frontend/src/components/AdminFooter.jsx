import "../styles/AdminFooter.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faShieldHalved,
  faCertificate,
  faCrown,
  faStore,
  faLeaf,
  faTruck,
} from "@fortawesome/free-solid-svg-icons";
import {
  faTwitter,
  faFacebook,
  faInstagram,
  faLinkedin,
} from "@fortawesome/free-brands-svg-icons";

export default function AdminFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="af-footer" role="contentinfo">
      {/* ── Top accent line ── */}
      <span className="af-accent-line" aria-hidden="true" />

      {/* ── Inner wrapper ── */}
      <div className="af-inner">
        {/* ── LEFT: Brand + tagline ── */}
        <div className="af-left">
          {/* Logo */}
          <div
            className="af-brand"
            role="img"
            aria-label="RajBhog Brand"
            title="RajBhog — Your trusted kirana store">
            <span className="af-brand-icon">
              <FontAwesomeIcon icon={faStore} />
            </span>
            <span className="af-brand-text">
              <span className="af-raj">RAJ</span>
              <span className="af-bhog">BHOG</span>
            </span>
          </div>

          {/* Tagline */}
          <div className="af-tagline">
            <FontAwesomeIcon icon={faHeart} className="af-heart" />
            <span>Everyday Kirana, Delivered with Care</span>
          </div>

          {/* Copyright */}
          <p className="af-copy">
            © <span className="af-year">{currentYear}</span> RajBhog. All rights
            reserved.
          </p>
        </div>

        {/* ── CENTER: Quick feature pills ── */}
        <div className="af-center">
          <div className="af-pill">
            <FontAwesomeIcon icon={faLeaf} />
            <span>Fresh Daily</span>
          </div>
          <div className="af-pill">
            <FontAwesomeIcon icon={faTruck} />
            <span>Same-Day Delivery</span>
          </div>
          <div className="af-pill">
            <FontAwesomeIcon icon={faShieldHalved} />
            <span>Secure Payments</span>
          </div>
        </div>

        {/* ── RIGHT: Badges + Social ── */}
        <div className="af-right">
          {/* Badges row */}
          <div className="af-badges">
            <div
              className="af-badge af-badge--green"
              title="Verified & Trusted"
              role="img"
              aria-label="Verified Badge">
              <FontAwesomeIcon
                icon={faShieldHalved}
                className="af-badge-icon"
              />
              <span>Verified</span>
            </div>

            <div
              className="af-badge af-badge--orange"
              title="Quality Certified"
              role="img"
              aria-label="Certified Badge">
              <FontAwesomeIcon icon={faCertificate} className="af-badge-icon" />
              <span>Certified</span>
            </div>

            <div
              className="af-badge af-badge--violet"
              title="Premium Quality"
              role="img"
              aria-label="Premium Badge">
              <FontAwesomeIcon icon={faCrown} className="af-badge-icon" />
              <span>Premium</span>
            </div>
          </div>

          {/* Social links */}
          <div className="af-social">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="af-social-link af-social-twitter"
              aria-label="Twitter"
              title="Twitter">
              <FontAwesomeIcon icon={faTwitter} />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="af-social-link af-social-facebook"
              aria-label="Facebook"
              title="Facebook">
              <FontAwesomeIcon icon={faFacebook} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="af-social-link af-social-instagram"
              aria-label="Instagram"
              title="Instagram">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="af-social-link af-social-linkedin"
              aria-label="LinkedIn"
              title="LinkedIn">
              <FontAwesomeIcon icon={faLinkedin} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
