# Screen Ask Chrome Extension

Small Manifest V3 Chrome extension that captures part of the visible tab, lets you drag-select a region, and sends it to OpenAI for an answer.

## Install locally

1. Open `chrome://extensions`
2. Turn on `Developer mode`
3. Click `Load unpacked`
4. Select this `chrome-extension/` folder
5. Open the extension options and paste your OpenAI API key

## Files

- `manifest.json` defines the extension
- `popup.html` is the capture and answer UI
- `popup.css` styles the popup
- `popup.js` handles capture, crop selection, and AI requests
- `options.html` and `options.js` store your API key and model
- `background.js` runs on install
