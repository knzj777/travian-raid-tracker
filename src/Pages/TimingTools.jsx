import React, { useEffect } from "react";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import TimeIsClock from "../Components/TimeIsClock";
import AttackPlanner from "../Components/AttackPlanner";
import TimeCalculator from "../Components/TimeCalculator";
import "./TimingTools.css";

export default function TimingTools({ settings, onSettingsOpen, timerState, darkMode, setDarkMode }) {

  useEffect(() => {
    document.title = "Timing Tools - Raid Tracker";
    return () => {
      document.title = "Raid Tracker";
    };
  }, []);

  return (
    <div className={`app-container ${darkMode ? "dark" : "light"}`}>
      <Header darkMode={darkMode} setDarkMode={setDarkMode} onSettingsOpen={onSettingsOpen} timerState={timerState} />

      <div className="content timecalc-content" style={{ flex: 1 }}>

      <TimeIsClock />
      
      <AttackPlanner />
      
      <TimeCalculator />

      </div>

      <Footer />
    </div>
  );
}
