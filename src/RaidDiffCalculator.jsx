import React, { useState, useEffect } from "react";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import "./RaidTracker.css";
import hunsImage from "./images/huns.jpg";

export default function RaidDiffCalculator() {
  const [input, setInput] = useState("");
  const [players, setPlayers] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const [raidTime, setRaidTime] = useState("00:30");

  const todayDate = new Date()
    .toLocaleDateString("hr-HR")
    .replace(/\//g, ".")
    .replace(/\.$/, "");

  // Load saved data and theme/time
  useEffect(() => {
    const saved = localStorage.getItem("raidData");
    if (saved) setPlayers(JSON.parse(saved));

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) setDarkMode(savedTheme === "dark");

    const savedTime = localStorage.getItem("raidTime");
    if (savedTime) setRaidTime(savedTime);
  }, []);

  // Save data/theme/time
  useEffect(() => {
    localStorage.setItem("raidData", JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("raidTime", raidTime);
  }, [raidTime]);

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

  // Paste or clipboard
  const handlePaste = async () => {
    try {
      let textToParse = input.trim();

      if (!textToParse) {
        textToParse = await navigator.clipboard.readText();
        if (!textToParse.trim()) {
          alert("Input box is empty and clipboard has no text!");
          return;
        }
      }

      const newData = parseData(textToParse);

      if (players.length === 0) {
        const initialized = newData.map((p) => ({
          ...p,
          lastHour: "Missing data",
          diff: "Next hour data needed",
          previousRank: null,
          isNew: true,
        }));
        setPlayers(initialized);
      } else {
        const updated = newData.map((p) => {
          const old = players.find((x) => x.player === p.player);
          const lastHour = old ? old.resources : "Missing data";
          const diff = old ? p.resources - old.resources : "Next hour data needed";
          const previousRank = old ? players.indexOf(old) + 1 : null;
          const isNew = !old;

          return {
            ...p,
            lastHour,
            diff,
            previousRank,
            isNew,
          };
        });

        const sorted = updated.sort((a, b) => b.resources - a.resources);
        setPlayers(sorted);
      }

      setInput(""); 
    } catch (err) {
      console.error("Failed to read clipboard or process input: ", err);
      alert("Unable to access clipboard or process input.");
    }
  };

  const handleReset = () => {
    if (window.confirm("Clear all saved data?")) {
      setPlayers([]);
      setRaidTime("00:30"); 
      localStorage.removeItem("raidData");
      localStorage.removeItem("raidTime"); 
    }
  };
  

  // Time selector
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
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header darkMode={darkMode} setDarkMode={setDarkMode} />

      <div className="content" style={{ flex: "1" }}>
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
                if (!p.isNew && p.previousRank !== null) {
                  if (p.previousRank > i + 1) arrow = "up";
                  else if (p.previousRank < i + 1) arrow = "down";
                }

                return (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>
                      {p.isNew && (
                        <span className="arrow new">New</span>
                      )}
                      {arrow && (
                        <span className={`arrow ${arrow}`}>
                          {arrow === "up" ? "↑" : "↓"}
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

      <Footer />
    </div>
  );
}
