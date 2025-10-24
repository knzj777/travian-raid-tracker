import React from 'react';

const RaidInput = ({ 
  input, 
  setInput, 
  onPaste, 
  onReset, 
  onSaveHistory, 
  playersLength 
}) => {
  return (
    <>
      <div className="input-wrap">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Copy the Top 10 table and paste it here or just press the button..."
          className="input-box"
        />
      </div>

      <div className="buttons">
        <button className="paste-btn" onClick={onPaste}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
          </svg>
          Paste & Update
        </button>
        <button className="reset-btn" onClick={onReset}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3,6 5,6 21,6"/>
            <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
            <line x1="10" y1="11" x2="10" y2="17"/>
            <line x1="14" y1="11" x2="14" y2="17"/>
          </svg>
          Reset
        </button>
        <button 
          className="save-history-btn" 
          onClick={onSaveHistory} 
          disabled={playersLength === 0}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17,21 17,13 7,13 7,21"/>
            <polyline points="7,3 7,8 15,8"/>
          </svg>
          Save to History
        </button>
      </div>
    </>
  );
};

export default RaidInput;
