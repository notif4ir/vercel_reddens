document.addEventListener('DOMContentLoaded', () => {
    // First, check if data.js has loaded properly
    if (typeof musicData === "undefined" || !musicData || !musicData.songs) {
        console.error("Music data not found! Make sure data.js is loaded properly.");
        document.body.innerHTML = `
            <div style="color: white; text-align: center; margin-top: 100px; padding: 20px; font-family: sans-serif;">
                <h1>Error: Music data not found</h1>
                <p>Please make sure data.js is properly included in the page and loaded before script.js.</p>
                <p>Check the console for more details.</p>
            </div>
        `;
        return;
    }
    
    console.log("Music data loaded successfully:", musicData.songs.length, "songs found");
    
    // Initialize IndexedDB
    let db;
    const dbName = "reddensDB";
    const dbVersion = 1;
    
    const initDB = () => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbName, dbVersion);
            
            request.onerror = (event) => {
                console.error("IndexedDB error:", event.target.error);
                reject(event.target.error);
                
                // Fall back to localStorage
                console.log("Falling back to localStorage");
                initializeWithLocalStorage();
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores
                if (!db.objectStoreNames.contains('userData')) {
                    const userDataStore = db.createObjectStore('userData', { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains('playStats')) {
                    const playStatsStore = db.createObjectStore('playStats', { keyPath: 'songId' });
                    playStatsStore.createIndex('playCount', 'playCount', { unique: false });
                }
            };
            
            request.onsuccess = (event) => {
                db = event.target.result;
                console.log("IndexedDB initialized successfully");
                
                // Initialize user data if not exists
                checkAndInitUserData()
                    .then(() => {
                        // Check and reset play stats if a week has passed
                        checkAndResetPlayStats();
                        resolve();
                    })
                    .catch(error => {
                        console.error("Error initializing data:", error);
                        reject(error);
                    });
            };
        });
    };
    
    // Initialize with localStorage (fallback)
    const initializeWithLocalStorage = () => {
        if (!localStorage.getItem('reddensUserData')) {
            const initialUserData = {
                likedSongs: [],
                playlists: [],
                recentlyPlayed: []
            };
            localStorage.setItem('reddensUserData', JSON.stringify(initialUserData));
        }
    };
    
    // Check and initialize user data in IndexedDB
    const checkAndInitUserData = () => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['userData'], 'readwrite');
            const userDataStore = transaction.objectStore('userData');
            
            const request = userDataStore.get('user');
            
            request.onsuccess = (event) => {
                if (!event.target.result) {
                    // User data doesn't exist, create it
                    const initialUserData = {
                        id: 'user',
                        likedSongs: [],
                        playlists: [],
                        recentlyPlayed: [],
                        lastStatsReset: new Date().toISOString()
                    };
                    
                    userDataStore.add(initialUserData);
                    
                    // Migrate from localStorage if exists
                    if (localStorage.getItem('reddensUserData')) {
                        try {
                            const oldData = JSON.parse(localStorage.getItem('reddensUserData'));
                            const migrateTransaction = db.transaction(['userData'], 'readwrite');
                            const migrateStore = migrateTransaction.objectStore('userData');
                            
                            const migratedData = {
                                id: 'user',
                                likedSongs: oldData.likedSongs || [],
                                playlists: oldData.playlists || [],
                                recentlyPlayed: oldData.recentlyPlayed || [],
                                lastStatsReset: new Date().toISOString()
                            };
                            
                            migrateStore.put(migratedData);
                            console.log("Data migrated from localStorage to IndexedDB");
                        } catch (error) {
                            console.error("Error migrating data:", error);
                        }
                    }
                }
                resolve();
            };
            
            request.onerror = (event) => {
                console.error("Error checking user data:", event.target.error);
                reject(event.target.error);
            };
        });
    };
    
    // Check and reset play stats if a week has passed
    const checkAndResetPlayStats = () => {
        getUserData().then(userData => {
            if (!userData.lastStatsReset) return;
            
            const lastReset = new Date(userData.lastStatsReset);
            const now = new Date();
            const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
            
            if (now - lastReset > oneWeekInMs) {
                // Reset play stats
                const transaction = db.transaction(['playStats', 'userData'], 'readwrite');
                const playStatsStore = transaction.objectStore('playStats');
                const userDataStore = transaction.objectStore('userData');
                
                // Clear play stats
                playStatsStore.clear();
                
                // Update lastStatsReset
                const getUserRequest = userDataStore.get('user');
                getUserRequest.onsuccess = (event) => {
                    const userData = event.target.result;
                    userData.lastStatsReset = now.toISOString();
                    userDataStore.put(userData);
                };
                
                console.log("Weekly play stats reset completed");
            }
        });
    };
    
    // Get user data from IndexedDB
    const getUserData = () => {
        return new Promise((resolve, reject) => {
            if (!db) {
                // Fall back to localStorage
                try {
                    const data = JSON.parse(localStorage.getItem('reddensUserData'));
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
                return;
            }
            
            const transaction = db.transaction(['userData'], 'readonly');
            const userDataStore = transaction.objectStore('userData');
            
            const request = userDataStore.get('user');
            
            request.onsuccess = (event) => {
                resolve(event.target.result || { likedSongs: [], playlists: [], recentlyPlayed: [] });
            };
            
            request.onerror = (event) => {
                console.error("Error getting user data:", event.target.error);
                reject(event.target.error);
            };
        });
    };
    
    // Save user data to IndexedDB
    const saveUserData = (data) => {
        return new Promise((resolve, reject) => {
            if (!db) {
                // Fall back to localStorage
                try {
                    localStorage.setItem('reddensUserData', JSON.stringify(data));
                    resolve();
                } catch (error) {
                    reject(error);
                }
                return;
            }
            
            const transaction = db.transaction(['userData'], 'readwrite');
            const userDataStore = transaction.objectStore('userData');
            
            // Ensure ID is set
            data.id = 'user';
            
            const request = userDataStore.put(data);
            
            request.onsuccess = () => {
                resolve();
            };
            
            request.onerror = (event) => {
                console.error("Error saving user data:", event.target.error);
                reject(event.target.error);
            };
        });
    };
    
    // Get play stats for a song
    const getPlayStats = (songId) => {
        return new Promise((resolve, reject) => {
            if (!db) {
                resolve({ songId, playCount: 0 });
                return;
            }
            
            const transaction = db.transaction(['playStats'], 'readonly');
            const playStatsStore = transaction.objectStore('playStats');
            
            const request = playStatsStore.get(songId);
            
            request.onsuccess = (event) => {
                resolve(event.target.result || { songId, playCount: 0 });
            };
            
            request.onerror = (event) => {
                console.error("Error getting play stats:", event.target.error);
                reject(event.target.error);
            };
        });
    };
    
    // Increment play count for a song
    const incrementPlayCount = (songId) => {
        return new Promise((resolve, reject) => {
            if (!db) {
                resolve();
                return;
            }
            
            const transaction = db.transaction(['playStats'], 'readwrite');
            const playStatsStore = transaction.objectStore('playStats');
            
            const request = playStatsStore.get(songId);
            
            request.onsuccess = (event) => {
                const stats = event.target.result || { songId, playCount: 0 };
                stats.playCount++;
                
                playStatsStore.put(stats);
                resolve();
            };
            
            request.onerror = (event) => {
                console.error("Error incrementing play count:", event.target.error);
                reject(event.target.error);
            };
        });
    };
    
    // Get most played songs
    const getMostPlayedSongs = (limit = 5) => {
        return new Promise((resolve, reject) => {
            if (!db) {
                resolve([]);
                return;
            }
            
            const transaction = db.transaction(['playStats'], 'readonly');
            const playStatsStore = transaction.objectStore('playStats');
            const playCountIndex = playStatsStore.index('playCount');
            
            // Get all play stats
            const request = playStatsStore.getAll();
            
            request.onsuccess = (event) => {
                const stats = event.target.result || [];
                
                // Sort by play count descending
                stats.sort((a, b) => b.playCount - a.playCount);
                
                // Get the song objects for the most played
                const topSongs = [];
                for (let i = 0; i < Math.min(limit, stats.length); i++) {
                    const song = musicData.songs.find(s => s.id === stats[i].songId);
                    if (song) {
                        topSongs.push(song);
                    }
                }
                
                resolve(topSongs);
            };
            
            request.onerror = (event) => {
                console.error("Error getting most played songs:", event.target.error);
                reject(event.target.error);
            };
        });
    };

    // Music player state
    const playerState = {
        currentSong: null,
        isPlaying: false,
        currentIndex: 0,
        currentList: [],
        shuffle: false,
        repeat: false,
        volume: 0.7,
        currentView: 'home', // Tracks the current view (home, playlist, artist, album)
        currentPlaylistId: null,
        currentAlbumId: null,
        currentArtistId: null,
        searchQuery: ''
    };

    // DOM elements - Player controls
    const audioPlayer = document.getElementById("audio-player");
    const playPauseBtn = document.getElementById("play-pause-btn");
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const shuffleBtn = document.getElementById("shuffle-btn");
    const repeatBtn = document.getElementById("repeat-btn");
    const volumeBtn = document.getElementById("volume-btn");
    const progressContainer = document.querySelector(".progress-container");
    const progress = document.querySelector(".progress");
    const currentTimeEl = document.getElementById("current-time");
    const totalTimeEl = document.getElementById("total-time");
    const currentSongImg = document.getElementById("current-song-img");
    const currentSongTitle = document.getElementById("current-song-title");
    const currentSongArtist = document.getElementById("current-song-artist");
    const volumeBar = document.querySelector(".volume-bar");
    const volumeLevel = document.querySelector(".volume-level");
    const likeCurrentSongBtn = document.getElementById("like-current-song");
    const addToPlaylistBtn = document.getElementById("add-to-playlist-btn");

    // DOM elements - Playlists and modals
    const createPlaylistBtn = document.getElementById("create-playlist-btn");
    const likedSongsBtn = document.getElementById("liked-songs-btn");
    const userPlaylistsContainer = document.getElementById("user-playlists");
    
    // Modals
    const createPlaylistModal = document.getElementById("create-playlist-modal");
    const editPlaylistModal = document.getElementById("edit-playlist-modal");
    const addToPlaylistModal = document.getElementById("add-to-playlist-modal");
    const seeAllModal = document.getElementById("see-all-modal");
    
    // Form elements
    const playlistImageInput = document.getElementById("playlist-image-input");
    const playlistImagePreview = document.getElementById("playlist-image-preview");
    const playlistNameInput = document.getElementById("playlist-name");
    const playlistDescriptionInput = document.getElementById("playlist-description");
    const savePlaylistBtn = document.getElementById("save-playlist");
    const cancelPlaylistBtn = document.getElementById("cancel-playlist");
    
    const editPlaylistImageInput = document.getElementById("edit-playlist-image-input");
    const editPlaylistImage = document.getElementById("edit-playlist-image");
    const editPlaylistNameInput = document.getElementById("edit-playlist-name");
    const editPlaylistDescriptionInput = document.getElementById("edit-playlist-description");
    const editPlaylistIdInput = document.getElementById("edit-playlist-id");
    const saveEditPlaylistBtn = document.getElementById("save-edit-playlist");
    const cancelEditPlaylistBtn = document.getElementById("cancel-edit-playlist");
    const deletePlaylistBtn = document.getElementById("delete-playlist");
    
    const playlistSelectContainer = document.getElementById("playlist-select");
    const cancelAddToPlaylistBtn = document.getElementById("cancel-add-to-playlist");
    
    // See All
    const seeAllLinks = document.querySelectorAll('.see-all');
    const seeAllTitle = document.getElementById("see-all-title");
    const seeAllContent = document.getElementById("see-all-content");

    // New DOM elements for search
    const searchInput = document.getElementById("search-input");
    const searchResults = document.getElementById("search-results");
    const searchTab = document.getElementById("search-tab");
    const mainContent = document.querySelector('.main-content');

    // Initialize music player
    function initMusicPlayer() {
        // Set initial volume
        audioPlayer.volume = playerState.volume;
        volumeLevel.style.width = `${playerState.volume * 100}%`;

        // Setup audio player event listeners
        audioPlayer.addEventListener("timeupdate", updateProgress);
        audioPlayer.addEventListener("ended", handleSongEnd);
        audioPlayer.addEventListener("loadedmetadata", () => {
            updateTotalTime();
        });

        // Setup control button event listeners
        playPauseBtn.addEventListener("click", togglePlayPause);
        prevBtn.addEventListener("click", playPrevious);
        nextBtn.addEventListener("click", playNext);
        shuffleBtn.addEventListener("click", toggleShuffle);
        repeatBtn.addEventListener("click", toggleRepeat);
        progressContainer.addEventListener("click", setProgress);
        volumeBtn.addEventListener("click", toggleMute);
        volumeBar.addEventListener("click", setVolume);
        
        // Like and playlist buttons
        likeCurrentSongBtn.addEventListener("click", toggleLikeCurrentSong);
        addToPlaylistBtn.addEventListener("click", showAddToPlaylistModal);
        
        // Playlist creation and management
        createPlaylistBtn.addEventListener("click", showCreatePlaylistModal);
        likedSongsBtn.addEventListener("click", showLikedSongs);
        
        // Create playlist modal
        playlistImageInput.addEventListener("change", handlePlaylistImageSelect);
        document.querySelector("#create-playlist-modal .playlist-image-container").addEventListener("click", () => {
            playlistImageInput.click();
        });
        savePlaylistBtn.addEventListener("click", createPlaylist);
        cancelPlaylistBtn.addEventListener("click", hideCreatePlaylistModal);
        document.querySelectorAll("#create-playlist-modal .close-modal").forEach(el => {
            el.addEventListener("click", hideCreatePlaylistModal);
        });
        
        // Edit playlist modal
        editPlaylistImageInput.addEventListener("change", handleEditPlaylistImageSelect);
        document.querySelector("#edit-playlist-modal .playlist-image-container").addEventListener("click", () => {
            editPlaylistImageInput.click();
        });
        saveEditPlaylistBtn.addEventListener("click", saveEditPlaylist);
        cancelEditPlaylistBtn.addEventListener("click", hideEditPlaylistModal);
        deletePlaylistBtn.addEventListener("click", deletePlaylist);
        document.querySelectorAll("#edit-playlist-modal .close-modal").forEach(el => {
            el.addEventListener("click", hideEditPlaylistModal);
        });
        
        // Add to playlist modal
        cancelAddToPlaylistBtn.addEventListener("click", hideAddToPlaylistModal);
        document.querySelectorAll("#add-to-playlist-modal .close-modal").forEach(el => {
            el.addEventListener("click", hideAddToPlaylistModal);
        });
        
        // See All modal
        document.querySelectorAll("#see-all-modal .close-modal").forEach(el => {
            el.addEventListener("click", hideSeeAllModal);
        });
        
        // See All links
        seeAllLinks.forEach(link => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                const sectionId = link.getAttribute("data-section");
                showSeeAllModal(sectionId, link.closest('.section-header').querySelector('h2').textContent);
            });
        });
    }

    // Populate UI with music data
    function populateUI() {
        populateUserPlaylists();
        populateAlbums();
        populateArtists();
        populateFeaturedAlbums();
        populateRecentSongs();
        populateMostPlayed();
        populateAllSongs();
    }

    // Populate user playlists
    function populateUserPlaylists() {
        getUserData().then(userData => {
            if (!userData) return;
            
            userPlaylistsContainer.innerHTML = '';

            // Add the Liked Songs "playlist" first
            const likedSongsItem = document.createElement('li');
            likedSongsItem.className = 'playlist-item-sidebar';
            if (playerState.currentView === 'liked') {
                likedSongsItem.classList.add('active');
            }
            likedSongsItem.innerHTML = `
                <span>Liked Songs</span>
            `;
            likedSongsItem.addEventListener('click', function() {
                clearSidebarSelections();
                this.classList.add('active');
                showLikedSongs();
            });
            userPlaylistsContainer.appendChild(likedSongsItem);

            // Add user-created playlists
            userData.playlists.forEach(playlist => {
                const playlistItem = document.createElement('li');
                playlistItem.className = 'playlist-item-sidebar';
                if (playerState.currentView === 'playlist' && playerState.currentPlaylistId === playlist.id) {
                    playlistItem.classList.add('active');
                }
                playlistItem.innerHTML = `
                    <span>${playlist.name}</span>
                    <div class="playlist-options">
                        <i class="fas fa-ellipsis-h" data-playlist-id="${playlist.id}"></i>
                    </div>
                `;
                
                playlistItem.querySelector('span').addEventListener('click', function() {
                    clearSidebarSelections();
                    playlistItem.classList.add('active');
                    loadPlaylist(playlist.id);
                });
                
                const optionsBtn = playlistItem.querySelector('.playlist-options i');
                optionsBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showPlaylistContextMenu(e, playlist.id);
                });
                
                userPlaylistsContainer.appendChild(playlistItem);
            });
        }).catch(error => {
            console.error("Error loading playlists:", error);
        });
    }

    // Show playlist context menu
    function showPlaylistContextMenu(event, playlistId) {
        event.preventDefault();
        
        // Remove any existing context menu
        const existingMenu = document.querySelector('.context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
        
        // Create new context menu
        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.innerHTML = `
            <div class="context-menu-item edit-playlist"><i class="fas fa-edit"></i> Edit details</div>
            <div class="context-menu-item delete-playlist"><i class="fas fa-trash"></i> Delete</div>
            <div class="context-menu-item export-playlist"><i class="fas fa-file-export"></i> Save as .rpl</div>
        `;
        
        // Position the menu
        contextMenu.style.top = `${event.clientY}px`;
        contextMenu.style.left = `${event.clientX}px`;
        document.body.appendChild(contextMenu);
        
        // Adjust position if menu goes off screen
        const menuRect = contextMenu.getBoundingClientRect();
        if (menuRect.right > window.innerWidth) {
            contextMenu.style.left = `${window.innerWidth - menuRect.width - 10}px`;
        }
        if (menuRect.bottom > window.innerHeight) {
            contextMenu.style.top = `${window.innerHeight - menuRect.height - 10}px`;
        }
        
        // Add event listeners
        contextMenu.querySelector('.edit-playlist').addEventListener('click', () => {
            showEditPlaylistModal(playlistId);
            removeContextMenu();
        });
        
        contextMenu.querySelector('.delete-playlist').addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this playlist?')) {
                deletePlaylistById(playlistId);
            }
            removeContextMenu();
        });
        
        contextMenu.querySelector('.export-playlist').addEventListener('click', () => {
            exportPlaylistToRPL(playlistId);
            removeContextMenu();
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', removeContextMenu);
        
        function removeContextMenu() {
            contextMenu.remove();
            document.removeEventListener('click', removeContextMenu);
        }
    }

    // Export playlist to RPL file
    function exportPlaylistToRPL(playlistId) {
        getUserData().then(userData => {
            if (!userData || !userData.playlists) {
                alert('User data not found');
                return;
            }
            
            const playlist = userData.playlists.find(p => p.id === playlistId);
            
            if (!playlist) {
                alert('Playlist not found');
                return;
            }
            
            // Prepare playlist data
            const playlistSongs = [];
            playlist.songs.forEach(songId => {
                const song = musicData.songs.find(s => s.id === songId);
                if (song) {
                    playlistSongs.push({
                        id: song.id,
                        title: song.title,
                        artist: song.artist,
                        album: song.album,
                        cover: song.cover,
                        duration: song.duration,
                        mp3: song.mp3
                    });
                }
            });
            
            const rplData = {
                name: playlist.name,
                description: playlist.description || '',
                image: playlist.image || 'REDDENSV2.png',
                creator: 'User',
                createdAt: new Date().toISOString(),
                songs: playlistSongs
            };
            
            // Convert to JSON string
            const rplString = JSON.stringify(rplData, null, 2);
            
            // Create and download file
            const blob = new Blob([rplString], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${playlist.name.replace(/\s+/g, '_')}.rpl`;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
        }).catch(error => {
            console.error("Error exporting playlist:", error);
            alert("Failed to export playlist. Please try again.");
        });
    }

    // Import playlist from RPL file
    function importPlaylistFromRPL(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const rplData = JSON.parse(e.target.result);
                
                // Validate required fields
                if (!rplData.name || !Array.isArray(rplData.songs)) {
                    throw new Error('Invalid RPL file format');
                }
                
                // Create new playlist
                const userData = getUserData();
                const newPlaylist = {
                    id: Date.now(),
                    name: rplData.name,
                    description: rplData.description || '',
                    image: rplData.image || 'REDDENSV2.png',
                    songs: []
                };
                
                // Add songs (only those that exist in our music data)
                rplData.songs.forEach(song => {
                    const existingSong = musicData.songs.find(s => s.id === song.id);
                    if (existingSong) {
                        newPlaylist.songs.push(existingSong.id);
                    }
                });
                
                userData.playlists.push(newPlaylist);
                saveUserData(userData);
                
                // Update UI
                populateUserPlaylists();
                alert(`Playlist "${newPlaylist.name}" imported successfully with ${newPlaylist.songs.length} songs`);
                
                // Load the new playlist
                loadPlaylist(newPlaylist.id);
                
            } catch (error) {
                console.error('Error importing playlist:', error);
                alert('Failed to import playlist. Invalid file format.');
            }
        };
        reader.readAsText(file);
    }

    // Show Create Playlist Modal
    function showCreatePlaylistModal() {
        // Reset form
        playlistNameInput.value = '';
        playlistDescriptionInput.value = '';
        playlistImagePreview.src = 'REDDENSV2.png';
        
        // Check if import button already exists
        if (!document.getElementById('import-rpl-btn')) {
            const importBtn = document.createElement('button');
            importBtn.id = 'import-rpl-btn';
            importBtn.className = 'btn-secondary';
            importBtn.textContent = 'Import .rpl';
            importBtn.style.marginRight = 'auto';
            
            const formActions = document.querySelector('#create-playlist-modal .form-actions');
            formActions.insertBefore(importBtn, formActions.firstChild);
            
            importBtn.addEventListener('click', () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.rpl';
                input.onchange = (e) => {
                    if (e.target.files.length > 0) {
                        importPlaylistFromRPL(e.target.files[0]);
                        hideCreatePlaylistModal();
                    }
                };
                input.click();
            });
        }
        
        // Show modal
        createPlaylistModal.style.display = 'block';
    }

    // Hide Create Playlist Modal
    function hideCreatePlaylistModal() {
        createPlaylistModal.style.display = 'none';
    }

    // Handle playlist image selection
    function handlePlaylistImageSelect(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                playlistImagePreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    // Create a new playlist
    function createPlaylist() {
        const playlistName = playlistNameInput.value.trim();
        const playlistDesc = playlistDescriptionInput.value.trim();
        const playlistImg = playlistImagePreview.src;
        
        if (!playlistName) {
            alert('Please enter a playlist name');
            return;
        }
        
        getUserData().then(userData => {
            // Initialize userData if it's undefined
            if (!userData) {
                userData = {
                    id: 'user',
                    likedSongs: [],
                    playlists: [],
                    recentlyPlayed: [],
                    lastStatsReset: new Date().toISOString()
                };
            }
            
            // Initialize playlists array if it doesn't exist
            if (!userData.playlists) {
                userData.playlists = [];
            }
            
            const newPlaylist = {
                id: Date.now(),
                name: playlistName,
                description: playlistDesc,
                image: playlistImg,
                songs: []
            };
            
            userData.playlists.push(newPlaylist);
            
            saveUserData(userData).then(() => {
                populateUserPlaylists();
                hideCreatePlaylistModal();
                loadPlaylist(newPlaylist.id);
            }).catch(error => {
                console.error("Error saving new playlist:", error);
                alert("Failed to create playlist. Please try again.");
            });
        }).catch(error => {
            console.error("Error creating playlist:", error);
            alert("Failed to create playlist. Please try again.");
        });
    }

    // Show Edit Playlist Modal
    function showEditPlaylistModal(playlistId) {
        getUserData().then(userData => {
            if (!userData || !userData.playlists) {
                alert('User data not found');
                return;
            }
            
            const playlist = userData.playlists.find(p => p.id === playlistId);
            
            if (!playlist) {
                alert('Playlist not found');
                return;
            }
            
            // Fill form with playlist data
            editPlaylistNameInput.value = playlist.name;
            editPlaylistDescriptionInput.value = playlist.description || '';
            editPlaylistImage.src = playlist.image;
            editPlaylistIdInput.value = playlist.id;
            
            // Show modal
            editPlaylistModal.style.display = 'block';
        }).catch(error => {
            console.error("Error showing edit playlist modal:", error);
            alert("Failed to open playlist editor. Please try again.");
        });
    }

    // Hide Edit Playlist Modal
    function hideEditPlaylistModal() {
        editPlaylistModal.style.display = 'none';
    }

    // Handle edit playlist image selection
    function handleEditPlaylistImageSelect(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                editPlaylistImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    // Save edited playlist
    function saveEditPlaylist() {
        const name = editPlaylistNameInput.value.trim();
        if (!name) {
            alert('Please enter a playlist name');
            return;
        }

        const playlistId = parseInt(editPlaylistIdInput.value);
        
        getUserData().then(userData => {
            if (!userData || !userData.playlists) {
                alert('User data not found');
                return;
            }
            
            const playlistIndex = userData.playlists.findIndex(p => p.id === playlistId);
            
            if (playlistIndex === -1) {
                alert('Playlist not found');
                return;
            }
            
            // Update playlist
            userData.playlists[playlistIndex].name = name;
            userData.playlists[playlistIndex].description = editPlaylistDescriptionInput.value.trim();
            userData.playlists[playlistIndex].image = editPlaylistImage.src;
            
            saveUserData(userData).then(() => {
                // Update UI
                populateUserPlaylists();
                hideEditPlaylistModal();
                
                // If currently viewing this playlist, refresh it
                if (playerState.currentView === 'playlist' && playerState.currentPlaylistId === playlistId) {
                    loadPlaylist(playlistId);
                }
            }).catch(error => {
                console.error("Error saving playlist changes:", error);
                alert("Failed to save playlist changes. Please try again.");
            });
        }).catch(error => {
            console.error("Error editing playlist:", error);
            alert("Failed to edit playlist. Please try again.");
        });
    }

    // Delete playlist
    function deletePlaylist() {
        const playlistId = parseInt(editPlaylistIdInput.value);
        deletePlaylistById(playlistId);
        hideEditPlaylistModal();
    }

    // Delete playlist by ID
    function deletePlaylistById(playlistId) {
        getUserData().then(userData => {
            if (!userData) return;
            
            userData.playlists = userData.playlists.filter(p => p.id !== playlistId);
            
            saveUserData(userData).then(() => {
                // Update UI
                populateUserPlaylists();
                
                // If currently viewing this playlist, go back to home
                if (playerState.currentView === 'playlist' && playerState.currentPlaylistId === playlistId) {
                    // Reset to home view
                    playerState.currentView = 'home';
                    delete playerState.currentPlaylistId;
                    
                    // Refresh UI
                    document.querySelector('.all-songs .section-header h2').textContent = 'All songs';
                    populateAllSongs();
                }
            }).catch(error => {
                console.error("Error saving user data after deleting playlist:", error);
                alert("Failed to delete playlist. Please try again.");
            });
        }).catch(error => {
            console.error("Error deleting playlist:", error);
            alert("Failed to delete playlist. Please try again.");
        });
    }

    // Show Add to Playlist Modal
    function showAddToPlaylistModal() {
        if (!playerState.currentSong) {
            alert('No song is currently playing');
            return;
        }
        
        populatePlaylistSelect();
        addToPlaylistModal.style.display = 'block';
    }

    // Hide Add to Playlist Modal
    function hideAddToPlaylistModal() {
        addToPlaylistModal.style.display = 'none';
    }

    // Populate playlist select in add to playlist modal
    function populatePlaylistSelect() {
        getUserData().then(userData => {
            if (!userData || !userData.playlists) {
                userData = { playlists: [] };
            }
            
            playlistSelectContainer.innerHTML = '';
            
            userData.playlists.forEach(playlist => {
                const playlistItem = document.createElement('div');
                playlistItem.className = 'playlist-item';
                
                // Check if song is already in playlist
                const songInPlaylist = playerState.currentSong && playlist.songs.includes(playerState.currentSong.id);
                
                playlistItem.innerHTML = `
                    <img src="${playlist.image}" alt="${playlist.name}">
                    <div class="playlist-details">
                        <div class="playlist-name">${playlist.name}</div>
                        <div class="playlist-song-count">${playlist.songs.length} songs</div>
                    </div>
                    ${songInPlaylist ? '<i class="fas fa-check"></i>' : ''}
                `;
                
                playlistItem.addEventListener('click', () => {
                    addSongToPlaylist(playerState.currentSong.id, playlist.id);
                    hideAddToPlaylistModal();
                });
                
                playlistSelectContainer.appendChild(playlistItem);
            });
            
            // Add option to create new playlist
            const newPlaylistItem = document.createElement('div');
            newPlaylistItem.className = 'playlist-item';
            newPlaylistItem.innerHTML = `
                <div class="create-btn" style="margin-right: 16px;">
                    <i class="fas fa-plus"></i>
                </div>
                <div class="playlist-details">
                    <div class="playlist-name">Create new playlist</div>
                </div>
            `;
            
            newPlaylistItem.addEventListener('click', () => {
                hideAddToPlaylistModal();
                showCreatePlaylistModal();
            });
            
            playlistSelectContainer.appendChild(newPlaylistItem);
        }).catch(error => {
            console.error("Error populating playlist select:", error);
        });
    }

    // Add song to playlist
    function addSongToPlaylist(songId, playlistId) {
        getUserData().then(userData => {
            if (!userData || !userData.playlists) {
                alert('User data not found');
                return;
            }
            
            const playlistIndex = userData.playlists.findIndex(p => p.id === playlistId);
            
            if (playlistIndex === -1) {
                alert('Playlist not found');
                return;
            }
            
            // Check if song is already in playlist
            if (!userData.playlists[playlistIndex].songs.includes(songId)) {
                userData.playlists[playlistIndex].songs.push(songId);
                
                saveUserData(userData).then(() => {
                    // Show confirmation
                    alert('Song added to playlist');
                    
                    // If currently viewing this playlist, refresh it
                    if (playerState.currentView === 'playlist' && playerState.currentPlaylistId === playlistId) {
                        loadPlaylist(playlistId);
                    }
                }).catch(error => {
                    console.error("Error saving after adding song to playlist:", error);
                    alert("Failed to add song to playlist. Please try again.");
                });
            } else {
                alert('Song is already in this playlist');
            }
        }).catch(error => {
            console.error("Error adding song to playlist:", error);
            alert("Failed to add song to playlist. Please try again.");
        });
    }

    // Remove song from playlist
    function removeSongFromPlaylist(songId, playlistId) {
        getUserData().then(userData => {
            if (!userData || !userData.playlists) {
                alert('User data not found');
                return;
            }
            
            const playlistIndex = userData.playlists.findIndex(p => p.id === playlistId);
            
            if (playlistIndex === -1) {
                alert('Playlist not found');
                return;
            }
            
            userData.playlists[playlistIndex].songs = userData.playlists[playlistIndex].songs.filter(id => id !== songId);
            
            saveUserData(userData).then(() => {
                // Refresh the playlist view
                loadPlaylist(playlistId);
            }).catch(error => {
                console.error("Error saving after removing song from playlist:", error);
                alert("Failed to remove song from playlist. Please try again.");
            });
        }).catch(error => {
            console.error("Error removing song from playlist:", error);
            alert("Failed to remove song from playlist. Please try again.");
        });
    }

    // Load a playlist
    function loadPlaylist(playlistId) {
        getUserData().then(userData => {
            if (!userData) {
                console.error("User data not found");
                return;
            }
            
            const playlist = userData.playlists.find(p => p.id === playlistId);
            
            if (!playlist) {
                alert('Playlist not found');
                return;
            }
            
            // Update view state
            playerState.currentView = 'playlist';
            playerState.currentPlaylistId = playlist.id;
            
            // Update section title
            document.querySelector('.all-songs .section-header h2').textContent = playlist.name;
            
            // Get playlist songs
            const playlistSongs = [];
            playlist.songs.forEach(songId => {
                const song = musicData.songs.find(s => s.id === songId);
                if (song) playlistSongs.push(song);
            });
            
            // Update song list
            const allSongsList = document.getElementById("all-songs-list");
            allSongsList.innerHTML = '';
            
            if (playlistSongs.length === 0) {
                allSongsList.innerHTML = '<div class="empty-playlist">This playlist is empty. Add songs to get started.</div>';
                return;
            }
            
            playlistSongs.forEach((song, index) => {
                const songItem = document.createElement('div');
                songItem.className = 'song-item';
                songItem.setAttribute('data-song-id', song.id);
                
                // Format the duration
                const duration = song.duration === "auto" ? "0:00" : formatTime(song.duration);
                
                // Check if song is liked
                const isLiked = userData.likedSongs.includes(song.id);
                if (isLiked) {
                    songItem.classList.add('liked');
                }
                
                songItem.innerHTML = `
                    <div class="song-number">${index + 1}</div>
                    <div class="song-play-btn"><i class="fas fa-play"></i></div>
                    <div class="song-details">
                        <img src="${song.cover}" alt="${song.title}" class="song-img">
                        <div class="song-text">
                            <div class="song-title">${song.title}</div>
                            <div class="song-artist">${song.artist}</div>
                        </div>
                    </div>
                    <div class="song-album">${song.album}</div>
                    <div class="song-like-btn ${isLiked ? 'liked' : ''}"><i class="fas fa-heart"></i></div>
                    <div class="song-remove-btn"><i class="fas fa-times"></i></div>
                    <div class="song-duration">${duration}</div>
                `;
                
                songItem.addEventListener('click', () => {
                    // Set current list to playlist songs
                    playerState.currentList = playlistSongs;
                    playerState.currentIndex = index;
                    playSong(song);
                    
                    // Update active song UI
                    document.querySelectorAll('.song-item').forEach(item => {
                        item.classList.remove('active');
                    });
                    songItem.classList.add('active');
                });
                
                // Like button
                const likeBtn = songItem.querySelector('.song-like-btn');
                likeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleLikeSong(song.id);
                });
                
                // Remove button
                const removeBtn = songItem.querySelector('.song-remove-btn');
                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    removeSongFromPlaylist(song.id, playlist.id);
                });
                
                allSongsList.appendChild(songItem);
            });
            
            // Update sidebar selection
            clearSidebarSelections();
            const playlistItems = document.querySelectorAll('.playlist-item-sidebar');
            playlistItems.forEach(item => {
                if (item.querySelector('span').textContent === playlist.name) {
                    item.classList.add('active');
                }
            });

            // After loading playlist, scroll to content
            scrollToContent();
        }).catch(error => {
            console.error("Error loading playlist:", error);
            alert("Failed to load playlist. Please try again.");
        });
    }

    // Toggle play/pause
    function togglePlayPause() {
        if (!playerState.currentSong) {
            // If no song is selected, play the first song
            if (musicData.songs.length > 0) {
                playerState.currentList = musicData.songs;
                playerState.currentIndex = 0;
                playSong(musicData.songs[0]);
            }
            return;
        }
        
        if (playerState.isPlaying) {
            audioPlayer.pause();
            playerState.isPlaying = false;
            updatePlayButtonState(false);
        } else {
            audioPlayer.play();
            playerState.isPlaying = true;
            updatePlayButtonState(true);
        }
    }

    // Update play button state
    function updatePlayButtonState(isPlaying) {
        const icon = playPauseBtn.querySelector("i");
        
        if (isPlaying) {
            icon.classList.remove("fa-play");
            icon.classList.add("fa-pause");
            playPauseBtn.classList.add("playing");
        } else {
            icon.classList.remove("fa-pause");
            icon.classList.add("fa-play");
            playPauseBtn.classList.remove("playing");
        }
    }

    // Play previous song
    function playPrevious() {
        if (!playerState.currentList.length) return;
        
        let newIndex = playerState.currentIndex - 1;
        if (newIndex < 0) {
            newIndex = playerState.currentList.length - 1;
        }
        
        playerState.currentIndex = newIndex;
        playSong(playerState.currentList[newIndex]);
    }

    // Play next song
    function playNext() {
        if (!playerState.currentList.length) return;
        
        if (playerState.shuffle) {
            playRandomSong();
        } else {
            let newIndex = playerState.currentIndex + 1;
            if (newIndex >= playerState.currentList.length) {
                newIndex = 0;
            }
            
            playerState.currentIndex = newIndex;
            playSong(playerState.currentList[newIndex]);
        }
    }

    // Play a random song
    function playRandomSong() {
        if (!playerState.currentList.length) return;
        
        const randomIndex = Math.floor(Math.random() * playerState.currentList.length);
        playerState.currentIndex = randomIndex;
        playSong(playerState.currentList[randomIndex]);
    }

    // Toggle shuffle
    function toggleShuffle() {
        playerState.shuffle = !playerState.shuffle;
        
        shuffleBtn.classList.toggle("active", playerState.shuffle);
        if (playerState.shuffle) {
            shuffleBtn.style.color = "#f75348";
        } else {
            shuffleBtn.style.color = "";
        }
    }

    // Toggle repeat
    function toggleRepeat() {
        playerState.repeat = !playerState.repeat;
        
        repeatBtn.classList.toggle("active", playerState.repeat);
        if (playerState.repeat) {
            repeatBtn.style.color = "#f75348";
        } else {
            repeatBtn.style.color = "";
        }
    }

    // Handle song end
    function handleSongEnd() {
        if (playerState.repeat) {
            // Replay the same song
            audioPlayer.currentTime = 0;
            audioPlayer.play();
        } else {
            // Play next song
            playNext();
        }
    }

    // Update progress bar
    function updateProgress() {
        const { currentTime, duration } = audioPlayer;
        if (isNaN(duration)) return;
        
        const progressPercent = (currentTime / duration) * 100;
        progress.style.width = `${progressPercent}%`;
        
        // Update current time
        currentTimeEl.textContent = formatTime(currentTime);
    }

    // Update total time
    function updateTotalTime() {
        const { duration } = audioPlayer;
        if (isNaN(duration)) return;
        
        totalTimeEl.textContent = formatTime(duration);
    }

    // Set progress by clicking on progress bar
    function setProgress(e) {
        const width = this.clientWidth;
        const clickX = e.offsetX;
        const duration = audioPlayer.duration;
        
        if (isNaN(duration)) return;
        
        audioPlayer.currentTime = (clickX / width) * duration;
    }

    // Format time in minutes:seconds
    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    }

    // Toggle mute
    function toggleMute() {
        if (audioPlayer.volume > 0) {
            // Save current volume
            playerState.prevVolume = audioPlayer.volume;
            audioPlayer.volume = 0;
            volumeLevel.style.width = "0%";
            volumeBtn.querySelector("i").className = "fas fa-volume-mute";
        } else {
            // Restore previous volume
            audioPlayer.volume = playerState.prevVolume || 0.7;
            volumeLevel.style.width = `${(playerState.prevVolume || 0.7) * 100}%`;
            updateVolumeIcon(playerState.prevVolume || 0.7);
        }
    }

    // Set volume
    function setVolume(e) {
        const width = this.clientWidth;
        const clickX = e.offsetX;
        const volume = clickX / width;
        
        audioPlayer.volume = volume;
        volumeLevel.style.width = `${volume * 100}%`;
        playerState.volume = volume;
        
        updateVolumeIcon(volume);
    }

    // Update volume icon based on volume level
    function updateVolumeIcon(volume) {
        const icon = volumeBtn.querySelector("i");
        icon.className = "fas";
        
        if (volume === 0) {
            icon.classList.add("fa-volume-mute");
        } else if (volume < 0.5) {
            icon.classList.add("fa-volume-down");
        } else {
            icon.classList.add("fa-volume-up");
        }
    }

    // Toggle like current song
    function toggleLikeCurrentSong() {
        if (!playerState.currentSong) return;
        
        toggleLikeSong(playerState.currentSong.id);
        
        // Toggle like button appearance
        likeCurrentSongBtn.classList.toggle('liked');
    }

    // Toggle like song
    function toggleLikeSong(songId) {
        getUserData().then(userData => {
            if (!userData) return;
            
            const index = userData.likedSongs.indexOf(songId);
            
            if (index === -1) {
                // Song not liked, add to liked songs
                userData.likedSongs.push(songId);
            } else {
                // Song already liked, remove from liked songs
                userData.likedSongs.splice(index, 1);
            }
            
            saveUserData(userData).then(() => {
                // Update UI for song items in lists
                document.querySelectorAll(`.song-item[data-song-id="${songId}"]`).forEach(item => {
                    if (index === -1) {
                        // Song was liked
                        item.classList.add('liked');
                        item.querySelector('.song-like-btn').classList.add('liked');
                    } else {
                        // Song was unliked
                        item.classList.remove('liked');
                        item.querySelector('.song-like-btn').classList.remove('liked');
                    }
                });
            }).catch(error => {
                console.error("Error saving user data after liking song:", error);
            });
        }).catch(error => {
            console.error("Error toggling like song:", error);
        });
    }

    // Show See All Modal
    function showSeeAllModal(sectionId, title) {
        seeAllTitle.textContent = title;
        seeAllContent.innerHTML = '';
        
        // Load appropriate content based on section
        switch (sectionId) {
            case 'recent-songs':
                populateSeeAllSongs(getRandomSongs(20)); // Show more random songs
                break;
                
            case 'popular-artists':
                populateSeeAllArtists(musicData.artists);
                break;
                
            case 'all-songs-list':
                populateSeeAllSongs(musicData.songs);
                break;
                
            default:
                seeAllContent.innerHTML = '<p>No content available</p>';
        }
        
        seeAllModal.style.display = 'block';
    }

    // Hide See All Modal
    function hideSeeAllModal() {
        seeAllModal.style.display = 'none';
    }

    // Populate See All Songs
    function populateSeeAllSongs(songs) {
        songs.forEach(song => {
            const songCard = document.createElement('div');
            songCard.className = 'card';
            songCard.innerHTML = `
                <div class="card-img">
                    <img src="${song.cover}" alt="${song.title}">
                    <button class="play-btn" data-song-id="${song.id}"><i class="fas fa-play"></i></button>
                </div>
                <h3>${song.title}</h3>
                <p>${song.artist}</p>
            `;
            
            const playBtn = songCard.querySelector('.play-btn');
            playBtn.addEventListener('click', () => {
                playSong(song);
                hideSeeAllModal();
            });
            
            seeAllContent.appendChild(songCard);
        });
    }

    // Populate See All Artists
    function populateSeeAllArtists(artists) {
        artists.forEach(artist => {
            const artistCard = document.createElement('div');
            artistCard.className = 'card artist-card';
            artistCard.innerHTML = `
                <div class="card-img">
                    <img src="${artist.cover}" alt="${artist.name}">
                    <button class="play-btn" data-artist-id="${artist.id}"><i class="fas fa-play"></i></button>
                </div>
                <h3>${artist.name}</h3>
                <p>Artist</p>
            `;
            
            const playBtn = artistCard.querySelector('.play-btn');
            playBtn.addEventListener('click', () => {
                const artistSongs = getSongsByArtist(artist.id);
                if (artistSongs.length > 0) {
                    playerState.currentList = artistSongs;
                    playerState.currentIndex = 0;
                    playSong(artistSongs[0]);
                }
                hideSeeAllModal();
            });
            
            seeAllContent.appendChild(artistCard);
        });
    }

    // Add song to recently played with IndexedDB
    function addToRecentlyPlayed(songId) {
        getUserData().then(userData => {
            // Remove if already exists
            const existingIndex = userData.recentlyPlayed.indexOf(songId);
            if (existingIndex !== -1) {
                userData.recentlyPlayed.splice(existingIndex, 1);
            }
            
            // Add to beginning
            userData.recentlyPlayed.unshift(songId);
            
            // Limit to 20 songs
            if (userData.recentlyPlayed.length > 20) {
                userData.recentlyPlayed = userData.recentlyPlayed.slice(0, 20);
            }
            
            saveUserData(userData);
        });
    }

    // Clear all sidebar selections
    function clearSidebarSelections() {
        // Clear playlist selections
        document.querySelectorAll('.playlist-item-sidebar').forEach(item => {
            item.classList.remove('active');
        });
        
        // Clear album selections
        document.querySelectorAll('#album-list li').forEach(item => {
            item.classList.remove('active');
        });
        
        // Clear artist selections
        document.querySelectorAll('#artist-list li').forEach(item => {
            item.classList.remove('active');
        });
    }

    // Scroll to content section
    function scrollToContent() {
        const contentSection = document.querySelector('.all-songs');
        if (contentSection) {
            contentSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Search functionality
    function setupSearch() {
        if (!searchInput) return;

        // Add event listener for input changes
        searchInput.addEventListener('input', debounce(performSearch, 300));
        
        // Show search results when clicking on the search input
        searchInput.addEventListener('click', function() {
            // Show search results section
            if (searchResults) {
                searchResults.style.display = 'block';
            }
            
            // If there's already a search query, perform the search again
            if (this.value.trim().length >= 2) {
                performSearch();
            }
        });
        
        // Clear search when clicking on other tabs
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.id !== 'search-tab') {
                link.addEventListener('click', clearSearch);
            }
        });
    }

    // Debounce function to limit search frequency
    function debounce(func, delay) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, delay);
        };
    }

    // Perform search
    function performSearch() {
        const query = searchInput.value.trim().toLowerCase();
        playerState.searchQuery = query;
        
        // Show the search results section regardless of query length
        if (searchResults) {
            searchResults.style.display = 'block';
        }
        
        if (query.length < 2) {
            searchResults.innerHTML = '<div class="search-message">Type at least 2 characters to search</div>';
            return;
        }
        
        searchResults.innerHTML = '';
        
        // Search songs
        const matchingSongs = musicData.songs.filter(song => 
            song.title.toLowerCase().includes(query) || 
            song.artist.toLowerCase().includes(query) || 
            song.album.toLowerCase().includes(query)
        );
        
        // Search playlists
        getUserData().then(userData => {
            const matchingPlaylists = userData.playlists.filter(playlist => 
                playlist.name.toLowerCase().includes(query)
            );
            
            // Search albums
            const matchingAlbums = musicData.albums.filter(album => 
                album.name.toLowerCase().includes(query)
            );
            
            // Search artists
            const matchingArtists = musicData.artists.filter(artist => 
                artist.name.toLowerCase().includes(query)
            );
            
            // Display results
            if (matchingSongs.length === 0 && matchingPlaylists.length === 0 && 
                matchingAlbums.length === 0 && matchingArtists.length === 0) {
                searchResults.innerHTML = '<div class="search-message">No results found</div>';
                return;
            }
            
            // Display songs
            if (matchingSongs.length > 0) {
                displaySearchResults('Songs', matchingSongs, 'song');
            }
            
            // Display playlists
            if (matchingPlaylists.length > 0) {
                displaySearchResults('Playlists', matchingPlaylists, 'playlist');
            }
            
            // Display albums
            if (matchingAlbums.length > 0) {
                displaySearchResults('Albums', matchingAlbums, 'album');
            }
            
            // Display artists
            if (matchingArtists.length > 0) {
                displaySearchResults('Artists', matchingArtists, 'artist');
            }
        });
    }

    // Display search results
    function displaySearchResults(category, items, type) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'search-category';
        categoryDiv.innerHTML = `<h2>${category}</h2>`;
        
        const resultsGrid = document.createElement('div');
        resultsGrid.className = 'search-results-grid';
        
        items.slice(0, 8).forEach(item => {
            const resultCard = document.createElement('div');
            resultCard.className = 'result-card';
            
            let imageUrl, title, subtitle;
            
            switch (type) {
                case 'song':
                    imageUrl = item.cover;
                    title = item.title;
                    subtitle = item.artist;
                    break;
                    
                case 'playlist':
                    imageUrl = item.image;
                    title = item.name;
                    subtitle = `${item.songs.length} songs`;
                    break;
                    
                case 'album':
                    imageUrl = item.cover;
                    title = item.name;
                    subtitle = 'Album';
                    break;
                    
                case 'artist':
                    imageUrl = item.cover;
                    title = item.name;
                    subtitle = 'Artist';
                    break;
            }
            
            resultCard.innerHTML = `
                <div class="result-img">
                    <img src="${imageUrl}" alt="${title}">
                    <button class="play-btn"><i class="fas fa-play"></i></button>
                </div>
                <div class="result-info">
                    <h3>${title}</h3>
                    <p>${subtitle}</p>
                </div>
            `;
            
            resultCard.addEventListener('click', () => {
                switch (type) {
                    case 'song':
                        playSong(item);
                        break;
                        
                    case 'playlist':
                        loadPlaylist(item.id);
                        break;
                        
                    case 'album':
                        loadAlbumSongs(item.id);
                        break;
                        
                    case 'artist':
                        loadArtistSongs(item.id);
                        break;
                }
                
                // Scroll to content
                scrollToContent();
            });
            
            resultsGrid.appendChild(resultCard);
        });
        
        categoryDiv.appendChild(resultsGrid);
        searchResults.appendChild(categoryDiv);
    }

    // Clear search
    function clearSearch() {
        searchInput.value = '';
        searchResults.innerHTML = '';
        playerState.searchQuery = '';
    }

    // Show Liked Songs
    function showLikedSongs() {
        getUserData().then(userData => {
            // Update view state
            playerState.currentView = 'liked';
            
            // Update section title
            document.querySelector('.all-songs .section-header h2').textContent = 'Liked Songs';
            
            // Get liked songs
            const likedSongs = [];
            if (userData && userData.likedSongs) {
                userData.likedSongs.forEach(songId => {
                    const song = musicData.songs.find(s => s.id === songId);
                    if (song) likedSongs.push(song);
                });
            }
            
            // Update song list
            const allSongsList = document.getElementById("all-songs-list");
            allSongsList.innerHTML = '';
            
            if (likedSongs.length === 0) {
                allSongsList.innerHTML = '<div class="empty-playlist">You haven\'t liked any songs yet.</div>';
                return;
            }
            
            likedSongs.forEach((song, index) => {
                const songItem = document.createElement('div');
                songItem.className = 'song-item liked';
                songItem.setAttribute('data-song-id', song.id);
                
                // Format the duration
                const duration = song.duration === "auto" ? "0:00" : formatTime(song.duration);
                
                songItem.innerHTML = `
                    <div class="song-number">${index + 1}</div>
                    <div class="song-play-btn"><i class="fas fa-play"></i></div>
                    <div class="song-details">
                        <img src="${song.cover}" alt="${song.title}" class="song-img">
                        <div class="song-text">
                            <div class="song-title">${song.title}</div>
                            <div class="song-artist">${song.artist}</div>
                        </div>
                    </div>
                    <div class="song-album">${song.album}</div>
                    <div class="song-like-btn liked"><i class="fas fa-heart"></i></div>
                    <div class="song-duration">${duration}</div>
                `;
                
                songItem.addEventListener('click', () => {
                    // Set current list to liked songs
                    playerState.currentList = likedSongs;
                    playerState.currentIndex = index;
                    playSong(song);
                    
                    // Update active song UI
                    document.querySelectorAll('.song-item').forEach(item => {
                        item.classList.remove('active');
                    });
                    songItem.classList.add('active');
                });
                
                // Like button
                const likeBtn = songItem.querySelector('.song-like-btn');
                likeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleLikeSong(song.id);
                    // After unliking, refresh liked songs
                    showLikedSongs();
                });
                
                allSongsList.appendChild(songItem);
            });
            
            // Update sidebar selection
            clearSidebarSelections();
            const allLikedSpans = document.querySelectorAll('.playlist-item-sidebar span');
            let likedSongsItem = null;
            allLikedSpans.forEach(span => {
                if (span.textContent === 'Liked Songs') {
                    likedSongsItem = span.closest('.playlist-item-sidebar');
                }
            });
            if (likedSongsItem) {
                likedSongsItem.classList.add('active');
            }
            
            // Scroll to content
            scrollToContent();
        }).catch(error => {
            console.error("Error showing liked songs:", error);
        });
    }

    // Populate albums in sidebar
    function populateAlbums() {
        const albumList = document.getElementById("album-list");
        albumList.innerHTML = "";
        
        if (!musicData || !musicData.albums) {
            console.error("No album data available");
            return;
        }

        musicData.albums.forEach(album => {
            const li = document.createElement("li");
            li.textContent = album.name;
            li.setAttribute("data-album-id", album.id);
            if (playerState.currentView === 'album' && playerState.currentAlbumId === album.id) {
                li.classList.add('active');
            }
            li.addEventListener("click", () => {
                clearSidebarSelections();
                li.classList.add("active");
                loadAlbumSongs(album.id);
            });
            albumList.appendChild(li);
        });
    }

    // Populate artists in sidebar
    function populateArtists() {
        const artistList = document.getElementById("artist-list");
        artistList.innerHTML = "";
        
        if (!musicData || !musicData.artists) {
            console.error("No artist data available");
            return;
        }

        musicData.artists.forEach(artist => {
            const li = document.createElement("li");
            li.textContent = artist.name;
            li.setAttribute("data-artist-id", artist.id);
            if (playerState.currentView === 'artist' && playerState.currentArtistId === artist.id) {
                li.classList.add('active');
            }
            li.addEventListener("click", () => {
                clearSidebarSelections();
                li.classList.add("active");
                loadArtistSongs(artist.id);
            });
            artistList.appendChild(li);
        });
    }

    // Populate featured albums
    function populateFeaturedAlbums() {
        const featuredAlbums = document.getElementById("featured-albums");
        featuredAlbums.innerHTML = "";
        
        if (!musicData || !musicData.albums) {
            console.error("No album data available");
            return;
        }

        // Display only the first 6 albums or all if less than 6
        const albums = musicData.albums.slice(0, 6);
        
        albums.forEach(album => {
            const albumDiv = document.createElement("div");
            albumDiv.className = "featured-card";
            albumDiv.innerHTML = `
                <img src="${album.cover}" alt="${album.name}">
                <span>${album.name}</span>
            `;
            
            albumDiv.addEventListener("click", () => {
                loadAlbumSongs(album.id);
                // Add active class
                document.querySelectorAll(".featured-card").forEach(card => {
                    card.classList.remove("active");
                });
                albumDiv.classList.add("active");
            });
            
            featuredAlbums.appendChild(albumDiv);
        });
    }

    // Load album songs
    function loadAlbumSongs(albumId) {
        if (!musicData || !musicData.albums) {
            console.error("No album data available");
            return;
        }
        
        const album = musicData.albums.find(a => a.id === albumId);
        if (!album) return;
        
        // Update view state
        playerState.currentView = 'album';
        playerState.currentAlbumId = albumId;
        delete playerState.currentPlaylistId;
        delete playerState.currentArtistId;
        
        const allSongsList = document.getElementById("all-songs-list");
        allSongsList.innerHTML = "";
        
        // Get the album songs
        const albumSongs = [];
        album.songs.forEach(songId => {
            const song = musicData.songs.find(s => s.id === songId);
            if (song) albumSongs.push(song);
        });
        
        // Update song list
        albumSongs.forEach((song, index) => {
            const songItem = document.createElement("div");
            songItem.className = "song-item";
            songItem.setAttribute("data-song-id", song.id);
            
            // Format the duration
            const duration = song.duration === "auto" ? "0:00" : formatTime(song.duration);
            
            songItem.innerHTML = `
                <div class="song-number">${index + 1}</div>
                <div class="song-play-btn"><i class="fas fa-play"></i></div>
                <div class="song-details">
                    <img src="${song.cover}" alt="${song.title}" class="song-img">
                    <div class="song-text">
                        <div class="song-title">${song.title}</div>
                        <div class="song-artist">${song.artist}</div>
                    </div>
                </div>
                <div class="song-album">${song.album}</div>
                <div class="song-duration">${duration}</div>
            `;
            
            songItem.addEventListener("click", () => {
                // Set current list to album songs
                playerState.currentList = albumSongs;
                playerState.currentIndex = index;
                playSong(song);
                
                // Update active song UI
                document.querySelectorAll(".song-item").forEach(item => {
                    item.classList.remove("active");
                });
                songItem.classList.add("active");
            });
            
            allSongsList.appendChild(songItem);
        });
        
        // Update section title
        document.querySelector(".all-songs .section-header h2").textContent = album.name;

        // After loading album, scroll to content
        scrollToContent();
    }

    // Load artist songs
    function loadArtistSongs(artistId) {
        if (!musicData || !musicData.artists) {
            console.error("No artist data available");
            return;
        }
        
        const artist = musicData.artists.find(a => a.id === artistId);
        if (!artist) return;
        
        // Update view state
        playerState.currentView = 'artist';
        playerState.currentArtistId = artistId;
        delete playerState.currentPlaylistId;
        delete playerState.currentAlbumId;
        
        const allSongsList = document.getElementById("all-songs-list");
        allSongsList.innerHTML = "";
        
        // Get the artist songs
        const artistSongs = getSongsByArtist(artistId);
        
        // Update song list
        artistSongs.forEach((song, index) => {
            const songItem = document.createElement("div");
            songItem.className = "song-item";
            songItem.setAttribute("data-song-id", song.id);
            
            // Format the duration
            const duration = song.duration === "auto" ? "0:00" : formatTime(song.duration);
            
            songItem.innerHTML = `
                <div class="song-number">${index + 1}</div>
                <div class="song-play-btn"><i class="fas fa-play"></i></div>
                <div class="song-details">
                    <img src="${song.cover}" alt="${song.title}" class="song-img">
                    <div class="song-text">
                        <div class="song-title">${song.title}</div>
                        <div class="song-artist">${song.artist}</div>
                    </div>
                </div>
                <div class="song-album">${song.album}</div>
                <div class="song-duration">${duration}</div>
            `;
            
            songItem.addEventListener("click", () => {
                // Set current list to artist songs
                playerState.currentList = artistSongs;
                playerState.currentIndex = index;
                playSong(song);
                
                // Update active song UI
                document.querySelectorAll(".song-item").forEach(item => {
                    item.classList.remove("active");
                });
                songItem.classList.add("active");
            });
            
            allSongsList.appendChild(songItem);
        });
        
        // Update section title
        document.querySelector(".all-songs .section-header h2").textContent = artist.name;

        // After loading artist, scroll to content
        scrollToContent();
    }

    // Get songs by artist
    function getSongsByArtist(artistId) {
        if (!musicData || !musicData.artists) {
            console.error("No artist data available");
            return [];
        }
        
        const artist = musicData.artists.find(a => a.id === artistId);
        if (!artist) return [];
        
        const artistSongs = [];
        
        if (artist.songs && Array.isArray(artist.songs)) {
            artist.songs.forEach(songId => {
                const song = musicData.songs.find(s => s.id === songId);
                if (song) artistSongs.push(song);
            });
        }
        
        return artistSongs;
    }

    // Get random songs
    function getRandomSongs(count) {
        if (!musicData || !musicData.songs || !Array.isArray(musicData.songs)) {
            console.error("No song data available");
            return [];
        }
        
        const shuffled = [...musicData.songs].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    // Play a song
    function playSong(song) {
        if (!song) {
            console.error("No song provided to play");
            return;
        }
        
        // Update player state
        playerState.currentSong = song;
        playerState.isPlaying = true;
        
        // Update audio source
        audioPlayer.src = song.mp3;
        audioPlayer.play().catch(error => {
            console.error("Playback failed:", error);
        });
        
        // Update UI
        updatePlayerUI();
        updatePlayButtonState(true);
        
        // Update like button state
        getUserData().then(userData => {
            if (userData && userData.likedSongs && userData.likedSongs.includes(song.id)) {
                likeCurrentSongBtn.classList.add('liked');
            } else {
                likeCurrentSongBtn.classList.remove('liked');
            }
            
            // Add to recently played
            addToRecentlyPlayed(song.id);
            
            // Increment play count
            incrementPlayCount(song.id);
            
            // Update active song in song list
            const activeSongItem = document.querySelector(`.song-item[data-song-id="${song.id}"]`);
            if (activeSongItem) {
                document.querySelectorAll(".song-item").forEach(item => {
                    item.classList.remove("active");
                });
                activeSongItem.classList.add("active");
                
                // Update play icon
                const playIcon = activeSongItem.querySelector(".song-play-btn i");
                if (playIcon) {
                    playIcon.classList.remove("fa-play");
                    playIcon.classList.add("fa-pause");
                }
            }
        }).catch(error => {
            console.error("Error updating UI after playing song:", error);
        });
    }

    // Update player UI with current song
    function updatePlayerUI() {
        if (!playerState.currentSong) return;
        
        currentSongImg.src = playerState.currentSong.cover;
        currentSongTitle.textContent = playerState.currentSong.title;
        currentSongArtist.textContent = playerState.currentSong.artist;
    }

    // Populate all songs
    function populateAllSongs() {
        // Update view state
        playerState.currentView = 'home';
        delete playerState.currentPlaylistId;
        delete playerState.currentAlbumId;
        delete playerState.currentArtistId;
        
        // Clear sidebar selections
        clearSidebarSelections();
        
        const allSongsList = document.getElementById("all-songs-list");
        allSongsList.innerHTML = "";

        // Check if musicData is available
        if (!musicData || !musicData.songs || !Array.isArray(musicData.songs)) {
            allSongsList.innerHTML = "<div class='empty-playlist'>Error loading music data</div>";
            console.error("Music data not available or invalid");
            return;
        }

        musicData.songs.forEach((song, index) => {
            const songItem = document.createElement("div");
            songItem.className = "song-item";
            songItem.setAttribute("data-song-id", song.id);
            
            // Format the duration
            const duration = song.duration === "auto" ? "0:00" : formatTime(song.duration);
            
            // Check if song is liked
            getUserData().then(userData => {
                const isLiked = userData && userData.likedSongs && userData.likedSongs.includes(song.id);
                if (isLiked) {
                    songItem.classList.add('liked');
                }
                
                songItem.innerHTML = `
                    <div class="song-number">${index + 1}</div>
                    <div class="song-play-btn"><i class="fas fa-play"></i></div>
                    <div class="song-details">
                        <img src="${song.cover}" alt="${song.title}" class="song-img">
                        <div class="song-text">
                            <div class="song-title">${song.title}</div>
                            <div class="song-artist">${song.artist}</div>
                        </div>
                    </div>
                    <div class="song-album">${song.album}</div>
                    <div class="song-like-btn ${isLiked ? 'liked' : ''}"><i class="fas fa-heart"></i></div>
                    <div class="song-duration">${duration}</div>
                `;
                
                songItem.addEventListener("click", () => {
                    // Set current list to all songs
                    playerState.currentList = musicData.songs;
                    playerState.currentIndex = index;
                    playSong(song);
                    
                    // Update active song UI
                    document.querySelectorAll(".song-item").forEach(item => {
                        item.classList.remove("active");
                    });
                    songItem.classList.add("active");
                });
                
                // Like button
                const likeBtn = songItem.querySelector(".song-like-btn");
                likeBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    toggleLikeSong(song.id);
                    likeBtn.classList.toggle("liked");
                });
                
                allSongsList.appendChild(songItem);
            }).catch(error => {
                console.error("Error checking if song is liked:", error);
                // Still add the song even if we can't determine if it's liked
                songItem.innerHTML = `
                    <div class="song-number">${index + 1}</div>
                    <div class="song-play-btn"><i class="fas fa-play"></i></div>
                    <div class="song-details">
                        <img src="${song.cover}" alt="${song.title}" class="song-img">
                        <div class="song-text">
                            <div class="song-title">${song.title}</div>
                            <div class="song-artist">${song.artist}</div>
                        </div>
                    </div>
                    <div class="song-album">${song.album}</div>
                    <div class="song-like-btn"><i class="fas fa-heart"></i></div>
                    <div class="song-duration">${duration}</div>
                `;
                
                songItem.addEventListener("click", () => {
                    // Set current list to all songs
                    playerState.currentList = musicData.songs;
                    playerState.currentIndex = index;
                    playSong(song);
                    
                    // Update active song UI
                    document.querySelectorAll(".song-item").forEach(item => {
                        item.classList.remove("active");
                    });
                    songItem.classList.add("active");
                });
                
                allSongsList.appendChild(songItem);
            });
        });
    }

    // Populate recent songs with ACTUAL recently played
    function populateRecentSongs() {
        getUserData().then(userData => {
            const recentSongs = document.getElementById("recent-songs");
            recentSongs.innerHTML = "";
            
            // Get recently played songs
            let songList = [];
            
            if (userData && userData.recentlyPlayed && userData.recentlyPlayed.length > 0) {
                userData.recentlyPlayed.slice(0, 5).forEach(songId => {
                    const song = musicData.songs.find(s => s.id === songId);
                    if (song) songList.push(song);
                });
            }
            
            // If not enough songs, add random ones
            if (songList.length < 5) {
                const randomSongs = getRandomSongs(5 - songList.length);
                songList = [...songList, ...randomSongs];
            }
            
            songList.forEach(song => {
                const songDiv = document.createElement("div");
                songDiv.className = "card";
                songDiv.innerHTML = `
                    <div class="card-img">
                        <img src="${song.cover}" alt="${song.title}">
                        <button class="play-btn" data-song-id="${song.id}"><i class="fas fa-play"></i></button>
                    </div>
                    <h3>${song.title}</h3>
                    <p>${song.artist}</p>
                `;
                
                const playBtn = songDiv.querySelector(".play-btn");
                playBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    playSong(song);
                });
                
                recentSongs.appendChild(songDiv);
            });
        }).catch(error => {
            console.error("Error loading recently played songs:", error);
        });
    }

    // Populate most played songs (instead of popular artists)
    function populateMostPlayed() {
        getMostPlayedSongs(5).then(topSongs => {
            const popularArtists = document.getElementById("popular-artists");
            const sectionTitle = document.querySelector('.made-for-you h2');
            
            if (sectionTitle) {
                sectionTitle.textContent = 'Most Played';
            }
            
            popularArtists.innerHTML = "";
            
            // If no play stats yet, use random songs
            if (topSongs.length === 0) {
                topSongs = getRandomSongs(5);
            }
            
            topSongs.forEach(song => {
                const songDiv = document.createElement("div");
                songDiv.className = "card";
                songDiv.innerHTML = `
                    <div class="card-img">
                        <img src="${song.cover}" alt="${song.title}">
                        <button class="play-btn" data-song-id="${song.id}"><i class="fas fa-play"></i></button>
                    </div>
                    <h3>${song.title}</h3>
                    <p>${song.artist}</p>
                `;
                
                const playBtn = songDiv.querySelector(".play-btn");
                playBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    playSong(song);
                });
                
                popularArtists.appendChild(songDiv);
            });
        }).catch(error => {
            console.error("Error loading most played songs:", error);
        });
    }

    // Initialize the application
    async function init() {
        try {
            // Initialize IndexedDB
            await initDB();
            
            // Initialize music player
            initMusicPlayer();
            
            // Set up search
            setupSearch();
            
            // Populate UI
            populateUI();
            
            // Set default song list
            playerState.currentList = musicData.songs;
            
            // Register event listeners
            registerEventListeners();
        } catch (error) {
            console.error("Initialization error:", error);
        }
    }

    // Register all event listeners
    function registerEventListeners() {
        // See All buttons
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('see-all-btn') || e.target.parentElement.classList.contains('see-all-btn')) {
                const type = e.target.closest('.see-all-btn').dataset.type;
                if (type === 'recent') {
                    showSeeAllModal('Recently Played');
                    getUserData().then(userData => {
                        populateSeeAllSongs(userData.recentlyPlayed || []);
                    });
                } else if (type === 'most-played') {
                    showSeeAllModal('Most Played');
                    getMostPlayedSongs(20).then(songs => {
                        populateSeeAllSongs(songs.map(s => s.id));
                    });
                } else if (type === 'artists') {
                    showSeeAllModal('Artists');
                    populateSeeAllArtists();
                }
            }
            
            // Close modal
            if (e.target.classList.contains('close-modal') || e.target.parentElement.classList.contains('close-modal')) {
                hideSeeAllModal();
            }
        });
        
        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                // Remove active class from all links
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                
                // Add active class to clicked link
                link.classList.add('active');
                
                // Handle nav actions
                const navAction = link.dataset.action;
                if (navAction === 'home') {
                    document.getElementById('home-view').style.display = 'block';
                    document.getElementById('library-view').style.display = 'none';
                    document.getElementById('playlist-view').style.display = 'none';
                    document.getElementById('search-results').style.display = 'none';
                } else if (navAction === 'library') {
                    document.getElementById('home-view').style.display = 'none';
                    document.getElementById('library-view').style.display = 'block';
                    document.getElementById('playlist-view').style.display = 'none';
                    document.getElementById('search-results').style.display = 'none';
                }
            });
        });
        
        // Create playlist form
        document.getElementById('create-playlist-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const playlistName = document.getElementById('playlist-name').value;
            if (playlistName.trim()) {
                createPlaylist(playlistName);
                document.getElementById('playlist-name').value = '';
                document.getElementById('create-playlist-modal').style.display = 'none';
            }
        });
        
        // Edit playlist form
        document.getElementById('edit-playlist-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const playlistName = document.getElementById('edit-playlist-name').value;
            const playlistId = document.getElementById('edit-playlist-id').value;
            if (playlistName.trim() && playlistId) {
                updatePlaylist(playlistId, { name: playlistName });
                document.getElementById('edit-playlist-modal').style.display = 'none';
            }
        });
        
        // Playlist image upload
        document.getElementById('playlist-image-upload').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    playlistImagePreview.src = e.target.result;
                    playlistImagePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
        
        // Like current song button
        likeCurrentSongBtn.addEventListener('click', function() {
            if (playerState.currentSong) {
                toggleLikeCurrentSong();
            }
        });
        
        // Search tab listener
        if (searchTab) {
            searchTab.addEventListener('click', () => {
                // Show search results container
                if (searchResults) {
                    searchResults.style.display = 'block';
                }
                
                // Focus on search input
                if (searchInput) {
                    searchInput.focus();
                }
            });
        }
    }

    // Toggle like status for current song
    function toggleLikeCurrentSong() {
        if (!playerState.currentSong) return;
        
        const songId = playerState.currentSong.id;
        toggleLikeSong(songId);
        
        // Update UI
        getUserData().then(userData => {
            if (userData && userData.likedSongs && userData.likedSongs.includes(songId)) {
                likeCurrentSongBtn.classList.add('liked');
            } else {
                likeCurrentSongBtn.classList.remove('liked');
            }
            
            // Also update any song items in lists
            document.querySelectorAll(`.song-item[data-song-id="${songId}"] .song-like-btn`).forEach(btn => {
                if (userData.likedSongs.includes(songId)) {
                    btn.classList.add('liked');
                } else {
                    btn.classList.remove('liked');
                }
            });
        });
    }

    // Show see all modal
    function showSeeAllModal(title) {
        const modal = document.getElementById('see-all-modal');
        const modalTitle = modal.querySelector('.modal-title');
        modalTitle.textContent = title;
        modal.style.display = 'block';
    }

    // Hide see all modal
    function hideSeeAllModal() {
        document.getElementById('see-all-modal').style.display = 'none';
    }

    // Populate see all modal with songs
    function populateSeeAllSongs(songIds) {
        const modalContent = document.getElementById('see-all-content');
        modalContent.innerHTML = '';
        
        if (!songIds || songIds.length === 0) {
            modalContent.innerHTML = '<div class="empty-message">No songs available</div>';
            return;
        }
        
        songIds.forEach(songId => {
            const song = musicData.songs.find(s => s.id === songId);
            if (song) {
                const songCard = document.createElement('div');
                songCard.className = 'song-card';
                songCard.innerHTML = `
                    <div class="song-card-img">
                        <img src="${song.cover}" alt="${song.title}">
                        <button class="play-btn" data-song-id="${song.id}"><i class="fas fa-play"></i></button>
                    </div>
                    <div class="song-card-details">
                        <h3>${song.title}</h3>
                        <p>${song.artist}</p>
                    </div>
                `;
                
                const playBtn = songCard.querySelector('.play-btn');
                playBtn.addEventListener('click', () => {
                    playSong(song);
                });
                
                modalContent.appendChild(songCard);
            }
        });
    }

    // Populate see all modal with artists
    function populateSeeAllArtists() {
        const modalContent = document.getElementById('see-all-content');
        modalContent.innerHTML = '';
        
        if (!musicData.artists || musicData.artists.length === 0) {
            modalContent.innerHTML = '<div class="empty-message">No artists available</div>';
            return;
        }
        
        musicData.artists.forEach(artist => {
            const artistCard = document.createElement('div');
            artistCard.className = 'artist-card';
            artistCard.innerHTML = `
                <div class="artist-card-img">
                    <img src="${artist.image || 'assets/default-artist.jpg'}" alt="${artist.name}">
                </div>
                <div class="artist-card-details">
                    <h3>${artist.name}</h3>
                    <p>${artist.songs ? artist.songs.length : 0} songs</p>
                </div>
            `;
            
            artistCard.addEventListener('click', () => {
                // Load artist songs
                const artistSongs = getArtistSongs(artist.id);
                if (artistSongs.length > 0) {
                    playerState.currentList = artistSongs;
                    playerState.currentIndex = 0;
                    playSong(artistSongs[0]);
                }
                hideSeeAllModal();
            });
            
            modalContent.appendChild(artistCard);
        });
    }

    // Add to recently played
    function addToRecentlyPlayed(songId) {
        getUserData().then(userData => {
            if (!userData.recentlyPlayed) {
                userData.recentlyPlayed = [];
            }
            
            // Remove the song if it's already in the list
            userData.recentlyPlayed = userData.recentlyPlayed.filter(id => id !== songId);
            
            // Add to the beginning
            userData.recentlyPlayed.unshift(songId);
            
            // Keep only the last 20
            if (userData.recentlyPlayed.length > 20) {
                userData.recentlyPlayed = userData.recentlyPlayed.slice(0, 20);
            }
            
            // Save updated data
            saveUserData(userData);
        });
    }

    // Start initialization
    init();
}); 