import React, { useState, useEffect } from "react";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import Graph from "./Components/Graph";
import LeaderboardTable from "./Components/LeaderboardTable";
import Report from "./Components/reports/Report";
import "./Components/reports/Report.css";
import "./RaidTracker.css";
import SaveModal from "./Components/modals/SaveModal";
import Feed from "./Components/Feed";
import RaidTrackerModule from "./Components/raid-tracker/RaidTrackerModule";

export default function RaidTracker({ 
  settings, 
  onSettingsOpen, 
  timerState, 
  darkMode, 
  setDarkMode,
  raidTrackerData,
  setRaidTrackerData,
  handlePaste,
  handleReset,
  handleSaveHistory,
  incrementHour,
  decrementHour,
  handleTimeChange,
  handleTimeBlur,
  applyCurrentRange
}) {
  const [savedReports, setSavedReports] = useState({
    raids: [],
    attacks: [],
    scouts: []
  });
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'
  const [expandedReport, setExpandedReport] = useState(null);
  const [currentReportIndex, setCurrentReportIndex] = useState(0);
  const [cardsPerRow, setCardsPerRow] = useState(3); // 2, 3, 4, 6
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'attacks', 'raids', 'scouts'
  const [showSaveModal, setShowSaveModal] = useState(false);

  const todayDate = new Date()
    .toLocaleDateString("hr-HR")
    .replace(/\//g, ".")
    .replace(/\.$/, "")
    .replace(/\s/g, "");

  // Load saved reports
  useEffect(() => {
    const savedReportsData = localStorage.getItem("savedReports");
    if (savedReportsData) {
      setSavedReports(JSON.parse(savedReportsData));
    }
  }, []);

  const handleDeleteReport = (type, id) => {
    // Use the same storage format as other pages
    const saved = localStorage.getItem("savedReports");
    const allReports = saved ? JSON.parse(saved) : { raids: [], attacks: [], scouts: [] };
    
    // Update the specific report type
    allReports[type] = allReports[type].filter(report => report.id !== id);
    
    // Save back to localStorage
    localStorage.setItem("savedReports", JSON.stringify(allReports));
    
    // Update state
    setSavedReports(prev => ({
      ...prev,
      [type]: allReports[type]
    }));
  };


  // Sort reports by date
  const sortReports = (reports) => {
    return [...reports].sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  };

  // Get all reports combined and filtered
  const getAllReports = () => {
    const allReports = [
      ...savedReports.attacks.map(r => ({ ...r, type: 'attack' })),
      ...savedReports.scouts.map(r => ({ ...r, type: 'scout' }))
    ];

    // Filter by type
    const filtered = typeFilter === 'all' 
      ? allReports 
      : allReports.filter(r => r.type === typeFilter.slice(0, -1)); // Remove 's' from 'attacks', 'scouts'

    return sortReports(filtered);
  };


  // Overlay functions
  const openReportOverlay = (report) => {
    const allReports = getAllReports();
    const reportIndex = allReports.findIndex(r => r.id === report.id);
    setCurrentReportIndex(reportIndex >= 0 ? reportIndex : 0);
    setExpandedReport(report);
  };

  const closeReportOverlay = () => {
    setExpandedReport(null);
  };

  const handleReportNavigation = (newIndex) => {
    const allReports = getAllReports();
    if (newIndex >= 0 && newIndex < allReports.length) {
      setCurrentReportIndex(newIndex);
      setExpandedReport(allReports[newIndex]);
    }
  };

  return (
    <div className={`app-container ${darkMode ? "dark" : "light"}`}>
      <Header 
        darkMode={darkMode} 
        setDarkMode={setDarkMode}
        onSettingsOpen={onSettingsOpen}
        timerState={timerState}
      />

      <div className="content" style={{ flex: "1" }}>
        <RaidTrackerModule
          input={raidTrackerData.input}
          setInput={(value) => setRaidTrackerData(prev => ({ ...prev, input: value }))}
          onPaste={handlePaste}
          onReset={handleReset}
          onSaveHistory={handleSaveHistory}
          playersLength={raidTrackerData.players.length}
          todayDate={todayDate}
          raidStart={raidTrackerData.raidStart}
          raidEnd={raidTrackerData.raidEnd}
          onDecrementHour={decrementHour}
          onIncrementHour={incrementHour}
          onTimeChange={handleTimeChange}
          onTimeBlur={handleTimeBlur}
          onApplyCurrentRange={applyCurrentRange}
        />

        {raidTrackerData.players.length > 0 && (
          <LeaderboardTable players={raidTrackerData.players} showMovement={true} maxWidth={900} subtitle={raidTrackerData.appliedRange || undefined} />
        )}

        {raidTrackerData.players.length > 0 && (
          <Graph players={raidTrackerData.players} darkMode={darkMode} maxWidth={900} />
        )}

        {/* Saved Reports Feed */}
        {(savedReports.attacks.length > 0 || savedReports.scouts.length > 0) && (
          <Feed
            reports={getAllReports()}
            reportType="all"
            title="Reports"
            darkMode={darkMode}
            settings={settings}
            onDeleteReport={handleDeleteReport}
            onOpenReportOverlay={openReportOverlay}
            showFilters={true}
            showTypeFilter={true}
            typeFilter={typeFilter}
            onTypeFilterChange={(e) => setTypeFilter(e.target.value)}
            sortOrder={sortOrder}
            onSortOrderChange={(e) => setSortOrder(e.target.value)}
            cardsPerRow={cardsPerRow}
            onCardsPerRowChange={(e) => setCardsPerRow(Number(e.target.value))}
            getAllReports={getAllReports}
          />
        )}
      </div>

      <Footer />
      
      {/* Report Overlay Modal */}
      {expandedReport && (
        <div className="report-overlay" onClick={closeReportOverlay}>
          <div className="report-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeReportOverlay}>×</button>
            <Report 
              reportData={expandedReport.data} 
              darkMode={darkMode} 
              settings={settings}
              reports={getAllReports()}
              currentIndex={currentReportIndex}
              onNavigate={handleReportNavigation}
              isInOverlay={true}
            />
          </div>
        </div>
      )}

      {/* Save Notification */}
      <SaveModal
        isVisible={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        message="Snapshot saved to History"
        position="bottom-left"
        duration={3000}
      />

    </div>
  );
}
