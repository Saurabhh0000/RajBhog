import { useNavigate } from "react-router-dom";
import "../styles/UserFooter.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStore,
  faHeart,
  faShieldHalved,
  faTruck,
  faLeaf,
  faTag,
  faBagShopping,
  faHeadset,
  faFileLines,
  faLock,
  faRotateLeft,
  faChevronRight,
  faLocationDot,
  faPhone,
  faEnvelope,
  faCircleCheck,
  faStar,
  faWheatAwn,
  faBolt,
  faHandshake,
} from "@fortawesome/free-solid-svg-icons";
import {
  faTwitter,
  faFacebook,
  faInstagram,
  faLinkedin,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";

export default function UserFooter() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const go = (path) => () => navigate(path);

  return (
    <footer className="uf-footer" role="contentinfo">
      {/* Top accent bar */}
      <span className="uf-accent" aria-hidden="true" />

      {/* ══ MAIN GRID ══ */}
      <div className="uf-main">
        {/* COL 1 — Brand */}
        <div className="uf-col uf-col-brand">
          <div className="uf-brand" title="RajBhog — Your trusted kirana store">
            <span className="uf-brand-icon">
              <FontAwesomeIcon icon={faStore} />
            </span>
            <span className="uf-brand-text">
              <span className="uf-raj">RAJ</span>
              <span className="uf-bhog">BHOG</span>
            </span>
          </div>

          <p className="uf-brand-tagline">
            <FontAwesomeIcon icon={faWheatAwn} className="uf-tagline-icon" />
            Your neighbourhood kirana, now online.
          </p>
          <p className="uf-brand-sub">
            Fresh groceries, local products &amp; everyday essentials —
            delivered straight from your trusted local store.
          </p>

          {/* Trust badges */}
          <div className="uf-trust-strip">
            <span className="uf-trust-badge uf-trust-green">
              <FontAwesomeIcon icon={faCircleCheck} />
              100% Verified
            </span>
            <span className="uf-trust-badge uf-trust-orange">
              <FontAwesomeIcon icon={faBolt} />
              Fast Delivery
            </span>
            <span className="uf-trust-badge uf-trust-blue">
              <FontAwesomeIcon icon={faShieldHalved} />
              Secure
            </span>
          </div>

          {/* Social */}
          <div className="uf-social">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="uf-soc uf-soc-twitter"
              aria-label="Twitter">
              <FontAwesomeIcon icon={faTwitter} />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="uf-soc uf-soc-facebook"
              aria-label="Facebook">
              <FontAwesomeIcon icon={faFacebook} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="uf-soc uf-soc-instagram"
              aria-label="Instagram">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="uf-soc uf-soc-linkedin"
              aria-label="LinkedIn">
              <FontAwesomeIcon icon={faLinkedin} />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="uf-soc uf-soc-youtube"
              aria-label="YouTube">
              <FontAwesomeIcon icon={faYoutube} />
            </a>
          </div>
        </div>

        {/* COL 2 — Shop */}
        <div className="uf-col">
          <h3 className="uf-col-heading">
            <FontAwesomeIcon icon={faBagShopping} className="uf-col-icon" />
            Shop
          </h3>
          <ul className="uf-link-list">
            <NavItem
              icon={faLeaf}
              label="Fresh Produce"
              onClick={go("/user/products")}
            />
            <NavItem
              icon={faTag}
              label="Today's Deals"
              onClick={go("/user/products")}
            />
            <NavItem
              icon={faStar}
              label="Best Sellers"
              onClick={go("/user/products")}
            />
            <NavItem
              icon={faWheatAwn}
              label="Staples & Grains"
              onClick={go("/user/products")}
            />
            <NavItem
              icon={faStore}
              label="Local Brands"
              onClick={go("/user/products")}
            />
            <NavItem
              icon={faBagShopping}
              label="My Orders"
              onClick={go("/user/orders")}
            />
          </ul>
        </div>

        {/* COL 3 — Support */}
        <div className="uf-col">
          <h3 className="uf-col-heading">
            <FontAwesomeIcon icon={faHeadset} className="uf-col-icon" />
            Help &amp; Support
          </h3>
          <ul className="uf-link-list">
            <NavItem
              icon={faHeadset}
              label="Contact Us"
              onClick={go("/user/support")}
            />
            <NavItem
              icon={faRotateLeft}
              label="Returns & Refunds"
              onClick={go("/user/support")}
            />
            <NavItem
              icon={faTruck}
              label="Track My Order"
              onClick={go("/user/orders")}
            />
            <NavItem
              icon={faFileLines}
              label="FAQ"
              onClick={go("/user/support")}
            />
            <NavItem
              icon={faHandshake}
              label="Sell on RajBhog"
              onClick={go("/user/support")}
            />
          </ul>
        </div>

        {/* COL 4 — Company + Contact */}
        <div className="uf-col">
          <h3 className="uf-col-heading">
            <FontAwesomeIcon icon={faFileLines} className="uf-col-icon" />
            Company
          </h3>
          <ul className="uf-link-list">
            <NavItem
              icon={faFileLines}
              label="About Us"
              onClick={go("/about")}
            />
            <NavItem
              icon={faLock}
              label="Privacy Policy"
              onClick={go("/privacy")}
            />
            <NavItem
              icon={faFileLines}
              label="Terms of Service"
              onClick={go("/terms")}
            />
            <NavItem
              icon={faShieldHalved}
              label="Trust & Safety"
              onClick={go("/trust")}
            />
          </ul>

          <div className="uf-contact-block">
            <h4 className="uf-contact-heading">Get in Touch</h4>
            <div className="uf-contact-items">
              <div className="uf-contact-item">
                <span className="uf-contact-icon">
                  <FontAwesomeIcon icon={faLocationDot} />
                </span>
                <span>Mumbai, Maharashtra, India</span>
              </div>
              <div className="uf-contact-item">
                <span className="uf-contact-icon">
                  <FontAwesomeIcon icon={faPhone} />
                </span>
                <span>+91 98765 43210</span>
              </div>
              <div className="uf-contact-item">
                <span className="uf-contact-icon">
                  <FontAwesomeIcon icon={faEnvelope} />
                </span>
                <span>support@rajbhog.in</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ FEATURE STRIP ══ */}
      <div className="uf-feature-strip">
        <FeatureItem
          icon={faTruck}
          color="orange"
          title="Same-Day Delivery"
          sub="Order before 2 PM"
        />
        <span className="uf-feat-div" aria-hidden="true" />
        <FeatureItem
          icon={faLeaf}
          color="green"
          title="Fresh Every Morning"
          sub="Sourced from local farms"
        />
        <span className="uf-feat-div" aria-hidden="true" />
        <FeatureItem
          icon={faShieldHalved}
          color="blue"
          title="Secure Payments"
          sub="OTP + encrypted checkout"
        />
        <span className="uf-feat-div" aria-hidden="true" />
        <FeatureItem
          icon={faRotateLeft}
          color="violet"
          title="Easy Returns"
          sub="Hassle-free 7-day policy"
        />
      </div>

      {/* ══ BOTTOM BAR ══ */}
      <div className="uf-bottom">
        <p className="uf-copy">
          © <span className="uf-year">{currentYear}</span>{" "}
          <strong className="uf-copy-brand">RajBhog</strong>. All rights
          reserved. Made with{" "}
          <FontAwesomeIcon icon={faHeart} className="uf-copy-heart" /> in India.
        </p>
        <div className="uf-bottom-links">
          <button className="uf-bottom-link" onClick={go("/privacy")}>
            Privacy
          </button>
          <span className="uf-dot" aria-hidden="true" />
          <button className="uf-bottom-link" onClick={go("/terms")}>
            Terms
          </button>
          <span className="uf-dot" aria-hidden="true" />
          <button className="uf-bottom-link" onClick={go("/sitemap")}>
            Sitemap
          </button>
        </div>
      </div>
    </footer>
  );
}

/* ── NavItem ─────────────────────────────────────────────── */
function NavItem({ icon, label, onClick }) {
  return (
    <li className="uf-nav-item">
      <button className="uf-nav-link" onClick={onClick}>
        <span className="uf-nav-icon">
          <FontAwesomeIcon icon={icon} />
        </span>
        <span className="uf-nav-label">{label}</span>
        <FontAwesomeIcon icon={faChevronRight} className="uf-nav-arrow" />
      </button>
    </li>
  );
}

/* ── FeatureItem ─────────────────────────────────────────── */
function FeatureItem({ icon, color, title, sub }) {
  return (
    <div className="uf-feat-item">
      <span className={`uf-feat-icon uf-feat-${color}`}>
        <FontAwesomeIcon icon={icon} />
      </span>
      <div className="uf-feat-body">
        <p className="uf-feat-title">{title}</p>
        <p className="uf-feat-sub">{sub}</p>
      </div>
    </div>
  );
}
