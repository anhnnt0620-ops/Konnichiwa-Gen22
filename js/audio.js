// Audio Manager using Web Audio API for 8-bit retro sound effects & background music
class AudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.bgmPlaying = false;
    this.currentTrack = null;
    this.bgmInterval = null;
    this.tempo = 120;
    this.stepIndex = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBGM();
    } else {
      if (this.currentTrack) {
        this.playBGM(this.currentTrack);
      }
    }
    return this.isMuted;
  }

  // Play a single retro tone
  playTone(freq, type = 'square', duration = 0.1, gainVal = 0.1, decay = true) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      if (decay) {
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      } else {
        gain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      }

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio playTone error', e);
    }
  }

  // Dialogue typewriter blip
  playBlip() {
    const pitch = 380 + Math.random() * 80;
    this.playTone(pitch, 'triangle', 0.04, 0.04);
  }

  // Interaction footstep
  playStep() {
    this.playTone(120, 'sine', 0.03, 0.02);
  }

  // Item pickup chime
  playCollect() {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.15, 0.08);
      }, idx * 70);
    });
  }

  // Minigame hit sound
  playHit(isGood = true) {
    if (isGood) {
      this.playTone(880, 'triangle', 0.1, 0.08);
    } else {
      this.playTone(160, 'sawtooth', 0.15, 0.06);
    }
  }

  // Stage clear fanfare
  playFanfare() {
    const notes = [
      { f: 523.25, d: 0.12 }, // C5
      { f: 659.25, d: 0.12 }, // E5
      { f: 783.99, d: 0.12 }, // G5
      { f: 1046.50, d: 0.35 } // C6
    ];
    let time = 0;
    notes.forEach(n => {
      setTimeout(() => {
        this.playTone(n.f, 'triangle', n.d, 0.1);
      }, time * 1000);
      time += n.d;
    });
  }

  // Firework boom & sparkle
  playFirework() {
    this.playTone(90, 'triangle', 0.25, 0.15);
    setTimeout(() => {
      for (let i = 0; i < 4; i++) {
        setTimeout(() => {
          this.playTone(1200 + Math.random() * 800, 'sine', 0.08, 0.04);
        }, i * 40);
      }
    }, 150);
  }

  // Background Music Synthesizer
  // Melodies inspired by Japanese pentatonic scales (Miyako-bushi / Yo scale)
  playBGM(trackName) {
    this.currentTrack = trackName;
    if (this.isMuted) return;
    this.init();
    this.stopBGM();

    let notes = [];
    let speed = 240; // ms per note

    if (trackName === 'stage1') {
      // Khai Nhãn - Calm night, introspective
      notes = [
        329.63, 0, 392.00, 440.00, 0, 493.88, 392.00, 0,
        329.63, 392.00, 440.00, 0, 587.33, 493.88, 0, 0
      ];
      speed = 300;
    } else if (trackName === 'stage2') {
      // Hòa Nhịp - Upbeat, friendly, rhythmic
      notes = [
        440.00, 493.88, 523.25, 0, 659.25, 523.25, 493.88, 440.00,
        392.00, 440.00, 493.88, 0, 523.25, 659.25, 783.99, 0
      ];
      speed = 220;
    } else if (trackName === 'stage3_1') {
      // Phá Phong - Energetic teamwork
      notes = [
        523.25, 587.33, 659.25, 587.33, 783.99, 659.25, 587.33, 523.25,
        659.25, 783.99, 880.00, 783.99, 1046.50, 880.00, 783.99, 659.25
      ];
      speed = 190;
    } else if (trackName === 'stage3_2') {
      // Chân Diện - Emotional sunset, heartfelt
      notes = [
        392.00, 0, 440.00, 523.25, 0, 587.33, 0, 659.25,
        587.33, 523.25, 440.00, 0, 392.00, 440.00, 329.63, 0
      ];
      speed = 320;
    } else if (trackName === 'stage_final') {
      // Finale - Grand celebratory festival & sakura petals
      notes = [
        523.25, 659.25, 783.99, 659.25, 880.00, 783.99, 1046.50, 0,
        1046.50, 880.00, 783.99, 659.25, 783.99, 880.00, 1046.50, 1318.51
      ];
      speed = 200;
    } else {
      // Main title theme
      notes = [
        440.00, 0, 523.25, 587.33, 659.25, 0, 587.33, 523.25,
        440.00, 392.00, 440.00, 0, 523.25, 587.33, 440.00, 0
      ];
      speed = 280;
    }

    this.bgmPlaying = true;
    let idx = 0;
    this.bgmInterval = setInterval(() => {
      if (!this.bgmPlaying || this.isMuted) return;
      const freq = notes[idx % notes.length];
      if (freq > 0) {
        this.playTone(freq, 'sine', speed / 1000 * 0.8, 0.035, false);
        // Add soft bass harmony
        if (idx % 4 === 0) {
          this.playTone(freq / 2, 'triangle', speed / 1000 * 1.5, 0.03, true);
        }
      }
      idx++;
    }, speed);
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

window.audioManager = new AudioManager();

