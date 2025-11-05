import React, { useState, useEffect } from 'react';
import './ExtensionInstaller.css';
import SaveModal from './modals/SaveModal';

const ExtensionInstaller = () => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    // Check if extension is installed by trying to detect it
    // Extension injects a marker into the page
    const checkExtension = () => {
      // Try to detect extension via postMessage or checking for extension marker
      // Since we can't directly check, we'll assume it's not installed initially
      // and let user click to check
      const hasExtension = document.getElementById('travian-raid-tracker-overlay') !== null;
      setIsInstalled(hasExtension);
    };

    checkExtension();
    // Check periodically
    const interval = setInterval(checkExtension, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleInstallClick = () => {
    setShowDisclaimer(true);
  };

  const handleDisclaimerAccept = () => {
    setShowDisclaimer(false);
    setShowInstructions(true);
  };

  const handleDownloadClick = () => {
    // Open GitHub repository page with direct link to browser-extension folder
    const repoUrl = 'https://github.com/knzj777/travian-raid-tracker/tree/main/browser-extension';
    window.open(repoUrl, '_blank');
  };

  const handleDownloadZip = () => {
    // Direct download link for browser-extension folder as ZIP
    // GitHub allows downloading a folder as ZIP by appending /archive/refs/heads/main.zip
    // But we need the specific folder, so we'll link to the repo and instruct user
    const repoUrl = 'https://github.com/knzj777/travian-raid-tracker';
    window.open(repoUrl, '_blank');
  };

  return (
    <>
      <div className="extension-installer">
        <div className="extension-installer-header">
          <h3>Browser Extension</h3>
          {isInstalled ? (
            <span className="extension-status installed">✓ Installed</span>
          ) : (
            <span className="extension-status not-installed">Not Installed</span>
          )}
        </div>
        
        <div className="extension-installer-content">
          <div className="extension-disclaimer-box">
            <strong>⚠️ IMPORTANT DISCLAIMER:</strong>
            <p>
              Travian officially discourages browser extensions. This extension is <strong>informational only</strong> and does NOT interact with the game. 
              Use at your own risk - may violate Travian's Terms of Service.
            </p>
          </div>

          {isInstalled ? (
            <div className="extension-installed-message">
              <p>Extension is active! Visit any Travian page to see the overlay.</p>
              <button 
                className="extension-btn secondary"
                onClick={() => window.open('chrome://extensions/', '_blank')}
              >
                Manage Extension
              </button>
            </div>
          ) : (
            <div className="extension-install-section">
              <p>Install the browser extension to see TimeIsClock and Attack Planner overlay while playing Travian.</p>
              
              {!showInstructions ? (
                <button 
                  className="extension-btn install-btn"
                  onClick={handleInstallClick}
                >
                  Install Browser Extension
                </button>
              ) : (
                <div className="extension-instructions">
                  <h4>What You Need to Download:</h4>
                  <div className="extension-download-info">
                    <p><strong>You need the entire <code>browser-extension</code> folder</strong> containing these files:</p>
                    <ul className="extension-file-list">
                      <li><code>manifest.json</code></li>
                      <li><code>content.js</code></li>
                      <li><code>popup.html</code> & <code>popup.js</code></li>
                      <li><code>background.js</code></li>
                      <li><code>overlay.css</code></li>
                      <li><code>icons/</code> folder</li>
                    </ul>
                  </div>

                  <h4>Download Options:</h4>
                  <div className="extension-download-options">
                    <div className="extension-download-option">
                      <strong>Option 1: Download from GitHub</strong>
                      <p>1. Click the button below to open the repository</p>
                      <p>2. Click the green "Code" button → "Download ZIP"</p>
                      <p>3. Extract the ZIP file</p>
                      <p>4. Navigate to the <code>browser-extension</code> folder inside</p>
                      <button 
                        className="extension-btn"
                        onClick={handleDownloadZip}
                      >
                        Open GitHub Repository
                      </button>
                    </div>

                    <div className="extension-download-option">
                      <strong>Option 2: Clone Repository</strong>
                      <p>If you have Git installed:</p>
                      <code className="extension-code-block">git clone https://github.com/knzj777/travian-raid-tracker.git</code>
                      <p>Then navigate to the <code>browser-extension</code> folder</p>
                    </div>
                  </div>

                  <h4>Installation Steps:</h4>
                  <ol>
                    <li>Make sure you have downloaded the <code>browser-extension</code> folder</li>
                    <li>Open Chrome/Edge and navigate to <code>chrome://extensions/</code> (or <code>edge://extensions/</code> for Edge)</li>
                    <li>Enable "Developer mode" (toggle in top-right corner)</li>
                    <li>Click "Load unpacked"</li>
                    <li>Select the <code>browser-extension</code> folder</li>
                    <li>The extension should now be installed!</li>
                  </ol>
                  
                  <div className="extension-instructions-actions">
                    <button 
                      className="extension-btn secondary"
                      onClick={() => setShowInstructions(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="extension-btn"
                      onClick={handleDownloadClick}
                    >
                      View Extension Folder on GitHub
                    </button>
                  </div>
                  
                  <div className="extension-instructions-note">
                    <strong>Note:</strong> Browsers don't allow automatic installation for security reasons. 
                    You must manually load the extension folder. Make sure you download the entire <code>browser-extension</code> folder with all files included.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <div className="extension-disclaimer-modal-overlay" onClick={() => setShowDisclaimer(false)}>
          <div className="extension-disclaimer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="extension-disclaimer-modal-header">
              <h3>⚠️ Important Disclaimer</h3>
            </div>
            <div className="extension-disclaimer-modal-content">
              <p><strong>Travian officially discourages browser extensions.</strong></p>
              <p>
                This browser extension is <strong>informational only</strong> and does NOT interact with the Travian game in any way.
              </p>
              <ul>
                <li>✅ Displays time clock overlay</li>
                <li>✅ Displays attack planner table overlay</li>
                <li>❌ Does NOT interact with the game</li>
                <li>❌ Does NOT automate any actions</li>
                <li>❌ Does NOT modify game elements</li>
              </ul>
              <p>
                <strong>Use at your own risk.</strong> This extension may violate Travian's Terms of Service and could potentially result in account penalties.
              </p>
              <p>
                By installing this extension, you acknowledge that you understand the risks and that the developers are not responsible for any consequences.
              </p>
            </div>
            <div className="extension-disclaimer-modal-footer">
              <button 
                className="extension-btn secondary"
                onClick={() => setShowDisclaimer(false)}
              >
                Cancel
              </button>
              <button 
                className="extension-btn"
                onClick={handleDisclaimerAccept}
              >
                I Understand, Continue Installation
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExtensionInstaller;

