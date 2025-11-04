import React, { useState, useEffect, useRef, useCallback } from 'react';
import './AttackPlanner.css';
import SaveModal from './modals/SaveModal';

const AttackPlanner = () => {
  const [travelTime, setTravelTime] = useState(() => {
    try {
      const saved = localStorage.getItem('attackPlanner_travelTime');
      return saved ? JSON.parse(saved) : { hours: 0, minutes: 0, seconds: 0 };
    } catch {
      return { hours: 0, minutes: 0, seconds: 0 };
    }
  });
  const [arrivalTime, setArrivalTime] = useState(() => {
    try {
      const saved = localStorage.getItem('attackPlanner_arrivalTime');
      return saved ? JSON.parse(saved) : { hours: 0, minutes: 0, seconds: 0 };
    } catch {
      return { hours: 0, minutes: 0, seconds: 0 };
    }
  });
  const [attackType, setAttackType] = useState(() => {
    try {
      const saved = localStorage.getItem('attackPlanner_attackType');
      return saved || 'Fake';
    } catch {
      return 'Fake';
    }
  });
  const [villageName, setVillageName] = useState(() => {
    try {
      const saved = localStorage.getItem('attackPlanner_villageName');
      return saved || '';
    } catch {
      return '';
    }
  });
  const [selectedDate, setSelectedDate] = useState(() => {
    try {
      const saved = localStorage.getItem('attackPlanner_selectedDate');
      return saved || '';
    } catch {
      return '';
    }
  });
  const [travianLink, setTravianLink] = useState(() => {
    try {
      const saved = localStorage.getItem('attackPlanner_travianLink');
      return saved || '';
    } catch {
      return '';
    }
  });
  const [serverOffsetHours, setServerOffsetHours] = useState(() => {
    try {
      // Prefer hours; migrate old seconds if present
      const hoursSaved = localStorage.getItem('attackPlanner_serverOffsetHours');
      if (hoursSaved !== null) return String(hoursSaved);
      const secondsSaved = localStorage.getItem('attackPlanner_serverOffsetSeconds');
      if (secondsSaved !== null) {
        const hrs = parseFloat(secondsSaved) / 3600;
        return Number.isFinite(hrs) ? String(hrs) : '';
      }
      return '';
    } catch {
      return '';
    }
  });
  const [attacks, setAttacks] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isFormBlinking, setIsFormBlinking] = useState(false);
  const [originalValues, setOriginalValues] = useState(null);
  const [isEditDirty, setIsEditDirty] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [isFormCollapsed, setIsFormCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('attackPlanner_isCollapsed');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });
  
  // Persisted collapse state only; do not auto-expand when empty
  const dateInputRef = useRef(null);

  // Persist collapsed state
  useEffect(() => {
    try {
      localStorage.setItem('attackPlanner_isCollapsed', JSON.stringify(isFormCollapsed));
    } catch {}
  }, [isFormCollapsed]);

  // Helper function to get today's date
  const getTodayDate = () => {
    const now = new Date();
    // Use local time instead of UTC
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    return today;
  };

  // Load attacks from localStorage on component mount
  useEffect(() => {
    const savedAttacks = localStorage.getItem('attackPlans');
    if (savedAttacks) {
      try {
        const parsedAttacks = JSON.parse(savedAttacks);
        if (Array.isArray(parsedAttacks)) {
          setAttacks(parsedAttacks);
        } else {
          // Invalid shape -> clear and reset
          localStorage.removeItem('attackPlans');
          setAttacks([]);
        }
      } catch (error) {
        // Failed to load saved attacks -> clear invalid data
        localStorage.removeItem('attackPlans');
      }
    }
  }, []);

  // Set date to today's date on component mount if not already set
  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(getTodayDate());
    }
  }, [selectedDate]);

  // Save form values to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('attackPlanner_travelTime', JSON.stringify(travelTime));
  }, [travelTime]);

  useEffect(() => {
    localStorage.setItem('attackPlanner_arrivalTime', JSON.stringify(arrivalTime));
  }, [arrivalTime]);

  useEffect(() => {
    localStorage.setItem('attackPlanner_attackType', attackType);
  }, [attackType]);

  useEffect(() => {
    localStorage.setItem('attackPlanner_villageName', villageName);
  }, [villageName]);

  useEffect(() => {
    localStorage.setItem('attackPlanner_selectedDate', selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    localStorage.setItem('attackPlanner_travianLink', travianLink);
  }, [travianLink]);
  
  useEffect(() => {
    // Persist hours as a normalized numeric string
    const num = parseFloat(String(serverOffsetHours).replace(/,/g, '.'));
    if (!Number.isNaN(num)) {
      localStorage.setItem('attackPlanner_serverOffsetHours', String(num));
    } else {
      localStorage.removeItem('attackPlanner_serverOffsetHours');
    }
  }, [serverOffsetHours]);

  // Save attacks to localStorage whenever attacks change (store without volatile countdown)
  useEffect(() => {
    try {
      const stored = attacks.map(a => ({
        id: a.id,
        villageName: a.villageName || '',
        date: a.date,
        travelTime: a.travelTime,
        arrivalTime: a.arrivalTime,
        sendTime: a.sendTime,
        attackType: a.attackType,
        travianLink: a.travianLink || '',
        sent: !!a.sent,
      }));
      localStorage.setItem('attackPlans', JSON.stringify(stored));
    } catch {}
  }, [attacks]);

  // Get atomic "now" using TimeIsClock displayed time
  const getAtomicNow = () => {
    // Get time from TimeIsClock widget
    const timeIsClockSpan = document.getElementById('_z734');
    if (timeIsClockSpan && timeIsClockSpan.textContent) {
      const timeText = timeIsClockSpan.textContent.trim();
      // Parse time string (format: HH:MM:SS)
      const timeMatch = timeText.match(/(\d{2}):(\d{2}):(\d{2})/);
      if (timeMatch) {
        const hours = parseInt(timeMatch[1], 10);
        const minutes = parseInt(timeMatch[2], 10);
        const seconds = parseInt(timeMatch[3], 10);
        
        // Create a date object for today with this time
        const now = new Date();
        const atomicDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          hours,
          minutes,
          seconds,
          0
        );
        
        // Ensure we're using the current day (time.is widget always shows current time)
        // If somehow the time is way off, we'll use the current date
        const currentTime = now.getTime();
        const atomicTime = atomicDate.getTime();
        
        // If atomic time is more than 12 hours in the past or future, adjust the date
        // This handles edge cases but shouldn't normally happen with time.is widget
        const diffMs = atomicTime - currentTime;
        if (Math.abs(diffMs) > 12 * 60 * 60 * 1000) {
          // Adjust by one day if needed
          if (diffMs < -12 * 60 * 60 * 1000) {
            atomicDate.setDate(atomicDate.getDate() + 1);
          } else if (diffMs > 12 * 60 * 60 * 1000) {
            atomicDate.setDate(atomicDate.getDate() - 1);
          }
        }
        
        return atomicDate;
      }
    }
    
    // Fallback to old method if TimeIsClock not available
    const offsetSeconds = parseFloat(localStorage.getItem('userTimeOffsetSeconds')) || 0;
    const serverHours =
      parseFloat(localStorage.getItem('attackPlanner_serverOffsetHours')) || 0;
    const offsetMs = Math.round(offsetSeconds * 1000);
    const serverMs = Math.round((serverHours * 3600) * 1000);
    return new Date(Date.now() + offsetMs + serverMs);
  };

  // Create a local date (midnight in local timezone) from YYYY-MM-DD
  const makeLocalDate = (dateString) => {
    if (!dateString) return new Date();
    const [y, m, d] = String(dateString).split('-').map((v) => parseInt(v, 10));
    if (Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(d)) {
      return new Date(y, (m || 1) - 1, d || 1);
    }
    return new Date();
  };

  // Read server offset (hours) and adjust a time object (HH:MM:SS) by it
  const getServerOffsetHours = () => {
    return parseFloat(localStorage.getItem('attackPlanner_serverOffsetHours')) || 0;
  };

  // Convert a server-time HH:MM:SS object into local HH:MM:SS by subtracting server offset
  const toLocalFromServerTime = (time) => {
    if (!time || typeof time.hours === 'undefined') return time;
    const offsetH = getServerOffsetHours();
    if (!offsetH) return time;
    const baseMs =
      (parseInt(time.hours || 0, 10) * 3600 +
        parseInt(time.minutes || 0, 10) * 60 +
        parseInt(time.seconds || 0, 10)) * 1000;
    const shiftedMs =
      ((baseMs - offsetH * 3600 * 1000) % (24 * 3600 * 1000) + (24 * 3600 * 1000)) %
      (24 * 3600 * 1000);
    const h = Math.floor(shiftedMs / 3600_000);
    const m = Math.floor((shiftedMs % 3600_000) / 60_000);
    const s = Math.floor((shiftedMs % 60_000) / 1000);
    return { hours: h, minutes: m, seconds: s };
  };

  // No longer adjusting displayed send time; keep helper removed


  const calculateCountdown = useCallback((travelTime, arrivalTime, date) => {
    // Get current atomic time (using the same offset as RealLocalTime)
    const atomicTime = getAtomicNow();
    
    // Build absolute timestamps using pure arithmetic to avoid DST pitfalls
    const arrivalBase = makeLocalDate(date).getTime(); // local midnight
    const arrivalMs =
      arrivalBase +
      ((parseInt(arrivalTime.hours || 0, 10) * 3600 +
        parseInt(arrivalTime.minutes || 0, 10) * 60 +
        parseInt(arrivalTime.seconds || 0, 10)) * 1000);
    const travelMs =
      ((parseInt(travelTime.hours || 0, 10) * 3600 +
        parseInt(travelTime.minutes || 0, 10) * 60 +
        parseInt(travelTime.seconds || 0, 10)) * 1000);
    const sendMs = arrivalMs - travelMs;
    
    // Calculate time until send
    const timeUntilSend = sendMs - atomicTime.getTime();
    
    if (timeUntilSend <= 0) {
      return '00:00:00';
    }
    
    // Use ceil to avoid early drop to zero within the last 1s
    const totalSeconds = Math.ceil(timeUntilSend / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(hours >= 100 ? 3 : 2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Update countdowns frequently to stay perfectly in sync with TimeIsClock
  useEffect(() => {
    let intervalId;
    let observer;
    let updateTimeout;
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      setAttacks(prevAttacks => 
        prevAttacks.map(attack => {
          const travelTime = attack.travelTime || attack.launchTime || { hours: 0, minutes: 0, seconds: 0 };
          const arrivalTime = attack.arrivalTime || { hours: 0, minutes: 0, seconds: 0 };
          const attackDate = attack.date || new Date().toISOString().split('T')[0];
          return {
            ...attack,
            countdown: calculateCountdown(travelTime, arrivalTime, attackDate)
          };
        })
      );
    };

    // Watch TimeIsClock for updates and trigger countdown recalculation
    const timeIsClockSpan = document.getElementById('_z734');
    if (timeIsClockSpan) {
      observer = new MutationObserver(() => {
        // Small delay to ensure we read the final adjusted time after TimeIsClock updates
        if (updateTimeout) clearTimeout(updateTimeout);
        updateTimeout = setTimeout(() => {
          tick();
        }, 50);
      });
      
      observer.observe(timeIsClockSpan, {
        childList: true,
        characterData: true,
        subtree: true
      });
    }

    // Also update frequently (every 250ms) as backup
    tick(); // Initial tick
    intervalId = setInterval(tick, 0);

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
      if (observer) observer.disconnect();
      if (updateTimeout) clearTimeout(updateTimeout);
    };
  }, [calculateCountdown]);

  const validateAttackInput = (travelTime, arrivalTime, date) => {
    // Get current atomic time (using the same offset as RealLocalTime)
    const atomicTime = getAtomicNow();
    
    const arrivalBase = makeLocalDate(date).getTime();
    const arrivalMs =
      arrivalBase +
      ((parseInt(arrivalTime.hours || 0, 10) * 3600 +
        parseInt(arrivalTime.minutes || 0, 10) * 60 +
        parseInt(arrivalTime.seconds || 0, 10)) * 1000);
    const travelMs =
      ((parseInt(travelTime.hours || 0, 10) * 3600 +
        parseInt(travelTime.minutes || 0, 10) * 60 +
        parseInt(travelTime.seconds || 0, 10)) * 1000);
    const sendMs = arrivalMs - travelMs;
    
    // Calculate time until send
    const timeUntilSend = sendMs - atomicTime.getTime();
    
    if (timeUntilSend <= 0) {
      return {
        isValid: false,
        message: "Invalid time/date combination. Please check your arrival time and travel time."
      };
    }
    
    return { isValid: true };
  };

  const handleAddAttack = () => {
    // Validate input before adding
    const validation = validateAttackInput(travelTime, arrivalTime, selectedDate);
    
    if (!validation.isValid) {
      setErrorMessage(validation.message);
      setShowErrorModal(true);
      return;
    }
    
    // Calculate send time (arrival - travel time)
    const arrivalBase = makeLocalDate(selectedDate).getTime();
    const arrivalMs =
      arrivalBase +
      ((parseInt(arrivalTime.hours || 0, 10) * 3600 +
        parseInt(arrivalTime.minutes || 0, 10) * 60 +
        parseInt(arrivalTime.seconds || 0, 10)) * 1000);
    const travelMs =
      ((parseInt(travelTime.hours || 0, 10) * 3600 +
        parseInt(travelTime.minutes || 0, 10) * 60 +
        parseInt(travelTime.seconds || 0, 10)) * 1000);
    const sendMs = arrivalMs - travelMs;
    const sendDate = new Date(sendMs);
    const sendTime = {
      hours: sendDate.getHours(),
      minutes: sendDate.getMinutes(),
      seconds: sendDate.getSeconds()
    };
    
    const newAttack = {
      id: Date.now(),
      villageName: villageName.trim(),
      date: selectedDate,
      travelTime: { ...travelTime },
      arrivalTime: { ...arrivalTime },
      sendTime: sendTime,
      sendDate: (() => { const y = sendDate.getFullYear(); const m = String(sendDate.getMonth()+1).padStart(2,'0'); const d = String(sendDate.getDate()).padStart(2,'0'); return `${y}-${m}-${d}`; })(),
      attackType,
      travianLink: travianLink.trim(),
      countdown: calculateCountdown(travelTime, arrivalTime, selectedDate),
      sent: false
    };
    
    setAttacks(prev => [...prev, newAttack]);
    
    // Reset form
    setTravelTime({ hours: 0, minutes: 0, seconds: 0 });
    setAttackType('Fake');
    setTravianLink('');
  };

  const handleSent = (id) => {
    setAttacks(prev => prev.map(attack => 
      attack.id === id ? { ...attack, sent: true } : attack
    ));
  };

  const handleEdit = (attack) => {
    // Store original values before editing
    setOriginalValues({
      travelTime: { ...travelTime },
      arrivalTime: { ...arrivalTime },
      attackType: attackType,
      villageName: villageName,
      selectedDate: selectedDate,
      travianLink: travianLink
    });
    
    setEditMode(true);
    setEditingId(attack.id);
    setTravelTime(attack.travelTime);
    setArrivalTime(attack.arrivalTime);
    setAttackType(attack.attackType);
    setVillageName(attack.villageName || '');
    setSelectedDate(attack.date || getTodayDate());
    setTravianLink(attack.travianLink || '');
    setIsEditDirty(false);
    
    // Trigger blink effect - keep it active while in edit mode
    setIsFormBlinking(true);
  };

  const handleDelete = (id) => {
    setAttacks(prev => prev.filter(attack => attack.id !== id));
  };

  const handleDeleteAll = () => {
    setShowDeleteAllModal(true);
  };

  const confirmDeleteAll = () => {
    setAttacks([]);
    setEditMode(false);
    setEditingId(null);
    setIsEditDirty(false);
    setShowDeleteAllModal(false);
  };

  const cancelDeleteAll = () => {
    setShowDeleteAllModal(false);
  };

  const handleSaveEdit = () => {
    // Validate input before saving
    const validation = validateAttackInput(travelTime, arrivalTime, selectedDate);
    
    if (!validation.isValid) {
      setErrorMessage(validation.message);
      setShowErrorModal(true);
      return;
    }
    
    // Calculate new send time
    const arrivalBase = makeLocalDate(selectedDate).getTime();
    const arrivalMs =
      arrivalBase +
      ((parseInt(arrivalTime.hours || 0, 10) * 3600 +
        parseInt(arrivalTime.minutes || 0, 10) * 60 +
        parseInt(arrivalTime.seconds || 0, 10)) * 1000);
    const travelMs =
      ((parseInt(travelTime.hours || 0, 10) * 3600 +
        parseInt(travelTime.minutes || 0, 10) * 60 +
        parseInt(travelTime.seconds || 0, 10)) * 1000);
    const sendMs = arrivalMs - travelMs;
    const sendDate = new Date(sendMs);
    const sendTime = {
      hours: sendDate.getHours(),
      minutes: sendDate.getMinutes(),
      seconds: sendDate.getSeconds()
    };
    
    setAttacks(prev => prev.map(attack => 
      attack.id === editingId ? {
        ...attack,
        villageName: villageName.trim(),
        date: selectedDate,
        travelTime: { ...travelTime },
        arrivalTime: { ...arrivalTime },
        sendTime: sendTime,
        sendDate: (() => { const y = sendDate.getFullYear(); const m = String(sendDate.getMonth()+1).padStart(2,'0'); const d = String(sendDate.getDate()).padStart(2,'0'); return `${y}-${m}-${d}`; })(),
        attackType,
        travianLink: travianLink.trim(),
        countdown: calculateCountdown(travelTime, arrivalTime, selectedDate)
      } : attack
    ));
    
    // Keep edit mode active and show save notification
    setIsEditDirty(false);
    setShowSaveNotification(true);
    
    // Keep the current cell editable - don't restore original values
    // User can continue editing until they click Exit or Edit another cell
    // Don't clear editingId - this keeps the cell in edit mode
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditingId(null);
    setIsFormBlinking(false); // Stop the blinking effect
    setIsEditDirty(false);
    
    // Restore original values
    if (originalValues) {
      setTravelTime(originalValues.travelTime);
      setArrivalTime(originalValues.arrivalTime);
      setAttackType(originalValues.attackType);
      setVillageName(originalValues.villageName);
      setSelectedDate(originalValues.selectedDate);
      setTravianLink(originalValues.travianLink);
      setOriginalValues(null);
    } else {
      // Fallback to default values if no original values stored
      setTravelTime({ hours: 0, minutes: 0, seconds: 0 });
      setArrivalTime({ hours: 0, minutes: 0, seconds: 0 });
      setAttackType('Fake');
      setVillageName('');
      setSelectedDate(getTodayDate());
      setTravianLink('');
    }
  };

  const getAttackTypeClassName = (attackType) => {
    switch (attackType) {
      case 'Fake':
        return 'attack-type-fake';
      case 'Attack':
        return 'attack-type-attack';
      case 'Pre-conquer':
        return 'attack-type-pre-conquer';
      case 'Conquer':
        return 'attack-type-conquer';
      default:
        return '';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const formatDateWithoutYear = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}.${month}`;
  };

  // Compute send date (YYYY-MM-DD) from arrival date + arrival time - travel time
  const getSendDateString = (attack) => {
    if (!attack) return '';
    const arrivalBase = makeLocalDate(attack.date).getTime();
    const arrivalMs =
      arrivalBase +
      ((parseInt(attack.arrivalTime?.hours || 0, 10) * 3600 +
        parseInt(attack.arrivalTime?.minutes || 0, 10) * 60 +
        parseInt(attack.arrivalTime?.seconds || 0, 10)) * 1000);
    const travelMs =
      ((parseInt(attack.travelTime?.hours || 0, 10) * 3600 +
        parseInt(attack.travelTime?.minutes || 0, 10) * 60 +
        parseInt(attack.travelTime?.seconds || 0, 10)) * 1000);
    const sendMs = arrivalMs - travelMs;
    const d = new Date(sendMs);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  };

  const formatTime = (time) => {
    if (!time || typeof time.hours === 'undefined') {
      return '00:00:00';
    }
    return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}:${time.seconds.toString().padStart(2, '0')}`;
  };

  // Check if countdown is urgent (1 minute or less)
  const isCountdownUrgent = (countdown) => {
    if (!countdown || countdown === '00:00:00') return false;
    const parts = countdown.split(':');
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    const seconds = parseInt(parts[2]) || 0;
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    return totalSeconds <= 60;
  };

  // Sort attacks by countdown (lowest countdown first) - expired attacks at bottom
  const sortAttacksByCountdown = (attacks) => {
    return [...attacks].sort((a, b) => {
      // Parse countdown strings (e.g., "25:15:28" or "00:00:00")
      const parseCountdown = (countdown) => {
        if (!countdown || countdown === '00:00:00') {
          return Infinity; // Put expired attacks at the bottom
        }
        const parts = countdown.split(':');
        const hours = parseInt(parts[0]) || 0;
        const minutes = parseInt(parts[1]) || 0;
        const seconds = parseInt(parts[2]) || 0;
        return hours * 3600 + minutes * 60 + seconds;
      };
      
      const aTime = parseCountdown(a.countdown);
      const bTime = parseCountdown(b.countdown);
      
      // If both are expired (both Infinity), maintain original order by ID
      if (aTime === Infinity && bTime === Infinity) {
        return a.id - b.id; // Sort by ID to maintain original insertion order
      }
      
      return aTime - bTime; // Sort ascending (active first, expired at bottom)
    });
  };

  return (
    <>
      <div className="attack-content">
      
      <div className="attack-planner-header">
        {(() => {
          const urgentSorted = sortAttacksByCountdown(attacks).filter(a => isCountdownUrgent(a.countdown) && a.countdown !== '00:00:00');
          const headerAttack = urgentSorted.length ? urgentSorted[0] : null;
          if (!headerAttack) {
            return (
              <h1 className="new-rocker">Attack Planner</h1>
            );
          }
          return (
            <div className="header-content">
              <div className="header-left">
                <span className="header-village new-rocker">{headerAttack.villageName || '-'}</span>
              </div>
              <div className="header-center">
                <strong className="header-send-time">{formatTime(toLocalFromServerTime(headerAttack.sendTime || headerAttack.launchTime || { hours: 0, minutes: 0, seconds: 0 }))}</strong>
              </div>
              
            </div>
          );
        })()}
        <button
          className={`attack-planner-toggle ${attacks.length === 0 ? 'disabled' : ''}`}
          onClick={() => setIsFormCollapsed(prev => !prev)}
          disabled={attacks.length === 0}
          aria-label={isFormCollapsed ? 'Expand planner' : 'Collapse planner'}
          title={isFormCollapsed ? 'Expand' : 'Collapse'}
        >
          {isFormCollapsed ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          )}
        </button>
      </div>
      <div className={`attack-planner ${editingId ? 'editing' : ''} ${isFormCollapsed ? 'collapsed' : ''}`}>
        <div className={`attack-form ${isFormBlinking ? 'blinking' : ''} ${isFormCollapsed ? 'collapsed' : ''}`}>
        
        {/* Row 1: Village Name and Date */}
        <div className="form-row">
          <div className="form-group column-group">
            <input
              type="text"
              value={villageName}
              onChange={(e) => { setVillageName(e.target.value); if (editMode) setIsEditDirty(true); }}
              placeholder="Your village name"
              className="village-input"
              disabled={editMode && !editingId}
            />
            <div 
              className={`date-input-wrapper ${editMode && !editingId ? 'disabled' : ''}`}
              onClick={() => {
                if (!editMode || editingId) {
                  if (dateInputRef.current) {
                    dateInputRef.current.showPicker();
                  }
                }
              }}
            >
              <input
                ref={dateInputRef}
                type="date"
                value={selectedDate}
                onChange={(e) => { setSelectedDate(e.target.value); if (editMode) setIsEditDirty(true); }}
                className="date-input-hidden"
                disabled={editMode && !editingId}
              />
              <div className="date-display">
                {formatDate(selectedDate)}
                <svg className="calendar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Row 2: Travel Time and Arrival */}
        <div className="form-row">
          <div className="form-group">
            <span className="time-label">Travel Time:</span>
            <div className="time-inputs">
              <input
                type="number"
                min="0"
                value={travelTime.hours}
                onChange={(e) => { const val = parseInt(e.target.value) || 0; setTravelTime(prev => ({ ...prev, hours: val })); setIsEditDirty(true); }}
                placeholder="HH"
                style={{ appearance: 'textfield' }}
                disabled={editMode && !editingId}
              />
              <span>:</span>
              <input
                type="number"
                min="0"
                max="59"
                value={travelTime.minutes}
                onChange={(e) => { 
                  const val = parseInt(e.target.value) || 0; 
                  const clampedVal = Math.min(Math.max(val, 0), 59);
                  setTravelTime(prev => ({ ...prev, minutes: clampedVal })); 
                  setIsEditDirty(true); 
                }}
                placeholder="MM"
                style={{ appearance: 'textfield' }}
                disabled={editMode && !editingId}
              />
              <span>:</span>
              <input
                type="number"
                min="0"
                max="59"
                value={travelTime.seconds}
                onChange={(e) => { 
                  const val = parseInt(e.target.value) || 0; 
                  const clampedVal = Math.min(Math.max(val, 0), 59);
                  setTravelTime(prev => ({ ...prev, seconds: clampedVal })); 
                  setIsEditDirty(true); 
                }}
                placeholder="SS"
                style={{ appearance: 'textfield' }}
                disabled={editMode && !editingId}
              />
            </div>
          </div>
          
           <div className="form-group">
             <span className="time-label">Arrival Time:</span>
             <div className="time-inputs">
               <input
                 type="number"
                 min="0"
                 max="23"
                 value={arrivalTime.hours}
                 onChange={(e) => { 
                   const val = parseInt(e.target.value) || 0; 
                   const clampedVal = Math.min(Math.max(val, 0), 23);
                   setArrivalTime(prev => ({ ...prev, hours: clampedVal })); 
                   setIsEditDirty(true); 
                 }}
                 placeholder="HH"
                 style={{ appearance: 'textfield' }}
                 disabled={editMode && !editingId}
               />
               <span>:</span>
               <input
                 type="number"
                 min="0"
                 max="59"
                 value={arrivalTime.minutes}
                 onChange={(e) => { 
                   const val = parseInt(e.target.value) || 0; 
                   const clampedVal = Math.min(Math.max(val, 0), 59);
                   setArrivalTime(prev => ({ ...prev, minutes: clampedVal })); 
                   setIsEditDirty(true); 
                 }}
                 placeholder="MM"
                 style={{ appearance: 'textfield' }}
                 disabled={editMode && !editingId}
               />
               <span>:</span>
               <input
                 type="number"
                 min="0"
                 max="59"
                 value={arrivalTime.seconds}
                 onChange={(e) => { 
                   const val = parseInt(e.target.value) || 0; 
                   const clampedVal = Math.min(Math.max(val, 0), 59);
                   setArrivalTime(prev => ({ ...prev, seconds: clampedVal })); 
                   setIsEditDirty(true); 
                 }}
                 placeholder="SS"
                 style={{ appearance: 'textfield' }}
                 disabled={editMode && !editingId}
               />
            </div>
          </div>
        </div>
        
        {/* Row 3: Attack Type Grid */}
        <div className="form-row">
          <div className="form-group">
            <div className="type-buttons-grid">
              <button
                className={`type-btn ${attackType === 'Fake' ? 'active' : ''}`}
                onClick={() => { setAttackType('Fake'); if (editMode) setIsEditDirty(true); }}
                disabled={editMode && !editingId}
              >
                Fake
              </button>
              <button
                className={`type-btn ${attackType === 'Pre-conquer' ? 'active' : ''}`}
                onClick={() => { setAttackType('Pre-conquer'); if (editMode) setIsEditDirty(true); }}
                disabled={editMode && !editingId}
              >
                Pre-conquer
              </button>
              <button
                className={`type-btn ${attackType === 'Attack' ? 'active' : ''}`}
                onClick={() => { setAttackType('Attack'); if (editMode) setIsEditDirty(true); }}
                disabled={editMode && !editingId}
              >
                Attack
              </button>
              <button
                className={`type-btn ${attackType === 'Conquer' ? 'active' : ''}`}
                onClick={() => { setAttackType('Conquer'); if (editMode) setIsEditDirty(true); }}
                disabled={editMode && !editingId}
              >
                Conquer
              </button>
            </div>
          </div>
        </div>
        </div>
        
        <div className={`form-buttons ${isFormCollapsed ? 'collapsed' : ''}`}>
          <div className="server-offset-group" title="Server time offset in hours (e.g., -1)">
            <span className="server-offset-label">Server offset (h):</span>
            <input
              type="text"
              value={serverOffsetHours}
              onChange={(e) => setServerOffsetHours(e.target.value)}
              placeholder="-1"
              className="server-offset-input"
            />
          </div>
          <div className="link-input-group">
            <input
              type="url"
              value={travianLink}
              onChange={(e) => { setTravianLink(e.target.value); if (editMode) setIsEditDirty(true); }}
              placeholder="Paste target link"
              className="link-input"
              disabled={editMode && !editingId}
            />
          </div>
          {editMode ? (
            <>
              <button className={`add-attack-btn ${!isEditDirty ? 'disabled' : ''}`} onClick={handleSaveEdit} disabled={!isEditDirty}>
                Save
              </button>
              <button className="cancel-btn" onClick={handleCancelEdit}>
                Exit Edit
              </button>
            </>
          ) : (
            <>
               <button 
                 className={`add-attack-btn ${!travelTime.hours && !travelTime.minutes && !travelTime.seconds ? 'disabled' : ''}`}
                 onClick={handleAddAttack}
                 disabled={!travelTime.hours && !travelTime.minutes && !travelTime.seconds}
               >
                 Add Attack
               </button>
              <button className="edit-btn" onClick={() => { setEditMode(true); setIsEditDirty(false); setEditingId(null); }}>
                Edit Mode
              </button>
            </>
          )}
        </div>
      
      {attacks.length > 0 && (
        <div className="attacks-table">
          <table>
            <thead>
              <tr>
                <th>Village</th>
                <th>Date</th>
                <th><strong>Send At</strong></th>
                <th>Travel Time</th>
                <th>Arrival</th>
                <th>Countdown</th>
                <th>Type</th>
                <th>Sent?</th>
                <th>Link</th>
                {editMode && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {sortAttacksByCountdown(attacks).map(attack => (
                <tr key={attack.id} className={`${attack.sent ? 'sent' : ''} ${editingId === attack.id ? 'editing' : ''}`}>
                  <td className={attack.countdown === '00:00:00' ? 'expired-attack' : ''}>{attack.villageName || '-'}</td>
                  <td className={attack.countdown === '00:00:00' ? 'expired-attack' : ''}>{formatDateWithoutYear(getSendDateString(attack))}</td>
                  <td className={attack.countdown === '00:00:00' ? 'expired-attack' : ''}>
                    {attack.countdown === '00:00:00' ? (
                      formatTime(toLocalFromServerTime(attack.sendTime || attack.launchTime || { hours: 0, minutes: 0, seconds: 0 }))
                    ) : (
                      <strong>{formatTime(toLocalFromServerTime(attack.sendTime || attack.launchTime || { hours: 0, minutes: 0, seconds: 0 }))}</strong>
                    )}
                  </td>
                  <td className={attack.countdown === '00:00:00' ? 'expired-attack' : ''}>{formatTime(attack.travelTime)}</td>
                  <td className={attack.countdown === '00:00:00' ? 'expired-attack' : ''}>{formatTime(attack.arrivalTime)}</td>
                  <td className={`${attack.countdown === '00:00:00' ? 'expired-attack' : ''} ${isCountdownUrgent(attack.countdown) ? 'countdown-urgent' : ''}`}>{attack.countdown}</td>
                  <td className={`${getAttackTypeClassName(attack.attackType)} ${attack.countdown === '00:00:00' ? 'expired-attack' : ''}`}>{attack.attackType}</td>
                  <td>
                    {!attack.sent ? (
                      <button 
                        className="sent-btn"
                        onClick={() => handleSent(attack.id)}
                        disabled={attack.countdown !== '00:00:00'}
                        style={{
                          opacity: attack.countdown !== '00:00:00' ? 0.5 : 1,
                          cursor: 'default'
                        }}
                        onMouseEnter={(e) => {
                          if (attack.countdown === '00:00:00') {
                            e.target.style.cursor = 'pointer';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.cursor = 'default';
                        }}
                      >
                        Ok
                      </button>
                    ) : (
                      <span className="sent-text">Sent</span>
                    )}
                  </td>
                  <td>
                    {attack.travianLink ? (
                      <button 
                        className="link-btn"
                        onClick={() => window.open(attack.travianLink, '_blank')}
                      >
                        Send
                      </button>
                    ) : (
                      <span className="no-link">-</span>
                    )}
                  </td>
                  {editMode && (
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="edit-row-btn"
                          onClick={() => handleEdit(attack)}
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDelete(attack.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {editMode && attacks.length > 0 && (
        <div className="delete-all-container">
          <button className="delete-all-btn" onClick={handleDeleteAll}>
            Delete All Attacks
          </button>
        </div>
      )}
      </div>
      </div>
      
      {/* Error Modal */}
      {showErrorModal && (
        <div className="error-modal-overlay" onClick={() => setShowErrorModal(false)}>
          <div className="error-modal" onClick={(e) => e.stopPropagation()}>
            <div className="error-modal-header">
              <h3>Invalid Input</h3>
            </div>
            <div className="error-modal-content">
              <p>{errorMessage}</p>
            </div>
            <div className="error-modal-footer">
              <button 
                className="error-modal-btn"
                onClick={() => setShowErrorModal(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Confirmation Modal */}
      {showDeleteAllModal && (
        <div className="error-modal-overlay" onClick={cancelDeleteAll}>
          <div className="error-modal" onClick={(e) => e.stopPropagation()}>
            <div className="error-modal-header">
              <h3>Delete All Attacks</h3>
            </div>
            <div className="error-modal-content">
              <p>Are you sure you want to delete all attacks? This action cannot be undone.</p>
            </div>
            <div className="error-modal-footer">
              <button 
                className="error-modal-btn cancel-btn"
                onClick={cancelDeleteAll}
              >
                Cancel
              </button>
              <button 
                className="error-modal-btn delete-btn"
                onClick={confirmDeleteAll}
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Save Notification */}
      <SaveModal
        isVisible={showSaveNotification}
        onClose={() => setShowSaveNotification(false)}
        message="Saved"
        duration={2000}
        position="bottom-middle"
      />
    </>
  );
};

export default AttackPlanner;
