import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";
import kofiImage from "../images/kofi.png";

export default function Footer() {
  return (
    <div className="footer-container">
      <div className="footer-container-links">
      <Link to="/how-to-use" className="howto-btn">How to Use</Link>
      <a 
        href="https://ko-fi.com/kanyy777" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="kofi-btn"
      >
        <img src={kofiImage} alt="Ko-fi" className="kofi-icon" />
        Donate
      </a>
      </div>
      
      <footer className="footer">
        Made with love by <strong>Fico</strong> for Akrep to make his
        miserable life a bit more bearable, he just loves numbers which I will
        provide for him. Remember, hard work always pays off, so you better
        never quit on your dreams on becoming the top 10 raider.{" "}
        <span className="heart">❤️</span>
        <div className="version">v1.0.02</div>
      </footer>
    </div>
  );
}
