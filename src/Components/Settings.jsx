import React from 'react';
import './Settings.css';

const Settings = ({ settings, onSettingsChange, isOpen, onClose, darkMode }) => {
  if (!isOpen) return null;

  const handleSettingChange = (key, value) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className={`settings-overlay ${darkMode ? 'dark' : 'light'}`} onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h3>Settings</h3>
          <button className="close-settings" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="settings-content">
          <div className="setting-group">
            <h4>Report Display</h4>
            
            <div className="setting-item">
              <label className="setting-label">
                <input
                  type="checkbox"
                  checked={settings.lightReportOnDarkTheme !== false}
                  onChange={(e) => handleSettingChange('lightReportOnDarkTheme', e.target.checked)}
                />
                <span className="setting-text">Use light reports on dark theme</span>
              </label>
              <p className="setting-description">
                Show white/light colored reports even when using dark theme
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
