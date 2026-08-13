const songsContainer = document.getElementById("songsContainer");
const coverImage = document.getElementById("coverImage");
const songTitle = document.getElementById("songTitle");
const artistName = document.getElementById("artistName");
const albumName = document.getElementById("albumName");
const favoriteSongBtn = document.getElementById("favoriteSong");

const playBtn = document.getElementById("playBtn");
const previousBtn = document.getElementById("previousBtn");
const nextBtn = document.getElementById("nextBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const repeatBtn = document.getElementById("repeatBtn");

const progressBar = document.getElementById("progressBar");
const currentTimeEl = document.getElementById("currentTime");
const totalTimeEl = document.getElementById("totalTime");

const volumeBar = document.getElementById("volumeBar");
const audioPlayer = document.getElementById("audioPlayer");

const homeBtn = document.getElementById("homeBtn");
const searchBtn = document.getElementById("searchBtn");
const libraryBtn = document.getElementById("libraryBtn");
const favBtn = document.getElementById("favBtn");

const mainPlayer = document.querySelector("main.player");
const playlistSection = document.querySelector("section.playlist");
const container = document.querySelector(".container");

const API_URL = "https://api.freetouse.com/v3/music/tracks/all?limit=20";
const CORS_PROXY = "https://corsproxy.io/?";

const FAVORITES_KEY = "melody_favorites";
const RECENT_KEY = "melody_recent";
const MAX_RECENT = 20;

let songs = [];
let currentIndex = -1;
let isPlaying = false;
let isShuffle = false;
let repeatMode = "off"; 
let currentView = "home"; 

let favorites = new Set(loadJSON(FAVORITES_KEY, []));
let recentlyPlayed = loadJSON(RECENT_KEY, []);

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn("Could not save to localStorage:", err);
  }
}
function saveFavorites() {
  saveJSON(FAVORITES_KEY, Array.from(favorites));
}
function saveRecent() {
  saveJSON(RECENT_KEY, recentlyPlayed);
}

function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function createSongRow(song, mainIndex) {
  const row = document.createElement("div");
  row.classList.add("song");
  if (mainIndex === currentIndex) row.classList.add("active");

  const img = document.createElement("img");
  img.src = song.image || "assets/coverimg.png";
  img.alt = song.title;

  const details = document.createElement("div");
  details.classList.add("details");
  const h4 = document.createElement("h4");
  h4.textContent = song.title;
  const p = document.createElement("p");
  p.textContent = song.artist;
  details.append(h4, p);

  const heartBtn = document.createElement("button");
  heartBtn.type = "button";
  heartBtn.style.background = "transparent";
  heartBtn.style.border = "none";
  heartBtn.style.color = "inherit";
  heartBtn.style.cursor = "pointer";
  heartBtn.style.fontSize = "14px";
  heartBtn.style.marginLeft = "8px";
  heartBtn.innerHTML = `<i class="fa-${favorites.has(song.id) ? "solid" : "regular"} fa-heart"></i>`;
  heartBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleFavorite(song.id);
    heartBtn.innerHTML = `<i class="fa-${favorites.has(song.id) ? "solid" : "regular"} fa-heart"></i>`;
  });

  const time = document.createElement("span");
  time.textContent = song.duration;

  row.append(img, details, heartBtn, time);
  row.addEventListener("click", () => playSongAt(mainIndex));
  return row;
}

function renderMainList() {
  songsContainer.innerHTML = "";
  songs.forEach((song, i) => songsContainer.appendChild(createSongRow(song, i)));
}

function showLoading() {
  songsContainer.innerHTML = `<p class="status-msg">Loading songs...</p>`;
}
function showError(message) {
  songsContainer.innerHTML = `<p class="status-msg">${message}</p>`;
}

function loadTrackIntoPlayer(song) {
  coverImage.src = song.image || "assets/coverimg.png";
  songTitle.textContent = song.title;
  artistName.textContent = song.artist;
  albumName.textContent = song.album || "";
  updatePlayerFavoriteIcon();
}

function updatePlayerFavoriteIcon() {
  if (currentIndex === -1) return;
  const id = songs[currentIndex].id;
  favoriteSongBtn.innerHTML = `<i class="fa-${favorites.has(id) ? "solid" : "regular"} fa-heart"></i>`;
}

function updatePlayIcon() {
  playBtn.innerHTML = isPlaying
    ? '<i class="fa-solid fa-pause"></i>'
    : '<i class="fa-solid fa-play"></i>';
}

function refreshAllVisibleLists() {
  renderMainList();
  if (currentView === "search") runSearch();
  if (currentView === "library") renderLibraryView();
  if (currentView === "favorites") renderFavoritesView();
}

function playSongAt(index) {
  if (index < 0 || index >= songs.length) return;
  currentIndex = index;
  const song = songs[index];

  loadTrackIntoPlayer(song);
  audioPlayer.src = song.mp3 || "";
  audioPlayer
    .play()
    .then(() => {
      isPlaying = true;
      updatePlayIcon();
    })
    .catch((err) => console.warn("Playback failed:", err));

  addToRecent(song.id);
  refreshAllVisibleLists();
}

function togglePlayPause() {
  if (songs.length === 0) return;
  if (currentIndex === -1) {
    playSongAt(0);
    return;
  }
  if (audioPlayer.paused) {
    audioPlayer.play();
  } else {
    audioPlayer.pause();
  }
}

function goNext(auto) {
  if (songs.length === 0) return;
  let nextIndex;

  if (isShuffle) {
    nextIndex =
      songs.length === 1
        ? 0
        : (() => {
            let i;
            do {
              i = Math.floor(Math.random() * songs.length);
            } while (i === currentIndex);
            return i;
          })();
  } else {
    nextIndex = currentIndex + 1;
    if (nextIndex >= songs.length) {
      if (repeatMode === "all") {
        nextIndex = 0;
      } else if (auto) {
        isPlaying = false;
        updatePlayIcon();
        return;
      } else {
        nextIndex = 0;
      }
    }
  }
  playSongAt(nextIndex);
}

function goPrevious() {
  if (songs.length === 0) return;
  if (audioPlayer.currentTime > 3) {
    audioPlayer.currentTime = 0;
    return;
  }

  let prevIndex;
  if (isShuffle) {
    prevIndex =
      songs.length === 1
        ? 0
        : (() => {
            let i;
            do {
              i = Math.floor(Math.random() * songs.length);
            } while (i === currentIndex);
            return i;
          })();
  } else {
    prevIndex = currentIndex - 1;
    if (prevIndex < 0) prevIndex = repeatMode === "all" ? songs.length - 1 : 0;
  }
  playSongAt(prevIndex);
}

function toggleFavorite(id) {
  if (favorites.has(id)) favorites.delete(id);
  else favorites.add(id);
  saveFavorites();
  updatePlayerFavoriteIcon();
  refreshAllVisibleLists();
}

function addToRecent(id) {
  recentlyPlayed = recentlyPlayed.filter((x) => x !== id);
  recentlyPlayed.unshift(id);
  if (recentlyPlayed.length > MAX_RECENT) recentlyPlayed.length = MAX_RECENT;
  saveRecent();
}

function showView(view) {
    currentView = view;

    mainPlayer.style.display = "none";
    playlistSection.style.display = "none";
    searchView.style.display = "none";
    libraryView.style.display = "none";
    favoritesView.style.display = "none";

    [homeBtn, searchBtn, libraryBtn, favBtn]
        .forEach(btn => btn.classList.remove("active"));

    if (view === "home") {
        mainPlayer.style.display = "";
        playlistSection.style.display = "";

        homeBtn.classList.add("active");
    }

    if (view === "search") {
        searchView.style.display = "";
        searchBtn.classList.add("active");

        searchInput.value = "";
        runSearch();

        setTimeout(() => {
            searchInput.focus();
        }, 100);
    }

    if (view === "library") {
        libraryView.style.display = "";
        libraryBtn.classList.add("active");

        renderLibraryView();
    }

    if (view === "favorites") {
        favoritesView.style.display = "";
        favBtn.classList.add("active");

        renderFavoritesView();
    }
}

const searchView = document.createElement("section");
searchView.className = "view search-view";
searchView.style.display = "none";
searchView.innerHTML = `
  <h2>Search</h2>
  <input type="text" id="searchInput" placeholder="Search by song or artist..."
    style="width:100%;padding:12px 16px;border-radius:8px;border:1px solid #444;
    background:#1e1e2f;color:#fff;font-size:16px;margin-bottom:20px;outline:none;">
  <div id="searchResults"></div>
`;
container.appendChild(searchView);
const searchInput = searchView.querySelector("#searchInput");
const searchResults = searchView.querySelector("#searchResults");

function runSearch() {
  const q = searchInput.value.trim().toLowerCase();
  searchResults.innerHTML = "";
  if (!q) {
    searchResults.innerHTML = `<p class="status-msg">Start typing to search songs or artists.</p>`;
    return;
  }
  const matches = songs.filter(
    (s) => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)
  );
  if (matches.length === 0) {
    searchResults.innerHTML = `<p class="status-msg">No matches found.</p>`;
    return;
  }
  matches.forEach((song) => {
    const idx = songs.indexOf(song);
    searchResults.appendChild(createSongRow(song, idx));
  });
}
searchInput.addEventListener("input", runSearch);

const libraryView = document.createElement("section");
libraryView.className = "view library-view";
libraryView.style.display = "none";
libraryView.innerHTML = `<h2>Library</h2><div id="libraryResults"></div>`;
container.appendChild(libraryView);
const libraryResults = libraryView.querySelector("#libraryResults");

function renderLibraryView() {
  libraryResults.innerHTML = "";
  if (recentlyPlayed.length === 0) {
    libraryResults.innerHTML = `<p class="status-msg">No recently played songs yet.</p>`;
    return;
  }
  recentlyPlayed.forEach((id) => {
    const song = songs.find((s) => s.id === id);
    if (!song) return;
    const idx = songs.indexOf(song);
    libraryResults.appendChild(createSongRow(song, idx));
  });
}

const favoritesView = document.createElement("section");
favoritesView.className = "view favorites-view";
favoritesView.style.display = "none";
favoritesView.innerHTML = `<h2>Favorites</h2><div id="favoritesResults"></div>`;
container.appendChild(favoritesView);
const favoritesResults = favoritesView.querySelector("#favoritesResults");

function renderFavoritesView() {
  favoritesResults.innerHTML = "";
  const favSongs = songs.filter((s) => favorites.has(s.id));
  if (favSongs.length === 0) {
    favoritesResults.innerHTML = `<p class="status-msg">No favorites yet. Tap the heart on a song to add it.</p>`;
    return;
  }
  favSongs.forEach((song) => {
    const idx = songs.indexOf(song);
    favoritesResults.appendChild(createSongRow(song, idx));
  });
}

homeBtn.addEventListener("click", () => showView("home"));
searchBtn.addEventListener("click", () => showView("search"));
libraryBtn.addEventListener("click", () => showView("library"));
favBtn.addEventListener("click", () => showView("favorites"));

playBtn.addEventListener("click", togglePlayPause);
previousBtn.addEventListener("click", goPrevious);
nextBtn.addEventListener("click", () => goNext(false));

shuffleBtn.addEventListener("click", () => {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle("active", isShuffle);

  if (isShuffle && songs.length > 1) {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * songs.length);
    } while (randomIndex === currentIndex);
    playSongAt(randomIndex);
  }
});

repeatBtn.addEventListener("click", () => {
  if (repeatMode === "off") repeatMode = "all";
  else if (repeatMode === "all") repeatMode = "one";
  else repeatMode = "off";

  repeatBtn.classList.toggle("active", repeatMode !== "off");
  repeatBtn.title =
    repeatMode === "one" ? "Repeat One" : repeatMode === "all" ? "Repeat All" : "Repeat Off";
});

favoriteSongBtn.addEventListener("click", () => {
  if (currentIndex === -1) return;
  toggleFavorite(songs[currentIndex].id);
});

progressBar.min = 0;
progressBar.max = 100;
progressBar.value = 0;

audioPlayer.addEventListener("timeupdate", () => {
  if (!audioPlayer.duration) return;
  progressBar.value = (audioPlayer.currentTime / audioPlayer.duration) * 100;
  currentTimeEl.textContent = formatDuration(audioPlayer.currentTime);
});

audioPlayer.addEventListener("loadedmetadata", () => {
  totalTimeEl.textContent = formatDuration(audioPlayer.duration);
});

progressBar.addEventListener("input", () => {
  if (!audioPlayer.duration) return;
  audioPlayer.currentTime = (progressBar.value / 100) * audioPlayer.duration;
});

volumeBar.min = 0;
volumeBar.max = 100;
volumeBar.value = 100;
audioPlayer.volume = 1;

volumeBar.addEventListener("input", () => {
  audioPlayer.volume = volumeBar.value / 100;
});

audioPlayer.addEventListener("play", () => {
  isPlaying = true;
  updatePlayIcon();
});
audioPlayer.addEventListener("pause", () => {
  isPlaying = false;
  updatePlayIcon();
});
audioPlayer.addEventListener("ended", () => {
  if (repeatMode === "one") {
    audioPlayer.currentTime = 0;
    audioPlayer.play();
    return;
  }
  goNext(true);
});

async function loadSongs() {
  console.log("Loading...");
  showLoading();

  try {
    const response = await fetch(CORS_PROXY + API_URL);
    if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

    const data = await response.json();
    console.log("API response:", data);

    const tracks = data.data || [];
    if (!Array.isArray(tracks) || tracks.length === 0) {
      showError("No songs found.");
      return;
    }

    songs = tracks.map((track) => {
      const title = track.title || "Unknown Title";
      const artist =
        track.artists && track.artists.length > 0 && track.artists[0][1]
          ? track.artists[0][1].name
          : "Unknown Artist";
      const image =
        (track.thumbnails &&
          (track.thumbnails.lg || track.thumbnails.md || track.thumbnails.xl || track.thumbnails.sm)) ||
        null;
      const duration = formatDuration(track.duration);
      const mp3 = track.files && track.files.mp3 ? track.files.mp3 : null;

      return { id: track.id, title, artist, image, duration, mp3 };
    });

    renderMainList();

    if (songs.length > 0) {
      currentIndex = 0;
      loadTrackIntoPlayer(songs[0]);
      audioPlayer.src = songs[0].mp3 || "";
    }
  } catch (err) {
    console.error("Failed to load songs:", err);
    showError("Couldn't load songs. Please try again later.");
  }
}

const menuToggle = document.getElementById("menuToggle");
const songsToggle = document.getElementById("songsToggle");
const drawerOverlay = document.getElementById("drawerOverlay");
const sidebarEl = document.querySelector(".sidebar");

function closeDrawers() {
  sidebarEl.classList.remove("open");
  playlistSection.classList.remove("open");
  searchView.classList.remove("open");
  libraryView.classList.remove("open");
  favoritesView.classList.remove("open");
  drawerOverlay.classList.remove("open");
}

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    const willOpen = !sidebarEl.classList.contains("open");
    closeDrawers();
    if (willOpen) {
      sidebarEl.classList.add("open");
      drawerOverlay.classList.add("open");
    }
  });
}

if (songsToggle) {
  songsToggle.addEventListener("click", () => {
    const activePanel =
      currentView === "home"
        ? playlistSection
        : currentView === "search"
        ? searchView
        : currentView === "library"
        ? libraryView
        : favoritesView;

    const willOpen = !activePanel.classList.contains("open");
    closeDrawers();
    if (willOpen) {
      activePanel.classList.add("open");
      drawerOverlay.classList.add("open");
    }
  });
}

if (drawerOverlay) {
  drawerOverlay.addEventListener("click", closeDrawers);
}

[homeBtn, searchBtn, libraryBtn, favBtn].forEach((btn) => {
  btn.addEventListener("click", closeDrawers);
});

loadSongs();