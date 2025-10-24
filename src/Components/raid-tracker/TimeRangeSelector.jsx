import React from 'react';

const TimeRangeSelector = ({ 
  todayDate,
  raidStart,
  raidEnd,
  onDecrementHour,
  onIncrementHour,
  onTimeChange,
  onTimeBlur,
  onApplyCurrentRange,
  playersLength
}) => {
  return (
    <div className="time-display">
      <span className="date">{todayDate}</span>
      <div className="time-selector">
        <button onClick={onDecrementHour}>-</button>
        <input
          type="text"
          value={`${raidStart} - ${raidEnd}`}
          onChange={onTimeChange}
          onBlur={onTimeBlur}
        />
        <button onClick={onIncrementHour}>+</button>
      </div>
      <button 
        onClick={onApplyCurrentRange} 
        className="update-time-btn" 
        disabled={playersLength === 0}
      >
        Update Time
      </button>
    </div>
  );
};

export default TimeRangeSelector;
