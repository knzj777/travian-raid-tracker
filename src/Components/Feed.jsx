import React from 'react';
import { Link } from 'react-router-dom';
import './Feed.css';

const Feed = ({ 
  reports, 
  reportType, 
  title, 
  darkMode, 
  settings, 
  onDeleteReport, 
  onOpenReportOverlay,
  // Advanced feed props
  showFilters = false,
  showTypeFilter = true,
  typeFilter = 'all',
  onTypeFilterChange,
  sortOrder = 'newest',
  onSortOrderChange,
  cardsPerRow = 3,
  onCardsPerRowChange,
  getAllReports
}) => {
  console.log("Feed component loaded with new changes!");
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

  const getCardIcon = (type) => {
    if (type === 'attack') {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
          <path d="M8 8l8 8"/>
          <path d="M16 8l-8 8"/>
          <circle cx="12" cy="12" r="2"/>
        </svg>
      );
    } else if (type === 'scout') {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      );
    } else if (type === 'raid') {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C8.5 2 6 4.5 6 8c0 1.5.5 3 1.5 4L12 20l4.5-8C17.5 11 18 9.5 18 8c0-3.5-2.5-6-6-6z"/>
          <circle cx="12" cy="8" r="2"/>
          <path d="M8 12h8"/>
          <path d="M10 14h4"/>
        </svg>
      );
    }
    return null;
  };

  const getCardClass = (type) => {
    return `${type}-card`;
  };

  // Determine which reports to display
  const displayReports = showFilters && getAllReports ? getAllReports() : reports;
  const gridClass = showFilters ? `grid-${cardsPerRow}` : 'grid-3';

  if (displayReports.length === 0) {
    return (
      <div className="no-reports">
        <p>No {reportType || 'reports'} saved yet.</p>
        <p>Go to <Link to="/create-report">Create Report</Link> to add your first {reportType || 'report'}.</p>
      </div>
    );
  }

  return (
    <div className="reports-feed">
      <div className="feed-header">
        <h2 style={{ fontWeight: 300 }}>{title}</h2>
        {showFilters && (
          <div className="feed-controls">
            {showTypeFilter && (
              <div className="filter-group">
                <label>Type:</label>
                <select value={typeFilter} onChange={(e) => onTypeFilterChange(e.target.value)}>
                  <option value="all">All</option>
                  <option value="attacks">Attacks</option>
                  <option value="scouts">Scouts</option>
                </select>
              </div>
            )}
            
            <div className="filter-group">
              <label>Sort:</label>
              <select value={sortOrder} onChange={(e) => onSortOrderChange(e.target.value)}>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Cards per row:</label>
              <select value={cardsPerRow} onChange={(e) => onCardsPerRowChange(Number(e.target.value))}>
                <option value={2}>2 Cards</option>
                <option value={3}>3 Cards</option>
                <option value={4}>4 Cards</option>
                <option value={6}>6 Cards</option>
              </select>
            </div>
          </div>
        )}
      </div>
      
      <div className={`feed-grid ${gridClass}`}>
        {displayReports.map(report => {
          const resources = getReportResources(report.data);
          const reportTypeValue = report.type || reportType;
          
          return (
            <div key={report.id} className={`feed-card ${getCardClass(reportTypeValue)}`}>
              <div 
                className="card-clickable-area"
                onClick={() => onOpenReportOverlay(report)}
              >
                <div className="card-header">
                  <div className="card-type">
                    {getCardIcon(reportTypeValue)}
                    <span>{reportTypeValue.charAt(0).toUpperCase() + reportTypeValue.slice(1)}</span>
                  </div>
                  <div className="card-attack-time">{report.data.header.dateTime}</div>
                </div>
                
                <div className="card-content">
                  <h3 className="card-title">{report.title}</h3>
                  
                  {/* Resources Preview - Compact Version */}
                  {resources && (
                    <div className="resources-preview">
                      <div className="resource-item">
                        <img src={require('../images/resources/wood.png')} alt="Wood" />
                        <span>{resources.wood.toLocaleString()}</span>
                      </div>
                      <div className="resource-item">
                        <img src={require('../images/resources/clay.png')} alt="Clay" />
                        <span>{resources.clay.toLocaleString()}</span>
                      </div>
                      <div className="resource-item">
                        <img src={require('../images/resources/iron.png')} alt="Iron" />
                        <span>{resources.iron.toLocaleString()}</span>
                      </div>
                      <div className="resource-item">
                        <img src={require('../images/resources/crop.png')} alt="Crop" />
                        <span>{resources.crop.toLocaleString()}</span>
                      </div>
                      <div className="resource-total">
                        <span className="total-label">Total:</span>
                        <span className="total-value">{resources.total.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  {/* Attack Reports - Combat Strength and Resources Lost */}
                  {reportTypeValue === 'attack' && report.data.statistics && (
                    <div className="battle-stats">
                      {report.data.statistics['Combat strength'] && (
                        <div className="stat-row">
                          <span className="stat-label">Combat:</span>
                          <span className="stat-value">
                            {report.data.statistics['Combat strength'].attacker.toLocaleString()} vs {report.data.statistics['Combat strength'].defender.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {report.data.statistics['Resources lost'] && (
                        <div className="stat-row">
                          <span className="stat-label">Lost:</span>
                          <span className="stat-value">
                            {report.data.statistics['Resources lost'].attacker.toLocaleString()} vs {report.data.statistics['Resources lost'].defender.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Scout Reports - Raidable Resources */}
                  {reportTypeValue === 'scout' && resources && (
                    <div className="raidable-resources">
                      <div className="raidable-header">
                        <span className="raidable-label">Raidable:</span>
                        <span className="raidable-total">{resources.total.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="card-actions">
                <button 
                  className="delete-btn" 
                  onClick={(e) => {
                    e.stopPropagation();
                    const reportTypeKey = reportTypeValue === 'attack' ? 'attacks' : 'scouts';
                    onDeleteReport(reportTypeKey, report.id);
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
  );
};

export default Feed;
