// Minigames for JPC Journey
class MinigameManager {
  constructor() {
    this.container = null;
    this.modal = null;
    this.activeGame = null;
    this.onFinishCallback = null;
    this.timer = null;
    this.animFrame = null;
  }

  init() {
    this.modal = document.getElementById('minigame-modal');
    this.container = document.getElementById('minigame-container');
  }

  start(gameType, onFinish) {
    this.onFinishCallback = onFinish;
    this.activeGame = gameType;

    if (gameType === 'stage2') {
      this.runStage2Game();
      return;
    }

    this.modal.classList.remove('hidden');
    this.container.innerHTML = '';

    if (gameType === 'stage1') {
      this.runStage1Game();
    } else if (gameType === 'stage3_1') {
      this.runStage31Game();
    } else if (gameType === 'stage3_2') {
      this.runStage32Game();
    }
  }

  finish(success = true) {
    this.cleanup();
    if (window.audioManager) {
      window.audioManager.playFanfare();
    }

    const compModal = document.getElementById('computer-interview-modal');
    if (compModal) compModal.classList.add('hidden');

    setTimeout(() => {
      this.modal.classList.add('hidden');
      if (this.onFinishCallback) {
        this.onFinishCallback(success);
      }
    }, 600);
  }

  cleanup() {
    if (this.timer) clearInterval(this.timer);
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    this.timer = null;
    this.animFrame = null;
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

  // MINIGAME 3.1: PHÁ PHONG - BỨT PHÁ TEAMWORK (Catch Ideas)
  runStage31Game() {
    this.container.innerHTML = `
      <div class="mg-header">
        <h3>HỘI TRÁT 3.1: PHÁ PHONG</h3>
        <p>Di chuyển giỏ hứng để thu thập các ý tưởng sáng tạo cùng đồng đội!</p>
      </div>
      <div class="mg-stage3-arena" id="catch-arena">
        <div class="basket" id="player-basket">🤝 TEAM</div>
      </div>
      <div class="mg-score-bar">
        <span>Ý tưởng: <b id="idea-count">0/6</b></span>
        <span>Thời gian: <b id="mg-time">20s</b></span>
      </div>
      <div class="catch-controls">
        <button class="pixel-btn" id="btn-move-left">◀ TRÁI</button>
        <button class="pixel-btn" id="btn-move-right">PHẢI ▶</button>
      </div>
    `;

    const arena = document.getElementById('catch-arena');
    const basket = document.getElementById('player-basket');
    const countElem = document.getElementById('idea-count');
    const timeElem = document.getElementById('mg-time');

    const arenaW = arena.clientWidth || 340;
    let basketX = Math.floor(arenaW / 2) - 35;
    let score = 0;
    const targetScore = 6;
    let timeLeft = 20;
    let items = [];

    // Keyboard support for PC
    const onKey = (e) => {
      const currentW = arena.clientWidth || 340;
      if (e.key === 'ArrowLeft' || e.key === 'a') basketX = Math.max(10, basketX - 25);
      if (e.key === 'ArrowRight' || e.key === 'd') basketX = Math.min(currentW - 80, basketX + 25);
      basket.style.left = `${basketX}px`;
    };
    window.addEventListener('keydown', onKey);

    // Touch controls
    document.getElementById('btn-move-left').addEventListener('click', () => {
      basketX = Math.max(10, basketX - 35);
      basket.style.left = `${basketX}px`;
    });
    document.getElementById('btn-move-right').addEventListener('click', () => {
      const currentW = arena.clientWidth || 340;
      basketX = Math.min(currentW - 80, basketX + 35);
      basket.style.left = `${basketX}px`;
    });

    // Drag / Touch directly in arena
    arena.addEventListener('touchmove', (e) => {
      const rect = arena.getBoundingClientRect();
      const currentW = arena.clientWidth || 340;
      const touchX = e.touches[0].clientX - rect.left - 30;
      basketX = Math.max(10, Math.min(currentW - 70, touchX));
      basket.style.left = `${basketX}px`;
    });
    arena.addEventListener('mousemove', (e) => {
      if (e.buttons > 0) {
        const rect = arena.getBoundingClientRect();
        const currentW = arena.clientWidth || 340;
        const mouseX = e.clientX - rect.left - 30;
        basketX = Math.max(10, Math.min(currentW - 70, mouseX));
        basket.style.left = `${basketX}px`;
      }
    });

    // Spawn falling items
    const spawnTimer = setInterval(() => {
      if (score >= targetScore) return;
      const el = document.createElement('div');
      el.className = 'falling-item';
      const isGood = Math.random() > 0.25;
      el.innerHTML = isGood ? (Math.random() > 0.5 ? '💡' : '🧋') : '⚡';
      el.dataset.type = isGood ? 'good' : 'bad';
      const currentW = arena.clientWidth || 340;
      el.style.left = `${Math.floor(Math.random() * (currentW - 40))}px`;
      el.style.top = '0px';
      arena.appendChild(el);
      items.push({ elem: el, y: 0, speed: 2 + Math.random() * 2 });
    }, 800);

    // Game loop
    const updateGame = () => {
      for (let i = items.length - 1; i >= 0; i--) {
        const it = items[i];
        it.y += it.speed;
        it.elem.style.top = `${it.y}px`;

        // Collision with basket
        const bRect = basket.getBoundingClientRect();
        const iRect = it.elem.getBoundingClientRect();

        if (
          iRect.bottom >= bRect.top &&
          iRect.top <= bRect.bottom &&
          iRect.right >= bRect.left &&
          iRect.left <= bRect.right
        ) {
          if (it.elem.dataset.type === 'good') {
            score++;
            countElem.textContent = `${score}/${targetScore}`;
            if (window.audioManager) window.audioManager.playCollect();
          } else {
            if (window.audioManager) window.audioManager.playHit(false);
          }
          it.elem.remove();
          items.splice(i, 1);

          if (score >= targetScore) {
            clearInterval(spawnTimer);
            window.removeEventListener('keydown', onKey);
            this.container.querySelector('.mg-header p').innerHTML = '<span style="color:#70e000; font-weight:bold;">Đột phá thành công! Sản phẩm teamwork tuyệt vời ngoài mong đợi!</span>';
            this.finish(true);
            return;
          }
          continue;
        }

        // Out of bounds
        if (it.y > arena.clientHeight) {
          it.elem.remove();
          items.splice(i, 1);
        }
      }
      this.animFrame = requestAnimationFrame(updateGame);
    };
    updateGame();

    // Timer countdown
    this.timer = setInterval(() => {
      timeLeft--;
      timeElem.textContent = `${timeLeft}s`;
      if (timeLeft <= 0) {
        clearInterval(spawnTimer);
        window.removeEventListener('keydown', onKey);
        // Automatically give pass so user doesn't get stuck
        this.finish(true);
      }
    }, 1000);
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
