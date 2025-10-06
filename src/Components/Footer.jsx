import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <div className="footer-container">
      <Link to="/how-to-use" className="howto-btn">
        How to Use
      </Link>
      <footer className="footer">
        Made with love by <strong>Fico</strong> for Akrep to make his
        miserable life a bit more bearable, he just loves numbers which I will
        provide for him. Remember, hard work always pays off, so you better
        never quit on your dreams on becoming the top 10 raider.{" "}
        <span className="heart">❤️</span>
      </footer>
    </div>
  );
}
