import "../styles/Navbar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faUserCircle,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Navbar({
  expanded,
  setExpanded,
  profile,
  loadingProfile,
}) {
  const role = localStorage.getItem("role");

  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    toast.success("Logged out successfully 👋");
    navigate("/login");
  };

  const handleBrandClick = () => {
    if (!role) return navigate("/");
    if (role === "ADMIN") return navigate("/admin/dashboard");
    if (role === "CUSTOMER") return navigate("/user/dashboard");
    navigate("/");
  };

  return (
    <header className={`navbar ${role ? "with-sidebar" : "full"}`}>
      {/* LEFT */}
      <div className="navbar-left">
        {/* LOGGED IN → MENU BUTTON */}
        {role && (
          <button
            className="mobile-menu-btn"
            onClick={() => setExpanded(true)}
            aria-label="Open menu">
            <FontAwesomeIcon icon={faBars} />
          </button>
        )}

        {/* LOGO (ALWAYS VISIBLE) */}
        {!expanded && (
          <div className="brand-container" onClick={handleBrandClick}>
            <div className="brand">
              <span className="raj">RAJ</span>
              <span className="bhog">BHOG</span>
            </div>
            <p className="micro-text">जो भी खाए, दोस्त बन जाए</p>
          </div>
        )}
      </div>

      {/* RIGHT */}
      <div className="navbar-right">
        {/* 🔓 GUEST NAVBAR */}
        {!role && (
          <div className="guest-actions">
            <button className="nav-link" onClick={() => navigate("/")}>
              Home
            </button>
            <button className="nav-link" onClick={() => navigate("/contact")}>
              Contact Us
            </button>

            <button className="login-btn" onClick={() => navigate("/login")}>
              Login
            </button>
          </div>
        )}

        {/* 🔐 LOGGED IN NAVBAR (UNCHANGED) */}
        {role && (
          <>
            <div className="profile">
              <FontAwesomeIcon icon={faUserCircle} />
              <span>{loadingProfile ? "..." : profile?.fullName || role}</span>
            </div>

            <button className="logout-btn" onClick={logout} aria-label="Logout">
              <FontAwesomeIcon icon={faRightFromBracket} />
            </button>
          </>
        )}
      </div>
    </header>
  );
}
