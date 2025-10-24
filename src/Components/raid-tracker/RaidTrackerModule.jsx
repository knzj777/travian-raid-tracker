import React from 'react';
import RaidInput from './RaidInput';
import TimeRangeSelector from './TimeRangeSelector';

const RaidTrackerModule = ({
  // Input props
  input,
  setInput,
  onPaste,
  onReset,
  onSaveHistory,
  playersLength,
  
  // Time props
  todayDate,
  raidStart,
  raidEnd,
  onDecrementHour,
  onIncrementHour,
  onTimeChange,
  onTimeBlur,
  onApplyCurrentRange,
  
  // Styling
  className = "",
  showTitle = true
}) => {
  return (
    <div className={`raid-tracker-module ${className}`}>
      {showTitle && <h1>Raid Tracker</h1>}
      
      <RaidInput
        input={input}
        setInput={setInput}
        onPaste={onPaste}
        onReset={onReset}
        onSaveHistory={onSaveHistory}
        playersLength={playersLength}
      />

      <TimeRangeSelector
        todayDate={todayDate}
        raidStart={raidStart}
        raidEnd={raidEnd}
        onDecrementHour={onDecrementHour}
        onIncrementHour={onIncrementHour}
        onTimeChange={onTimeChange}
        onTimeBlur={onTimeBlur}
        onApplyCurrentRange={onApplyCurrentRange}
        playersLength={playersLength}
      />
    </div>
  );
};

export default RaidTrackerModule;
