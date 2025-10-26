import React, { useState, useEffect, useCallback, useRef } from 'react';
import './SaveModal.css';

const SaveModal = ({ 
  isVisible, 
  onClose, 
  message = "Saved successfully", 
  duration = 3000,
  position = "bottom-middle", // "bottom-right", "bottom-left", "bottom-middle", "top-right", "top-left", "top-middle"
  progressColor = "#527230" // Default green, can be overridden
}) => {
  const [progressWidth, setProgressWidth] = useState(100);
  const [isClosing, setIsClosing] = useState(false);
  const [isShowing, setIsShowing] = useState(false);
  const autoCloseTimerRef = useRef(null);
  const progressTimerRef = useRef(null);
  const closingTimerRef = useRef(null);
  const showTimerRef = useRef(null);
  const handleCloseRef = useRef(null);

  const handleClose = useCallback(() => {
    // Prevent multiple close calls
    if (isClosing) return;
    
    setIsClosing(true);
    setIsShowing(false);
    
    // Clear all timers
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
    
    // Set closing animation timer
    closingTimerRef.current = setTimeout(() => {
      setIsClosing(false);
      setProgressWidth(100);
      onClose();
      closingTimerRef.current = null;
    }, 300);
  }, [isClosing, onClose]);

  // Store the close function in ref to avoid dependency issues
  handleCloseRef.current = handleClose;

  useEffect(() => {
    if (isVisible) {
      // Reset state
      setProgressWidth(100);
      setIsClosing(false);
      
      // Clear any existing timers
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
      if (closingTimerRef.current) {
        clearTimeout(closingTimerRef.current);
      }
      if (showTimerRef.current) {
        clearTimeout(showTimerRef.current);
      }
      
      // Show the modal after a brief delay to ensure smooth animation
      showTimerRef.current = setTimeout(() => {
        setIsShowing(true);
      }, 10);
      
      // Auto-close timer
      autoCloseTimerRef.current = setTimeout(() => {
        if (handleCloseRef.current) {
          handleCloseRef.current();
        }
      }, duration);
      
      // Progress bar animation
      progressTimerRef.current = setInterval(() => {
        setProgressWidth(prev => {
          if (prev <= 0) {
            return 0;
          }
          return prev - (100 / (duration / 10)); // Smooth progress over duration
        });
      }, 10);

      return () => {
        // Cleanup function
        if (autoCloseTimerRef.current) {
          clearTimeout(autoCloseTimerRef.current);
          autoCloseTimerRef.current = null;
        }
        if (progressTimerRef.current) {
          clearInterval(progressTimerRef.current);
          progressTimerRef.current = null;
        }
        if (closingTimerRef.current) {
          clearTimeout(closingTimerRef.current);
          closingTimerRef.current = null;
        }
        if (showTimerRef.current) {
          clearTimeout(showTimerRef.current);
          showTimerRef.current = null;
        }
      };
    } else {
      // Reset state when not visible
      setProgressWidth(100);
      setIsClosing(false);
      setIsShowing(false);
    }
  }, [isVisible, duration]);

  if (!isVisible) return null;

  return (
    <div className={`save-modal ${position} ${isShowing ? 'show' : ''} ${isClosing ? 'closing' : ''}`}>
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
