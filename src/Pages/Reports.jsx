import React, { useState, useEffect } from 'react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import AttackReport from '../Components/AttackReport';
import { parseAttackReport, validateAttackReport } from '../utils/attackReportParser';
import '../RaidTracker.css';
import './Reports.css';

const Reports = () => {
  const [inputText, setInputText] = useState('');
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(true);

  // Load saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) setDarkMode(savedTheme === "dark");
  }, []);

  // Save theme
  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const handleParseReport = () => {
    if (!inputText.trim()) {
      setError('Please paste the attack report text');
      return;
    }

    if (!validateAttackReport(inputText)) {
      setError('Invalid attack report format. Please ensure the text contains Attacker, Defender, and Statistics sections.');
      return;
    }

    try {
      const parsed = parseAttackReport(inputText);
      setReportData(parsed);
      setError('');
    } catch (err) {
      setError('Error parsing attack report: ' + err.message);
    }
  };

  const handleClear = () => {
    setInputText('');
    setReportData(null);
    setError('');
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    setInputText(text);
  };

  return (
    <div className={`app-container ${darkMode ? "dark" : "light"}`}>
      <Header darkMode={darkMode} setDarkMode={setDarkMode} />

      <div className="content" style={{ flex: "1" }}>
        <h1>Reports</h1>
        
        <div className="input-wrap">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onPaste={handlePaste}
            placeholder="Paste your attack report text here..."
            className="input-box"
          />
        </div>

        <div className="buttons">
          <button className="paste-btn" onClick={handleParseReport}>
            📋 Parse Report
          </button>
          <button className="reset-btn" onClick={handleClear}>
            🗑 Clear
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {reportData && (
          <div className="report-container">
            <AttackReport reportData={reportData} darkMode={darkMode} />
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Reports;