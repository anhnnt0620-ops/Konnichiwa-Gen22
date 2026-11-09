// Main Game Engine for JPC Konnichiwa Gen 22
class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    this.playerName = 'Kouhai Gen 22';
    this.currentStageId = 'stage1';
    this.stage = STAGE_DATA['stage1'];

    // Player State
    this.player = {
      x: 4 * 32,
      y: 7 * 32,
      speed: 2.6,
      direction: 'down',
      animFrame: 0,
      animTimer: 0,
      isMoving: false,
      width: 24,
      height: 28
    };

    // Camera
    this.camera = { x: 0, y: 0 };

    // Stage progression state
    this.stageProgress = {
      stage1: { itemsCollected: 0, letterSealed: false, completed: false },
      stage2: { talkedToAll: false, synced: false, completed: false },
      stage3_1: { teamworkDone: false, completed: false },
      stage3_2: { interviewDone: false, completed: false },
      stage_final: { celebrationStarted: false }
    };

    // Unlocked Memories Book
    this.memories = [];

    // Particles (Sakura petals, sparkles, fireworks)
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
    this.setupCelebrationModal();
  }

  resizeCanvas() {
    const container = document.getElementById('game-container');
    const w = (container && container.clientWidth) ? container.clientWidth : window.innerWidth;
    const h = (container && container.clientHeight) ? container.clientHeight : window.innerHeight;

    this.canvas.width = w;
    this.canvas.height = h;
    this.ctx.imageSmoothingEnabled = false;
  }

  setupStartScreen() {
    const startBtn = document.getElementById('btn-start-game');
    const nameInput = document.getElementById('input-player-name');
    const titleScreen = document.getElementById('title-screen');

    startBtn.addEventListener('click', () => {
      if (nameInput.value.trim()) {
        this.playerName = nameInput.value.trim();
      }
      titleScreen.classList.add('hidden');
      this.startGame();
    });
  }

  startGame() {
    this.isRunning = true;
    this.loadStage('stage1');
    if (window.audioManager) {
      window.audioManager.init();
      window.audioManager.playBGM('stage1');
    }
    this.updateHUD();

    // Opening monologue
    setTimeout(() => {
      window.dialogueManager.startDialogue([
        {
          speaker: 'Người Dẫn Chuyện',
          text: `Chào mừng ${this.playerName} đến với khuôn viên Trường Đại học Ngoại Thương (FTU)!`
        },
        {
          speaker: 'Người Dẫn Chuyện',
          text: 'Trước mắt bạn là Tiền sảnh Nhà A rực rỡ cờ hoa. Hãy đi quanh thu thập 3 mảnh ghép tinh thần FTU & JPC, rồi gửi gắm tâm tư vào Hòm thư tuyển thành viên Gen 22 nhé!'
        }
      ]);
    }, 400);

    requestAnimationFrame(this.gameLoop.bind(this));
  }

  loadStage(stageId) {
    this.currentStageId = stageId;
    this.stage = STAGE_DATA[stageId];
    if (!this.stage) return;

    this.player.x = this.stage.playerStart.x * 32;
    this.player.y = this.stage.playerStart.y * 32;
    this.player.direction = 'down';

    // Switch BGM
    if (window.audioManager) {
      window.audioManager.playBGM(this.stage.bgm);
    }

    this.updateHUD();

    // Trigger stage opening dialogue
    if (stageId === 'stage2') {
      window.dialogueManager.startDialogue([
        {
          speaker: 'Hội Trát 2',
          text: 'Chúc mừng bạn đã vượt qua Vòng Đơn! Chào mừng đến với Giảng đường B201 FTU - Vòng Phỏng Vấn Nhóm: Hòa Nhịp!'
        },
        {
          speaker: 'Người Dẫn Chuyện',
          text: 'Hãy đến trò chuyện cùng các bạn FTUers đang ngồi ở bàn tròn trước mặt nhé!'
        }
      ]);
    } else if (stageId === 'stage3_1') {
      window.dialogueManager.startDialogue([
        {
          speaker: 'Hội Trát 3.1',
          text: 'Chúc mừng bạn bước vào Vòng Teamwork: Phá Phong tại Dốc Nhà B huyền thoại của FTU!'
        },
        {
          speaker: 'Người Dẫn Chuyện',
          text: 'Các bạn cùng nhóm đang nỗ lực hết mình tại bàn dự án. Hãy tới gặp Trưởng Nhóm để cùng bứt phá giới hạn deadline!'
        }
      ]);
    } else if (stageId === 'stage3_2') {
      window.dialogueManager.startDialogue([
        {
          speaker: 'Hội Trát 3.2',
          text: 'Chào mừng bạn đến với Không gian Nhật Bản VJCC FTU - Vòng Phỏng Vấn Cá Nhân: Chân Diện.'
        },
        {
          speaker: 'Người Dẫn Chuyện',
          text: 'Ánh hoàng hôn buông xuống ấm áp qua rèm Shoji. Hãy tiến lại chiếc bàn trà và mở lòng đối thoại cùng Ban Điều Hành.'
        }
      ]);
    } else if (stageId === 'stage_final') {
      window.dialogueManager.startDialogue([
        {
          speaker: 'JPC FTU',
          text: `Khoảnh khắc vinh quang đã tới! Chào mừng tân FTUer ${this.playerName} đến với Quảng trường Sân Nhà A FTU rợp bóng hoa anh đào!`
        },
        {
          speaker: 'Người Dẫn Chuyện',
          text: 'Hãy bước qua Cổng Torii rực rỡ, bước trên thảm đỏ hoa anh đào để đón nhận sự chào đón từ đại gia đình JPC!'
        }
      ]);
      this.triggerConfetti();
    }
  }

  updateHUD() {
    const stageTitle = document.getElementById('hud-stage-name');
    const questDesc = document.getElementById('hud-quest-desc');
    const badge = document.getElementById('hud-badge');

    if (stageTitle) stageTitle.textContent = this.stage.name;
    if (questDesc) questDesc.textContent = this.stage.questText;
    if (badge) {
      const stageMap = {
        stage1: 'HỘI TRÁT 1',
        stage2: 'HỘI TRÁT 2',
        stage3_1: 'HỘI TRÁT 3.1',
        stage3_2: 'HỘI TRÁT 3.2',
        stage_final: 'CHÍNH THỨC'
      };
      badge.textContent = stageMap[this.currentStageId] || 'JPC';
    }
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
        pt.vy += 0.03; // gravity
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
    const colors = ['#ffd166', '#ff4d6d', '#06d6a0', '#118ab2', '#ff9ebb', '#ffffff'];
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
        size: 2 + Math.random() * 2
      });
    }
    this.fireworks.push({ particles: fwParticles, life: 1.0 });
  }

  triggerConfetti() {
    for (let i = 0; i < 5; i++) {
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
    // If dialogue or minigame is active, don't move
    if (window.dialogueManager && window.dialogueManager.active) return;
    const minigameModal = document.getElementById('minigame-modal');
    if (minigameModal && !minigameModal.classList.contains('hidden')) return;

    this.handleMovement();
    this.updateCamera();
    this.checkInteractions();
    this.checkAutoTriggers();
    this.updateParticles();
  }

  // Automatic trigger when walking right onto unlocked portals
  checkAutoTriggers() {
    if (this.stage.portal && this.stage.portal.unlocked) {
      const pX = this.stage.portal.x * 32;
      const pY = this.stage.portal.y * 32;
      const dist = Math.hypot(this.player.x - pX, this.player.y - pY);
      if (dist < 24) {
        if (window.audioManager) window.audioManager.playFanfare();
        this.loadStage(this.stage.portal.targetStage);
      }
    }
  }

  handleMovement() {
    const keys = window.controlsManager.keys;
    let dx = 0;
    let dy = 0;

    if (keys.up) { dy -= 1; this.player.direction = 'up'; }
    if (keys.down) { dy += 1; this.player.direction = 'down'; }
    if (keys.left) { dx -= 1; this.player.direction = 'left'; }
    if (keys.right) { dx += 1; this.player.direction = 'right'; }

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }

    if (dx !== 0 || dy !== 0) {
      this.player.isMoving = true;
      const newX = this.player.x + dx * this.player.speed;
      const newY = this.player.y + dy * this.player.speed;

      // Map boundary check
      const maxX = (this.stage.width - 1.5) * 32;
      const maxY = (this.stage.height - 1.5) * 32;
      const minX = 16;
      const minY = 32;

      if (newX >= minX && newX <= maxX) this.player.x = newX;
      if (newY >= minY && newY <= maxY) this.player.y = newY;

      // Animate footsteps
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
    // Center camera on player
    const targetX = this.player.x - this.canvas.width / 2;
    const targetY = this.player.y - this.canvas.height / 2;

    const maxCamX = Math.max(0, this.stage.width * 32 - this.canvas.width);
    const maxCamY = Math.max(0, this.stage.height * 32 - this.canvas.height);

    this.camera.x = Math.max(0, Math.min(maxCamX, targetX));
    this.camera.y = Math.max(0, Math.min(maxCamY, targetY));
  }

  // Check if player is near any item, NPC, prop, or portal
  checkInteractions() {
    this.nearbyInteractable = null;
    const px = this.player.x;
    const py = this.player.y;
    const interactRadius = 45;

    // Check items
    if (this.stage.items) {
      for (const item of this.stage.items) {
        if (!item.collected) {
          const ix = item.x * 32;
          const iy = item.y * 32;
          const dist = Math.hypot(px - ix, py - iy);
          if (dist < interactRadius) {
            this.nearbyInteractable = { type: 'item', data: item };
            return;
          }
        }
      }
    }

    // Check NPCs
    if (this.stage.npcs) {
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

    // Check Props (Mailbox, Desk, etc.)
    if (this.stage.props) {
      for (const prop of this.stage.props) {
        const prx = prop.x * 32;
        const pry = prop.y * 32;
        const dist = Math.hypot(px - prx, py - pry);
        if (dist < interactRadius) {
          this.nearbyInteractable = { type: 'prop', data: prop };
          return;
        }
      }
    }

    // Check Portal to next stage
    if (this.stage.portal) {
      const pX = this.stage.portal.x * 32;
      const pY = this.stage.portal.y * 32;
      const dist = Math.hypot(px - pX, py - pY);
      if (dist < interactRadius) {
        this.nearbyInteractable = { type: 'portal', data: this.stage.portal };
        return;
      }
    }
  }

  // User pressed Action button or Space/Enter
  handleAction() {
    if (window.dialogueManager && window.dialogueManager.active) {
      window.dialogueManager.advance();
      return;
    }

    if (!this.nearbyInteractable) return;
    const { type, data } = this.nearbyInteractable;

    if (type === 'item') {
      data.collected = true;
      if (window.audioManager) window.audioManager.playCollect();

      if (this.currentStageId === 'stage1') {
        this.stageProgress.stage1.itemsCollected++;
        window.dialogueManager.startDialogue([
          {
            speaker: 'Kỷ Vật',
            text: `Bạn đã thu thập: ${data.name}! Trái tim bạn đang tràn đầy quyết tâm.`
          }
        ], () => {
          if (this.stageProgress.stage1.itemsCollected >= 3) {
            this.stage.questText = 'Đã đủ 3 mảnh ghép! Hãy đến Hòm thư JPC để niêm phong gửi lá đơn!';
            this.updateHUD();
          }
        });
      }
    } else if (type === 'npc') {
      if (this.currentStageId === 'stage2' && (data.id === 'npc_app_a' || data.id === 'npc_app_b')) {
        data.talked = true;
      }

      window.dialogueManager.startDialogue(data.dialogues, () => {
        // Trigger specific stage minigames after talking
        if (this.currentStageId === 'stage2' && data.id === 'npc_interviewer') {
          window.minigameManager.start('stage2', (success) => {
            this.stageProgress.stage2.completed = true;
            this.stage.portal.unlocked = true;
            this.addMemory('Hội trát 2: Hòa Nhịp', 'Hòa nhịp trái tim cùng đồng đội tại Giảng đường B201 FTU!', 'Image/Color/Vòng 2 - Color.png');
            this.stage.questText = 'Đã mở khóa cổng Hội trát tiếp theo! Hãy bước qua cánh cổng để tiến vào Dốc Nhà B!';
            this.updateHUD();
          });
        } else if (this.currentStageId === 'stage3_1' && data.id === 'npc_leader') {
          window.minigameManager.start('stage3_1', (success) => {
            this.stageProgress.stage3_1.completed = true;
            this.stage.portal.unlocked = true;
            this.addMemory('Hội trát 3.1: Phá Phong', 'Cháy hết mình vượt qua deadline tại Dốc Nhà B FTU!', 'Image/Color/Vòng 3.1 - Color.png');
            this.stage.questText = 'Hoàn thành xuất sắc! Cổng tiến vào Không gian VJCC đã mở!';
            this.updateHUD();
          });
        } else if (this.currentStageId === 'stage3_2' && data.id === 'npc_mentor_heart') {
          window.minigameManager.start('stage3_2', (success) => {
            this.stageProgress.stage3_2.completed = true;
            this.stage.portal.unlocked = true;
            this.addMemory('Hội trát 3.2: Chân Diện', 'Tỏa sáng chân diện tại không gian văn hóa VJCC Ngoại Thương!', 'Image/Color/Vòng 3.2 - Color.png');
            this.stage.questText = 'Cổng Vinh Quang đã mở! Tiến tới Quảng trường Sân Nhà A FTU!';
            this.updateHUD();
          });
        } else if (this.currentStageId === 'stage_final' && data.id === 'npc_final_president') {
          this.showCelebrationModal();
        }
      });
    } else if (type === 'prop') {
      if (data.type === 'prop_mailbox' && this.currentStageId === 'stage1') {
        if (this.stageProgress.stage1.itemsCollected < 3) {
          window.dialogueManager.startDialogue([
            {
              speaker: 'Hòm Thư JPC',
              text: 'Bạn cần thu thập đủ 3 mảnh ghép cảm xúc trước sảnh Nhà A trước khi niêm phong lá đơn nhé!'
            }
          ]);
        } else {
          window.minigameManager.start('stage1', (success) => {
            this.stageProgress.stage1.completed = true;
            this.stage.portal.unlocked = true;
            this.addMemory('Hội trát 1: Khai Nhãn', 'Gửi trọn lá đơn tuyển thành viên tại Tiền sảnh Nhà A - Đại học Ngoại Thương!', 'Image/Color/Vòng 1 - Color.png');
            this.stage.questText = 'Lá đơn đã gửi đi! Cổng Giảng đường B201 đã mở ra ở bên phải!';
            this.updateHUD();
          });
        }
      } else if (data.type === 'prop_desk') {
        window.dialogueManager.startDialogue([
          {
            speaker: 'Bàn Tuyển Sinh JPC',
            text: 'Bàn sự kiện Konnichiwa Gen 22 tại FTU, nơi bao ước mơ tuổi trẻ bắt đầu nảy mầm.'
          }
        ]);
      } else if (data.type === 'prop_boba') {
        if (window.audioManager) window.audioManager.playCollect();
        window.dialogueManager.startDialogue([
          {
            speaker: 'Trà Sữa Chùa Láng',
            text: 'Một ly trà sữa Chùa Láng mát lạnh xua tan căng thẳng deadline! Sinh viên Ngoại Thương ai cũng mê!'
          }
        ]);
      }
    } else if (type === 'portal') {
      if (data.unlocked) {
        if (window.audioManager) window.audioManager.playFanfare();
        this.loadStage(data.targetStage);
      } else {
        window.dialogueManager.startDialogue([
          {
            speaker: 'Cổng Hội Trát',
            text: 'Cổng này vẫn đang được phong ấn. Hãy hoàn thành thử thách của chặng hiện tại trước nhé!'
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
      list.innerHTML = '<p class="empty-text">Chưa có hồi ức nào được mở khóa. Hãy tiếp tục hành trình nhé!</p>';
      return;
    }

    this.memories.forEach((mem, idx) => {
      const card = document.createElement('div');
      card.className = 'memory-card';
      const iconOrImg = mem.image
        ? `<img src="${mem.image}" class="memory-card-thumb" alt="${mem.title}">`
        : `<div class="memory-card-icon">🌸</div>`;

      card.innerHTML = `
        ${iconOrImg}
        <div class="memory-card-content">
          <h4>${mem.title}</h4>
          <p>${mem.desc}</p>
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

  // RENDER PIPELINE
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    this.ctx.translate(-Math.round(this.camera.x), -Math.round(this.camera.y));

    this.renderTiles();
    this.renderProps();
    this.renderItems();
    this.renderNPCs();
    this.renderPlayer();
    this.renderPortal();

    this.ctx.restore();

    this.renderAmbientLighting();
    this.renderParticles();
    this.renderInteractionPrompt();
  }

  renderTiles() {
    const tileSize = 32;
    for (let r = 0; r < this.stage.height; r++) {
      for (let c = 0; c < this.stage.width; c++) {
        const x = c * tileSize;
        const y = r * tileSize;

        // Base floor
        window.spriteManager.draw(this.ctx, this.stage.floorTile, x, y);

        // Accent borders / carpets
        if (this.stage.accentTile && (r === 0 || r === this.stage.height - 1 || c === 0 || c === this.stage.width - 1)) {
          window.spriteManager.draw(this.ctx, 'tile_shoji', x, y);
        } else if (this.currentStageId === 'stage_final' && (r === 6 || r === 7)) {
          // Red carpet aisle in finale
          window.spriteManager.draw(this.ctx, 'tile_carpet', x, y);
        }
      }
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

        // Sparkle icon
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
      window.spriteManager.draw(this.ctx, npc.sprite, x, y);

      // Name tag above NPC
      this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
      this.ctx.fillRect(x - 14, y - 14, npc.name.length * 6 + 10, 14);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '9px "Press Start 2P", monospace, sans-serif';
      this.ctx.fillText(npc.name, x - 10, y - 4);
    });
  }

  renderPlayer() {
    const spriteName = `player_${this.player.direction}_${this.player.animFrame}`;
    window.spriteManager.draw(this.ctx, spriteName, this.player.x, this.player.y);

    // Player name tag
    this.ctx.fillStyle = 'rgba(230, 57, 70, 0.85)';
    const tagW = this.playerName.length * 6 + 12;
    this.ctx.fillRect(this.player.x + 16 - tagW / 2, this.player.y - 14, tagW, 14);
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '9px "Press Start 2P", monospace, sans-serif';
    this.ctx.fillText(this.playerName, this.player.x + 22 - tagW / 2, this.player.y - 4);
  }

  renderPortal() {
    if (!this.stage.portal) return;
    const px = this.stage.portal.x * 32;
    const py = this.stage.portal.y * 32;
    const unlocked = this.stage.portal.unlocked;

    this.ctx.save();
    if (unlocked) {
      const pulse = 1 + Math.sin(Date.now() / 200) * 0.15;
      this.ctx.fillStyle = 'rgba(255, 209, 102, 0.35)';
      this.ctx.beginPath();
      this.ctx.arc(px + 16, py + 16, 22 * pulse, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#ffd166';
      this.ctx.font = '16px sans-serif';
      this.ctx.fillText('⛩️ CỔNG', px + 2, py + 22);
    } else {
      this.ctx.fillStyle = 'rgba(100, 100, 100, 0.4)';
      this.ctx.fillRect(px, py, 32, 32);
      this.ctx.fillStyle = '#aaa';
      this.ctx.font = '14px sans-serif';
      this.ctx.fillText('🔒', px + 8, py + 22);
    }
    this.ctx.restore();
  }

  renderAmbientLighting() {
    if (this.stage.ambientColor) {
      this.ctx.fillStyle = this.stage.ambientColor;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
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
        this.ctx.fillRect(pt.x - this.camera.x, pt.y - this.camera.y, pt.size, pt.size);
      });
    });
  }

  renderInteractionPrompt() {
    if (!this.nearbyInteractable) return;
    const screenX = this.player.x - this.camera.x + 8;
    const screenY = this.player.y - this.camera.y - 20;

    const bob = Math.sin(Date.now() / 150) * 3;

    this.ctx.fillStyle = '#ffd166';
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(screenX + 8, screenY + bob, 12, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.fillStyle = '#000';
    this.ctx.font = 'bold 11px sans-serif';
    this.ctx.fillText('A', screenX + 4, screenY + bob + 4);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new Game();
});
