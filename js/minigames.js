// Minigames for JPC Journey
class MinigameManager {
  constructor() {
    this.container = null;
    this.modal = null;
    this.activeGame = null;
    this.onFinishCallback = null;
    this.timer = null;
    this.animFrame = null;
    this.init();
  }

  init() {
    if (typeof document === 'undefined') return;
    this.modal = document.getElementById('minigame-modal');
    this.container = document.getElementById('minigame-container');
  }

  start(gameType, onFinish) {
    this.init();
    this.onFinishCallback = onFinish;
    this.activeGame = gameType;

    if (gameType === 'stage2') {
      this.runStage2Game();
      return;
    }

    if (gameType === 'stage3_1') {
      this.runStage31Game();
      return;
    }

    if (this.modal) this.modal.classList.remove('hidden');
    if (this.container) this.container.innerHTML = '';

    if (gameType === 'stage1') {
      this.runStage1Game();
    } else if (gameType === 'stage3_2') {
      this.runStage32Game();
    }
  }

  finish(success = true) {
    const cb = this.onFinishCallback;
    const finishedGame = this.activeGame;
    this.onFinishCallback = null;
    this.activeGame = null;

    this.cleanup();
    this.init();
    if (window.audioManager) {
      window.audioManager.playFanfare();
    }

    const compModal = document.getElementById('computer-interview-modal');
    if (compModal) compModal.classList.add('hidden');
    const tenguModal = document.getElementById('tengu-battle-modal');
    if (tenguModal) tenguModal.classList.add('hidden');
    if (this.modal) this.modal.classList.add('hidden');

    const invokeCb = () => {
      if (this.modal) this.modal.classList.add('hidden');
      if (cb) cb(success);
    };

    if (finishedGame === 'stage2' || finishedGame === 'stage3_1') {
      invokeCb();
    } else {
      setTimeout(invokeCb, 600);
    }
  }

  cleanup() {
    if (this.timer) clearInterval(this.timer);
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    if (this.tenguTickTimer) clearInterval(this.tenguTickTimer);
    if (this.tenguAllyTimer) clearTimeout(this.tenguAllyTimer);
    if (this.tenguMatchTimer) clearInterval(this.tenguMatchTimer);
    if (this.tenguUnsubscribe) {
      this.tenguUnsubscribe();
      this.tenguUnsubscribe = null;
    }
    this.timer = null;
    this.animFrame = null;
    this.tenguTickTimer = null;
    this.tenguAllyTimer = null;
    this.tenguMatchTimer = null;
  }

  // MINIGAME 1: KHAI NHÃN - NIÊM PHONG PHONG THƯ (Rhythm Tap)
  runStage1Game() {
    this.container.innerHTML = `
      <div class="mg-header">
        <h3>HỘI TRÁT 1: KHAI NHÃN</h3>
        <p>Chạm vào các viên ngọc cảm xúc đúng lúc để niêm phong lá đơn gửi JPC!</p>
      </div>
      <div class="mg-stage1-arena" id="mg-stage1-arena">
        <div class="mg-target-zone" id="mg-target">
          <div class="mg-envelope-center">✉️</div>
        </div>
        <div class="mg-orbit" id="mg-orbit"></div>
      </div>
      <div class="mg-score-bar">
        <span>Tiến độ: <b id="mg-progress">0/4</b></span>
      </div>
      <button class="pixel-btn mg-tap-btn" id="mg-seal-btn">NIÊM PHONG (CHẠM)</button>
    `;

    let score = 0;
    const targetScore = 4;
    const emotions = ['Đam mê', 'Nhiệt huyết', 'Bản sắc', 'Chân thành'];
    let currentOrbitAngle = 0;
    let targetAngle = 0;
    const arena = document.getElementById('mg-stage1-arena');
    const orbit = document.getElementById('mg-orbit');
    const sealBtn = document.getElementById('mg-seal-btn');
    const progressText = document.getElementById('mg-progress');

    // Create orbiting orbs
    const updateOrb = () => {
      targetAngle = Math.floor(Math.random() * 300) + 30;
      orbit.innerHTML = `
        <div class="mg-orb" style="transform: rotate(${targetAngle}deg) translate(80px) rotate(-${targetAngle}deg);">
          ✨ ${emotions[score] || 'JPC'}
        </div>
      `;
    };

    updateOrb();

    // Rotate ring animation
    let ringAngle = 0;
    const animateRing = () => {
      ringAngle = (ringAngle + 2) % 360;
      const targetZone = document.getElementById('mg-target');
      if (targetZone) {
        targetZone.style.transform = `rotate(${ringAngle}deg)`;
      }
      this.animFrame = requestAnimationFrame(animateRing);
    };
    animateRing();

    const handleTap = () => {
      const diff = Math.abs((ringAngle % 360) - (targetAngle % 360));
      // Generous window for good touch feel
      if (diff < 50 || diff > 310) {
        score++;
        if (window.audioManager) window.audioManager.playHit(true);
        progressText.textContent = `${score}/${targetScore}`;

        // Visual flash
        arena.classList.add('flash-success');
        setTimeout(() => arena.classList.remove('flash-success'), 200);

        if (score >= targetScore) {
          sealBtn.disabled = true;
          sealBtn.textContent = 'ĐÃ GỬI LÁ ĐƠN!';
          this.container.querySelector('.mg-header p').innerHTML = '<span style="color:#ffd166; font-weight:bold;">Tuyệt vời! Lá đơn của bạn đã sáng rực và bay đến hòm thư JPC!</span>';
          this.finish(true);
        } else {
          updateOrb();
        }
      } else {
        if (window.audioManager) window.audioManager.playHit(false);
        arena.classList.add('shake');
        setTimeout(() => arena.classList.remove('shake'), 200);
      }
    };

    sealBtn.addEventListener('click', handleTap);
    arena.addEventListener('click', handleTap);
  }

  // MINIGAME 2: HÒA NHỊP — PHỎNG VẤN ONLINE VỚI GIAO DIỆN MÀN HÌNH MÁY TÍNH & MULTIPLE CHOICE
  runStage2Game() {
    const compModal = document.getElementById('computer-interview-modal');
    if (!compModal) return;

    compModal.classList.remove('hidden');

    const pipImg = document.getElementById('applicant-pip-img');
    const pipName = document.getElementById('applicant-pip-name');
    if (window.gameInstance) {
      if (pipName) pipName.textContent = window.gameInstance.playerName;
      if (pipImg && window.gameInstance.player.selectedDept) {
        pipImg.src = `Image/Kokeshi 5 Ban/kokeshi-${window.gameInstance.player.selectedDept}.png`;
      }
    }

    const qScreen = document.getElementById('quiz-question-screen');
    const cScreen = document.getElementById('quiz-complete-screen');
    const qBadge = document.getElementById('quiz-step-badge');
    const qPromptContainer = document.getElementById('quiz-prompt-container');
    const qChoices = document.getElementById('quiz-choices');
    const expBox = document.getElementById('quiz-explanation-box');
    const expTitle = document.getElementById('quiz-explanation-title');
    const expReason = document.getElementById('quiz-explanation-reason');
    const nextBtn = document.getElementById('btn-quiz-next');

    const resultBadge = document.getElementById('quiz-result-badge');
    const resultTitle = document.getElementById('quiz-result-title');
    const resultScore = document.getElementById('quiz-result-score');
    const resultFeedback = document.getElementById('quiz-result-feedback');
    const passBtn = document.getElementById('btn-pass-interview');
    const retryBtn = document.getElementById('btn-retry-interview');

    // 5 câu hỏi chuẩn theo yêu cầu người dùng
    const questions = [
      {
        prompt: 'JPC là viết tắt của:',
        choices: [
          'A. (FTU) Japanese Club',
          'B. Jumpscare PY Corp.',
          'C. Just Personal Computer',
          'D. Journal of Physical Chemistry'
        ],
        correct: 0,
        explanation: 'JPC chính là viết tắt của (FTU) Japanese Club — Câu lạc bộ Tiếng Nhật Trường Đại học Ngoại Thương!'
      },
      {
        prompt: 'Slogan của JPC là:',
        choices: [
          'A. Dame dame, dame yo, dame na no yo',
          'B. Baby watch it burn send death to isolation',
          'C. Ichigo Ichie - Nhất kỳ nhất hội (một đời một kiếp một bọn người)',
          'D. "Vui lòng quay video selfie để chứng minh bạn là người thật"'
        ],
        correct: 2,
        explanation: 'Slogan của JPC là "Ichigo Ichie - Nhất kỳ nhất hội (một đời một kiếp một bọn người)" — biểu trưng cho sự trân quý từng cơ duyên gặp gỡ trong đời!'
      },
      {
        prompt: 'Chiếc áo khoác siêu ngầu như ảnh bên cạnh gọi là gì?',
        image: 'Image/happi-jpc.jpg',
        choices: [
          'A. Happy',
          'B. Happi',
          'C. Hapi',
          'D. Heppi'
        ],
        correct: 1,
        explanation: 'Happi (法被) là trang phục truyền thống của Nhật Bản thường mặc trong lễ hội, và là chiếc áo đồng phục siêu ngầu mang đậm bản sắc của các thế hệ JPC!'
      },
      {
        prompt: 'JPC có thích chiikawa không?',
        choices: [
          'A. Ú na?',
          'B. Eee~~ e-etou',
          'C. Uwawa Uwa',
          'D. Đáp án trên đều đúng'
        ],
        correct: 3,
        explanation: 'Tất cả các thành viên JPC đều cực kỳ đam mê và yêu thích những giai điệu đáng yêu của Chiikawa!'
      },
      {
        prompt: 'Vị trí tương đối của bàn trực của JPC nằm ở đâu trong văn phòng CLB?',
        choices: [
          'A. Gần cầu thang lên tầng 2 cuối tòa B, đối diện nhà thể chất, kẹp giữa CFE và CFAA',
          'B. Gần cầu thang lên tầng 2 tòa D, mặt hướng sân nhà D, kẹp giữa KDC và FGC',
          'C. Đi thằng rẽ phải',
          'D. Cho em đáp án đúng rồi em nhớ luôn!'
        ],
        correct: 0,
        explanation: 'Bàn trực của JPC nằm gần cầu thang lên tầng 2 cuối Tòa B, đối diện Nhà Thể Chất, kẹp giữa CFE và CFAA nhé!'
      }
    ];

    let currentQ = 0;
    let score = 0;
    let answered = false;

    const startQuiz = () => {
      currentQ = 0;
      score = 0;
      if (qScreen) qScreen.classList.remove('hidden');
      if (cScreen) cScreen.classList.add('hidden');
      renderQuestion();
    };

    const renderQuestion = () => {
      answered = false;
      const q = questions[currentQ];

      if (qBadge) qBadge.textContent = `CÂU HỎI ${currentQ + 1} / ${questions.length}`;

      if (qPromptContainer) {
        if (q.image) {
          qPromptContainer.innerHTML = `
            <div class="quiz-media-prompt">
              <div class="quiz-img-wrapper zoomable-img" onclick="if (window.openImageLightbox) window.openImageLightbox('${q.image}', 'Trang phục truyền thống của CLB Tiếng Nhật JPC FTU')" title="Bấm vào ảnh để phóng to xem chi tiết">
                <img src="${q.image}" alt="Trang phục truyền thống JPC" class="quiz-happi-img">
                <span class="quiz-zoom-hint">🔍 Phóng to</span>
              </div>
              <div class="quiz-prompt-text">${q.prompt}</div>
            </div>
          `;
        } else {
          qPromptContainer.innerHTML = `<h3 class="quiz-prompt">${q.prompt}</h3>`;
        }
      }

      if (expBox) {
        expBox.className = 'quiz-explanation-box hidden';
      }
      if (nextBtn) {
        nextBtn.classList.add('hidden');
      }

      if (qChoices) {
        qChoices.innerHTML = '';
        const allBtns = [];

        q.choices.forEach((choiceText, index) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'quiz-choice-btn';
          btn.textContent = choiceText;
          allBtns.push(btn);

          btn.addEventListener('click', () => {
            if (answered) return;
            answered = true;

            // Disable all choice buttons for this question
            allBtns.forEach(b => b.classList.add('disabled'));

            if (index === q.correct) {
              score++;
              btn.classList.add('correct');
              if (window.audioManager) window.audioManager.playHit(true);

              if (expBox) {
                expBox.className = 'quiz-explanation-box success';
                if (expTitle) {
                  expTitle.className = 'quiz-explanation-title success';
                  expTitle.textContent = '🎉 CHÍNH XÁC!';
                }
                if (expReason) {
                  expReason.textContent = q.explanation;
                }
                expBox.classList.remove('hidden');
              }
            } else {
              // Bôi đỏ đáp án đã chọn và đồng thời bôi xanh đáp án đúng
              btn.classList.add('wrong');
              if (allBtns[q.correct]) {
                allBtns[q.correct].classList.add('correct');
              }
              if (window.audioManager) window.audioManager.playHit(false);

              if (expBox) {
                expBox.className = 'quiz-explanation-box error';
                if (expTitle) {
                  expTitle.className = 'quiz-explanation-title error';
                  expTitle.textContent = `✗ CHƯA CHÍNH XÁC! (Đáp án đúng: ${q.choices[q.correct]})`;
                }
                if (expReason) {
                  expReason.textContent = q.explanation;
                }
                expBox.classList.remove('hidden');
              }
            }

            // Show Next Button
            if (nextBtn) {
              nextBtn.textContent = (currentQ < questions.length - 1) ? 'CÂU TIẾP THEO ▶' : 'XEM KẾT QUẢ PHỎNG VẤN ▶';
              nextBtn.classList.remove('hidden');
            }
          });

          qChoices.appendChild(btn);
        });
      }
    };

    if (nextBtn) {
      nextBtn.onclick = () => {
        if (currentQ < questions.length - 1) {
          currentQ++;
          renderQuestion();
        } else {
          // All 5 questions completed -> Show results
          showResults();
        }
      };
    }

    const showResults = () => {
      if (qScreen) qScreen.classList.add('hidden');
      if (cScreen) cScreen.classList.remove('hidden');

      const passed = score >= 4;

      if (passed) {
        if (resultBadge) {
          resultBadge.className = 'complete-badge';
          resultBadge.textContent = `🎉 XUẤT SẮC VƯỢT QUA (${score}/5 CÂU)`;
        }
        if (resultTitle) resultTitle.textContent = 'PHỎNG VẤN TRỰC TUYẾN THÀNH CÔNG!';
        if (resultScore) resultScore.textContent = `ĐIỂM SỐ: ${score} / 5`;
        if (resultFeedback) {
          resultFeedback.textContent = '"Em đã xuất sắc thể hiện sự thấu hiểu tuyệt vời về JPC và tinh thần Ngoại Thương rực rỡ! Chào mừng em tiến thẳng vào Hội trát 3.1: Phá Phong!"';
        }
        if (passBtn) passBtn.classList.remove('hidden');
        if (retryBtn) retryBtn.classList.add('hidden');
        if (window.audioManager) window.audioManager.playFanfare();
      } else {
        if (resultBadge) {
          resultBadge.className = 'complete-badge fail';
          resultBadge.textContent = `⚠️ CHƯA ĐẠT YÊU CẦU (Đạt ${score}/5 — Cần tối thiểu 4/5 câu)`;
        }
        if (resultTitle) resultTitle.textContent = 'KẾT QUẢ PHỎNG VẤN: CHƯA ĐẠT';
        if (resultScore) resultScore.textContent = `ĐIỂM SỐ: ${score} / 5 (CẦN TỐI THIỂU 4/5)`;
        if (resultFeedback) {
          resultFeedback.textContent = '"Rất tiếc! Để vượt qua vòng phỏng vấn online, em cần đạt tối thiểu 4/5 câu trả lời chính xác. Đừng nản lòng, hãy nhấn nút bên dưới để thử lại nhé!"';
        }
        if (passBtn) passBtn.classList.add('hidden');
        if (retryBtn) retryBtn.classList.remove('hidden');
        if (window.audioManager) window.audioManager.playHit(false);
      }
    };

    if (retryBtn) {
      retryBtn.onclick = () => {
        startQuiz();
      };
    }

    if (passBtn) {
      passBtn.onclick = () => {
        compModal.classList.add('hidden');
        this.finish(true);
      };
    }

    startQuiz();
  }

  // =========================================================================
  // MINIGAME 3.1: PHÁ PHONG — TỔ ĐỘI 5 BAN LIÊN MÁY CHỦ ĐÁNH TENGU (NHÂN SƯ CHÉO BAN)
  // =========================================================================
  runStage31Game() {
    const tenguModal = document.getElementById('tengu-battle-modal');
    if (!tenguModal) {
      this.finish(true);
      return;
    }

    this.cleanup();
    this.init();
    if (this.modal) this.modal.classList.add('hidden');
    tenguModal.classList.remove('hidden');

    const lobbyScreen = document.getElementById('tengu-lobby-screen');
    const fightScreen = document.getElementById('tengu-fight-screen');
    const resultScreen = document.getElementById('tengu-result-screen');
    const lobbyGrid = document.getElementById('tengu-party-lobby-grid');
    const matchStatusEl = document.getElementById('tengu-match-status');
    const syncBadgeEl = document.getElementById('tengu-sync-badge');
    const startNowBtn = document.getElementById('btn-tengu-start-now');
    const closeBtn = document.getElementById('btn-close-tengu-modal');

    const DEPTS = [
      { key: 'chuyenmon', short: 'BCM', name: 'Ban Chuyên Môn', img: 'Image/Kokeshi 5 Ban/kokeshi-chuyenmon.png' },
      { key: 'doingoai', short: 'BĐN', name: 'Ban Đối Ngoại', img: 'Image/Kokeshi 5 Ban/kokeshi-doingoai.png' },
      { key: 'tochuc', short: 'BTC', name: 'Ban Tổ Chức', img: 'Image/Kokeshi 5 Ban/kokeshi-tochuc.png' },
      { key: 'thongtin', short: 'BTT', name: 'Ban Thông Tin', img: 'Image/Kokeshi 5 Ban/kokeshi-thongtin.png' },
      { key: 'nhansu', short: 'BNS', name: 'Ban Nhân Sự', img: 'Image/Kokeshi 5 Ban/kokeshi-nhansu.png' }
    ];

    const ALLY_PROFILES = {
      chuyenmon: [
        { playerName: 'Minh Nhật (K63)', serverLabel: 'SV-ChùaLáng' },
        { playerName: 'Hải Yến (BCM)', serverLabel: 'SV-Tokyo' }
      ],
      doingoai: [
        { playerName: 'Khánh Linh (BĐN)', serverLabel: 'SV-HồGươm' },
        { playerName: 'Gia Bảo (K64)', serverLabel: 'SV-Osaka' }
      ],
      tochuc: [
        { playerName: 'Tuấn Kiệt (BTC)', serverLabel: 'SV-NhàB' },
        { playerName: 'Phương Anh (K63)', serverLabel: 'SV-Kyoto' }
      ],
      thongtin: [
        { playerName: 'Hà Vy (BTT)', serverLabel: 'SV-NhàD' },
        { playerName: 'Đức Anh (K64)', serverLabel: 'SV-FCD' }
      ],
      nhansu: [
        { playerName: 'Thảo Nhi (BNS)', serverLabel: 'SV-VJCBI' },
        { playerName: 'Quốc Huy (K63)', serverLabel: 'SV-Sakura' }
      ]
    };

    const QUESTION_BANK = {
      chuyenmon: [
        {
          prompt: 'Tên đầy đủ viết tắt của CLB Tiếng Nhật JPC là (FTU) _________ Club.',
          answer: 'Japanese',
          accept: ['japanese'],
          clue: '_ _ _ _ _ _ _ _ (8 chữ cái tiếng Anh)'
        },
        {
          prompt: 'Loại búp bê gỗ truyền thống Nhật Bản đại diện cho 5 ban của JPC gọi là _________.',
          answer: 'Kokeshi',
          accept: ['kokeshi'],
          clue: '_ _ _ _ _ _ _ (7 chữ cái)'
        },
        {
          prompt: 'Câu chào tiếng Nhật xuất hiện trong tên chiến dịch chào tân Gen 22 là _________ Gen 22.',
          answer: 'Konnichiwa',
          accept: ['konnichiwa'],
          clue: '_ _ _ _ _ _ _ _ _ _ (10 chữ cái)'
        }
      ],
      nhansu: [
        {
          prompt: 'Slogan gắn kết nổi tiếng của JPC: "_________ Ichie — Nhất kỳ nhất hội".',
          answer: 'Ichigo',
          accept: ['ichigo', 'ichigo ichie'],
          clue: '_ _ _ _ _ _ (6 chữ cái)'
        },
        {
          prompt: 'Với các thành viên, JPC không chỉ là một CLB mà còn là một mái nhà _________ tại Ngoại Thương.',
          answer: 'Gia đình',
          accept: ['gia dinh', 'gia đình', 'am ap', 'ấm áp'],
          clue: '_ _ _ / _ _ _ _ (2 tiếng)'
        }
      ],
      thongtin: [
        {
          prompt: 'Chiếc áo khoác lễ hội truyền thống đầy kiêu hãnh trong các ấn phẩm của JPC gọi là áo _________.',
          answer: 'Happi',
          accept: ['happi'],
          clue: '_ _ _ _ _ (5 chữ cái)'
        },
        {
          prompt: 'Nhân vật dễ thương từng xuất hiện trong bộ câu hỏi Phỏng Vấn Vòng 2 rất được nhà JPC yêu thích là _________.',
          answer: 'Chiikawa',
          accept: ['chiikawa'],
          clue: '_ _ _ _ _ _ _ _ (8 chữ cái)'
        }
      ],
      tochuc: [
        {
          prompt: 'Ngày hội các Câu lạc bộ thường niên tại FTU vào 18/10 viết tắt là _________ (FTU Club\'s Day).',
          answer: 'FCD',
          accept: ['fcd', 'ftu club day', 'ftu clubs day'],
          clue: '_ _ _ (3 chữ cái viết tắt)'
        },
        {
          prompt: 'Thử thách Hội Trát 3.1 hợp lực tổ đội đánh bại Tengu mang tên _________.',
          answer: 'Phá Phong',
          accept: ['pha phong', 'phá phong'],
          clue: '_ _ _ / _ _ _ _ _ (2 tiếng)'
        }
      ],
      doingoai: [
        {
          prompt: 'Trường Đại học Ngoại Thương — mái nhà chung của đại gia đình JPC — viết tắt là _________.',
          answer: 'FTU',
          accept: ['ftu'],
          clue: '_ _ _ (3 chữ cái)'
        },
        {
          prompt: 'Con đường huyền thoại gắn liền với Đại học Ngoại Thương Hà Nội tại số 91 là phố _________.',
          answer: 'Chùa Láng',
          accept: ['chua lang', 'chùa láng'],
          clue: '_ _ _ _ / _ _ _ _ (2 tiếng)'
        }
      ]
    };

    const normalizeAnswer = (text) => {
      return String(text || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    };

    const game = window.gameInstance;
    const sync = window.firebaseSync;
    const myPlayerId = sync ? sync.playerId : ('local_' + Math.random().toString(36).slice(2, 8));
    const myDept = (game && game.player && game.player.selectedDept) ? game.player.selectedDept : 'chuyenmon';
    const myDeptObj = DEPTS.find(d => d.key === myDept) || DEPTS[0];
    const myName = (game && game.playerName) ? game.playerName : 'Kouhai Gen 22';
    const myServerLabel = sync ? sync.serverInfo.serverLabel : 'Máy Chủ Cục Bộ';

    let roomState = null;
    let roomMode = 'local';
    let resolvedSlots = {};
    let questionsList = [];
    let currentQIdx = 0;
    let tenguHp = 100;
    let questionStartTime = Date.now();
    let battleHistory = [];
    let qLocked = false;
    let battleFinished = false;

    const showPhase = (phase) => {
      if (lobbyScreen) lobbyScreen.classList.toggle('hidden', phase !== 'lobby');
      if (fightScreen) fightScreen.classList.toggle('hidden', phase !== 'fight');
      if (resultScreen) resultScreen.classList.toggle('hidden', phase !== 'result');
    };

    const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

    const buildFullSlots = (existingSlots = {}) => {
      const filled = {};
      DEPTS.forEach(d => {
        if (existingSlots[d.key] && existingSlots[d.key].isHuman) {
          filled[d.key] = { ...existingSlots[d.key] };
        } else {
          const bot = pickRandom(ALLY_PROFILES[d.key]);
          filled[d.key] = {
            playerId: 'ally_' + d.key,
            playerName: bot.playerName,
            dept: d.key,
            deptName: d.name,
            serverKey: 'cross_' + d.key,
            serverLabel: bot.serverLabel,
            isHuman: false
          };
        }
      });
      return filled;
    };

    // Derangement: NO department ever gets assigned its own department's question!
    // Guarantee Câu 5 (mấu chốt cuối cùng) is cross-ban assigned to a human player (prefer local player if solo/lead)
    const generateCrossBanQuestions = (slots) => {
      const deptKeys = DEPTS.map(d => d.key);
      // Cyclic shift guarantees assignedDept !== sourceDept for all 5 depts!
      const shift = 1 + Math.floor(Math.random() * 4); // 1..4 so never 0
      const pairs = deptKeys.map((srcKey, idx) => {
        const assignedKey = deptKeys[(idx + shift) % deptKeys.length];
        return { sourceDept: srcKey, assignedDept: assignedKey };
      });

      // Move pair whose assignedDept matches local player's dept to LAST index (index 4 = Câu 5 Mấu chốt!)
      const myPairIdx = pairs.findIndex(p => p.assignedDept === myDept);
      if (myPairIdx !== -1 && myPairIdx !== 4) {
        const tmp = pairs[4];
        pairs[4] = pairs[myPairIdx];
        pairs[myPairIdx] = tmp;
      }

      return pairs.map((p, idx) => {
        const pool = QUESTION_BANK[p.sourceDept];
        const chosen = pickRandom(pool);
        const srcMeta = DEPTS.find(d => d.key === p.sourceDept);
        const asnMeta = DEPTS.find(d => d.key === p.assignedDept);
        return {
          qNum: idx + 1,
          sourceDept: p.sourceDept,
          sourceName: srcMeta.name,
          sourceShort: srcMeta.short,
          assignedDept: p.assignedDept,
          assignedName: asnMeta.name,
          assignedShort: asnMeta.short,
          assigneePlayerName: slots[p.assignedDept]?.playerName || asnMeta.name,
          assigneeIsHuman: !!slots[p.assignedDept]?.isHuman,
          prompt: chosen.prompt,
          answer: chosen.answer,
          accept: chosen.accept,
          clue: chosen.clue,
          isFinalDecisive: idx === 4
        };
      });
    };

    const renderLobbySlots = (slots = {}) => {
      if (!lobbyGrid) return;
      lobbyGrid.innerHTML = '';
      DEPTS.forEach(d => {
        const member = slots[d.key];
        const isYou = member && member.playerId === myPlayerId;
        const slotEl = document.createElement('div');
        slotEl.className = `tengu-lobby-slot ${isYou ? 'you' : (member ? 'matched' : '')}`;
        slotEl.innerHTML = `
          <img src="${d.img}" alt="${d.name}">
          <div class="tengu-slot-dept">${d.name}</div>
          <div class="tengu-slot-player">${member ? member.playerName : 'Đang tìm...'}${isYou ? ' (Bạn)' : ''}</div>
          <div class="tengu-slot-server">${member ? '🌐 ' + member.serverLabel : '⏳ Hàng chờ'}</div>
        `;
        lobbyGrid.appendChild(slotEl);
      });
    };

    const updateHPUI = () => {
      const hpVal = document.getElementById('tengu-hp-value');
      const segs = document.querySelectorAll('#tengu-hp-segments .hp-seg');
      const activeCount = Math.round(tenguHp / 20);
      if (hpVal) hpVal.textContent = `${tenguHp}% / 100% HP`;
      segs.forEach((seg, idx) => {
        seg.classList.toggle('active', idx < activeCount);
      });
    };

    const renderPartyStrip = (q) => {
      const strip = document.getElementById('tengu-battle-party-strip');
      if (!strip || !q) return;
      strip.innerHTML = '';
      DEPTS.forEach(d => {
        const member = resolvedSlots[d.key];
        const isSource = q.sourceDept === d.key;
        const isAssigned = q.assignedDept === d.key;
        const chip = document.createElement('div');
        chip.className = `tengu-party-chip ${isAssigned ? 'assigned-dept' : (isSource ? 'source-dept' : '')}`;
        const tag = isAssigned ? '🎯 TRẢ LỜI' : (isSource ? '📜 CHỦ ĐỀ' : d.short);
        chip.innerHTML = `
          <img src="${d.img}" alt="${d.short}">
          <div class="tengu-party-chip-meta">
            <div class="tengu-party-chip-dept">${tag} · ${d.short}</div>
            <div class="tengu-party-chip-name">${member ? member.playerName : d.short}</div>
          </div>
        `;
        strip.appendChild(chip);
      });
    };

    const showHitVfx = (dmgText = '-20% HP!') => {
      const wrap = document.getElementById('tengu-boss-visual-wrap');
      const dmg = document.getElementById('tengu-dmg-float');
      if (dmg) {
        dmg.textContent = dmgText;
        dmg.classList.remove('hidden');
      }
      if (wrap) {
        wrap.classList.remove('hit');
        void wrap.offsetWidth;
        wrap.classList.add('hit');
      }
      setTimeout(() => {
        if (dmg) dmg.classList.add('hidden');
      }, 650);
    };

    const finishQuestion = async (ok, solverName, submittedText, elapsedSec) => {
      if (qLocked || battleFinished) return;
      qLocked = true;

      if (this.tenguTickTimer) clearInterval(this.tenguTickTimer);
      if (this.tenguAllyTimer) clearTimeout(this.tenguAllyTimer);
      this.tenguTickTimer = null;
      this.tenguAllyTimer = null;

      const q = questionsList[currentQIdx];
      const feedbackEl = document.getElementById('tengu-combat-feedback');

      if (ok) {
        tenguHp = Math.max(0, tenguHp - 20);
        updateHPUI();
        showHitVfx(q.isFinalDecisive ? '⚡ -20% KẾT LIỄU!' : '-20% HP!');
        if (window.audioManager) window.audioManager.playHit(true);
        if (feedbackEl) {
          feedbackEl.style.color = '#81c784';
          feedbackEl.textContent = `⚔️ CHÍNH XÁC (${elapsedSec.toFixed(1)}s)! ${solverName} gây -20% HP lên Tengu!`;
        }
      } else {
        if (window.audioManager) window.audioManager.playHit(false);
        if (feedbackEl) {
          feedbackEl.style.color = '#ff8a80';
          feedbackEl.textContent = `⌛ HẾT GIỜ 10s! Đáp án đúng là "${q.answer}" — Tengu chặn được đòn này!`;
        }
      }

      battleHistory.push({
        qNum: q.qNum,
        sourceName: q.sourceName,
        assignedName: q.assignedName,
        solverName,
        answer: q.answer,
        ok,
        elapsedSec,
        isFinal: q.isFinalDecisive
      });

      if (roomState && sync && (roomMode === 'firebase' || roomMode === 'master')) {
        sync.pushRoomUpdate(
          roomState,
          roomMode,
          ok ? 'solve_question' : 'timeout_question',
          {
            qIdx: currentQIdx,
            solvedBy: solverName,
            solvedDept: q.assignedDept,
            sourceDept: q.sourceDept,
            assignedName: solverName,
            assignedDept: q.assignedDept,
            answer: submittedText || q.answer,
            correctAnswer: q.answer,
            timeUsed: elapsedSec
          }
        );
      }

      setTimeout(() => {
        if (battleFinished) return;
        if (currentQIdx >= questionsList.length - 1) {
          renderResultScreen();
        } else {
          currentQIdx++;
          renderActiveQuestion();
        }
      }, 750);
    };

    const renderActiveQuestion = () => {
      if (battleFinished) return;
      qLocked = false;
      const q = questionsList[currentQIdx];
      if (!q) return;

      const counterEl = document.getElementById('tengu-q-counter');
      const boxEl = document.getElementById('tengu-riddle-box');
      const assignBanner = document.getElementById('tengu-cross-assign-banner');
      const questionEl = document.getElementById('tengu-riddle-question');
      const clueEl = document.getElementById('tengu-riddle-clue');
      const allyBanner = document.getElementById('tengu-ally-banner');
      const answerInput = document.getElementById('tengu-answer-input');
      const submitBtn = document.getElementById('tengu-submit-btn');
      const feedbackEl = document.getElementById('tengu-combat-feedback');
      const timerSecEl = document.getElementById('tengu-timer-sec');
      const timerPill = document.getElementById('tengu-timer-pill');
      const timerBar = document.getElementById('tengu-timer-bar-fill');

      const assignee = resolvedSlots[q.assignedDept];
      const isMyTurn = q.assignedDept === myDept;
      const isOtherHumanTurn = assignee && assignee.isHuman && assignee.playerId !== myPlayerId;

      if (counterEl) {
        counterEl.textContent = q.isFinalDecisive ? `⚡ CÂU ${q.qNum}/5 · MẤU CHỐT!` : `CÂU ${q.qNum} / 5 (-20% HP)`;
      }
      if (boxEl) boxEl.classList.toggle('final-blow', !!q.isFinalDecisive);

      if (assignBanner) {
        const whoText = isMyTurn ? `${assignee.playerName} (${q.assignedName} · BẠN)` : `${assignee.playerName} (${q.assignedName})`;
        assignBanner.textContent = q.isFinalDecisive
          ? `⚡ MẤU CHỐT KẾT LIỄU: Câu hỏi của [${q.sourceName}] ➔ 🎯 Chỉ định [${whoText}] tung đòn cuối!`
          : `📜 Câu hỏi của [${q.sourceName}] ➔ 🎯 Chỉ định [${whoText}] trả lời`;
      }

      if (questionEl) questionEl.textContent = q.prompt;
      if (clueEl) clueEl.textContent = `🔮 Gợi ý Nhân Sư: ${q.clue}`;
      if (feedbackEl) feedbackEl.textContent = '';

      renderPartyStrip(q);

      if (allyBanner) {
        if (isMyTurn) {
          allyBanner.classList.add('hidden');
        } else if (isOtherHumanTurn) {
          allyBanner.classList.remove('hidden');
          allyBanner.textContent = `🌐 Đang chờ người chơi ${assignee.playerName} (${assignee.serverLabel}) nhập đáp án...`;
        } else {
          allyBanner.classList.remove('hidden');
          allyBanner.textContent = `⌨️ Đồng đội ${assignee.playerName} (${assignee.serverLabel}) đang suy nghĩ... Bạn có thể nhập hỗ trợ sớm hơn!`;
        }
      }

      if (answerInput) {
        answerInput.value = '';
        answerInput.disabled = isOtherHumanTurn;
        answerInput.placeholder = isMyTurn
          ? 'Nhập từ còn thiếu (-20% HP)...'
          : (isOtherHumanTurn ? `Chờ ${assignee.playerName} (${q.assignedShort}) trả lời...` : 'Hỗ trợ đồng đội nhập đáp án để đánh nhanh hơn...');
        if (!isOtherHumanTurn) {
          setTimeout(() => answerInput.focus(), 40);
        }
      }
      if (submitBtn) {
        submitBtn.disabled = isOtherHumanTurn;
        submitBtn.textContent = isMyTurn
          ? (q.isFinalDecisive ? '⚡ ĐÒN KẾT LIỄU' : '⚔️ TUNG ĐÒN')
          : '🤝 HỖ TRỢ SỚM';
      }

      // 10.0-Second Countdown Loop
      const DURATION_MS = 10000;
      questionStartTime = Date.now();
      if (this.tenguTickTimer) clearInterval(this.tenguTickTimer);

      this.tenguTickTimer = setInterval(() => {
        if (qLocked || battleFinished) return;
        const elapsedMs = Date.now() - questionStartTime;
        const remainingMs = Math.max(0, DURATION_MS - elapsedMs);
        const remainingSec = remainingMs / 1000;
        const pct = (remainingMs / DURATION_MS) * 100;

        if (timerSecEl) timerSecEl.textContent = `${remainingSec.toFixed(1)}s`;
        if (timerBar) timerBar.style.width = `${pct}%`;
        const isUrgent = remainingSec <= 3.5;
        if (timerPill) timerPill.classList.toggle('urgent', isUrgent);
        if (timerBar) timerBar.classList.toggle('urgent', isUrgent);

        if (remainingMs <= 0) {
          finishQuestion(false, assignee ? assignee.playerName : q.assignedName, '', 10);
        }
      }, 80);

      // Cross-server ally behavior on non-human bot slots (auto-strikes around ~4s if player doesn't assist faster)
      if (!isMyTurn && !isOtherHumanTurn && assignee) {
        const delayMs = 3400 + Math.floor(Math.random() * 1400);
        this.tenguAllyTimer = setTimeout(() => {
          if (qLocked || battleFinished) return;
          const elapsedSec = (Date.now() - questionStartTime) / 1000;
          finishQuestion(true, assignee.playerName, q.answer, elapsedSec);
        }, delayMs);
      }
    };

    const renderResultScreen = () => {
      battleFinished = true;
      this.cleanup();
      showPhase('result');

      const finalBlowOk = battleHistory[4] && battleHistory[4].ok;
      const defeated = (tenguHp <= 0) && !!finalBlowOk;

      const rBadge = document.getElementById('tengu-result-badge');
      const rTitle = document.getElementById('tengu-result-title');
      const rDesc = document.getElementById('tengu-result-desc');
      const rLog = document.getElementById('tengu-result-log');
      const winBtn = document.getElementById('btn-tengu-victory-continue');
      const retryBtn = document.getElementById('btn-tengu-retry');

      if (rBadge) {
        rBadge.className = `tengu-result-badge ${defeated ? '' : 'fail'}`;
        rBadge.textContent = defeated
          ? '🎉 ĐẠI THẮNG PHÁ PHONG · TENGU 0% HP!'
          : `⚠️ TENGU VẪN CÒN ${tenguHp}% HP!`;
      }
      if (rTitle) {
        rTitle.textContent = defeated
          ? 'TỔ ĐỘI 5 BAN ĐÃ ĐÁNH BẠI HOÀN TOÀN TENGU!'
          : 'PHONG ẤN CHƯA VỠ HOÀN TOÀN!';
      }
      if (rDesc) {
        rDesc.textContent = defeated
          ? 'Nhờ sự phối hợp liên máy chủ ăn ý giữa 5 Ban JPC và đòn mấu chốt Câu 5 chuẩn xác, Tengu Bão Tố đã bị phong ấn hoàn toàn tại Nhà Thể Chất FTU!'
          : 'Tengu chỉ bị khuất phục khi cả 5 câu Nhân Sư (100% HP) đều được giải đúng trong 10s và Câu 5 Mấu Chốt thành công. Hãy tái đấu cùng tổ đội ngay nhé!';
      }

      if (rLog) {
        rLog.innerHTML = battleHistory.map(h => `
          <div class="tengu-log-row ${h.ok ? 'ok' : 'miss'}">
            <span>${h.ok ? '✅' : '❌'} <b>Câu ${h.qNum}${h.isFinal ? ' (Mấu Chốt)' : ''}</b> · ${h.sourceName} ➔ ${h.solverName}</span>
            <span>Đáp án: <b>${h.answer}</b> (${h.elapsedSec.toFixed(1)}s)</span>
          </div>
        `).join('');
      }

      if (winBtn) winBtn.classList.toggle('hidden', !defeated);
      if (retryBtn) retryBtn.classList.toggle('hidden', defeated);

      if (defeated && window.audioManager) window.audioManager.playFanfare();
      else if (window.audioManager) window.audioManager.playHit(false);

      // Record Stage 3.1 battle telemetry
      if (game && game.stageProgress && game.stageProgress.stage3_1) {
        game.stageProgress.stage3_1.tenguDefeated = defeated;
        game.stageProgress.stage3_1.teamworkDone = defeated;
        game.stageProgress.stage3_1.lastHpLeft = tenguHp;
        if (window.firebaseSync) window.firebaseSync.syncGameProgress(game, true);
      }
    };

    const startBossBattle = () => {
      if (this.tenguMatchTimer) {
        clearInterval(this.tenguMatchTimer);
        this.tenguMatchTimer = null;
      }
      resolvedSlots = buildFullSlots(roomState ? roomState.slots : {
        [myDept]: {
          playerId: myPlayerId,
          playerName: myName,
          dept: myDept,
          deptName: myDeptObj.name,
          serverLabel: myServerLabel,
          isHuman: true
        }
      });
      questionsList = generateCrossBanQuestions(resolvedSlots);
      currentQIdx = 0;
      tenguHp = 100;
      battleHistory = [];
      battleFinished = false;
      updateHPUI();
      showPhase('fight');

      if (roomState && sync && (roomMode === 'firebase' || roomMode === 'master')) {
        sync.pushRoomUpdate(roomState, roomMode, 'start_battle', {
          slots: resolvedSlots,
          questions: questionsList
        });
      }
      renderActiveQuestion();
    };

    // Bind Form Submit
    const answerForm = document.getElementById('tengu-answer-form');
    if (answerForm) {
      answerForm.onsubmit = (e) => {
        e.preventDefault();
        if (qLocked || battleFinished) return;
        const inputEl = document.getElementById('tengu-answer-input');
        const feedbackEl = document.getElementById('tengu-combat-feedback');
        const q = questionsList[currentQIdx];
        if (!inputEl || !q) return;

        const userNorm = normalizeAnswer(inputEl.value);
        const accepted = q.accept.map(normalizeAnswer);
        const isMatch = userNorm.length > 0 && (accepted.includes(userNorm) || userNorm === normalizeAnswer(q.answer));

        if (isMatch) {
          const elapsedSec = Math.max(0.2, (Date.now() - questionStartTime) / 1000);
          finishQuestion(true, myName, inputEl.value.trim(), elapsedSec);
        } else {
          if (window.audioManager) window.audioManager.playHit(false);
          if (feedbackEl) {
            feedbackEl.style.color = '#ffb74d';
            feedbackEl.textContent = '❌ Chưa khớp từ khóa! Hãy thử gõ lại nhanh khi đồng hồ 10s còn chạy!';
          }
          inputEl.select();
        }
      };
    }

    if (startNowBtn) startNowBtn.onclick = () => startBossBattle();

    const winBtn = document.getElementById('btn-tengu-victory-continue');
    if (winBtn) {
      winBtn.onclick = () => {
        tenguModal.classList.add('hidden');
        this.finish(true);
      };
    }

    const retryBtn = document.getElementById('btn-tengu-retry');
    if (retryBtn) {
      retryBtn.onclick = () => {
        showPhase('lobby');
        startMatchmaking();
      };
    }

    if (closeBtn) {
      closeBtn.onclick = () => {
        battleFinished = true;
        this.cleanup();
        tenguModal.classList.add('hidden');
      };
    }

    const startMatchmaking = async () => {
      showPhase('lobby');
      const initialSlots = {
        [myDept]: {
          playerId: myPlayerId,
          playerName: myName,
          dept: myDept,
          deptName: myDeptObj.name,
          serverLabel: myServerLabel,
          isHuman: true
        }
      };
      renderLobbySlots(initialSlots);

      if (sync) {
        try {
          const joined = await sync.joinStage31Room({
            playerName: myName,
            dept: myDept,
            deptName: myDeptObj.name
          });
          roomMode = joined.mode;
          roomState = joined.room;
          if (syncBadgeEl) {
            syncBadgeEl.textContent = roomMode === 'firebase'
              ? '🔥 Phòng Liên Máy Chủ (Firebase)'
              : (roomMode === 'master' ? '👑 Phòng Máy Chủ Mẹ' : '🌐 Tổ Đội Liên Máy Chủ');
          }
          renderLobbySlots(buildFullSlotsPreview(roomState.slots));

          this.tenguUnsubscribe = sync.subscribeBossRoom(roomState.roomId, roomMode, (updatedRoom) => {
            roomState = updatedRoom;
            if (updatedRoom.status === 'matching') {
              renderLobbySlots(buildFullSlotsPreview(updatedRoom.slots));
              return;
            }
            if (updatedRoom.status === 'fighting' && Array.isArray(updatedRoom.questions)) {
              const inLobby = lobbyScreen && !lobbyScreen.classList.contains('hidden');
              if (inLobby) {
                if (this.tenguMatchTimer) {
                  clearInterval(this.tenguMatchTimer);
                  this.tenguMatchTimer = null;
                }
                resolvedSlots = updatedRoom.slots || buildFullSlots(initialSlots);
                questionsList = updatedRoom.questions;
                tenguHp = typeof updatedRoom.tenguHp === 'number' ? updatedRoom.tenguHp : 100;
                currentQIdx = updatedRoom.currentQIdx || 0;
                battleHistory = Array.isArray(updatedRoom.history) ? updatedRoom.history : [];
                battleFinished = false;
                updateHPUI();
                showPhase('fight');
                renderActiveQuestion();
              } else if (updatedRoom.currentQIdx > currentQIdx && !qLocked && !battleFinished) {
                if (this.tenguTickTimer) clearInterval(this.tenguTickTimer);
                if (this.tenguAllyTimer) clearTimeout(this.tenguAllyTimer);
                tenguHp = updatedRoom.tenguHp;
                currentQIdx = updatedRoom.currentQIdx;
                if (Array.isArray(updatedRoom.history)) battleHistory = updatedRoom.history;
                updateHPUI();
                showHitVfx('-20% HP!');
                renderActiveQuestion();
              }
            } else if ((updatedRoom.status === 'victory' || updatedRoom.status === 'failed') && !battleFinished) {
              tenguHp = typeof updatedRoom.tenguHp === 'number' ? updatedRoom.tenguHp : tenguHp;
              if (Array.isArray(updatedRoom.history)) battleHistory = updatedRoom.history;
              updateHPUI();
              renderResultScreen();
            }
          });
        } catch (_) {}
      }

      // Countdown auto-matchmaking (4 seconds -> fills open slots with random cross-server allies & enters battle)
      let countdown = 4;
      if (matchStatusEl) {
        matchStatusEl.textContent = `🔍 Đang ghép ngẫu nhiên đủ 5 Ban liên máy chủ (${countdown}s)...`;
      }
      if (this.tenguMatchTimer) clearInterval(this.tenguMatchTimer);
      this.tenguMatchTimer = setInterval(() => {
        countdown--;
        if (countdown > 0) {
          if (matchStatusEl) {
            matchStatusEl.textContent = `🔍 Đang ghép ngẫu nhiên đủ 5 Ban liên máy chủ (${countdown}s)...`;
          }
        } else {
          clearInterval(this.tenguMatchTimer);
          this.tenguMatchTimer = null;
          const preview = buildFullSlots(roomState ? roomState.slots : initialSlots);
          renderLobbySlots(preview);
          if (matchStatusEl) {
            matchStatusEl.textContent = '✅ Tổ đội 5 Ban đã sẵn sàng! Chuẩn bị tiến công Tengu!';
          }
          setTimeout(() => {
            if (!tenguModal.classList.contains('hidden')) startBossBattle();
          }, 500);
        }
      }, 1000);
    };

    const buildFullSlotsPreview = (slots = {}) => {
      const merged = {};
      DEPTS.forEach(d => {
        if (slots[d.key]) merged[d.key] = slots[d.key];
      });
      return merged;
    };

    startMatchmaking();
  }

  // MINIGAME 3.2: CHÂN DIỆN - GƯƠNG SOI NỘI TÂM (Soul Dialogue)
  runStage32Game() {
    this.container.innerHTML = `
      <div class="mg-header">
        <h3>HỘI TRÁT 3.2: CHÂN DIỆN</h3>
        <p>Lắng đọng tâm tư - Hãy chọn tiếng nói chân thật nhất từ trái tim bạn.</p>
      </div>
      <div class="mg-stage4-arena">
        <div class="mirror-frame">
          <div class="mirror-glass" id="mirror-glass">
            <div class="mirror-reflection">🌸 KOUHAI GEN 22 🌸</div>
          </div>
        </div>
        <div class="soul-question" id="soul-q">...</div>
        <div class="soul-choices" id="soul-c"></div>
      </div>
    `;

    const questions = [
      {
        q: "Điều gì thôi thúc bạn chọn bước vào cánh cửa JPC giữa muôn vàn CLB tại Ngoại Thương?",
        choices: [
          "Đam mê vẻ đẹp văn hóa và con người xứ sở mặt trời mọc.",
          "Muốn tìm một mái nhà ấm áp để cùng cười, cùng trưởng thành tại FTU.",
          "Muốn thử thách bản thân và bứt phá khỏi vùng an toàn."
        ]
      },
      {
        q: "Khi gặp khó khăn trước áp lực học tập và deadline sự kiện tại FTU, bạn sẽ làm gì?",
        choices: [
          "Chủ động sẻ chia, cùng lắng nghe và tìm tiếng nói chung với đồng đội.",
          "Giữ tinh thần lạc quan, trở thành điểm tựa vững chãi cho cả nhóm.",
          "Không ngần ngại học hỏi từ các anh chị tiền bối JPC."
        ]
      },
      {
        q: "Với bạn, JPC trong những năm tháng tại Trường Đại học Ngoại Thương sẽ là...?",
        choices: [
          "Nơi lưu giữ thanh xuân rực rỡ nhất thời sinh viên FTU.",
          "Cầu nối đưa đam mê tiếng Nhật và văn hóa của tôi vươn xa hơn nữa.",
          "Gia đình thứ hai luôn dang rộng vòng tay đón tôi về."
        ]
      }
    ];

    let currentQ = 0;
    const qElem = document.getElementById('soul-q');
    const cElem = document.getElementById('soul-c');
    const glass = document.getElementById('mirror-glass');

    const showQuestion = () => {
      if (currentQ >= questions.length) {
        qElem.innerHTML = '<span style="color:#ffd166; font-size:15px;">"Chân Diện sáng tỏ – Bạn chính là mảnh ghép trọn vẹn mà JPC hằng tìm kiếm!"</span>';
        cElem.innerHTML = '';
        glass.classList.add('glow-golden');
        this.finish(true);
        return;
      }

      const q = questions[currentQ];
      qElem.textContent = `Câu ${currentQ + 1}: ${q.q}`;
      cElem.innerHTML = '';

      q.choices.forEach(ch => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn soul-btn';
        btn.textContent = ch;
        btn.addEventListener('click', () => {
          if (window.audioManager) window.audioManager.playCollect();
          glass.classList.add('shimmer');
          setTimeout(() => glass.classList.remove('shimmer'), 500);
          currentQ++;
          showQuestion();
        });
        cElem.appendChild(btn);
      });
    };

    showQuestion();
  }
}

window.minigameManager = new MinigameManager();
