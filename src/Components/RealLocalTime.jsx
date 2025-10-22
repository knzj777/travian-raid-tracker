import React, { useState, useEffect } from 'react';
import './RealLocalTime.css';

const RealLocalTime = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [offsetMs, setOffsetMs] = useState(() => {
    try {
      const saved = localStorage.getItem('userTimeOffsetMs');
      return saved !== null ? parseFloat(saved) || '' : '';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    const tick = () => {
      const offsetMsValue = Math.round(parseFloat(offsetMs) || 0);
      setCurrentTime(new Date(Date.now() + offsetMsValue));
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [offsetMs]);

  const handleOffsetChange = (e) => {
    setOffsetMs(e.target.value);
  };

  const persistOffset = () => {
    const normalized = parseFloat(offsetMs) || 0;
    localStorage.setItem('userTimeOffsetMs', String(normalized));
    setOffsetMs(normalized);
  };

  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="real-local-time">
      <div className="time-label">Local time</div>
      <div className="time-display">{formatTime(currentTime)}</div>

      <div className="time-controls" style={{ marginTop: '8px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Offset (ms):</span>
          <input
            type="number"
            step="1"
            value={offsetMs}
            onChange={handleOffsetChange}
            onBlur={persistOffset}
            placeholder="-1200"
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
              Always check your offset!<br/>
              If the time ticking is not the same try refreshing page.<br/>
              If your time is ahead e.g 1.2s input -1200 into field.<br/>
              If its behind put e.g. 1.2s input 1200 into field.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealLocalTime;