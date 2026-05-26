// src/layouts/UserLayout.jsx
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import "../styles/UserLayout.css";
import ProfileSetupDialog from "../pages/ProfileSetupDialog";
import { useNavigate } from "react-router-dom";
import { getMyProfile } from "../api/user/profileApi";

export default function UserLayout() {
  const [expanded, setExpanded] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [checked, setChecked] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const navigate = useNavigate();
  useEffect(() => {
    const checkNewUser = async () => {
      try {
        const role = localStorage.getItem("role");

        if (role !== "CUSTOMER") {
          setChecked(true);
          return;
        }

        const res = await getMyProfile();

        const profileData = res.data; // 🔥 IMPORTANT FIX
        setProfile(profileData); // 🔥 ADD THIS
        setLoadingProfile(false);

        if (!profileData.fullName || profileData.fullName.trim() === "") {
          setShowDialog(true);
        } else {
          setShowDialog(false); // ✅ already filled → no modal
        }
      } catch (err) {
        console.error("Profile fetch failed", err);
      } finally {
        setChecked(true);
      }
    };

    checkNewUser();
  }, []);

  const handleProfileSaved = () => {
    localStorage.setItem("profileCompleted", "true"); // ✅ key line
    setShowDialog(false);
    navigate("/user/dashboard");
  };

  if (!checked) return null; // prevents flicker

  return (
    <div className="app-layout">
      <Sidebar expanded={expanded} setExpanded={setExpanded} />

      <div className={`user-main ${expanded ? "expanded" : ""}`}>
        <Navbar
          expanded={expanded}
          setExpanded={setExpanded}
          profile={profile}
          loadingProfile={loadingProfile}
        />
        <main className="main-content">
          <Outlet context={{ profile }} />
        </main>
        {/* 🔥 Mandatory Dialog */}
        <ProfileSetupDialog open={showDialog} onSuccess={handleProfileSaved} />
      </div>
    </div>
  );
}
