class POPSMediaHub {
  constructor() {
    this.viewerContentArea = document.getElementById('viewerContentArea');
    this.viewerPlaceholder = document.getElementById('viewerPlaceholder');
    this.rogerInput = document.getElementById('rogerInput');
    this.rogerResponse = document.getElementById('rogerResponseText');
    this.rogerSuggestions = document.getElementById('rogerSuggestions');
    this.filePicker = document.getElementById('filePicker');
    this.dropZone = document.getElementById('dropZone');
    this.networkStatus = document.getElementById('networkStatus');
    this.sidebar = document.getElementById('sidebar');
    this.sidebarToggle = document.getElementById('sidebarToggle');
    this.browserControls = document.getElementById('browserControls');
    this.addressBar = document.getElementById('addressBar');
    this.backBtn = document.getElementById('backBtn');
    this.forwardBtn = document.getElementById('forwardBtn');
    this.tabsContainer = document.getElementById('tabsContainer');
    this.newTabBtn = document.getElementById('newTabBtn');
    this.audioOverlay = document.getElementById('audioOverlay');
    this.backgroundAudio = new Audio();
    this.audioTrackTitle = document.getElementById('audioTrackTitle');
    this.audioTime = document.getElementById('audioTime');
    this.audioProgressBar = document.getElementById('audioProgressBar');
    this.dripPointsDisplay = document.getElementById('dripPoints');
    this.audioPlayPauseBtn = document.getElementById('audioPlayPauseBtn');
    this.playlistModalBackdrop = document.getElementById('playlistModalBackdrop');
    this.playlistContent = document.getElementById('playlistContent');
    this.playlistCloseBtn = document.getElementById('playlistCloseBtn');
    this.isOnline = navigator.onLine;
    this.tabs = [];
    this.activeTabId = null;
    this.isBrowserActive = false;
    this.defaultUrl = 'https://www.google.com/search?q=welcome+to+POPS+media+hub';
    this.leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [{ name: '@mackcwm', points: this.dripPoints }];
    this.playlist = [];
    this.currentTrackIndex = -1;
    this.rogerMood = localStorage.getItem('rogerMood') || 'MackGPT';
    this.dripPoints = parseInt(localStorage.getItem('dripPoints')) || 0;
    this.grokAPIKey = null; // Placeholder for xAI Grok API key
    this.mockGrokData = { playlists: [{ title: 'Neon Vibe Mix', src: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3' }], art: [{ title: 'Neon Akron Glow', src: 'https://picsum.photos/1200/800?random=1' }] }; // Mock data
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.initRoger();
    this.setupDragDrop();
    this.updateLeaderboard();
    this.setupAudioPlayer();
    this.rogerSay("Welcome to P.O.P.S. Media Hub! Say 'generate playlist' or 'go chaotic' and share with #POPSvibe to climb the Drip leaderboard. Vibe master, let’s roll!", 5);  }

  setupEventListeners() {
    this.rogerInput.addEventListener('keydown', (e) => e.key === 'Enter' && this.processRogerCommand());
    this.rogerInput.addEventListener('input', () => this.showSuggestions());
    this.filePicker.addEventListener('change', (e) => this.handleFileLoad(e.target.files));
    this.sidebarToggle.addEventListener('click', () => this.toggleSidebar());
    this.newTabBtn.addEventListener('click', () => this.createNewTab());
    this.playlistCloseBtn.addEventListener('click', () => this.hidePlaylist());

    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key.toLowerCase()) {
          case 'o': e.preventDefault(); this.filePicker.click(); break;
          case 'f': e.preventDefault(); this.toggleFullscreen(); break;
          case 't': if (this.isBrowserActive) { e.preventDefault(); this.createNewTab(); } break;
          case 'w': if (this.isBrowserActive && this.activeTabId) { e.preventDefault(); this.closeTab(this.activeTabId); } break;
        }
      }
    });
  }

  setupDragDrop() {
    let dragCounter = 0;
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      document.addEventListener(eventName, e => {
        e.preventDefault();
        e.stopPropagation();
      });
    });
    document.addEventListener('dragenter', () => { dragCounter++; this.dropZone.classList.add('active'); });
    document.addEventListener('dragleave', () => { dragCounter--; if (dragCounter === 0) this.dropZone.classList.remove('active'); });
    document.addEventListener('drop', e => {
      dragCounter = 0;
      this.dropZone.classList.remove('active');
      this.handleFileLoad(e.dataTransfer.files);
    });
  }

  initRoger() {
    this.rogerCommands = {
      'play music': () => this.playBackgroundMusic('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3', 'Roger\'s Choice'),
      'browse web': () => this.openBrowser(),
      'new tab': () => this.isBrowserActive ? this.createNewTab() : this.rogerSay("Open browser first.", 0, true),
      'close tab': () => this.isBrowserActive ? this.closeTab(this.activeTabId) : this.rogerSay("No active tab.", 0, true),
      'clear': () => this.clearViewer(),
      'fullscreen': () => this.toggleFullscreen(),
      'collapse sidebar': () => this.toggleSidebar(true),
      'expand sidebar': () => this.toggleSidebar(false),
      'playlist': () => this.showPlaylist(),
      'load folder': () => this.loadMusicFolder(),
      'toggle mood': () => this.toggleRogerMood(),
      'go chaotic': () => {
        this.rogerMood = 'LackGPT';
        localStorage.setItem('rogerMood', 'LackGPT');
        this.rogerSay("Chaos mode activated. Let’s get weird.", 5);
      },
      'ask grok': async () => {
        if (!this.grokAPIKey) {
          this.rogerSay("Grok API not configured yet. Stay tuned for the collab vibe!", 0, true);
          return;
        }
        // Simulate Grok API call for demo
        this.rogerSay("Grok API vibes incoming! Dropped a neon art piece.", 5);
        this.loadMedia('image', this.mockGrokData.art[0].src, this.mockGrokData.art[0].title);
      },
      'generate playlist': async () => {
        if (!this.grokAPIKey) {
          this.rogerSay("Grok API not ready yet. Try loading a folder for now!", 0, true);
          return;
        }
        // Simulate Grok API playlist generation
        this.rogerSay(`Generated ${this.rogerMood}-inspired playlist! Vibe on.`, 5);
        this.addToPlaylist(this.mockGrokData.playlists[0]);
        if (this.currentTrackIndex === -1) {
          this.playTrack(this.playlist.length - 1);
        }
      }
    };
    this.moodResponses = {
      MackGPT: {
        default: "Yo, you’re crushing it! Let’s drop that vibe! 🚀",
        error: "Whoa, vibe check failed! Try a new command, champ."
      },
      LackGPT: {
        default: "Pfft, you call that a command? Let’s see something with more chaos.",
        error: "Yawn, that didn’t work. Try not to bore me next time."
      },
      GuideGPT: {
        default: "All set! What do you want to explore next?",
        error: "Hmm, that command didn’t work. Try ‘play music’ or ‘new tab’."
      }
    };
  }

  processRogerCommand() {
    const input = this.rogerInput.value.toLowerCase().trim();
    if (!input) return;
    this.rogerInput.value = '';
    this.rogerSuggestions.classList.remove('active');

    let found = false;
    for (const [command, action] of Object.entries(this.rogerCommands)) {
      if (input.includes(command)) {
        action();
        this.addDripPoints(2); // Award Drip for command use
        found = true;
        break;
      }
    }
    if (!found) this.rogerSay(`Command "${input}" not recognized.`, 0, true);
  }

  rogerSay(message, dripPoints = 0, isError = false) {
    const responseKey = isError ? 'error' : 'default';
    const prefix = this.moodResponses[this.rogerMood][responseKey];
    this.rogerResponse.textContent = `Roger: ${prefix} ${message}${dripPoints > 0 ? ` (+${dripPoints} Drip)` : ''}`;
    this.rogerResponse.parentElement.classList.add('active');
    setTimeout(() => this.rogerResponse.parentElement.classList.remove('active'), 5000);
    if (dripPoints > 0) this.addDripPoints(dripPoints);
  }

  startVoiceCommand() {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      this.rogerSay("Voice commands not supported. Type it out, vibe master!", 0, true);
      return;
    }
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    const rogerMic = document.querySelector('.roger-mic');
    rogerMic.classList.add('active');

    recognition.onresult = (e) => {
      const command = e.results[0][0].transcript.toLowerCase();
      this.rogerInput.value = command;
      this.processRogerCommand();
      rogerMic.classList.remove('active');
      this.addDripPoints(3); // Extra Drip for voice command
    };
    recognition.onerror = (e) => {
      this.rogerSay(`Voice error: ${e.error}. Try typing your vibe.`, 0, true);
      rogerMic.classList.remove('active');
    };
    recognition.onend = () => rogerMic.classList.remove('active');
    recognition.start();
    this.rogerSay("Listening for your vibe...");
  }

  showSuggestions() {
    const input = this.rogerInput.value.toLowerCase().trim();
    if (input.length < 2) {
      this.rogerSuggestions.classList.remove('active');
      return;
    }
    const suggestions = Object.keys(this.rogerCommands).filter(cmd => cmd.includes(input));
    this.rogerSuggestions.innerHTML = suggestions.length
      ? suggestions.map(cmd => `<div class="suggestion-item" onclick="hubInstance.rogerInput.value='${cmd}';hubInstance.processRogerCommand()">${cmd}</div>`).join('')
      : '<div class="suggestion-item">No matching commands</div>';
    this.rogerSuggestions.classList.add('active');
  }

  toggleRogerMood() {
    const moods = ['MackGPT', 'LackGPT', 'GuideGPT'];
    this.rogerMood = moods[(moods.indexOf(this.rogerMood) + 1) % moods.length];
    localStorage.setItem('rogerMood', this.rogerMood);
    this.rogerSay(`Switched to ${this.rogerMood} mode. Let’s vibe!`, 5);
  }

  shareRogerResponse() {
    const response = this.rogerResponse.textContent;
    const shareText = encodeURIComponent(`${response} #POPSvibe`);
    window.open(`https://x.com/intent/tweet?text=${shareText}`, '_blank');
    this.rogerSay("Shared your vibe to X! Keep it 💯.", 10);
    this.addDripPoints(10); // Drip for sharing
  }

  addDripPoints(points) {
    this.dripPoints += points;
    localStorage.setItem('dripPoints', this.dripPoints);
    console.log(`Drip Points: ${this.dripPoints}`);
    this.updateLeaderboard();
  }

  updateLeaderboard() {
    this.dripPointsDisplay.textContent = this.dripPoints;
    this.leaderboard[0].points = this.dripPoints; // Mock: update @mackcwm's score
    localStorage.setItem('leaderboard', JSON.stringify(this.leaderboard));
    const leaderboardList = document.getElementById('leaderboardList');
    leaderboardList.innerHTML = this.leaderboard
      .sort((a, b) => b.points - a.points)
      .slice(0, 5)
      .map(item => `<div class="leaderboard-item">${item.name} - ${item.points} Drip</div>`)
      .join('');
  }

  loadMedia(type, src, title = 'Media') {
    this.exitBrowserMode();
    this.viewerContentArea.innerHTML = '';
    let element;
    switch(type) {
      case 'video': element = document.createElement('video'); element.controls = true; break;
      case 'image': element = document.createElement('img'); break;
    }
    element.src = src;
    element.className = 'viewer-content';
    this.viewerContentArea.appendChild(element);
    this.rogerSay(`Now displaying: ${title}`, 2);
  }

  clearViewer() {
    this.exitBrowserMode();
    this.viewerContentArea.innerHTML = '';
    this.viewerContentArea.appendChild(this.viewerPlaceholder);
    this.rogerSay("Viewer cleared.", 2);
  }

  handleFileLoad(files) {
    if (!files || files.length === 0) return;
    let audioFilesFound = 0;
    for(const file of files) {
      const url = URL.createObjectURL(file);
      if (file.type.startsWith('audio/')) {
        this.addToPlaylist({ src: url, title: `📁 ${file.name}` });
        audioFilesFound++;
      }
    }
    if (audioFilesFound > 0 && this.currentTrackIndex === -1) {
      this.playTrack(0);
    }
    this.rogerSay(`${files.length} file(s) processed. ${audioFilesFound} audio track(s) added to playlist.`, audioFilesFound * 2);
  }

  async loadMusicFolder() {
    if (!window.showDirectoryPicker) {
      this.rogerSay("Folder access is not supported by your browser.", 0, true);
      return;
    }
    try {
      const dirHandle = await window.showDirectoryPicker();
      let count = 0;
      for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file') {
          const file = await entry.getFile();
          if (file.type.startsWith('audio/')) {
            const url = URL.createObjectURL(file);
            this.addToPlaylist({ src: url, title: `📁 ${file.name}` });
            count++;
          }
        }
      }
      if (count > 0 && this.currentTrackIndex === -1) {
        this.playTrack(0);
      }
      this.rogerSay(`Loaded ${count} tracks from the folder.`, count * 2);
    } catch (err) {
      if (err.name !== 'AbortError') {
        this.rogerSay("Error accessing folder.", 0, true);
      }
    }
  }

  openBrowser() {
    if (!this.isBrowserActive) {
      this.viewerContentArea.innerHTML = '';
      this.isBrowserActive = true;
      this.browserControls.classList.add('active');
      this.createNewTab(this.defaultUrl, true);
      this.rogerSay("Browser launched. Surf the vibes!", 5);
    }
  }

  exitBrowserMode() {
    if (!this.isBrowserActive) return;
    this.isBrowserActive = false;
    this.browserControls.classList.remove('active');
    this.tabs = [];
    this.activeTabId = null;
    this.renderTabs();
    this.viewerContentArea.innerHTML = '';
    this.viewerContentArea.appendChild(this.viewerPlaceholder);
  }

  createNewTab(url = this.defaultUrl, makeActive = true) {
    const tabId = `tab-${Date.now()}-${Math.random()}`;
    const iframe = document.createElement('iframe');
    iframe.id = `iframe-${tabId}`;
    iframe.className = 'viewer-content';
    iframe.sandbox = "allow-scripts allow-same-origin allow-forms allow-popups";
    iframe.src = url;

    const tab = { id: tabId, history: [url], currentIndex: 0, title: 'Loading...', iframe };
    
    iframe.onload = () => {
      try { tab.title = iframe.contentDocument.title || this.getDomainFromUrl(iframe.src); } 
      catch (e) { tab.title = this.getDomainFromUrl(iframe.src); }
      this.renderTabs();
    };

    this.tabs.push(tab);
    this.viewerContentArea.appendChild(iframe);
    
    if (makeActive || this.tabs.length === 1) this.switchTab(tabId);
    else this.renderTabs();
    this.rogerSay("New tab opened. Ready to explore!", 3);
  }

  switchTab(tabId) {
    if (this.activeTabId === tabId) return;
    this.activeTabId = tabId;
    this.tabs.forEach(tab => tab.iframe.classList.toggle('active', tab.id === tabId));
    this.updateBrowserUI();
    this.renderTabs();
    this.rogerSay("Switched tabs. Keep the vibe flowing!", 2);
  }

  closeTab(tabId) {
    const tabIndex = this.tabs.findIndex(t => t.id === tabId);
    if (tabIndex === -1) return;
    const [removedTab] = this.tabs.splice(tabIndex, 1);
    removedTab.iframe.remove();
    if (this.tabs.length === 0) {
      this.exitBrowserMode();
      return;
    }
    if (this.activeTabId === tabId) {
      this.switchTab(this.tabs[Math.max(0, tabIndex - 1)].id);
    }
    this.renderTabs();
    this.rogerSay("Tab closed. Vibe streamlined.", 2);
  }

  renderTabs() {
    this.tabsContainer.innerHTML = this.tabs.map(tab => `
      <div class="tab-item ${tab.id === this.activeTabId ? 'active' : ''}" data-tab-id="${tab.id}">
        <span class="tab-title">${tab.title}</span>
        <button class="tab-close" data-tab-id="${tab.id}">×</button>
      </div>
    `).join('');

    this.tabsContainer.querySelectorAll('.tab-item').forEach(el => {
      el.addEventListener('click', (e) => {
        const id = el.dataset.tabId;
        if(e.target.classList.contains('tab-close')) this.closeTab(id);
        else this.switchTab(id);
      });
    });
  }

  navigateToUrl() {
    let url = this.addressBar.value.trim();
    if (!url || !this.activeTabId) return;
    if (!url.startsWith('http')) url = 'https://' + url;
    const tab = this.tabs.find(t => t.id === this.activeTabId);
    tab.iframe.src = url;
    tab.history = tab.history.slice(0, tab.currentIndex + 1);
    tab.history.push(url);
    tab.currentIndex++;
    this.updateBrowserUI();
    this.rogerSay(`Navigating to ${this.getDomainFromUrl(url)}.`, 3);
  }

  browserBack() {
    const tab = this.tabs.find(t => t.id === this.activeTabId);
    if (tab && tab.currentIndex > 0) {
      tab.currentIndex--;
      tab.iframe.src = tab.history[tab.currentIndex];
      this.updateBrowserUI();
      this.rogerSay("Going back. Rewind the vibe!", 2);
    }
  }

  browserForward() {
    const tab = this.tabs.find(t => t.id === this.activeTabId);
    if (tab && tab.currentIndex < tab.history.length - 1) {
      tab.currentIndex++;
      tab.iframe.src = tab.history[tab.currentIndex];
      this.updateBrowserUI();
      this.rogerSay("Moving forward. Keep the momentum!", 2);
    }
  }

  browserReload() {
    const tab = this.tabs.find(t => t.id === this.activeTabId);
    if (tab) {
      tab.iframe.src = tab.iframe.src;
      this.rogerSay("Reloading. Fresh vibe incoming!", 2);
    }
  }

  browserHome() {
    this.addressBar.value = this.defaultUrl;
    this.navigateToUrl();
    this.rogerSay("Back to home base. Vibe reset!", 2);
  }

  updateBrowserUI() {
    const tab = this.tabs.find(t => t.id === this.activeTabId);
    if (!tab) return;
    this.addressBar.value = tab.history[tab.currentIndex];
    this.backBtn.disabled = tab.currentIndex <= 0;
    this.forwardBtn.disabled = tab.currentIndex >= tab.history.length - 1;
  }

  getDomainFromUrl(url) {
    try { return new URL(url).hostname; } 
    catch(e) { return 'Invalid URL'; }
  }

  setupAudioPlayer() {
    this.backgroundAudio.addEventListener('ended', () => this.nextTrack());
    this.backgroundAudio.addEventListener('timeupdate', () => this.updateAudioProgress());
    this.backgroundAudio.addEventListener('play', () => this.audioPlayPauseBtn.textContent = '⏸️');
    this.backgroundAudio.addEventListener('pause', () => this.audioPlayPauseBtn.textContent = '▶️');
  }

  addToPlaylist(track) {
    if (!this.playlist.some(t => t.src === track.src)) {
      this.playlist.push(track);
    }
  }

  playTrack(index) {
    if (index < 0 || index >= this.playlist.length) return;
    this.currentTrackIndex = index;
    const track = this.playlist[index];
    this.backgroundAudio.src = track.src;
    this.audioTrackTitle.textContent = track.title;
    this.backgroundAudio.play().catch(e => this.rogerSay("Playback requires user interaction.", 0, true));
    this.audioOverlay.classList.add('active');
    if(this.playlistModalBackdrop.classList.contains('active')) this.renderPlaylist();
    this.rogerSay(`Playing ${track.title}.`, 3);
  }

  playBackgroundMusic(src, title) {
    this.addToPlaylist({src, title});
    this.playTrack(this.playlist.length - 1);
  }

  toggleAudioPlayback() {
    if (this.backgroundAudio.paused) {
      this.backgroundAudio.play();
      this.rogerSay("Track playing. Vibe on!", 2);
    } else {
      this.backgroundAudio.pause();
      this.rogerSay("Track paused. Chill mode.", 2);
    }
  }

  nextTrack() {
    this.playTrack((this.currentTrackIndex + 1) % this.playlist.length);
  }

  previousTrack() {
    this.playTrack((this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length);
  }

  closeAudioPlayer() {
    this.backgroundAudio.pause();
    this.backgroundAudio.src = '';
    this.audioOverlay.classList.remove('active');
    this.currentTrackIndex = -1;
    this.rogerSay("Audio player closed. Silence is a vibe too.", 2);
  }

  updateAudioProgress() {
    const { currentTime, duration } = this.backgroundAudio;
    if (duration) {
      this.audioProgressBar.style.width = `${(currentTime / duration) * 100}%`;
      this.audioTime.textContent = `${this.formatTime(currentTime)} / ${this.formatTime(duration)}`;
    }
  }

  seekAudio(event) {
    const { offsetWidth } = event.currentTarget;
    this.backgroundAudio.currentTime = (event.offsetX / offsetWidth) * this.backgroundAudio.duration;
    this.rogerSay("Scrubbed to new vibe!", 2);
  }

  showPlaylist() {
    this.renderPlaylist();
    this.playlistModalBackdrop.classList.add('active');
    this.rogerSay("Playlist open. Pick your vibe!", 3);
  }

  hidePlaylist() {
    this.playlistModalBackdrop.classList.remove('active');
    this.rogerSay("Playlist closed. Keep the vibes flowing.", 2);
  }

  renderPlaylist() {
    if (this.playlist.length === 0) {
      this.playlistContent.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Playlist is empty. Load some music!</p>';
      return;
    }
    this.playlistContent.innerHTML = this.playlist.map((track, index) => `
      <div class="playlist-item ${index === this.currentTrackIndex ? 'playing' : ''}" data-index="${index}">
        <span>${index === this.currentTrackIndex ? '▶' : '🎵'}</span>
        <span class="playlist-item-title">${track.title}</span>
        <div class="playlist-item-controls">
          <button data-action="up" data-index="${index}" ${index === 0 ? 'disabled' : ''}>↑</button>
          <button data-action="down" data-index="${index}" ${index === this.playlist.length - 1 ? 'disabled' : ''}>↓</button>
          <button data-action="remove" data-index="${index}">×</button>
        </div>
      </div>
    `).join('');
    
    this.playlistContent.querySelectorAll('.playlist-item').forEach(el => {
      el.addEventListener('click', e => {
        const index = parseInt(el.dataset.index);
        const action = e.target.dataset.action;
        if (action === 'up') {
          this.moveTrack(index, -1);
          this.rogerSay("Track moved up. Vibe reordered!", 2);
        } else if (action === 'down') {
          this.moveTrack(index, 1);
          this.rogerSay("Track moved down. Vibe reordered!", 2);
        } else if (action === 'remove') {
          this.removeTrack(index);
          this.rogerSay("Track removed. Playlist streamlined.", 2);
        } else {
          this.playTrack(index);
        }
      });
    });
  }

  moveTrack(index, direction) {
    if (direction === -1 && index === 0) return;
    if (direction === 1 && index === this.playlist.length - 1) return;
    const newIndex = index + direction;
    [this.playlist[index], this.playlist[newIndex]] = [this.playlist[newIndex], this.playlist[index]];
    if(this.currentTrackIndex === index) this.currentTrackIndex = newIndex;
    else if(this.currentTrackIndex === newIndex) this.currentTrackIndex = index;
    this.renderPlaylist();
  }

  removeTrack(index) {
    this.playlist.splice(index, 1);
    if(this.currentTrackIndex === index) {
      this.playTrack(index % this.playlist.length);
    } else if (this.currentTrackIndex > index) {
      this.currentTrackIndex--;
    }
    this.renderPlaylist();
  }

  formatTime(s) { return new Date(s * 1000).toISOString().substr(14, 5); }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      this.rogerSay("Fullscreen on. Vibe maximized!", 3);
    } else {
      document.exitFullscreen();
      this.rogerSay("Fullscreen off. Back to chill.", 3);
    }
  }
}

let hubInstance;
function loadMedia(type, src, title) { hubInstance.loadMedia(type, src, title); }
function toggleFullscreen() { hubInstance.toggleFullscreen(); }

document.addEventListener('DOMContentLoaded', () => {
  hubInstance = new POPSMediaHub();
});
