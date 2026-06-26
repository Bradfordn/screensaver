const DEFAULT_IDLE_MINUTES = 5;

// Helper function to launch a perfectly clean, full-screen popup window
function launchScreensaver() {
  chrome.tabs.query({ url: chrome.runtime.getURL("screensaver.html") }, (tabs) => {
    if (tabs.length === 0) {
      chrome.windows.create({
        url: chrome.runtime.getURL("screensaver.html"),
        type: "popup",
        state: "fullscreen"
      });
    }
  });
}

// 1. WATCH FOR SYSTEM IDLE TO LAUNCH
chrome.idle.onStateChanged.addListener((state) => {
  if (state === "idle" || state === "locked") {
    chrome.storage.local.get(["idleTimeout"], (result) => {
      const userTimeoutMinutes = result.idleTimeout ? parseInt(result.idleTimeout, 10) : DEFAULT_IDLE_MINUTES;
      const userTimeoutSeconds = userTimeoutMinutes * 60;

      chrome.idle.queryState(userTimeoutSeconds, (currentState) => {
        if (currentState === "idle" || currentState === "locked") {
          launchScreensaver();
        }
      });
    });
  }
});

// 2. INSTANT LAUNCH ON TOOLBAR ICON CLICK
// Left-clicking the pinned extension button now forces the screensaver open instantly
chrome.action.onClicked.addListener(() => {
  launchScreensaver();
});