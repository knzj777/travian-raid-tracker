import React, { useState } from 'react';
import './AttackPlannerShare.css';
import SaveModal from './modals/SaveModal';

const AttackPlannerShare = ({ attacks, onImportAttacks }) => {
  const [pasteData, setPasteData] = useState('');
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [showImportNotification, setShowImportNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCopy = () => {
    if (attacks.length === 0) {
      setErrorMessage('No attacks to copy');
      setShowErrorNotification(true);
      return;
    }

    // Prepare data for export (without countdown and volatile data)
    const exportData = attacks.map(attack => ({
      villageName: attack.villageName || '',
      date: attack.date,
      travelTime: attack.travelTime,
      arrivalTime: attack.arrivalTime,
      sendTime: attack.sendTime,
      attackType: attack.attackType,
      travianLink: attack.travianLink || '',
      sent: attack.sent || false
    }));

    const jsonString = JSON.stringify(exportData, null, 2);
    
    // Copy to clipboard
    navigator.clipboard.writeText(jsonString).then(() => {
      setShowCopyNotification(true);
    }).catch(err => {
      console.error('Failed to copy:', err);
      setErrorMessage('Failed to copy to clipboard');
      setShowErrorNotification(true);
    });
  };

  const handleImport = () => {
    if (!pasteData.trim()) {
      setErrorMessage('Please paste data first');
      setShowErrorNotification(true);
      return;
    }

    try {
      const parsedData = JSON.parse(pasteData);
      
      if (!Array.isArray(parsedData)) {
        throw new Error('Invalid data format: expected an array');
      }

      // Validate each attack object
      const validatedAttacks = parsedData.map((attack, index) => {
        if (!attack.date || !attack.travelTime || !attack.arrivalTime) {
          throw new Error(`Invalid attack at index ${index}: missing required fields`);
        }

        // Validate time objects
        if (typeof attack.travelTime !== 'object' || 
            typeof attack.arrivalTime !== 'object' ||
            typeof attack.travelTime.hours === 'undefined' ||
            typeof attack.travelTime.minutes === 'undefined' ||
            typeof attack.travelTime.seconds === 'undefined' ||
            typeof attack.arrivalTime.hours === 'undefined' ||
            typeof attack.arrivalTime.minutes === 'undefined' ||
            typeof attack.arrivalTime.seconds === 'undefined') {
          throw new Error(`Invalid attack at index ${index}: invalid time format`);
        }

        // Create new attack with unique ID
        return {
          id: Date.now() + index, // Ensure unique IDs
          villageName: attack.villageName || '',
          date: attack.date,
          travelTime: {
            hours: parseInt(attack.travelTime.hours) || 0,
            minutes: parseInt(attack.travelTime.minutes) || 0,
            seconds: parseInt(attack.travelTime.seconds) || 0
          },
          arrivalTime: {
            hours: parseInt(attack.arrivalTime.hours) || 0,
            minutes: parseInt(attack.arrivalTime.minutes) || 0,
            seconds: parseInt(attack.arrivalTime.seconds) || 0
          },
          sendTime: attack.sendTime || { hours: 0, minutes: 0, seconds: 0 },
          attackType: attack.attackType || 'Fake',
          travianLink: attack.travianLink || '',
          sent: attack.sent || false,
          countdown: '00:00:00' // Will be recalculated by parent component
        };
      });

      // Import the attacks
      onImportAttacks(validatedAttacks);
      setPasteData('');
      setShowImportNotification(true);
    } catch (error) {
      console.error('Import error:', error);
      setErrorMessage(error.message || 'Invalid data format');
      setShowErrorNotification(true);
    }
  };

  return (
    <>
      <div className="attack-planner-share">
        <div className="share-section">
          <div className="share-header">
            <h3>Share Attacks</h3>
          </div>
          <div className="share-content">
            <div className="copy-section">
              <button 
                className="copy-btn"
                onClick={handleCopy}
                disabled={attacks.length === 0}
                title="Copy all attacks to clipboard"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Copy All
              </button>
            </div>
            <div className="paste-section">
              <textarea
                className="paste-input"
                value={pasteData}
                onChange={(e) => setPasteData(e.target.value)}
                placeholder="Paste attacks data here..."
                rows="3"
              />
              <button 
                className="import-btn"
                onClick={handleImport}
                disabled={!pasteData.trim()}
                title="Import attacks from pasted data"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                Import
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Copy Notification */}
      <SaveModal
        isVisible={showCopyNotification}
        onClose={() => setShowCopyNotification(false)}
        message="Attacks copied to clipboard!"
        duration={2000}
        position="bottom-middle"
      />

      {/* Import Notification */}
      <SaveModal
        isVisible={showImportNotification}
        onClose={() => setShowImportNotification(false)}
        message="Attacks imported successfully!"
        duration={2000}
        position="bottom-middle"
      />

      {/* Error Notification */}
      <SaveModal
        isVisible={showErrorNotification}
        onClose={() => setShowErrorNotification(false)}
        message={errorMessage}
        duration={3000}
        position="bottom-middle"
        progressColor="#dc3545"
      />
    </>
  );
};

export default AttackPlannerShare;

