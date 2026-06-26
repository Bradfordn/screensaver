// Function to save configurations to Chrome Local Storage
function saveSettings() {
  const enabledValue = document.getElementById('screensaverEnabled').checked;
  const timeoutValue = document.getElementById('timeout').value;
  const clockPosValue = document.getElementById('clockPosition').value;
  const weatherPosValue = document.getElementById('weatherPosition').value;
  const showWeatherValue = document.getElementById('showWeather').checked;
  // Capture the typography selection value
  const fontValue = document.getElementById('font-select').value;

  chrome.storage.local.set({
    screensaverEnabled: enabledValue,
    idleTimeout: timeoutValue,
    clockPosition: clockPosValue,
    weatherPosition: weatherPosValue,
    showWeather: showWeatherValue,
    selectedFont: fontValue // Save to storage
  }, () => {
    // Flash a quick confirmation message to the user
    const status = document.getElementById('status');
    status.innerText = 'Settings saved successfully.';
    setTimeout(() => {
      status.innerText = '';
    }, 2000);
  });
}

// Function to populate configuration elements with stored preferences on popup load
function restoreSettings() {
  chrome.storage.local.get({
    screensaverEnabled: true,
    idleTimeout: '5',
    clockPosition: 'center',
    weatherPosition: 'bottom-right',
    showWeather: true,
    selectedFont: 'Space Mono' // Default fallback matching options.html
  }, (settings) => {
    document.getElementById('screensaverEnabled').checked = settings.screensaverEnabled;
    document.getElementById('timeout').value = settings.idleTimeout;
    document.getElementById('clockPosition').value = settings.clockPosition;
    document.getElementById('weatherPosition').value = settings.weatherPosition;
    document.getElementById('showWeather').checked = settings.showWeather;
    // Restore selection element UI state
    document.getElementById('font-select').value = settings.selectedFont;
  });
}

// Attach lifecycle events
document.addEventListener('DOMContentLoaded', restoreSettings);
document.getElementById('save').addEventListener('click', saveSettings);