# Travian Raid Tracker Browser Extension

## ⚠️ IMPORTANT DISCLAIMER

**Travian officially discourages browser extensions.** This extension is **informational only** and does NOT interact with the game in any way. It only displays data in an overlay.

**Use at your own risk** - this extension may violate Travian's Terms of Service and could potentially result in account penalties.

This extension:
- ✅ Displays time clock overlay
- ✅ Displays attack planner table overlay
- ❌ Does NOT interact with the game
- ❌ Does NOT automate any actions
- ❌ Does NOT modify game elements

## Installation Instructions

### Download the Extension

**You need to download the entire `browser-extension` folder** containing these files:
- `manifest.json`
- `content.js`
- `popup.html` & `popup.js`
- `background.js`
- `overlay.css`
- `icons/` folder

**Download Options:**

1. **From GitHub Repository:**
   - Visit: https://github.com/knzj777/travian-raid-tracker
   - Click the green "Code" button → "Download ZIP"
   - Extract the ZIP file
   - Navigate to the `browser-extension` folder inside

2. **Direct Link to Extension Folder:**
   - https://github.com/knzj777/travian-raid-tracker/tree/main/browser-extension
   - You can download individual files or use GitHub's download feature

3. **Using Git (if you have Git installed):**
   ```bash
   git clone https://github.com/knzj777/travian-raid-tracker.git
   cd travian-raid-tracker/browser-extension
   ```

### Chrome/Edge (Chromium-based browsers)

1. Download the extension files using one of the methods above
2. Open Chrome/Edge and navigate to `chrome://extensions/` (or `edge://extensions/` for Edge)
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked"
5. Select the `browser-extension` folder (the folder containing `manifest.json`)
6. The extension should now be installed

### Firefox

1. Download the extension files using one of the methods above
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on"
5. Navigate to and select the `manifest.json` file from the `browser-extension` folder

## Usage

1. Once installed, visit any Travian server page (e.g., `*.travian.com`)
2. The overlay will automatically appear
3. Click the extension icon in your browser toolbar to:
   - Toggle overlay visibility
   - Import data from web app
   - Adjust settings

## Importing Data from Web App

To sync your attack planner data:

1. Visit your Raid Tracker web app (where you create attacks)
2. Click the extension icon
3. Click "Import from Web App"
4. The extension will read data from the web app's localStorage and sync it

## Features

- **TimeIsClock**: Displays atomic clock time synchronized with time.is
- **Attack Planner Table**: Shows all scheduled attacks with countdown timers
- **Draggable Overlay**: Click and drag the header to reposition
- **Minimize/Close**: Use buttons in overlay header
- **Dark/Light Mode**: Toggle in extension popup settings

## Data Storage

The extension uses Chrome's `chrome.storage.local` API to store:
- Attack plans (`attackPlans`)
- Time zone selection (`timeIsClockSelectedCity`)
- Server offset (`serverOffsetHours`)
- Overlay position and visibility settings

## Troubleshooting

- **Overlay not appearing**: Make sure you're on a Travian domain (travian.com, travian.net, etc.)
- **Data not syncing**: Ensure you're on the Raid Tracker web app domain when importing
- **Clock not updating**: The extension uses time.is widget - check your internet connection

## Support

For issues or questions, please refer to the main Raid Tracker repository.

