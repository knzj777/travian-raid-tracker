import React from 'react';
import { Link } from 'react-router-dom';
import './Feed.css';
import ReportCard from './ReportCard';

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
        {displayReports.map(report => (
          <ReportCard
            key={report.id}
            report={report}
            darkMode={darkMode}
            settings={settings}
            onOpenReportOverlay={onOpenReportOverlay}
            onDeleteReport={onDeleteReport}
          />
        ))}
      </div>
    </div>
  );
};

export default Feed;
