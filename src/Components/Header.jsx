import React from "react";
import { Link } from "react-router-dom";
import logoImage from "../images/logo.png";
import "./Header.css";

export default function Header({ darkMode, setDarkMode }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="header">
      <div className="header-left">
        <Link to="/" className="header-title">
          <img src={logoImage} alt="Logo" className="logo" />
          <h2>Travian Raid Tracker</h2>
        </Link>
      </div>

      <div className="header-right">
        <nav className="nav-links">
          <Link to="/timer" className="nav-link">Timer</Link>
          <Link to="/time-calculator" className="nav-link">Time Calculator</Link>
          <Link to="/reports" className="nav-link">Reports</Link>
          <Link to="/history" className="nav-link">History</Link>
          <button
            className="mode-toggle"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </nav>

        <button
          className={`hamburger ${open ? "open" : ""}`}
          aria-label="Menu"
          onClick={() => setOpen(!open)}
        >
          <span className="line line1" />
          <span className="line line2" />
          <span className="line line3" />
        </button>

        {open && (
          <div className="mobile-menu">
            <Link to="/timer" className="mobile-link" onClick={() => setOpen(false)}>Timer</Link>
            <Link to="/time-calculator" className="mobile-link" onClick={() => setOpen(false)}>Time Calculator</Link>
            <Link to="/reports" className="mobile-link" onClick={() => setOpen(false)}>Reports</Link>
            <Link to="/history" className="mobile-link" onClick={() => setOpen(false)}>History</Link>
            <button
              className="mobile-mode-toggle"
              onClick={() => {
                setDarkMode(!darkMode);
                setOpen(false);
              }}
            >
              {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
