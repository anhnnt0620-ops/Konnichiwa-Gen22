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
      x: 9 * 32,
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

    // Camera
    this.camera = { x: 0, y: 0 };

    // Stage progression state
    this.stageProgress = {
      stage1: { formSubmitted: false, completed: false },
      stage2: { talkedToAll: false, synced: false, completed: false },
      stage3_1: { teamworkDone: false, completed: false },
      stage3_2: { interviewDone: false, completed: false },
      stage_final: { celebrationStarted: false }
    };

    // Unlocked Memories Book
    this.memories = [];

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

      // Convert screen coordinates to world coordinates
      const rect = this.canvas.getBoundingClientRect();
      const screenX = clientX - rect.left;
      const screenY = clientY - rect.top;
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

  resizeCanvas() {
    const container = document.getElementById('game-container');
    const w = (container && container.clientWidth) ? container.clientWidth : window.innerWidth;
    const h = (container && container.clientHeight) ? container.clientHeight : window.innerHeight;

    this.canvas.width = w;
    this.canvas.height = h;
    this.ctx.imageSmoothingEnabled = true;
  }

  setupStartScreen() {
    const startBtn = document.getElementById('btn-start-game');
    const nameInput = document.getElementById('input-player-name');
    const titleScreen = document.getElementById('title-screen');
    const kokeshiCards = document.querySelectorAll('.kokeshi-card');

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

    // Opening: Bác Bảo Vệ greets user at Cổng Chùa Láng
    setTimeout(() => {
      window.dialogueManager.startDialogue([
        {
          speaker: 'Bác Bảo Vệ FTU',
          text: 'Chào mừng cháu đến với Trường Đại học Ngoại Thương FTU!'
        },
        {
          speaker: 'Bác Bảo Vệ FTU',
          text: 'Hôm nay ngày 18/10 là ngày hội CLB FTU Club Day (FCD) bùng nổ đó! Vòng 1 Khai Nhãn của JPC mở từ 01/10 đến 20/10.'
        },
        {
          speaker: 'Bác Bảo Vệ FTU',
          text: 'Cháu đi thẳng vào Sân Trung Tâm, nhìn sang dãy booth bên trái (phía Tây Bia Đá FTU) sẽ thấy Gian Trại JPC màu đỏ thắm rất nổi bật để điền đơn Vòng 1 nhé!'
        }
      ]);
    }, 300);

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
          text: 'Chúc mừng em đã xuất sắc vượt qua Vòng Đơn! Chào mừng em đến với Vòng 2: Hòa Nhịp (Phỏng Vấn Online 23/10 – 25/10)!'
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

      const isSolid = (x, y) => world ? world.isSolid(x, y) : false;

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

    const targetX = this.player.x - this.canvas.width / 2;
    const targetY = this.player.y - this.canvas.height / 2;

    const maxCamX = Math.max(0, worldW - this.canvas.width);
    const maxCamY = Math.max(0, worldH - this.canvas.height);

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
  }

  // Action button [A] or Space/Enter pressed
  handleAction() {
    if (window.dialogueManager && window.dialogueManager.active) {
      window.dialogueManager.advance();
      return;
    }

    if (!this.nearbyInteractable) return;
    const { type, data } = this.nearbyInteractable;

    if (type === 'booth_jpc') {
      // Interactive JPC Booth: Trigger dialogue & open application form!
      const deptName = this.player.selectedDeptName || 'Ban Chuyên Môn';
      window.dialogueManager.startDialogue([
        {
          speaker: 'Senpai JPC',
          text: `Konnichiwa ${this.playerName}! Chào mừng em đến với Gian Trại của CLB Tiếng Nhật JPC tại FTU Club Day (18/10)!`
        },
        {
          speaker: 'Senpai JPC',
          text: `Thật tuyệt vời khi em hướng tới ${deptName}! Vòng 1 Khai Nhãn diễn ra từ 01/10 đến 20/10. Hãy điền đơn gia nhập Gen 22 nhé!`
        }
      ], () => {
        this.openApplicationForm();
      });
    } else if (type === 'npc') {
      if (this.currentStageId === 'stage1' && data.id === 'npc_jpc_booth') {
        window.dialogueManager.startDialogue(data.dialogues, () => {
          this.openApplicationForm();
        });
        return;
      }

      if (this.currentStageId === 'stage2' && (data.id === 'npc_app_a' || data.id === 'npc_app_b')) {
        data.talked = true;
      }

      window.dialogueManager.startDialogue(data.dialogues, () => {
        if (this.currentStageId === 'stage2' && data.id === 'npc_interviewer') {
          window.minigameManager.start('stage2', (success) => {
            this.stageProgress.stage2.completed = true;
            this.addMemory('Hội trát 2: Hòa Nhịp', 'Hòa nhịp trái tim cùng đồng đội tại Giảng đường B201 FTU!', 'Image/Color/Vòng 2 - Color.png');
            this.loadStage('stage3_1');
          });
        } else if (this.currentStageId === 'stage3_1' && data.id === 'npc_leader') {
          window.minigameManager.start('stage3_1', (success) => {
            this.stageProgress.stage3_1.completed = true;
            this.addMemory('Hội trát 3.1: Phá Phong', 'Cháy hết mình vượt qua deadline tại Dốc Nhà B FTU!', 'Image/Color/Vòng 3.1 - Color.png');
            this.loadStage('stage3_2');
          });
        } else if (this.currentStageId === 'stage3_2' && data.id === 'npc_mentor_heart') {
          window.minigameManager.start('stage3_2', (success) => {
            this.stageProgress.stage3_2.completed = true;
            this.addMemory('Hội trát 3.2: Chân Diện', 'Tỏa sáng chân diện tại không gian văn hóa VJCC Ngoại Thương!', 'Image/Color/Vòng 3.2 - Color.png');
            this.loadStage('stage_final');
          });
        } else if (this.currentStageId === 'stage_final' && data.id === 'npc_final_president') {
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
    const list = document.getElementById('memory-list');
    if (!list) return;
    list.innerHTML = '';

    if (this.memories.length === 0) {
      list.innerHTML = '<p class="empty-text" style="color:var(--white); font-size:13px;">Chưa có hồi ức nào được mở khóa. Hãy nộp đơn tại Booth JPC để nhận kỷ vật đầu tiên nhé!</p>';
      return;
    }

    this.memories.forEach((mem) => {
      const card = document.createElement('div');
      card.className = 'memory-card';
      const iconOrImg = mem.image
        ? `<img src="${mem.image}" class="memory-card-thumb" alt="${mem.title}">`
        : `<div class="memory-card-icon">🌸</div>`;

      card.innerHTML = `
        ${iconOrImg}
        <div class="memory-card-content">
          <h4 style="font-family: var(--font-title); font-size: 15px; color: var(--gold-bright); margin: 0 0 4px 0;">${mem.title}</h4>
          <p style="font-size: 12px; color: var(--white); margin: 0;">${mem.desc}</p>
        </div>
      `;
      list.appendChild(card);
    });
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
    // Fill canvas with soothing water blue matching river surrounding campus
    this.ctx.fillStyle = '#6ec1e4';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    this.ctx.translate(-Math.round(this.camera.x), -Math.round(this.camera.y));

    // 1. Render Big Open FTU World Map (Terrain, Roads, Buildings, FCD Plaza)
    if (window.worldMap) {
      window.worldMap.render(this.ctx, this.camera, this.currentStageId);
    }

    // 2. Render Footstep Trail Guide from player's feet to quest objective!
    this.renderFootstepTrail();

    // 2.1 Render Quest Beacon on the ground
    this.renderQuestBeacon();

    // 3. Render Props, Items, NPCs
    this.renderProps();
    this.renderItems();
    this.renderNPCs();

    // 4. Render Player Chibi Vector Character
    this.renderPlayer();

    this.ctx.restore();

    // 5. Render Ambient Lighting & Weather
    this.renderAmbientLighting();
    this.renderParticles();

    // 6. Render Interaction Prompt [A]
    this.renderInteractionPrompt();

    // 7. Render Mini-Map Radar in HUD Panel (DOM canvas)
    const domMiniMap = document.getElementById('minimap-canvas');
    if (domMiniMap && window.worldMap) {
      window.worldMap.renderMiniMapToCanvas(domMiniMap, this.player.x, this.player.y, this.stage ? this.stage.questSpot : null, this.currentStageId);
    }

    // 8. Render Quest Compass Arrow pointing to destination
    this.renderQuestCompass();
  }

  // Animated glowing golden sakura trail leading from under Kokeshi character's feet to quest target
  renderFootstepTrail() {
    if (!this.stage || !this.stage.questSpot) return;

    const startX = this.player.x + 12;
    const startY = this.player.y + 24;
    const endX = this.stage.questSpot.x;
    const endY = this.stage.questSpot.y;

    const totalDist = Math.hypot(endX - startX, endY - startY);
    if (totalDist < 45) return; // Arrived at target

    // Natural waypoints along FTU avenues
    const waypoints = [{ x: startX, y: startY }];
    const westAveX = 9 * 32 + 16;

    if (startY > 24 * 32 && Math.abs(startX - westAveX) > 30) {
      waypoints.push({ x: westAveX, y: startY });
    }

    if (this.currentStageId === 'stage1') {
      waypoints.push({ x: westAveX, y: endY });
    } else if (this.currentStageId === 'stage2') {
      waypoints.push({ x: westAveX, y: endY });
    } else if (this.currentStageId === 'stage3_1') {
      waypoints.push({ x: westAveX, y: endY });
    } else if (this.currentStageId === 'stage3_2') {
      waypoints.push({ x: westAveX, y: endY });
    } else if (this.currentStageId === 'stage_final') {
      waypoints.push({ x: 28 * 32, y: 22 * 32 });
    }

    waypoints.push({ x: endX, y: endY });

    const step = 24;
    const animOffset = (Date.now() / 30) % step;

    this.ctx.save();

    for (let w = 0; w < waypoints.length - 1; w++) {
      const p1 = waypoints[w];
      const p2 = waypoints[w + 1];
      const segDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      if (segDist < 5) continue;

      const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      for (let d = animOffset; d < segDist; d += step) {
        const dx = p1.x + cosA * d;
        const dy = p1.y + sinA * d;

        // Soft outer sakura aura
        this.ctx.fillStyle = 'rgba(255, 215, 120, 0.28)';
        this.ctx.beginPath();
        this.ctx.arc(dx, dy, 7, 0, Math.PI * 2);
        this.ctx.fill();

        // Glowing center dot (alternating gold and sakura pink)
        this.ctx.fillStyle = (d % (step * 2) < step) ? '#ffd778' : '#ffb7c5';
        this.ctx.beginPath();
        this.ctx.arc(dx, dy, 3.5, 0, Math.PI * 2);
        this.ctx.fill();

        // Forward directional chevron arrow
        this.ctx.strokeStyle = '#5c1216';
        this.ctx.lineWidth = 1.2;
        this.ctx.beginPath();
        const arrSize = 3;
        this.ctx.moveTo(dx - cosA * arrSize - sinA * arrSize, dy - sinA * arrSize + cosA * arrSize);
        this.ctx.lineTo(dx + cosA * arrSize, dy + sinA * arrSize);
        this.ctx.lineTo(dx - cosA * arrSize + sinA * arrSize, dy - sinA * arrSize - cosA * arrSize);
        this.ctx.stroke();
      }
    }

    this.ctx.restore();
  }

  renderQuestBeacon() {
    if (!this.stage || !this.stage.questSpot) return;
    const qx = this.stage.questSpot.x;
    const qy = this.stage.questSpot.y;

    const time = Date.now() / 300;
    const pulse = 22 + Math.sin(time) * 5;

    this.ctx.save();
    this.ctx.fillStyle = 'rgba(230, 57, 70, 0.35)';
    this.ctx.beginPath();
    this.ctx.arc(qx, qy, pulse, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.strokeStyle = '#ffd778';
    this.ctx.lineWidth = 2.5;
    this.ctx.stroke();

    this.ctx.fillStyle = '#ffd778';
    this.ctx.font = 'bold 16px sans-serif';
    this.ctx.fillText('⭐ BOOTH JPC', qx - 45, qy - pulse - 8);
    this.ctx.restore();
  }

  renderQuestCompass() {
    if (!this.stage || !this.stage.questSpot) return;
    const qx = this.stage.questSpot.x;
    const qy = this.stage.questSpot.y;

    const screenX = qx - this.camera.x;
    const screenY = qy - this.camera.y;

    const pad = 45;
    const isOffScreen = screenX < pad || screenX > this.canvas.width - pad ||
                        screenY < pad || screenY > this.canvas.height - pad;

    if (isOffScreen) {
      const centerX = this.canvas.width / 2;
      const centerY = this.canvas.height / 2;
      const angle = Math.atan2(screenY - centerY, screenX - centerX);

      const compassX = Math.max(pad, Math.min(this.canvas.width - pad, centerX + Math.cos(angle) * (centerX - 70)));
      const compassY = Math.max(pad + 60, Math.min(this.canvas.height - pad - 60, centerY + Math.sin(angle) * (centerY - 90)));

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
        this.ctx.font = '12px sans-serif';
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
        this.ctx.drawImage(this.senpaiImage, x + 2, y - 8 + bounce, 28, 44);
      } else {
        window.spriteManager.draw(this.ctx, npc.sprite, x, y);
      }

      // Name tag above NPC in Alviona font
      this.ctx.fillStyle = 'rgba(34, 7, 10, 0.85)';
      const tagW = npc.name.length * 7 + 16;
      this.ctx.beginPath();
      this.ctx.roundRect(x + 16 - tagW / 2, y - 18, tagW, 16, 4);
      this.ctx.fill();
      this.ctx.strokeStyle = '#ffd778';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();

      this.ctx.fillStyle = '#ffd778';
      this.ctx.font = 'bold 10px "Alviona", "Cinzel", serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(npc.name, x + 16, y - 6);
      this.ctx.textAlign = 'start';
    });
  }

  // Draw Selected Kokeshi Character (5 Departments of JPC)
  renderPlayer() {
    const px = this.player.x;
    const py = this.player.y;
    const bounce = this.player.isMoving ? Math.sin(this.player.animTimer * 0.8) * 3 : 0;
    const wobble = this.player.isMoving ? Math.sin(this.player.animTimer * 0.6) * 0.08 : 0;

    const centerX = px + 16;
    const feetY = py + 28;

    this.ctx.save();

    // 1. Soft Oval Shadow on the ground
    this.ctx.fillStyle = 'rgba(11, 4, 3, 0.3)';
    this.ctx.beginPath();
    this.ctx.ellipse(centerX, feetY + 2, 14, 5, 0, 0, Math.PI * 2);
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
      // 48x48 Kokeshi Doll, bottom anchored at ground
      const kw = 48;
      const kh = 48;
      this.ctx.drawImage(kokeshiImg, -kw / 2, -kh, kw, kh);
    } else {
      // Fallback Kokeshi wooden silhouette while image loads
      this.ctx.fillStyle = '#b92b45';
      this.ctx.beginPath();
      this.ctx.arc(0, -32, 12, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.fillStyle = '#f8e4b7';
      this.ctx.fillRect(-8, -20, 16, 20);
    }

    this.ctx.restore();

    // 3. Name Tag & Department Pill above Kokeshi
    this.ctx.save();
    const tagBaseY = py - 26;

    // A. Mini Department Pill Badge
    const deptName = this.player.selectedDeptName || 'Ban Chuyên Môn';
    this.ctx.font = 'bold 8.5px "Be Vietnam Pro", sans-serif';
    const deptW = this.ctx.measureText(deptName).width + 14;

    this.ctx.fillStyle = 'rgba(185, 43, 69, 0.95)';
    this.ctx.beginPath();
    this.ctx.roundRect(centerX - deptW / 2, tagBaseY - 14, deptW, 13, 5);
    this.ctx.fill();
    this.ctx.strokeStyle = '#ffd778';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    this.ctx.fillStyle = '#ffd778';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`★ ${deptName}`, centerX, tagBaseY - 4);

    // B. Player Name Tag
    const playerName = this.playerName || 'Kouhai Gen 22';
    this.ctx.font = 'bold 10px "Alviona", "Cinzel", serif';
    const nameW = Math.max(64, this.ctx.measureText(playerName).width + 18);

    this.ctx.fillStyle = 'rgba(34, 7, 10, 0.9)';
    this.ctx.beginPath();
    this.ctx.roundRect(centerX - nameW / 2, tagBaseY + 2, nameW, 16, 5);
    this.ctx.fill();
    this.ctx.strokeStyle = '#ffd778';
    this.ctx.lineWidth = 1.2;
    this.ctx.stroke();

    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(playerName, centerX, tagBaseY + 14);
    this.ctx.textAlign = 'start';

    this.ctx.restore();
  }

  renderAmbientLighting() {
    // Soft sunny morning warmth for FTU Club Day
    this.ctx.fillStyle = 'rgba(255, 235, 180, 0.06)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  renderParticles() {
    // Sakura petals
    this.particles.forEach(p => {
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.ellipse(p.x, p.y, p.size, p.size * 0.6, p.swing, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Fireworks
    this.fireworks.forEach(fw => {
      fw.particles.forEach(pt => {
        this.ctx.fillStyle = pt.color;
        this.ctx.beginPath();
        this.ctx.arc(pt.x - this.camera.x, pt.y - this.camera.y, pt.size, 0, Math.PI * 2);
        this.ctx.fill();
      });
    });
  }

  renderInteractionPrompt() {
    if (!this.nearbyInteractable) return;
    const centerX = this.player.x - this.camera.x + 16;
    const topY = this.player.y - this.camera.y - 48;
    const bob = Math.sin(Date.now() / 150) * 3;

    this.ctx.save();
    const promptText = 'Nhấn [A] / Chạm để tương tác';
    this.ctx.font = 'bold 11px "Be Vietnam Pro", sans-serif';
    const textW = this.ctx.measureText(promptText).width + 24;

    // Glowing badge background
    this.ctx.fillStyle = 'rgba(185, 43, 69, 0.95)';
    this.ctx.beginPath();
    this.ctx.roundRect(centerX - textW / 2, topY + bob - 12, textW, 22, 11);
    this.ctx.fill();

    this.ctx.strokeStyle = '#ffd778';
    this.ctx.lineWidth = 1.8;
    this.ctx.stroke();

    // Golden prompt text
    this.ctx.fillStyle = '#ffd778';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`★ ${promptText} ★`, centerX, topY + bob + 3);

    // Little downward arrow pointing to player
    this.ctx.fillStyle = '#b92b45';
    this.ctx.beginPath();
    this.ctx.moveTo(centerX - 5, topY + bob + 10);
    this.ctx.lineTo(centerX + 5, topY + bob + 10);
    this.ctx.lineTo(centerX, topY + bob + 15);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.restore();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new Game();
});
