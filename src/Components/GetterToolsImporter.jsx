import React, { useState } from 'react';
import './GetterToolsImporter.css';
import SaveModal from './modals/SaveModal';

// Comprehensive mapping of localized attack types to standard English types
const ATTACK_TYPE_MAPPING = {
  // Fake / Spam
  'fake': 'Fake',
  'falsk': 'Fake', // Danish
  'fejk': 'Fake', // Polish, Slovenian, Swedish
  'pete': 'Fake', // Estonian
  'спам': 'Fake', // Russian, Ukrainian
  'falešný': 'Fake', // Czech
  
  // Conquer
  'conquer': 'Conquer',
  'erobre': 'Conquer', // Danish, Norwegian
  'przejęcie wioski': 'Conquer', // Polish
  'adeln': 'Conquer', // German
  'prevzem': 'Conquer', // Slovenian
  'valluta': 'Conquer', // Estonian
  'erövra': 'Conquer', // Swedish
  'fethetmek': 'Conquer', // Turkish
  'conquistar': 'Conquer', // Spanish
  'dobýt': 'Conquer', // Czech
  'conquête': 'Conquer', // French
  'κατάκτηση': 'Conquer', // Greek
  'conquista': 'Conquer', // Italian
  'захват деревни': 'Conquer', // Russian
  'veroveren': 'Conquer', // Dutch
  'захоплення поселення': 'Conquer', // Ukrainian
  'overtagelse': 'Conquer', // Norwegian
  
  // Pre-conquer
  'pre-conquer': 'Pre-conquer',
  'tilbage-erobre': 'Pre-conquer', // Danish
  'przed-podbicie': 'Pre-conquer', // Polish
  'voradeln': 'Pre-conquer', // German
  'čistilec pred prevzemom': 'Pre-conquer', // Slovenian
  'vallutuspuhastus': 'Pre-conquer', // Estonian
  'för-erövring': 'Pre-conquer', // Swedish
  'v.sevgisi indirme': 'Pre-conquer', // Turkish
  'antes de la conquista': 'Pre-conquer', // Spanish
  'připravit dobytí': 'Pre-conquer', // Czech
  'avant la conquête de': 'Pre-conquer', // French
  'προ κατάκτηση': 'Pre-conquer', // Greek
  'pre-conquista': 'Pre-conquer', // Italian
  'зачистка': 'Pre-conquer', // Russian
  'pre-verovering': 'Pre-conquer', // Dutch
  'пробій (знищення дефу)': 'Pre-conquer', // Ukrainian
  
  // Attack (fallback)
  'attack': 'Attack'
};

const GetterToolsImporter = ({ onImportAttacks }) => {
  const [pasteData, setPasteData] = useState('');
  const [showImportNotification, setShowImportNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [importedCount, setImportedCount] = useState(0);

  const parseGetterToolsFormat = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      throw new Error('No data to parse');
    }

    // Skip header row if present (check for common header keywords in all languages)
    let dataLines = lines;
    const firstLine = lines[0].toLowerCase();
    const headerKeywords = [
      'start', 'mål', 'cel', 'ziel', 'tarča', 'sihtmärk', 'tid för avfärd', 'çıkış köyü',
      'hora de envio', 'čas odeslání', 'heure d\'envoi', 'ώρα αποστολής', 'orario di invio',
      'отправить', 'verzend tijd', 'відправити', 'starttidspunkt', 'target', 'typ', 'type',
      'tipo', 'время', 'czas', 'відправити', 'begynn', 'départ', 'inizio', 'εκκίνηση'
    ];
    if (headerKeywords.some(keyword => firstLine.includes(keyword))) {
      dataLines = lines.slice(1);
    }

    const attacks = [];
    const errors = [];
    const baseTimestamp = Date.now();
    let attackIndex = 0;

    dataLines.forEach((line, index) => {
      // Skip empty lines or comment lines (lines starting with *)
      if (!line.trim() || line.trim().startsWith('*')) return;

      // Split by tabs - keep empty strings to preserve column positions
      const columns = line.split('\t');
      
      // Use fixed column positions (all languages have same structure)
      // Columns: Start (0), empty (1), Target (2), Type (3), Launch time (4), Arrival (5), Travel time (6)
      if (columns.length < 7) {
        return; // Skip lines with insufficient columns
      }

      const start = columns[0]?.trim() || '';
      const typeRaw = columns[3]?.trim() || '';
      const launchTime = columns[4]?.trim() || '';
      const arrival = columns[5]?.trim() || '';
      const travelTime = columns[6]?.trim() || '';

      if (!start || !typeRaw || !launchTime || !arrival || !travelTime) {
        return; // Skip incomplete rows
      }

      try {
        // Extract village name (remove coordinates if present)
        // "07H Mo.. (121|-60)" -> "07H Mo.."
        const villageName = start.replace(/\s*\([^)]*\)\s*$/, '').trim();

        // Parse attack type using comprehensive mapping
        const attackType = ATTACK_TYPE_MAPPING[typeRaw.toLowerCase()] || 'Fake';

        // Parse launch time: handles various formats
        // Examples: "ons,5.11.25 22:14:35", "śro,5.11.25 22:14:35", "mié,5/11/25 22:14:35"
        // Format: Day abbreviation (optional), Day/Month/Year or Day.Month.Year, Time (24h or 12h with AM/PM)
        // Note: Date format is d/m/y or d.m.y (day/month/year)
        const launchMatch = launchTime.match(/(?:[A-Za-zА-Яа-яЁё]+\.?,?\s*)?(\d{1,2})[./](\d{1,2})[./](\d{2,4})\s+(\d{1,2}):(\d{2}):(\d{2})(?:\s*(am|pm))?/i);
        if (!launchMatch) {
          throw new Error(`Invalid launch time format: ${launchTime}`);
        }

        let [, day, month, year, hours, minutes, seconds, ampm] = launchMatch;
        let launchHours = parseInt(hours, 10);
        // Handle AM/PM if present (12-hour format), otherwise assume 24-hour format
        if (ampm) {
          if (ampm.toLowerCase() === 'pm' && launchHours !== 12) launchHours += 12;
          if (ampm.toLowerCase() === 'am' && launchHours === 12) launchHours = 0;
        }

        const fullYear = year.length === 2 ? 2000 + parseInt(year, 10) : parseInt(year, 10);
        // Date format is d/m/y or d.m.y (day/month/year)
        const launchDate = new Date(fullYear, parseInt(month, 10) - 1, parseInt(day, 10), launchHours, parseInt(minutes, 10), parseInt(seconds, 10));

        // Parse arrival time: "1:00:03" or "12:59:59 am" (24h or 12h format)
        const arrivalMatch = arrival.match(/(\d{1,2}):(\d{2}):(\d{2})(?:\s*(am|pm))?/i);
        if (!arrivalMatch) {
          throw new Error(`Invalid arrival time format: ${arrival}`);
        }

        let [, arrHours, arrMinutes, arrSeconds, arrAmpm] = arrivalMatch;
        let arrivalHours = parseInt(arrHours, 10);
        // Handle AM/PM if present (12-hour format), otherwise assume 24-hour format
        if (arrAmpm) {
          if (arrAmpm.toLowerCase() === 'pm' && arrivalHours !== 12) arrivalHours += 12;
          if (arrAmpm.toLowerCase() === 'am' && arrivalHours === 12) arrivalHours = 0;
        }

        // Parse travel time: "2h 45 28s" or "2h 45m 28s" (handles various formats)
        const travelMatch = travelTime.match(/(\d+)h\s+(\d{1,2})\s+(\d{1,2})s/i);
        if (!travelMatch) {
          throw new Error(`Invalid travel time format: ${travelTime}`);
        }

        const [, travelHours, travelMinutes, travelSeconds] = travelMatch;

        // Calculate arrival date (launch date + travel time)
        const travelMs = (parseInt(travelHours) * 3600 + parseInt(travelMinutes) * 60 + parseInt(travelSeconds)) * 1000;
        const arrivalDate = new Date(launchDate.getTime() + travelMs);
        
        // Set the arrival time from the arrival field
        arrivalDate.setHours(arrivalHours, parseInt(arrMinutes, 10), parseInt(arrSeconds, 10));

        // Format date as YYYY-MM-DD
        const arrivalDateStr = `${arrivalDate.getFullYear()}-${String(arrivalDate.getMonth() + 1).padStart(2, '0')}-${String(arrivalDate.getDate()).padStart(2, '0')}`;

        attacks.push({
          id: baseTimestamp + attackIndex++, // Ensure unique IDs
          villageName,
          date: arrivalDateStr,
          travelTime: {
            hours: parseInt(travelHours) || 0,
            minutes: parseInt(travelMinutes) || 0,
            seconds: parseInt(travelSeconds) || 0
          },
          arrivalTime: {
            hours: arrivalHours,
            minutes: parseInt(arrMinutes) || 0,
            seconds: parseInt(arrSeconds) || 0
          },
          sendTime: {
            hours: launchHours,
            minutes: parseInt(minutes) || 0,
            seconds: parseInt(seconds) || 0
          },
          attackType,
          travianLink: '',
          sent: false,
          countdown: '00:00:00' // Will be recalculated by parent component
        });
      } catch (error) {
        // Collect errors but continue parsing other lines
        const lineNumber = index + (lines.length - dataLines.length + 1); // Account for header if present
        errors.push(`Line ${lineNumber}: ${error.message}`);
        console.error(`Error parsing line ${lineNumber}:`, error);
      }
    });

    if (attacks.length === 0) {
      throw new Error('No valid attacks found in the data');
    }

    // If there were errors but we still got some attacks, include warning in result
    if (errors.length > 0) {
      // Still return attacks, but the caller can show a warning
      console.warn('Some lines had errors:', errors);
    }

    return attacks;
  };

  const handleImport = () => {
    if (!pasteData.trim()) {
      setErrorMessage('Please paste Getter Tools data first');
      setShowErrorNotification(true);
      return;
    }

    try {
      const parsedAttacks = parseGetterToolsFormat(pasteData);
      setImportedCount(parsedAttacks.length);
      onImportAttacks(parsedAttacks);
      setPasteData('');
      setShowImportNotification(true);
    } catch (error) {
      console.error('Import error:', error);
      setErrorMessage(error.message || 'Invalid Getter Tools format');
      setShowErrorNotification(true);
    }
  };

  return (
    <>
      <div className="getter-tools-importer">
        <div className="importer-section">
          <div className="importer-header">
            <h3>Import from Getter Tools</h3>
            <div className="info-icon-wrapper">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <div className="info-tooltip">
                You will have to input send links manually!
              </div>
            </div>
          </div>
          <div className="importer-content">
            <textarea
              className="importer-textarea"
              value={pasteData}
              onChange={(e) => setPasteData(e.target.value)}
              placeholder="Open Getter Tools plan press Ctrl+A, copy and paste it here. You will have to input send links manually!"
              rows="5"
            />
            <button 
              className="importer-btn"
              onClick={handleImport}
              disabled={!pasteData.trim()}
              title="Import attacks from Getter Tools format"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              Import from Getter Tools
            </button>
          </div>
        </div>
      </div>

      {/* Import Notification */}
      <SaveModal
        isVisible={showImportNotification}
        onClose={() => setShowImportNotification(false)}
        message={`Successfully imported ${importedCount} attack${importedCount !== 1 ? 's' : ''} from Getter Tools!`}
        duration={2000}
        position="bottom-middle"
      />

      {/* Error Notification */}
      <SaveModal
        isVisible={showErrorNotification}
        onClose={() => setShowErrorNotification(false)}
        message={errorMessage}
        duration={3000}
        position="bottom-middle"
        progressColor="#dc3545"
      />
    </>
  );
};

export default GetterToolsImporter;

