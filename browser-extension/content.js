// Content script that injects overlay into Travian pages

(function() {
  'use strict';

  let overlayContainer = null;
  let overlayVisible = true;
  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };

  // Initialize extension
  async function init() {
    // Load settings
    const settings = await chrome.storage.local.get(['darkMode', 'overlayVisible', 'overlayPosition']);
    overlayVisible = settings.overlayVisible !== false;
    
    // Create overlay
    createOverlay();
    await loadData();
    startClock();
    startCountdownUpdates();
    
    // Restore position
    if (settings.overlayPosition) {
      overlayContainer.style.left = settings.overlayPosition.x + 'px';
      overlayContainer.style.top = settings.overlayPosition.y + 'px';
    }
    
    // Apply dark mode
    if (settings.darkMode !== false) {
      overlayContainer.classList.add('dark');
    }
    
    // Set initial visibility
    if (!overlayVisible) {
      overlayContainer.classList.add('collapsed');
    }
  }

  // Create overlay HTML structure
  function createOverlay() {
    overlayContainer = document.createElement('div');
    overlayContainer.id = 'travian-raid-tracker-overlay';
    overlayContainer.innerHTML = `
      <div class="overlay-header">
        <div class="overlay-title">
          <span>Raid Tracker</span>
          <div class="warning-badge" title="Travian discourages browser extensions. Use at your own risk.">⚠️</div>
        </div>
        <div class="overlay-controls">
          <button class="overlay-btn minimize-btn" title="Minimize">−</button>
          <button class="overlay-btn close-btn" title="Close">×</button>
        </div>
      </div>
      <div class="overlay-content">
        <div class="disclaimer">
          <strong>⚠️ DISCLAIMER:</strong> This extension is informational only and does NOT interact with the game. Use at your own risk.
        </div>
        <div class="clock-section">
          <div class="clock-label">Time</div>
          <div class="clock-time" id="overlay-clock">--:--:--</div>
          <div class="clock-city" id="overlay-city">Loading...</div>
        </div>
        <div class="attacks-section">
          <div class="attacks-header">
            <span>Attack Planner</span>
            <span class="attacks-count" id="attacks-count">0</span>
          </div>
          <div class="attacks-table-container" id="attacks-table-container">
            <div class="no-attacks">No attacks scheduled</div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlayContainer);
    
    // Make overlay draggable
    makeDraggable();
    
    // Add event listeners
    overlayContainer.querySelector('.minimize-btn').addEventListener('click', toggleMinimize);
    overlayContainer.querySelector('.close-btn').addEventListener('click', toggleClose);
  }

  // Make overlay draggable
  function makeDraggable() {
    const header = overlayContainer.querySelector('.overlay-header');
    
    header.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('overlay-btn')) return;
      
      isDragging = true;
      const rect = overlayContainer.getBoundingClientRect();
      dragOffset.x = e.clientX - rect.left;
      dragOffset.y = e.clientY - rect.top;
      overlayContainer.style.cursor = 'grabbing';
      
      document.addEventListener('mousemove', handleDrag);
      document.addEventListener('mouseup', stopDrag);
    });
  }

  function handleDrag(e) {
    if (!isDragging) return;
    
    const x = e.clientX - dragOffset.x;
    const y = e.clientY - dragOffset.y;
    
    // Keep overlay within viewport
    const maxX = window.innerWidth - overlayContainer.offsetWidth;
    const maxY = window.innerHeight - overlayContainer.offsetHeight;
    
    overlayContainer.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
    overlayContainer.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
    
    // Save position
    chrome.storage.local.set({
      overlayPosition: {
        x: parseInt(overlayContainer.style.left),
        y: parseInt(overlayContainer.style.top)
      }
    });
  }

  function stopDrag() {
    isDragging = false;
    overlayContainer.style.cursor = '';
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', stopDrag);
  }

  function toggleMinimize() {
    overlayContainer.classList.toggle('minimized');
  }

  function toggleClose() {
    overlayVisible = !overlayVisible;
    overlayContainer.classList.toggle('hidden');
    chrome.storage.local.set({ overlayVisible });
  }

  // Load data from extension storage
  async function loadData() {
    const data = await chrome.storage.local.get([
      'attackPlans',
      'timeIsClockSelectedCity',
      'serverOffsetHours'
    ]);
    
    await updateAttacksTable(data.attackPlans || []);
    updateClockCity(data.timeIsClockSelectedCity || 'London');
  }

  // Update attacks table
  async function updateAttacksTable(attacks) {
    const container = document.getElementById('attacks-table-container');
    const countEl = document.getElementById('attacks-count');
    
    const unsentAttacks = attacks.filter(a => !a.sent);
    countEl.textContent = unsentAttacks.length;
    
    if (!attacks || unsentAttacks.length === 0) {
      container.innerHTML = '<div class="no-attacks">No attacks scheduled</div>';
      return;
    }
    
    // Calculate countdowns for all attacks
    const attacksWithCountdown = await Promise.all(
      unsentAttacks.map(async (attack) => {
        const countdown = await calculateCountdown(attack);
        return { ...attack, countdown };
      })
    );
    
    // Sort attacks by countdown (urgent first)
    const sortedAttacks = attacksWithCountdown.sort((a, b) => {
      return a.countdown.localeCompare(b.countdown);
    });
    
    let html = '<table><thead><tr><th>Village</th><th>Send</th><th>Arrival</th><th>Countdown</th></tr></thead><tbody>';
    
    sortedAttacks.forEach(attack => {
      const countdown = attack.countdown;
      const sendTime = formatTime(attack.sendTime || { hours: 0, minutes: 0, seconds: 0 });
      const arrivalTime = formatTime(attack.arrivalTime || { hours: 0, minutes: 0, seconds: 0 });
      const isUrgent = isCountdownUrgent(countdown);
      const isExpired = countdown === '00:00:00';
      
      html += `
        <tr class="${isExpired ? 'expired' : ''} ${isUrgent ? 'urgent' : ''}">
          <td>${escapeHtml(attack.villageName || '-')}</td>
          <td>${sendTime}</td>
          <td>${arrivalTime}</td>
          <td class="countdown">${countdown}</td>
        </tr>
      `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
  }

  // Calculate countdown for an attack
  async function calculateCountdown(attack) {
    if (!attack.sendTime || !attack.date) return '00:00:00';
    
    // Get server offset from storage
    const data = await chrome.storage.local.get(['serverOffsetHours']);
    const serverOffsetHours = parseFloat(data.serverOffsetHours) || 0;
    
    // Parse send date and time
    const [year, month, day] = attack.date.split('-').map(Number);
    const sendDate = new Date(year, month - 1, day, attack.sendTime.hours, attack.sendTime.minutes, attack.sendTime.seconds || 0);
    
    // Adjust for server offset (if sendTime is in server time)
    // Server time = local time + serverOffsetHours
    // So local time = server time - serverOffsetHours
    sendDate.setHours(sendDate.getHours() - serverOffsetHours);
    
    const now = new Date();
    
    if (sendDate <= now) {
      return '00:00:00';
    }
    
    const diff = sendDate - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  function formatTime(time) {
    if (!time) return '00:00:00';
    const h = String(time.hours || 0).padStart(2, '0');
    const m = String(time.minutes || 0).padStart(2, '0');
    const s = String(time.seconds || 0).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  function isCountdownUrgent(countdown) {
    if (countdown === '00:00:00') return false;
    const [hours] = countdown.split(':').map(Number);
    return hours < 1; // Less than 1 hour remaining
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Timezone cities data (simplified version)
  const timezoneCities = [
    { label: "UTC -12 — Baker Island", cityPath: "Baker_Island", offset: -12 },
    { label: "UTC -11 — Pago Pago", cityPath: "Pago_Pago", offset: -11 },
    { label: "UTC -10 — Honolulu", cityPath: "Honolulu", offset: -10 },
    { label: "UTC -9 — Anchorage", cityPath: "Anchorage", offset: -9 },
    { label: "UTC -8 — Los Angeles", cityPath: "Los_Angeles", offset: -8 },
    { label: "UTC -7 — Denver", cityPath: "Denver", offset: -7 },
    { label: "UTC -6 — Mexico City", cityPath: "Mexico_City", offset: -6 },
    { label: "UTC -5 — New York", cityPath: "New_York", offset: -5 },
    { label: "UTC -4 — Caracas", cityPath: "Caracas", offset: -4 },
    { label: "UTC -3 — Buenos Aires", cityPath: "Buenos_Aires", offset: -3 },
    { label: "UTC -2 — Fernando de Noronha", cityPath: "Fernando_de_Noronha", offset: -2 },
    { label: "UTC -1 — Azores", cityPath: "Azores", offset: -1 },
    { label: "UTC +0 — London", cityPath: "London", offset: 0 },
    { label: "UTC +1 — Paris", cityPath: "Paris", offset: 1 },
    { label: "UTC +2 — Cairo", cityPath: "Cairo", offset: 2 },
    { label: "UTC +3 — Moscow", cityPath: "Moscow", offset: 3 },
    { label: "UTC +4 — Dubai", cityPath: "Dubai", offset: 4 },
    { label: "UTC +5 — Karachi", cityPath: "Karachi", offset: 5 },
    { label: "UTC +6 — Dhaka", cityPath: "Dhaka", offset: 6 },
    { label: "UTC +7 — Bangkok", cityPath: "Bangkok", offset: 7 },
    { label: "UTC +8 — Beijing", cityPath: "Beijing", offset: 8 },
    { label: "UTC +9 — Tokyo", cityPath: "Tokyo", offset: 9 },
    { label: "UTC +10 — Sydney", cityPath: "Sydney", offset: 10 },
    { label: "UTC +11 — Honiara", cityPath: "Honiara", offset: 11 },
    { label: "UTC +12 — Auckland", cityPath: "Auckland", offset: 12 },
    { label: "UTC +13 — Nuku'alofa", cityPath: "Nuku'alofa", offset: 13 },
    { label: "UTC +14 — Kiritimati", cityPath: "Kiritimati", offset: 14 }
  ];

  // Clock functionality
  async function startClock() {
    const data = await chrome.storage.local.get(['timeIsClockSelectedCity', 'serverOffsetHours']);
    const cityPath = data.timeIsClockSelectedCity || 'London';
    updateClockCity(cityPath);
    
    // Load time.is widget
    loadTimeIsWidget(cityPath);
  }

  function updateClockCity(cityPath) {
    const cityEl = document.getElementById('overlay-city');
    const city = timezoneCities.find(c => c.cityPath === cityPath) || timezoneCities.find(c => c.cityPath === 'London');
    const cityName = city ? city.label.split(' — ')[1] : cityPath.replace(/_/g, ' ');
    cityEl.textContent = cityName;
  }

  function loadTimeIsWidget(cityPath) {
    const clockEl = document.getElementById('overlay-clock');
    const widgetId = 'overlay_time_widget';
    
    // Load time.is widget script
    if (!document.querySelector('script[src*="widget.time.is/t.js"]')) {
      const script = document.createElement('script');
      script.src = '//widget.time.is/t.js';
      script.async = true;
      script.onload = () => {
        initializeWidget(widgetId, cityPath);
      };
      document.head.appendChild(script);
    } else {
      setTimeout(() => initializeWidget(widgetId, cityPath), 100);
    }
  }

  function initializeWidget(spanId, cityPath) {
    if (!window.time_is_widget) {
      setTimeout(() => initializeWidget(spanId, cityPath), 100);
      return;
    }
    
    // Use Čakovec as base (UTC+1)
    const cakovecOffset = 1;
    const city = timezoneCities.find(c => c.cityPath === cityPath) || timezoneCities.find(c => c.cityPath === 'London');
    const cityOffset = city ? city.offset : 0;
    const hourAdjustment = cityOffset - cakovecOffset;
    
    const initArg = {};
    initArg[spanId] = { id: 'Čakovec_z734' };
    
    // Create span if it doesn't exist
    let spanEl = document.getElementById(spanId);
    if (!spanEl) {
      spanEl = document.createElement('span');
      spanEl.id = spanId;
      spanEl.style.display = 'none';
      document.body.appendChild(spanEl);
    }
    
    try {
      window.time_is_widget.init(initArg);
    } catch (e) {
      console.warn('Failed to initialize time.is widget:', e);
    }
    
    // Function to adjust time
    const adjustTime = (timeString, hoursToAdd) => {
      if (!timeString || hoursToAdd === 0) return timeString;
      
      const timeMatch = timeString.match(/(\d{2}):(\d{2})(?::(\d{2}))?/);
      if (!timeMatch) return timeString;

      const hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const seconds = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;

      const date = new Date();
      date.setHours(hours, minutes, seconds, 0);
      date.setHours(date.getHours() + hoursToAdd);

      const adjustedHours = date.getHours().toString().padStart(2, '0');
      const adjustedMinutes = date.getMinutes().toString().padStart(2, '0');
      const adjustedSeconds = date.getSeconds().toString().padStart(2, '0');
      
      return `${adjustedHours}:${adjustedMinutes}:${adjustedSeconds}`;
    };
    
    // Monitor and adjust time
    let lastCakovecTime = '';
    const observer = new MutationObserver(() => {
      const cakovecTime = spanEl.textContent.trim();
      if (cakovecTime && cakovecTime.match(/^\d{2}:\d{2}(:\d{2})?$/) && cakovecTime !== lastCakovecTime) {
        lastCakovecTime = cakovecTime;
        const adjustedTime = adjustTime(cakovecTime, hourAdjustment);
        document.getElementById('overlay-clock').textContent = adjustedTime;
      }
    });
    
    observer.observe(spanEl, { childList: true, characterData: true, subtree: true });
    
    // Initial update
    setTimeout(() => {
      const cakovecTime = spanEl.textContent.trim();
      if (cakovecTime && cakovecTime.match(/^\d{2}:\d{2}(:\d{2})?$/)) {
        const adjustedTime = adjustTime(cakovecTime, hourAdjustment);
        document.getElementById('overlay-clock').textContent = adjustedTime;
      }
    }, 500);
  }

  // Update countdowns periodically
  function startCountdownUpdates() {
    setInterval(async () => {
      const data = await chrome.storage.local.get(['attackPlans']);
      if (data.attackPlans && data.attackPlans.length > 0) {
        await updateAttacksTable(data.attackPlans);
      }
    }, 1000); // Update every second
  }

  // Listen for messages from popup or background
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleOverlay') {
      overlayVisible = !overlayVisible;
      overlayContainer.classList.toggle('hidden');
      chrome.storage.local.set({ overlayVisible });
    } else if (request.action === 'importFromWebApp') {
      importFromWebApp();
    } else if (request.action === 'updateSettings') {
      chrome.storage.local.get(['darkMode'], (result) => {
        if (result.darkMode !== false) {
          overlayContainer.classList.add('dark');
        } else {
          overlayContainer.classList.remove('dark');
        }
      });
    }
    sendResponse({ success: true });
  });

  // Import data from web app's localStorage
  async function importFromWebApp() {
    try {
      // Check if we're on the web app domain
      const currentHost = window.location.hostname;
      const isWebApp = currentHost.includes('github.io') || 
                       currentHost.includes('localhost') || 
                       currentHost.includes('127.0.0.1') ||
                       currentHost === 'knzj777.github.io';
      
      if (!isWebApp) {
        // Try to inject a script into the page to access localStorage
        // This will only work if we're on the same origin
        showNotification('Please visit the Raid Tracker web app page to import data.', true);
        return;
      }
      
      // Read from current page's localStorage (if web app is open)
      const attackPlans = localStorage.getItem('attackPlans');
      const timeIsClockSelectedCity = localStorage.getItem('timeIsClockSelectedCity');
      const serverOffsetHours = localStorage.getItem('attackPlanner_serverOffsetHours');
      
      const dataToSave = {};
      
      if (attackPlans) {
        try {
          dataToSave.attackPlans = JSON.parse(attackPlans);
        } catch (e) {
          console.error('Failed to parse attackPlans:', e);
        }
      }
      
      if (timeIsClockSelectedCity) {
        dataToSave.timeIsClockSelectedCity = timeIsClockSelectedCity;
      }
      
      if (serverOffsetHours) {
        dataToSave.serverOffsetHours = serverOffsetHours;
      }
      
      if (Object.keys(dataToSave).length === 0) {
        showNotification('No data found to import.', true);
        return;
      }
      
      await chrome.storage.local.set(dataToSave);
      
      // Reload data
      await loadData();
      startClock();
      
      // Show notification
      showNotification('Data imported successfully!');
    } catch (error) {
      console.error('Import error:', error);
      showNotification('Import failed. Make sure you\'re on the Raid Tracker web app page.', true);
    }
  }

  function showNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.className = `overlay-notification ${isError ? 'error' : ''}`;
    notification.textContent = message;
    overlayContainer.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      init().catch(console.error);
    });
  } else {
    init().catch(console.error);
  }
})();

