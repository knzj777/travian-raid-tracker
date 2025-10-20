import React, { useState, useEffect } from 'react';
import './SaveModal.css';

const SaveModal = ({ 
  isVisible, 
  onClose, 
  message = "Saved successfully", 
  duration = 3000,
  position = "bottom-right", // "bottom-right", "bottom-left", "top-right", "top-left"
  progressColor = "#527230" // Default green, can be overridden
}) => {
  const [progressWidth, setProgressWidth] = useState(100);
  const [isClosing, setIsClosing] = useState(false);
  const [autoCloseTimer, setAutoCloseTimer] = useState(null);

  useEffect(() => {
    if (isVisible) {
      setProgressWidth(100);
      setIsClosing(false);
      
      // Auto-close timer
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      setAutoCloseTimer(timer);
      
      // Progress bar animation
      const progressTimer = setInterval(() => {
        setProgressWidth(prev => {
          if (prev <= 0) {
            clearInterval(progressTimer);
            return 0;
          }
          return prev - (100 / (duration / 10)); // Smooth progress over duration
        });
      }, 10);

      return () => {
        clearTimeout(timer);
        clearInterval(progressTimer);
      };
    }
  }, [isVisible, duration]);

  const handleClose = () => {
    setIsClosing(true);
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      setAutoCloseTimer(null);
    }
    setTimeout(() => {
      setIsClosing(false);
      setProgressWidth(100);
      onClose();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className={`save-modal ${position} ${isClosing ? 'closing' : ''}`}>
      <div className="save-modal-content">
        <span className="save-modal-text">
          {message}
        </span>
        <button className="save-modal-close" onClick={handleClose}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div className="save-modal-progress">
        <div 
          className="save-modal-progress-bar"
          style={{ 
            width: `${progressWidth}%`,
            backgroundColor: progressColor
          }}
        ></div>
      </div>
    </div>
  );
};

export default SaveModal;
