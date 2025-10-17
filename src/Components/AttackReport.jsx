import React from 'react';
import './AttackReport.css';

const AttackReport = ({ reportData, darkMode = true }) => {
  if (!reportData) return null;

  const formatNumber = (num) => {
    return num ? num.toLocaleString() : '0';
  };

  const renderUnitTable = (units, title) => {
    if (!units) return null;

    const unitNames = Object.keys(units);
    if (unitNames.length === 0) return null;

    return (
      <div className="unit-table">
        <div className="unit-headers">
          {unitNames.map(unitName => (
            <div key={unitName} className="unit-header">
              {unitName}
            </div>
          ))}
        </div>
        <div className="unit-data">
          <div className="unit-row initial">
            {unitNames.map(unitName => (
              <div key={`initial-${unitName}`} className="unit-cell">
                {formatNumber(units[unitName].initial)}
              </div>
            ))}
          </div>
          <div className="unit-row lost">
            {unitNames.map(unitName => (
              <div key={`lost-${unitName}`} className="unit-cell">
                {formatNumber(units[unitName].lost)}
              </div>
            ))}
          </div>
          <div className="unit-row remaining">
            {unitNames.map(unitName => (
              <div key={`remaining-${unitName}`} className="unit-cell">
                {formatNumber(units[unitName].remaining)}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderStatistics = () => {
    if (!reportData.statistics) return null;

    return (
      <div className="statistics-section">
        <div className="section-header statistics-header">
          <span>STATISTICS</span>
        </div>
        <div className="statistics-table">
          <div className="statistics-row header">
            <div className="stat-name"></div>
            <div className="stat-value attacker">Attacker</div>
            <div className="stat-value defender">Defender</div>
          </div>
          {Object.entries(reportData.statistics).map(([statType, values]) => (
            <div key={statType} className="statistics-row">
              <div className="stat-name">{statType}</div>
              <div className="stat-value attacker">{formatNumber(values.attacker)}</div>
              <div className="stat-value defender">{formatNumber(values.defender)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`attack-report ${darkMode ? '' : 'light'}`}>
      {/* Header */}
      <div className="report-header">
        <div className="header-info">
          <div className="date-time">{reportData.header.dateTime}</div>
          <div className="attack-title">
            {reportData.header.attackerVillage} attacks {reportData.header.defenderVillage}
          </div>
        </div>
      </div>

      {/* Attacker Section */}
      <div className="attacker-section">
        <div className="section-header attacker-header">
          <span>ATTACKER</span>
        </div>
        <div className="player-info attacker-info">
          <span className="tribe">[{reportData.attacker.tribe}]</span>
          <span className="player">{reportData.attacker.player}</span>
          <span className="village">from village {reportData.attacker.village}</span>
        </div>
        
        {renderUnitTable(reportData.attacker.units, 'Attacker')}

        {/* Information */}
        {reportData.attacker.information && (
          <div className="information-section">
            <div className="info-title">Information</div>
            <div className="info-content">
              {reportData.attacker.information.map((info, index) => (
                <div key={index} className="info-item">{info}</div>
              ))}
            </div>
          </div>
        )}

        {/* Bounty */}
        {reportData.attacker.bounty && (
          <div className="bounty-section">
            <div className="bounty-title">Bounty</div>
            <div className="bounty-content">
              <div className="resources">
                {reportData.attacker.bounty.resources && reportData.attacker.bounty.resources.map((resource, index) => {
                  const resourceTypes = ['wood', 'clay', 'iron', 'crop'];
                  return (
                    <div key={index} className="resource-item">
                      <div className={`resource-icon ${resourceTypes[index]}`}></div>
                      <span className="resource-value">{formatNumber(resource)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="total-capacity">
                {formatNumber(reportData.attacker.bounty.total)} / {formatNumber(reportData.attacker.bounty.capacity)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Defender Sections */}
      {reportData.defenders && reportData.defenders.map((defender, index) => (
        <div key={index} className="defender-section">
          <div className="section-header defender-header">
            <span>DEFENDER {index + 1}</span>
          </div>
          <div className="player-info defender-info">
            <span className="tribe">[{defender.tribe}]</span>
            <span className="player">{defender.player}</span>
            <span className="village">from village {defender.village}</span>
          </div>
          
          {renderUnitTable(defender.units, `Defender ${index + 1}`)}
        </div>
      ))}

      {/* Statistics */}
      {renderStatistics()}
    </div>
  );
};

export default AttackReport;
