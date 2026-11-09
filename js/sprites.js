// Procedural Pixel Art Generator & Cache for JPC Game
class SpriteManager {
  constructor() {
    this.cache = {};
    this.images = {};
    this.tileSize = 32; // base tile size
  }

  init() {
    this.generatePlayerSprites();
    this.generateNPCSprites();
    this.generateTiles();
    this.generateProps();
    this.loadExternalAssets();
  }

  loadExternalAssets() {
    const assetList = {
      kokeshi_bcm: 'Image/Kokeshi 5 Ban/Ban Chuyên Môn.png',
      kokeshi_bns: 'Image/Kokeshi 5 Ban/Ban Nhân Sự.png',
      kokeshi_btt: 'Image/Kokeshi 5 Ban/Ban Thông Tin.png',
      kokeshi_btc: 'Image/Kokeshi 5 Ban/Ban Tổ Chức.png',
      kokeshi_bdn: 'Image/Kokeshi 5 Ban/Ban Đối Ngoại.png'
    };

    for (const [key, src] of Object.entries(assetList)) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        this.images[key] = img;
      };
    }
  }

  // Helper to create an offscreen canvas
  createCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    return { canvas: c, ctx: ctx };
  }

  // Draw a pixel grid from a matrix of hex colors
  drawMatrix(ctx, matrix, pixelSize = 2, startX = 0, startY = 0) {
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        const color = matrix[r][c];
        if (color && color !== '.' && color !== ' ') {
          ctx.fillStyle = color;
          ctx.fillRect(startX + c * pixelSize, startY + r * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  }

  // 1. PLAYER SPRITES (16x16 pixel definition scaled to 32x32)
  generatePlayerSprites() {
    const colors = {
      H: '#2c1e1a', // Hair dark brown
      S: '#ffdfba', // Skin peach
      E: '#1a1008', // Eye black
      B: '#e63946', // JPC Red scarf / badge
      W: '#f8f9fa', // White shirt
      P: '#2b2d42', // Navy pants
      O: '#4a4e69', // Shoe dark
      M: '#f4a261'  // Shadow / mouth
    };

    // Down idle
    const downIdle = [
      "....HHHHHH....",
      "...HHHHHHHH...",
      "...HHSSSSHH...",
      "...HHESSEHH...",
      "....SSMSS.....",
      "....WWBBWW....",
      "...WWWWWWWW...",
      "...WWWWWWWW...",
      "....PPPPPP....",
      "....PPPPPP....",
      "....OO..OO...."
    ];

    // Down walk 1
    const downWalk1 = [
      "....HHHHHH....",
      "...HHHHHHHH...",
      "...HHSSSSHH...",
      "...HHESSEHH...",
      "....SSMSS.....",
      "....WWBBWW....",
      "...WWWWWWWW...",
      "...WWWWWWWW...",
      "....PPPPPP....",
      "...PP....PP...",
      "..OO......OO.."
    ];

    // Down walk 2
    const downWalk2 = [
      "....HHHHHH....",
      "...HHHHHHHH...",
      "...HHSSSSHH...",
      "...HHESSEHH...",
      "....SSMSS.....",
      "....WWBBWW....",
      "...WWWWWWWW...",
      "...WWWWWWWW...",
      "....PPPPPP....",
      "....PP..PP....",
      "....OO..OO...."
    ];

    // Up idle
    const upIdle = [
      "....HHHHHH....",
      "...HHHHHHHH...",
      "...HHHHHHHH...",
      "...HHHHHHHH...",
      "....SSSSSS....",
      "....WWWWWW....",
      "...WWWWWWWW...",
      "...WWWWWWWW...",
      "....PPPPPP....",
      "....PPPPPP....",
      "....OO..OO...."
    ];

    // Side idle (Left - flip for Right)
    const sideIdle = [
      "....HHHHH.....",
      "...HHHHHHH....",
      "...HHSSSS.....",
      "...HHSSE......",
      "....SSSS......",
      "....WWBB......",
      "...WWWWWW.....",
      "...WWWWWW.....",
      "....PPPP......",
      "....PPPP......",
      "....OO........"
    ];

    const sideWalk = [
      "....HHHHH.....",
      "...HHHHHHH....",
      "...HHSSSS.....",
      "...HHSSE......",
      "....SSSS......",
      "....WWBB......",
      "...WWWWWW.....",
      "...WWWWWW.....",
      "...PP..PP.....",
      "..OO....OO....",
      ".............."
    ];

    const parseToColorMap = (asciiArray) => {
      return asciiArray.map(row => row.split('').map(char => colors[char] || '.'));
    };

    const render = (matrix, flipX = false) => {
      const { canvas, ctx } = this.createCanvas(32, 32);
      if (flipX) {
        ctx.translate(32, 0);
        ctx.scale(-1, 1);
      }
      this.drawMatrix(ctx, matrix, 2, 2, 4);
      return canvas;
    };

    this.cache['player_down_0'] = render(parseToColorMap(downIdle));
    this.cache['player_down_1'] = render(parseToColorMap(downWalk1));
    this.cache['player_down_2'] = render(parseToColorMap(downWalk2));

    this.cache['player_up_0'] = render(parseToColorMap(upIdle));
    this.cache['player_up_1'] = render(parseToColorMap(downWalk1));
    this.cache['player_up_2'] = render(parseToColorMap(downWalk2));

    this.cache['player_left_0'] = render(parseToColorMap(sideIdle));
    this.cache['player_left_1'] = render(parseToColorMap(sideWalk));
    this.cache['player_left_2'] = render(parseToColorMap(sideIdle));

    this.cache['player_right_0'] = render(parseToColorMap(sideIdle), true);
    this.cache['player_right_1'] = render(parseToColorMap(sideWalk), true);
    this.cache['player_right_2'] = render(parseToColorMap(sideIdle), true);
  }

  // 2. NPC SPRITES
  generateNPCSprites() {
    const makeNPC = (hairColor, shirtColor, accColor = '#e63946', hasGlasses = false) => {
      const { canvas, ctx } = this.createCanvas(32, 32);
      // Head
      ctx.fillStyle = hairColor;
      ctx.fillRect(8, 4, 16, 8);
      // Face
      ctx.fillStyle = '#ffdfba';
      ctx.fillRect(10, 8, 12, 8);
      // Eyes
      ctx.fillStyle = '#222';
      ctx.fillRect(12, 11, 2, 3);
      ctx.fillRect(18, 11, 2, 3);
      if (hasGlasses) {
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;
        ctx.strokeRect(11, 10, 4, 4);
        ctx.strokeRect(17, 10, 4, 4);
        ctx.strokeRect(15, 12, 2, 1);
      }
      // Smile
      ctx.fillStyle = '#e76f51';
      ctx.fillRect(14, 14, 4, 1);
      // Clothes
      ctx.fillStyle = shirtColor;
      ctx.fillRect(8, 16, 16, 10);
      // Badge / Scarf
      ctx.fillStyle = accColor;
      ctx.fillRect(14, 16, 4, 5);
      // Legs
      ctx.fillStyle = '#1d3557';
      ctx.fillRect(10, 26, 4, 5);
      ctx.fillRect(18, 26, 4, 5);

      return canvas;
    };

    // Mentor / Senpai JPC (Red/Navy Happi)
    this.cache['npc_senpai'] = makeNPC('#1a1a1a', '#e63946', '#ffffff');
    // Fellow Applicant A (Friendly boy, glasses)
    this.cache['npc_applicant_a'] = makeNPC('#4a3525', '#457b9d', '#e63946', true);
    // Fellow Applicant B (Cheerful girl, ponytail style hair)
    this.cache['npc_applicant_b'] = makeNPC('#6b3e26', '#f4a261', '#2a9d8f');
    // Team Leader (Organized, energetic)
    this.cache['npc_leader'] = makeNPC('#264653', '#2a9d8f', '#e76f51');
    // President / Head of JPC (Traditional festive Haori)
    this.cache['npc_president'] = makeNPC('#0d1b2a', '#1d3557', '#ffd166');
  }

  // 3. TILES (Floors, Grass, Tatami, Paths)
  generateTiles() {
    const size = this.tileSize;

    // Tatami Floor
    const { canvas: tatami, ctx: tCtx } = this.createCanvas(size, size);
    tCtx.fillStyle = '#d4c596';
    tCtx.fillRect(0, 0, size, size);
    tCtx.strokeStyle = '#b8a670';
    tCtx.lineWidth = 1;
    for (let i = 0; i < size; i += 4) {
      tCtx.beginPath();
      tCtx.moveTo(0, i);
      tCtx.lineTo(size, i);
      tCtx.stroke();
    }
    // Darker border on edges
    tCtx.fillStyle = '#4a5759';
    tCtx.fillRect(0, 0, 2, size);
    tCtx.fillRect(size - 2, 0, 2, size);
    this.cache['tile_tatami'] = tatami;

    // Wooden Floor (Warm cozy room)
    const { canvas: wood, ctx: wCtx } = this.createCanvas(size, size);
    wCtx.fillStyle = '#b07d62';
    wCtx.fillRect(0, 0, size, size);
    wCtx.strokeStyle = '#8d5b4c';
    wCtx.lineWidth = 1;
    wCtx.strokeRect(0, 0, size, 8);
    wCtx.strokeRect(0, 8, size, 8);
    wCtx.strokeRect(0, 16, size, 8);
    wCtx.strokeRect(0, 24, size, 8);
    // subtle wood grain
    wCtx.fillStyle = '#9c6644';
    wCtx.fillRect(6, 3, 10, 1);
    wCtx.fillRect(18, 11, 8, 1);
    wCtx.fillRect(4, 19, 12, 1);
    wCtx.fillRect(20, 27, 6, 1);
    this.cache['tile_wood'] = wood;

    // Japanese Garden Stone Path
    const { canvas: stone, ctx: sCtx } = this.createCanvas(size, size);
    sCtx.fillStyle = '#ced4da';
    sCtx.fillRect(0, 0, size, size);
    sCtx.strokeStyle = '#adb5bd';
    sCtx.lineWidth = 2;
    sCtx.strokeRect(2, 2, 12, 12);
    sCtx.strokeRect(16, 2, 14, 12);
    sCtx.strokeRect(2, 16, 14, 14);
    sCtx.strokeRect(18, 16, 12, 14);
    this.cache['tile_stone'] = stone;

    // Grass with fallen Sakura Petals
    const { canvas: grass, ctx: gCtx } = this.createCanvas(size, size);
    gCtx.fillStyle = '#70a060';
    gCtx.fillRect(0, 0, size, size);
    // Darker grass tufts
    gCtx.fillStyle = '#5c8a4d';
    gCtx.fillRect(6, 10, 2, 4);
    gCtx.fillRect(8, 8, 2, 6);
    gCtx.fillRect(22, 20, 2, 5);
    gCtx.fillRect(24, 18, 2, 7);
    // Pink sakura petals on ground
    gCtx.fillStyle = '#ffb7c5';
    gCtx.fillRect(12, 14, 3, 2);
    gCtx.fillRect(18, 6, 2, 2);
    gCtx.fillRect(4, 24, 3, 2);
    gCtx.fillRect(26, 12, 2, 2);
    this.cache['tile_grass_sakura'] = grass;

    // Red Carpet (Finale stage)
    const { canvas: carpet, ctx: cCtx } = this.createCanvas(size, size);
    cCtx.fillStyle = '#c1121f';
    cCtx.fillRect(0, 0, size, size);
    cCtx.fillStyle = '#ffd166';
    cCtx.fillRect(0, 0, 2, size);
    cCtx.fillRect(size - 2, 0, 2, size);
    // Subtle gold trim pattern
    cCtx.fillRect(3, 4, 2, 2);
    cCtx.fillRect(size - 5, 4, 2, 2);
    cCtx.fillRect(3, 20, 2, 2);
    cCtx.fillRect(size - 5, 20, 2, 2);
    this.cache['tile_carpet'] = carpet;

    // Wall (Japanese sliding screen / Shoji)
    const { canvas: wall, ctx: wlCtx } = this.createCanvas(size, size);
    wlCtx.fillStyle = '#f8f9fa';
    wlCtx.fillRect(0, 0, size, size);
    wlCtx.strokeStyle = '#5a3825';
    wlCtx.lineWidth = 2;
    wlCtx.strokeRect(0, 0, size, size);
    wlCtx.strokeRect(4, 4, 10, 10);
    wlCtx.strokeRect(18, 4, 10, 10);
    wlCtx.strokeRect(4, 18, 10, 10);
    wlCtx.strokeRect(18, 18, 10, 10);
    this.cache['tile_shoji'] = wall;
  }

  // 4. PROPS & SCENERY OBJECTS
  generateProps() {
    // Sakura Tree (64x64)
    const { canvas: tree, ctx: trCtx } = this.createCanvas(64, 64);
    // Trunk
    trCtx.fillStyle = '#5c4033';
    trCtx.fillRect(28, 36, 8, 26);
    trCtx.fillRect(24, 52, 16, 10);
    // Canopy (fluffy sakura pinks)
    const drawCanopyCircle = (x, y, r, color) => {
      trCtx.fillStyle = color;
      trCtx.beginPath();
      trCtx.arc(x, y, r, 0, Math.PI * 2);
      trCtx.fill();
    };
    drawCanopyCircle(32, 22, 22, '#ff9ebb');
    drawCanopyCircle(20, 20, 16, '#ff85a1');
    drawCanopyCircle(44, 20, 16, '#ff85a1');
    drawCanopyCircle(32, 12, 15, '#ffb7c5');
    drawCanopyCircle(24, 15, 10, '#ffffff');
    drawCanopyCircle(38, 25, 12, '#ffffff');
    this.cache['prop_sakura_tree'] = tree;

    // Torii Gate (64x64)
    const { canvas: torii, ctx: toCtx } = this.createCanvas(64, 64);
    toCtx.fillStyle = '#c1121f';
    // Top curved bar
    toCtx.fillRect(2, 6, 60, 6);
    toCtx.fillRect(0, 4, 64, 4);
    // Black roof caps
    toCtx.fillStyle = '#111';
    toCtx.fillRect(0, 2, 4, 4);
    toCtx.fillRect(60, 2, 4, 4);
    // Second bar
    toCtx.fillStyle = '#c1121f';
    toCtx.fillRect(8, 18, 48, 4);
    // Two pillars
    toCtx.fillRect(12, 6, 6, 56);
    toCtx.fillRect(46, 6, 6, 56);
    // Base stones
    toCtx.fillStyle = '#333';
    toCtx.fillRect(10, 56, 10, 6);
    toCtx.fillRect(44, 56, 10, 6);
    // Gold plaque in center
    toCtx.fillStyle = '#ffd166';
    toCtx.fillRect(28, 10, 8, 10);
    toCtx.fillStyle = '#c1121f';
    toCtx.fillRect(30, 12, 4, 6);
    this.cache['prop_torii'] = torii;

    // Study Desk with glowing Laptop (32x32)
    const { canvas: desk, ctx: dCtx } = this.createCanvas(32, 32);
    // Table
    dCtx.fillStyle = '#7f4f24';
    dCtx.fillRect(2, 8, 28, 16);
    dCtx.fillStyle = '#582f0e';
    dCtx.fillRect(4, 24, 4, 8);
    dCtx.fillRect(24, 24, 4, 8);
    // Laptop
    dCtx.fillStyle = '#3a5a40';
    dCtx.fillRect(10, 10, 12, 8);
    dCtx.fillStyle = '#90e0ef'; // glowing screen
    dCtx.fillRect(11, 11, 10, 6);
    // Table Lamp
    dCtx.fillStyle = '#ffb703';
    dCtx.fillRect(24, 6, 4, 4);
    dCtx.fillStyle = '#333';
    dCtx.fillRect(25, 10, 2, 4);
    this.cache['prop_desk'] = desk;

    // JPC Red Mailbox (Hòm thư JPC)
    const { canvas: mailbox, ctx: mCtx } = this.createCanvas(32, 32);
    mCtx.fillStyle = '#333';
    mCtx.fillRect(14, 20, 4, 12); // pole
    mCtx.fillStyle = '#e63946'; // red box
    mCtx.fillRect(6, 6, 20, 16);
    // Mail slot
    mCtx.fillStyle = '#fff';
    mCtx.fillRect(10, 10, 12, 3);
    // JPC logo emblem (golden circle)
    mCtx.fillStyle = '#ffd166';
    mCtx.beginPath();
    mCtx.arc(16, 18, 3, 0, Math.PI * 2);
    mCtx.fill();
    this.cache['prop_mailbox'] = mailbox;

    // FTU Campus Sign (Biển tên Ngoại Thương 64x32)
    const { canvas: ftuSign, ctx: fCtx } = this.createCanvas(64, 32);
    fCtx.fillStyle = '#1d3557';
    fCtx.fillRect(2, 4, 60, 24);
    fCtx.strokeStyle = '#ffd166';
    fCtx.lineWidth = 2;
    fCtx.strokeRect(2, 4, 60, 24);
    fCtx.fillStyle = '#e63946';
    fCtx.fillRect(6, 7, 52, 6);
    fCtx.fillStyle = '#fff';
    fCtx.font = 'bold 9px sans-serif';
    fCtx.fillText('★ FTU - JPC ★', 8, 22);
    this.cache['prop_ftu_sign'] = ftuSign;

    // Blackboard / Bảng xanh Giảng đường Nhà B FTU (48x32)
    const { canvas: board, ctx: bBoardCtx } = this.createCanvas(48, 32);
    bBoardCtx.fillStyle = '#5c4033'; // Wooden frame
    bBoardCtx.fillRect(0, 2, 48, 28);
    bBoardCtx.fillStyle = '#2d6a4f'; // Green chalkboard
    bBoardCtx.fillRect(3, 5, 42, 22);
    bBoardCtx.fillStyle = '#ffffff'; // White chalk marks
    bBoardCtx.fillRect(6, 8, 12, 1);
    bBoardCtx.fillRect(6, 12, 18, 1);
    bBoardCtx.fillStyle = '#ffccd5'; // Pink chalk "JPC"
    bBoardCtx.font = 'bold 7px sans-serif';
    bBoardCtx.fillText('JPC GEN 22', 8, 22);
    this.cache['prop_blackboard'] = board;

    // Red Japanese Lantern (Chōchin) (20x28)
    const { canvas: lantern, ctx: lCtx } = this.createCanvas(24, 32);
    // Hanging cord
    lCtx.fillStyle = '#222';
    lCtx.fillRect(11, 0, 2, 6);
    // Red body
    lCtx.fillStyle = '#e63946';
    lCtx.fillRect(4, 6, 16, 18);
    // Glow center
    lCtx.fillStyle = '#ffbe0b';
    lCtx.fillRect(7, 10, 10, 10);
    // Black caps top and bottom
    lCtx.fillStyle = '#222';
    lCtx.fillRect(6, 4, 12, 3);
    lCtx.fillRect(6, 24, 12, 3);
    // Tassel
    lCtx.fillStyle = '#ffd166';
    lCtx.fillRect(11, 27, 2, 5);
    this.cache['prop_lantern'] = lantern;

    // Memory Fragment / Glowing Scroll (Kỷ vật)
    const { canvas: scroll, ctx: scCtx } = this.createCanvas(24, 24);
    scCtx.fillStyle = '#ffd166';
    scCtx.fillRect(4, 4, 16, 16);
    scCtx.fillStyle = '#fff';
    scCtx.fillRect(6, 6, 12, 12);
    // Red ribbon
    scCtx.fillStyle = '#e63946';
    scCtx.fillRect(10, 4, 4, 16);
    scCtx.fillRect(4, 10, 16, 4);
    // Gold seal
    scCtx.fillStyle = '#ffd700';
    scCtx.fillRect(9, 9, 6, 6);
    this.cache['prop_scroll'] = scroll;

    // Boba Cup (Cốc trà sữa động viên)
    const { canvas: boba, ctx: bCtx } = this.createCanvas(20, 24);
    // Cup
    bCtx.fillStyle = '#e9d8a6';
    bCtx.fillRect(4, 6, 12, 14);
    // Straw
    bCtx.fillStyle = '#e76f51';
    bCtx.fillRect(9, 1, 3, 8);
    // Pearls
    bCtx.fillStyle = '#111';
    bCtx.fillRect(6, 16, 3, 3);
    bCtx.fillRect(11, 16, 3, 3);
    bCtx.fillRect(8, 13, 3, 3);
    this.cache['prop_boba'] = boba;
  }

  // Draw cached sprite helper
  draw(ctx, name, x, y, w = null, h = null) {
    // If it's an external loaded image
    if (this.images && this.images[name]) {
      const img = this.images[name];
      const targetW = w || 32;
      const targetH = h || 44;
      ctx.drawImage(img, Math.round(x), Math.round(y) - (targetH - 32), targetW, targetH);
      return;
    }

    const s = this.cache[name];
    if (s) {
      if (w && h) {
        ctx.drawImage(s, Math.round(x), Math.round(y), w, h);
      } else {
        ctx.drawImage(s, Math.round(x), Math.round(y));
      }
    }
  }
}

window.spriteManager = new SpriteManager();
window.spriteManager.init();

