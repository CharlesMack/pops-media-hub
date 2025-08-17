// hub.js
class Roger {
  constructor() {
    this.dripPoints = parseInt(localStorage.getItem('dripPoints')) || 0;
    this.leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [
      { name: '@mackcwm', points: this.dripPoints }
    ];
    this.output = document.getElementById('rogerOutput');
    this.mediaOutput = document.getElementById('mediaOutput');
    this.updateLeaderboard();
  }

  say(text) {
    this.output.textContent = text;
    this.addDripPoints(2);
  }

  askGrok() {
    this.say("Grok API coming soon. Here's some neon art for now.");
    const img = document.createElement('img');
    img.src = 'https://picsum.photos/800/400?random=1';
    img.alt = 'Neon art';
    img.style.maxWidth = '100%';
    this.mediaOutput.innerHTML = '';
    this.mediaOutput.appendChild(img);
    this.addDripPoints(3);
  }

  generatePlaylist() {
    this.say("Generated a Grok-inspired playlist!");
    const audio = document.createElement('audio');
    audio.controls = true;
    audio.src = 'https://www.soundjay.com/button/beep-07.wav';
    this.mediaOutput.innerHTML = '';
    this.mediaOutput.appendChild(audio);
    this.addDripPoints(3);
  }

  addDripPoints(points) {
    this.dripPoints += points;
    localStorage.setItem('dripPoints', this.dripPoints);
    this.updateLeaderboard();
  }

  updateLeaderboard() {
    const dripDisplay = document.getElementById('dripPoints');
    const list = document.getElementById('leaderboardList');
    dripDisplay.textContent = this.dripPoints;

    this.leaderboard[0].points = this.dripPoints;
    localStorage.setItem('leaderboard', JSON.stringify(this.leaderboard));

    list.innerHTML = this.leaderboard
      .sort((a, b) => b.points - a.points)
      .slice(0, 5)
      .map(item => `<div class="leaderboard-item">${item.name} - ${item.points} Drip</div>`)
      .join('');
  }
}

const roger = new Roger();
