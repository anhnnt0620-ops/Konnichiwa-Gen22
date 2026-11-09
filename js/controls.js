// Controls and Mobile Input Manager
class ControlsManager {
  constructor() {
    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false,
      action: false
    };

    this.touchActive = false;
    this.init();
  }

  init() {
    this.setupKeyboard();
    this.setupTouchControls();
    this.setupOrientationHandler();
  }

  setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      const code = e.code;
      if (code === 'ArrowUp' || code === 'KeyW') this.keys.up = true;
      if (code === 'ArrowDown' || code === 'KeyS') this.keys.down = true;
      if (code === 'ArrowLeft' || code === 'KeyA') this.keys.left = true;
      if (code === 'ArrowRight' || code === 'KeyD') this.keys.right = true;
      if (code === 'Space' || code === 'KeyE' || code === 'Enter') {
        this.keys.action = true;
        if (window.gameInstance) window.gameInstance.handleAction();
      }
      if (code === 'KeyM') {
        if (window.gameInstance) window.gameInstance.toggleMemoryBook();
      }
    });

    window.addEventListener('keyup', (e) => {
      const code = e.code;
      if (code === 'ArrowUp' || code === 'KeyW') this.keys.up = false;
      if (code === 'ArrowDown' || code === 'KeyS') this.keys.down = false;
      if (code === 'ArrowLeft' || code === 'KeyA') this.keys.left = false;
      if (code === 'ArrowRight' || code === 'KeyD') this.keys.right = false;
      if (code === 'Space' || code === 'KeyE' || code === 'Enter') this.keys.action = false;
    });
  }

  setupTouchControls() {
    const bindBtn = (id, keyName) => {
      const btn = document.getElementById(id);
      if (!btn) return;

      const onPress = (e) => {
        e.preventDefault();
        this.keys[keyName] = true;
        btn.classList.add('active');
        if (keyName === 'action' && window.gameInstance) {
          window.gameInstance.handleAction();
        }
      };

      const onRelease = (e) => {
        e.preventDefault();
        this.keys[keyName] = false;
        btn.classList.remove('active');
      };

      btn.addEventListener('touchstart', onPress, { passive: false });
      btn.addEventListener('touchend', onRelease, { passive: false });
      btn.addEventListener('mousedown', onPress);
      btn.addEventListener('mouseup', onRelease);
      btn.addEventListener('mouseleave', onRelease);
    };

    bindBtn('btn-up', 'up');
    bindBtn('btn-down', 'down');
    bindBtn('btn-left', 'left');
    bindBtn('btn-right', 'right');
    bindBtn('btn-action', 'action');

    // Memory Book button
    const bookBtn = document.getElementById('btn-memory');
    if (bookBtn) {
      bookBtn.addEventListener('click', () => {
        if (window.gameInstance) window.gameInstance.toggleMemoryBook();
      });
    }

    // Sound toggle button
    const soundBtn = document.getElementById('btn-sound');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        if (window.audioManager) {
          const isMuted = window.audioManager.toggleMute();
          soundBtn.textContent = isMuted ? '🔇' : '🔊';
        }
      });
    }

    // Fullscreen toggle button
    const fsBtn = document.getElementById('btn-fullscreen');
    if (fsBtn) {
      fsBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      });
    }
  }

  setupOrientationHandler() {
    const checkOrientation = () => {
      const overlay = document.getElementById('orientation-overlay');
      if (!overlay) return;

      // On mobile devices, check if portrait
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 850;
      if (isMobile && window.innerHeight > window.innerWidth) {
        overlay.classList.remove('hidden');
      } else {
        overlay.classList.add('hidden');
      }

      if (window.gameInstance) {
        window.gameInstance.resizeCanvas();
      }
    };

    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', () => {
      setTimeout(checkOrientation, 300);
    });
    checkOrientation();
  }
}

window.controlsManager = new ControlsManager();

