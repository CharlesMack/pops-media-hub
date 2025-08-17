// js/hub.js
class RogerMediaHub {
  constructor() {
    this.rogerOutput = document.getElementById('rogerOutput');
    this.dripPointsDisplay = document.getElementById('dripPoints');
    this.leaderboardList = document.getElementById('leaderboardList');
    this.mediaOutput = document.getElementById('mediaOutput');
    this.audioOverlay = document.getElementById('audioOverlay');
    this.audioPlayer = new Audio();
    this.audioPlayPauseBtn = document.getElementById('audioPlayPauseBtn');
    this.audioTrackTitle = document.getElementById('audioTrackTitle');
    this.audioTime = document.getElementById('audioTime');
    this.audioProgressBar = document.getElementById('audioProgressBar');
    this.playlistModalBackdrop = document.getElementById('playlistModalBackdrop');
    this.playlistContent = document.getElementById('playlistContent');
    this.playlist = [];
    this.currentTrackIndex = -1;
    this.dripPoints = parseInt(localStorage.getItem('dripPoints') || '0');
    this.leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [{ name: '@mackcwm', points: this.dripPoints }];
    this.updateLeaderboard();
    this.setupAudioEvents();
  }

  say(text) {
    this.rogerOutput.textContent = text;
    this.addDripPoints(2);
  }

  addDripPoints(amount) {
    this.dripPoints += amount;
    localStorage.setItem('dripPoints', this.dripPoints);
    this.updateLeaderboard();
  }

  updateLeaderboard() {
    this.dripPointsDisplay.textContent = this.dripPoints;
    this.leaderboard[0].points = this.dripPoints;
    localStorage.setItem('leaderboard', JSON.stringify(this.leaderboard));
    this.leaderboardList.innerHTML = this.leaderboard
      .sort((a, b) => b.points - a.points)
      .slice(0, 5)
      .map(user => `<div class="leaderboard-item">${user.name} - ${user.points} Drip</div>`)
      .join('');
  }

  askGrok() {
    this.say("Grok API vibes incoming! Dropped a neon art piece.");
    this.loadMedia('image', 'https://picsum.photos/800/400?random=1', '🖼️ Neon Akron Glow');
  }

  generatePlaylist() {
    const mockTrack = {
      title: '🎧 Neon Vibe Mix',
      src: 'https://www.soundjay.com/button/beep-07.wav'
    };
    this.playlist.push(mockTrack);
    this.say("Generated MackGPT-inspired playlist! Vibe on.");
    if (this.currentTrackIndex === -1) {
      this.playTrack(this.playlist.length - 1);
    }
  }

  loadMedia(type, src, title) {
    const media = document.createElement(type === 'video' ? 'video' : type === 'image' ? 'img' : 'audio');
    media.src = src;
    media.controls = true;
    media.autoplay = true;
    media.style.maxWidth = '100%';
    media.style.marginTop = '1rem';
    this.mediaOutput.innerHTML = `<h2>${title}</h2>`;
    this.mediaOutput.appendChild(media);
    this.addDripPoints(2);
  }

  showPlaylist() {
    this.playlistContent.innerHTML = this.playlist.map((track, index) => `
      <div class="playlist-track">
        <span>${track.title}</span>
        <button onclick="roger.playTrack(${index})">▶️</button>
      </div>`).join('');
    this.playlistModalBackdrop.style.display = 'flex';
  }

  hidePlaylist() {
    this.playlistModalBackdrop.style.display = 'none';
  }

  playTrack(index) {
    if (index < 0 || index >= this.playlist.length) return;
    const track = this.playlist[index];
    this.audioPlayer.src = track.src;
    this.audioTrackTitle.textContent = track.title;
    this.audioOverlay.style.display = 'block';
    this.audioPlayer.play();
    this.currentTrackIndex = index;
    this.audioPlayPauseBtn.textContent = '⏸️';
  }

  toggleAudioPlayback() {
    if (this.audioPlayer.paused) {
      this.audioPlayer.play();
      this.audioPlayPauseBtn.textContent = '⏸️';
    } else {
      this.audioPlayer.pause();
      this.audioPlayPauseBtn.textContent = '▶️';
    }
  }

  previousTrack() {
    if (this.currentTrackIndex > 0) {
      this.playTrack(this.currentTrackIndex - 1);
    }
  }

  nextTrack() {
    if (this.currentTrackIndex < this.playlist.length - 1) {
      this.playTrack(this.currentTrackIndex + 1);
    }
  }

  closeAudioPlayer() {
    this.audioOverlay.style.display = 'none';
    this.audioPlayer.pause();
    this.audioTrackTitle.textContent = 'No track loaded';
    this.audioTime.textContent = '00:00 / 00:00';
    this.audioProgressBar.style.width = '0%';
    this.currentTrackIndex = -1;
  }

  seekAudio(e) {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    this.audioPlayer.currentTime = percent * this.audioPlayer.duration;
  }

  setupAudioEvents() {
    this.audioPlayer.ontimeupdate = () => {
      const current = this.audioPlayer.currentTime;
      const total = this.audioPlayer.duration || 0;
      this.audioTime.textContent = `${this.formatTime(current)} / ${this.formatTime(total)}`;
      const percent = (current / total) * 100;
      this.audioProgressBar.style.width = percent + '%';
    };
  }

  formatTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
}

const roger = new RogerMediaHub();
