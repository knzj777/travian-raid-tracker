import React from 'react';
import RaidTrackerModule from './RaidTrackerModule';
import './RaidTrackerOverlay.css';

const RaidTrackerOverlay = ({
  isOpen,
  onClose,
  // All the props needed for RaidTrackerModule
  input,
  setInput,
  onPaste,
  onReset,
  onSaveHistory,
  playersLength,
  todayDate,
  raidStart,
  raidEnd,
  onDecrementHour,
  onIncrementHour,
  onTimeChange,
  onTimeBlur,
  onApplyCurrentRange,
  darkMode
}) => {
  if (!isOpen) return null;

  return (
    <div className="raid-tracker-overlay" onClick={onClose}>
      <div 
        className={`raid-tracker-overlay-content ${darkMode ? 'dark' : 'light'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-overlay" onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div className="overlay-header">
          <h2>Raid Tracker</h2>
        </div>

        <div className="overlay-content">
          <RaidTrackerModule
            input={input}
            setInput={setInput}
            onPaste={onPaste}
            onReset={onReset}
            onSaveHistory={onSaveHistory}
            playersLength={playersLength}
            todayDate={todayDate}
            raidStart={raidStart}
            raidEnd={raidEnd}
            onDecrementHour={onDecrementHour}
            onIncrementHour={onIncrementHour}
            onTimeChange={onTimeChange}
            onTimeBlur={onTimeBlur}
            onApplyCurrentRange={onApplyCurrentRange}
            showTitle={false}
          />
        </div>
      </div>
    </div>
  );
};

export default RaidTrackerOverlay;
