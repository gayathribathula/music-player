🎵 Melody Music Player

A responsive web-based music player built using **HTML, CSS, and JavaScript**. Melody provides a clean music-player interface with song playback, search, favorites, recently played songs, and responsive navigation for desktop and mobile screens.

✨ Features

* 🎵 Play and pause songs
* ⏮️ Previous and next song controls
* 🔀 Shuffle and 🔁 repeat modes
* 🔊 Volume control
* ⏱️ Song progress tracking
* ❤️ Add and remove favorite songs
* 🔍 Search songs by title or artist
* 📚 Recently played songs library
* 📱 Responsive mobile-friendly design
* 💾 Favorites and recently played songs saved using `localStorage`
* 🎨 Modern dark-themed music-player interface

## 🛠️ Technologies Used

* **HTML5** – Structure and layout
* **CSS3** – Styling and responsive design
* **JavaScript** – Music playback and application logic
* **Font Awesome** – Icons
* **Google Fonts** – Poppins typography
* **FreeToUse Music API** – Fetching music data

## 📂 Project Structure

```text
music-player/
│
├── index.html
├── script.js
│
├── css/
│   ├── player.css
│   ├── sidebar.css
│   ├── songs.css
│   └── responsive.css
│
├── assets/
│   └── coverimg.png
│
├── covering.png
└── README.md
```

## 🎧 Main Sections

### 🏠 Now Playing

Displays the currently selected song along with album artwork, artist information, playback controls, progress bar, and volume controls.

### 🔍 Search

Allows users to search for songs or artists and play the matching results.

### 📚 Library

Displays recently played songs so users can quickly access their listening history.

### ❤️ Favorites

Users can add songs to their favorites and access them from the Favorites section.

## 📱 Responsive Design

The application adapts to different screen sizes.

* **Desktop:** Sidebar navigation with the music player and song list.
* **Tablet:** Responsive player and navigation layout.
* **Mobile:** Spotify-inspired bottom navigation for **Now Playing, Search, Library, and Favorites**.

## 💾 Local Storage

Melody uses browser `localStorage` to preserve:

* Favorite songs
* Recently played songs

This allows user preferences to remain available even after refreshing the page.

## 🚀 How to Run

1. Clone the repository:

```bash
git clone https://github.com/gayathribathula/music-player.git
```

2. Open the project folder.

3. Run `index.html` using a local development server such as **VS Code Live Server**.

4. Start listening 🎶

## 🔮 Future Improvements

* Create custom playlists
* Add song filtering by genre
* Add dark/light theme options
* Add user authentication
* Add more advanced music recommendations
* Improve mobile player controls

## 👩‍💻 Author

**Gayathri Bathula**

GitHub: [gayathribathula](https://github.com/gayathribathula)

---

⭐ If you like this project, consider giving the repository a star!
