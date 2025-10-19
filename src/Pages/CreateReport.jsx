import React, { useState, useEffect } from 'react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import Report from '../Components/reports/Report';
import { parseAttackReport, validateAttackReport } from '../utils/attackReportParser';
import '../RaidTracker.css';
import './CreateReport.css';

const CreateReport = ({ settings, onSettingsOpen }) => {
  const [inputText, setInputText] = useState('');
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedReportInfo, setSavedReportInfo] = useState(null);
  const [autoCloseTimer, setAutoCloseTimer] = useState(null);
  const [progressWidth, setProgressWidth] = useState(100);
  const [isClosing, setIsClosing] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);

  // Load saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) setDarkMode(savedTheme === "dark");
  }, []);

  // Save theme
  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const handleParseReport = async () => {
    try {
      let textToParse = inputText.trim();

      // Always try to read from clipboard first
      try {
        const clipboardText = await navigator.clipboard.readText();
        if (clipboardText.trim()) {
          textToParse = clipboardText.trim();
        }
      } catch (clipboardErr) {
        // If clipboard access fails, continue with existing text
        console.log("Clipboard access failed, using existing text");
      }

      if (!textToParse) {
        setError('No text available to parse. Please paste a report or ensure clipboard has content.');
        return;
      }

      if (!validateAttackReport(textToParse)) {
        setError('Invalid report format. Please ensure the text contains Attacker, Defender, and Statistics sections.');
        return;
      }

      const parsed = parseAttackReport(textToParse);
      setReportData(parsed);
      setError('');
    } catch (err) {
      console.error("Failed to process input: ", err);
      setError('Error processing report: ' + err.message);
    }
  };

  const handleSaveReport = () => {
    if (!reportData) {
      setError('No report data to save');
      return;
    }

    try {
      // Check if report is already saved
      if (isReportDuplicate(reportData)) {
        const reportInfo = {
          type: reportData.header.type === 'scout' ? 'scout' : 'attack',
          title: reportData.header.originalTitle || `${reportData.header.attackerVillage} ${reportData.header.type === 'scout' ? 'scouts' : 'attacks'} ${reportData.header.defenderVillage}`,
          timestamp: new Date().toISOString()
        };
        
        setError('');
        showNotification(reportInfo, true); // true = is duplicate
        return;
      }

      const savedReports = JSON.parse(localStorage.getItem('savedReports') || '{"raids": [], "attacks": [], "scouts": []}');
      
      // Determine report type based on header
      const reportType = reportData.header.type === 'scout' ? 'scouts' : 'attacks';
      
      const newReport = {
        id: Date.now().toString(),
        type: reportData.header.type === 'scout' ? 'scout' : 'attack',
        data: reportData,
        timestamp: new Date().toISOString(),
        title: reportData.header.originalTitle || `${reportData.header.attackerVillage} ${reportData.header.type === 'scout' ? 'scouts' : 'attacks'} ${reportData.header.defenderVillage}`
      };
      
      savedReports[reportType].push(newReport);
      localStorage.setItem('savedReports', JSON.stringify(savedReports));
      
      // Set save confirmation info
      setSavedReportInfo({
        type: reportData.header.type === 'scout' ? 'scout' : 'attack',
        title: newReport.title,
        timestamp: newReport.timestamp
      });
      
      setError('');
      showNotification({
        type: reportData.header.type === 'scout' ? 'scout' : 'attack',
        title: newReport.title,
        timestamp: newReport.timestamp
      }, false); // false = not duplicate
    } catch (err) {
      console.error('Error saving report:', err);
      setError('Error saving report: ' + err.message);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    setInputText(text);
  };

  const handleClear = () => {
    setInputText('');
    setReportData(null);
    setError('');
  };

  const isReportDuplicate = (newReportData) => {
    try {
      const savedReports = JSON.parse(localStorage.getItem('savedReports') || '{"raids": [], "attacks": [], "scouts": []}');
      const reportType = newReportData.header.type === 'scout' ? 'scouts' : 'attacks';
      const existingReports = savedReports[reportType] || [];

      // Compare the entire report data structure
      return existingReports.some(existingReport => {
        const existingData = existingReport.data;
        
        // Compare key fields that make reports unique
        if (existingData.header.dateTime !== newReportData.header.dateTime) return false;
        if (existingData.header.attackerVillage !== newReportData.header.attackerVillage) return false;
        if (existingData.header.defenderVillage !== newReportData.header.defenderVillage) return false;
        if (existingData.header.type !== newReportData.header.type) return false;
        
        // Compare attacker info
        if (existingData.attacker?.player !== newReportData.attacker?.player) return false;
        if (existingData.attacker?.village !== newReportData.attacker?.village) return false;
        if (existingData.attacker?.tribe !== newReportData.attacker?.tribe) return false;
        
        // Compare defender info (check first defender)
        if (existingData.defenders?.[0]?.player !== newReportData.defenders?.[0]?.player) return false;
        if (existingData.defenders?.[0]?.village !== newReportData.defenders?.[0]?.village) return false;
        if (existingData.defenders?.[0]?.tribe !== newReportData.defenders?.[0]?.tribe) return false;
        
        // Compare bounty/resources
        if (existingData.bounty?.total !== newReportData.bounty?.total) return false;
        if (existingData.resources && newReportData.resources) {
          const existingTotal = existingData.resources.reduce((sum, val) => sum + (val || 0), 0);
          const newTotal = newReportData.resources.reduce((sum, val) => sum + (val || 0), 0);
          if (existingTotal !== newTotal) return false;
        }
        
        return true;
      });
    } catch (err) {
      console.error('Error checking for duplicates:', err);
      return false;
    }
  };

  const closeSaveModal = () => {
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      setAutoCloseTimer(null);
    }
    setIsClosing(true);
    
    // Wait for animation to complete before hiding
    setTimeout(() => {
      setShowSaveModal(false);
      setSavedReportInfo(null);
      setProgressWidth(100);
      setIsClosing(false);
      setIsDuplicate(false);
    }, 300); // Match CSS transition duration
  };

  const showNotification = (reportInfo, isDuplicateReport = false) => {
    setSavedReportInfo(reportInfo);
    setShowSaveModal(true);
    setProgressWidth(100);
    setIsClosing(false);
    setIsDuplicate(isDuplicateReport);
    
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgressWidth(prev => {
        if (prev <= 0) {
          clearInterval(progressInterval);
          return 0;
        }
        return prev - (100 / 30); // 3 seconds = 30 intervals of 100ms
      });
    }, 100);
    
    // Auto-close after 3 seconds
    const timer = setTimeout(() => {
      clearInterval(progressInterval);
      closeSaveModal();
    }, 3000);
    setAutoCloseTimer(timer);
  };

  return (
    <div className={`app-container ${darkMode ? "dark" : "light"}`}>
      <Header darkMode={darkMode} setDarkMode={setDarkMode} onSettingsOpen={onSettingsOpen} />

      <div className="content" style={{ flex: "1" }}>
        <h1>Create Report</h1>
        
        <div className="input-wrap">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onPaste={handlePaste}
            placeholder="Open your Travian report and press Ctrl+A to select all, then copy and paste it here..."
            className="input-box"
          />
        </div>

        <div className="buttons">
          <button className="paste-btn" onClick={handleParseReport}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
            </svg>
            Parse Report
          </button>
          <button className="reset-btn" onClick={handleClear}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3,6 5,6 21,6"/>
              <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
            Clear
          </button>
          <button className="save-btn" onClick={handleSaveReport} disabled={!reportData}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17,21 17,13 7,13 7,21"/>
              <polyline points="7,3 7,8 15,8"/>
            </svg>
            Save Report
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {reportData && (
          <div className="report-container">
            <Report reportData={reportData} darkMode={darkMode} settings={settings} />
          </div>
        )}
      </div>

      <Footer />

      {/* Save Notification */}
      {showSaveModal && savedReportInfo && (
        <div className={`save-notification ${isClosing ? 'closing' : ''}`}>
          <div className="notification-content">
            <span className="notification-text">
              {isDuplicate 
                ? `This report is already saved in ${savedReportInfo.type === 'scout' ? 'Scouts' : 'Attacks'}`
                : `Report saved to ${savedReportInfo.type === 'scout' ? 'Scouts' : 'Attacks'}`
              }
            </span>
            <button className="notification-close" onClick={closeSaveModal}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div className="notification-progress">
            <div 
              className={`progress-bar ${isDuplicate ? 'duplicate' : ''}`}
              style={{ width: `${progressWidth}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateReport;
