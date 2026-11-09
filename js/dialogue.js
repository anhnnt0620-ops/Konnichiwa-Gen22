// Retro Dialogue Box System with Typewriter Effect and Choices
class DialogueManager {
  constructor() {
    this.container = null;
    this.nameElem = null;
    this.textElem = null;
    this.avatarElem = null;
    this.choicesElem = null;
    this.continuePrompt = null;

    this.active = false;
    this.dialogueQueue = [];
    this.currentDialogue = null;
    this.currentCharIndex = 0;
    this.typingTimer = null;
    this.isTyping = false;
    this.onCompleteCallback = null;

    this.init();
  }

  init() {
    this.container = document.getElementById('dialogue-box');
    this.nameElem = document.getElementById('dialogue-speaker');
    this.textElem = document.getElementById('dialogue-text');
    this.avatarElem = document.getElementById('dialogue-avatar');
    this.choicesElem = document.getElementById('dialogue-choices');
    this.continuePrompt = document.getElementById('dialogue-continue');

    // Tap/Click on dialogue box or screen advances it
    if (this.container) {
      this.container.addEventListener('click', (e) => {
        // Do not advance if clicking inside choices
        if (e.target.closest('#dialogue-choices')) return;
        this.advance();
      });
    }

    // Tap anywhere on the game screen when dialogue is open
    document.addEventListener('pointerdown', (e) => {
      if (!this.active) return;
      if (e.target.closest('#dialogue-choices')) return;
      if (e.target.closest('.modal-overlay')) return;
      if (e.target.closest('#touch-controls')) {
        // If user taps action button [A], it already advances; if user taps D-pad, advance too!
        this.advance();
        return;
      }
      this.advance();
    });
  }

  // Start a sequence of dialogue lines
  // lines = [ { speaker: '...', text: '...', avatar: '...', choices: [...] } ]
  startDialogue(lines, onComplete = null) {
    if (!lines || lines.length === 0) return;
    this.dialogueQueue = [...lines];
    this.onCompleteCallback = onComplete;
    this.active = true;
    this.container.classList.remove('hidden');

    this.showNextLine();
  }

  showNextLine() {
    if (this.dialogueQueue.length === 0) {
      this.endDialogue();
      return;
    }

    this.currentDialogue = this.dialogueQueue.shift();
    this.nameElem.textContent = this.currentDialogue.speaker || 'JPC';
    this.textElem.textContent = '';
    this.choicesElem.innerHTML = '';
    this.choicesElem.classList.add('hidden');
    this.continuePrompt.classList.add('hidden');

    // Update avatar if provided
    if (this.currentDialogue.speaker && this.currentDialogue.speaker.includes('Senpai')) {
      this.avatarElem.className = 'dialogue-avatar';
      this.avatarElem.innerHTML = '<img src="Image/kokeshi-senpai.png" style="width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));">';
      this.avatarElem.classList.remove('hidden');
    } else if (this.currentDialogue.avatar) {
      this.avatarElem.className = 'dialogue-avatar ' + this.currentDialogue.avatar;
      this.avatarElem.innerHTML = '';
      this.avatarElem.classList.remove('hidden');
    } else {
      this.avatarElem.classList.add('hidden');
    }

    this.currentCharIndex = 0;
    this.isTyping = true;
    if (this.typingTimer) clearInterval(this.typingTimer);

    const fullText = this.currentDialogue.text;
    this.typingTimer = setInterval(() => {
      if (this.currentCharIndex < fullText.length) {
        this.textElem.textContent += fullText[this.currentCharIndex];
        if (this.currentCharIndex % 2 === 0 && window.audioManager) {
          window.audioManager.playBlip();
        }
        this.currentCharIndex++;
      } else {
        this.finishTyping();
      }
    }, 28);
  }

  finishTyping() {
    clearInterval(this.typingTimer);
    this.isTyping = false;
    this.textElem.textContent = this.currentDialogue.text;

    if (this.currentDialogue.choices && this.currentDialogue.choices.length > 0) {
      this.showChoices(this.currentDialogue.choices);
    } else {
      this.continuePrompt.classList.remove('hidden');
    }
  }

  showChoices(choices) {
    this.choicesElem.innerHTML = '';
    this.choicesElem.classList.remove('hidden');

    choices.forEach(choice => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = choice.text;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.audioManager) window.audioManager.playCollect();
        if (choice.onSelect) {
          choice.onSelect();
        }
        this.showNextLine();
      });
      this.choicesElem.appendChild(btn);
    });
  }

  advance() {
    if (!this.active) return;

    if (this.isTyping) {
      // Fast forward to end of line
      this.finishTyping();
    } else if (!this.currentDialogue.choices || this.currentDialogue.choices.length === 0) {
      this.showNextLine();
    }
  }

  endDialogue() {
    this.active = false;
    if (this.typingTimer) clearInterval(this.typingTimer);
    this.container.classList.add('hidden');
    if (this.onCompleteCallback) {
      const cb = this.onCompleteCallback;
      this.onCompleteCallback = null;
      cb();
    }
  }
}

window.dialogueManager = new DialogueManager();

