import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Sidebar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faChartLine,
  faBox,
  faXmark,
  faShoppingCart,
  faGear,
  faEnvelope,
  faStar,
  faTicket,
  faCreditCard,
  faHome,
  faRightFromBracket,
  faLayerGroup,
  faHeadset,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

export default function Sidebar({ expanded, setExpanded }) {
  const ref = useRef(null);
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  /* CLICK OUTSIDE (DESKTOP) */
  useEffect(() => {
    const handler = (e) => {
      if (
        expanded &&
        window.innerWidth >= 768 &&
        ref.current &&
        !ref.current.contains(e.target)
      ) {
        setExpanded(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [expanded, setExpanded]);

  const logout = () => {
    localStorage.clear();
    toast.success("Logout Sucessfully !🎉");
    navigate("/login");
  };

  const go = (path) => {
    navigate(path);
    if (window.innerWidth < 768) setExpanded(false);
  };

  return (
    <>
      {/* OVERLAY (MOBILE ONLY) */}
      <div
        className={`sidebar-overlay ${expanded ? "show" : ""}`}
        onClick={() => setExpanded(false)}
      />

      <aside
        ref={ref}
        className={`sidebar ${expanded ? "expanded" : "collapsed"}`}
        role="navigation">
        {/* HEADER */}
        <div className="sidebar-header">
          {!expanded && (
            <button
              className="sidebar-toggle"
              onClick={() => setExpanded(true)}>
              <FontAwesomeIcon icon={faBars} />
            </button>
          )}

          {expanded && (
            <div className="sidebar-brand">
              <span>RAJ</span>
              <span className="accent">BHOG</span>
            </div>
          )}

          {expanded && (
            <button
              className="sidebar-close"
              onClick={() => setExpanded(false)}>
              <FontAwesomeIcon icon={faXmark} />
            </button>
          )}
        </div>

        {/* MENU */}
        <nav className="sidebar-menu">
          {role === "ADMIN" && (
            <>
              <Item
                icon={faChartLine}
                label="Dashboard"
                expanded={expanded}
                onClick={() => go("/admin/dashboard")}
              />

              <Item
                icon={faLayerGroup}
                label="Categories"
                expanded={expanded}
                onClick={() => go("/admin/categories")}
              />

              <Item
                icon={faBox}
                label="Products"
                expanded={expanded}
                onClick={() => go("/admin/products")}
              />

              <Item
                icon={faShoppingCart}
                label="Orders"
                expanded={expanded}
                onClick={() => go("/admin/orders")}
              />
              <Item
                icon={faCreditCard}
                label="Payments"
                expanded={expanded}
                onClick={() => go("/admin/payments")}
              />
              <Item
                icon={faTicket}
                label="Coupons"
                expanded={expanded}
                onClick={() => go("/admin/coupons")}
              />

              <Item
                icon={faStar}
                label="Reviews"
                expanded={expanded}
                onClick={() => go("/admin/reviews")}
              />
              <Item
                icon={faEnvelope}
                label="Contacts"
                expanded={expanded}
                onClick={() => go("/admin/contacts")}
              />

              <Item
                icon={faGear}
                label="Settings"
                expanded={expanded}
                onClick={() => go("/admin/settings")}
              />
            </>
          )}

          {role === "CUSTOMER" && (
            <>
              <Item
                icon={faHome}
                label="Dashboard"
                expanded={expanded}
                onClick={() => go("/user/dashboard")}
              />
              <Item
                icon={faLayerGroup}
                label="Categories"
                expanded={expanded}
                onClick={() => go("/user/categories")}
              />
              <Item
                icon={faShoppingCart}
                label="My Cart"
                expanded={expanded}
                onClick={() => go("/user/cart")}
              />
              <Item
                icon={faBox}
                label="My Orders"
                expanded={expanded}
                onClick={() => go("/user/orders")}
              />
              <Item
                icon={faWallet}
                label="Wallet"
                expanded={expanded}
                onClick={() => go("/user/wallet")}
              />
              <Item
                icon={faTicket}
                label="My Contacts"
                expanded={expanded}
                onClick={() => go("/user/my-contacts")}
              />
              <Item
                icon={faHeadset}
                label="Support"
                expanded={expanded}
                onClick={() => go("/user/support")}
              />

              <Item
                icon={faGear}
                label="Settings"
                expanded={expanded}
                onClick={() => go("/user/settings")}
              />
            </>
          )}
        </nav>

        {/* FOOTER */}
        <div className="sidebar-footer">
          <button className="logout" onClick={logout}>
            <FontAwesomeIcon icon={faRightFromBracket} />
            {expanded && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

function Item({ icon, label, expanded, onClick }) {
  return (
    <div
      className="sidebar-item"
      title={!expanded ? label : ""}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}>
      <FontAwesomeIcon icon={icon} />
      {expanded && <span>{label}</span>}
    </div>
  );
}
