import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import "./App.css";
import RaidDiffCalculator from "./RaidDiffCalculator";
import HowToUse from "./Pages/HowToUse";
import History from "./Pages/History";
import Timer from "./Pages/Timer";
import TimeCalculator from "./Pages/TimeCalculator";
import CreateReport from "./Pages/CreateReport";
import Attacks from "./Pages/Attacks";
import Scouts from "./Pages/Scouts";
import Settings from "./Components/Settings";
import ScrollToTop from "./Components/ScrollToTop";

function App() {
  const [settings, setSettings] = useState({
    lightReportOnDarkTheme: false,
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Timer state - moved to App level for persistence
  const [timerState, setTimerState] = useState({
    running: false,
    seconds: 60 * 5, // current remaining seconds
    initialSeconds: 60 * 5, // configured duration
    repeat: true,
    soundName: "beep",
    vibration: false,
    volume: 0.5, // Default to 50%
    timeInput: "05:00",
    justFinished: false, // Flag to trigger sound
  });

  const timerIntervalRef = useRef(null);
  const audioRef = useRef(null);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("appSettings");
    if (savedSettings) setSettings(JSON.parse(savedSettings));

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) setDarkMode(savedTheme === "dark");

    // Load timer state from localStorage
    const savedTimerState = localStorage.getItem("timerState");
    if (savedTimerState) {
      try {
        const parsed = JSON.parse(savedTimerState);
        setTimerState((prev) => ({
          ...prev,
          ...parsed,
          // Ensure we have valid values
          seconds:
            typeof parsed.seconds === "number" ? parsed.seconds : prev.seconds,
          initialSeconds:
            typeof parsed.initialSeconds === "number"
              ? parsed.initialSeconds
              : prev.initialSeconds,
          running: typeof parsed.running === "boolean" ? parsed.running : false,
        }));
      } catch (e) {
        console.error("Failed to parse saved timer state:", e);
      }
    }
  }, []);

  // Timer tick function
  const timerTick = () => {
    setTimerState((prev) => {
      if (prev.seconds <= 1) {
        // Timer finished - add a flag to trigger sound
        if (prev.repeat) {
          return {
            ...prev,
            seconds: prev.initialSeconds,
            justFinished: true, // Flag to trigger sound
          };
        }
        return {
          ...prev,
          seconds: 0,
          running: false,
          justFinished: true, // Flag to trigger sound
        };
      }
      return {
        ...prev,
        seconds: prev.seconds - 1,
        justFinished: false, // Reset flag
      };
    });
  };

  // Sound and vibration functions
  const supportsVibration = () => {
    try {
      return (
        typeof navigator !== "undefined" &&
        "vibrate" in navigator &&
        isSecureContext
      );
    } catch {
      return false;
    }
  };

  const doVibrate = (pattern = [150, 100, 150, 100, 300]) => {
    try {
      if (!supportsVibration()) return false;
      const result = navigator.vibrate(pattern);
      return result !== false;
    } catch {
      return false;
    }
  };

  const playSound = async (name) => {
    console.log("playSound called with:", name);
    // fallback simple <audio> element
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch {}
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) {
      console.log("No AudioContext available");
      return;
    }
    const ctx = new AC();

    // Resume audio context if suspended (required for autoplay policy)
    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch (e) {
        console.log("Failed to resume audio context:", e);
        return;
      }
    }

    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.value = Math.min(1, Math.max(0, timerState.volume));
    master.connect(ctx.destination);

    const pattern = [];
    switch (name) {
      case "beep":
        // Three beeps in a row
        pattern.push({ f: 1000, t: 0.2, d: 0 });
        pattern.push({ f: 1000, t: 0.2, d: 0.3 });
        pattern.push({ f: 1000, t: 0.2, d: 0.6 });
        break;
      case "tri":
        pattern.push({ f: 600, t: 0.15 });
        pattern.push({ f: 800, t: 0.15, d: 0.2 });
        pattern.push({ f: 1000, t: 0.2, d: 0.4 });
        break;
      case "alarm":
        for (let i = 0; i < 4; i++) {
          pattern.push({ f: 880, t: 0.12, d: i * 0.18 });
          pattern.push({ f: 660, t: 0.12, d: i * 0.18 + 0.12 });
        }
        break;
      default:
        pattern.push({ f: 1000, t: 0.2 });
    }

    pattern.forEach((p) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type =
        name === "alarm" ? "square" : name === "tri" ? "triangle" : "sine";
      osc.frequency.value = p.f;
      const startAt = now + (p.d || 0);
      const endAt = startAt + p.t;
      osc.connect(gain);
      gain.connect(master);
      gain.gain.setValueAtTime(0, startAt);
      gain.gain.linearRampToValueAtTime(1, startAt + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, endAt);
      osc.start(startAt);
      osc.stop(endAt + 0.01);
    });
  };

  // Handle timer finishing - play sound and vibrate
  useEffect(() => {
    if (timerState.justFinished) {
      console.log("Timer finished! Playing sound:", timerState.soundName);
      if (timerState.soundName) {
        playSound(timerState.soundName);
      }
      if (timerState.vibration) {
        doVibrate();
      }
      // Reset the flag
      setTimerState((prev) => ({
        ...prev,
        justFinished: false,
      }));
    }
  }, [
    timerState.justFinished,
    timerState.soundName,
    timerState.vibration,
    timerState.volume,
  ]);

  // Timer interval management
  useEffect(() => {
    if (timerState.running) {
      timerIntervalRef.current = setInterval(timerTick, 1000);
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [timerState.running]);

  // Persist timer state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("timerState", JSON.stringify(timerState));
  }, [timerState]);

  // Update document title with timer
  useEffect(() => {
    if (timerState.running) {
      const formatHMS = (total) => {
        const h = Math.floor(total / 3600)
          .toString()
          .padStart(2, "0");
        const m = Math.floor((total % 3600) / 60)
          .toString()
          .padStart(2, "0");
        const s = Math.floor(total % 60)
          .toString()
          .padStart(2, "0");
        return `${h}:${m}:${s}`;
      };
      document.title = `${formatHMS(timerState.seconds)} - Raid Tracker`;
    } else {
      document.title = "Raid Tracker";
    }
  }, [timerState.running, timerState.seconds]);

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem("appSettings", JSON.stringify(newSettings));
  };

  const handleTimerStateChange = (newTimerState) => {
    setTimerState(newTimerState);
    // Explicitly save to localStorage (also handled by useEffect, but being explicit)
    localStorage.setItem("timerState", JSON.stringify(newTimerState));
  };

  return (
    <Router basename="/travian-raid-tracker">
      <Routes>
        <Route
          path="/"
          element={
            <RaidDiffCalculator
              settings={settings}
              onSettingsOpen={() => setSettingsOpen(true)}
            />
          }
        />
        <Route
          path="/how-to-use"
          element={
            <HowToUse
              settings={settings}
              onSettingsOpen={() => setSettingsOpen(true)}
            />
          }
        />
        <Route
          path="/history"
          element={
            <History
              settings={settings}
              onSettingsOpen={() => setSettingsOpen(true)}
            />
          }
        />
        <Route
          path="/timer"
          element={
            <Timer
              settings={settings}
              onSettingsOpen={() => setSettingsOpen(true)}
              timerState={timerState}
              onTimerStateChange={handleTimerStateChange}
              playSound={playSound}
            />
          }
        />
        <Route
          path="/time-calculator"
          element={
            <TimeCalculator
              settings={settings}
              onSettingsOpen={() => setSettingsOpen(true)}
            />
          }
        />
        <Route
          path="/create-report"
          element={
            <CreateReport
              settings={settings}
              onSettingsOpen={() => setSettingsOpen(true)}
            />
          }
        />
        <Route
          path="/attacks"
          element={
            <Attacks
              settings={settings}
              onSettingsOpen={() => setSettingsOpen(true)}
            />
          }
        />
        <Route
          path="/scouts"
          element={
            <Scouts
              settings={settings}
              onSettingsOpen={() => setSettingsOpen(true)}
            />
          }
        />
      </Routes>

      <Settings
        settings={settings}
        onSettingsChange={handleSettingsChange}
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      <ScrollToTop darkMode={darkMode} />

      {/* Hidden audio element for timer sounds */}
      <audio ref={audioRef} style={{ display: "none" }} />
    </Router>
  );
}

export default App;
