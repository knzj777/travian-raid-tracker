import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import "./Timer.css";

export default function Timer() {
  const [darkMode, setDarkMode] = useState(true);
  const [repeat, setRepeat] = useState(true);
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(60 * 5); // current remaining seconds
  const [initialSeconds, setInitialSeconds] = useState(60 * 5); // configured duration
  const [soundName, setSoundName] = useState("beep");
  const [vibration, setVibration] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [timeInput, setTimeInput] = useState("05:00");

  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) setDarkMode(savedTheme === "dark");
    
    // Update page title
    document.title = "Timer - Raid Tracker";
    
    // Load saved timer settings
    try {
      const raw = localStorage.getItem("timerSettings");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.repeat === "boolean") setRepeat(parsed.repeat);
        if (typeof parsed.vibration === "boolean") setVibration(parsed.vibration);
        if (typeof parsed.soundName === "string") setSoundName(parsed.soundName);
        if (typeof parsed.volume === "number") setVolume(Math.min(1, Math.max(0, parsed.volume)));
        if (typeof parsed.initialSeconds === "number" && parsed.initialSeconds >= 0) {
          setInitialSeconds(parsed.initialSeconds);
          setSeconds(parsed.initialSeconds);
          // timeInput will sync via the effect below, but update optimistically as well
          setTimeInput(format(parsed.initialSeconds));
        }
      }
    } catch {}
    
    // If vibration isn't supported in this environment, ensure it's off
    if (!supportsVibration()) {
      setVibration(false);
    }
    
    // Cleanup function to reset title when leaving the page
    return () => {
      document.title = "Raid Tracker";
    };
  }, []);

  // Basic synthesized sounds using WebAudio API
  const playSound = useMemo(() => {
    return async (name) => {
      // fallback simple <audio> element
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        } catch {}
      }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      const now = ctx.currentTime;
      const master = ctx.createGain();
      master.gain.value = Math.min(1, Math.max(0, volume));
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
        osc.type = name === "alarm" ? "square" : name === "tri" ? "triangle" : "sine";
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
  }, [volume]);

  const supportsVibration = () => {
    try {
      return typeof navigator !== "undefined" && "vibrate" in navigator && isSecureContext;
    } catch {
      return false;
    }
  };

  const doVibrate = (pattern = [150, 100, 150, 100, 300]) => {
    try {
      if (!supportsVibration()) return false;
      const result = navigator.vibrate(pattern);
      // Some browsers return boolean, others undefined. Only treat explicit false as failure.
      return result !== false;
    } catch {
      return false;
    }
  };

  const vibrate = () => {
    if (!vibration) return false;
    return doVibrate([150, 100, 150, 100, 300]);
  };

  const format = (total) => {
    const m = Math.floor(total / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(total % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  // Keep the text input in sync when the base duration changes externally (buttons)
  useEffect(() => {
    setTimeInput(format(initialSeconds));
  }, [initialSeconds]);

  // Persist settings whenever they change
  useEffect(() => {
    const toSave = {
      repeat,
      vibration,
      soundName,
      initialSeconds,
      volume,
    };
    try {
      localStorage.setItem("timerSettings", JSON.stringify(toSave));
    } catch {}
  }, [repeat, vibration, soundName, initialSeconds, volume]);

  // Parse flexible user input into seconds.
  // Accepts:
  // - "" -> invalid (keep editing)
  // - "5" -> 5:00
  // - "12" -> 12:00
  // - "123" -> 1:23
  // - "1234" -> 12:34
  // - "1:2", "01:2", "1:02" -> 01:02
  const parseFlexible = (val) => {
    if (val == null) return null;
    const clean = val.replace(/[^0-9:]/g, "");
    if (clean.length === 0) return null;
    if (clean.includes(":")) {
      const [mmRaw = "0", ssRaw = "0"] = clean.split(":");
      if (mmRaw === "" && ssRaw === "") return null;
      const m = Math.max(0, parseInt(mmRaw || "0", 10) || 0);
      let s = Math.max(0, parseInt(ssRaw || "0", 10) || 0);
      if (s > 59) s = 59; // clamp seconds
      return m * 60 + s;
    }
    // No colon -> interpret as mm or mmss depending on length
    const digits = clean;
    if (!/^[0-9]+$/.test(digits)) return null;
    if (digits.length <= 2) {
      // treat as minutes only
      const m = parseInt(digits, 10) || 0;
      return m * 60;
    }
    // length >= 3 -> mmss style
    const minutesPart = digits.slice(0, -2);
    let secondsPart = digits.slice(-2);
    const m = parseInt(minutesPart || "0", 10) || 0;
    let s = parseInt(secondsPart || "0", 10) || 0;
    if (s > 59) s = 59;
    return m * 60 + s;
  };

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

  useEffect(() => {
    document.title = `${formatHMS(seconds)} - Raid Tracker`;
  }, [seconds]);

  const tick = () => {
    setSeconds((prev) => {
      if (prev <= 1) {
        // trigger alarm
        let didVibrate = false;
        if (vibration) {
          didVibrate = vibrate();
        }
        if (!didVibrate) {
          playSound(soundName);
        }
        if (repeat) {
          return initialSeconds;
        }
        setRunning(false);
        return 0;
      }
      return prev - 1;
    });
  };

  const handleStartStop = () => {
    setRunning((r) => !r);
    // Prime vibration on a user gesture so later calls are more likely to be honored
    if (!running && vibration) {
      doVibrate([20]);
    }
  };

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(tick, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, initialSeconds, repeat, soundName]);

  const addSeconds = (delta) => {
    setInitialSeconds((v) => Math.max(0, v + delta));
    setSeconds((v) => Math.max(0, v + delta));
  };

  const reset = () => {
    setSeconds(initialSeconds);
    setRunning(false);
  };

  return (
    <div
      className={`app-container ${darkMode ? "dark" : "light"}`}
    >
      <Header darkMode={darkMode} setDarkMode={setDarkMode} />

      <div className={`content timer-content ${running ? 'timer-running' : ''}`} style={{ flex: 1 }}>
        <h1>Timer</h1>

        <div className={`timer-display ${running ? "running" : ""}`}>{format(seconds)}</div>

        <div className="timer-controls">
          <div className="time-input-section">
            <label>Set (mm:ss)</label>
            <div className="time-input-with-buttons">
              <button onClick={() => addSeconds(-30)} className="increment-btn">-30s</button>
              <input
                type="text"
                value={timeInput}
                onChange={(e) => {
                  const raw = e.target.value;
                  const sanitized = raw.replace(/[^0-9:]/g, "");
                  setTimeInput(sanitized);
                  const parsed = parseFlexible(sanitized);
                  if (parsed !== null) {
                    setInitialSeconds(parsed);
                    setSeconds(parsed);
                  }
                }}
                onBlur={() => {
                  const parsed = parseFlexible(timeInput);
                  if (parsed === null) {
                    // revert to last known good value
                    setTimeInput(format(initialSeconds));
                  } else {
                    const m = Math.floor(parsed / 60)
                      .toString()
                      .padStart(2, "0");
                    const s = Math.floor(parsed % 60)
                      .toString()
                      .padStart(2, "0");
                    setTimeInput(`${m}:${s}`);
                  }
                }}
              />
              <button onClick={() => addSeconds(+30)} className="increment-btn">+30s</button>
            </div>
          </div>
          <div className="repeat">
            <div className="checkbox-container">
              <input type="checkbox" checked={repeat} onChange={(e) => setRepeat(e.target.checked)} />
              <span>Repeat</span>
            </div>
          </div>
          <div className="vibration">
            <div className="checkbox-container">
              <input type="checkbox" checked={vibration} disabled={!supportsVibration()} onChange={(e) => setVibration(e.target.checked)} />
              <span>Vibration{!supportsVibration() ? " (unsupported)" : ""}</span>
            </div>
          </div>
          <div className="sound">
            <label>Sound</label>
            <select value={soundName} onChange={(e) => setSoundName(e.target.value)}>
              <option value="beep">Beep</option>
              <option value="tri">Tri-tone</option>
              <option value="alarm">Alarm</option>
            </select>
            <button 
              className="test-sound-btn" 
              onClick={() => {
                playSound(soundName);
                if (vibration) {
                  const ok = vibrate();
                  if (!ok) {
                    alert(
                      "Vibration isn't available. It requires a supported mobile browser (e.g. Chrome on Android) and a secure context (https). iOS Safari does not support the Vibration API."
                    );
                  }
                }
              }}
            >
              🔊 Test
            </button>
            <div className="volume-control">
              <label htmlFor="volume-slider">Volume</label>
              <input
                id="volume-slider"
                className="volume-slider"
                type="range"
                min="0"
                max="100"
                value={Math.round(volume * 100)}
                onChange={(e) => setVolume(Math.min(1, Math.max(0, Number(e.target.value) / 100)))}
              />
              <span className="volume-value">{Math.round(volume * 100)}%</span>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button className={running ? "stop" : "start"} onClick={handleStartStop}>
            {running ? "Stop" : "Start"}
          </button>
          <button onClick={reset}>Reset</button>
        </div>
      </div>

      <Footer />
      {/* hidden tag used for potential file-based audio in future */}
      <audio ref={audioRef} style={{ display: "none" }} />
    </div>
  );
}


