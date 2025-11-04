import React, { useEffect, useState, useRef } from "react";
import timezoneCities from "../data/timezoneCities";
import "./TimeIsClock.css";

function TimeIsClock() {
  // Load from localStorage or default to "London"
  const getInitialCityPath = () => {
    try {
      const saved = localStorage.getItem('timeIsClockSelectedCity');
      if (saved) {
        // Verify the saved city exists in our list
        const exists = timezoneCities.some(opt => opt.cityPath === saved);
        if (exists) {
          return saved;
        }
      }
    } catch (error) {
      console.warn('Error reading from localStorage:', error);
    }
    return "London";
  };

  const [selectedCityPath, setSelectedCityPath] = useState(getInitialCityPath);
  const spanId = "_z734"; // Fixed ID for Čakovec widget
  const observerRef = useRef(null);

  // Find the selected timezone option
  const selectedOption = timezoneCities.find(opt => opt.cityPath === selectedCityPath) || timezoneCities.find(opt => opt.cityPath === "London");
  
  // Extract UTC offset from label (e.g., "UTC +2" -> 2, "UTC -1" -> -1, "UTC +0" -> 0)
  const parseUTCOffset = (label) => {
    const match = label.match(/UTC\s*([+-])\s*(\d+)/);
    if (!match) return 0;
    const sign = match[1] === '-' ? -1 : 1;
    const hours = parseInt(match[2], 10);
    return sign * hours;
  };

  const selectedUTCOffset = parseUTCOffset(selectedOption.label);
  const cakovecUTCOffset = 1; // Čakovec is UTC+1
  const hourAdjustment = selectedUTCOffset - cakovecUTCOffset;

  // Extract city name from label (format: "UTC +1 — Paris")
  const cityDisplayName = selectedOption.label.split(" — ")[1] || selectedOption.cityPath.replace(/_/g, ' ');
  
  // Build time.is URL for the selected city (convert to lowercase and replace underscores with hyphens)
  const cityPathForUrl = selectedOption.cityPath.toLowerCase().replace(/_/g, '-');
  const timeIsUrl = `https://time.is/${cityPathForUrl}`;

  // Function to adjust time by adding/subtracting hours
  const adjustTime = (timeString, hoursToAdd) => {
    if (!timeString || hoursToAdd === 0) return timeString;
    
    // Parse time string (format: HH:MM:SS or HH:MM)
    const timeMatch = timeString.match(/(\d{2}):(\d{2})(?::(\d{2}))?/);
    if (!timeMatch) return timeString;

    const hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const seconds = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;

    // Create a date object for today with this time
    const date = new Date();
    date.setHours(hours, minutes, seconds, 0);

    // Add hours
    date.setHours(date.getHours() + hoursToAdd);

    // Format back to HH:MM:SS
    const adjustedHours = date.getHours().toString().padStart(2, '0');
    const adjustedMinutes = date.getMinutes().toString().padStart(2, '0');
    const adjustedSeconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${adjustedHours}:${adjustedMinutes}:${adjustedSeconds}`;
  };

  // Load the Time.is widget script and initialize with Čakovec
  useEffect(() => {
    let cancelled = false;

    function initializeWidget() {
      if (cancelled) return;
      
      if (window.time_is_widget && typeof window.time_is_widget.init === "function") {
        // Ensure the span element exists in the DOM
        const spanElement = document.getElementById(spanId);
        if (!spanElement) {
          console.warn(`Span element with id "${spanId}" not found`);
          return;
        }

        // Clear any existing content in the span
        spanElement.textContent = "";

        // Always use Čakovec as the base city
        const initArg = {};
        initArg[spanId] = { id: "Čakovec_z734" };
        
        try {
          // Initialize the widget with Čakovec
          window.time_is_widget.init(initArg);
        } catch (error) {
          console.warn("Error initializing time.is widget:", error);
        }
      }
    }

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="widget.time.is/t.js"]');
    if (existingScript) {
      if (window.time_is_widget) {
        // Small delay to ensure DOM is ready
        setTimeout(initializeWidget, 50);
      } else {
        existingScript.addEventListener("load", () => {
          if (!cancelled) {
            setTimeout(initializeWidget, 50);
          }
        });
      }
    } else {
      // Load the script
      const script = document.createElement("script");
      script.src = "//widget.time.is/t.js";
      script.async = true;
      script.onload = () => {
        if (!cancelled) {
          setTimeout(initializeWidget, 50);
        }
      };
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
    };
  }, []); // Only run once on mount

  // Monitor and adjust the displayed time
  useEffect(() => {
    const spanElement = document.getElementById(spanId);
    if (!spanElement) return;

    // Clear previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Track the last Čakovec time we saw from widget
    let lastCakovecTime = '';
    let isWriting = false; // Flag to prevent observer from triggering during our write

    // Function to remove onclick attributes from nested spans (added by time.is widget)
    const removeOnclickAttributes = () => {
      const nestedSpans = spanElement.querySelectorAll('span');
      nestedSpans.forEach(span => {
        if (span.hasAttribute('onclick')) {
          span.removeAttribute('onclick');
        }
        if (span.hasAttribute('title')) {
          span.removeAttribute('title');
        }
        // Also prevent pointer events
        span.style.cursor = 'default';
        span.style.pointerEvents = 'none';
      });
    };

    // Function to apply time adjustment
    const applyAdjustment = () => {
      if (isWriting) return; // Don't process while we're writing
      
      const currentText = spanElement.textContent.trim();
      if (!currentText || !currentText.match(/\d{2}:\d{2}/)) return;

      if (hourAdjustment === 0) {
        // No adjustment needed - clear any adjustment flags
        spanElement.dataset.adjusted = 'false';
        lastCakovecTime = currentText;
        // Remove onclick attributes added by widget
        removeOnclickAttributes();
        return;
      }
      
      // Check if widget has updated with new Čakovec time
      // Since we disconnect the observer before writing, we should only see widget updates here
      const isNewWidgetUpdate = currentText !== lastCakovecTime && 
                                 currentText.match(/^\d{2}:\d{2}(:\d{2})?$/);
      
      if (isNewWidgetUpdate) {
        // Widget updated with new Čakovec time, adjust it immediately
        isWriting = true;
        
        // Temporarily disconnect observer to prevent it from seeing our write
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
        
        lastCakovecTime = currentText;
        const adjustedTime = adjustTime(currentText, hourAdjustment);
        
        // Write adjusted time synchronously
        spanElement.textContent = adjustedTime;
        spanElement.dataset.adjusted = 'true';
        spanElement.dataset.originalTime = currentText;
        
        // Remove onclick attributes added by widget
        removeOnclickAttributes();
        
        // Reconnect observer immediately - our write is done, observer won't see it
        // Use requestAnimationFrame to ensure DOM update is complete
        requestAnimationFrame(() => {
          isWriting = false;
          if (observerRef.current && spanElement) {
            observerRef.current.observe(spanElement, {
              childList: true,
              characterData: true,
              subtree: true
            });
            
            // Remove onclick attributes again after reconnect
            removeOnclickAttributes();
            
            // Check if widget wrote a new time while we were disconnected
            // If so, adjust it immediately
            const currentTextAfterReconnect = spanElement.textContent.trim();
            if (currentTextAfterReconnect !== adjustedTime && 
                currentTextAfterReconnect.match(/^\d{2}:\d{2}(:\d{2})?$/)) {
              // Widget wrote a new time while we were disconnected, adjust it
              setTimeout(() => {
                applyAdjustment();
              }, 10);
            }
          }
        });
      }
    };

    // Use MutationObserver to watch for widget updates
    observerRef.current = new MutationObserver((mutations) => {
      if (isWriting) return; // Ignore mutations while we're writing
      
      // Remove onclick attributes whenever widget updates
      removeOnclickAttributes();
      
      // Apply adjustment immediately - no delay to prevent flickering
      applyAdjustment();
    });

    observerRef.current.observe(spanElement, {
      childList: true,
      characterData: true,
      subtree: true
    });

    // Initial adjustment check after a delay
    setTimeout(() => {
      applyAdjustment();
      // Also remove onclick attributes after initial load
      removeOnclickAttributes();
    }, 500);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hourAdjustment, spanId]);

  function handleChange(e) {
    const newCityPath = e.target.value;
    setSelectedCityPath(newCityPath);
    
    // Save to localStorage
    try {
      localStorage.setItem('timeIsClockSelectedCity', newCityPath);
    } catch (error) {
      console.warn('Error saving to localStorage:', error);
    }
  }

  return (
    <div className="time-is-clock-wrapper">
      <div className="time-is-clock-container">
        <div className="time-is-clock-controls">
          <label className="time-is-clock-label">
            <span>Time zone</span>
            <select className="time-is-clock-select" value={selectedCityPath} onChange={handleChange}>
              {timezoneCities.map(opt => (
                <option key={opt.cityPath} value={opt.cityPath}>{opt.label}</option>
              ))}
            </select>
          </label>
          <a
            href={timeIsUrl}
            id="time_is_link"
            className="time-is-clock-link"
            target="_blank"
            rel="nofollow noopener noreferrer"
          >
            {`Time in ${cityDisplayName}:`}
          </a>
          <div className="time-is-clock-info-container">
            <svg 
              className="time-is-clock-info-icon" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4"/>
              <path d="M12 8h.01"/>
            </svg>
            <div className="time-is-clock-tooltip">
              Atomic clock time used by <a href="https://www.time.is" target="_blank" rel="noopener noreferrer">time.is</a>.<br/>
              Send attack exactly when send time and clock time matches and you will hit perfect timing.
            </div>
          </div>
        </div>
      </div>
      <span id={spanId} className="time-is-clock-time"></span>
    </div>
  );
}

export default TimeIsClock;
