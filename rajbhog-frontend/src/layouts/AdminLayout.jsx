import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import AdminFooter from "../components/AdminFooter";
import "../styles/AdminLayout.css";
import { Outlet } from "react-router-dom";

export default function AdminLayout({ children }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`admin-layout ${expanded ? "expanded" : ""}`}>
      <Sidebar expanded={expanded} setExpanded={setExpanded} />

      <div className="admin-main">
        {/* Navbar only reads expanded to hide/show brand */}
        <Navbar expanded={expanded} setExpanded={setExpanded} />

        <main className="admin-content">
          <Outlet /> {/* 👈 VERY IMPORTANT */}
        </main>

        <AdminFooter />
      </div>
    </div>
  );
}
