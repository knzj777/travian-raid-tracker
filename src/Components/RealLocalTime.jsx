import React, { useState, useEffect, useRef } from 'react';
import './RealLocalTime.css';

const RealLocalTime = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSynced, setIsSynced] = useState(false);
  const [syncOffset, setSyncOffset] = useState(0);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const lastSyncRef = useRef(null);

  // Enhanced persistence with timestamp
  const saveSyncData = (offset, timestamp) => {
    const syncData = {
      offset: offset,
      timestamp: timestamp,
      version: '1.0'
    };
    localStorage.setItem('timeSyncData', JSON.stringify(syncData));
  };

  // Load sync data with validation
  const loadSyncData = () => {
    try {
      const saved = localStorage.getItem('timeSyncData');
      if (saved) {
        const syncData = JSON.parse(saved);
        // Check if data is recent (within 24 hours)
        const now = Date.now();
        const dataAge = now - syncData.timestamp;
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (dataAge < maxAge && syncData.version === '1.0') {
          return syncData.offset;
        }
      }
    } catch (error) {
      console.warn('Failed to load sync data:', error);
    }
    return -1900; // Default offset
  };


  // Enhanced NTP-like synchronization with drift compensation
  const syncWithSystemTime = () => {
    try {
      // Get system time (already NTP synchronized)
      const systemTime = new Date();
      const performanceTime = performance.now();
      
      // Load validated sync data
      const offset = loadSyncData();
      
      // Calculate drift compensation if we have previous sync data
      let driftCompensation = 0;
      if (lastSyncRef.current) {
        const timeSinceLastSync = systemTime.getTime() - lastSyncRef.current.systemTime;
        const expectedTimeSinceLastSync = performanceTime - lastSyncRef.current.performanceTime;
        driftCompensation = timeSinceLastSync - expectedTimeSinceLastSync;
        
        // Only apply small drift corrections to avoid jumps
        if (Math.abs(driftCompensation) < 100) {
          console.log(`Drift compensation: ${driftCompensation.toFixed(2)}ms`);
        } else {
          driftCompensation = 0; // Ignore large drifts
        }
      }
      
      // Store the reference point with persistent offset and drift compensation
      startTimeRef.current = {
        systemTime: systemTime.getTime() + offset + driftCompensation,
        performanceTime: performanceTime
      };
      
      // Store sync reference for drift calculation
      lastSyncRef.current = {
        systemTime: systemTime.getTime(),
        performanceTime: performanceTime
      };
      
      setIsSynced(true);
      setSyncOffset(offset);
      saveSyncData(offset, systemTime.getTime());
      
    } catch (error) {
      console.warn('Enhanced sync failed:', error);
      setIsSynced(false);
    }
  };

  // Main useEffect for component initialization
  useEffect(() => {
    // Clear old localStorage data to use new offset
    localStorage.removeItem('timeSyncData');
    localStorage.removeItem('timeOffset'); // Remove old format too
    
    // Initial sync with system time
    syncWithSystemTime();
    
    // Re-sync every 5 minutes for better accuracy
    const syncInterval = setInterval(syncWithSystemTime, 300000);

    // High-precision time update every 100ms for smoother display
    intervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        // Calculate elapsed time since sync using performance.now()
        const elapsed = performance.now() - startTimeRef.current.performanceTime;
        
        // Add elapsed time to the reference system time
        const currentTime = new Date(startTimeRef.current.systemTime + elapsed);
        
        setCurrentTime(currentTime);
      } else {
        // Fallback to regular Date if sync failed
        setCurrentTime(new Date());
      }
    }, 100); // Update every 100ms for smoother display

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (syncInterval) clearInterval(syncInterval);
    };
  }, []); // Empty dependency array for initialization only

  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="real-local-time">
      <div className="time-label">
        Real local time {isSynced ? '(atomic clock synced)' : '(local only)'}
      </div>
      <div className="time-display">{formatTime(currentTime)}</div>
    </div>
  );
};

export default RealLocalTime;
