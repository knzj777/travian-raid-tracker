import React from "react";
import { Link } from "react-router-dom";
import logoImage from "../images/logo.png";
import "./Header.css";

export default function Header({ darkMode, setDarkMode }) {
  return (
    <div className="header">
      <div className="header-left">
        <Link to="/" className="header-title">
          <img src={logoImage} alt="Logo" className="logo" />
          <h2>Travian Raid Tracker</h2>
        </Link>
      </div>

      <div className="header-right">
        
        <button
          className="mode-toggle"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>
    </div>
  );
}
