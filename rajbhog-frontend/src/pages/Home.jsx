// src/pages/Home.jsx
import { useEffect, useState, useRef } from "react";
import {
  ArrowRight,
  Droplet,
  Package,
  ShoppingBag,
  ShieldCheck,
  IndianRupee,
  Store,
  Wheat,
  Candy,
  ShoppingBasket,
  ChevronLeft,
  ChevronRight,
  Leaf,
  BadgeCheck,
  Truck,
  Instagram,
  Facebook,
  Twitter,
  MapPin,
  Mail,
  Phone,
  Flame,
  Heart,
  Award,
  Clock,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  MessageCircle,
  Plus,
  Minus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCategories } from "../api/public/categoryApi";
import "../styles/Home.css";
import Navbar from "../components/Navbar";

import spicesImg from "../image/Spieces.png";
import chanaImg from "../image/chana.jpg";
import oilImg from "../image/refiend-oil.jpg";
import sugarImg from "../image/sugar.jpg";
import staplesImg from "../image/grains.png";
import pujaImg from "../image/puja-essentials.jpg";
import noodlesImg from "../image/instant-food.png";
import dairyImg from "../image/dairy-products.jpg";
import dryFruitsImg from "../image/dry-fruits.png";
import snacksImg from "../image/snacks.png";
import beveragesImg from "../image/beverages.png";
import babyCareImg from "../image/baby-care.png";
import personalCareImg from "../image/personal-care.png";
import chocolatesImg from "../image/chocolates.png";
import householdImg from "../image/household.jpg";
import saucesImg from "../image/sauces.jpeg";

/* ── FAQ DATA ── */
const FAQS = [
  {
    q: "What is RAJBHOG and what products do you offer?",
    a: "RAJBHOG is your trusted neighbourhood kirana store online. We offer a wide range of daily essentials including edible oils & ghee, staples & grains, spices & masalas, pulses, dairy, snacks, beverages, household essentials, and much more — all sourced with strict quality checks.",
  },
  {
    q: "Are RAJBHOG products quality verified?",
    a: "Absolutely. Every product on RAJBHOG is carefully selected and verified before it is made available. We prioritise purity and authenticity, especially for edible oils, grains and daily groceries that your family depends on.",
  },
  {
    q: "How do I place an order on RAJBHOG?",
    a: "Simply browse our categories, select the products you need, add them to your cart, set your default delivery address, choose your payment method and place the order. It takes less than two minutes!",
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept Cash on Delivery (COD), UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards (Visa, MasterCard, RuPay), and Net Banking across all major banks.",
  },
  {
    q: "Can I cancel or modify my order after placing it?",
    a: "Yes, you can cancel an order as long as it is in the 'Placed' or 'Confirmed' status. Once the order is packed or out for delivery, cancellation is no longer possible. You can manage your orders from the My Orders section.",
  },
  {
    q: "Are there any coupons or discounts available?",
    a: "Yes! We regularly offer coupon codes and seasonal discounts. You can apply a coupon code during checkout in the Order Summary section. Keep an eye on our store for the latest offers.",
  },
  {
    q: "How do I track my order?",
    a: "After placing an order you can track its status in real-time from the My Orders page. We'll update your order status at every stage — from Placed to Delivered.",
  },
  {
    q: "How do I contact RAJBHOG support?",
    a: "You can reach us at rajbhogstore@gmail.com or use the Contact Us option available after logging in. Our team is happy to assist you with any questions or concerns.",
  },
];

/* ── card data (original) ── */
const CARDS = [
  {
    title: "Spices & Masala",
    subtitle: "Authentic flavors",
    image: spicesImg,
    slug: "spices-masalas",
  },
  {
    title: "Pulses & Dals",
    subtitle: "Daily nutrition",
    image: chanaImg,
    slug: "pulses-dals",
  },
  {
    title: "Staples & Grains",
    subtitle: "Daily kitchen essentials",
    image: staplesImg,
    slug: "staples-grains",
  },
  {
    title: "Edible Oils & Ghee",
    subtitle: "Pure & healthy cooking",
    image: oilImg,
    slug: "edible-oils-ghee",
  },
  {
    title: "Sugar & Salt",
    subtitle: "Everyday essentials",
    image: sugarImg,
    slug: "sugar-salt-sweeteners",
  },
  {
    title: "Instant Food",
    subtitle: "Quick & easy meals",
    image: noodlesImg,
    slug: "instant-food",
  },
  {
    title: "Dairy & Bakery",
    subtitle: "Fresh & delicious",
    image: dairyImg,
    slug: "dairy-bakery",
  },
  {
    title: "Dry Fruits & Nuts",
    subtitle: "Healthy snacking",
    image: dryFruitsImg,
    slug: "dry-fruits-nuts",
  },
  {
    title: "Snacks & Namkeen",
    subtitle: "Tasty treats",
    image: snacksImg,
    slug: "snacks-biscuits",
  },
  {
    title: "Beverages",
    subtitle: "Tea, coffee & drinks",
    image: beveragesImg,
    slug: "beverages",
  },
  {
    title: "Puja Essentials",
    subtitle: "Daily pooja needs",
    image: pujaImg,
    slug: "puja-essentials",
  },
  {
    title: "Baby Care",
    subtitle: "Gentle & safe products",
    image: babyCareImg,
    slug: "baby-care",
  },
  {
    title: "Personal Care",
    subtitle: "Daily hygiene essentials",
    image: personalCareImg,
    slug: "personal-care",
  },
  {
    title: "Chocolates & Confectionery",
    subtitle: "Sweet treats & candies",
    image: chocolatesImg,
    slug: "chocolates-confectionery",
  },
  {
    title: "Household Essentials",
    subtitle: "Cleaning & home care",
    image: householdImg,
    slug: "household-essentials",
  },
  {
    title: "Sauces & Spreads",
    subtitle: "Taste enhancers",
    image: saucesImg,
    slug: "sauces-spreads",
  },
];

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const sliderRef = useRef(null);
  const navigate = useNavigate();

  /* ── ORIGINAL LOGIC ── */
  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => scrollRight(), 3500);
    return () => clearInterval(interval);
  }, [activeIndex]);

  const scrollLeft = () => {
    const newIndex = activeIndex === 0 ? CARDS.length - 1 : activeIndex - 1;
    sliderRef.current?.scrollTo({ left: newIndex * 304, behavior: "smooth" });
    setActiveIndex(newIndex);
  };

  const scrollRight = () => {
    const newIndex = activeIndex === CARDS.length - 1 ? 0 : activeIndex + 1;
    sliderRef.current?.scrollTo({ left: newIndex * 304, behavior: "smooth" });
    setActiveIndex(newIndex);
  };

  const goToSlide = (index) => {
    sliderRef.current?.scrollTo({ left: index * 304, behavior: "smooth" });
    setActiveIndex(index);
  };

  const toggleFaq = (idx) => setOpenFaq(openFaq === idx ? null : idx);

  return (
    <>
      <Navbar />

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="hero">
        <div className="hero-content">
          <h1>
            Your trusted <span>Kirana Store</span>
            <br />
            for daily essentials
          </h1>
          <p>
            Buy premium edible oils, sugar, grains and household essentials.
            Honest quality, fair prices, delivered with trust.
          </p>
        </div>

        <div className="hero-cards">
          <KiranaCard
            title="EDIBLE OILS"
            subtitle="Pure cooking oils"
            offer="UPTO 20% OFF"
            Icon={Droplet}
            onClick={() => navigate("/products/edible-oils-ghee")}
          />
          <KiranaCard
            title="DAILY GROCERIES"
            subtitle="Sugar, rice & staples"
            offer="BEST PRICES"
            Icon={Package}
            onClick={() => navigate("/products/staples-grains")}
          />
          <KiranaCard
            title="HOUSEHOLD NEEDS"
            subtitle="Daily home essentials"
            offer="TRUSTED QUALITY"
            Icon={ShoppingBag}
            onClick={() => navigate("/products/household-essentials")}
          />
        </div>
      </section>

      {/* ═══════════════ SLIDER ═══════════════ */}
      <section className="home-visuals">
        <h2 className="visuals-title">
          Fresh from <span>RAJBHOG</span>
        </h2>
        <p className="visuals-subtitle">
          Everyday essentials sourced with care &amp; purity
        </p>

        <div className="visuals-wrapper">
          <button className="nav-btn left" onClick={scrollLeft}>
            <ChevronLeft />
          </button>
          <div className="slider" ref={sliderRef}>
            {CARDS.map((card, index) => (
              <div
                key={index}
                className="visual-card"
                onClick={() => navigate(`/products/${card.slug}`)}>
                <img src={card.image} alt={card.title} />
                <div className="visual-overlay">
                  <h3>{card.title}</h3>
                  <span>{card.subtitle}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="nav-btn right" onClick={scrollRight}>
            <ChevronRight />
          </button>
        </div>

        <div className="slider-dots">
          {CARDS.map((_, index) => (
            <span
              key={index}
              className={`dot ${activeIndex === index ? "active" : ""}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </section>

      {/* ═══════════════ WHY RAJBHOG ═══════════════ */}
      <section className="why-rajbhog">
        <div className="why-header">
          <h2>Why RAJBHOG?</h2>
          <p>
            Your trusted kirana store for purity, quality &amp; fair pricing
          </p>
        </div>
        <div className="why-grid">
          <div className="why-card">
            <div className="why-icon">
              <Droplet />
            </div>
            <h3>Pure &amp; Authentic</h3>
            <p>Edible oils and groceries sourced with strict quality checks.</p>
          </div>
          <div className="why-card">
            <div className="why-icon">
              <ShieldCheck />
            </div>
            <h3>Quality Assured</h3>
            <p>Every product is verified before it reaches your home.</p>
          </div>
          <div className="why-card">
            <div className="why-icon">
              <Store />
            </div>
            <h3>Trusted Kirana</h3>
            <p>Local sourcing with the reliability of a modern brand.</p>
          </div>
          <div className="why-card">
            <div className="why-icon">
              <IndianRupee />
            </div>
            <h3>Fair Pricing</h3>
            <p>No hidden charges. Honest prices you can trust.</p>
          </div>
        </div>
      </section>

      {/* ═══════════════ KITCHEN SECTION ═══════════════ */}
      <section className="kitchen-section">
        <div className="kitchen-header">
          <h2>What's in your kitchen today?</h2>
          <p>Everyday essentials that every home needs</p>
        </div>
        <div className="kitchen-grid">
          <div className="kitchen-card">
            <div className="kitchen-icon">
              <Droplet />
            </div>
            <h3>Cooking Oils</h3>
            <p>Mustard, refined &amp; cold-pressed oils</p>
          </div>
          <div className="kitchen-card">
            <div className="kitchen-icon">
              <Wheat />
            </div>
            <h3>Rice &amp; Atta</h3>
            <p>Daily grains for every meal</p>
          </div>
          <div className="kitchen-card">
            <div className="kitchen-icon">
              <Candy />
            </div>
            <h3>Sugar &amp; Staples</h3>
            <p>Trusted ingredients for daily cooking</p>
          </div>
          <div className="kitchen-card">
            <div className="kitchen-icon">
              <ShoppingBasket />
            </div>
            <h3>Family Essentials</h3>
            <p>Everyday items chosen for comfort and daily family needs</p>
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA SECTION ═══════════════ */}
      <section className="home-cta">
        <div className="cta-content">
          <h2>Start your everyday shopping with RAJBHOG</h2>
          <p className="cta-subtitle">
            A modern kirana store built on trust, quality, and everyday needs of
            Indian households.
          </p>

          <div className="cta-points">
            <div className="cta-point">
              <span className="cta-point-icon">
                <Flame />
              </span>
              <div>
                <h4>Pure Essentials</h4>
                <p>Cooking oils &amp; groceries selected for daily use</p>
              </div>
            </div>
            <div className="cta-point">
              <span className="cta-point-icon">
                <ShieldCheck />
              </span>
              <div>
                <h4>Quality Checked</h4>
                <p>Every product is verified before it reaches you</p>
              </div>
            </div>
            <div className="cta-point">
              <span className="cta-point-icon">
                <Heart />
              </span>
              <div>
                <h4>Made with Care</h4>
                <p>Handpicked for families who deserve the best</p>
              </div>
            </div>
          </div>

          <div className="cta-trust-strip">
            <div className="cta-trust-item">
              <Award className="cta-trust-icon" />
              <span className="cta-trust-label">Premium Quality</span>
            </div>
            <div className="cta-trust-divider" />
            <div className="cta-trust-item">
              <Leaf className="cta-trust-icon" />
              <span className="cta-trust-label">100% Pure</span>
            </div>
            <div className="cta-trust-divider" />
            <div className="cta-trust-item">
              <BadgeCheck className="cta-trust-icon" />
              <span className="cta-trust-label">Quality Assured</span>
            </div>
            <div className="cta-trust-divider" />
            <div className="cta-trust-item">
              <Truck className="cta-trust-icon" />
              <span className="cta-trust-label">Doorstep Delivery</span>
            </div>
            <div className="cta-trust-divider" />
            <div className="cta-trust-item">
              <Clock className="cta-trust-icon" />
              <span className="cta-trust-label">Always Fresh</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ FAQ SECTION ═══════════════ */}
      <section className="faq-section">
        {/* Decorative bg blobs */}
        <div className="faq-bg-blob faq-bg-blob--tl" />
        <div className="faq-bg-blob faq-bg-blob--br" />

        {/* Header */}
        <div className="faq-header">
          <div className="faq-header-badge">
            <MessageCircle size={14} />
            Have Questions?
          </div>
          <h2 className="faq-title">Frequently Asked Questions</h2>
          <p className="faq-subtitle">
            Everything you need to know about shopping with RAJBHOG — answered
            honestly.
          </p>
        </div>

        {/* Two-column accordion */}
        <div className="faq-grid">
          {/* Left column — even items */}
          <div className="faq-col">
            {FAQS.filter((_, i) => i % 2 === 0).map((item) => {
              const idx = FAQS.indexOf(item);
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className={`faq-item ${isOpen ? "faq-item--open" : ""}`}>
                  <button
                    className="faq-question"
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={isOpen}>
                    <span className="faq-q-num">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="faq-q-text">{item.q}</span>
                    <span className="faq-chevron">
                      {isOpen ? <Minus size={15} /> : <Plus size={15} />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="faq-answer">
                      <p>{item.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right column — odd items */}
          <div className="faq-col">
            {FAQS.filter((_, i) => i % 2 !== 0).map((item) => {
              const idx = FAQS.indexOf(item);
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className={`faq-item ${isOpen ? "faq-item--open" : ""}`}>
                  <button
                    className="faq-question"
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={isOpen}>
                    <span className="faq-q-num">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="faq-q-text">{item.q}</span>
                    <span className="faq-chevron">
                      {isOpen ? <Minus size={15} /> : <Plus size={15} />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="faq-answer">
                      <p>{item.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="faq-footer-cta">
          <div className="faq-cta-icon">
            <HelpCircle size={20} />
          </div>
          <div>
            <p className="faq-cta-title">Still have questions?</p>
            <p className="faq-cta-sub">
              Our support team is happy to help you out.{" "}
              <a href="mailto:rajbhogstore@gmail.com" className="faq-cta-link">
                Contact us →
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="footer">
        <div className="footer-inner">
          {/* ── BRAND COLUMN ── */}
          <div className="footer-col footer-col--brand">
            <div className="footer-brand-block">
              <h2 className="footer-logo">
                RAJ<span>BHOG</span>
              </h2>
              <p className="footer-tagline">जो भी खाए, दोस्त बन जाए</p>
            </div>
            <p className="footer-desc">
              RAJBHOG is your neighbourhood <em>kirana store</em> — built on the
              pillars of <em>purity</em>, <em>quality</em> and{" "}
              <em>honest pricing</em>. Shop without worry, every single day.
            </p>
            <div className="footer-badges">
              <span className="footer-badge">
                <ShieldCheck size={12} /> Pure Essentials
              </span>
              <span className="footer-badge">
                <Store size={12} /> Local Kirana
              </span>
              <span className="footer-badge">
                <Heart size={12} /> Trusted by Families
              </span>
            </div>
          </div>

          {/* ── QUICK LINKS ── */}
          <div className="footer-col footer-col--links">
            <h4 className="footer-col-title">Quick Links</h4>
            <ul className="footer-links">
              <li>
                <a href="/products/edible-oils-ghee">Edible Oils &amp; Ghee</a>
              </li>
              <li>
                <a href="/products/staples-grains">Staples &amp; Grains</a>
              </li>
              <li>
                <a href="/products/spices-masalas">Spices &amp; Masala</a>
              </li>
              <li>
                <a href="/products/pulses-dals">Pulses &amp; Dals</a>
              </li>
              <li>
                <a href="/products/dairy-bakery">Dairy &amp; Bakery</a>
              </li>
              <li>
                <a href="/products/household-essentials">Household</a>
              </li>
              <li>
                <a href="/products/snacks-biscuits">Snacks &amp; Namkeen</a>
              </li>
            </ul>
          </div>

          {/* ── CONTACT ── */}
          <div className="footer-col footer-col--contact">
            <h4 className="footer-col-title">Get in Touch</h4>
            <div className="footer-contact-list">
              <div className="footer-contact-item">
                <span className="footer-contact-icon">
                  <MapPin size={15} />
                </span>
                <p>
                  Nokha, Sasaram, Rohtas
                  <br />
                  Bihar — 802215
                </p>
              </div>
              <div className="footer-contact-item">
                <span className="footer-contact-icon">
                  <Mail size={15} />
                </span>
                <a href="mailto:rajbhogstore@gmail.com">
                  rajbhogstore@gmail.com
                </a>
              </div>
            </div>

            <h4 className="footer-col-title footer-social-title">Follow Us</h4>
            <div className="footer-socials">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn social-btn--fb"
                aria-label="Facebook">
                <Facebook size={16} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn social-btn--ig"
                aria-label="Instagram">
                <Instagram size={16} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn social-btn--tw"
                aria-label="Twitter / X">
                <Twitter size={16} />
              </a>
            </div>
          </div>
        </div>

        {/* ── FOOTER BOTTOM ── */}
        <div className="footer-bottom">
          <div className="footer-bottom-inner">
            <span className="footer-copy">
              © {new Date().getFullYear()} RAJBHOG Stores. All rights reserved.
            </span>
            <span className="footer-strip-text">Pure · Trusted · Honest</span>
          </div>
        </div>
      </footer>
    </>
  );
}

/* ── HERO CARD ── */
function KiranaCard({ title, subtitle, offer, Icon, onClick }) {
  return (
    <div className="swiggy-card" onClick={onClick} role="button" tabIndex={0}>
      <div className="card-text">
        <h3>{title}</h3>
        <p>{subtitle}</p>
        <span className="offer-badge">{offer}</span>
      </div>
      <div className="card-visual">
        <Icon />
      </div>
      <div className="card-arrow">
        <ArrowRight />
      </div>
    </div>
  );
}
