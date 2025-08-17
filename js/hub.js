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
    this.filePicker = document.getElementById('filePicker');
    this.playlist = [];
    this.currentTrackIndex = -1;
    this.dripPoints = parseInt(localStorage.getItem('dripPoints') || '0');
    this.leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [{ name: '@mackcwm', points: this.dripPoints }];
    this.apiKey = null; // Replace with process.env.XAI_API_KEY once available
    this.mockGrokData = {
      playlists: [
        { title: 'Neon Vibe Mix', src: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3', cover: 'https://picsum.photos/50/50?random=1' },
        { title: 'Akron Night Chime', src: 'https://www.soundjay.com/misc/sounds/bell-ringing-04.mp3', cover: 'https://picsum.photos/50/50?random=2' }
      ],
      art: [{ title: 'Neon Akron Glow', src: 'https://picsum.photos/800/400?random=1' }]
    };
    this.setupAudioEvents();
    this.setupFileEvents();
    this.updateLeaderboard();
    this.say('Welcome to P.O.P.S. Media Hub v0.3.1! Drop a vibe with #POPSvibe 🚀', 5);
  }

  setupAudioEvents() {
    this.audioPlayer.ontimeupdate = () => {
      const current = this.audioPlayer.currentTime;
      const total = this.audioPlayer.duration || 0;
      this.audioTime.textContent = `${this.formatTime(current)} / ${this.formatTime(total)}`;
      const percent = (current / total) * 100;
      this.audioProgressBar.style.width = percent + '%';
    };
    this.audioPlayer.onplay = () => this.audioPlayPauseBtn.textContent = '⏸️';
    this.audioPlayer.onpause = () => this.audioPlayPauseBtn.textContent = '▶️';
    this.audioPlayer.onended = () => this.nextTrack();
  }

  setupFileEvents() {
    this.filePicker.addEventListener('change', (e) => this.handleFileLoad(e.target.files));
  }

  say(text, dripPoints = 0) {
    this.rogerOutput.textContent = `Roger: ${text}`;
    if (dripPoints > 0) this.addDripPoints(dripPoints);
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
      .map((user, index) => `<div class="leaderboard-item">${index === 0 ? '👑 ' : ''}${user.name} - ${user.points} Drip</div>`)
      .join('');
  }

  async askGrok() {
    this.say('Grok API coming soon! Dropping neon art for now.', 3);
    this.loadMedia('image', this.mockGrokData.art[0].src, '🖼️ Neon Akron Glow');
  }

  async generatePlaylist(userInput = 'MackGPT vibe: upbeat hip-hop') {
    this.say(`Cooking a ${userInput} playlist...`, 5);
    try {
      let playlistData, coverArt;
      if (this.apiKey) {
        const moodResponse = await this.callXAIMoodAPI(userInput);
        const mood = moodResponse.mood || 'energetic';
        playlistData = await this.callSpotifyAPI(mood);
        coverArt = await this.generatePlaylistCover(mood);
      } else {
        this.say('No xAI API key yet. Using mock vibes!', 2);
        playlistData = { tracks: this.mockGrokData.playlists };
        coverArt = this.mockGrokData.art[0].src;
      }
      playlistData.tracks.forEach(track => this.addToPlaylist({
        src: track.url || track.src,
        title: track.name ? `${track.name} by ${track.artist}` : track.title,
        cover: track.cover || coverArt
      }));
      if (this.currentTrackIndex === -1) {
        this.playTrack(0);
      }
      this.say(`Dropped a ${userInput} playlist! Share with #POPSvibe!`, 8);
      this.addDripPoints(10);
    } catch (error) {
      this.say(`Error generating playlist: ${error.message}. Get xAI API at https://x.ai/api!`, 0);
    }
  }

  async callXAIMoodAPI(input) {
    if (!this.apiKey) throw new Error('xAI API key missing. Get one at https://x.ai/api');
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'grok-4',
        messages: [
          { role: 'system', content: 'Analyze the mood in the user input and return a single word describing it (e.g., energetic, chill, sad).' },
          { role: 'user', content: input }
        ],
        temperature: 0.5,
        max_tokens: 10
      })
    });
    if (!response.ok) throw new Error('xAI API request failed');
    const data = await response.json();
    return { mood: data.choices[0].message.content.trim() };
  }

  async callSpotifyAPI(mood) {
    return new Promise(resolve => {
      setTimeout(() => {
        const tracks = [
          { name: 'Neon Vibe Drop', artist: 'MackTunes', url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3', cover: 'https://picsum.photos/50/50?random=2' },
          { name: 'Akron Night Pulse', artist: 'GrokBeats', url: 'https://www.soundjay.com/misc/sounds/bell-ringing-04.mp3', cover: 'https://picsum.photos/50/50?random=3' }
        ];
        resolve({ tracks });
      }, 500);
    });
  }

  async generatePlaylistCover(mood) {
    if (!this.apiKey) return 'https://picsum.photos/50/50?random=1';
    const response = await fetch('https://api.x.ai/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'grok-2-image',
        prompt: `A neon-styled digital art piece reflecting a ${mood} mood, vibrant colors, Akron cityscape elements, futuristic vibe`,
        n: 1
      })
    });
    if (!response.ok) throw new Error('xAI image generation failed');
    const data = await response.json();
    return data.images[0].url;
  }

  loadMedia(type, src, title) {
    this.mediaOutput.innerHTML = `<h2>${title}</h2>`;
    const media = document.createElement(type === 'video' ? 'video' : type === 'image' ? 'img' : 'audio');
    media.src = src;
    media.controls = type !== 'image';
    media.autoplay = type !== 'image';
    media.className = type !== 'image' ? 'loaded' : 'loaded';
    media.style.maxWidth = '100%';
    media.style.marginTop = '1rem';
    media.onerror = () => this.say(`Error loading ${type}: ${title}. Try another vibe.`, 0);
    media.onplay = () => this.say(`Playing ${title}. Share with #POPSvibe!`, 5);
    this.mediaOutput.appendChild(media);
    const shareBtn = document.createElement('button');
    shareBtn.className = 'roger-share';
    shareBtn.textContent = 'Share to X';
    shareBtn.onclick = () => this.shareMedia(src, title);
    this.mediaOutput.appendChild(shareBtn);
    this.addDripPoints(3);
  }

  shareMedia(src, title) {
    const shareText = encodeURIComponent(`Check out this ${title} on P.O.P.S. Media Hub! #POPSvibe ${src}`);
    window.open(`https://x.com/intent/tweet?text=${shareText}`, '_blank');
    this.say(`Shared ${title} to X. Keep it viral!`, 10);
    this.addDripPoints(10);
  }

  showPlaylist() {
    this.playlistContent.innerHTML = this.playlist.map((track, index) => `
      <div class="playlist-track">
        <img src="${track.cover || 'https://picsum.photos/50/50'}" alt="Cover" style="width: 50px; height: 50px; border-radius: 4px;">
        <span>${track.title}</span>
        <button onclick="roger.playTrack(${index})">▶️</button>
      </div>`).join('');
    this.playlistModalBackdrop.style.display = 'flex';
    this.say('Playlist open. Pick your vibe!', 3);
  }

  hidePlaylist() {
    this.playlistModalBackdrop.style.display = 'none';
    this.say('Playlist closed. Keep the vibes flowing.', 2);
  }

  playTrack(index) {
    if (index < 0 || index >= this.playlist.length) return;
    const track = this.playlist[index];
    this.audioPlayer.src = track.src;
    this.audioTrackTitle.textContent = track.title;
    this.audioOverlay.style.display = 'block';
    this.audioPlayer.play().catch(() => this.say('Playback needs interaction.', 0));
    this.currentTrackIndex = index;
    this.say(`Playing ${track.title}.`, 3);
  }

  toggleAudioPlayback() {
    if (this.audioPlayer.paused) {
      this.audioPlayer.play();
      this.audioPlayPauseBtn.textContent = '⏸️';
      this.say('Track playing. Vibe on!', 2);
    } else {
      this.audioPlayer.pause();
      this.audioPlayPauseBtn.textContent = '▶️';
      this.say('Track paused. Chill mode.', 2);
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
    this.say('Audio player closed. Silence is a vibe.', 2);
  }

  seekAudio(e) {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    this.audioPlayer.currentTime = percent * this.audioPlayer.duration;
    this.say('Scrubbed to new vibe!', 2);
  }

  formatTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  handleFileLoad(files) {
    if (!files || files.length === 0) return;
    let audioFilesFound = 0;
    for (const file of files) {
      const url = URL.createObjectURL(file);
      if (file.type.startsWith('audio/')) {
        this.addToPlaylist({ src: url, title: `📁 ${file.name}`, cover: 'https://picsum.photos/50/50' });
        audioFilesFound++;
      } else if (file.type.startsWith('video/')) {
        this.loadMedia('video', url, `📁 ${file.name}`);
      } else if (file.type.startsWith('image/')) {
        this.loadMedia('image', url, `📁 ${file.name}`);
      }
    }
    if (audioFilesFound > 0 && this.currentTrackIndex === -1) {
      this.playTrack(0);
    }
    this.say(`${files.length} file(s) processed. ${audioFilesFound} audio track(s) added.`, audioFilesFound * 2);
  }

  addToPlaylist(track) {
    if (!this.playlist.some(t => t.src === track.src)) {
      this.playlist.push(track);
      this.showPlaylist();
    }
  }
}

const roger = new RogerMediaHub();
