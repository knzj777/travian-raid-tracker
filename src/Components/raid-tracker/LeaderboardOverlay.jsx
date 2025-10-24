import React from 'react';
import LeaderboardTable from '../LeaderboardTable';
import Graph from '../Graph';
import './LeaderboardOverlay.css';

const LeaderboardOverlay = ({
  isOpen,
  onClose,
  players,
  darkMode,
  appliedRange,
  maxWidth = 800
}) => {
  if (!isOpen) return null;

  return (
    <div className="leaderboard-overlay" onClick={onClose}>
      <div 
        className={`leaderboard-overlay-content ${darkMode ? 'dark' : 'light'}`}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: `${maxWidth}px` }}
      >
        <button className="close-overlay" onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div className="overlay-header">
          <h2>Leaderboard & Statistics</h2>
          {appliedRange && <p className="time-range">{appliedRange}</p>}
        </div>

        <div className="overlay-content">
          {players.length > 0 ? (
            <>
              <div className="overlay-section">
                <LeaderboardTable 
                  players={players} 
                  showMovement={true} 
                  maxWidth={maxWidth} 
                  subtitle={appliedRange || undefined} 
                />
              </div>
              
              <div className="overlay-section">
                <Graph 
                  players={players} 
                  darkMode={darkMode} 
                  maxWidth={maxWidth} 
                />
              </div>
            </>
          ) : (
            <div className="no-data">
              <p>No data available. Use the Raid Tracker to input data first.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardOverlay;
