import React, { useState, useEffect, useRef } from 'react';
import './Report.css';
import { getUnitImageByName, getUnitDataByName } from '../../utils/unitIcons';
import woodImage from '../../images/resources/wood.png';
import clayImage from '../../images/resources/clay.png';
import ironImage from '../../images/resources/iron.png';
import cropImage from '../../images/resources/crop.png';
import bountyEmptyImage from '../../images/resources/bounty-empty.png';
import bountyHalfImage from '../../images/resources/bounty-half.png';
import bountyFullImage from '../../images/resources/bounty-full.png';
import crannyImage from '../../images/resources/cranny.png';
import troopsImage from '../../images/combat/troops.png';
import casualtiesImage from '../../images/combat/casualities.png';
import woundedImage from '../../images/combat/wounded.png';
import tribeGaulsImage from '../../images/tribes/tribe-gauls.png';
import tribeRomansImage from '../../images/tribes/tribe-romans.png';
import tribeTeutonsImage from '../../images/tribes/tribe-teutons.png';
import tribeEgyptiansImage from '../../images/tribes/tribe-egyptians.png';
import tribeSpartansImage from '../../images/tribes/tribe-spartans.png';
import tribeHunsImage from '../../images/tribes/tribe-huns.png';

// SVG Icons
const CameraIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
    <circle cx="12" cy="13" r="3"/>
  </svg>
);

const Report = ({ 
  reportData, 
  reports = [], 
  currentIndex = 0, 
  onNavigate, 
  isInOverlay = false,
  darkMode = true, 
  settings = {} 
}) => {
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureStatus, setCaptureStatus] = useState('idle'); // 'idle', 'capturing', 'success'
  
  // Touch/swipe handlers for mobile
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  // Ref for focusing the report div
  const reportRef = useRef(null);

  // Focus the report div when in overlay mode to enable keyboard navigation
  useEffect(() => {
    if (isInOverlay && reportRef.current) {
      reportRef.current.focus();
    }
  }, [isInOverlay]);

  if (!reportData) return null;

  // Use reports as-is since they're already filtered by the parent component
  const filteredReports = reports;

  // Determine if report should use light mode based on settings
  const useLightReport = settings.lightReportOnDarkTheme && darkMode;
  const effectiveDarkMode = useLightReport ? false : darkMode;

  // Navigation handlers
  const handlePrevious = () => {
    if (currentIndex > 0 && onNavigate) {
      onNavigate(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredReports.length - 1 && onNavigate) {
      onNavigate(currentIndex + 1);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      handlePrevious();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    }
  };

  const handleTouchStart = (e) => {
    if (!isInOverlay) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (!isInOverlay) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isInOverlay || !touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentIndex < filteredReports.length - 1) {
      handleNext();
    }
    if (isRightSwipe && currentIndex > 0) {
      handlePrevious();
    }
  };

  const formatNumber = (num) => {
    if (num === "?") return "?";
    if (!num || num === 0 || isNaN(num)) return '0';
    
    // Always display full numbers with commas for readability
    return num.toLocaleString();
  };

  const getBountyIcon = (total, capacity) => {
    // Handle NaN, undefined, null, or invalid values
    if (!total || !capacity || isNaN(total) || isNaN(capacity) || total === 0 || capacity === 0) {
      return bountyEmptyImage;
    }
    
    const percentage = (total / capacity) * 100;
    
    // Handle NaN percentage
    if (isNaN(percentage)) {
      return bountyEmptyImage;
    }
    
    if (percentage >= 100) {
      return bountyFullImage;
    } else if (percentage > 0) {
      return bountyHalfImage;
    } else {
      return bountyEmptyImage;
    }
  };

  const getTribeImage = (tribeName) => {
    if (!tribeName) return null;
    
    const tribeMap = {
      'gauls': tribeGaulsImage,
      'romans': tribeRomansImage,
      'teutons': tribeTeutonsImage,
      'egyptians': tribeEgyptiansImage,
      'spartans': tribeSpartansImage,
      'huns': tribeHunsImage,
    };
    
    return tribeMap[tribeName.toLowerCase()] || null;
  };

  const getPlayerDisplayInfo = (playerData) => {
    // Now we have separate alliance and tribe fields
    const alliance = playerData.alliance || '';
    const player = playerData.player || '';
    const tribe = playerData.tribe || '';
    
    return {
      alliance: alliance,
      playerName: player,
      tribeImage: getTribeImage(tribe)
    };
  };

  const handleUnitClick = (unitName, tribe = null) => {
    const unit = getUnitDataByName(unitName, tribe);
    if (unit) {
      setSelectedUnit(unit);
    }
  };

  const captureScreenshot = async () => {
    if (isCapturing) return;
    
    setIsCapturing(true);
    setCaptureStatus('capturing');
    
    try {
      // Import html2canvas dynamically to avoid SSR issues
      const html2canvas = (await import('html2canvas')).default;
      
      const reportElement = document.querySelector('.attack-report');
      if (!reportElement) {
        throw new Error('Report element not found');
      }

      // Hide the screenshot button before capturing
      const screenshotButton = document.querySelector('.screenshot-btn');
      let originalDisplay = '';
      if (screenshotButton) {
        originalDisplay = screenshotButton.style.display;
        screenshotButton.style.display = 'none';
      }

      // Capture the report as canvas
      const canvas = await html2canvas(reportElement, {
        backgroundColor: effectiveDarkMode ? '#1b1b1b' : '#ffffff',
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        width: reportElement.scrollWidth,
        height: reportElement.scrollHeight
      });

      // Show the screenshot button again
      if (screenshotButton) {
        screenshotButton.style.display = originalDisplay;
      }

      // Convert canvas to blob
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/png', 0.95);
      });

      // Copy to clipboard
      if (navigator.clipboard && window.ClipboardItem) {
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        
        // Show success feedback
        setCaptureStatus('success');
        setTimeout(() => {
          setCaptureStatus('idle');
        }, 2000);
      } else {
        throw new Error('Clipboard API not supported');
      }
    } catch (error) {
      console.error('Screenshot capture failed:', error);
      alert('Failed to capture screenshot. Please try again.');
      setCaptureStatus('idle');
    } finally {
      setIsCapturing(false);
    }
  };

  const closeUnitModal = () => {
    setSelectedUnit(null);
  };

  const renderUnitTable = (units, title, tribe = null) => {
    if (!units) return null;

    const unitNames = Object.keys(units).filter(name => !name.startsWith('_') && name !== '?');
    
    if (unitNames.length === 0) return null;

    return (
      <div className="unit-table">
        <div className="unit-data">
          <div className="unit-row header-row">
            <div className="unit-row-label"></div>
            {unitNames.map(unitName => (
              <div 
                key={unitName} 
                className="unit-cell unit-image-cell" 
                data-tooltip={unitName}
                onClick={() => handleUnitClick(unitName, tribe)}
              >
                <img 
                  src={getUnitImageByName(unitName, tribe)}
                  alt={unitName}
                  className="unit-image"
                />
              </div>
            ))}
          </div>
          <div className="unit-row initial">
            <div className="unit-row-label" title="Troops">
              <img src={troopsImage} alt="Troops" className="row-type-icon" />
            </div>
            {unitNames.map(unitName => (
              <div
                key={`initial-${unitName}`}
                className="unit-cell"
              >
                {formatNumber(units[unitName].initial)}
              </div>
            ))}
          </div>
          <div className="unit-row lost">
            <div className="unit-row-label" title="Casualties">
              <img src={casualtiesImage} alt="Casualties" className="row-type-icon" />
            </div>
            {unitNames.map(unitName => (
              <div
                key={`lost-${unitName}`}
                className="unit-cell"
              >
                {formatNumber(units[unitName].lost)}
              </div>
            ))}
          </div>
          {units._hasHospitalData && (
            <div className="unit-row remaining">
              <div className="unit-row-label" title="Wounded">
                <img src={woundedImage} alt="Wounded" className="row-type-icon" />
              </div>
              {unitNames.map(unitName => (
                <div 
                  key={`wounded-${unitName}`} 
                  className="unit-cell"
                >
                  {units[unitName].wounded === "?" || units[unitName].wounded === undefined ? "?" : formatNumber(units[unitName].wounded)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStatistics = () => {
    if (!reportData.statistics || Object.keys(reportData.statistics).length === 0) return null;
    
    // Don't render statistics for scouting reports
    if (reportData.header && reportData.header.type === "scout") return null;
    
    // Don't render statistics when all attacker troops are dead
    if (reportData.attacker && reportData.attacker.allTroopsDead) return null;
    
    console.log("Statistics data:", reportData.statistics);
    console.log("Statistics entries:", Object.entries(reportData.statistics));
    console.log("Statistics keys:", Object.keys(reportData.statistics));

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
          {Object.entries(reportData.statistics).map(([statType, values]) => {
            console.log(`Stat: ${statType}, Values:`, values);
            return (
              <div key={statType} className="statistics-row">
                <div className="stat-name">{statType}</div>
                <div className="stat-value attacker">{formatNumber(values.attacker)}</div>
                <div className="stat-value defender">{formatNumber(values.defender)}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={reportRef}
      className={`attack-report ${effectiveDarkMode ? '' : 'light'}`}
      onKeyDown={isInOverlay ? handleKeyDown : undefined}
      onTouchStart={isInOverlay ? handleTouchStart : undefined}
      onTouchMove={isInOverlay ? handleTouchMove : undefined}
      onTouchEnd={isInOverlay ? handleTouchEnd : undefined}
      tabIndex={isInOverlay ? 0 : undefined}
    >
      {/* Navigation buttons for desktop */}
      {filteredReports.length > 0 && (
        <>
          <button 
            className="report-nav-btn prev"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            aria-label="Previous report"
          >
            ‹
          </button>
          <button 
            className="report-nav-btn next"
            onClick={handleNext}
            disabled={currentIndex === filteredReports.length - 1}
            aria-label="Next report"
          >
            ›
          </button>
        </>
      )}
      {/* Header */}
      <div className="report-header">
        <div className="header-info">
          <div className="date-time">{reportData.header.dateTime}</div>
          <div className="attack-title">
            {reportData.header.originalTitle || `${reportData.header.attackerVillage} ${reportData.header.type === "scout" ? "scouts" : "attacks"} ${reportData.header.defenderVillage}`}
          </div>
        </div>
        <button 
          className="screenshot-btn" 
          onClick={captureScreenshot}
          disabled={isCapturing}
          title="Copy screenshot to clipboard"
          style={{
            backgroundColor: captureStatus === 'success' ? '#4CAF50' : ''
          }}
        >
          <CameraIcon />
          {captureStatus === 'capturing' ? 'Capturing...' : 
           captureStatus === 'success' ? '✓ Captured!' : 
           'Screenshot'}
        </button>
      </div>

      {/* Attacker Section */}
      <div className="attacker-section">
        <div className="section-header attacker-header">
          <span>ATTACKER</span>
        </div>
        <div className="player-info attacker-info">
          {(() => {
            const playerInfo = getPlayerDisplayInfo(reportData.attacker);
            return (
              <>
                {playerInfo.tribeImage && (
                  <img 
                    src={playerInfo.tribeImage} 
                    alt={reportData.attacker.tribe} 
                    className="tribe-image"
                  />
                )}
                <span className="alliance">
                  {playerInfo.alliance ? `[${playerInfo.alliance}]` : '[]'}
                </span>
                <span className="player">{playerInfo.playerName}</span>
                <span className="village">from village {reportData.attacker.village}</span>
              </>
            );
          })()}
        </div>
        
        {renderUnitTable(reportData.attacker.units, 'Attacker', reportData.attacker.tribe?.toLowerCase())}

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
        {reportData.bounty && (
          <div className="bounty-section">
            <div className="bounty-title">Bounty</div>
            <div className="bounty-content">
              <div className="resources">
                {reportData.bounty.resources && reportData.bounty.resources.map((resource, index) => {
                  const resourceImages = [woodImage, clayImage, ironImage, cropImage];
                  const resourceNames = ['Wood', 'Clay', 'Iron', 'Crop'];
                  return (
                    <div key={index} className="resource-item">
                      <img src={resourceImages[index]} alt={resourceNames[index]} className="resource-image" />
                      <span className="resource-value">{formatNumber(resource)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="total-capacity">
                <img 
                  src={getBountyIcon(reportData.bounty.total, reportData.bounty.capacity)} 
                  alt="Bounty" 
                  className="bounty-icon" 
                />
                {formatNumber(reportData.bounty.total)} / {formatNumber(reportData.bounty.capacity)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Defender Sections */}
      {reportData.defenders && reportData.defenders.map((defender, index) => (
        <div key={index} className="defender-section">
          <div className="section-header defender-header">
            <span>DEFENDER {index + 1}{defender.isReinforcement ? ' (Reinforcement)' : ''}</span>
          </div>
          <div className="player-info defender-info">
            {(() => {
              const playerInfo = getPlayerDisplayInfo(defender);
              return (
                <>
                  {playerInfo.tribeImage && (
                    <img 
                      src={playerInfo.tribeImage} 
                      alt={defender.tribe} 
                      className="tribe-image"
                    />
                  )}
                  <span className="alliance">
                    {playerInfo.alliance ? `[${playerInfo.alliance}]` : '[]'}
                  </span>
                  <span className="player">{playerInfo.playerName}</span>
                  <span className="village">from village {defender.village}</span>
                </>
              );
            })()}
          </div>
          
          {/* Show unit table for defenders with units, or empty message for empty defenders */}
          {(defender.isEmpty || (Object.keys(defender.units).length === 0 && !defender.player)) ? (
            <div className="empty-defender-message">
              <span>No units</span>
            </div>
          ) : (
            renderUnitTable(defender.units, `Defender ${index + 1}`, defender.tribe?.toLowerCase())
          )}
        </div>
      ))}

        {/* Resources (for scouting reports) */}
        {reportData.resources && (
          <div className="bounty-section">
            <div className="bounty-title">Resources</div>
            <div className="bounty-content">
              <div className="resources-container">
                {/* Left side - Basic resources */}
                <div className="resources-left">
                  {reportData.resources.slice(0, 4).map((resource, index) => {
                    const resourceImages = [woodImage, clayImage, ironImage, cropImage];
                    const resourceNames = ['Wood', 'Clay', 'Iron', 'Crop'];
                    
                    // Only render if we have a valid resource value
                    if (resource === undefined || resource === null) return null;
                    
                    return (
                      <div key={index} className="resource-item">
                        <img src={resourceImages[index]} alt={resourceNames[index]} className="resource-image" />
                        <span className="resource-value">{formatNumber(resource)}</span>
                      </div>
                    );
                  })}
                </div>
                
                {/* Right side - Cranny and Raidable resources */}
                <div className="resources-right">
                  {reportData.resources.slice(4).map((resource, index) => {
                    const resourceImages = [crannyImage, bountyFullImage];
                    const resourceNames = ['Cranny', 'Raidable resources'];
                    
                    // Only render if we have a valid resource value
                    if (resource === undefined || resource === null) return null;
                    
                    return (
                      <div key={index + 4} className="resource-item">
                        <img src={resourceImages[index]} alt={resourceNames[index]} className="resource-image" />
                        <span className={`resource-value ${index === 1 ? 'bold' : ''}`}>
                          {formatNumber(resource)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
      {renderStatistics()}

      {/* Unit Stats Modal */}
      {selectedUnit && (
        <div className="unit-stats-overlay" onClick={closeUnitModal}>
          <div className="unit-stats-modal" onClick={(e) => e.stopPropagation()}>
            <div className="unit-stats-header">
              <div className="unit-header-info">
                <img src={selectedUnit.image} alt={selectedUnit.name} className="unit-modal-image" />
                <div>
                  <h3>{selectedUnit.name}</h3>
                  <p className="unit-tribe">{selectedUnit.tribeName}</p>
                </div>
              </div>
              <button className="close-unit-modal" onClick={closeUnitModal}>×</button>
            </div>
            <div className="unit-stats-content">
              <div className="unit-stats-section">
                <div className="type-row">
                  <span className="type-label">Type</span>
                  <span className="unit-type-inline">{selectedUnit.type}</span>
                </div>
              </div>

              <div className="unit-stats-section">
                <h4>Combat Stats</h4>
                <div className="stats-grid">
                  <div className="stat-item combat-stat">
                    <span className="stat-label">Attack:</span>
                    <span className="stat-value">{selectedUnit.stats.attack}</span>
                  </div>
                  <div className="stat-item defense-infantry">
                    <span className="stat-label">Defense (Infantry):</span>
                    <span className="stat-value">{selectedUnit.stats.defenseInfantry}</span>
                  </div>
                  <div className="stat-item defense-cavalry">
                    <span className="stat-label">Defense (Cavalry):</span>
                    <span className="stat-value">{selectedUnit.stats.defenseCavalry}</span>
                  </div>
                </div>
              </div>

              <div className="unit-stats-section">
                <h4>Other Stats</h4>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Speed:</span>
                    <span className="stat-value">{selectedUnit.stats.velocity} fields/hour</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Capacity:</span>
                    <span className="stat-value">{selectedUnit.stats.carryCapacity}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Upkeep:</span>
                    <span className="stat-value">{selectedUnit.stats.upkeep} crop</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Training:</span>
                    <span className="stat-value">{selectedUnit.stats.trainingTime}</span>
                  </div>
                </div>
              </div>
              
              <div className="unit-stats-section">
                <h4>Cost</h4>
                <div className="cost-grid">
                  <div className="cost-item">
                    <img src={woodImage} alt="Wood" className="resource-image" />
                    <span>{selectedUnit.cost.lumber}</span>
                  </div>
                  <div className="cost-item">
                    <img src={clayImage} alt="Clay" className="resource-image" />
                    <span>{selectedUnit.cost.clay}</span>
                  </div>
                  <div className="cost-item">
                    <img src={ironImage} alt="Iron" className="resource-image" />
                    <span>{selectedUnit.cost.iron}</span>
                  </div>
                  <div className="cost-item">
                    <img src={cropImage} alt="Crop" className="resource-image" />
                    <span>{selectedUnit.cost.crop}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Report;
