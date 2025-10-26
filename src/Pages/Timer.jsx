import React, { useEffect } from "react";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import "./Timer.css";

export default function Timer({ settings, onSettingsOpen, timerState, onTimerStateChange, playSound, darkMode, setDarkMode }) {

  useEffect(() => {
    // Update page title
    document.title = "Timer - Raid Tracker";
    
    // Cleanup function to reset title when leaving the page
    return () => {
      document.title = "Raid Tracker";
    };
  }, []);

  const format = (total) => {
    const m = Math.floor(total / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(total % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  // Parse flexible user input into seconds.
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

  const handleStartStop = () => {
    // Initialize audio context on user interaction to bypass autoplay policy
    if (!timerState.running) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        const ctx = new AC();
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
      }
    }
    
    onTimerStateChange({
      ...timerState,
      running: !timerState.running,
      startTime: !timerState.running ? Date.now() : null, // Set start time when starting
      pausedTime: timerState.running ? Date.now() : null, // Set paused time when stopping
    });
    // Prime vibration on a user gesture so later calls are more likely to be honored
    if (!timerState.running && timerState.vibration) {
      // Vibration is now handled globally in App.js
    }
  };

  const addSeconds = (delta) => {
    const newInitialSeconds = Math.max(0, timerState.initialSeconds + delta);
    const newSeconds = Math.max(0, timerState.seconds + delta);
    onTimerStateChange({
      ...timerState,
      initialSeconds: newInitialSeconds,
      seconds: newSeconds,
      timeInput: format(newInitialSeconds),
    });
  };

  const reset = () => {
    console.log('Reset button clicked!');
    console.log('Current timer state:', timerState);
    console.log('Resetting to initial seconds:', timerState.initialSeconds);
    
    onTimerStateChange({
      ...timerState,
      seconds: timerState.initialSeconds,
      running: false,
      startTime: null,
      pausedTime: null,
    });
    
    console.log('Reset function completed');
  };

  const updateTimerSetting = (key, value) => {
    onTimerStateChange({
      ...timerState,
      [key]: value,
    });
  };

  const handleTimeInputChange = (raw) => {
    const sanitized = raw.replace(/[^0-9:]/g, "");
    const parsed = parseFlexible(sanitized);
    
    onTimerStateChange({
      ...timerState,
      timeInput: sanitized,
      ...(parsed !== null && {
        initialSeconds: parsed,
        seconds: parsed,
      }),
    });
  };

  const handleTimeInputBlur = () => {
    const parsed = parseFlexible(timerState.timeInput);
    if (parsed === null) {
      // revert to last known good value
      onTimerStateChange({
        ...timerState,
        timeInput: format(timerState.initialSeconds),
      });
    } else {
      const m = Math.floor(parsed / 60)
        .toString()
        .padStart(2, "0");
      const s = Math.floor(parsed % 60)
        .toString()
        .padStart(2, "0");
      onTimerStateChange({
        ...timerState,
        timeInput: `${m}:${s}`,
      });
    }
  };

  return (
    <div
      className={`app-container ${darkMode ? "dark" : "light"}`}
    >
      <Header darkMode={darkMode} setDarkMode={setDarkMode} onSettingsOpen={onSettingsOpen} timerState={timerState} />

      <div className={`content timer-content ${timerState.running ? 'timer-running' : ''}`} style={{ flex: 1 }}>
        <h1>Timer</h1>

        <div className={`timer-display ${timerState.running ? "running" : ""}`}>{format(timerState.seconds)}</div>

        <div className="timer-controls">
          <div className="time-input-section">
            <label>Set (mm:ss)</label>
            <div className="time-input-with-buttons">
              <button onClick={() => addSeconds(-30)} className="increment-btn">-30</button>
              <button onClick={() => addSeconds(-15)} className="increment-btn">-15</button>
              <input
                type="text"
                value={timerState.timeInput}
                onChange={(e) => handleTimeInputChange(e.target.value)}
                onBlur={handleTimeInputBlur}
              />
              <button onClick={() => addSeconds(+15)} className="increment-btn">+15</button>
              <button onClick={() => addSeconds(+30)} className="increment-btn">+30</button>
            </div>
          </div>
          <div className="checkbox-section">
            <div className="checkbox-container">
              <input 
                type="checkbox" 
                checked={timerState.repeat} 
                onChange={(e) => updateTimerSetting('repeat', e.target.checked)} 
              />
              <span>Repeat</span>
            </div>
            <div className="checkbox-container">
              <input 
                type="checkbox" 
                checked={timerState.vibration} 
                onChange={(e) => updateTimerSetting('vibration', e.target.checked)} 
              />
              <span>Vibration</span>
            </div>
          </div>
          <div className="sound">
            <label>Sound</label>
            <select 
              value={timerState.soundName} 
              onChange={(e) => updateTimerSetting('soundName', e.target.value)}
            >
              <option value="beep">Beep</option>
              <option value="tri">Tri-tone</option>
              <option value="alarm">Alarm</option>
            </select>
            <button 
              className="test-sound-btn" 
              onClick={() => {
                if (playSound) {
                  playSound(timerState.soundName);
                }
              }}
            >
              🔊
              Test
            </button>
            <div className="volume-control">
              <label htmlFor="volume-slider">Volume</label>
              <input
                id="volume-slider"
                className="volume-slider"
                type="range"
                min="0"
                max="100"
                value={Math.round(timerState.volume * 100)}
                onChange={(e) => updateTimerSetting('volume', Math.min(1, Math.max(0, Number(e.target.value) / 100)))}
              />
              <span className="volume-value">{Math.round(timerState.volume * 100)}%</span>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button className={timerState.running ? "stop" : "start"} onClick={handleStartStop}>
            {timerState.running ? "Stop" : "Start"}
          </button>
          <button onClick={reset}>Reset</button>
        </div>
      </div>

      <Footer />
    </div>
  );
}


