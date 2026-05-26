import "../styles/AdminFooter.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faShieldAlt,
  faCertificate,
  faCrown,
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
    <footer className="admin-footer" role="contentinfo">
      {/* MAIN CONTENT */}
      <div className="footer-content">
        {/* COPYRIGHT */}
        <div className="footer-copyright">
          <span>©</span>
          <span className="year">{currentYear}</span>
          <div
            className="footer-brand"
            role="img"
            aria-label="RajBhog Brand"
            title="RajBhog - Your trusted kirana store">
            <span className="raj">RAJ</span>
            <span className="bhog">BHOG</span>
          </div>
        </div>

        {/* SEPARATOR */}
        <div className="footer-separator" aria-hidden="true"></div>

        {/* TAGLINE */}
        <div className="footer-tagline">
          <FontAwesomeIcon icon={faHeart} className="icon" />
          <span>Everyday Kirana, Delivered with Care</span>
        </div>
      </div>

      {/* BADGES */}
      <div className="footer-badges">
        <div
          className="badge verified"
          title="Verified & Trusted"
          role="img"
          aria-label="Verified and Trusted Badge">
          +<FontAwesomeIcon icon={faShieldAlt} className="badge-icon" />
          <span>Verified</span>
        </div>

        <div
          className="badge"
          title="Quality Certified"
          role="img"
          aria-label="Quality Certified Badge">
          <FontAwesomeIcon icon={faCertificate} className="badge-icon" />
          <span>Certified</span>
        </div>

        <div
          className="badge premium"
          title="Premium Quality"
          role="img"
          aria-label="Premium Quality Badge">
          <FontAwesomeIcon icon={faCrown} className="badge-icon" />
          <span>Premium</span>
        </div>
      </div>

      {/* SOCIAL LINKS */}
      <div className="footer-social">
        <a
          href="https://twitter.com"
          target="_blank"
          rel="noopener noreferrer"
          className="social-link"
          aria-label="Visit our Twitter page"
          title="Twitter">
          <FontAwesomeIcon icon={faTwitter} />
        </a>

        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          className="social-link"
          aria-label="Visit our Facebook page"
          title="Facebook">
          <FontAwesomeIcon icon={faFacebook} />
        </a>

        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="social-link"
          aria-label="Visit our Instagram page"
          title="Instagram">
          <FontAwesomeIcon icon={faInstagram} />
        </a>

        <a
          href="https://linkedin.com"
          target="_blank"
          rel="noopener noreferrer"
          className="social-link"
          aria-label="Visit our LinkedIn page"
          title="LinkedIn">
          <FontAwesomeIcon icon={faLinkedin} />
        </a>
      </div>
    </footer>
  );
}
