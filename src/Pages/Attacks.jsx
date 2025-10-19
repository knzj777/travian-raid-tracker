import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import Report from '../Components/reports/Report';
import '../Components/reports/Report.css';
import Feed from '../Components/Feed';
import '../RaidTracker.css';
import './Attacks.css';

const Attacks = ({ settings, onSettingsOpen }) => {
  const [darkMode, setDarkMode] = useState(true);
  const [savedReports, setSavedReports] = useState({
    raids: [],
    attacks: [],
    scouts: []
  });
  const [expandedReport, setExpandedReport] = useState(null);
  const [currentReportIndex, setCurrentReportIndex] = useState(0);
  const [sortOrder, setSortOrder] = useState('newest');
  const [cardsPerRow, setCardsPerRow] = useState(3);

  // Load saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) setDarkMode(savedTheme === "dark");
  }, []);

  // Save theme
  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Load saved reports
  useEffect(() => {
    const saved = localStorage.getItem("savedReports");
    if (saved) {
      setSavedReports(JSON.parse(saved));
    }
  }, []);

  const openReportOverlay = (report) => {
    const sortedReports = getAttackReports();
    const reportIndex = sortedReports.findIndex(r => r.id === report.id);
    setExpandedReport(report);
    setCurrentReportIndex(reportIndex >= 0 ? reportIndex : 0);
  };

  const closeReportOverlay = () => {
    setExpandedReport(null);
    setCurrentReportIndex(0);
  };

  const handleReportNavigation = (newIndex) => {
    if (expandedReport) {
      const sortedReports = getAttackReports();
      if (newIndex >= 0 && newIndex < sortedReports.length) {
        setCurrentReportIndex(newIndex);
        setExpandedReport(sortedReports[newIndex]);
      }
    }
  };

  const handleDeleteReport = (reportType, reportId) => {
    setSavedReports(prev => {
      const newReports = { ...prev };
      newReports[reportType] = newReports[reportType].filter(r => r.id !== reportId);
      localStorage.setItem("savedReports", JSON.stringify(newReports));
      return newReports;
    });
  };

  const getAttackReports = () => {
    const reports = savedReports.attacks.map(r => ({ ...r, type: 'attack' }));
    
    // Sort reports
    return reports.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  };

  return (
    <div className={`app-container ${darkMode ? "dark" : "light"}`}>
      <Header darkMode={darkMode} setDarkMode={setDarkMode} onSettingsOpen={onSettingsOpen} />
      
      <div className="content" style={{ flex: "1" }}>
        <Feed
          reports={getAttackReports()}
          reportType="attack"
          title="Attack Reports"
          darkMode={darkMode}
          settings={settings}
          onDeleteReport={handleDeleteReport}
          onOpenReportOverlay={openReportOverlay}
          showFilters={true}
          showTypeFilter={false}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          cardsPerRow={cardsPerRow}
          onCardsPerRowChange={setCardsPerRow}
        />
      </div>

      {/* Report Overlay */}
      {expandedReport && (
        <div className="report-overlay" onClick={closeReportOverlay}>
          <div className="report-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeReportOverlay}>×</button>
            <Report
              reportData={expandedReport.data}
              reports={getAttackReports()}
              currentIndex={currentReportIndex}
              onNavigate={handleReportNavigation}
              isInOverlay={true}
              darkMode={darkMode}
              settings={settings}
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Attacks;