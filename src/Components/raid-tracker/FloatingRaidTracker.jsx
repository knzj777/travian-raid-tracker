import React, { useState, useEffect } from 'react';
import './FloatingRaidTracker.css';

const FloatingRaidTracker = ({ 
  onToggleRaidTracker,
  onToggleLeaderboard,
  onSaveData,
  playersLength,
  darkMode 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Check if we're on the main page
  const isMainPage = window.location.pathname === '/';

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Only trigger if not on main RaidTracker page
      if (isMainPage) return;
      
      if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        onToggleRaidTracker();
      } else if (e.key.toLowerCase() === 'w') {
        e.preventDefault();
        onToggleLeaderboard();
      } else if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        onSaveData();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onToggleRaidTracker, onToggleLeaderboard, onSaveData, isMainPage]);

  // Handle mouse drag
  const handleMouseDown = (e) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Keep within viewport bounds
    const maxX = window.innerWidth - 60;
    const maxY = window.innerHeight - 60;
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  return (
    <div 
      className={`floating-raid-tracker ${darkMode ? 'dark' : 'light'}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="floating-content">
        <div className="floating-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3h18v18H3z"/>
            <path d="M9 9h6v6H9z"/>
            <path d="M12 3v18"/>
            <path d="M3 12h18"/>
          </svg>
        </div>
        
        <div className="floating-actions">
          <button 
            className="floating-btn" 
            onClick={onToggleRaidTracker}
            disabled={isMainPage}
            title={isMainPage ? "Raid Tracker already visible" : "Toggle Raid Tracker (R)"}
          >
            R
          </button>
          <button 
            className="floating-btn" 
            onClick={onToggleLeaderboard}
            title="Toggle Leaderboard (W)"
          >
            W
          </button>
          <button 
            className="floating-btn save-btn" 
            onClick={onSaveData}
            disabled={playersLength === 0}
            title="Save Data (S)"
          >
            S
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloatingRaidTracker;
