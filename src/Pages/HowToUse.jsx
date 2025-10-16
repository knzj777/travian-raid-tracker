import React, { useState, useEffect } from "react";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import winKeyImg from "../images/windows-key-png.png";
import "./HowToUse.css";

export default function HowToUse() {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) setDarkMode(savedTheme === "dark");
  }, []);

  return (
    <div
      className={`app-container ${darkMode ? "dark" : "light"}`}
    >
      <Header darkMode={darkMode} setDarkMode={setDarkMode} />

      <div className="content howto-content" style={{ flex: 1 }}>
        <div className="guide-container">
          <h1>How to Use</h1>
          {[
            {
              title: "Copy the Top 10 Table",
              text: "Open your Travian server’s top 10 leaderboard and copy the entire table, including player names, ranks, and resources. Make sure not to skip any rows to avoid missing data.",
            },
            {
              title: "Paste & Update",
              text: "Go to the main page and either paste the copied table into the input box or click 📋 Paste & Update to automatically read from your clipboard.",
            },
            {
              title: "Reset Data",
              text: "Click 🗑 Reset to clear all saved data. A confirmation will appear to prevent accidental loss.",
            },
            {
              title: "Adjust Raid Hour",
              text: "Use the + / - buttons or type directly into the input to change the tracked hour for resource differences.",
            },
            {
              title: "Leaderboard Explained",
              text: "The leaderboard shows current ranks, resources, and differences since last hour. Arrows indicate rank changes:",
              list: [
                { label: "↑ Moved up", class: "up" },
                { label: "↓ Moved down", class: "down" },
                { label: "New in top 10", class: "new" },
              ],
            },
            {
              title: "Toggle Dark / Light Mode",
              text: "Click the button in the header to switch between dark and light themes. Everything adapts automatically.",
            },
            {
              title: "Life Hack",
              text: (
                <>
                  If you’re on Windows, you can press {" "}
                  <span className="win-key">
                    <img src={winKeyImg} alt="Win" />
                  </span>{" "}
                  Win + V to open your clipboard history and see everything you’ve copied recently. This is perfect if you copied previous hour data but you copied something else in the meantime.
                </>
              ),
            },
          ].map((step, i) => (
            <div key={i} className="guide-step">
              <div className="step-number">{i + 1}</div>
              <div className="step-text">
                <strong>{step.title}</strong>
                <p>{step.text}</p>
                {step.list && (
                  <ul>
                    {step.list.map((li, index) => (
                      <li key={index}>
                        {li.class && (
                          <span className={`arrow ${li.class}`}>
                            {li.class === "up"
                              ? "↑"
                              : li.class === "down"
                              ? "↓"
                              : "New"}
                          </span>
                        )}
                        {li.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
