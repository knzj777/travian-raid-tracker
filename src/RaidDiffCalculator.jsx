import React, { useState, useEffect } from "react";
import "./RaidTracker.css"; 
import hunsImage from "./images/huns.jpg"; 

export default function RaidDiffCalculator() {
  const [input, setInput] = useState("");
  const [players, setPlayers] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const [raidTime, setRaidTime] = useState("00:30");

  const todayDate = new Date().toLocaleDateString();

  // Load saved data
  useEffect(() => {
    const saved = localStorage.getItem("raidData");
    if (saved) setPlayers(JSON.parse(saved));

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) setDarkMode(savedTheme === "dark");
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem("raidData", JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Parse pasted data
  const parseData = (text) => {
    const lines = text.trim().split("\n");
    const content = lines.filter(
      (l) => !l.toLowerCase().includes("no.") && l.trim() !== ""
    );
    return content.map((line) => {
      const parts = line.split(/\t+/);
      const player = parts[1]?.trim();
      const resources = Number((parts[2] || "").replace(/[^\d]/g, ""));
      return { player, resources };
    });
  };

  // Automatically read clipboard and update
  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setInput(clipboardText);

      const newData = parseData(clipboardText);

      if (players.length === 0) {
        const initialized = newData.map((p) => ({
          ...p,
          lastHour: "Missing data",
          diff: "Next hour data needed",
          previousRank: null,
        }));
        setPlayers(initialized);
      } else {
        const updated = newData.map((p) => {
          const old = players.find((x) => x.player === p.player);
          const lastHour = old ? old.resources : "Missing data";
          const diff = old ? p.resources - old.resources : "Missing data";
          const previousRank = old ? players.indexOf(old) + 1 : null;

          return {
            ...p,
            lastHour,
            diff: diff === "Missing data" ? "Missing data" : diff,
            previousRank,
          };
        });

        const sorted = updated.sort((a, b) => b.resources - a.resources);
        setPlayers(sorted);
      }

      setInput(""); // optional: clear input after update
    } catch (err) {
      console.error("Failed to read clipboard: ", err);
      alert("Unable to access clipboard. Please paste manually.");
    }
  };

  const handleReset = () => {
    if (window.confirm("Clear all saved data?")) {
      setPlayers([]);
      localStorage.removeItem("raidData");
    }
  };

  const incrementHour = () => {
    const [hours, minutes] = raidTime.split(":").map(Number);
    const newHours = (hours + 1) % 24;
    setRaidTime(
      `${newHours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`
    );
  };
  
  const decrementHour = () => {
    const [hours, minutes] = raidTime.split(":").map(Number);
    const newHours = (hours - 1 + 24) % 24;
    setRaidTime(
      `${newHours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`
    );
  };
  
  const handleTimeChange = (e) => {
    const val = e.target.value;
    if (/^[0-9:]*$/.test(val)) {
      setRaidTime(val);
    }
  };

  const handleTimeBlur = () => {
    const [hours, minutes] = raidTime.split(":").map(Number);
    if (!isNaN(hours) && !isNaN(minutes)) {
      setRaidTime(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}`
      );
    } else {
      setRaidTime("00:30");
    }
  };

  return (
    <div
      className={`app-container ${darkMode ? "dark" : "light"}`}
      style={{
        backgroundImage: `url(${hunsImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="content">
        <div className="header">
          <div className="header-title">
            <img src="/logo.png" alt="Logo" className="logo" />
            <h2>Travian Raid Tracker</h2>
          </div>
          <button
            className="mode-toggle"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Copy the Top 10 table and paste it here or just press the button..."
          className="input-box"
        />

        <div className="buttons">
          <button className="paste-btn" onClick={handlePaste}>
            📋 Paste & Update
          </button>
          <button className="reset-btn" onClick={handleReset}>
            🗑 Reset
          </button>
        </div>

        <div className="time-display">
          <span className="date">{todayDate}</span>
          <div className="time-selector">
            <button onClick={decrementHour}>-</button>
            <input
              type="text"
              value={raidTime}
              onChange={handleTimeChange}
              onBlur={handleTimeBlur}
            />
            <button onClick={incrementHour}>+</button>
          </div>
        </div>

        {players.length > 0 && (
          <table className="leaderboard">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Resources</th>
                <th>Last Hour</th>
                <th>Difference</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p, i) => {
                let arrow = null;
                if (p.previousRank !== null) {
                  if (p.previousRank > i + 1) arrow = "⬆️";
                  else if (p.previousRank < i + 1) arrow = "⬇️";
                }

                return (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>
                      {arrow && (
                        <span
                          style={{
                            marginRight: "4px",
                            color: arrow === "⬆️" ? "#27ae60" : "#e74c3c",
                          }}
                        >
                          {arrow}
                        </span>
                      )}
                      {p.player}
                    </td>
                    <td>{p.resources?.toLocaleString()}</td>
                    <td>
                      {typeof p.lastHour === "number"
                        ? p.lastHour.toLocaleString()
                        : p.lastHour}
                    </td>
                    <td
                      className={
                        typeof p.diff === "string" ? "waiting" : "positive"
                      }
                    >
                      {typeof p.diff === "string"
                        ? p.diff
                        : p.diff.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

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
