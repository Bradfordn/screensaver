document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('login');
  const albumSelect = document.getElementById('album-select');
  const timeoutSelect = document.getElementById('timeout-select');

  // Load saved preferences on popup open
  chrome.storage.local.get(['savedTimeout', 'savedAlbumId'], (res) => {
    if (res.savedTimeout) timeoutSelect.value = res.savedTimeout;
    
    // Check login state silently
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (token) {
        loginBtn.textContent = "Google Account Linked ✓";
        loginBtn.style.background = "#2ecc71";
        fetchUserAlbums(token, res.savedAlbumId);
      }
    });
  });

  // Handle explicit Authentication Click
  loginBtn.addEventListener('click', () => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError || !token) return;
      loginBtn.textContent = "Google Account Linked ✓";
      loginBtn.style.background = "#2ecc71";
      fetchUserAlbums(token);
    });
  });

  // Save selection states dynamically
  albumSelect.addEventListener('change', () => {
    chrome.storage.local.set({ savedAlbumId: albumSelect.value });
  });

  timeoutSelect.addEventListener('change', () => {
    chrome.storage.local.set({ savedTimeout: parseInt(timeoutSelect.value, 10) });
  });

  function fetchUserAlbums(token, savedAlbumId = "") {
    fetch('https://photoslibrary.googleapis.com/v1/albums?pageSize=50', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(data => {
      albumSelect.disabled = false;
      // Clear old choices except default
      albumSelect.innerHTML = '<option value="">Entire Library (Default)</option>';
      if (data.albums) {
        data.albums.forEach(album => {
          const opt = document.createElement('option');
          opt.value = album.id;
          opt.textContent = `${album.title} (${album.mediaItemsCount || 0})`;
          if (album.id === savedAlbumId) opt.selected = true;
          albumSelect.appendChild(opt);
        });
      }
    }).catch(e => console.error(e));
  }
});