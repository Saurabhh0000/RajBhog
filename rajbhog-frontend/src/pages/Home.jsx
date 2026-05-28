// src/pages/Home.jsx
import { useEffect, useState, useRef, useCallback } from "react";
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
  Flame,
  Heart,
  Award,
  Clock,
  HelpCircle,
  MessageCircle,
  Plus,
  Minus,
  Sparkles,
  Star,
  Zap,
  Shield,
  CheckCircle2,
  AlertCircle,
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

/* ── SLIDER CARD DATA (original) ── */
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

/* ── Inline alert component ── */
function InlineAlert({ type, message, onDismiss }) {
  if (!message) return null;
  return (
    <div className={`hm-alert hm-alert--${type}`}>
      {type === "error" ? (
        <AlertCircle size={16} />
      ) : (
        <CheckCircle2 size={16} />
      )}
      <span>{message}</span>
      {onDismiss && (
        <button
          className="hm-alert-close"
          onClick={onDismiss}
          aria-label="Dismiss">
          ✕
        </button>
      )}
    </div>
  );
}

/* ── CARD WIDTH for scroll math ── */
const CARD_WIDTH = 272; // card min-width + gap

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [parallaxY, setParallaxY] = useState(0);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const sliderRef = useRef(null);
  const heroRef = useRef(null);
  const navigate = useNavigate();

  /* ── ORIGINAL LOGIC — fetch categories ── */
  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data))
      .catch((err) => {
        console.error(err);
        setAlert({
          type: "error",
          message: "Failed to load categories. Please refresh.",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  /* ── Parallax on scroll ── */
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrollY = window.scrollY;
        setParallaxY(scrollY * 0.18);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ── Auto-slide every 3.5s ── */
  useEffect(() => {
    const interval = setInterval(() => scrollRight(), 3500);
    return () => clearInterval(interval);
  }, [activeIndex]);

  /* ── Sync active dot on manual scroll ── */
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;
    const onScroll = () => {
      const idx = Math.round(slider.scrollLeft / CARD_WIDTH);
      setActiveIndex(Math.min(idx, CARDS.length - 1));
    };
    slider.addEventListener("scroll", onScroll, { passive: true });
    return () => slider.removeEventListener("scroll", onScroll);
  }, []);

  const scrollLeft = useCallback(() => {
    const newIndex = activeIndex === 0 ? CARDS.length - 1 : activeIndex - 1;
    sliderRef.current?.scrollTo({
      left: newIndex * CARD_WIDTH,
      behavior: "smooth",
    });
    setActiveIndex(newIndex);
  }, [activeIndex]);

  const scrollRight = useCallback(() => {
    const newIndex = activeIndex === CARDS.length - 1 ? 0 : activeIndex + 1;
    sliderRef.current?.scrollTo({
      left: newIndex * CARD_WIDTH,
      behavior: "smooth",
    });
    setActiveIndex(newIndex);
  }, [activeIndex]);

  const goToSlide = (index) => {
    sliderRef.current?.scrollTo({
      left: index * CARD_WIDTH,
      behavior: "smooth",
    });
    setActiveIndex(index);
  };

  const toggleFaq = (idx) => setOpenFaq(openFaq === idx ? null : idx);

  return (
    <>
      <Navbar />

      {/* ── Global inline alert ── */}
      {alert.message && (
        <div className="hm-alert-wrap">
          <InlineAlert
            type={alert.type}
            message={alert.message}
            onDismiss={() => setAlert({ type: "", message: "" })}
          />
        </div>
      )}

      {/* ═══════════════ HERO — with parallax ═══════════════ */}
      <section className="hm-hero" ref={heroRef}>
        {/* Parallax background layer */}
        <div
          className="hm-hero-bg"
          style={{
            transform: `translate3d(0, ${parallaxY}px, 0)`,
          }}
          aria-hidden="true"
        />
        {/* Grain texture overlay */}
        <div className="hm-hero-grain" aria-hidden="true" />
        {/* Decorative rings */}
        <div className="hm-hero-ring hm-hero-ring--1" aria-hidden="true" />
        <div className="hm-hero-ring hm-hero-ring--2" aria-hidden="true" />

        <div className="hm-hero-inner">
          {/* Badge */}
          <div className="hm-hero-badge">
            <Sparkles size={12} />
            <span>Pure · Trusted · Honest</span>
          </div>

          <h1 className="hm-hero-title">
            Your trusted <span className="hm-hero-accent">Kirana Store</span>
            <br />
            for daily essentials
          </h1>

          <p className="hm-hero-sub">
            Buy premium edible oils, sugar, grains and household essentials.
            Honest quality, fair prices, delivered with trust.
          </p>

          {/* Stat pills */}
          <div className="hm-hero-stats">
            <div className="hm-stat">
              <Star size={13} />
              <span>4.9 Rating</span>
            </div>
            <div className="hm-stat-divider" />
            <div className="hm-stat">
              <Zap size={13} />
              <span>Same-day delivery</span>
            </div>
            <div className="hm-stat-divider" />
            <div className="hm-stat">
              <Shield size={13} />
              <span>Quality assured</span>
            </div>
          </div>
        </div>

        {/* Hero Cards */}
        <div className="hm-hero-cards">
          <KiranaCard
            title="Edible Oils"
            subtitle="Pure cooking oils"
            offer="Upto 20% Off"
            Icon={Droplet}
            color="amber"
            onClick={() => navigate("/products/edible-oils-ghee")}
          />
          <KiranaCard
            title="Daily Groceries"
            subtitle="Sugar, rice & staples"
            offer="Best Prices"
            Icon={Package}
            color="green"
            onClick={() => navigate("/products/staples-grains")}
          />
          <KiranaCard
            title="Household Needs"
            subtitle="Daily home essentials"
            offer="Trusted Quality"
            Icon={ShoppingBag}
            color="blue"
            onClick={() => navigate("/products/household-essentials")}
          />
        </div>
      </section>

      {/* ═══════════════ SLIDER ═══════════════ */}
      <section className="hm-slider-section">
        <div className="hm-section-head">
          <div className="hm-section-badge">
            <Store size={12} />
            <span>Our Categories</span>
          </div>
          <h2 className="hm-section-title">
            Fresh from <span>RAJBHOG</span>
          </h2>
          <p className="hm-section-sub">
            Everyday essentials sourced with care &amp; purity
          </p>
        </div>

        <div className="hm-slider-wrap">
          <button
            className="hm-nav-btn hm-nav-btn--left"
            onClick={scrollLeft}
            aria-label="Previous">
            <ChevronLeft size={18} />
          </button>

          <div className="hm-slider" ref={sliderRef}>
            {CARDS.map((card, index) => (
              <div
                key={index}
                className="hm-slide-card"
                onClick={() => navigate(`/products/${card.slug}`)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) =>
                  e.key === "Enter" && navigate(`/products/${card.slug}`)
                }>
                <div className="hm-slide-img-wrap">
                  <img src={card.image} alt={card.title} loading="lazy" />
                  <div className="hm-slide-overlay" />
                </div>
                <div className="hm-slide-info">
                  <h3 className="hm-slide-title">{card.title}</h3>
                  <p className="hm-slide-sub">{card.subtitle}</p>
                  <span className="hm-slide-cta">
                    Shop now <ArrowRight size={11} />
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            className="hm-nav-btn hm-nav-btn--right"
            onClick={scrollRight}
            aria-label="Next">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Dots */}
        <div className="hm-dots" role="tablist" aria-label="Slider navigation">
          {CARDS.map((_, index) => (
            <button
              key={index}
              className={`hm-dot ${activeIndex === index ? "hm-dot--active" : ""}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              role="tab"
              aria-selected={activeIndex === index}
            />
          ))}
        </div>
      </section>

      {/* ═══════════════ WHY RAJBHOG ═══════════════ */}
      <section className="hm-why">
        <div className="hm-section-head">
          <div className="hm-section-badge">
            <BadgeCheck size={12} />
            <span>Our Promise</span>
          </div>
          <h2 className="hm-section-title">
            Why <span>RAJBHOG?</span>
          </h2>
          <p className="hm-section-sub">
            Your trusted kirana store for purity, quality &amp; fair pricing
          </p>
        </div>

        <div className="hm-why-grid">
          <WhyCard
            Icon={Droplet}
            title="Pure & Authentic"
            desc="Edible oils and groceries sourced with strict quality checks."
            color="amber"
          />
          <WhyCard
            Icon={ShieldCheck}
            title="Quality Assured"
            desc="Every product is verified before it reaches your home."
            color="green"
          />
          <WhyCard
            Icon={Store}
            title="Trusted Kirana"
            desc="Local sourcing with the reliability of a modern brand."
            color="blue"
          />
          <WhyCard
            Icon={IndianRupee}
            title="Fair Pricing"
            desc="No hidden charges. Honest prices you can trust."
            color="rose"
          />
        </div>
      </section>

      {/* ═══════════════ KITCHEN SECTION ═══════════════ */}
      <section className="hm-kitchen">
        <div className="hm-kitchen-inner">
          <div className="hm-section-head">
            <div className="hm-section-badge">
              <Flame size={12} />
              <span>Kitchen Essentials</span>
            </div>
            <h2 className="hm-section-title">
              What's in your <span>kitchen</span> today?
            </h2>
            <p className="hm-section-sub">
              Everyday essentials that every home needs
            </p>
          </div>

          <div className="hm-kitchen-grid">
            <KitchenCard
              Icon={Droplet}
              title="Cooking Oils"
              desc="Mustard, refined & cold-pressed oils"
            />
            <KitchenCard
              Icon={Wheat}
              title="Rice & Atta"
              desc="Daily grains for every meal"
            />
            <KitchenCard
              Icon={Candy}
              title="Sugar & Staples"
              desc="Trusted ingredients for daily cooking"
            />
            <KitchenCard
              Icon={ShoppingBasket}
              title="Family Essentials"
              desc="Everyday items chosen for comfort and daily family needs"
            />
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA SECTION ═══════════════ */}
      <section className="hm-cta">
        <div className="hm-cta-bg" aria-hidden="true" />
        <div className="hm-cta-inner">
          <div className="hm-section-badge hm-section-badge--light">
            <Heart size={12} />
            <span>Made with care</span>
          </div>

          <h2 className="hm-cta-title">
            Start your everyday shopping
            <br />
            with RAJBHOG
          </h2>
          <p className="hm-cta-sub">
            A modern kirana store built on trust, quality, and everyday needs of
            Indian households.
          </p>

          <div className="hm-cta-points">
            <CtaPoint
              Icon={Flame}
              title="Pure Essentials"
              desc="Cooking oils & groceries selected for daily use"
            />
            <CtaPoint
              Icon={ShieldCheck}
              title="Quality Checked"
              desc="Every product is verified before it reaches you"
            />
            <CtaPoint
              Icon={Heart}
              title="Made with Care"
              desc="Handpicked for families who deserve the best"
            />
          </div>

          <div className="hm-trust-strip">
            <TrustItem Icon={Award} label="Premium Quality" />
            <span className="hm-trust-div" />
            <TrustItem Icon={Leaf} label="100% Pure" />
            <span className="hm-trust-div" />
            <TrustItem Icon={BadgeCheck} label="Quality Assured" />
            <span className="hm-trust-div" />
            <TrustItem Icon={Truck} label="Doorstep Delivery" />
            <span className="hm-trust-div" />
            <TrustItem Icon={Clock} label="Always Fresh" />
          </div>
        </div>
      </section>

      {/* ═══════════════ FAQ ═══════════════ */}
      <section className="hm-faq">
        <div className="hm-faq-blob hm-faq-blob--tl" aria-hidden="true" />
        <div className="hm-faq-blob hm-faq-blob--br" aria-hidden="true" />

        <div className="hm-section-head">
          <div className="hm-section-badge">
            <MessageCircle size={12} />
            <span>Have Questions?</span>
          </div>
          <h2 className="hm-section-title">
            Frequently Asked <span>Questions</span>
          </h2>
          <p className="hm-section-sub">
            Everything you need to know about shopping with RAJBHOG — answered
            honestly.
          </p>
        </div>

        <div className="hm-faq-grid">
          <div className="hm-faq-col">
            {FAQS.filter((_, i) => i % 2 === 0).map((item) => {
              const idx = FAQS.indexOf(item);
              return (
                <FaqItem
                  key={idx}
                  item={item}
                  idx={idx}
                  isOpen={openFaq === idx}
                  onToggle={toggleFaq}
                />
              );
            })}
          </div>
          <div className="hm-faq-col">
            {FAQS.filter((_, i) => i % 2 !== 0).map((item) => {
              const idx = FAQS.indexOf(item);
              return (
                <FaqItem
                  key={idx}
                  item={item}
                  idx={idx}
                  isOpen={openFaq === idx}
                  onToggle={toggleFaq}
                />
              );
            })}
          </div>
        </div>

        <div className="hm-faq-footer">
          <div className="hm-faq-footer-icon">
            <HelpCircle size={20} />
          </div>
          <div>
            <p className="hm-faq-footer-title">Still have questions?</p>
            <p className="hm-faq-footer-sub">
              Our support team is happy to help you out.{" "}
              <a href="mailto:rajbhogstore@gmail.com" className="hm-faq-link">
                Contact us →
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="hm-footer">
        <div className="hm-footer-inner">
          {/* Brand */}
          <div className="hm-footer-brand">
            <div className="hm-footer-logo">
              <span className="hm-footer-logo-raj">RAJ</span>
              <span className="hm-footer-logo-bhog">BHOG</span>
            </div>
            <p className="hm-footer-tagline">जो भी खाए, दोस्त बन जाए</p>
            <p className="hm-footer-desc">
              RAJBHOG is your neighbourhood <em>kirana store</em> — built on the
              pillars of <em>purity</em>, <em>quality</em> and{" "}
              <em>honest pricing</em>. Shop without worry, every single day.
            </p>
            <div className="hm-footer-badges">
              <span className="hm-footer-badge">
                <ShieldCheck size={11} /> Pure Essentials
              </span>
              <span className="hm-footer-badge">
                <Store size={11} /> Local Kirana
              </span>
              <span className="hm-footer-badge">
                <Heart size={11} /> Trusted by Families
              </span>
            </div>
          </div>

          {/* Links */}
          <div className="hm-footer-col">
            <h4 className="hm-footer-col-title">Quick Links</h4>
            <ul className="hm-footer-links">
              {[
                { label: "Edible Oils & Ghee", slug: "edible-oils-ghee" },
                { label: "Staples & Grains", slug: "staples-grains" },
                { label: "Spices & Masala", slug: "spices-masalas" },
                { label: "Pulses & Dals", slug: "pulses-dals" },
                { label: "Dairy & Bakery", slug: "dairy-bakery" },
                { label: "Household", slug: "household-essentials" },
                { label: "Snacks & Namkeen", slug: "snacks-biscuits" },
              ].map((link) => (
                <li key={link.slug}>
                  <a href={`/products/${link.slug}`}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="hm-footer-col">
            <h4 className="hm-footer-col-title">Get in Touch</h4>
            <div className="hm-footer-contacts">
              <div className="hm-footer-contact">
                <span className="hm-footer-contact-icon">
                  <MapPin size={14} />
                </span>
                <p>
                  Nokha, Sasaram, Rohtas
                  <br />
                  Bihar — 802215
                </p>
              </div>
              <div className="hm-footer-contact">
                <span className="hm-footer-contact-icon">
                  <Mail size={14} />
                </span>
                <a href="mailto:rajbhogstore@gmail.com">
                  rajbhogstore@gmail.com
                </a>
              </div>
            </div>

            <h4 className="hm-footer-col-title" style={{ marginTop: "24px" }}>
              Follow Us
            </h4>
            <div className="hm-footer-socials">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hm-social hm-social--fb"
                aria-label="Facebook">
                <Facebook size={15} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hm-social hm-social--ig"
                aria-label="Instagram">
                <Instagram size={15} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hm-social hm-social--tw"
                aria-label="Twitter">
                <Twitter size={15} />
              </a>
            </div>
          </div>
        </div>

        <div className="hm-footer-bottom">
          <span className="hm-footer-copy">
            © {new Date().getFullYear()} RAJBHOG Stores. All rights reserved.
          </span>
          <span className="hm-footer-strip">Pure · Trusted · Honest</span>
        </div>
      </footer>
    </>
  );
}

/* ── SUB-COMPONENTS ─────────────────────────────────────── */

function KiranaCard({ title, subtitle, offer, Icon, color, onClick }) {
  return (
    <div
      className={`hm-kirana-card hm-kirana-card--${color}`}
      onClick={onClick}
      role="button"
      tabIndex={0}>
      <div className="hm-kirana-icon">
        <Icon size={22} />
      </div>
      <div className="hm-kirana-text">
        <h3>{title}</h3>
        <p>{subtitle}</p>
        <span className="hm-kirana-offer">{offer}</span>
      </div>
      <div className="hm-kirana-arrow">
        <ArrowRight size={16} />
      </div>
    </div>
  );
}

function WhyCard({ Icon, title, desc, color }) {
  return (
    <div className={`hm-why-card hm-why-card--${color}`}>
      <div className="hm-why-icon">
        <Icon size={22} />
      </div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

function KitchenCard({ Icon, title, desc }) {
  return (
    <div className="hm-kitchen-card">
      <div className="hm-kitchen-icon">
        <Icon size={22} />
      </div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

function CtaPoint({ Icon, title, desc }) {
  return (
    <div className="hm-cta-point">
      <span className="hm-cta-point-icon">
        <Icon size={18} />
      </span>
      <div>
        <h4>{title}</h4>
        <p>{desc}</p>
      </div>
    </div>
  );
}

function TrustItem({ Icon, label }) {
  return (
    <div className="hm-trust-item">
      <Icon size={14} />
      <span>{label}</span>
    </div>
  );
}

function FaqItem({ item, idx, isOpen, onToggle }) {
  return (
    <div className={`hm-faq-item ${isOpen ? "hm-faq-item--open" : ""}`}>
      <button
        className="hm-faq-q"
        onClick={() => onToggle(idx)}
        aria-expanded={isOpen}>
        <span className="hm-faq-num">{String(idx + 1).padStart(2, "0")}</span>
        <span className="hm-faq-q-text">{item.q}</span>
        <span className="hm-faq-chevron">
          {isOpen ? <Minus size={14} /> : <Plus size={14} />}
        </span>
      </button>
      {isOpen && (
        <div className="hm-faq-answer">
          <p>{item.a}</p>
        </div>
      )}
    </div>
  );
}
