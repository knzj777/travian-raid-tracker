import React, { useState, useEffect, useRef } from 'react';
import './AttackPlanner.css';

const AttackPlanner = () => {
  const [travelTime, setTravelTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [arrivalTime, setArrivalTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [attackType, setAttackType] = useState('Fake');
  const [villageName, setVillageName] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [travianLink, setTravianLink] = useState('');
  const [attacks, setAttacks] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isFormBlinking, setIsFormBlinking] = useState(false);
  const [originalValues, setOriginalValues] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
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
        console.warn('Failed to load saved attacks:', error);
      }
    }
  }, []);

  // Set date to today's date on component mount
  useEffect(() => {
    setSelectedDate(getTodayDate());
  }, []);

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
    setSelectedDate(getTodayDate());
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
    
    // Trigger blink effect - keep it active while in edit mode
    setIsFormBlinking(true);
  };

  const handleDelete = (id) => {
    setAttacks(prev => prev.filter(attack => attack.id !== id));
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
    
    setEditMode(false);
    setEditingId(null);
    setIsFormBlinking(false); // Stop the blinking effect
    
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

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditingId(null);
    setIsFormBlinking(false); // Stop the blinking effect
    
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

  // Sort attacks by countdown (lowest countdown first)
  const sortAttacksByCountdown = (attacks) => {
    return [...attacks].sort((a, b) => {
      // Parse countdown strings (e.g., "25:15:28" or "00:00:00")
      const parseCountdown = (countdown) => {
        if (!countdown || countdown === '00:00:00') {
          return Infinity; // Put expired attacks at the end
        }
        const parts = countdown.split(':');
        const hours = parseInt(parts[0]) || 0;
        const minutes = parseInt(parts[1]) || 0;
        const seconds = parseInt(parts[2]) || 0;
        return hours * 3600 + minutes * 60 + seconds;
      };
      
      const aTime = parseCountdown(a.countdown);
      const bTime = parseCountdown(b.countdown);
      
      return aTime - bTime; // Sort ascending (lowest first)
    });
  };

  return (
    <div className="attack-content">
      <div className="important-note"> <p> The attack planner needs to be tested. Please perform test attacks beforehand.</p></div>
      
      <h1 className="new-rocker">Attack planner</h1>
      <div className="attack-planner">
        <div className={`attack-form ${isFormBlinking ? 'blinking' : ''}`}>
        
        {/* Row 1: Village Name and Date */}
        <div className="form-row">
          <div className="form-group column-group">
            <input
              type="text"
              value={villageName}
              onChange={(e) => setVillageName(e.target.value)}
              placeholder="Your village name"
              className="village-input"
            />
            <div 
              className="date-input-wrapper"
              onClick={() => {
                if (dateInputRef.current) {
                  dateInputRef.current.showPicker();
                }
              }}
            >
              <input
                ref={dateInputRef}
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="date-input-hidden"
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
                max="23"
                value={travelTime.hours}
                onChange={(e) => setTravelTime(prev => ({ ...prev, hours: parseInt(e.target.value) || 0 }))}
                placeholder="HH"
                style={{ appearance: 'textfield' }}
              />
              <span>:</span>
              <input
                type="number"
                min="0"
                max="59"
                value={travelTime.minutes}
                onChange={(e) => setTravelTime(prev => ({ ...prev, minutes: parseInt(e.target.value) || 0 }))}
                placeholder="MM"
                style={{ appearance: 'textfield' }}
              />
              <span>:</span>
              <input
                type="number"
                min="0"
                max="59"
                value={travelTime.seconds}
                onChange={(e) => setTravelTime(prev => ({ ...prev, seconds: parseInt(e.target.value) || 0 }))}
                placeholder="SS"
                style={{ appearance: 'textfield' }}
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
                 onChange={(e) => setArrivalTime(prev => ({ ...prev, hours: parseInt(e.target.value) || 0 }))}
                 placeholder="HH"
                 style={{ appearance: 'textfield' }}
               />
               <span>:</span>
               <input
                 type="number"
                 min="0"
                 max="59"
                 value={arrivalTime.minutes}
                 onChange={(e) => setArrivalTime(prev => ({ ...prev, minutes: parseInt(e.target.value) || 0 }))}
                 placeholder="MM"
                 style={{ appearance: 'textfield' }}
               />
               <span>:</span>
               <input
                 type="number"
                 min="0"
                 max="59"
                 value={arrivalTime.seconds}
                 onChange={(e) => setArrivalTime(prev => ({ ...prev, seconds: parseInt(e.target.value) || 0 }))}
                 placeholder="SS"
                 style={{ appearance: 'textfield' }}
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
                onClick={() => setAttackType('Fake')}
              >
                Fake
              </button>
              <button
                className={`type-btn ${attackType === 'Pre-conquer' ? 'active' : ''}`}
                onClick={() => setAttackType('Pre-conquer')}
              >
                Pre-conquer
              </button>
              <button
                className={`type-btn ${attackType === 'Attack' ? 'active' : ''}`}
                onClick={() => setAttackType('Attack')}
              >
                Attack
              </button>
              <button
                className={`type-btn ${attackType === 'Conquer' ? 'active' : ''}`}
                onClick={() => setAttackType('Conquer')}
              >
                Conquer
              </button>
            </div>
          </div>
        </div>
        </div>
        
        <div className="form-buttons">
          <div className="link-input-group">
            <input
              type="url"
              value={travianLink}
              onChange={(e) => setTravianLink(e.target.value)}
              placeholder="Paste target link"
              className="link-input"
            />
          </div>
          {editMode ? (
            <>
              <button className="add-attack-btn" onClick={handleSaveEdit}>
                Save
              </button>
              <button className="cancel-btn" onClick={handleCancelEdit}>
                Cancel
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
              <button className="edit-btn" onClick={() => setEditMode(true)}>
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
                  <td>{attack.villageName || '-'}</td>
                  <td>{formatDateWithoutYear(attack.date)}</td>
                  <td><strong>{formatTime(attack.sendTime || attack.launchTime || { hours: 0, minutes: 0, seconds: 0 })}</strong></td>
                  <td>{formatTime(attack.travelTime)}</td>
                  <td>{formatTime(attack.arrivalTime)}</td>
                  <td>{attack.countdown}</td>
                  <td className={getAttackTypeClassName(attack.attackType)}>{attack.attackType}</td>
                  <td>
                    {!attack.sent ? (
                      <button 
                        className="sent-btn"
                        onClick={() => handleSent(attack.id)}
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
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3,6 5,6 21,6"/>
                            <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                            <line x1="10" y1="11" x2="10" y2="17"/>
                            <line x1="14" y1="11" x2="14" y2="17"/>
                          </svg>
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
      </div>
      
      {/* Error Modal */}
      {showErrorModal && (
        <div className="error-modal-overlay" onClick={() => setShowErrorModal(false)}>
          <div className="error-modal" onClick={(e) => e.stopPropagation()}>
            <div className="error-modal-header">
              <h3>Invalid Input</h3>
              <button 
                className="error-modal-close"
                onClick={() => setShowErrorModal(false)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
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
    </div>
  );
};

export default AttackPlanner;
