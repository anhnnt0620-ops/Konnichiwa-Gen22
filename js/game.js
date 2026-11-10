// Main Game Engine for JPC FTU (FTU Club Day - FCD)
class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = true;

    this.playerName = 'Kouhai Gen 22';
    this.currentStageId = 'stage1';
    this.stage = STAGE_DATA['stage1'];

    // Player State (Starts at Chùa Láng Gate)
    this.player = {
      x: 11 * 32,
      y: 38 * 32,
      speed: 3.4,
      direction: 'up',
      animFrame: 0,
      animTimer: 0,
      isMoving: false,
      width: 24,
      height: 28,
      selectedDept: 'chuyenmon',
      selectedDeptName: 'Ban Chuyên Môn'
    };

    // Preload 5 Kokeshi Doll Images for 5 Departments
    this.kokeshiImages = {
      chuyenmon: new Image(),
      doingoai: new Image(),
      tochuc: new Image(),
      thongtin: new Image(),
      nhansu: new Image()
    };
    this.kokeshiImages.chuyenmon.src = 'Image/Kokeshi 5 Ban/kokeshi-chuyenmon.png';
    this.kokeshiImages.doingoai.src = 'Image/Kokeshi 5 Ban/kokeshi-doingoai.png';
    this.kokeshiImages.tochuc.src = 'Image/Kokeshi 5 Ban/kokeshi-tochuc.png';
    this.kokeshiImages.thongtin.src = 'Image/Kokeshi 5 Ban/kokeshi-thongtin.png';
    this.kokeshiImages.nhansu.src = 'Image/Kokeshi 5 Ban/kokeshi-nhansu.png';

    // Preload Kokeshi Senpai Doll Image
    this.senpaiImage = new Image();
    this.senpaiImage.src = 'Image/kokeshi-senpai.png';

    // Camera & Zoom
    this.camera = { x: 0, y: 0 };
    this.zoom = 1.65;
    this.guideAngle = undefined;

    // Stage progression state
    this.stageProgress = {
      stage1: { formSubmitted: false, completed: false },
      stage2: { talkedToAll: false, synced: false, completed: false },
      stage3_1: { teamworkDone: false, completed: false },
      stage3_2: { interviewDone: false, completed: false },
      stage_final: { celebrationStarted: false }
    };

    // Unlocked Memories Book & Stage Progress Saves
    this.memories = [];
    this.unlockedStages = ['stage1'];
    this.completedStages = [];
    this.SAVE_KEY = 'jpc_gen22_save_v1';

    // Particles (Sakura petals, fireworks)
    this.particles = [];
    this.fireworks = [];

    this.isRunning = false;
    this.lastTime = 0;
    this.nearbyInteractable = null;

    this.init();
  }

  init() {
    window.gameInstance = this;
    this.resizeCanvas();
    this.initParticles();
    this.setupImageLightbox();
    this.setupToast();
    this.setupCanteenModal();
    this.setupBiaDaModal();
    this.setupVideoModal();
    this.setupStartScreen();
    this.setupCanvasInteraction();
    this.setupApplicationForm();
    this.setupCelebrationModal();
    this.setupQuestDetailModal();
    this.setupTransitionModal();
  }

  setupCanvasInteraction() {
    const handleTap = (clientX, clientY) => {
      // If dialogue is active, advance dialogue
      if (window.dialogueManager && window.dialogueManager.active) {
        window.dialogueManager.advance();
        return;
      }

      // Convert screen coordinates to world coordinates (with camera zoom)
      const rect = this.canvas.getBoundingClientRect();
      const screenX = (clientX - rect.left) / this.zoom;
      const screenY = (clientY - rect.top) / this.zoom;
      const worldX = screenX + this.camera.x;
      const worldY = screenY + this.camera.y;

      // Check click on NPCs
      if (this.stage && this.stage.npcs) {
        for (const npc of this.stage.npcs) {
          const nx = npc.x * 32 + 16;
          const ny = npc.y * 32 + 16;
          if (Math.hypot(worldX - nx, worldY - ny) < 65) {
            this.nearbyInteractable = { type: 'npc', data: npc };
            this.handleAction();
            return;
          }
        }
      }

      // Check click on Booth JPC (Sân Trung Tâm x: 15*32, y: 22*32)
      if (this.currentStageId === 'stage1') {
        const jpcCenterX = 15 * 32;
        const jpcCenterY = 22 * 32 + 16;
        if (Math.abs(worldX - jpcCenterX) < 70 && Math.abs(worldY - jpcCenterY) < 70) {
          this.nearbyInteractable = {
            type: 'booth_jpc',
            data: { name: 'Gian Trại CLB Tiếng Nhật JPC' }
          };
          this.handleAction();
          return;
        }
      }

      // Check click on Canteen (col 3..12, row 2..6)
      if (worldX >= 3 * 32 && worldX <= 12 * 32 && worldY >= 2 * 32 && worldY <= 6 * 32) {
        this.nearbyInteractable = { type: 'canteen', data: { name: 'Canteen FTU' } };
        this.handleAction();
        return;
      }

      // Check click on Bia Đá FTU (col 28, row 22)
      if (Math.hypot(worldX - 28 * 32, worldY - 22 * 32) < 65) {
        this.nearbyInteractable = { type: 'biada', data: { name: 'Bia Đá FTU' } };
        this.handleAction();
        return;
      }

      // Check click on Sân khấu FCD (STAGE 1 ONLY · col 48..53, row 17..25)
      if (this.currentStageId === 'stage1') {
        if (worldX >= 47 * 32 && worldX <= 54 * 32 && worldY >= 16 * 32 && worldY <= 26 * 32) {
          this.nearbyInteractable = { type: 'stage_fcd', data: { name: 'Sân khấu FCD' } };
          this.handleAction();
          return;
        }
      }

      // If clicked near player or floating prompt:
      if (this.nearbyInteractable) {
        this.handleAction();
      }
    };

    this.canvas.addEventListener('click', (e) => {
      handleTap(e.clientX, e.clientY);
    });

    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches[0]) {
        handleTap(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });
  }

  calculateZoom() {
    const h = this.canvas.height / (this.dpr || 1);
    if (h <= 450) {
      return 1.45;
    } else if (h <= 650) {
      return 1.6;
    } else {
      return 1.7;
    }
  }

  resizeCanvas() {
    const container = document.getElementById('game-container');
    const w = (container && container.clientWidth) ? container.clientWidth : window.innerWidth;
    const h = (container && container.clientHeight) ? container.clientHeight : window.innerHeight;

    // High-DPI hardware pixel matching (Retina / 125% - 150% Windows scaling)
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = Math.round(w * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';

    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    this.zoom = this.calculateZoom();
  }

  /* ==========================================================================
     IMAGE LIGHTBOX / ZOOM POPUP (Phóng to ảnh minigame & kỷ vật)
     ========================================================================== */
  setupImageLightbox() {
    window.openImageLightbox = (src, caption = '') => {
      const modal = document.getElementById('image-lightbox-modal');
      const img = document.getElementById('lightbox-img');
      const cap = document.getElementById('lightbox-caption');
      if (!modal || !img) return;
      img.src = src;
      if (cap) {
        cap.textContent = caption;
        cap.style.display = caption ? 'block' : 'none';
      }
      modal.classList.remove('hidden');
      if (window.audioManager) window.audioManager.playBlip();
    };

    window.closeImageLightbox = (e) => {
      if (e && e.target && e.target.classList.contains('lightbox-content-box')) return;
      const modal = document.getElementById('image-lightbox-modal');
      if (modal) modal.classList.add('hidden');
    };

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('image-lightbox-modal');
        if (modal && !modal.classList.contains('hidden')) {
          modal.classList.add('hidden');
        }
      }
    });
  }

  /* ==========================================================================
     TOAST NOTIFICATION (Thông báo lưu tiến độ / trạng thái)
     ========================================================================== */
  setupToast() {
    window.showToast = (msg, duration = 3200) => {
      const toast = document.getElementById('game-toast');
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.add('show');
      if (this.toastTimeout) clearTimeout(this.toastTimeout);
      this.toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
      }, duration);
    };
  }

  /* ==========================================================================
     GAME SAVE & RESUME SYSTEM (Lưu tiến độ theo từng Hội Trát)
     ========================================================================== */
  saveGameState(isManual = false) {
    try {
      const saveData = {
        version: '1.0',
        playerName: this.playerName,
        selectedDept: this.player.selectedDept,
        selectedDeptName: this.player.selectedDeptName,
        currentStageId: this.currentStageId,
        unlockedStages: this.unlockedStages,
        completedStages: this.completedStages,
        stageProgress: this.stageProgress,
        memories: this.memories,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
      if (isManual && window.showToast) {
        window.showToast('💾 Đã lưu tiến độ chơi thành công!');
      }
    } catch (err) {
      console.warn('Could not save game state to localStorage:', err);
    }
  }

  loadSavedGameState() {
    try {
      const raw = localStorage.getItem(this.SAVE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      console.warn('Failed to parse save game state:', err);
      return null;
    }
  }

  continueSavedGame() {
    const saved = this.loadSavedGameState();
    if (!saved) return;

    if (saved.playerName) this.playerName = saved.playerName;
    if (saved.selectedDept) {
      this.player.selectedDept = saved.selectedDept;
      this.player.selectedDeptName = saved.selectedDeptName || 'Ban Chuyên Môn';
    }
    if (Array.isArray(saved.unlockedStages)) {
      this.unlockedStages = saved.unlockedStages;
    }
    if (Array.isArray(saved.completedStages)) {
      this.completedStages = saved.completedStages;
    }
    if (saved.stageProgress) {
      this.stageProgress = Object.assign(this.stageProgress, saved.stageProgress);
    }
    if (Array.isArray(saved.memories)) {
      this.memories = saved.memories;
    }

    const titleScreen = document.getElementById('title-screen');
    if (titleScreen) titleScreen.classList.add('hidden');

    this.isRunning = true;
    const stageToLoad = saved.currentStageId || 'stage1';
    this.loadStage(stageToLoad, true);

    if (window.audioManager) {
      window.audioManager.init();
      window.audioManager.playBGM(this.stage?.bgm || stageToLoad);
    }
    this.updateHUD();

    if (window.showToast) {
      const stageName = STAGE_DATA[stageToLoad]?.name || stageToLoad;
      window.showToast(`🌸 Chào mừng trở lại, ${this.playerName}! Tiếp tục: ${stageName}`);
    }

    requestAnimationFrame(this.gameLoop.bind(this));
  }

  replayStage(stageId) {
    if (!this.unlockedStages.includes(stageId)) {
      if (window.showToast) window.showToast('⚠️ Màn chơi này chưa được mở khóa!');
      return;
    }

    const memoryModal = document.getElementById('memory-modal');
    if (memoryModal) memoryModal.classList.add('hidden');

    this.loadStage(stageId, true);
    if (window.audioManager) {
      window.audioManager.playBGM(this.stage?.bgm || stageId);
    }
    this.updateHUD();

    const stageName = STAGE_DATA[stageId]?.name || stageId;
    if (window.showToast) {
      window.showToast(`▶ Đang chơi lại: ${stageName}`);
    }
  }

  resetSaveData() {
    const confirmReset = window.confirm('Bạn có chắc muốn xóa tiến độ đã lưu và bắt đầu lại từ đầu không?');
    if (confirmReset) {
      try {
        localStorage.removeItem(this.SAVE_KEY);
      } catch (e) {}
      window.location.reload();
    }
  }

  setupStartScreen() {
    const startBtn = document.getElementById('btn-start-game');
    const continueBtn = document.getElementById('btn-continue-game');
    const continueMeta = document.getElementById('continue-game-meta');
    const nameInput = document.getElementById('input-player-name');
    const titleScreen = document.getElementById('title-screen');
    const kokeshiCards = document.querySelectorAll('.kokeshi-card');

    // Check for saved game progress
    const saved = this.loadSavedGameState();
    if (saved && saved.currentStageId) {
      if (continueBtn) {
        continueBtn.classList.remove('hidden');
        continueBtn.addEventListener('click', () => {
          this.continueSavedGame();
        });
      }
      if (startBtn) {
        startBtn.classList.add('has-continue');
      }
      if (continueMeta) {
        continueMeta.classList.remove('hidden');
        const savedStageName = STAGE_DATA[saved.currentStageId]?.name || 'Hội Trát 1: Khai Nhãn';
        const saveTime = saved.lastSaved ? new Date(saved.lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
        continueMeta.innerHTML = `💾 <b>Tiến độ đã lưu:</b> ${saved.playerName || 'Kouhai'} (${saved.selectedDeptName || 'Chưa chọn ban'}) • ${savedStageName} ${saveTime ? '• ' + saveTime : ''}`;
      }

      // Pre-select previously saved Kokeshi & player name
      if (saved.selectedDept) {
        kokeshiCards.forEach(c => {
          if (c.dataset.dept === saved.selectedDept) {
            c.classList.add('active');
            const activeTag = c.querySelector('.kokeshi-tag');
            if (activeTag) activeTag.textContent = 'ĐÃ CHỌN';
            this.player.selectedDept = saved.selectedDept;
            this.player.selectedDeptName = saved.selectedDeptName;
          } else {
            c.classList.remove('active');
            const tag = c.querySelector('.kokeshi-tag');
            if (tag) tag.textContent = 'CHỌN';
          }
        });
      }
      if (saved.playerName && nameInput) {
        nameInput.value = saved.playerName;
      }
    } else {
      if (continueBtn) continueBtn.classList.add('hidden');
      if (continueMeta) continueMeta.classList.add('hidden');
      if (startBtn) startBtn.classList.remove('has-continue');
    }

    // Handle Kokeshi Selection for 5 Departments
    kokeshiCards.forEach(card => {
      card.addEventListener('click', () => {
        kokeshiCards.forEach(c => {
          c.classList.remove('active');
          const tag = c.querySelector('.kokeshi-tag');
          if (tag) tag.textContent = 'CHỌN';
        });
        card.classList.add('active');
        const activeTag = card.querySelector('.kokeshi-tag');
        if (activeTag) activeTag.textContent = 'ĐÃ CHỌN';

        this.player.selectedDept = card.dataset.dept;
        this.player.selectedDeptName = card.dataset.deptName;

        if (window.audioManager) {
          window.audioManager.playBlip();
        }
      });
    });

    startBtn.addEventListener('click', () => {
      if (nameInput && nameInput.value.trim()) {
        this.playerName = nameInput.value.trim();
      }
      titleScreen.classList.add('hidden');
      this.startGame();
    });
  }

  startGame() {
    this.isRunning = true;
    this.loadStage('stage1', true);
    if (window.audioManager) {
      window.audioManager.init();
      window.audioManager.playBGM('stage1');
    }
    this.updateHUD();

    // Opening: Bác Bảo Vệ greets user at Cổng Chùa Láng (uses dialogues defined in stage1.npcs)
    setTimeout(() => {
      const guardNpc = this.stage?.npcs?.find(n => n.id === 'npc_guard');
      const openingDialogues = guardNpc?.dialogues || [
        { speaker: 'Bác Bảo Vệ FTU', text: 'Chào mừng cháu đến với Trường Đại học Ngoại Thương!' },
        { speaker: 'Bác Bảo Vệ FTU', text: 'Hôm nay 18/10, tại FTU diễn ra Ngày hội các Câu lạc bộ - FTU Club\'s Day (FCD) rộn ràng lắm đấy!' },
        { speaker: 'Bác Bảo Vệ FTU', text: 'Cháu đi thẳng qua Cổng chào Ngày hội, đối diện FTU Shop sẽ thấy Bàn Check-in FCD nhé. Hãy tới đó check-in lấy thẻ tham gia hội chợ nha!' }
      ];
      window.dialogueManager.startDialogue(openingDialogues);
    }, 400);

    requestAnimationFrame(this.gameLoop.bind(this));
  }

  setupApplicationForm() {
    const appModal = document.getElementById('application-modal');
    const appForm = document.getElementById('jpc-application-form');
    const cancelBtn = document.getElementById('btn-cancel-form');
    const rewardModal = document.getElementById('reward-modal');
    const closeRewardBtn = document.getElementById('btn-close-reward');
    const applicantNameInput = document.getElementById('form-fullname');

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        appModal.classList.add('hidden');
      });
    }

    if (appForm) {
      appForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const fullName = applicantNameInput.value.trim() || this.playerName;
        this.playerName = fullName;

        if (window.audioManager) window.audioManager.playFanfare();
        appModal.classList.add('hidden');

        // Show Reward Popup with Vòng 1 frame
        document.getElementById('reward-applicant-name').textContent = fullName;
        rewardModal.classList.remove('hidden');

        this.stageProgress.stage1.completed = true;
        if (!this.completedStages.includes('stage1')) {
          this.completedStages.push('stage1');
        }
        if (!this.unlockedStages.includes('stage2')) {
          this.unlockedStages.push('stage2');
        }
        this.saveGameState(false);
        this.addMemory(
          'Hội trát 1: Khai Nhãn (01/10 – 20/10)',
          `Đã nộp đơn tại Gian Trại JPC (Sân Trung Tâm FTU · FCD 18/10) — Chúc mừng ${fullName} bước vào Vòng 2!`,
          'Image/Color/Vòng 1 - Color.png'
        );

        this.triggerConfetti();
      });
    }

    if (closeRewardBtn) {
      closeRewardBtn.addEventListener('click', () => {
        rewardModal.classList.add('hidden');
        this.showTransitionScreen('stage2');
      });
    }
  }

  setupQuestDetailModal() {
    const questCard = document.getElementById('quest-hud-card');
    const openBtn = document.getElementById('btn-open-quest-detail');
    const modal = document.getElementById('quest-detail-modal');
    const closeBtn = document.getElementById('btn-close-quest-detail');

    const openModal = () => {
      if (!this.stage) return;
      const bElem = document.getElementById('modal-quest-badge');
      const tElem = document.getElementById('modal-quest-title');
      const tlElem = document.getElementById('modal-quest-timeline');
      const oElem = document.getElementById('modal-quest-objective');
      const lElem = document.getElementById('modal-quest-location');
      const tipElem = document.getElementById('modal-quest-tip');

      if (bElem) bElem.textContent = this.stage.questTitle || this.stage.name;
      if (tElem) tElem.textContent = this.stage.name;
      if (tlElem) tlElem.textContent = `📅 Thời gian: ${this.stage.timeline || 'Tuyển Gen 22'}`;
      if (oElem) oElem.textContent = this.stage.objective || this.stage.questText;
      if (lElem) lElem.textContent = this.stage.location || 'Khuôn viên Trường ĐH Ngoại Thương FTU';
      if (tipElem) tipElem.textContent = this.stage.tip || 'Đi theo vệt hoa anh đào dưới chân Kokeshi để đến đúng đích!';

      if (modal) modal.classList.remove('hidden');
      if (window.audioManager) window.audioManager.playBlip();
    };

    if (questCard) questCard.addEventListener('click', openModal);
    if (openBtn) {
      openBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openModal();
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
      });
    }
  }

  setupTransitionModal() {
    const proceedBtn = document.getElementById('btn-transition-proceed');
    if (proceedBtn) {
      proceedBtn.addEventListener('click', () => {
        const transModal = document.getElementById('transition-modal');
        if (transModal) transModal.classList.add('hidden');
        if (this.nextTransitionStage) {
          const next = this.nextTransitionStage;
          this.nextTransitionStage = null;
          this.loadStage(next);
        }
      });
    }
  }

  showTransitionScreen(targetStageId) {
    this.nextTransitionStage = targetStageId;
    const transModal = document.getElementById('transition-modal');
    if (!transModal) {
      this.loadStage(targetStageId);
      return;
    }

    const titleElem = document.getElementById('transition-title');
    const subElem = document.getElementById('transition-sub');
    const descElem = document.getElementById('transition-desc');
    const proceedBtn = document.getElementById('btn-transition-proceed');

    if (targetStageId === 'stage2') {
      if (titleElem) titleElem.textContent = 'VÀI NGÀY SAU ĐÓ...';
      if (subElem) subElem.textContent = 'Ngày 23 tháng 10 năm 2026';
      if (descElem) {
        descElem.innerHTML = `
          Sau những ngày ngóng trông hồi hộp, lá đơn của bạn đã xuất sắc chinh phục được Hội đồng tuyển sinh JPC.<br>
          Chào mừng <b>${this.playerName}</b> chính thức bước tiếp vào <b>Vòng 2: Hòa Nhịp (Phỏng Vấn Online)</b>!
        `;
      }
      if (proceedBtn) proceedBtn.textContent = 'BƯỚC VÀO PHÒNG PHỎNG VẤN ONLINE ▶';
    }

    if (window.audioManager) window.audioManager.playFanfare();
    transModal.classList.remove('hidden');
  }

  openApplicationForm() {
    const appModal = document.getElementById('application-modal');
    const nameInput = document.getElementById('form-fullname');
    const deptSelect = document.getElementById('form-dept');
    if (nameInput) nameInput.value = this.playerName;
    if (deptSelect && this.player.selectedDeptName) {
      deptSelect.value = this.player.selectedDeptName;
    }
    if (appModal) appModal.classList.remove('hidden');
  }

  loadStage(stageId, isInitial = false) {
    this.currentStageId = stageId;
    this.stage = STAGE_DATA[stageId];
    if (!this.stage) return;

    if (!this.unlockedStages.includes(stageId)) {
      this.unlockedStages.push(stageId);
    }
    this.saveGameState(false);

    if (stageId === 'stage1') {
      this.stage1CheckedIn = false;
      this.stage1MetSenpai = false;
      if (this.stage) {
        this.stage.questSpot = { x: 13.8 * 32, y: 29.8 * 32 };
        this.stage.questText = 'Đến Bàn Check-in FCD đối diện FTU Shop để nhận thẻ ngày hội!';
      }
    }

    if (isInitial && this.stage.playerStart) {
      this.player.x = this.stage.playerStart.x * 32;
      this.player.y = this.stage.playerStart.y * 32;
      this.player.direction = 'up';
    }

    // Switch BGM
    if (window.audioManager) {
      window.audioManager.playBGM(this.stage.bgm);
    }

    this.updateHUD();

    // Trigger stage opening dialogue
    if (stageId === 'stage2') {
      window.dialogueManager.startDialogue([
        {
          speaker: 'Hội Trát 2: Hòa Nhịp',
          text: 'Chúc mừng em đã xuất sắc vượt qua Vòng Đơn! Chào mừng em đến với Hội trát 2: Hòa Nhịp (Vòng Phỏng Vấn Nhóm 23/10 – 25/10)!'
        },
        {
          speaker: 'Người Dẫn Chuyện',
          text: 'Hãy đi theo vệt hoa anh đào chỉ đường dưới chân lên Tòa B, gặp Senpai để mở máy tính tham gia phỏng vấn online nhé!'
        }
      ]);
    } else if (stageId === 'stage3_1') {
      window.dialogueManager.startDialogue([
        {
          speaker: 'Hội Trát 3.1: Phá Phong',
          text: 'Chúc mừng bạn bước vào Vòng Teamwork: Phá Phong (27/10 – 03/11)!'
        },
        {
          speaker: 'Người Dẫn Chuyện',
          text: 'Hãy đi theo vệt hoa anh đào đến Dốc Nhà B huyền thoại, gặp Trưởng Nhóm để cùng bứt phá giới hạn deadline và chuẩn bị Pitching (04-05/11)!'
        }
      ]);
    } else if (stageId === 'stage3_2') {
      window.dialogueManager.startDialogue([
        {
          speaker: 'Hội Trát 3.2: Chân Diện',
          text: 'Chào mừng bạn đến với Trường VJCBI — Vòng Phỏng Vấn Cá Nhân: Chân Diện (08/11 – 09/11).'
        },
        {
          speaker: 'Người Dẫn Chuyện',
          text: 'Ánh hoàng hôn buông xuống ấm áp qua rèm Shoji. Hãy bước vào Viện VJCBI và mở lòng đối thoại cùng Ban Điều Hành.'
        }
      ]);
    } else if (stageId === 'stage_final') {
      window.dialogueManager.startDialogue([
        {
          speaker: 'JPC FTU',
          text: `Khoảnh khắc vinh quang đã tới! Chào mừng tân FTUer ${this.playerName} đến với Sân khấu FCD rợp bóng hoa anh đào!`
        },
        {
          speaker: 'Người Dẫn Chuyện',
          text: 'Hãy bước tới Sân khấu FCD cạnh Nhà D để đón nhận sự chúc mừng từ 5 Ban và Chủ Nhiệm JPC!'
        }
      ]);
      this.triggerConfetti();
    }
  }

  updateHUD() {
    const badge = document.getElementById('hud-badge');
    const playerTag = document.getElementById('hud-player-tag');
    const questBadge = document.getElementById('quest-badge');
    const questDate = document.getElementById('quest-date');
    const questHudName = document.getElementById('quest-hud-name');

    const stageMap = {
      stage1: { badge: 'FTU CLUB DAY · GEN 22', qBadge: 'VÒNG 1', date: '01/10 – 20/10' },
      stage2: { badge: 'PHỎNG VẤN ONLINE', qBadge: 'VÒNG 2', date: '23/10 – 25/10' },
      stage3_1: { badge: 'TEAMWORK & PITCHING', qBadge: 'VÒNG 3.1', date: '27/10 – 03/11' },
      stage3_2: { badge: 'PHỎNG VẤN CÁ NHÂN', qBadge: 'VÒNG 3.2', date: '08/11 – 09/11' },
      stage_final: { badge: 'CHÍNH THỨC GEN 22', qBadge: 'KẾT NẠP', date: 'THÀNH VIÊN' }
    };

    const cur = stageMap[this.currentStageId] || { badge: 'JPC FTU', qBadge: 'NHIỆM VỤ', date: 'GEN 22' };
    if (badge) badge.textContent = cur.badge;
    if (playerTag) {
      const deptShort = this.player.selectedDeptName || 'JPC FTU';
      playerTag.textContent = `🌸 ${this.playerName} · ${deptShort}`;
    }
    if (questBadge) questBadge.textContent = cur.qBadge;
    if (questDate) questDate.textContent = cur.date;
    if (questHudName) questHudName.textContent = this.stage ? (this.stage.questTitle || this.stage.name) : 'Hành trình JPC';
  }

  // Sakura petals particle system
  initParticles() {
    this.particles = [];
    for (let i = 0; i < 40; i++) {
      this.particles.push({
        x: Math.random() * 800,
        y: Math.random() * 600,
        size: 3 + Math.random() * 4,
        speedX: 0.5 + Math.random() * 1.2,
        speedY: 0.8 + Math.random() * 1.5,
        swing: Math.random() * Math.PI * 2,
        swingSpeed: 0.03 + Math.random() * 0.03,
        color: Math.random() > 0.3 ? '#ffb7c5' : '#ffccd5'
      });
    }
  }

  updateParticles() {
    this.particles.forEach(p => {
      p.swing += p.swingSpeed;
      p.x += p.speedX + Math.sin(p.swing) * 0.5;
      p.y += p.speedY;

      if (p.y > this.canvas.height) {
        p.y = -10;
        p.x = Math.random() * this.canvas.width;
      }
      if (p.x > this.canvas.width) {
        p.x = -10;
      }
    });

    // Update fireworks in finale
    for (let i = this.fireworks.length - 1; i >= 0; i--) {
      const fw = this.fireworks[i];
      fw.life -= 0.02;
      fw.particles.forEach(pt => {
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.vy += 0.03;
      });
      if (fw.life <= 0) {
        this.fireworks.splice(i, 1);
      }
    }

    if (this.currentStageId === 'stage_final' && Math.random() < 0.04) {
      this.spawnFirework(
        this.camera.x + 100 + Math.random() * (this.canvas.width - 200),
        this.camera.y + 80 + Math.random() * 150
      );
    }
  }

  spawnFirework(x, y) {
    if (window.audioManager) window.audioManager.playFirework();
    const colors = ['#ffd778', '#b92b45', '#06d6a0', '#118ab2', '#ff85a1', '#ffffff'];
    const fwParticles = [];
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const speed = 1.5 + Math.random() * 2.5;
      fwParticles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 2.5 + Math.random() * 2.5
      });
    }
    this.fireworks.push({ particles: fwParticles, life: 1.0 });
  }

  triggerConfetti() {
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        this.spawnFirework(
          this.camera.x + 150 + Math.random() * (this.canvas.width - 300),
          this.camera.y + 100 + Math.random() * 150
        );
      }, i * 350);
    }
  }

  // Main Loop
  gameLoop(timestamp) {
    if (!this.isRunning) return;
    const delta = (timestamp - this.lastTime) / 1000 || 0;
    this.lastTime = timestamp;

    this.update(delta);
    this.render();

    requestAnimationFrame(this.gameLoop.bind(this));
  }

  update(delta) {
    // If dialogue or modal is open, pause movement
    if (window.dialogueManager && window.dialogueManager.active) return;
    const appModal = document.getElementById('application-modal');
    if (appModal && !appModal.classList.contains('hidden')) return;
    const rewardModal = document.getElementById('reward-modal');
    if (rewardModal && !rewardModal.classList.contains('hidden')) return;
    const minigameModal = document.getElementById('minigame-modal');
    if (minigameModal && !minigameModal.classList.contains('hidden')) return;

    this.handleMovement();
    this.updateCamera();
    this.checkInteractions();
    this.updateParticles();
  }

  handleMovement() {
    const keys = window.controlsManager.keys;
    let dx = 0;
    let dy = 0;

    if (keys.up) { dy -= 1; this.player.direction = 'up'; }
    if (keys.down) { dy += 1; this.player.direction = 'down'; }
    if (keys.left) { dx -= 1; this.player.direction = 'left'; }
    if (keys.right) { dx += 1; this.player.direction = 'right'; }

    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }

    if (dx !== 0 || dy !== 0) {
      this.player.isMoving = true;
      const newX = this.player.x + dx * this.player.speed;
      const newY = this.player.y + dy * this.player.speed;

      const world = window.worldMap;
      const minX = 16;
      const maxX = (world ? world.width : 1920) - 32;
      const minY = 16;
      const maxY = (world ? world.height : 1280) - 32;

      const isSolid = (x, y) => world ? world.isSolid(x, y, this.currentStageId) : false;

      const canMoveX = !isSolid(newX + 6, this.player.y + 20) &&
                       !isSolid(newX + 22, this.player.y + 20) &&
                       !isSolid(newX + 6, this.player.y + 28) &&
                       !isSolid(newX + 22, this.player.y + 28);

      const canMoveY = !isSolid(this.player.x + 6, newY + 20) &&
                       !isSolid(this.player.x + 22, newY + 20) &&
                       !isSolid(this.player.x + 6, newY + 28) &&
                       !isSolid(this.player.x + 22, newY + 28);

      if (canMoveX && newX >= minX && newX <= maxX) this.player.x = newX;
      if (canMoveY && newY >= minY && newY <= maxY) this.player.y = newY;

      this.player.animTimer++;
      if (this.player.animTimer > 8) {
        this.player.animFrame = (this.player.animFrame + 1) % 3;
        this.player.animTimer = 0;
      }
    } else {
      this.player.isMoving = false;
      this.player.animFrame = 0;
    }
  }

  updateCamera() {
    const world = window.worldMap;
    const worldW = world ? world.width : 1920;
    const worldH = world ? world.height : 1280;

    const cssW = this.canvas.width / (this.dpr || 1);
    const cssH = this.canvas.height / (this.dpr || 1);

    const viewW = cssW / this.zoom;
    const viewH = cssH / this.zoom;

    const targetX = (this.player.x + 12) - viewW / 2;
    const targetY = (this.player.y + 14) - viewH / 2;

    const maxCamX = Math.max(0, worldW - viewW);
    const maxCamY = Math.max(0, worldH - viewH);

    this.camera.x = Math.max(0, Math.min(maxCamX, targetX));
    this.camera.y = Math.max(0, Math.min(maxCamY, targetY));
  }

  // Check nearby items, NPCs, or props
  checkInteractions() {
    this.nearbyInteractable = null;
    const px = this.player.x;
    const py = this.player.y;
    const interactRadius = 75;

    // Check NPCs
    if (this.stage && this.stage.npcs) {
      for (const npc of this.stage.npcs) {
        const nx = npc.x * 32;
        const ny = npc.y * 32;
        const dist = Math.hypot(px - nx, py - ny);
        if (dist < interactRadius) {
          this.nearbyInteractable = { type: 'npc', data: npc };
          return;
        }
      }
    }

    // Check Booth JPC at Sân Trung Tâm (Dãy booth dọc phía Tây — Màu đỏ JPC)
    if (this.currentStageId === 'stage1') {
      const jpcCenterX = 15 * 32;
      const jpcCenterY = 22 * 32 + 16;
      if (Math.abs(px - jpcCenterX) < 75 && Math.abs(py - jpcCenterY) < 80) {
        this.nearbyInteractable = {
          type: 'booth_jpc',
          data: { name: 'Gian Trại CLB Tiếng Nhật JPC' }
        };
        return;
      }
    }

    // Check Props
    if (this.stage && this.stage.props) {
      for (const prop of this.stage.props) {
        const prx = prop.x * 32;
        const pry = prop.y * 32;
        const dist = Math.hypot(px - prx, py - pry);
        if (dist < 65) {
          this.nearbyInteractable = { type: 'prop', data: prop };
          return;
        }
      }
    }

    // Check Canteen (West side North: col 3..12, row 2..5)
    if (px >= 3 * 32 - 10 && px <= 12 * 32 + 10 && py >= 3.5 * 32 && py <= 7.5 * 32) {
      this.nearbyInteractable = { type: 'canteen', data: { name: 'Canteen FTU' } };
      return;
    }

    // Check Bia Đá FTU (col 28, row 22 - Tâm điểm Sân trường giữa Tòa B và Nhà A)
    if (Math.hypot(px - 28 * 32, py - 22 * 32) < 80) {
      this.nearbyInteractable = { type: 'biada', data: { name: 'Bia Đá FTU' } };
      return;
    }

    // Check Sân khấu FCD (STAGE 1 ONLY · col 48..53, row 17..25)
    if (this.currentStageId === 'stage1') {
      if (px >= 44 * 32 && px <= 54 * 32 && py >= 16 * 32 && py <= 26 * 32) {
        this.nearbyInteractable = { type: 'stage_fcd', data: { name: 'Sân khấu FCD' } };
        return;
      }
    }
  }

  // Action button [A] or Space/Enter pressed
  handleAction() {
    if (window.dialogueManager && window.dialogueManager.active) {
      window.dialogueManager.advance();
      return;
    }

    if (!this.nearbyInteractable) return;
    const { type, data } = this.nearbyInteractable;

    if (type === 'canteen') {
      this.openCanteenModal();
      return;
    }

    if (type === 'biada') {
      this.openBiaDaModal();
      return;
    }

    if (type === 'stage_fcd') {
      this.openFCDStageVideoModal();
      return;
    }

    if (type === 'booth_jpc') {
      if (this.currentStageId === 'stage1') {
        if (!this.stage1CheckedIn) {
          window.dialogueManager.startDialogue([
            {
              speaker: 'Senpai JPC',
              text: 'Chào em! Em hãy ghé qua Cổng chào Ngày hội đối diện FTU Shop để check-in lấy thẻ tham gia FCD trước đã nhé!'
            }
          ]);
          return;
        }
        if (!this.stage1MetSenpai) {
          window.dialogueManager.startDialogue([
            {
              speaker: 'Senpai JPC',
              text: 'Chào em! Chị Senpai đón tiếp đang đứng ở lối vào Sân Nhà D đợi em đấy, em gặp chị ấy trên đường trước nhé!'
            }
          ]);
          return;
        }
      }

      // Interactive JPC Booth: Trigger dialogue & open application form!
      const deptName = this.player.selectedDeptName || 'Ban Chuyên Môn';
      window.dialogueManager.startDialogue([
        {
          speaker: 'Senpai JPC',
          text: `Konnichiwa ${this.playerName}! Chào mừng em đến với Gian Trại của CLB Tiếng Nhật JPC tại Sân Nhà D (18/10)!`
        },
        {
          speaker: 'Senpai JPC',
          text: `Thật tuyệt vời khi em hướng tới ${deptName}! Vòng 1 Khai Nhãn diễn ra từ 01/10 đến 20/10. Hãy điền đơn gia nhập Gen 22 nhé!`
        }
      ], () => {
        this.openApplicationForm();
      });
    } else if (type === 'npc') {
      if (this.currentStageId === 'stage1') {
        if (data.id === 'npc_guard') {
          window.dialogueManager.startDialogue(data.dialogues, () => {
            if (!this.stage1CheckedIn && this.stage) {
              this.stage.questSpot = { x: 13 * 32, y: 31 * 32 };
              this.stage.questText = 'Đến Bàn Check-in FCD đối diện FTU Shop để nhận thẻ ngày hội!';
            }
            this.updateHUD();
          });
          return;
        }

        if (data.id === 'npc_fcd_checkin') {
          const checkinDialogues = this.stage1CheckedIn ? [
            {
              speaker: 'BTC Check-in FCD',
              text: 'Em đã check-in thành công rồi nhé! Hãy đi thẳng tiếp vào trong trường để tham gia ngày hội!'
            }
          ] : data.dialogues;

          window.dialogueManager.startDialogue(checkinDialogues, () => {
            if (!this.stage1CheckedIn) {
              this.stage1CheckedIn = true;
              if (window.audioManager) window.audioManager.playFanfare();
              if (this.stage) {
                this.stage.questSpot = { x: 11.5 * 32, y: 24.5 * 32 };
                this.stage.questText = 'Gặp Senpai JPC trên đường vào Sân Nhà D!';
              }
              this.updateHUD();
            }
          });
          return;
        }

        if (data.id === 'npc_senpai_road') {
          const senpaiDialogues = this.stage1MetSenpai ? [
            {
              speaker: 'Senpai JPC',
              text: 'Gian Trại JPC màu đỏ thắm ở ngay góc Sân Nhà D đằng kia nhé! Em mau vào bàn đăng ký để điền đơn Vòng 1 nha!'
            }
          ] : data.dialogues;

          window.dialogueManager.startDialogue(senpaiDialogues, () => {
            if (!this.stage1MetSenpai) {
              this.stage1MetSenpai = true;
              if (window.audioManager) window.audioManager.playBlip();
              if (this.stage) {
                this.stage.questSpot = { x: 15 * 32, y: 22 * 32 };
                this.stage.questText = 'Đến Gian Trại JPC (màu đỏ tại Sân Nhà D) để điền đơn Vòng 1!';
              }
              this.updateHUD();
            }
          });
          return;
        }
      }

      if (this.currentStageId === 'stage2' && (data.id === 'npc_app_a' || data.id === 'npc_app_b')) {
        data.talked = true;
      }

      window.dialogueManager.startDialogue(data.dialogues, () => {
        if (this.currentStageId === 'stage2' && data.id === 'npc_interviewer') {
          window.minigameManager.start('stage2', (success) => {
            this.stageProgress.stage2.completed = true;
            if (!this.completedStages.includes('stage2')) this.completedStages.push('stage2');
            if (!this.unlockedStages.includes('stage3_1')) this.unlockedStages.push('stage3_1');
            this.addMemory('Hội trát 2: Hòa Nhịp', 'Hòa nhịp trái tim cùng đồng đội tại Giảng đường B201 FTU!', 'Image/Color/Vòng 2 - Color.png');
            this.saveGameState(false);
            this.loadStage('stage3_1');
          });
        } else if (this.currentStageId === 'stage3_1' && data.id === 'npc_leader') {
          window.minigameManager.start('stage3_1', (success) => {
            this.stageProgress.stage3_1.completed = true;
            if (!this.completedStages.includes('stage3_1')) this.completedStages.push('stage3_1');
            if (!this.unlockedStages.includes('stage3_2')) this.unlockedStages.push('stage3_2');
            this.addMemory('Hội trát 3.1: Phá Phong', 'Cháy hết mình vượt qua deadline tại Dốc Nhà B FTU!', 'Image/Color/Vòng 3.1 - Color.png');
            this.saveGameState(false);
            this.loadStage('stage3_2');
          });
        } else if (this.currentStageId === 'stage3_2' && data.id === 'npc_mentor_heart') {
          window.minigameManager.start('stage3_2', (success) => {
            this.stageProgress.stage3_2.completed = true;
            if (!this.completedStages.includes('stage3_2')) this.completedStages.push('stage3_2');
            if (!this.unlockedStages.includes('stage_final')) this.unlockedStages.push('stage_final');
            this.addMemory('Hội trát 3.2: Chân Diện', 'Tỏa sáng chân diện tại không gian văn hóa VJCC Ngoại Thương!', 'Image/Color/Vòng 3.2 - Color.png');
            this.saveGameState(false);
            this.loadStage('stage_final');
          });
        } else if (this.currentStageId === 'stage_final' && data.id === 'npc_final_president') {
          if (!this.completedStages.includes('stage_final')) this.completedStages.push('stage_final');
          this.saveGameState(false);
          this.showCelebrationModal();
        }
      });
    } else if (type === 'prop') {
      if (data.type === 'prop_boba') {
        if (window.audioManager) window.audioManager.playCollect();
        window.dialogueManager.startDialogue([
          {
            speaker: 'Trà Sữa FCD',
            text: 'Một ly trà sữa Chùa Láng mát lạnh tiếp thêm năng lượng tham gia ngày hội FCD!'
          }
        ]);
      } else if (data.type === 'prop_ftu_sign') {
        window.dialogueManager.startDialogue([
          {
            speaker: 'Cổng Chùa Láng FTU',
            text: 'Cổng trường Đại học Ngoại Thương hôm nay ngập tràn băng rôn FCD chào đón các bạn sinh viên!'
          }
        ]);
      }
    }
  }

  addMemory(title, desc, image = null) {
    this.memories.push({ title, desc, image, timestamp: new Date().toLocaleTimeString() });
  }

  toggleMemoryBook() {
    const modal = document.getElementById('memory-modal');
    if (!modal) return;
    if (modal.classList.contains('hidden')) {
      this.renderMemoryBook();
      modal.classList.remove('hidden');
    } else {
      modal.classList.add('hidden');
    }
  }

  renderMemoryBook() {
    const stageList = document.getElementById('memory-stage-list');
    const playerNameEl = document.getElementById('memory-player-name');
    const playerDeptEl = document.getElementById('memory-player-dept');
    const playerAvatarEl = document.getElementById('memory-player-avatar');
    const progressTextEl = document.getElementById('memory-progress-text');
    const saveBtn = document.getElementById('btn-save-progress');
    const resetBtn = document.getElementById('btn-reset-save');
    const closeBtn = document.getElementById('btn-close-memory');

    if (playerNameEl) playerNameEl.textContent = this.playerName || 'Kouhai Gen 22';
    if (playerDeptEl) playerDeptEl.textContent = `★ ${this.player.selectedDeptName || 'Ban Chuyên Môn'}`;
    if (playerAvatarEl) {
      const avatarMap = { chuyenmon: '🌸', doingoai: '🌏', tochuc: '🏮', thongtin: '🎨', nhansu: '🤝' };
      playerAvatarEl.textContent = avatarMap[this.player.selectedDept] || '🌸';
    }

    const CHAPTERS = [
      {
        id: 'stage1',
        title: 'Hội Trát 1: Khai Nhãn',
        timeline: '01/10 – 20/10/2026 · FTU Club Day: 18/10',
        desc: 'Sân Nhà D FTU — Check-in Ngày hội FCD và ghé Gian Trại JPC điền đơn ứng tuyển Gen 22.',
        thumb: 'Image/Color/Vòng 1 - Color.png',
        fallbackIcon: '🌸'
      },
      {
        id: 'stage2',
        title: 'Hội Trát 2: Hòa Nhịp',
        timeline: '23/10 – 25/10/2026',
        desc: 'Tòa B FTU — Tham gia phòng Google Meet phỏng vấn trực tuyến và giải câu đố áo Happi truyền thống JPC.',
        thumb: 'Image/happi-jpc.jpg',
        fallbackIcon: '💻'
      },
      {
        id: 'stage3_1',
        title: 'Hội Trát 3.1: Phá Phong',
        timeline: '29/10/2026',
        desc: 'Dốc Nhà B FTU — Hoạt động Teamwork cùng đồng đội ghép mô hình búp bê Kokeshi mang bản sắc ban.',
        thumb: 'Image/Color/Vòng 3.1 - Color.png',
        fallbackIcon: '🎎'
      },
      {
        id: 'stage3_2',
        title: 'Hội Trát 3.2: Chân Diện',
        timeline: '30/10 – 01/11/2026',
        desc: 'Viện VJCBI FTU — Phỏng vấn chuyên sâu trực tiếp cùng Ban Chủ nhiệm & các Senpai JPC.',
        thumb: 'Image/Color/Vòng 3.2 - Color.png',
        fallbackIcon: '🏛️'
      },
      {
        id: 'stage_final',
        title: 'Hội Trát Chung Kết: Hòa Sắc',
        timeline: '03/11/2026',
        desc: 'Sân Khấu FCD — Vinh danh tân thành viên Gen 22 và nhận Giấy chứng nhận chính thức của JPC FTU!',
        thumb: 'Image/Logo.png',
        fallbackIcon: '🏆'
      }
    ];

    const unlockedCount = CHAPTERS.filter(ch => this.unlockedStages.includes(ch.id)).length;
    if (progressTextEl) {
      progressTextEl.textContent = `Tiến độ: ${unlockedCount}/${CHAPTERS.length} Hội Trát`;
    }

    if (stageList) {
      stageList.innerHTML = '';
      CHAPTERS.forEach((ch, idx) => {
        const isUnlocked = this.unlockedStages.includes(ch.id);
        const isCurrent = this.currentStageId === ch.id;
        const isCompleted = this.completedStages.includes(ch.id) || (idx < CHAPTERS.findIndex(c => c.id === this.currentStageId));

        let statusClass = 'locked';
        let statusText = 'CHƯA MỞ KHÓA';
        if (isCompleted) {
          statusClass = 'completed';
          statusText = '✓ ĐÃ HOÀN THÀNH';
        } else if (isCurrent) {
          statusClass = 'playing';
          statusText = '● ĐANG CHƠI';
        }

        const card = document.createElement('div');
        card.className = `memory-chapter-card ${statusClass} ${isCurrent ? 'active' : ''}`;

        card.innerHTML = `
          <div class="memory-card-thumb-box zoomable-img" onclick="if (window.openImageLightbox) window.openImageLightbox('${ch.thumb}', '${ch.title} — ${ch.timeline}')" title="Bấm để phóng to kỷ vật">
            <img src="${ch.thumb}" class="memory-card-thumb" alt="${ch.title}" onerror="this.onerror=null; this.src='Image/Logo.png';">
          </div>
          <div class="memory-chapter-info">
            <div class="memory-chapter-header">
              <span class="memory-chapter-title">${ch.title}</span>
              <span class="memory-chapter-status ${statusClass}">${statusText}</span>
            </div>
            <p class="memory-chapter-desc">${ch.desc}</p>
            <div class="memory-chapter-timeline">📅 ${ch.timeline}</div>
          </div>
          <div class="memory-chapter-action">
            <button class="btn-replay-stage" ${isUnlocked ? '' : 'disabled'} title="${isUnlocked ? 'Chơi lại màn này' : 'Chưa mở khóa'}">
              ${isCurrent ? '▶ Tiếp tục' : '↺ Chơi lại'}
            </button>
          </div>
        `;

        const replayBtn = card.querySelector('.btn-replay-stage');
        if (replayBtn && isUnlocked) {
          replayBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.replayStage(ch.id);
          });
        }

        stageList.appendChild(card);
      });
    }

    // Bind footer buttons safely
    if (saveBtn) {
      saveBtn.onclick = () => this.saveGameState(true);
    }
    if (resetBtn) {
      resetBtn.onclick = () => this.resetSaveData();
    }
    if (closeBtn) {
      closeBtn.onclick = () => {
        const modal = document.getElementById('memory-modal');
        if (modal) modal.classList.add('hidden');
      };
    }
  }

  /* ==========================================================================
     CANTEEN FTU INTERACTION (CHỌN ĐỒ ĂN TIẾP SỨC TÂN BINH)
     ========================================================================== */
  setupCanteenModal() {
    const modal = document.getElementById('canteen-modal');
    const closeBtn = document.getElementById('btn-close-canteen');
    if (closeBtn) {
      closeBtn.onclick = () => {
        if (modal) modal.classList.add('hidden');
      };
    }
    if (modal) {
      modal.onclick = (e) => {
        if (e.target === modal) modal.classList.add('hidden');
      };
    }
  }

  openCanteenModal() {
    const modal = document.getElementById('canteen-modal');
    const list = document.getElementById('canteen-menu-list');
    if (!modal || !list) return;

    const MENU = [
      {
        id: 'com_suat',
        icon: '🍱',
        name: 'Cơm Suất Canteen FTU',
        desc: 'Cơm sườn xào chua ngọt + trứng rán vàng ruộm + canh rau muống luộc dầm sấu chuẩn vị FTU!',
        price: '35.000đ',
        buff: 'Buff 100% Năng Lượng',
        reaction: 'Cơm sườn xào chua ngọt chuẩn mẹ nấu! Năng lượng dồi dào sẵn sàng cùng JPC bùng nổ!'
      },
      {
        id: 'bun_bo',
        icon: '🍲',
        name: 'Bún Bò Huế Chùa Láng',
        desc: 'Nước dùng cay nồng thơm mùi sả ớt, thịt bò mềm và chả cua đầy đặn ấm bụng ngày hội!',
        price: '40.000đ',
        buff: 'Sưởi Ấm Tâm Hồn',
        reaction: 'Tô bún bò cay thơm xuýt xoa, tiếp thêm sức mạnh chinh phục mọi vòng tuyển!'
      },
      {
        id: 'banh_mi_chao',
        icon: '🥖',
        name: 'Bánh Mì Chảo Đặc Biệt',
        desc: 'Pate gan béo ngậy, trứng ốp la lòng đào, xúc xích và nước sốt cà chua sóng sánh bánh mì giòn rụm.',
        price: '35.000đ',
        buff: 'No Căng Bụng Chạy Deadline',
        reaction: 'Bánh mì giòn rụm chấm đẫm sốt pate béo ngậy, đúng chuẩn món tủ sinh viên K63!'
      },
      {
        id: 'tra_tac',
        icon: '🍹',
        name: 'Trà Tắc Khổng Lồ 1 Lít',
        desc: 'Trà tắc chua ngọt mát lạnh sảng khoái, giải nhiệt tức thì giữa không khí sôi động của FCD.',
        price: '20.000đ',
        buff: 'Giải Nhiệt Cực Đã',
        reaction: 'Một ngụm trà tắc mát lạnh sảng khoái đánh tan mọi cơn khát ngày hội!'
      },
      {
        id: 'cafe_sua',
        icon: '☕',
        name: 'Cà Phê Sữa Đá Sài Gòn',
        desc: 'Hương cà phê thơm đậm đà, sữa đặc béo ngậy ngọt ngào, vũ khí chống ngủ gật số 1 FTU.',
        price: '25.000đ',
        buff: '+200% Tỉnh Táo Tập Trung',
        reaction: 'Cà phê thơm nức tỉnh cả người! Tinh thần tập trung cao độ để nộp đơn ứng tuyển!'
      }
    ];

    list.innerHTML = '';
    MENU.forEach(dish => {
      const card = document.createElement('div');
      card.className = 'canteen-item-card';
      card.innerHTML = `
        <div class="canteen-item-icon">${dish.icon}</div>
        <div class="canteen-item-body">
          <div class="canteen-item-title">${dish.name}</div>
          <p class="canteen-item-desc">${dish.desc}</p>
          <div class="canteen-item-meta">
            <span class="canteen-price">💵 ${dish.price}</span>
            <span class="canteen-buff">✨ ${dish.buff}</span>
          </div>
        </div>
        <button class="btn-eat-food">Ăn ngay ▶</button>
      `;

      const eatBtn = card.querySelector('.btn-eat-food');
      if (eatBtn) {
        eatBtn.onclick = () => {
          this.eatFood(dish);
        };
      }
      list.appendChild(card);
    });

    modal.classList.remove('hidden');
    if (window.audioManager) window.audioManager.playBlip();
  }

  eatFood(dish) {
    const modal = document.getElementById('canteen-modal');
    if (modal) modal.classList.add('hidden');

    if (window.audioManager) window.audioManager.playCollect();

    this.triggerConfetti();

    window.dialogueManager.startDialogue([
      {
        speaker: 'Bác Phục Vụ Canteen',
        text: `Bác mang ra cho cháu món ${dish.name} nóng hổi thơm phức đây! Chúc cháu ăn thật ngon miệng nhé!`
      },
      {
        speaker: this.playerName,
        text: `Ngon tuyệt đỉnh! ${dish.reaction}`
      },
      {
        speaker: 'Hệ Thống FTU',
        text: `✨ [${dish.buff}] — Năng lượng đã được sạc đầy 100%! Bạn sẵn sàng cháy hết mình cùng JPC FTU!`
      }
    ]);

    this.addMemory('Thưởng thức Canteen FTU', `Đã ghé Canteen nạp năng lượng với món ${dish.name} ngon tuyệt!`, 'Image/Logo.png');

    if (window.showToast) {
      window.showToast(`🍱 Yummy! Đã thưởng thức: ${dish.name}!`);
    }
  }

  /* ==========================================================================
     BIA ĐÁ FTU INTERACTION (KHẤN ĐỂ QUA MÔN & SĂN GPA 4.0)
     ========================================================================== */
  setupBiaDaModal() {
    const modal = document.getElementById('biada-modal');
    const closeBtn = document.getElementById('btn-close-biada');
    if (closeBtn) {
      closeBtn.onclick = () => {
        if (modal) modal.classList.add('hidden');
      };
    }
    if (modal) {
      modal.onclick = (e) => {
        if (e.target === modal) modal.classList.add('hidden');
      };
    }
  }

  openBiaDaModal() {
    const modal = document.getElementById('biada-modal');
    const list = document.getElementById('biada-prayer-list');
    if (!modal || !list) return;

    const PRAYERS = [
      {
        id: 'qua_mon',
        icon: '🎓',
        title: 'Cầu Qua Môn Điểm A (Không Tạch Môn)',
        desc: '"Con thành tâm cầu khấn Bia Đá FTU che chở: Kinh tế vi mô, Kinh tế vĩ mô, Pháp luật đại cương, Toán cao cấp kỳ này đều điểm A, né sạch điểm F!"',
        oracleBadge: 'Tín hiệu: 100% Qua Môn',
        oracle: 'Bia Đá FTU đã chứng giám lòng thành! Tín hiệu vũ trụ truyền về: Điểm F đã biến mất, chỉ cần ôn luyện nghiêm túc và giữ vững tinh thần, điểm A sẽ về tay bạn!'
      },
      {
        id: 'gpa_4',
        icon: '🌟',
        title: 'Cầu GPA 4.0 & Săn Học Bổng Khuyến Khích',
        desc: '"Cầu mong kỳ học này GPA chạm đỉnh 4.0, săn trọn vẹn Học bổng Khuyến khích học tập của Trường Đại học Ngoại Thương!"',
        oracleBadge: 'Tín hiệu: Học Bá FTU',
        oracle: 'Ánh hào quang từ Bia Đá chiếu rọi! Bạn có tố chất trở thành Học Bá FTU xuất sắc! Hãy kiên trì học tập và bứt phá nhé!'
      },
      {
        id: 'do_jpc',
        icon: '🌸',
        title: 'Cầu Trúng Tuyển JPC Gen 22',
        desc: '"Con nguyện đem trọn nhiệt huyết thanh xuân, vượt qua 3 Vòng Tuyển quân để trở thành thành viên chính thức của đại gia đình JPC FTU!"',
        oracleBadge: 'Tín hiệu: Chắc Suất Gen 22',
        oracle: 'Búp bê Kokeshi và các Senpai JPC mỉm cười đón nhận ước nguyện của bạn! Cánh cổng JPC Gen 22 đang rộng mở chào đón bạn về nhà!'
      },
      {
        id: 'ny_ftu',
        icon: '💖',
        title: 'Cầu Có Người Yêu Ở Ngoại Thương',
        desc: '"Cầu cho con sớm tìm được một nửa định mệnh tại ngôi trường FTU Chùa Láng, cùng nhau đi dạo hồ Tây và ngắm hoàng hôn!"',
        oracleBadge: 'Tín hiệu: Tơ Duyên Rực Rỡ',
        oracle: 'Duyên lành đang tới rất gần! Hãy tự tin thể hiện cá tính trong ngày hội FCD và các hoạt động của JPC, người ấy sẽ sớm xuất hiện bên bạn!'
      }
    ];

    list.innerHTML = '';
    PRAYERS.forEach(item => {
      const card = document.createElement('div');
      card.className = 'biada-item-card';
      card.innerHTML = `
        <div class="biada-item-icon">${item.icon}</div>
        <div class="biada-item-body">
          <div class="biada-item-title">${item.title}</div>
          <p class="biada-item-desc">${item.desc}</p>
          <span class="biada-oracle-badge">${item.oracleBadge}</span>
        </div>
        <button class="btn-pray-stone">Khấn vái 🙏</button>
      `;

      const prayBtn = card.querySelector('.btn-pray-stone');
      if (prayBtn) {
        prayBtn.onclick = () => {
          this.prayBiaDa(item);
        };
      }
      list.appendChild(card);
    });

    modal.classList.remove('hidden');
    if (window.audioManager) window.audioManager.playBlip();
  }

  prayBiaDa(item) {
    const modal = document.getElementById('biada-modal');
    if (modal) modal.classList.add('hidden');

    if (window.audioManager) window.audioManager.playFanfare();

    this.triggerConfetti();

    window.dialogueManager.startDialogue([
      {
        speaker: 'Văn Bia FTU',
        text: `Gió thoảng qua rặng cây Chùa Láng... Bia Đá FTU linh thiêng phát ra vầng sáng vàng kim ấm áp, lắng nghe trọn vẹn lời nguyện của ${this.playerName}!`
      },
      {
        speaker: 'Lời Sấm Từ Bia Đá',
        text: `${item.oracle}`
      },
      {
        speaker: this.playerName,
        text: 'Con cảm ơn Bia Đá FTU! Con nguyện sẽ chăm chỉ ôn tập và cháy hết mình cùng JPC Gen 22!'
      }
    ]);

    this.addMemory('Khấn Bia Đá FTU', `Đã thành tâm gửi gắm ước nguyện: "${item.title}" trước Bia Đá linh thiêng!`, 'Image/Logo.png');

    if (window.showToast) {
      window.showToast(`⛩️ Đã khấn Bia Đá FTU thành công! Nhận buff may mắn!`);
    }
  }

  /* ==========================================================================
     SÂN KHẤU FCD - JPC FCD STAGE VIDEO CINEMA (XEM VIDEO TIẾT MỤC JPC)
     ========================================================================== */
  setupVideoModal() {
    const modal = document.getElementById('video-modal');
    const closeBtn = document.getElementById('btn-close-video');
    if (closeBtn) {
      closeBtn.onclick = () => {
        this.closeFCDStageVideoModal();
      };
    }
    if (modal) {
      modal.onclick = (e) => {
        if (e.target === modal) this.closeFCDStageVideoModal();
      };
    }
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const vidModal = document.getElementById('video-modal');
        if (vidModal && !vidModal.classList.contains('hidden')) {
          this.closeFCDStageVideoModal();
        }
      }
    });
  }

  openFCDStageVideoModal() {
    const modal = document.getElementById('video-modal');
    const video = document.getElementById('fcd-stage-video');
    if (!modal || !video) return;

    // Pause game background music so video audio is clear
    if (window.audioManager) {
      window.audioManager.pauseBGM();
    }

    modal.classList.remove('hidden');

    // Attempt video play
    video.currentTime = 0;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.log('Video autoplay prevented by browser policy, user can press play:', err);
      });
    }

    this.addMemory(
      'Sân khấu FCD — Stage JPC',
      'Đã thưởng thức trọn vẹn tiết mục biểu diễn hoành tráng của CLB Tiếng Nhật JPC tại FCD 2026!',
      'Image/Color/Vòng 1 - Color.png'
    );

    if (window.showToast) {
      window.showToast('🎬 Đang xem Sân khấu biểu diễn của JPC tại FCD 2026!');
    }
  }

  closeFCDStageVideoModal() {
    const modal = document.getElementById('video-modal');
    const video = document.getElementById('fcd-stage-video');
    if (video) {
      video.pause();
    }
    if (modal) {
      modal.classList.add('hidden');
    }
    // Resume game background music
    if (window.audioManager) {
      window.audioManager.resumeBGM();
    }
  }

  setupCelebrationModal() {
    const closeBtn = document.getElementById('btn-close-celebration');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        document.getElementById('celebration-modal').classList.add('hidden');
      });
    }

    const replayBtn = document.getElementById('btn-replay');
    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        window.location.reload();
      });
    }
  }

  showCelebrationModal() {
    if (window.audioManager) {
      window.audioManager.playFanfare();
      for (let i = 0; i < 6; i++) {
        setTimeout(() => window.audioManager.playFirework(), i * 400);
      }
    }

    const modal = document.getElementById('celebration-modal');
    const memberName = document.getElementById('cert-member-name');
    if (memberName) {
      memberName.textContent = this.playerName.toUpperCase();
    }
    modal.classList.remove('hidden');
    this.triggerConfetti();
  }

  // ==========================================================================
  // RENDER PIPELINE
  // ==========================================================================
  render() {
    const dpr = this.dpr || 1;
    const cssW = this.canvas.width / dpr;
    const cssH = this.canvas.height / dpr;

    this.ctx.save();
    // High-DPI scale so all canvas coordinates use CSS pixels while rendering at native device resolution
    this.ctx.scale(dpr, dpr);

    // Fill canvas with soothing water blue matching river surrounding campus
    this.ctx.fillStyle = '#6ec1e4';
    this.ctx.fillRect(0, 0, cssW, cssH);

    this.ctx.save();
    // Zoom in close to main Kokeshi character
    this.ctx.scale(this.zoom, this.zoom);
    this.ctx.translate(-Math.round(this.camera.x), -Math.round(this.camera.y));

    // 1. Render Big Open FTU World Map (Terrain, Roads, Buildings, FCD Plaza)
    if (window.worldMap) {
      window.worldMap.render(this.ctx, this.camera, this.currentStageId);
    }

    // 2. Render Quest Beacon on the ground
    this.renderQuestBeacon();

    // 3. Render Props, Items, NPCs
    this.renderProps();
    this.renderItems();
    this.renderNPCs();

    // 4. Render Equipped Directional Guide attached directly to Main Kokeshi
    this.renderEquippedGuide();

    // 5. Render Player Chibi Vector Character
    this.renderPlayer();

    // 6. Overhead Map Elements (Arches & Gate Signboards so player passes UNDER them!)
    if (window.worldMap && window.worldMap.drawOverheadSignboards) {
      window.worldMap.drawOverheadSignboards(this.ctx, this.currentStageId);
    }

    // 7. Render Interaction Prompt [A] (Rendered in world space above target)
    this.renderInteractionPrompt();

    this.ctx.restore();

    // 7. Render Ambient Lighting & Weather
    this.renderAmbientLighting();
    this.renderParticles();

    this.ctx.restore();

    // 8. Render Mini-Map Radar in HUD Panel (DOM canvas)
    const domMiniMap = document.getElementById('minimap-canvas');
    if (domMiniMap && window.worldMap) {
      window.worldMap.renderMiniMapToCanvas(domMiniMap, this.player.x, this.player.y, this.stage ? this.stage.questSpot : null, this.currentStageId);
    }

    // 9. Render Quest Compass Arrow pointing to destination (when offscreen)
    this.renderQuestCompass();
  }

  // Equipped Navigation Guide attached directly to Main Kokeshi's movement/heading
  renderEquippedGuide() {
    if (!this.stage || !this.stage.questSpot) return;

    const px = this.player.x + 16;
    const py = this.player.y + 26;
    const qx = this.stage.questSpot.x;
    const qy = this.stage.questSpot.y;

    const dist = Math.hypot(qx - px, qy - py);
    if (dist < 45) return; // Arrived at destination: cleanly hide pointer so no screen clutter!

    // Calculate heading angle to quest destination
    const targetAngle = Math.atan2(qy - py, qx - px);

    // Smoothly turn guide needle towards target
    if (this.guideAngle === undefined) {
      this.guideAngle = targetAngle;
    } else {
      let diff = targetAngle - this.guideAngle;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      this.guideAngle += diff * 0.18;
    }

    const time = Date.now() / 200;

    this.ctx.save();
    this.ctx.translate(px, py);

    // 1. Soft glowing aura at Main Kokeshi's feet
    const auraPulse = 20 + Math.sin(time) * 2;
    const grad = this.ctx.createRadialGradient(0, 0, 4, 0, 0, auraPulse);
    grad.addColorStop(0, 'rgba(255, 215, 120, 0.5)');
    grad.addColorStop(0.7, 'rgba(185, 43, 69, 0.25)');
    grad.addColorStop(1, 'rgba(185, 43, 69, 0)');
    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, auraPulse, 0, Math.PI * 2);
    this.ctx.fill();

    // 2. Equipped Rotating Directional Arrow pointing towards quest target
    this.ctx.rotate(this.guideAngle);

    // Hovering distance ahead of Kokeshi (pulses forward with walking rhythm)
    const arrowDist = 28 + Math.sin(time * 2) * 3;
    this.ctx.translate(arrowDist, 0);

    // Glow effect
    this.ctx.shadowColor = 'rgba(255, 215, 120, 0.9)';
    this.ctx.shadowBlur = 10;

    // Draw aerodynamic golden quest chevron arrow
    this.ctx.fillStyle = '#ffd778';
    this.ctx.strokeStyle = '#5c1216';
    this.ctx.lineWidth = 1.5;

    this.ctx.beginPath();
    this.ctx.moveTo(10, 0);
    this.ctx.lineTo(-7, -7);
    this.ctx.lineTo(-3, 0);
    this.ctx.lineTo(-7, 7);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    // Trailing glowing sakura petal dots
    this.ctx.fillStyle = 'rgba(255, 183, 197, 0.9)';
    this.ctx.beginPath();
    this.ctx.arc(-8, 0, 2.5, 0, Math.PI * 2);
    this.ctx.arc(-15, 0, 1.8, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  renderQuestBeacon() {
    if (!this.stage || !this.stage.questSpot) return;
    const qx = this.stage.questSpot.x;
    const qy = this.stage.questSpot.y;

    // Hide beacon when player is already close (< 70px) to prevent visual clutter
    const dist = Math.hypot(qx - (this.player.x + 12), qy - (this.player.y + 20));
    if (dist < 70) return;

    const time = Date.now() / 300;
    const pulse = 18 + Math.sin(time) * 4;

    this.ctx.save();
    this.ctx.fillStyle = 'rgba(255, 215, 120, 0.16)';
    this.ctx.beginPath();
    this.ctx.arc(qx, qy, pulse, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.strokeStyle = '#ffd778';
    this.ctx.lineWidth = 1.4;
    this.ctx.stroke();

    this.ctx.restore();
  }

  renderQuestCompass() {
    if (!this.stage || !this.stage.questSpot) return;
    const qx = this.stage.questSpot.x;
    const qy = this.stage.questSpot.y;

    const screenX = (qx - this.camera.x) * this.zoom;
    const screenY = (qy - this.camera.y) * this.zoom;

    const cssW = this.canvas.width / (this.dpr || 1);
    const cssH = this.canvas.height / (this.dpr || 1);

    const pad = 45;
    const isOffScreen = screenX < pad || screenX > cssW - pad ||
                        screenY < pad || screenY > cssH - pad;

    if (isOffScreen) {
      const centerX = cssW / 2;
      const centerY = cssH / 2;
      const angle = Math.atan2(screenY - centerY, screenX - centerX);

      const compassX = Math.max(pad, Math.min(cssW - pad, centerX + Math.cos(angle) * (centerX - 70)));
      const compassY = Math.max(pad + 60, Math.min(cssH - pad - 60, centerY + Math.sin(angle) * (centerY - 90)));

      this.ctx.save();
      this.ctx.translate(compassX, compassY);
      this.ctx.rotate(angle);

      this.ctx.fillStyle = '#b92b45';
      this.ctx.beginPath();
      this.ctx.moveTo(16, 0);
      this.ctx.lineTo(-10, -9);
      this.ctx.lineTo(-5, 0);
      this.ctx.lineTo(-10, 9);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.strokeStyle = '#ffd778';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      this.ctx.restore();
    }
  }

  renderProps() {
    if (!this.stage.props) return;
    this.stage.props.forEach(p => {
      const x = p.x * 32;
      const y = p.y * 32;
      window.spriteManager.draw(this.ctx, p.type, x, y);
    });
  }

  renderItems() {
    if (!this.stage.items) return;
    const time = Date.now() / 300;
    this.stage.items.forEach(it => {
      if (!it.collected) {
        const x = it.x * 32;
        const hoverY = it.y * 32 + Math.sin(time) * 4;
        window.spriteManager.draw(this.ctx, 'prop_scroll', x, hoverY);

        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 12px "Montserrat", sans-serif';
        this.ctx.fillText(it.icon, x + 6, hoverY + 16);
      }
    });
  }

  renderNPCs() {
    if (!this.stage.npcs) return;
    this.stage.npcs.forEach(npc => {
      const x = npc.x * 32;
      const y = npc.y * 32;

      if (npc.sprite === 'npc_senpai' && this.senpaiImage && this.senpaiImage.complete) {
        const bounce = Math.sin(Date.now() / 350) * 1.5;
        this.ctx.drawImage(this.senpaiImage, x - 2, y - 18 + bounce, 36, 54);
      } else {
        window.spriteManager.draw(this.ctx, npc.sprite, x, y);
      }

      // Name tag above NPC (Compact, neat pill in Montserrat)
      this.ctx.save();
      this.ctx.font = 'bold 8.5px "Montserrat", sans-serif';
      const nameW = Math.max(36, Math.round(this.ctx.measureText(npc.name).width + 12));

      this.ctx.fillStyle = 'rgba(34, 7, 10, 0.9)';
      this.ctx.beginPath();
      this.ctx.roundRect(x + 16 - nameW / 2, y - 28, nameW, 14, 4);
      this.ctx.fill();
      this.ctx.strokeStyle = '#ffd778';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();

      this.ctx.fillStyle = '#ffd778';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(npc.name, x + 16, y - 17.5);
      this.ctx.restore();
    });
  }

  // Draw Selected Kokeshi Character (5 Departments of JPC) - Zoomed & Close-up
  renderPlayer() {
    const px = this.player.x;
    const py = this.player.y;
    const bounce = this.player.isMoving ? Math.sin(this.player.animTimer * 0.8) * 3 : 0;
    const wobble = this.player.isMoving ? Math.sin(this.player.animTimer * 0.6) * 0.08 : 0;

    const centerX = px + 16;
    const feetY = py + 28;

    this.ctx.save();

    // 1. Soft Oval Shadow on the ground
    this.ctx.fillStyle = 'rgba(11, 4, 3, 0.35)';
    this.ctx.beginPath();
    this.ctx.ellipse(centerX, feetY + 2, 16, 6, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // 2. Position and Wobble/Bounce Animation
    this.ctx.translate(centerX, feetY + bounce);
    this.ctx.rotate(wobble);

    // Flip horizontally when moving left
    if (this.player.direction === 'left') {
      this.ctx.scale(-1, 1);
    }

    // Get selected Kokeshi doll image
    const deptKey = this.player.selectedDept || 'chuyenmon';
    const kokeshiImg = this.kokeshiImages ? this.kokeshiImages[deptKey] : null;

    if (kokeshiImg && kokeshiImg.complete && kokeshiImg.naturalWidth > 0) {
      // 54x54 Kokeshi Doll, bottom anchored at ground
      const kw = 54;
      const kh = 54;
      this.ctx.drawImage(kokeshiImg, -kw / 2, -kh, kw, kh);
    } else {
      // Fallback Kokeshi wooden silhouette while image loads
      this.ctx.fillStyle = '#b92b45';
      this.ctx.beginPath();
      this.ctx.arc(0, -36, 14, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.fillStyle = '#f8e4b7';
      this.ctx.fillRect(-10, -22, 20, 22);
    }

    this.ctx.restore();

    // 3. Compact Player Name Tag above Kokeshi (Small, neat pill with only player name)
    this.ctx.save();
    const tagBaseY = py - 30;
    const playerName = this.playerName || 'Kouhai Gen 22';

    this.ctx.font = 'bold 8.5px "Montserrat", sans-serif';
    const badgeW = Math.max(38, Math.round(this.ctx.measureText(playerName).width + 12));

    this.ctx.fillStyle = 'rgba(34, 7, 10, 0.9)';
    this.ctx.beginPath();
    this.ctx.roundRect(centerX - badgeW / 2, tagBaseY - 14, badgeW, 14, 4);
    this.ctx.fill();
    this.ctx.strokeStyle = '#ffd778';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    this.ctx.fillStyle = '#ffd778';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(playerName, centerX, tagBaseY - 3.5);
    this.ctx.restore();
  }

  renderAmbientLighting() {
    // Soft sunny morning warmth for FTU Club Day
    const cssW = this.canvas.width / (this.dpr || 1);
    const cssH = this.canvas.height / (this.dpr || 1);
    this.ctx.fillStyle = 'rgba(255, 235, 180, 0.06)';
    this.ctx.fillRect(0, 0, cssW, cssH);
  }

  renderParticles() {
    // Sakura petals (screen space)
    this.particles.forEach(p => {
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.ellipse(p.x, p.y, p.size, p.size * 0.6, p.swing, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Fireworks (scaled with camera zoom)
    this.fireworks.forEach(fw => {
      fw.particles.forEach(pt => {
        this.ctx.fillStyle = pt.color;
        this.ctx.beginPath();
        this.ctx.arc((pt.x - this.camera.x) * this.zoom, (pt.y - this.camera.y) * this.zoom, pt.size * this.zoom, 0, Math.PI * 2);
        this.ctx.fill();
      });
    });
  }

  renderInteractionPrompt() {
    if (!this.nearbyInteractable) return;
    // Don't show interaction prompt when dialogue is already active
    if (window.dialogueManager && window.dialogueManager.active) return;

    let targetX = this.player.x + 16;
    let targetY = this.player.y - 56;

    // Position neatly above interactable target without colliding with name tags
    if (this.nearbyInteractable.type === 'npc' && this.nearbyInteractable.data) {
      targetX = this.nearbyInteractable.data.x * 32 + 16;
      targetY = this.nearbyInteractable.data.y * 32 - 52;
    } else if (this.nearbyInteractable.type === 'booth_jpc') {
      targetX = 15 * 32 + 16;
      targetY = 20 * 32;
    } else if (this.nearbyInteractable.type === 'prop' && this.nearbyInteractable.data) {
      targetX = this.nearbyInteractable.data.x * 32 + 16;
      targetY = this.nearbyInteractable.data.y * 32 - 42;
    } else if (this.nearbyInteractable.type === 'canteen') {
      targetX = 7.5 * 32;
      targetY = 4.5 * 32;
    } else if (this.nearbyInteractable.type === 'biada') {
      targetX = 28 * 32;
      targetY = 22 * 32 - 42;
    } else if (this.nearbyInteractable.type === 'stage_fcd') {
      targetX = 50.5 * 32;
      targetY = 20 * 32;
    }

    // Determine concise action verb
    let actionLabel = 'Tương tác';
    if (this.nearbyInteractable.type === 'npc') {
      actionLabel = (this.nearbyInteractable.data && this.nearbyInteractable.data.id === 'npc_fcd_checkin') ? 'Check-in' : 'Trò chuyện';
    } else if (this.nearbyInteractable.type === 'booth_jpc') {
      actionLabel = 'Ghé Booth';
    } else if (this.nearbyInteractable.type === 'canteen') {
      actionLabel = 'Ăn Canteen';
    } else if (this.nearbyInteractable.type === 'biada') {
      actionLabel = 'Khấn Bia Đá';
    } else if (this.nearbyInteractable.type === 'stage_fcd') {
      actionLabel = 'Xem Stage JPC';
    } else if (this.nearbyInteractable.type === 'prop') {
      actionLabel = 'Kiểm tra';
    }

    const bob = Math.sin(Date.now() / 150) * 2.5;

    this.ctx.save();
    this.ctx.font = 'bold 9.5px "Montserrat", sans-serif';
    const textWidth = this.ctx.measureText(actionLabel).width;

    // Sleek console-style Action Badge: [A] Trò chuyện
    const keycapRadius = 7;
    const paddingX = 8;
    const badgeHeight = 20;
    const badgeWidth = Math.round(paddingX * 2 + keycapRadius * 2 + 5 + textWidth);
    const badgeX = Math.round(targetX - badgeWidth / 2);
    const badgeY = Math.round(targetY + bob - badgeHeight / 2);

    // 1. Sleek semi-transparent dark lacquer badge pill
    this.ctx.fillStyle = 'rgba(20, 5, 8, 0.9)';
    this.ctx.beginPath();
    this.ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 10);
    this.ctx.fill();

    // Subtle golden rim
    this.ctx.strokeStyle = '#ffd778';
    this.ctx.lineWidth = 1.2;
    this.ctx.stroke();

    // 2. Round Golden Keycap [A] button
    const keycapCenterX = badgeX + paddingX + keycapRadius;
    const keycapCenterY = badgeY + badgeHeight / 2;

    this.ctx.fillStyle = '#ffd778';
    this.ctx.beginPath();
    this.ctx.arc(keycapCenterX, keycapCenterY, keycapRadius, 0, Math.PI * 2);
    this.ctx.fill();

    // 'A' letter inside keycap
    this.ctx.fillStyle = '#5c1216';
    this.ctx.font = 'bold 9px "Montserrat", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('A', keycapCenterX, keycapCenterY + 0.5);

    // 3. Action Label text (Montserrat)
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 9.5px "Montserrat", sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(actionLabel, keycapCenterX + keycapRadius + 5, keycapCenterY);

    // 4. Subtle downward pointing triangle below pill
    this.ctx.fillStyle = '#ffd778';
    this.ctx.beginPath();
    this.ctx.moveTo(targetX - 3.5, badgeY + badgeHeight);
    this.ctx.lineTo(targetX + 3.5, badgeY + badgeHeight);
    this.ctx.lineTo(targetX, badgeY + badgeHeight + 3.5);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.restore();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  if (document.fonts) {
    Promise.all([
      document.fonts.load('bold 12px Montserrat'),
      document.fonts.load('bold 10px Montserrat'),
      document.fonts.load('600 14px Montserrat'),
      document.fonts.load('14px Montserrat'),
      document.fonts.ready
    ]).then(() => {
      if (window.worldMap) {
        window.worldMap.buildPreRenderedCanvas();
        window.worldMap.buildFCDBoothsCanvas();
      }
    });
  }
});
