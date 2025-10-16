import React, { useState, useEffect } from "react";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import Graph from "./Components/Graph";
import LeaderboardTable from "./Components/LeaderboardTable";
import "./RaidTracker.css";
import Modal from "./Components/Modal";

export default function RaidDiffCalculator() {
  const [input, setInput] = useState("");
  const [players, setPlayers] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const [raidStart, setRaidStart] = useState("00:30");
  const [raidEnd, setRaidEnd] = useState("01:30");
  const [appliedRange, setAppliedRange] = useState("");
  const [modal, setModal] = useState({ open: false, title: "", message: "", variant: "info", onConfirm: null, onCancel: null });

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

    const savedTimeRange = localStorage.getItem("raidTimeRange");
    if (savedTimeRange) {
      const parts = savedTimeRange.split("-");
      if (parts.length === 2) {
        setRaidStart(parts[0].trim());
        setRaidEnd(parts[1].trim());
      }
    }
  }, []);

  // Save data/theme/time
  useEffect(() => {
    localStorage.setItem("raidData", JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const display = `${raidStart} - ${raidEnd}`;
    localStorage.setItem("raidTimeRange", display);
  }, [raidStart, raidEnd]);

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
          setModal({
            open: true,
            title: "Nothing to paste",
            message: "Input box is empty and clipboard has no text.",
            variant: "info",
            onConfirm: () => setModal((m) => ({ ...m, open: false })),
          });
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
      const display = `${raidStart} - ${raidEnd}`;
      setAppliedRange(display);
    } catch (err) {
      console.error("Failed to read clipboard or process input: ", err);
      setModal({
        open: true,
        title: "Paste failed",
        message: "Unable to access clipboard or process input.",
        variant: "info",
        onConfirm: () => setModal((m) => ({ ...m, open: false })),
      });
    }
  };

  const handleSaveHistory = () => {
    if (players.length === 0) return;
  
    const newSnapshot = {
      timestamp: Date.now(),
      raidTimeRange: `${raidStart} - ${raidEnd}`,
      players,
    };
  
    const history = JSON.parse(localStorage.getItem("history") || "[]");
    history.push(newSnapshot);
    localStorage.setItem("history", JSON.stringify(history));
  
    setModal({
      open: true,
      title: "Saved",
      message: "Snapshot saved to history.",
      variant: "info",
      onConfirm: () => setModal((m) => ({ ...m, open: false })),
    });
  };
  

  const handleReset = () => {
    setModal({
      open: true,
      title: "Reset data",
      message: "Clear all saved data? This cannot be undone.",
      variant: "confirm",
      onCancel: () => setModal((m) => ({ ...m, open: false })),
      onConfirm: () => {
        setModal((m) => ({ ...m, open: false }));
        setPlayers([]);
        setRaidStart("00:30");
        setRaidEnd("01:30");
        localStorage.removeItem("raidData");
        localStorage.removeItem("raidTimeRange");
      },
    });
  };
  

  // Time range selector
  const incrementHour = () => {
    const [sh, sm] = raidStart.split(":").map(Number);
    const [eh, em] = raidEnd.split(":").map(Number);
    const ns = `${((sh + 1) % 24).toString().padStart(2, "0")}:${sm.toString().padStart(2, "0")}`;
    const ne = `${((eh + 1) % 24).toString().padStart(2, "0")}:${em.toString().padStart(2, "0")}`;
    setRaidStart(ns);
    setRaidEnd(ne);
  };

  const decrementHour = () => {
    const [sh, sm] = raidStart.split(":").map(Number);
    const [eh, em] = raidEnd.split(":").map(Number);
    const ns = `${((sh - 1 + 24) % 24).toString().padStart(2, "0")}:${sm.toString().padStart(2, "0")}`;
    const ne = `${((eh - 1 + 24) % 24).toString().padStart(2, "0")}:${em.toString().padStart(2, "0")}`;
    setRaidStart(ns);
    setRaidEnd(ne);
  };

  const handleTimeChange = (e) => {
    const val = e.target.value;
    if (/^[0-9:\\-\s]*$/.test(val)) {
      const parts = val.split("-");
      if (parts.length === 2) {
        setRaidStart(parts[0].trim());
        setRaidEnd(parts[1].trim());
      }
    }
  };

  const handleTimeBlur = () => {
    const norm = (val) => {
      const [h, m] = (val || "").split(":").map(Number);
      if (isNaN(h) || isNaN(m)) return null;
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    };
    const s = norm(raidStart);
    const e = norm(raidEnd);
    if (s && e) {
      setRaidStart(s);
      setRaidEnd(e);
    } else {
      setRaidStart("00:30");
      setRaidEnd("01:30");
    }
  };

  const applyCurrentRange = () => {
    const display = `${raidStart} - ${raidEnd}`;
    setAppliedRange(display);
  };

  return (
    <div className={`app-container ${darkMode ? "dark" : "light"}`}>
      <Header darkMode={darkMode} setDarkMode={setDarkMode} />

      <div className="content" style={{ flex: "1" }}>
        <div className="input-wrap">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Copy the Top 10 table and paste it here or just press the button..."
            className="input-box"
          />
        </div>

<div className="buttons">
  <button className="paste-btn" onClick={handlePaste}>
    📋 Paste & Update
  </button>
  <button className="reset-btn" onClick={handleReset}>
    🗑 Reset
  </button>
  <button 
    className="save-history-btn" 
    onClick={handleSaveHistory} 
    disabled={players.length === 0}
  >
    💾 Save to History
  </button>
</div>


        <div className="time-display">
          <span className="date">{todayDate}</span>
          <div className="time-selector">
            <button onClick={decrementHour}>-</button>
            <input
              type="text"
              value={`${raidStart} - ${raidEnd}`}
              onChange={handleTimeChange}
              onBlur={handleTimeBlur}
            />
            <button onClick={incrementHour}>+</button>
            
          </div>
          <button onClick={applyCurrentRange} className="update-time-btn">Update Time</button>
        </div>

        {players.length > 0 && (
          <LeaderboardTable players={players} showMovement={true} maxWidth={900} subtitle={appliedRange || undefined} />
        )}

        {players.length > 0 && (
          <Graph players={players} darkMode={darkMode} maxWidth={900} />
        )}
      </div>

      <Footer />
      <Modal
        open={modal.open}
        title={modal.title}
        message={modal.message}
        variant={modal.variant}
        confirmText={modal.variant === 'confirm' ? 'Confirm' : 'OK'}
        cancelText={"Cancel"}
        onConfirm={modal.onConfirm}
        onCancel={modal.onCancel}
      />
    </div>
  );
}
