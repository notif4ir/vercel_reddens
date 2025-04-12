// DOM Elements
const sideMenu = document.getElementById('side-menu');
const closeMenu = document.getElementById('close-menu');
const menuBtn = document.getElementById('menu-btn');
const screens = document.querySelectorAll('.screen');
const navItems = document.querySelectorAll('.nav-item');
const menuItems = document.querySelectorAll('.menu-items li');
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const songProgress = document.getElementById('song-progress-bar');
const progressContainer = document.querySelector('.progress-container');
const audioPlayer = document.getElementById('audio-player');
const playBtn = document.getElementById('play-btn');
const playIcon = document.getElementById('play-icon');
const pauseIcon = document.getElementById('pause-icon');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const currentSongElement = document.getElementById('current-song');
const currentArtistElement = document.getElementById('current-artist');
const currentAlbumArt = document.getElementById('current-album-art');
const searchInput = document.getElementById('search-input');
const createPlaylistBtn = document.querySelector('.create-playlist .red-btn');
const artistScreen = document.getElementById('artist-screen');
const playlistScreen = document.getElementById('playlist-screen');
const loopBtn = document.getElementById('loop-btn');
const themeSelect = document.querySelector('select[name="theme"]');
const likedTab = document.getElementById('liked-tab');
const likedContent = document.getElementById('liked-content');
const audioQualitySelect = document.querySelector('select.setting-select');
const profileNameElement = document.querySelector('.setting-value:first-of-type');

// App State
let currentSong = null;
let isPlaying = false;
let currentPlaylist = [];
let currentIndex = 0;
let isLooping = false;
let db;
let currentTheme = 'dark';
let profileName = 'User123';
let audioQuality = 'High';

// Initialize IndexedDB
function initIndexedDB() {
    const request = indexedDB.open('ReddensDB', 3);
    
    request.onerror = function(event) {
        console.error('IndexedDB error:', event.target.error);
    };
    
    request.onupgradeneeded = function(event) {
        db = event.target.result;
        
        // Create object store for playlists
        if (!db.objectStoreNames.contains('playlists')) {
            const playlistsStore = db.createObjectStore('playlists', { keyPath: 'id', autoIncrement: true });
            playlistsStore.createIndex('name', 'name', { unique: false });
        }
        
        // Create object store for play history
        if (!db.objectStoreNames.contains('playHistory')) {
            const historyStore = db.createObjectStore('playHistory', { keyPath: 'songId' });
            historyStore.createIndex('lastPlayed', 'lastPlayed', { unique: false });
            historyStore.createIndex('playCount', 'playCount', { unique: false });
        }
        
        // Create object store for liked songs
        if (!db.objectStoreNames.contains('likedSongs')) {
            db.createObjectStore('likedSongs', { keyPath: 'songId' });
        }
        
        // Create object store for settings
        if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'key' });
        }
        
        // Create object store for profile
        if (!db.objectStoreNames.contains('profile')) {
            db.createObjectStore('profile', { keyPath: 'key' });
        }
    };
    
    request.onsuccess = function(event) {
        db = event.target.result;
        // After DB is initialized, load user data
        loadUserPlaylists();
        loadSettings();
        loadProfile();
        loadRecentlyPlayed();
        loadMostPlayed();
        loadLikedSongs();
    };
}

// Load app settings
function loadSettings() {
    if (!db) return;
    
    const transaction = db.transaction(['settings'], 'readonly');
    const store = transaction.objectStore('settings');
    
    // Load theme
    const themeRequest = store.get('theme');
    themeRequest.onsuccess = function(event) {
        const setting = event.target.result;
        if (setting) {
            currentTheme = setting.value;
            applyTheme(currentTheme);
            // Update the select element to match the current theme
            if (themeSelect) {
                themeSelect.value = currentTheme;
            }
        } else {
            // If no theme setting exists, create one with the default theme
            saveThemeSetting('light');
        }
    };
    
    // Load audio quality
    const qualityRequest = store.get('audioQuality');
    qualityRequest.onsuccess = function(event) {
        const setting = event.target.result;
        if (setting) {
            audioQuality = setting.value;
            if (audioQualitySelect) {
                audioQualitySelect.value = audioQuality;
            }
        } else {
            // If no audio quality setting exists, create with default (High)
            saveAudioQualitySetting('High');
        }
    };
}

// Load profile data
function loadProfile() {
    if (!db) return;
    
    const transaction = db.transaction(['profile'], 'readonly');
    const store = transaction.objectStore('profile');
    const request = store.get('name');
    
    request.onsuccess = function(event) {
        const profile = event.target.result;
        if (profile) {
            profileName = profile.value;
            if (profileNameElement) {
                profileNameElement.textContent = profileName;
            }
        } else {
            // Create default profile
            saveProfileName('User123');
        }
    };
}

// Save profile name
function saveProfileName(name) {
    if (!db) return;
    
    const transaction = db.transaction(['profile'], 'readwrite');
    const store = transaction.objectStore('profile');
    store.put({ key: 'name', value: name });
    
    profileName = name;
    if (profileNameElement) {
        profileNameElement.textContent = name;
    }
}

// Save theme setting to IndexedDB
function saveThemeSetting(theme) {
    if (!db) return;
    
    const transaction = db.transaction(['settings'], 'readwrite');
    const store = transaction.objectStore('settings');
    store.put({ key: 'theme', value: theme });
    
    currentTheme = theme;
    applyTheme(theme);
}

// Save audio quality setting
function saveAudioQualitySetting(quality) {
    if (!db) return;
    
    const transaction = db.transaction(['settings'], 'readwrite');
    const store = transaction.objectStore('settings');
    store.put({ key: 'audioQuality', value: quality });
    
    audioQuality = quality;
    applyAudioQuality(quality);
}

// Apply audio quality setting
function applyAudioQuality(quality) {
    // In a real app, this would adjust bitrate, sample rate, etc.
    // For our demo, we'll simulate by adjusting volume/playback rate
    switch(quality) {
        case 'Low':
            audioPlayer.volume = 0.7;
            break;
        case 'Medium':
            audioPlayer.volume = 0.85;
            break;
        case 'High':
            audioPlayer.volume = 1.0;
            break;
    }
}

// Apply theme to the document
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
}

// Load Recently Played from IndexedDB
function loadRecentlyPlayed() {
    if (!db) {
        setTimeout(loadRecentlyPlayed, 1000); // Try again in 1 second
        return;
    }
    
    const transaction = db.transaction(['playHistory'], 'readonly');
    const store = transaction.objectStore('playHistory');
    const index = store.index('lastPlayed');
    
    // Get the 5 most recently played songs
    const request = index.openCursor(null, 'prev');
    const recentlyPlayed = [];
    
    request.onsuccess = function(event) {
        const cursor = event.target.result;
        if (cursor && recentlyPlayed.length < 5) {
            const song = musicData.songs.find(s => s.id === cursor.value.songId);
            if (song) {
                recentlyPlayed.push(song);
            }
            cursor.continue();
        } else {
            // Display recently played songs
            const recentlyPlayedCarousel = document.querySelector('.section:nth-of-type(1) .carousel');
            populateCarousel(recentlyPlayedCarousel, recentlyPlayed);
        }
    };
}

// Load Most Played from IndexedDB
function loadMostPlayed() {
    if (!db) {
        setTimeout(loadMostPlayed, 1000); // Try again in 1 second
        return;
    }
    
    const transaction = db.transaction(['playHistory'], 'readonly');
    const store = transaction.objectStore('playHistory');
    const index = store.index('playCount');
    
    // Get the most played songs
    const request = index.openCursor(null, 'prev');
    const mostPlayed = [];
    
    request.onsuccess = function(event) {
        const cursor = event.target.result;
        if (cursor && mostPlayed.length < 5) {
            const song = musicData.songs.find(s => s.id === cursor.value.songId);
            if (song) {
                mostPlayed.push(song);
            }
            cursor.continue();
        } else {
            // Display most played songs
            const mostPlayedCarousel = document.querySelector('.section:nth-of-type(2) .carousel');
            populateCarousel(mostPlayedCarousel, mostPlayed);
        }
    };
}

// Update play history in IndexedDB
function updatePlayHistory(songId) {
    if (!db) return;
    
    const transaction = db.transaction(['playHistory'], 'readwrite');
    const store = transaction.objectStore('playHistory');
    const request = store.get(songId);
    
    request.onsuccess = function(event) {
        const record = event.target.result;
        const now = new Date().getTime();
        
        if (record) {
            // Update existing record
            record.playCount++;
            record.lastPlayed = now;
            store.put(record);
        } else {
            // Create new record
            store.put({
                songId: songId,
                playCount: 1,
                lastPlayed: now
            });
        }
        
        // Refresh the carousels
        loadRecentlyPlayed();
        loadMostPlayed();
    };
}

// Detect audio duration
function detectAudioDuration(url, callback) {
    const audio = new Audio();
    audio.addEventListener('loadedmetadata', function() {
        const duration = audio.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        callback(`${minutes}:${seconds < 10 ? '0' + seconds : seconds}`);
    });
    audio.src = url;
}

// Load liked songs from IndexedDB
function loadLikedSongs() {
    if (!db) return;
    
    const transaction = db.transaction(['likedSongs'], 'readonly');
    const store = transaction.objectStore('likedSongs');
    const request = store.getAll();
    
    request.onsuccess = function(event) {
        const likedSongs = event.target.result.map(record => record.songId);
        
        // Update heart icons on existing song items
        document.querySelectorAll('.song-action-btn[data-action="like"]').forEach(btn => {
            const songId = parseInt(btn.dataset.id);
            if (likedSongs.includes(songId)) {
                btn.classList.add('liked');
            } else {
                btn.classList.remove('liked');
            }
        });
        
        // Populate liked songs section if it's visible
        if (likedContent.classList.contains('active')) {
            displayLikedSongs();
        }
    };
}

// Display liked songs in the liked songs tab
function displayLikedSongs() {
    if (!db) return;
    
    const transaction = db.transaction(['likedSongs'], 'readonly');
    const store = transaction.objectStore('likedSongs');
    const request = store.getAll();
    
    request.onsuccess = function(event) {
        const likedSongIds = event.target.result.map(record => record.songId);
        const likedSongs = likedSongIds.map(id => musicData.songs.find(song => song.id === id)).filter(Boolean);
        
        const songsTable = likedContent.querySelector('tbody');
        songsTable.innerHTML = '';
        
        if (likedSongs.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `
                <td colspan="4" class="empty-message">
                    No liked songs yet. Start liking songs to see them here.
                </td>
            `;
            songsTable.appendChild(emptyRow);
        } else {
            likedSongs.forEach(song => {
                const row = createSongRow(song, true);
                songsTable.appendChild(row);
            });
        }
    };
}

// Toggle song like status
function toggleLike(songId) {
    if (!db) return;
    
    const transaction = db.transaction(['likedSongs'], 'readwrite');
    const store = transaction.objectStore('likedSongs');
    const request = store.get(songId);
    
    request.onsuccess = function(event) {
        const record = event.target.result;
        
        if (record) {
            // Unlike the song
            store.delete(songId);
        } else {
            // Like the song
            store.put({ songId: songId, timestamp: new Date().getTime() });
        }
        
        // Update UI to reflect changes
        loadLikedSongs();
    };
}

// Initialize App
function initApp() {
    initIndexedDB();
    populateHomeScreen();
    populateLibrary();
    setupEventListeners();
    
    // Auto-detect durations for songs
    musicData.songs.forEach(song => {
        if (song.duration === "auto") {
            detectAudioDuration(song.mp3, (duration) => {
                song.duration = duration;
            });
        }
    });
}

// Load user playlists from IndexedDB
function loadUserPlaylists() {
    if (!db) return;
    
    const transaction = db.transaction(['playlists'], 'readonly');
    const store = transaction.objectStore('playlists');
    const request = store.getAll();
    
    request.onsuccess = function(event) {
        const userPlaylists = event.target.result;
        
        // Only use user-created playlists, no starter playlists
        updatePlaylistsDisplay(userPlaylists);
    };
    
    request.onerror = function(event) {
        console.error('Error loading playlists:', event.target.error);
    };
}

// Update playlists display in library
function updatePlaylistsDisplay(playlists) {
    const playlistsContainer = document.querySelector('#playlists-content .grid-container');
    playlistsContainer.innerHTML = '';
    
    // Add import button
    const importContainer = document.createElement('div');
    importContainer.className = 'create-playlist';
    importContainer.style.display = 'flex';
    importContainer.style.justifyContent = 'space-between';
    importContainer.innerHTML = `
        <input type="file" id="playlist-file-input" class="file-input" accept=".rPlaylist">
        <button class="import-playlist-btn">Import .rPlaylist</button>
    `;
    
    const importBtn = importContainer.querySelector('.import-playlist-btn');
    const fileInput = importContainer.querySelector('#playlist-file-input');
    
    importBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const playlistData = JSON.parse(event.target.result);
                    importPlaylist(playlistData);
                } catch (error) {
                    alert('Invalid playlist file');
                    console.error('Error importing playlist:', error);
                }
            };
            reader.readAsText(file);
        }
    });
    
    playlistsContainer.appendChild(importContainer);
    
    if (playlists.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-playlists-message';
        emptyMessage.textContent = 'You have no playlists yet. Create one to get started.';
        playlistsContainer.appendChild(emptyMessage);
        return;
    }
    
    playlists.forEach(playlist => {
        const playlistItem = createGridItem(
            playlist.cover || 'https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVkJTIwbXVzaWN8ZW58MHx8MHx8fDA%3D&w=1000&q=80',
            playlist.name,
            `${playlist.songs?.length || 0} songs`
        );
        
        playlistItem.addEventListener('click', () => {
            openPlaylist(playlist);
        });
        
        playlistsContainer.appendChild(playlistItem);
    });
}

// Import a playlist from .rPlaylist file
function importPlaylist(playlistData) {
    if (!db) return;
    
    // Validate playlist data
    if (!playlistData.name || !Array.isArray(playlistData.songs)) {
        alert('Invalid playlist format');
        return;
    }
    
    // Create a new playlist object
    const newPlaylist = {
        name: playlistData.name,
        creator: 'Imported',
        songs: playlistData.songs,
        cover: playlistData.cover || 'https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVkJTIwbXVzaWN8ZW58MHx8MHx8fDA%3D&w=1000&q=80',
        isUserCreated: true
    };
    
    // Add to IndexedDB
    const transaction = db.transaction(['playlists'], 'readwrite');
    const store = transaction.objectStore('playlists');
    const request = store.add(newPlaylist);
    
    request.onsuccess = function() {
        alert(`Playlist "${playlistData.name}" imported successfully!`);
        loadUserPlaylists();
    };
    
    request.onerror = function(event) {
        alert('Error importing playlist');
        console.error('Error importing playlist:', event.target.error);
    };
}

// Export a playlist to .rPlaylist file
function exportPlaylist(playlist) {
    // Create playlist export data
    const exportData = {
        name: playlist.name,
        songs: playlist.songs,
        cover: playlist.cover
    };
    
    // Convert to JSON and create blob
    const jsonData = JSON.stringify(exportData);
    const blob = new Blob([jsonData], { type: 'application/json' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${playlist.name.replace(/\s+/g, '_')}.rPlaylist`;
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Create a new playlist
function createNewPlaylist(name) {
    if (!db) return;
    
    const newPlaylist = {
        name,
        creator: profileName,
        songs: [],
        cover: 'https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVkJTIwbXVzaWN8ZW58MHx8MHx8fDA%3D&w=1000&q=80',
        isUserCreated: true
    };
    
    const transaction = db.transaction(['playlists'], 'readwrite');
    const store = transaction.objectStore('playlists');
    const request = store.add(newPlaylist);
    
    request.onsuccess = function() {
        loadUserPlaylists();
    };
    
    request.onerror = function(event) {
        console.error('Error creating playlist:', event.target.error);
    };
}

// Add song to playlist
function addSongToPlaylist(songId, playlistId) {
    if (!db) return;
    
    // User-created playlist in IndexedDB
    const transaction = db.transaction(['playlists'], 'readwrite');
    const store = transaction.objectStore('playlists');
    const request = store.get(playlistId);
    
    request.onsuccess = function(event) {
        const playlist = event.target.result;
        if (!playlist) return;
        
        if (!playlist.songs.includes(songId)) {
            playlist.songs.push(songId);
            
            // Update playlist in DB
            const updateRequest = store.put(playlist);
            
            updateRequest.onsuccess = function() {
                loadUserPlaylists();
                
                // If playlist screen is open, refresh it
                if (playlistScreen.classList.contains('active') && 
                    playlistScreen.dataset.playlistId == playlistId) {
                    openPlaylist(playlist);
                }
            };
        }
    };
}

// Remove song from playlist
function removeSongFromPlaylist(songId, playlistId) {
    if (!db) return;
    
    const transaction = db.transaction(['playlists'], 'readwrite');
    const store = transaction.objectStore('playlists');
    const request = store.get(playlistId);
    
    request.onsuccess = function(event) {
        const playlist = event.target.result;
        if (!playlist) return;
        
        playlist.songs = playlist.songs.filter(id => id !== songId);
        
        // Update playlist in DB
        const updateRequest = store.put(playlist);
        
        updateRequest.onsuccess = function() {
            loadUserPlaylists();
            
            // Refresh playlist screen if open
            if (playlistScreen.classList.contains('active') && 
                playlistScreen.dataset.playlistId == playlistId) {
                openPlaylist(playlist);
            }
        };
    };
}

// Delete a playlist
function deletePlaylist(playlistId) {
    if (!db) return;
    
    const transaction = db.transaction(['playlists'], 'readwrite');
    const store = transaction.objectStore('playlists');
    const request = store.delete(playlistId);
    
    request.onsuccess = function() {
        loadUserPlaylists();
        
        // Go back to library if the deleted playlist was open
        if (playlistScreen.classList.contains('active') && 
            playlistScreen.dataset.playlistId == playlistId) {
            openScreen('library');
        }
    };
}

// Populate Home Screen
function populateHomeScreen() {
    // Recently Played and Most Played are loaded from loadRecentlyPlayed() 
    // and loadMostPlayed() after IndexedDB is initialized
}

// Helper function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Populate Library
function populateLibrary() {
    // Playlists are loaded from loadUserPlaylists() after IndexedDB is initialized
    
    // Populate Albums
    const albumsContainer = document.querySelector('#albums-content .grid-container');
    albumsContainer.innerHTML = '';
    
    musicData.albums.forEach(album => {
        const albumItem = createGridItem(album.cover, album.name, album.artist);
        albumItem.addEventListener('click', () => {
            loadAlbum(album.id);
        });
        albumsContainer.appendChild(albumItem);
    });
    
    // Populate Artists
    const artistsContainer = document.querySelector('#artists-content .grid-container');
    artistsContainer.innerHTML = '';
    
    musicData.artists.forEach(artist => {
        const artistItem = createGridItem(artist.cover, artist.name, `${artist.songs.length} songs`);
        artistItem.addEventListener('click', () => {
            openArtist(artist);
        });
        artistsContainer.appendChild(artistItem);
    });
    
    // Populate Songs (randomized)
    const songsTable = document.querySelector('#songs-content tbody');
    songsTable.innerHTML = '';
    
    const shuffledSongs = shuffleArray([...musicData.songs]);
    
    shuffledSongs.forEach(song => {
        const row = createSongRow(song);
        songsTable.appendChild(row);
    });
}

// Create a song row for tables
function createSongRow(song, isLiked = false) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><img src="${song.cover}" alt="${song.title}" class="song-cover"></td>
        <td>${song.title}</td>
        <td class="artist-link" data-artist="${song.artist}">${song.artist}</td>
        <td>
            <div class="song-actions">
                <button class="song-action-btn play-song-btn" data-id="${song.id}">
                    <svg viewBox="0 0 24 24" width="18" height="18"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>
                </button>
                <button class="song-action-btn add-to-playlist-btn" data-id="${song.id}">
                    <svg viewBox="0 0 24 24" width="18" height="18"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/></svg>
                </button>
                <button class="song-action-btn ${isLiked ? 'liked' : ''}" data-action="like" data-id="${song.id}">
                    <svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/></svg>
                </button>
            </div>
        </td>
    `;
    
    const playButton = row.querySelector('.play-song-btn');
    playButton.addEventListener('click', () => {
        playSong(song.id);
    });
    
    const addToPlaylistButton = row.querySelector('.add-to-playlist-btn');
    addToPlaylistButton.addEventListener('click', () => {
        showAddToPlaylistDialog(song.id);
    });
    
    const likeButton = row.querySelector('[data-action="like"]');
    likeButton.addEventListener('click', () => {
        toggleLike(song.id);
    });
    
    const artistLink = row.querySelector('.artist-link');
    artistLink.addEventListener('click', () => {
        const artistName = artistLink.dataset.artist;
        const artist = musicData.artists.find(a => a.name === artistName);
        if (artist) {
            openArtist(artist);
        }
    });
    
    return row;
}

// Open artist page
function openArtist(artist) {
    // Update artist screen
    const artistHeader = artistScreen.querySelector('.artist-header');
    const artistName = artistScreen.querySelector('.artist-name');
    const artistSongs = artistScreen.querySelector('.artist-songs');
    
    // Set header background and name
    artistHeader.style.backgroundImage = `url(${artist.cover})`;
    artistName.textContent = artist.name;
    
    // Clear and populate songs
    artistSongs.innerHTML = '';
    
    // Get artist's songs
    const songs = musicData.songs.filter(song => artist.songs.includes(song.id));
    
    songs.forEach((song, index) => {
        const songItem = document.createElement('div');
        songItem.className = 'artist-song-item';
        songItem.innerHTML = `
            <div class="song-number">${index + 1}</div>
            <img src="${song.cover}" alt="${song.title}" class="song-cover">
            <div class="song-info">
                <div class="song-title">${song.title}</div>
                <div class="song-album">${musicData.albums.find(album => album.songs.includes(song.id))?.name || ''}</div>
            </div>
            <div class="song-duration">${song.duration}</div>
            <div class="song-actions">
                <button class="song-action-btn play-song-btn" data-id="${song.id}">
                    <svg viewBox="0 0 24 24" width="18" height="18"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>
                </button>
                <button class="song-action-btn add-to-playlist-btn" data-id="${song.id}">
                    <svg viewBox="0 0 24 24" width="18" height="18"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/></svg>
                </button>
                <button class="song-action-btn" data-action="like" data-id="${song.id}">
                    <svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/></svg>
                </button>
            </div>
        `;
        
        const playButton = songItem.querySelector('.play-song-btn');
        playButton.addEventListener('click', () => {
            playSong(song.id);
        });
        
        const addButton = songItem.querySelector('.add-to-playlist-btn');
        addButton.addEventListener('click', () => {
            showAddToPlaylistDialog(song.id);
        });
        
        const likeButton = songItem.querySelector('[data-action="like"]');
        likeButton.addEventListener('click', () => {
            toggleLike(song.id);
        });
        
        artistSongs.appendChild(songItem);
    });
    
    // Get artist's albums
    const artistAlbums = artistScreen.querySelector('.artist-albums .carousel');
    artistAlbums.innerHTML = '';
    
    const albums = musicData.albums.filter(album => album.artist === artist.name);
    
    albums.forEach(album => {
        const albumItem = document.createElement('div');
        albumItem.className = 'carousel-item';
        albumItem.innerHTML = `
            <img src="${album.cover}" alt="${album.name}">
            <div class="carousel-item-info">
                <div class="carousel-item-title">${album.name}</div>
                <div class="carousel-item-subtitle">${album.artist}</div>
            </div>
        `;
        
        albumItem.addEventListener('click', () => {
            loadAlbum(album.id);
        });
        
        artistAlbums.appendChild(albumItem);
    });
    
    // Show the artist screen with animation
    openScreen('artist');
}

// Open playlist
function openPlaylist(playlist) {
    // Set playlist info
    const playlistHeader = playlistScreen.querySelector('.playlist-header');
    const playlistCover = playlistScreen.querySelector('.playlist-cover img');
    const playlistTitle = playlistScreen.querySelector('.playlist-title');
    const playlistCreator = playlistScreen.querySelector('.playlist-creator');
    const playlistSongs = playlistScreen.querySelector('.playlist-songs');
    const playlistActions = playlistScreen.querySelector('.playlist-actions');
    
    // Store playlist ID in the screen element for reference
    playlistScreen.dataset.playlistId = playlist.id;
    
    // Set header background, cover, title and creator
    playlistHeader.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${playlist.cover})`;
    playlistCover.src = playlist.cover;
    playlistTitle.textContent = playlist.name;
    playlistCreator.textContent = `Created by ${playlist.creator}`;
    
    // Clear and populate songs
    playlistSongs.innerHTML = '';
    
    // Update action buttons - add share button
    playlistActions.innerHTML = `
        <button class="red-btn play-all-btn">
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            Play All
        </button>
        <button class="red-btn delete-playlist-btn">Delete Playlist</button>
        <div class="playlist-more-menu">
            <button class="more-button">
                <svg viewBox="0 0 24 24" width="24" height="24">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="currentColor"/>
                </svg>
            </button>
            <div class="playlist-menu">
                <div class="playlist-menu-item" id="export-playlist">Download .rPlaylist</div>
            </div>
        </div>
    `;
    
    // Get songs in playlist
    const songs = playlist.songs.map(id => musicData.songs.find(song => song.id === id)).filter(Boolean);
    
    // Setup play all button
    const playAllBtn = playlistActions.querySelector('.play-all-btn');
    playAllBtn.onclick = () => {
        if (songs.length > 0) {
            currentPlaylist = playlist.songs;
            currentIndex = 0;
            playSong(currentPlaylist[currentIndex]);
        }
    };
    
    // Setup delete playlist button
    const deletePlaylistBtn = playlistActions.querySelector('.delete-playlist-btn');
    deletePlaylistBtn.onclick = () => {
        if (confirm(`Are you sure you want to delete "${playlist.name}"?`)) {
            deletePlaylist(playlist.id);
        }
    };
    
    // Setup more menu
    const moreButton = playlistActions.querySelector('.more-button');
    const playlistMenu = playlistActions.querySelector('.playlist-menu');
    
    moreButton.addEventListener('click', () => {
        playlistMenu.classList.toggle('active');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!moreButton.contains(e.target) && !playlistMenu.contains(e.target)) {
            playlistMenu.classList.remove('active');
        }
    });
    
    // Setup export playlist button
    const exportPlaylistBtn = document.getElementById('export-playlist');
    exportPlaylistBtn.addEventListener('click', () => {
        exportPlaylist(playlist);
        playlistMenu.classList.remove('active');
    });
    
    if (songs.length === 0) {
        playlistSongs.innerHTML = `
            <div class="empty-playlist">
                <p>This playlist is empty</p>
                <p>Add songs from your library</p>
            </div>
        `;
    } else {
        songs.forEach((song, index) => {
            const songItem = document.createElement('div');
            songItem.className = 'playlist-song-item';
            songItem.innerHTML = `
                <div class="song-number">${index + 1}</div>
                <img src="${song.cover}" alt="${song.title}" class="song-cover">
                <div class="song-info">
                    <div class="song-title">${song.title}</div>
                    <div class="song-artist artist-link" data-artist="${song.artist}">${song.artist}</div>
                </div>
                <div class="song-duration">${song.duration}</div>
                <div class="song-actions">
                    <button class="song-action-btn play-song-btn" data-id="${song.id}">
                        <svg viewBox="0 0 24 24" width="18" height="18"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>
                    </button>
                    <button class="song-action-btn remove-from-playlist-btn" data-id="${song.id}">
                        <svg viewBox="0 0 24 24" width="18" height="18"><path d="M19 13H5v-2h14v2z" fill="currentColor"/></svg>
                    </button>
                    <button class="song-action-btn" data-action="like" data-id="${song.id}">
                        <svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/></svg>
                    </button>
                </div>
            `;
            
            const playButton = songItem.querySelector('.play-song-btn');
            playButton.addEventListener('click', () => {
                currentPlaylist = playlist.songs;
                currentIndex = index;
                playSong(song.id);
            });
            
            const removeButton = songItem.querySelector('.remove-from-playlist-btn');
            removeButton.addEventListener('click', () => {
                if (confirm(`Remove "${song.title}" from this playlist?`)) {
                    removeSongFromPlaylist(song.id, playlist.id);
                }
            });
            
            const likeButton = songItem.querySelector('[data-action="like"]');
            likeButton.addEventListener('click', () => {
                toggleLike(song.id);
            });
            
            const artistLink = songItem.querySelector('.artist-link');
            artistLink.addEventListener('click', () => {
                const artistName = artistLink.dataset.artist;
                const artist = musicData.artists.find(a => a.name === artistName);
                if (artist) {
                    openArtist(artist);
                }
            });
            
            playlistSongs.appendChild(songItem);
        });
    }
    
    // Show the playlist screen
    openScreen('playlist');
}

// Show add to playlist dialog
function showAddToPlaylistDialog(songId) {
    // Create dialog overlay
    const overlay = document.createElement('div');
    overlay.className = 'dialog-overlay';
    
    // Create dialog
    const dialog = document.createElement('div');
    dialog.className = 'dialog';
    dialog.innerHTML = `
        <div class="dialog-header">
            <h3>Add to Playlist</h3>
            <button class="close-dialog-btn">×</button>
        </div>
        <div class="dialog-content">
            <div class="playlists-list"></div>
            <div class="new-playlist-form">
                <input type="text" placeholder="New playlist name" class="new-playlist-input">
                <button class="red-btn create-new-playlist-btn">Create New</button>
            </div>
        </div>
    `;
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    // Close dialog on click outside or close button
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    });
    
    dialog.querySelector('.close-dialog-btn').addEventListener('click', () => {
        document.body.removeChild(overlay);
    });
    
    // Populate playlists
    const playlistsList = dialog.querySelector('.playlists-list');
    
    // Get all playlists from IndexedDB
    if (db) {
        const transaction = db.transaction(['playlists'], 'readonly');
        const store = transaction.objectStore('playlists');
        const request = store.getAll();
        
        request.onsuccess = function(event) {
            const userPlaylists = event.target.result;
            renderPlaylistsList(userPlaylists);
        };
    } else {
        renderPlaylistsList([]);
    }
    
    function renderPlaylistsList(playlists) {
        playlistsList.innerHTML = '';
        
        if (playlists.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-playlists-message';
            emptyMessage.textContent = 'No playlists yet. Create one below.';
            playlistsList.appendChild(emptyMessage);
            return;
        }
        
        playlists.forEach(playlist => {
            const playlistItem = document.createElement('div');
            playlistItem.className = 'playlist-dialog-item';
            playlistItem.innerHTML = `
                <img src="${playlist.cover}" alt="${playlist.name}" class="playlist-dialog-cover">
                <div class="playlist-dialog-info">
                    <div class="playlist-dialog-name">${playlist.name}</div>
                    <div class="playlist-dialog-songs">${playlist.songs?.length || 0} songs</div>
                </div>
            `;
            
            playlistItem.addEventListener('click', () => {
                addSongToPlaylist(songId, playlist.id);
                document.body.removeChild(overlay);
            });
            
            playlistsList.appendChild(playlistItem);
        });
    }
    
    // Create new playlist button
    const newPlaylistBtn = dialog.querySelector('.create-new-playlist-btn');
    const newPlaylistInput = dialog.querySelector('.new-playlist-input');
    
    newPlaylistBtn.addEventListener('click', () => {
        const playlistName = newPlaylistInput.value.trim();
        if (playlistName) {
            createNewPlaylist(playlistName);
            document.body.removeChild(overlay);
        }
    });
}

// Helper function to open a specific screen
function openScreen(screenName) {
    // Add exit animation to current active screen
    const currentScreen = document.querySelector('.screen.active');
    if (currentScreen) {
        currentScreen.classList.add('exit');
        
        // Wait for animation to complete before switching screens
        setTimeout(() => {
            // Remove all screen classes
            screens.forEach(screen => {
                screen.classList.remove('active', 'exit', 'enter');
            });
            
            // Add active and enter classes to new screen
            const newScreen = document.getElementById(`${screenName}-screen`);
            newScreen.classList.add('active', 'enter');
            
            // Update nav if it's a main screen
            if (['home', 'search', 'library', 'settings'].includes(screenName)) {
                navItems.forEach(navItem => {
                    navItem.classList.remove('active');
                });
                
                document.getElementById(`nav-${screenName}`).classList.add('active');
            }
        }, 300); // Match this to the CSS animation duration
    } else {
        // If no current active screen, just show the new one with enter animation
        const newScreen = document.getElementById(`${screenName}-screen`);
        newScreen.classList.add('active', 'enter');
        
        // Update nav if it's a main screen
        if (['home', 'search', 'library', 'settings'].includes(screenName)) {
            navItems.forEach(navItem => {
                navItem.classList.remove('active');
            });
            
            document.getElementById(`nav-${screenName}`).classList.add('active');
        }
    }
}

// Helper Functions
function populateCarousel(carousel, items) {
    carousel.innerHTML = '';
    
    if (!items || items.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-carousel-message';
        emptyMessage.textContent = 'No items to display yet';
        carousel.appendChild(emptyMessage);
        return;
    }
    
    items.forEach(item => {
        const carouselItem = document.createElement('div');
        carouselItem.className = 'carousel-item';
        carouselItem.innerHTML = `
            <img src="${item.cover}" alt="${item.title}">
            <div class="carousel-item-info">
                <div class="carousel-item-title">${item.title}</div>
                <div class="carousel-item-subtitle artist-link" data-artist="${item.artist}">${item.artist}</div>
            </div>
        `;
        
        carouselItem.addEventListener('click', () => {
            playSong(item.id);
        });
        
        const artistLink = carouselItem.querySelector('.artist-link');
        artistLink.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering the parent's click event
            const artistName = artistLink.dataset.artist;
            const artist = musicData.artists.find(a => a.name === artistName);
            if (artist) {
                openArtist(artist);
            }
        });
        
        carousel.appendChild(carouselItem);
    });
}

function createGridItem(image, title, subtitle) {
    const gridItem = document.createElement('div');
    gridItem.className = 'grid-item';
    gridItem.innerHTML = `
        <img src="${image}" alt="${title}">
        <div class="grid-info">
            <div class="grid-title">${title}</div>
            <div class="grid-subtitle">${subtitle}</div>
        </div>
    `;
    return gridItem;
}

function playSong(songId) {
    const song = musicData.songs.find(s => s.id === songId);
    if (!song) return;
    
    currentSong = song;
    audioPlayer.src = song.mp3;
    currentSongElement.textContent = song.title;
    currentArtistElement.textContent = song.artist;
    currentAlbumArt.src = song.cover;
    
    // Apply audio quality
    applyAudioQuality(audioQuality);
    
    // Add click handler to artist name in now playing
    currentArtistElement.classList.add('artist-link');
    currentArtistElement.dataset.artist = song.artist;
    currentArtistElement.onclick = () => {
        const artist = musicData.artists.find(a => a.name === song.artist);
        if (artist) {
            openArtist(artist);
        }
    };
    
    audioPlayer.play();
    isPlaying = true;
    updatePlayButton();
    
    // Update play history
    updatePlayHistory(songId);
    
    // If not in a playlist context, create one of all songs
    if (currentPlaylist.length === 0 || !currentPlaylist.includes(songId)) {
        // Create playlist of all songs and set current index
        currentPlaylist = musicData.songs.map(s => s.id);
        currentIndex = currentPlaylist.indexOf(songId);
    } else {
        // Update current index in existing playlist
        currentIndex = currentPlaylist.indexOf(songId);
    }
}

function loadPlaylist(playlistId) {
    // Find playlist from both default and user playlists
    const defaultPlaylist = musicData.playlists.find(p => p.id === playlistId);
    
    if (defaultPlaylist) {
        openPlaylist(defaultPlaylist);
        return;
    }
    
    // Check user playlists
    if (db) {
        const transaction = db.transaction(['playlists'], 'readonly');
        const store = transaction.objectStore('playlists');
        const request = store.get(playlistId);
        
        request.onsuccess = function(event) {
            const playlist = event.target.result;
            if (playlist) {
                openPlaylist(playlist);
            }
        };
    }
}

function loadAlbum(albumId) {
    const album = musicData.albums.find(a => a.id === albumId);
    if (!album) return;
    
    currentPlaylist = album.songs;
    currentIndex = 0;
    playSong(currentPlaylist[currentIndex]);
}

function updatePlayButton() {
    if (isPlaying) {
        playIcon.classList.add('hidden');
        pauseIcon.classList.remove('hidden');
    } else {
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');
    }
}

function togglePlay() {
    if (!currentSong) {
        playSong(musicData.songs[0].id);
        return;
    }
    
    if (isPlaying) {
        audioPlayer.pause();
        isPlaying = false;
    } else {
        audioPlayer.play();
        isPlaying = true;
    }
    
    updatePlayButton();
}

function toggleLoop() {
    isLooping = !isLooping;
    audioPlayer.loop = isLooping;
    
    // Add/remove active class to visually indicate state
    if (isLooping) {
        loopBtn.classList.add('active');
    } else {
        loopBtn.classList.remove('active');
    }
}

function playNext() {
    if (currentPlaylist.length === 0) return;
    
    // If looping is enabled, don't change songs
    if (isLooping) {
        audioPlayer.currentTime = 0;
        audioPlayer.play();
        return;
    }
    
    currentIndex = (currentIndex + 1) % currentPlaylist.length;
    playSong(currentPlaylist[currentIndex]);
}

function playPrevious() {
    if (currentPlaylist.length === 0) return;
    
    currentIndex = (currentIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
    playSong(currentPlaylist[currentIndex]);
}

// Event Listeners
function setupEventListeners() {
    // Menu events
    menuBtn.addEventListener('click', () => {
        sideMenu.classList.add('active');
    });
    
    closeMenu.addEventListener('click', () => {
        sideMenu.classList.remove('active');
    });
    
    // Navigation events
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.id.replace('nav-', '');
            openScreen(targetId);
        });
    });
    
    // Sidebar menu items
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const menuText = item.textContent.trim();
            sideMenu.classList.remove('active');
            
            switch(menuText) {
                case 'Playlists':
                    openScreen('library');
                    document.querySelector('.tab[data-tab="playlists"]').click();
                    break;
                case 'Albums':
                    openScreen('library');
                    document.querySelector('.tab[data-tab="albums"]').click();
                    break;
                case 'Artists':
                    openScreen('library');
                    document.querySelector('.tab[data-tab="artists"]').click();
                    break;
                case 'Genres':
                    // For now, just show a message since genres aren't implemented
                    alert('Genres feature coming soon!');
                    break;
                case 'Podcasts':
                    // For now, just show a message since podcasts aren't implemented
                    alert('Podcasts feature coming soon!');
                    break;
            }
        });
    });
    
    // Tab events
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            
            tabs.forEach(t => {
                t.classList.remove('active');
            });
            
            tabContents.forEach(content => {
                content.classList.remove('active');
            });
            
            tab.classList.add('active');
            document.getElementById(`${targetTab}-content`).classList.add('active');
            
            // If switching to liked songs tab, populate it
            if (targetTab === 'liked') {
                displayLikedSongs();
            }
        });
    });
    
    // Theme toggle
    if (themeSelect) {
        themeSelect.addEventListener('change', () => {
            const newTheme = themeSelect.value;
            saveThemeSetting(newTheme);
        });
    }
    
    // Audio quality setting
    if (audioQualitySelect) {
        audioQualitySelect.addEventListener('change', () => {
            const quality = audioQualitySelect.value;
            saveAudioQualitySetting(quality);
        });
    }
    
    // Player controls
    playBtn.addEventListener('click', togglePlay);
    nextBtn.addEventListener('click', playNext);
    prevBtn.addEventListener('click', playPrevious);
    loopBtn.addEventListener('click', toggleLoop);
    
    // Progress bar events
    progressContainer.addEventListener('click', (e) => {
        if (!audioPlayer.duration) return;
        
        const clickPosition = e.clientX - progressContainer.getBoundingClientRect().left;
        const progressWidth = progressContainer.offsetWidth;
        const seekPercentage = clickPosition / progressWidth;
        
        // Set audio time
        audioPlayer.currentTime = seekPercentage * audioPlayer.duration;
    });
    
    audioPlayer.addEventListener('timeupdate', () => {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        songProgress.style.width = `${progress}%`;
    });
    
    audioPlayer.addEventListener('ended', playNext);
    
    // Create playlist button
    createPlaylistBtn.addEventListener('click', () => {
        const playlistName = prompt('Enter playlist name:');
        if (playlistName && playlistName.trim()) {
            createNewPlaylist(playlistName.trim());
        }
    });
    
    // Edit profile button
    const editProfileBtn = document.querySelector('.edit-profile-btn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            const newName = prompt('Enter your profile name:', profileName);
            if (newName && newName.trim()) {
                saveProfileName(newName.trim());
            }
        });
    }
    
    // Search input
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        
        if (query.length < 2) {
            document.querySelectorAll('.result-section').forEach(section => {
                section.style.display = 'none';
            });
            return;
        }
        
        document.querySelectorAll('.result-section').forEach(section => {
            section.style.display = 'block';
        });
        
        // Search tracks
        const tracksResults = document.getElementById('tracks-results');
        tracksResults.innerHTML = '';
        
        const filteredTracks = musicData.songs.filter(song => 
            song.title.toLowerCase().includes(query) || 
            song.artist.toLowerCase().includes(query)
        ).slice(0, 6);
        
        filteredTracks.forEach(song => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            resultItem.innerHTML = `
                <img src="${song.cover}" alt="${song.title}">
                <div class="result-info">
                    <div class="result-title">${song.title}</div>
                    <div class="result-artist artist-link" data-artist="${song.artist}">${song.artist}</div>
                </div>
            `;
            
            resultItem.addEventListener('click', () => {
                playSong(song.id);
            });
            
            const artistLink = resultItem.querySelector('.artist-link');
            artistLink.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering the parent's click event
                const artistName = artistLink.dataset.artist;
                const artist = musicData.artists.find(a => a.name === artistName);
                if (artist) {
                    openArtist(artist);
                }
            });
            
            tracksResults.appendChild(resultItem);
        });
        
        // Search albums
        const albumsResults = document.getElementById('albums-results');
        albumsResults.innerHTML = '';
        
        const filteredAlbums = musicData.albums.filter(album => 
            album.name.toLowerCase().includes(query) || 
            album.artist.toLowerCase().includes(query)
        ).slice(0, 4);
        
        filteredAlbums.forEach(album => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            resultItem.innerHTML = `
                <img src="${album.cover}" alt="${album.name}">
                <div class="result-info">
                    <div class="result-title">${album.name}</div>
                    <div class="result-artist artist-link" data-artist="${album.artist}">${album.artist}</div>
                </div>
            `;
            
            resultItem.addEventListener('click', () => {
                loadAlbum(album.id);
            });
            
            const artistLink = resultItem.querySelector('.artist-link');
            artistLink.addEventListener('click', (e) => {
                e.stopPropagation();
                const artistName = artistLink.dataset.artist;
                const artist = musicData.artists.find(a => a.name === artistName);
                if (artist) {
                    openArtist(artist);
                }
            });
            
            albumsResults.appendChild(resultItem);
        });
        
        // Search artists
        const artistsResults = document.getElementById('artists-results');
        artistsResults.innerHTML = '';
        
        const filteredArtists = musicData.artists.filter(artist => 
            artist.name.toLowerCase().includes(query)
        ).slice(0, 4);
        
        filteredArtists.forEach(artist => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            resultItem.innerHTML = `
                <img src="${artist.cover}" alt="${artist.name}">
                <div class="result-info">
                    <div class="result-title">${artist.name}</div>
                    <div class="result-artist">${artist.songs.length} songs</div>
                </div>
            `;
            
            resultItem.addEventListener('click', () => {
                openArtist(artist);
            });
            
            artistsResults.appendChild(resultItem);
        });
    });
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
