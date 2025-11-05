// Popup script for extension management

document.addEventListener('DOMContentLoaded', async () => {
  const statusDiv = document.getElementById('status');
  const toggleBtn = document.getElementById('toggleOverlay');
  const importBtn = document.getElementById('importData');
  const darkModeCheckbox = document.getElementById('darkMode');
  const autoSyncCheckbox = document.getElementById('autoSync');

  // Check if overlay is active
  const checkStatus = async () => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0) return;
    
    const tab = tabs[0];
    const isTravian = tab.url && (
      tab.url.includes('travian.com') ||
      tab.url.includes('travian.net') ||
      tab.url.includes('travian.us') ||
      tab.url.includes('travian.co.uk') ||
      tab.url.includes('travian.de')
    );

    if (isTravian) {
      statusDiv.textContent = '✓ Active on Travian page';
      statusDiv.className = 'status active';
      toggleBtn.disabled = false;
    } else {
      statusDiv.textContent = 'Not on a Travian page';
      statusDiv.className = 'status inactive';
      toggleBtn.disabled = true;
    }
  };

  // Load settings
  const loadSettings = async () => {
    const result = await chrome.storage.local.get(['darkMode', 'autoSync', 'overlayVisible']);
    darkModeCheckbox.checked = result.darkMode !== false;
    autoSyncCheckbox.checked = result.autoSync === true;
  };

  // Toggle overlay
  toggleBtn.addEventListener('click', async () => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0) return;
    
    const tab = tabs[0];
    chrome.tabs.sendMessage(tab.id, { action: 'toggleOverlay' });
    window.close();
  });

  // Import data
  importBtn.addEventListener('click', async () => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0) return;
    
    const tab = tabs[0];
    chrome.tabs.sendMessage(tab.id, { action: 'importFromWebApp' });
    window.close();
  });

  // Save settings
  darkModeCheckbox.addEventListener('change', async (e) => {
    await chrome.storage.local.set({ darkMode: e.target.checked });
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length > 0) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'updateSettings' });
    }
  });

  autoSyncCheckbox.addEventListener('change', async (e) => {
    await chrome.storage.local.set({ autoSync: e.target.checked });
  });

  await checkStatus();
  await loadSettings();
});

