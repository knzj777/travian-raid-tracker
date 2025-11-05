import React from "react";
import { Link, useLocation } from "react-router-dom";
import logoImage from "../images/logo.png";
import "./Header.css";

export default function Header({ darkMode, setDarkMode, onSettingsOpen, timerState }) {
  const [open, setOpen] = React.useState(false);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="header">
      <div className="header-left">
        <Link to="/" className="header-title">
          <img src={logoImage} alt="Logo" className="logo" />
          <h2>Travian Raid Tracker</h2>
        </Link>
      </div>

      <div className="header-center">
        <nav className="nav-links">
        </nav>
      </div>

      <div className="header-right">
        <nav className="nav-links">
          <Link 
            to="/scouts" 
            className={`nav-link new-rocker ${isActive('/scouts') ? 'active' : ''}`}
          >
            Scouts
          </Link>
          <Link 
            to="/attacks" 
            className={`nav-link new-rocker ${isActive('/attacks') ? 'active' : ''}`}
          >
            Attacks
          </Link>
          <Link 
            to="/create-report" 
            className={`nav-link ${isActive('/create-report') ? 'active' : ''}`}
          >
            Create Report
          </Link>
          <Link 
            to="/timer" 
            className={`nav-link ${isActive('/timer') ? 'active' : ''} ${timerState?.running && !isActive('/timer') ? 'timer-running' : ''}`}
          >
            Timer
          </Link>
          <Link 
            to="/attack-planner" 
            className={`nav-link ${isActive('/attack-planner') ? 'active' : ''}`}
          >
            Attack Planner
          </Link>
          <Link 
            to="/history" 
            className={`nav-link ${isActive('/history') ? 'active' : ''}`}
          >
            History
          </Link>
          <button
            className="nav-link"
            onClick={onSettingsOpen}
            title="Settings"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
          <button
            className="mode-toggle"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
                Light Mode
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
                Dark Mode
              </>
            )}
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
            <Link 
              to="/attacks" 
              className={`mobile-link new-rocker ${isActive('/attacks') ? 'active' : ''}`} 
              onClick={() => setOpen(false)}
            >
              Attacks
            </Link>
            <Link 
              to="/scouts" 
              className={`mobile-link new-rocker ${isActive('/scouts') ? 'active' : ''}`} 
              onClick={() => setOpen(false)}
            >
              Scouts
            </Link>
            <Link 
              to="/create-report" 
              className={`mobile-link ${isActive('/create-report') ? 'active' : ''}`} 
              onClick={() => setOpen(false)}
            >
              Create Report
            </Link>
            <Link 
              to="/timer" 
              className={`mobile-link ${isActive('/timer') ? 'active' : ''} ${timerState?.running && !isActive('/timer') ? 'timer-running' : ''}`} 
              onClick={() => setOpen(false)}
            >
              Timer
            </Link>
            <Link 
              to="/attack-planner" 
              className={`mobile-link ${isActive('/attack-planner') ? 'active' : ''}`} 
              onClick={() => setOpen(false)}
            >
              Attack Planner
            </Link>
            <Link 
              to="/history" 
              className={`mobile-link ${isActive('/history') ? 'active' : ''}`} 
              onClick={() => setOpen(false)}
            >
              History
            </Link>
            <button
              className="mobile-link"
              onClick={() => {
                onSettingsOpen();
                setOpen(false);
              }}
            >
              Settings
            </button>
            <button
              className="mobile-mode-toggle"
              onClick={() => {
                setDarkMode(!darkMode);
                setOpen(false);
              }}
            >
              {darkMode ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/>
                    <line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/>
                    <line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>
                  Light Mode
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                  Dark Mode
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
