import React, { useState, useEffect, useRef } from 'react';
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
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);
  
  // Auto-expand form when attacks become empty
  useEffect(() => {
    if (attacks.length === 0 && isFormCollapsed) {
      setIsFormCollapsed(false);
    }
  }, [attacks.length, isFormCollapsed]);
  const dateInputRef = useRef(null);

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
        setAttacks(parsedAttacks);
      } catch (error) {
        // Failed to load saved attacks
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

  // Save attacks to localStorage whenever attacks change
  useEffect(() => {
    localStorage.setItem('attackPlans', JSON.stringify(attacks));
  }, [attacks]);

  // Update countdowns every second
  useEffect(() => {
    const interval = setInterval(() => {
      setAttacks(prevAttacks => 
        prevAttacks.map(attack => {
          // Handle both old and new data structure
          const travelTime = attack.travelTime || attack.launchTime || { hours: 0, minutes: 0, seconds: 0 };
          const arrivalTime = attack.arrivalTime || { hours: 0, minutes: 0, seconds: 0 };
          const attackDate = attack.date || new Date().toISOString().split('T')[0];
          
          return {
            ...attack,
            countdown: calculateCountdown(travelTime, arrivalTime, attackDate)
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const calculateCountdown = (travelTime, arrivalTime, date) => {
    // Get current atomic time (using the same offset as RealLocalTime)
    const now = new Date();
    const atomicOffset = parseFloat(localStorage.getItem('userTimeOffsetMs')) || 0;
    const atomicTime = new Date(now.getTime() + atomicOffset);
    
    // Calculate send time (arrival - travel time) using the specified date
    const arrivalDate = new Date(date);
    arrivalDate.setHours(arrivalTime.hours, arrivalTime.minutes, arrivalTime.seconds, 0);
    
    const travelMs = (travelTime.hours * 3600 + travelTime.minutes * 60 + travelTime.seconds) * 1000;
    const sendDate = new Date(arrivalDate.getTime() - travelMs);
    
    // Calculate time until send
    const timeUntilSend = sendDate.getTime() - atomicTime.getTime();
    
    if (timeUntilSend <= 0) {
      return '00:00:00';
    }
    
    const totalSeconds = Math.floor(timeUntilSend / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(hours >= 100 ? 3 : 2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const validateAttackInput = (travelTime, arrivalTime, date) => {
    // Get current atomic time (using the same offset as RealLocalTime)
    const now = new Date();
    const atomicOffset = -1900; // Same offset as RealLocalTime
    const atomicTime = new Date(now.getTime() + atomicOffset);
    
    // Calculate send time (arrival - travel time) using the specified date
    const arrivalDate = new Date(date);
    arrivalDate.setHours(arrivalTime.hours, arrivalTime.minutes, arrivalTime.seconds, 0);
    
    const travelMs = (travelTime.hours * 3600 + travelTime.minutes * 60 + travelTime.seconds) * 1000;
    const sendDate = new Date(arrivalDate.getTime() - travelMs);
    
    // Calculate time until send
    const timeUntilSend = sendDate.getTime() - atomicTime.getTime();
    
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
    const arrivalDate = new Date(selectedDate);
    arrivalDate.setHours(arrivalTime.hours, arrivalTime.minutes, arrivalTime.seconds, 0);
    
    const travelMs = (travelTime.hours * 3600 + travelTime.minutes * 60 + travelTime.seconds) * 1000;
    const sendDate = new Date(arrivalDate.getTime() - travelMs);
    
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
    const arrivalDate = new Date(selectedDate);
    arrivalDate.setHours(arrivalTime.hours, arrivalTime.minutes, arrivalTime.seconds, 0);
    
    const travelMs = (travelTime.hours * 3600 + travelTime.minutes * 60 + travelTime.seconds) * 1000;
    const sendDate = new Date(arrivalDate.getTime() - travelMs);
    
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
                <strong className="header-send-time">{formatTime(headerAttack.sendTime || headerAttack.launchTime || { hours: 0, minutes: 0, seconds: 0 })}</strong>
              </div>
              <div className="header-right">
                <span className="header-countdown">{headerAttack.countdown}</span>
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
                  <td className={attack.countdown === '00:00:00' ? 'expired-attack' : ''}>{formatDateWithoutYear(attack.date)}</td>
                  <td className={attack.countdown === '00:00:00' ? 'expired-attack' : ''}>
                    {attack.countdown === '00:00:00' ? (
                      formatTime(attack.sendTime || attack.launchTime || { hours: 0, minutes: 0, seconds: 0 })
                    ) : (
                      <strong>{formatTime(attack.sendTime || attack.launchTime || { hours: 0, minutes: 0, seconds: 0 })}</strong>
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
      
      <div className="important-note"><p>The attack planner needs to be tested. Please perform test attacks beforehand.</p></div>
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
