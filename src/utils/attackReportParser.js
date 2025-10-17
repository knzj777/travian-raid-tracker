/**
 * Parser for Travian attack reports
 * Parses text format attack reports into structured data
 */

export const parseAttackReport = (text) => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  const report = {
    header: {},
    attacker: {},
    defenders: [], // Changed to array for multiple defenders
    statistics: {}
  };

  let currentSection = '';
  let unitHeaders = [];
  let unitData = [];
  let isUnitData = false;
  let currentDefenderIndex = -1;
  
  console.log('Parsing attack report with', lines.length, 'lines');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Parse header information
    if (i === 0) {
      const match = line.match(/^(.+?)\s+attacks\s+(.+)$/);
      if (match) {
        report.header.attackerVillage = match[1];
        report.header.defenderVillage = match[2];
      }
    } else if (i === 1) {
      report.header.dateTime = line;
    }
    
    // Detect sections
    if (line === 'Attacker') {
      currentSection = 'attacker';
      isUnitData = false;
      console.log('Found Attacker section');
      continue;
    } else if (line === 'Defender') {
      currentSection = 'defender';
      isUnitData = false;
      unitData = []; // Reset unit data for new defender
      unitHeaders = []; // Reset unit headers for new defender
      currentDefenderIndex++;
      report.defenders.push({}); // Create new defender object
      console.log('Found Defender section', currentDefenderIndex);
      continue;
    } else if (line === 'Statistics') {
      currentSection = 'statistics';
      isUnitData = false;
      console.log('Found Statistics section');
      continue;
    } else if (line === 'Information') {
      currentSection = 'information';
      isUnitData = false;
      continue;
    } else if (line === 'Bounty') {
      currentSection = 'bounty';
      isUnitData = false;
      continue;
    }

    // Parse attacker/defender details
    if (currentSection === 'attacker' && line.includes('from village')) {
      const match = line.match(/^\[(.+?)\]\s+(.+?)\s+from village\s+(.+)$/);
      if (match) {
        report.attacker.tribe = match[1];
        report.attacker.player = match[2];
        report.attacker.village = match[3];
        console.log('Parsed attacker:', match[2], 'from', match[3]);
      }
    } else if (currentSection === 'defender' && line.includes('from village')) {
      const match = line.match(/^\[(.+?)\]\s+(.+?)\s+from village\s+(.+)$/);
      if (match && currentDefenderIndex >= 0) {
        report.defenders[currentDefenderIndex].tribe = match[1];
        report.defenders[currentDefenderIndex].player = match[2];
        report.defenders[currentDefenderIndex].village = match[3];
        console.log('Parsed defender', currentDefenderIndex, ':', match[2], 'from', match[3]);
      }
    }

    // Parse unit data
    if (currentSection === 'attacker' || currentSection === 'defender') {
      // Check if this line contains unit names (no numbers and has tabs)
      if (!isUnitData && !line.match(/\d/) && line.includes('\t') && line.split('\t').length > 5) {
        unitHeaders = line.split('\t').map(header => header.trim()).filter(header => header);
        isUnitData = true;
        console.log('Found unit headers for', currentSection, ':', unitHeaders);
        continue;
      }
      
      // Parse unit numbers
      if (isUnitData && line.match(/^\d/)) {
        const numbers = line.split('\t').map(num => parseInt(num) || 0);
        unitData.push(numbers);
        console.log('Added unit data row for', currentSection, ':', numbers);
        
        // Check if we have enough rows of data (2 rows for both attacker and defender)
        if (unitData.length === 2) {
          const units = {};
          unitHeaders.forEach((unitName, index) => {
            if (unitName.trim()) {
              // Both attacker and defender have 2 rows: initial, lost (remaining = initial - lost)
              const initial = unitData[0][index] || 0;
              const lost = unitData[1][index] || 0;
              units[unitName.trim()] = {
                initial: initial,
                lost: lost,
                remaining: Math.max(0, initial - lost)
              };
            }
          });
          
          console.log('Processed units for', currentSection, ':', units);
          
          if (currentSection === 'attacker') {
            report.attacker.units = units;
            console.log('Assigned units to attacker');
          } else if (currentSection === 'defender' && currentDefenderIndex >= 0) {
            report.defenders[currentDefenderIndex].units = units;
            console.log('Assigned units to defender', currentDefenderIndex);
          }
          
          unitData = [];
          isUnitData = false;
        }
      }
    }

    // Parse information section
    if (currentSection === 'information') {
      if (!report.attacker.information) report.attacker.information = [];
      report.attacker.information.push(line);
    }

    // Parse bounty section
    if (currentSection === 'bounty') {
      if (!report.attacker.bounty) report.attacker.bounty = {};
      
      // Handle resource numbers (single numbers)
      if (line.match(/^\d+$/)) {
        if (!report.attacker.bounty.resources) report.attacker.bounty.resources = [];
        report.attacker.bounty.resources.push(parseInt(line));
      } 
      // Handle total/capacity format like "77346/3534595" (with special characters)
      else if (line.includes('/')) {
        // Remove special characters and extract numbers
        const cleanLine = line.replace(/[^\d\/]/g, '');
        const match = cleanLine.match(/(\d+)\/(\d+)/);
        if (match) {
          report.attacker.bounty.total = parseInt(match[1]);
          report.attacker.bounty.capacity = parseInt(match[2]);
          console.log('Parsed bounty total/capacity:', match[1], '/', match[2]);
        }
      }
    }

    // Parse statistics section
    if (currentSection === 'statistics') {
      if (line === 'Attacker' || line === 'Defender') {
        continue;
      }
      
      // Detect statistic type lines
      if (line.includes('Combat strength') || line.includes('Supply before') || 
          line.includes('Supply lost') || line.includes('Resources lost')) {
        const statType = line.replace(/[^\w\s]/g, '').trim();
        report.statistics[statType] = {};
        console.log('Found statistic type:', statType);
        continue;
      }
      
      // Parse statistics values - handle any line that contains numbers
      if (line.match(/[\d]/)) {
        // Clean the line to extract just the number
        const cleanValue = line.replace(/[^\d]/g, '');
        const value = parseInt(cleanValue);
        
        console.log('Processing statistics line:', line, '-> cleaned:', cleanValue, '-> value:', value);
        
        if (!isNaN(value) && value > 0) {
          const statTypes = Object.keys(report.statistics);
          const lastStatType = statTypes[statTypes.length - 1];
          
          if (lastStatType) {
            if (!report.statistics[lastStatType].attacker) {
              report.statistics[lastStatType].attacker = value;
              console.log('Set attacker value for', lastStatType, ':', value);
            } else if (!report.statistics[lastStatType].defender) {
              report.statistics[lastStatType].defender = value;
              console.log('Set defender value for', lastStatType, ':', value);
            }
          }
        }
      }
    }
  }

  console.log('Final parsed report:', report);
  return report;
};

export const validateAttackReport = (text) => {
  const requiredSections = ['Attacker', 'Defender', 'Statistics'];
  const lines = text.split('\n').map(line => line.trim());
  
  return requiredSections.every(section => 
    lines.some(line => line === section)
  );
};