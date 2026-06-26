// 1. GITHUB MASTER IMAGE REPOSITORY CONFIGURATION
const REMOTE_JSON_URL = "https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME/main/images.json";

// High-resolution local fallback array used for instant launch and offline access
const fallbackPhotos = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1511300636408-a63a89df3482?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1539634262233-7c0b48ab9503?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1717964134799-a98f497172a5?auto=format&fit=crop&w=1920&q=80"
];

let dynamicPhotoArray = [...fallbackPhotos];
let currentPhotoIndex = 0;
let currentActiveLayer = 1;

const weatherDataMap = {
  0: { label: "Clear Sky", icon: "☀️" }, 1: { label: "Mainly Clear", icon: "🌤️" },
  2: { label: "Partly Cloudy", icon: "⛅" }, 3: { label: "Overcast", icon: "☁️" },
  45: { label: "Foggy", icon: "🌫️" }, 48: { label: "Rime Fog", icon: "🌫️" },
  51: { label: "Light Drizzle", icon: "🌦️" }, 53: { label: "Mod Drizzle", icon: "🌦️" },
  55: { label: "Dense Drizzle", icon: "🌧️" }, 61: { label: "Slight Rain", icon: "🌦️" },
  63: { label: "Mod Rain", icon: "🌧️" }, 65: { label: "Heavy Rain", icon: "🌧️" },
  71: { label: "Slight Snow", icon: "🌨️" }, 73: { label: "Mod Snow", icon: "❄️" },
  75: { label: "Heavy Snow", icon: "❄️" }, 77: { label: "Snow Grains", icon: "🌨️" },
  80: { label: "Slight Showers", icon: "🌦️" }, 81: { label: "Mod Showers", icon: "🌧️" },
  82: { label: "Heavy Showers", icon: "⛈️" }, 85: { label: "Slight Snow Srs", icon: "🌨️" },
  86: { label: "Heavy Snow Srs", icon: "❄️" }, 95: { label: "Thunderstorm", icon: "⛈️" },
  96: { label: "TS / Hail", icon: "⛈️" }, 99: { label: "Heavy TS / Hail", icon: "⛈️" }
};
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// SMART CROSS-FADE BACKGROUND REFRESHER
function rotateBackground() {
  if (!dynamicPhotoArray || dynamicPhotoArray.length === 0) return;

  currentPhotoIndex = (currentPhotoIndex + 1) % dynamicPhotoArray.length;
  const photoUrl = dynamicPhotoArray[currentPhotoIndex];
  
  const nextLayerNum = currentActiveLayer === 1 ? 2 : 1;
  const targetLayer = document.getElementById(`bg-layer-${nextLayerNum}`);
  const activeLayer = document.getElementById(`bg-layer-${currentActiveLayer}`);
  
  if (!targetLayer || !activeLayer) return;

  const preloaderImg = new Image();
  preloaderImg.src = photoUrl;
  
  preloaderImg.onload = () => {
    targetLayer.style.backgroundImage = `url('${photoUrl}')`;
    executeLayerSwap(activeLayer, targetLayer, nextLayerNum);
  };
}

// SAFE TRANSITION SWAP LAYER MANAGEMENT ENGINE
function executeLayerSwap(oldLayer, newLayer, newLayerNum) {
  newLayer.classList.add('active');
  
  // Explicitly force blur values via JavaScript during swaps
  newLayer.style.opacity = '1';
  newLayer.style.filter = 'blur(0px)';
  
  oldLayer.style.opacity = '0';
  oldLayer.style.filter = 'blur(20px)';
  
  currentActiveLayer = newLayerNum;

  setTimeout(() => {
    if (currentActiveLayer !== newLayerNum) return; 
    oldLayer.classList.remove('active');
    oldLayer.style.backgroundImage = '';
  }, 2200); 
}

function updateClock() {
  try {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; 
    
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    const timeEl = document.getElementById('clock-time');
    const secsEl = document.getElementById('clock-seconds');
    const ampmEl = document.getElementById('clock-ampm');

    if (timeEl) timeEl.innerText = `${hours}:${minutes}`;
    if (secsEl) secsEl.innerText = seconds;
    if (ampmEl) ampmEl.innerText = ampm;
  } catch (err) {
    console.error("Clock update error:", err);
  }
}

function fetchRemoteClassroomImages() {
  if (typeof chrome === "undefined" || !chrome.storage || !chrome.storage.local) return;

  fetch(REMOTE_JSON_URL)
    .then(response => response.ok ? response.json() : null)
    .then(masterThemeDict => {
      if (!masterThemeDict) return;
      chrome.storage.local.get(['selectedTheme'], (storageResult) => {
        const userThemeSelection = storageResult?.selectedTheme || 'school';
        if (masterThemeDict[userThemeSelection] && Array.isArray(masterThemeDict[userThemeSelection])) {
          dynamicPhotoArray = masterThemeDict[userThemeSelection];
        } else {
          dynamicPhotoArray = masterThemeDict['school'] || fallbackPhotos;
        }
        if (dynamicPhotoArray.length > 0) {
          currentPhotoIndex = Math.floor(Math.random() * dynamicPhotoArray.length);
          const currentActive = document.getElementById(`bg-layer-${currentActiveLayer}`);
          if (currentActive) {
            currentActive.style.backgroundImage = `url('${dynamicPhotoArray[currentPhotoIndex]}')`;
          }
        }
      });
    })
    .catch(err => console.warn("Remote sync fallback triggered:", err));
}

function updateWeather() {
  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(async (position) => {
    try {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=auto`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      const currentCode = data.current.weather_code;
      const currentInfo = weatherDataMap[currentCode] || { label: "Unknown", icon: "🌡️" };
      const currentTemp = Math.round(data.current.temperature_2m);
      
      const tempEl = document.getElementById('weather-temp');
      const descEl = document.getElementById('weather-desc');
      if (tempEl) tempEl.innerText = `${currentInfo.icon} ${currentTemp}°F`;
      if (descEl) descEl.innerText = currentInfo.label;

      const forecastRow = document.getElementById('forecast-row');
      if (forecastRow) {
        forecastRow.innerHTML = '';
        for (let i = 1; i <= 5; i++) {
          const dateStr = data.daily.time[i];
          const dateObj = new Date(dateStr + 'T00:00:00');
          const dayName = dayNames[dateObj.getDay()];
          const maxTemp = Math.round(data.daily.temperature_2m_max[i]);
          const minTemp = Math.round(data.daily.temperature_2m_min[i]);
          const dayCode = data.daily.weather_code[i];
          const dayInfo = weatherDataMap[dayCode] || { label: "Clear", icon: "☀️" };

          const dayCol = document.createElement('div');
          dayCol.className = 'forecast-day-col';
          dayCol.innerHTML = `
            <span class="fc-name">${dayName}</span>
            <span class="fc-icon">${dayInfo.icon}</span>
            <span class="fc-temps">${maxTemp}°<span class="fc-low">${minTemp}°</span></span>
          `;
          forecastRow.appendChild(dayCol);
        }
      }
    } catch (error) {
      console.error("Weather update error:", error);
    }
  });
}

let dynamicThresholdPassed = false;
function dismissScreensaver() { window.close(); }
window.addEventListener('click', dismissScreensaver);
window.addEventListener('keydown', dismissScreensaver);
window.addEventListener('touchstart', dismissScreensaver);
window.addEventListener('mousemove', () => {
  if (!dynamicThresholdPassed) { dynamicThresholdPassed = true; return; }
  dismissScreensaver();
});

// CRASH-PROOF INITIALIZATION SYSTEM
document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  if (body) {
    try {
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['clockPosition', 'weatherPosition', 'showWeather', 'selectedFont'], (settings) => {
          const safeSettings = settings || {};
          body.setAttribute('data-clock-pos', safeSettings.clockPosition || 'center');
          body.setAttribute('data-weather-pos', safeSettings.weatherPosition || 'bottom-right');
          const showWeather = safeSettings.showWeather !== false;
          body.setAttribute('data-hide-weather', (!showWeather).toString());

          // CSP-COMPLIANT DYNAMIC FONT LINK INJECTION
          const fontName = safeSettings.selectedFont || 'Space Mono';
          const formattedFontName = fontName.replace(/\s+/g, '+');
          
          const fontLink = document.createElement("link");
          fontLink.rel = "stylesheet";
          fontLink.href = `https://fonts.googleapis.com/css2?family=${formattedFontName}:wght@400;700&display=swap`;
          document.head.appendChild(fontLink);
          
          // Apply specialized metrics per layout theme
          if (fontName === 'Space Mono') {
            body.style.fontFamily = `"${fontName}", Consolas, Monaco, monospace`;
            body.style.letterSpacing = '0px';
          } else if (fontName === 'Syncopate') {
            body.style.fontFamily = `"${fontName}", Impact, Arial Black, sans-serif`;
            body.style.letterSpacing = '6px';
          } else if (fontName === 'Special Elite') {
            body.style.fontFamily = `"${fontName}", "Courier New", Courier, serif`;
            body.style.letterSpacing = '0px';
          } else if (fontName === 'Kumar One') {
            body.style.fontFamily = `"${fontName}", Impact, Charcoal, sans-serif`;
            body.style.letterSpacing = '-1px';
          } else if (fontName === 'Bruno Ace') {
            body.style.fontFamily = `"${fontName}", "Arial Black", sans-serif`;
            body.style.letterSpacing = '2px';
          }
        });
      } else {
        body.setAttribute('data-clock-pos', 'center');
        body.setAttribute('data-weather-pos', 'bottom-right');
        body.setAttribute('data-hide-weather', 'false');
        body.style.fontFamily = '"Space Mono", monospace';
      }
    } catch(e) {
      body.setAttribute('data-clock-pos', 'center');
      body.setAttribute('data-weather-pos', 'bottom-right');
      body.setAttribute('data-hide-weather', 'false');
    }
  }

  updateClock();

  currentPhotoIndex = Math.floor(Math.random() * dynamicPhotoArray.length);
  
  const initialLayer = document.getElementById('bg-layer-1');
  if (initialLayer) {
    initialLayer.style.backgroundImage = `url('${dynamicPhotoArray[currentPhotoIndex]}')`;
    initialLayer.style.opacity = '1';
    initialLayer.style.filter = 'blur(0px)';
    initialLayer.classList.add('active');
  }

  setInterval(updateClock, 1000);
  setInterval(rotateBackground, 60 * 1000); 

  fetchRemoteClassroomImages();
  updateWeather();
  setInterval(updateWeather, 30 * 60 * 1000);
});