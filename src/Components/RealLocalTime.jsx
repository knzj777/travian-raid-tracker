import React, { useState, useEffect } from 'react';
import './RealLocalTime.css';

const RealLocalTime = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [offsetSeconds, setOffsetSeconds] = useState(() => {
    try {
      const saved = localStorage.getItem('userTimeOffsetSeconds');
      return saved !== null ? parseFloat(saved) || '' : '';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    const tick = () => {
      const offsetSecondsValue = parseFloat(offsetSeconds) || 0;
      const offsetMsValue = Math.round(offsetSecondsValue * 1000);
      setCurrentTime(new Date(Date.now() + offsetMsValue));
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [offsetSeconds]);

  const handleOffsetChange = (e) => {
    let value = e.target.value;
    // Replace all commas with dots for decimal notation
    value = value.replace(/,/g, '.');
    setOffsetSeconds(value);
    // Persist on each change so other components (AttackPlanner) see updates immediately
    const normalized = parseFloat(value);
    if (!Number.isNaN(normalized)) {
      localStorage.setItem('userTimeOffsetSeconds', String(normalized));
    }
  };

  const persistOffset = () => {
    const normalized = parseFloat(offsetSeconds) || 0;
    localStorage.setItem('userTimeOffsetSeconds', String(normalized));
    setOffsetSeconds(normalized);
  };

  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="real-local-time">
      <div className="time-header">
        <div className="time-label">Local time</div>
        <div className="time-controls">
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Offset (s):</span>
          <input
            type="text"
            value={offsetSeconds}
            onChange={handleOffsetChange}
            onBlur={persistOffset}
            placeholder="-1.2"
          />
        </label>
        <div className="link-and-info">
          <a href="https://time.is/" target="_blank" rel="noopener noreferrer">
            Check your offset here
          </a>
          <div className="info-icon-container">
            <svg 
              className="info-icon" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4"/>
              <path d="M12 8h.01"/>
            </svg>
            <div className="info-tooltip">
              Always check your offset because it changes or use <a href='https://time.is/' target='_blank' rel='noopener noreferrer'>time.is</a> for the best results.<br/>
              If the time ticking is not the same try refreshing page.<br/>
              If your time is ahead e.g 1.2s input -1.2 into field.<br/>
              If its behind put e.g. 1.2s input 1.2 into field.
            </div>
          </div>
        </div>
        </div>
      </div>
      <div className="time-display">{formatTime(currentTime)}</div>
    </div>
  );
};

export default RealLocalTime;