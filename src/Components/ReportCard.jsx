import React from 'react';
import './Feed.css';
import { calculateDefenseTotals } from '../utils/defenseCalculator';
import woodImage from '../images/resources/wood.png';
import clayImage from '../images/resources/clay.png';
import ironImage from '../images/resources/iron.png';
import cropImage from '../images/resources/crop.png';

const TypeIcon = ({ type }) => {
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
  }
  if (type === 'scout') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    );
  }
  if (type === 'raid') {
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

const format = (n) => (typeof n === 'number' && isFinite(n) ? n.toLocaleString() : '0');

const ResourceGrid = ({ resources }) => (
  <div className="resources-preview resources-grid">
    <div className="resource-item">
      <img src={woodImage} alt="Wood" className="resource-image" />
      <span className="resource-value">{format(resources?.wood)}</span>
    </div>
    <div className="resource-item">
      <img src={clayImage} alt="Clay" className="resource-image" />
      <span className="resource-value">{format(resources?.clay)}</span>
    </div>
    <div className="resource-item">
      <img src={ironImage} alt="Iron" className="resource-image" />
      <span className="resource-value">{format(resources?.iron)}</span>
    </div>
    <div className="resource-item">
      <img src={cropImage} alt="Crop" className="resource-image" />
      <span className="resource-value">{format(resources?.crop)}</span>
    </div>
  </div>
);

export default function ReportCard({ report, darkMode, settings, onOpenReportOverlay, onDeleteReport }) {
  const type = report.type;
  const header = report.data?.header || {};
  const bounty = report.data?.bounty || {};
  const resourcesArray = report.data?.resources || null;
  const infoSection = report.data?.information || null;

  const resourcesObj = resourcesArray && Array.isArray(resourcesArray)
    ? { wood: resourcesArray[0] || 0, clay: resourcesArray[1] || 0, iron: resourcesArray[2] || 0, crop: resourcesArray[3] || 0 }
    : null;

  const resourceTotal = resourcesObj ? (resourcesObj.wood + resourcesObj.clay + resourcesObj.iron + resourcesObj.crop) : (bounty?.total || 0);
  const capacity = bounty?.capacity ?? bounty?.totalCapacity ?? null;

  const defenseTotals = type === 'scout' ? calculateDefenseTotals(report.data) : null;
  const defenseLine = type === 'scout'
    ? (defenseTotals ? `Defense: ${format(defenseTotals.infantry)} | ${format(defenseTotals.cavalry)}` : 'Defense: Unknown')
    : null;

  if (type === 'scout') {
    // eslint-disable-next-line no-console
    console.log('[ReportCard] defenders payload (first group keys):', Array.isArray(report.data?.defenders) && report.data.defenders[0] ? Object.keys(report.data.defenders[0]) : 'n/a');
  }

  return (
    <div className={`feed-card ${type}-card`}>
      <div className="card-clickable-area" onClick={() => onOpenReportOverlay && onOpenReportOverlay(report)}>
        <div className="card-header">
          <div className="card-type">
            <TypeIcon type={type} />
            <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
          </div>
          <div className="card-attack-time">{header.dateTime}</div>
        </div>

        <div className="card-content">
          <h3 className="card-title">{report.title}</h3>

          {type === 'attack' && (
            <>
              <ResourceGrid resources={
                bounty?.resources && Array.isArray(bounty.resources)
                  ? { wood: bounty.resources[0] || 0, clay: bounty.resources[1] || 0, iron: bounty.resources[2] || 0, crop: bounty.resources[3] || 0 }
                  : resourcesObj
              } />
              <div className="resource-total">
                <span className="total-label">Total:</span>
                <span className="total-value">
                  {format(bounty?.total)}{capacity ? ` / ${format(capacity)}` : ''}
                </span>
              </div>
              {report.data?.statistics && (
                <div className="battle-stats">
                  {report.data.statistics['Combat strength'] && (
                    <div className="stat-row">
                      <span className="stat-label">Combat:</span>
                      <span className="stat-value">
                        {format(report.data.statistics['Combat strength'].attacker)} vs {format(report.data.statistics['Combat strength'].defender)}
                      </span>
                    </div>
                  )}
                  {report.data.statistics['Resources lost'] && (
                    <div className="stat-row">
                      <span className="stat-label">Lost:</span>
                      <span className="stat-value">
                        {format(report.data.statistics['Resources lost'].attacker)} vs {format(report.data.statistics['Resources lost'].defender)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {type === 'scout' && (
            <>
              <div className="defense-line">{defenseLine}</div>

              {resourcesObj && (
                <>
                  <ResourceGrid resources={resourcesObj} />
                  <div className="raidable-total">
                    <span className="total-label">Raidable:</span>
                    <span className="total-value">{format(resourceTotal)}</span>
                  </div>
                </>
              )}

              {!resourcesObj && infoSection && (
                <div className="information-section">
                  {Array.isArray(infoSection)
                    ? infoSection.map((line, idx) => <div key={idx} className="info-line">{line}</div>)
                    : <div className="info-line">{String(infoSection)}</div>}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="card-actions">
        <button 
          className="delete-btn" 
          onClick={(e) => {
            e.stopPropagation();
            const reportTypeKey = report.type === 'attack' ? 'attacks' : (report.type === 'scout' ? 'scouts' : 'raids');
            onDeleteReport && onDeleteReport(reportTypeKey, report.id);
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}


