import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import "./App.css";
import RaidTracker from "./RaidTracker";
import HowToUse from "./Pages/HowToUse";
import History from "./Pages/History";
import Timer from "./Pages/Timer";
import TimingTools from "./Pages/TimingTools";
import CreateReport from "./Pages/CreateReport";
import Attacks from "./Pages/Attacks";
import Scouts from "./Pages/Scouts";
import Settings from "./Components/Settings";
import ScrollToTop from "./Components/ScrollToTop";
import FloatingRaidTracker from "./Components/raid-tracker/FloatingRaidTracker";
import RaidTrackerOverlay from "./Components/raid-tracker/RaidTrackerOverlay";
import LeaderboardOverlay from "./Components/raid-tracker/LeaderboardOverlay";
import Modal from "./Components/modals/Modal";
import SaveModal from "./Components/modals/SaveModal";

function App() {
  const [settings, setSettings] = useState({
    lightReportOnDarkTheme: true,
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Global overlay states
  const [showRaidTrackerOverlay, setShowRaidTrackerOverlay] = useState(false);
  const [showLeaderboardOverlay, setShowLeaderboardOverlay] = useState(false);

  // Global raid tracker data (shared across all pages)
  const [raidTrackerData, setRaidTrackerData] = useState({
    input: "",
    players: [],
    raidStart: "00:30",
    raidEnd: "01:30",
    appliedRange: "",
  });

  // Global raid tracker state management
  const [raidTrackerModal, setRaidTrackerModal] = useState({
    open: false,
    title: "",
    message: "",
    variant: "info",
    onConfirm: null,
    onCancel: null,
  });
  const [raidTrackerSaveModal, setRaidTrackerSaveModal] = useState(false);

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
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      // Ensure lightReportOnDarkTheme is always true by default
      setSettings({
        lightReportOnDarkTheme: true,
        ...parsedSettings,
        lightReportOnDarkTheme: parsedSettings.lightReportOnDarkTheme !== false,
      });
    }

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

    // Load raid tracker data from localStorage
    const savedRaidData = localStorage.getItem("raidData");
    if (savedRaidData) {
      try {
        const players = JSON.parse(savedRaidData);
        setRaidTrackerData((prev) => ({ ...prev, players }));
      } catch (e) {
        console.error("Failed to parse saved raid data:", e);
      }
    }

    // Load raid time range from localStorage
    const savedTimeRange = localStorage.getItem("raidTimeRange");
    if (savedTimeRange) {
      const parts = savedTimeRange.split("-");
      if (parts.length === 2) {
        setRaidTrackerData((prev) => ({
          ...prev,
          raidStart: parts[0].trim(),
          raidEnd: parts[1].trim(),
        }));
      }
    }
  }, []);

  // Persist theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Persist raid tracker data to localStorage
  useEffect(() => {
    localStorage.setItem("raidData", JSON.stringify(raidTrackerData.players));
  }, [raidTrackerData.players]);

  // Persist raid time range to localStorage
  useEffect(() => {
    const display = `${raidTrackerData.raidStart} - ${raidTrackerData.raidEnd}`;
    localStorage.setItem("raidTimeRange", display);
  }, [raidTrackerData.raidStart, raidTrackerData.raidEnd]);

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

  // Raid Tracker Functions
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

  const handlePaste = async () => {
    try {
      let textToParse = raidTrackerData.input.trim();

      if (!textToParse) {
        textToParse = await navigator.clipboard.readText();
        if (!textToParse.trim()) {
          setRaidTrackerModal({
            open: true,
            title: "Nothing to paste",
            message: "Input box is empty and clipboard has no text.",
            variant: "info",
            onConfirm: () =>
              setRaidTrackerModal((m) => ({ ...m, open: false })),
          });
          return;
        }
      }

      const newData = parseData(textToParse);

      if (raidTrackerData.players.length === 0) {
        const initialized = newData.map((p) => ({
          ...p,
          lastHour: "Missing data",
          diff: "Next hour data needed",
          previousRank: null,
          isNew: true,
        }));
        setRaidTrackerData((prev) => ({
          ...prev,
          players: initialized,
          input: "",
        }));
      } else {
        const updated = newData.map((p) => {
          const old = raidTrackerData.players.find(
            (x) => x.player === p.player
          );
          const lastHour = old ? old.resources : "Missing data";
          const diff = old
            ? p.resources - old.resources
            : "Next hour data needed";
          const previousRank = old
            ? raidTrackerData.players.indexOf(old) + 1
            : null;
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
        setRaidTrackerData((prev) => ({ ...prev, players: sorted, input: "" }));
      }

      const display = `${raidTrackerData.raidStart} - ${raidTrackerData.raidEnd}`;
      setRaidTrackerData((prev) => ({ ...prev, appliedRange: display }));
    } catch (err) {
      setRaidTrackerModal({
        open: true,
        title: "Paste failed",
        message: "Unable to access clipboard or process input.",
        variant: "info",
        onConfirm: () => setRaidTrackerModal((m) => ({ ...m, open: false })),
      });
    }
  };

  const handleReset = () => {
    setRaidTrackerModal({
      open: true,
      title: "Reset data",
      message: "Clear all saved data? This cannot be undone.",
      variant: "confirm",
      onCancel: () => setRaidTrackerModal((m) => ({ ...m, open: false })),
      onConfirm: () => {
        setRaidTrackerModal((m) => ({ ...m, open: false }));
        setRaidTrackerData({
          input: "",
          players: [],
          raidStart: "00:30",
          raidEnd: "01:30",
          appliedRange: "",
        });
        localStorage.removeItem("raidData");
        localStorage.removeItem("raidTimeRange");
      },
    });
  };

  const handleSaveHistory = () => {
    if (raidTrackerData.players.length === 0) return;

    const newSnapshot = {
      timestamp: Date.now(),
      raidTimeRange: `${raidTrackerData.raidStart} - ${raidTrackerData.raidEnd}`,
      players: raidTrackerData.players,
    };

    const history = JSON.parse(localStorage.getItem("history") || "[]");
    history.push(newSnapshot);
    localStorage.setItem("history", JSON.stringify(history));

    // Show save notification
    setRaidTrackerSaveModal(true);
  };

  // Time range functions
  const incrementHour = () => {
    const [sh, sm] = raidTrackerData.raidStart.split(":").map(Number);
    const [eh, em] = raidTrackerData.raidEnd.split(":").map(Number);
    const ns = `${((sh + 1) % 24).toString().padStart(2, "0")}:${sm
      .toString()
      .padStart(2, "0")}`;
    const ne = `${((eh + 1) % 24).toString().padStart(2, "0")}:${em
      .toString()
      .padStart(2, "0")}`;
    setRaidTrackerData((prev) => ({ ...prev, raidStart: ns, raidEnd: ne }));
  };

  const decrementHour = () => {
    const [sh, sm] = raidTrackerData.raidStart.split(":").map(Number);
    const [eh, em] = raidTrackerData.raidEnd.split(":").map(Number);
    const ns = `${((sh - 1 + 24) % 24).toString().padStart(2, "0")}:${sm
      .toString()
      .padStart(2, "0")}`;
    const ne = `${((eh - 1 + 24) % 24).toString().padStart(2, "0")}:${em
      .toString()
      .padStart(2, "0")}`;
    setRaidTrackerData((prev) => ({ ...prev, raidStart: ns, raidEnd: ne }));
  };

  const handleTimeChange = (e) => {
    const val = e.target.value;
    if (/^[0-9:\\-\s]*$/.test(val)) {
      const parts = val.split("-");
      if (parts.length === 2) {
        setRaidTrackerData((prev) => ({
          ...prev,
          raidStart: parts[0].trim(),
          raidEnd: parts[1].trim(),
        }));
      }
    }
  };

  const handleTimeBlur = () => {
    const norm = (val) => {
      const [h, m] = (val || "").split(":").map(Number);
      if (isNaN(h) || isNaN(m)) return null;
      return `${h.toString().padStart(2, "0")}:${m
        .toString()
        .padStart(2, "0")}`;
    };
    const s = norm(raidTrackerData.raidStart);
    const e = norm(raidTrackerData.raidEnd);
    if (s && e) {
      setRaidTrackerData((prev) => ({ ...prev, raidStart: s, raidEnd: e }));
    } else {
      setRaidTrackerData((prev) => ({
        ...prev,
        raidStart: "00:30",
        raidEnd: "01:30",
      }));
    }
  };

  const applyCurrentRange = () => {
    const display = `${raidTrackerData.raidStart} - ${raidTrackerData.raidEnd}`;
    setRaidTrackerData((prev) => ({ ...prev, appliedRange: display }));
  };

  return (
    <Router basename="/travian-raid-tracker">
      <Routes>
        <Route
          path="/"
          element={
            <RaidTracker
              settings={settings}
              onSettingsOpen={() => setSettingsOpen(true)}
              timerState={timerState}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              raidTrackerData={raidTrackerData}
              setRaidTrackerData={setRaidTrackerData}
              handlePaste={handlePaste}
              handleReset={handleReset}
              handleSaveHistory={handleSaveHistory}
              incrementHour={incrementHour}
              decrementHour={decrementHour}
              handleTimeChange={handleTimeChange}
              handleTimeBlur={handleTimeBlur}
              applyCurrentRange={applyCurrentRange}
            />
          }
        />
        <Route
          path="/how-to-use"
          element={
            <HowToUse
              settings={settings}
              onSettingsOpen={() => setSettingsOpen(true)}
              timerState={timerState}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
            />
          }
        />
        <Route
          path="/history"
          element={
            <History
              settings={settings}
              onSettingsOpen={() => setSettingsOpen(true)}
              timerState={timerState}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
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
              darkMode={darkMode}
              setDarkMode={setDarkMode}
            />
          }
        />
        <Route
          path="/time-calculator"
          element={
            <TimingTools
              settings={settings}
              onSettingsOpen={() => setSettingsOpen(true)}
              timerState={timerState}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
            />
          }
        />
        <Route
          path="/create-report"
          element={
            <CreateReport
              settings={settings}
              onSettingsOpen={() => setSettingsOpen(true)}
              timerState={timerState}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
            />
          }
        />
        <Route
          path="/attacks"
          element={
            <Attacks
              settings={settings}
              onSettingsOpen={() => setSettingsOpen(true)}
              timerState={timerState}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
            />
          }
        />
        <Route
          path="/scouts"
          element={
            <Scouts
              settings={settings}
              onSettingsOpen={() => setSettingsOpen(true)}
              timerState={timerState}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
            />
          }
        />
      </Routes>

      <Settings
        settings={settings}
        onSettingsChange={handleSettingsChange}
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        darkMode={darkMode}
      />

      <ScrollToTop darkMode={darkMode} />

      {/* Global Floating Raid Tracker */}
      <FloatingRaidTracker
        onToggleRaidTracker={() =>
          setShowRaidTrackerOverlay(!showRaidTrackerOverlay)
        }
        onToggleLeaderboard={() =>
          setShowLeaderboardOverlay(!showLeaderboardOverlay)
        }
        onSaveData={handleSaveHistory}
        playersLength={raidTrackerData.players.length}
        darkMode={darkMode}
      />

      {/* Global Raid Tracker Overlay */}
      <RaidTrackerOverlay
        isOpen={showRaidTrackerOverlay}
        onClose={() => setShowRaidTrackerOverlay(false)}
        input={raidTrackerData.input}
        setInput={(value) =>
          setRaidTrackerData((prev) => ({ ...prev, input: value }))
        }
        onPaste={handlePaste}
        onReset={handleReset}
        onSaveHistory={handleSaveHistory}
        playersLength={raidTrackerData.players.length}
        todayDate={new Date()
          .toLocaleDateString("hr-HR")
          .replace(/\//g, ".")
          .replace(/\.$/, "")
          .replace(/\s/g, "")}
        raidStart={raidTrackerData.raidStart}
        raidEnd={raidTrackerData.raidEnd}
        onDecrementHour={decrementHour}
        onIncrementHour={incrementHour}
        onTimeChange={handleTimeChange}
        onTimeBlur={handleTimeBlur}
        onApplyCurrentRange={applyCurrentRange}
        darkMode={darkMode}
      />

      {/* Global Leaderboard Overlay */}
      <LeaderboardOverlay
        isOpen={showLeaderboardOverlay}
        onClose={() => setShowLeaderboardOverlay(false)}
        players={raidTrackerData.players}
        darkMode={darkMode}
        appliedRange={raidTrackerData.appliedRange}
        maxWidth={800}
      />

      {/* Global Raid Tracker Modals */}
      <Modal
        open={raidTrackerModal.open}
        title={raidTrackerModal.title}
        message={raidTrackerModal.message}
        variant={raidTrackerModal.variant}
        confirmText={raidTrackerModal.variant === "confirm" ? "Confirm" : "OK"}
        cancelText={"Cancel"}
        onConfirm={raidTrackerModal.onConfirm}
        onCancel={raidTrackerModal.onCancel}
      />

      <SaveModal
        isVisible={raidTrackerSaveModal}
        onClose={() => setRaidTrackerSaveModal(false)}
        message="Snapshot saved to History"
        position="bottom-left"
        duration={3000}
      />

      {/* Hidden audio element for timer sounds */}
      <audio ref={audioRef} style={{ display: "none" }} />
    </Router>
  );
}

export default App;
