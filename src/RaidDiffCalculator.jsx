import React, { useState, useEffect } from "react";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import Graph from "./Components/Graph";
import LeaderboardTable from "./Components/LeaderboardTable";
import Report from "./Components/reports/Report";
import "./Components/reports/Report.css";
import Feed from "./Components/Feed";
import "./RaidTracker.css";
import Modal from "./Components/Modal";
import woodImage from "./images/resources/wood.png";
import clayImage from "./images/resources/clay.png";
import ironImage from "./images/resources/iron.png";
import cropImage from "./images/resources/crop.png";

export default function RaidDiffCalculator({ settings, onSettingsOpen }) {
  const [input, setInput] = useState("");
  const [players, setPlayers] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const [raidStart, setRaidStart] = useState("00:30");
  const [raidEnd, setRaidEnd] = useState("01:30");
  const [appliedRange, setAppliedRange] = useState("");
  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: "",
    variant: "info",
    onConfirm: null,
    onCancel: null
  });
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

  const todayDate = new Date()
    .toLocaleDateString("hr-HR")
    .replace(/\//g, ".")
    .replace(/\.$/, "");

  // Load saved data and theme/time
  useEffect(() => {
    const saved = localStorage.getItem("raidData");
    if (saved) setPlayers(JSON.parse(saved));

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) setDarkMode(savedTheme === "dark");

    const savedTimeRange = localStorage.getItem("raidTimeRange");
    if (savedTimeRange) {
      const parts = savedTimeRange.split("-");
      if (parts.length === 2) {
        setRaidStart(parts[0].trim());
        setRaidEnd(parts[1].trim());
      }
    }

    // Load saved reports
    const savedReportsData = localStorage.getItem("savedReports");
    if (savedReportsData) {
      setSavedReports(JSON.parse(savedReportsData));
    }
  }, []);

  // Save data/theme/time
  useEffect(() => {
    localStorage.setItem("raidData", JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const display = `${raidStart} - ${raidEnd}`;
    localStorage.setItem("raidTimeRange", display);
  }, [raidStart, raidEnd]);

  // Parse pasted data
  const parseData = (text) => {
    const lines = text.trim().split("\n");
    const content = lines.filter(
      (l) => !l.toLowerCase().includes("no.") && l.trim() !== ""
    );
    return content.map((line) => {
      const parts = line.split(/\t+/);
      const player = parts[1]?.trim();
      const resources = Number((parts[2] || "").replace(/[^\d]/g, ""));
      return { player, resources };
    });
  };

  // Paste or clipboard
  const handlePaste = async () => {
    try {
      let textToParse = input.trim();

      if (!textToParse) {
        textToParse = await navigator.clipboard.readText();
        if (!textToParse.trim()) {
          setModal({
            open: true,
            title: "Nothing to paste",
            message: "Input box is empty and clipboard has no text.",
            variant: "info",
            onConfirm: () => setModal((m) => ({ ...m, open: false })),
          });
          return;
        }
      }

      const newData = parseData(textToParse);

      if (players.length === 0) {
        const initialized = newData.map((p) => ({
          ...p,
          lastHour: "Missing data",
          diff: "Next hour data needed",
          previousRank: null,
          isNew: true,
        }));
        setPlayers(initialized);
      } else {
        const updated = newData.map((p) => {
          const old = players.find((x) => x.player === p.player);
          const lastHour = old ? old.resources : "Missing data";
          const diff = old ? p.resources - old.resources : "Next hour data needed";
          const previousRank = old ? players.indexOf(old) + 1 : null;
          const isNew = !old;

          return {
            ...p,
            lastHour,
            diff,
            previousRank,
            isNew,
          };
        });

        const sorted = updated.sort((a, b) => b.resources - a.resources);
        setPlayers(sorted);
      }

      setInput(""); 
      const display = `${raidStart} - ${raidEnd}`;
      setAppliedRange(display);
    } catch (err) {
      console.error("Failed to read clipboard or process input: ", err);
      setModal({
        open: true,
        title: "Paste failed",
        message: "Unable to access clipboard or process input.",
        variant: "info",
        onConfirm: () => setModal((m) => ({ ...m, open: false })),
      });
    }
  };

  const handleDeleteReport = (type, id) => {
    const storageKey = `saved${type.charAt(0).toUpperCase() + type.slice(1)}`;
    const reports = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const updatedReports = reports.filter(report => report.id !== id);
    localStorage.setItem(storageKey, JSON.stringify(updatedReports));
    
    // Update state
    setSavedReports(prev => ({
      ...prev,
      [type]: updatedReports
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

  // Get resources from report data
  const getReportResources = (reportData) => {
    if (!reportData) return null;
    
    // For attack reports, get bounty from main report object
    if (reportData.bounty && reportData.bounty.resources) {
      const bounty = reportData.bounty.resources;
      return {
        wood: bounty[0] || 0,
        clay: bounty[1] || 0,
        iron: bounty[2] || 0,
        crop: bounty[3] || 0,
        total: reportData.bounty.total || 0
      };
    }
    
    // For scouting reports, get resources directly
    if (reportData.resources && Array.isArray(reportData.resources)) {
      return {
        wood: reportData.resources[0] || 0,
        clay: reportData.resources[1] || 0,
        iron: reportData.resources[2] || 0,
        crop: reportData.resources[3] || 0,
        total: reportData.resources.reduce((sum, val) => sum + (val || 0), 0)
      };
    }
    
    return null;
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

  const handleSaveHistory = () => {
    if (players.length === 0) return;
  
    const newSnapshot = {
      timestamp: Date.now(),
      raidTimeRange: `${raidStart} - ${raidEnd}`,
      players,
    };
  
    const history = JSON.parse(localStorage.getItem("history") || "[]");
    history.push(newSnapshot);
    localStorage.setItem("history", JSON.stringify(history));
  
    setModal({
      open: true,
      title: "Saved",
      message: "Snapshot saved to history.",
      variant: "info",
      onConfirm: () => setModal((m) => ({ ...m, open: false })),
    });
  };
  

  const handleReset = () => {
    setModal({
      open: true,
      title: "Reset data",
      message: "Clear all saved data? This cannot be undone.",
      variant: "confirm",
      onCancel: () => setModal((m) => ({ ...m, open: false })),
      onConfirm: () => {
        setModal((m) => ({ ...m, open: false }));
        setPlayers([]);
        setRaidStart("00:30");
        setRaidEnd("01:30");
        localStorage.removeItem("raidData");
        localStorage.removeItem("raidTimeRange");
      },
    });
  };
  

  // Time range selector
  const incrementHour = () => {
    const [sh, sm] = raidStart.split(":").map(Number);
    const [eh, em] = raidEnd.split(":").map(Number);
    const ns = `${((sh + 1) % 24).toString().padStart(2, "0")}:${sm.toString().padStart(2, "0")}`;
    const ne = `${((eh + 1) % 24).toString().padStart(2, "0")}:${em.toString().padStart(2, "0")}`;
    setRaidStart(ns);
    setRaidEnd(ne);
  };

  const decrementHour = () => {
    const [sh, sm] = raidStart.split(":").map(Number);
    const [eh, em] = raidEnd.split(":").map(Number);
    const ns = `${((sh - 1 + 24) % 24).toString().padStart(2, "0")}:${sm.toString().padStart(2, "0")}`;
    const ne = `${((eh - 1 + 24) % 24).toString().padStart(2, "0")}:${em.toString().padStart(2, "0")}`;
    setRaidStart(ns);
    setRaidEnd(ne);
  };

  const handleTimeChange = (e) => {
    const val = e.target.value;
    if (/^[0-9:\\-\s]*$/.test(val)) {
      const parts = val.split("-");
      if (parts.length === 2) {
        setRaidStart(parts[0].trim());
        setRaidEnd(parts[1].trim());
      }
    }
  };

  const handleTimeBlur = () => {
    const norm = (val) => {
      const [h, m] = (val || "").split(":").map(Number);
      if (isNaN(h) || isNaN(m)) return null;
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    };
    const s = norm(raidStart);
    const e = norm(raidEnd);
    if (s && e) {
      setRaidStart(s);
      setRaidEnd(e);
    } else {
      setRaidStart("00:30");
      setRaidEnd("01:30");
    }
  };

  const applyCurrentRange = () => {
    const display = `${raidStart} - ${raidEnd}`;
    setAppliedRange(display);
  };

  return (
    <div className={`app-container ${darkMode ? "dark" : "light"}`}>
      <Header 
        darkMode={darkMode} 
        setDarkMode={setDarkMode}
        onSettingsOpen={onSettingsOpen}
      />

      <div className="content" style={{ flex: "1" }}>
        <h1>Raid Tracker</h1>
        <div className="input-wrap">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Copy the Top 10 table and paste it here or just press the button..."
            className="input-box"
          />
        </div>

<div className="buttons">
  <button className="paste-btn" onClick={handlePaste}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    </svg>
    Paste & Update
  </button>
  <button className="reset-btn" onClick={handleReset}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3,6 5,6 21,6"/>
      <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
      <line x1="10" y1="11" x2="10" y2="17"/>
      <line x1="14" y1="11" x2="14" y2="17"/>
    </svg>
    Reset
  </button>
  <button 
    className="save-history-btn" 
    onClick={handleSaveHistory} 
    disabled={players.length === 0}
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
      <polyline points="17,21 17,13 7,13 7,21"/>
      <polyline points="7,3 7,8 15,8"/>
    </svg>
    Save to History
  </button>
</div>


        <div className="time-display">
          <span className="date">{todayDate}</span>
          <div className="time-selector">
            <button onClick={decrementHour}>-</button>
            <input
              type="text"
              value={`${raidStart} - ${raidEnd}`}
              onChange={handleTimeChange}
              onBlur={handleTimeBlur}
            />
            <button onClick={incrementHour}>+</button>
            
          </div>
          <button 
            onClick={applyCurrentRange} 
            className="update-time-btn" 
            disabled={players.length === 0}
          >
            Update Time
          </button>
        </div>

        {players.length > 0 && (
          <LeaderboardTable players={players} showMovement={true} maxWidth={900} subtitle={appliedRange || undefined} />
        )}

        {players.length > 0 && (
          <Graph players={players} darkMode={darkMode} maxWidth={900} />
        )}

        {/* Saved Reports Feed */}
        {(savedReports.attacks.length > 0 || savedReports.scouts.length > 0) && (
          <div className="reports-feed">
            <div className="feed-header">
              <h2 style={{ fontWeight: 300 }}>Reports</h2>
              <div className="feed-controls">
                <div className="filter-group">
                  <label>Type:</label>
                  <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                    <option value="all">All</option>
                    <option value="attacks">Attacks</option>
                    <option value="scouts">Scouts</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <label>Sort:</label>
                  <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <label>Cards per row:</label>
                  <select value={cardsPerRow} onChange={(e) => setCardsPerRow(Number(e.target.value))}>
                    <option value={2}>2 Cards</option>
                    <option value={3}>3 Cards</option>
                    <option value={4}>4 Cards</option>
                    <option value={6}>6 Cards</option>
                  </select>
                </div>
              </div>
            </div>

            <div className={`feed-grid grid-${cardsPerRow}`}>
              {getAllReports().map(report => {
                const resources = getReportResources(report.data);
                
                return (
                  <div key={report.id} className={`feed-card ${report.type}-card`}>
                    <div 
                      className="card-clickable-area"
                      onClick={() => openReportOverlay(report)}
                    >
                      <div className="card-header">
                        <div className="card-type">
                          {report.type === 'attack' && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                              <path d="M2 17l10 5 10-5"/>
                              <path d="M2 12l10 5 10-5"/>
                              <path d="M8 8l8 8"/>
                              <path d="M16 8l-8 8"/>
                              <circle cx="12" cy="12" r="2"/>
                            </svg>
                          )}
                          {report.type === 'raid' && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 2C8.5 2 6 4.5 6 8c0 1.5.5 3 1.5 4L12 20l4.5-8C17.5 11 18 9.5 18 8c0-3.5-2.5-6-6-6z"/>
                              <circle cx="12" cy="8" r="2"/>
                              <path d="M8 12h8"/>
                              <path d="M10 14h4"/>
                            </svg>
                          )}
                          {report.type === 'scout' && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                          )}
                          <span>{report.type.charAt(0).toUpperCase() + report.type.slice(1)}</span>
                        </div>
                        <div className="card-attack-time">{report.data.header.dateTime}</div>
                      </div>
                      
                      <div className="card-content">
                        <h3 className="card-title">{report.title}</h3>
                        
                        <div className="card-info">
                          <div className="info-row">
                            <span className="label">Attacker:</span>
                            <span className="value">{report.data.header.attackerVillage}</span>
                          </div>
                          <div className="info-row">
                            <span className="label">Defender:</span>
                            <span className="value">{report.data.header.defenderVillage}</span>
                          </div>
                          <div className="info-row">
                            <span className="label">Result:</span>
                            <span className="value">{report.data.header.result}</span>
                          </div>
                        </div>
                        
                        {resources && (
                          <div className="resources-preview">
                            <div className="resource-item">
                              <img src={woodImage} alt="Wood" className="resource-image" />
                              <span className="resource-value">{resources.wood.toLocaleString()}</span>
                            </div>
                            <div className="resource-item">
                              <img src={clayImage} alt="Clay" className="resource-image" />
                              <span className="resource-value">{resources.clay.toLocaleString()}</span>
                            </div>
                            <div className="resource-item">
                              <img src={ironImage} alt="Iron" className="resource-image" />
                              <span className="resource-value">{resources.iron.toLocaleString()}</span>
                            </div>
                            <div className="resource-item">
                              <img src={cropImage} alt="Crop" className="resource-image" />
                              <span className="resource-value">{resources.crop.toLocaleString()}</span>
                            </div>
                            <div className="resource-total">
                              Total: {resources.total.toLocaleString()}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="card-actions">
                      <button 
                        className="delete-btn" 
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click when deleting
                          handleDeleteReport(`${report.type}s`, report.id);
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3,6 5,6 21,6"/>
                          <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                          <line x1="10" y1="11" x2="10" y2="17"/>
                          <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
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

      <Modal
        open={modal.open}
        title={modal.title}
        message={modal.message}
        variant={modal.variant}
        confirmText={modal.variant === 'confirm' ? 'Confirm' : 'OK'}
        cancelText={"Cancel"}
        onConfirm={modal.onConfirm}
        onCancel={modal.onCancel}
      />
    </div>
  );
}
