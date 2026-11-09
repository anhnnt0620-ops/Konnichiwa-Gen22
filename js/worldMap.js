// ==========================================================================
// FTU 2D CAMPUS MAP GENERATOR (Bright Warm Tone matching jpc-ftu)
// Non-pixelated smooth vector 2D styling with FCD festival booths at Sân Nhà D
// ==========================================================================

const TILE_SIZE = 32;
const MAP_COLS = 60;
const MAP_ROWS = 40;

const TILE_TYPES = {
  WATER: 0,
  SAND: 1,
  GRASS: 2,
  GRASS_LUSH: 3,
  PATH: 4,
  PLAZA: 5,
  HEDGE: 6,
  FENCE: 7,
  COURT: 8,
  FLOWERBED: 9,
  LAWN: 10,
  PARKING: 11,
  FESTIVAL_PLAZA: 12
};

// FTU Buildings Definition
const FTU_BUILDINGS = [
  { id: "K", name: "Nhà K", x: 4, y: 4, w: 6, h: 4, style: "lilac" },
  { id: "KTX4", name: "KTX 4 tầng", x: 12, y: 3, w: 8, h: 4, style: "peach" },
  { id: "TC", name: "Nhà Thể chất", x: 37, y: 3, w: 10, h: 5, style: "mint", door: "bottom" },
  { id: "E", name: "Nhà E", x: 49, y: 3, w: 6, h: 4, style: "sky" },
  { id: "G", name: "Nhà G", x: 49, y: 9, w: 6, h: 4, style: "sky" },
  { id: "CT", name: "Canteen FTU", x: 3, y: 10, w: 6, h: 4, style: "butter" },
  { id: "H", name: "Nhà H", x: 3, y: 16, w: 6, h: 4, style: "lilac" },
  { id: "F", name: "Nhà F", x: 3, y: 22, w: 6, h: 4, style: "lilac" },
  { id: "SHOP", name: "FTU Shop", x: 3, y: 28, w: 4, h: 3, style: "red" },
  { id: "B", name: "Nhà B (Giảng Đường)", x: 14, y: 12, w: 20, h: 4, style: "cream" },
  { id: "A", name: "Nhà A (Trung Tâm)", x: 14, y: 24, w: 20, h: 4, style: "cream" },
  { id: "D", name: "Nhà D & Sân FCD", x: 49, y: 20, w: 7, h: 4, style: "rose", door: "bottom" },
  { id: "VJCC", name: "Viện VJCC Nhật Bản", x: 18, y: 29, w: 13, h: 4, style: "vjcc", door: "left" },
  { id: "KTX7", name: "KTX 7 tầng", x: 21, y: 34, w: 8, h: 3, style: "peach" },
  { id: "BV", name: "Cổng Chùa Láng", x: 3, y: 33, w: 3, h: 2, style: "booth", small: true }
];

// Warm, bright color palette matching jpc-ftu
const BUILDING_STYLES = {
  cream:  { roof: "#d8434f", roofDark: "#b92b45", wall: "#fffdf8", trim: "#cf9f3f" }, // Nhà A, Nhà B
  mint:   { roof: "#4fa58b", roofDark: "#397d68", wall: "#fafffd", trim: "#8fd68f" }, // Nhà Thể chất
  sky:    { roof: "#5b8fd9", roofDark: "#4373bd", wall: "#f8fbff", trim: "#a9cdf2" }, // Nhà E, G
  butter: { roof: "#e0a030", roofDark: "#c2841f", wall: "#fffdee", trim: "#ffd778" }, // Canteen
  rose:   { roof: "#b92b45", roofDark: "#8a1c1c", wall: "#fff8fa", trim: "#ffb7c5" }, // Nhà D
  red:    { roof: "#e63946", roofDark: "#ba1826", wall: "#fff3f3", trim: "#ffd778" }, // FTU Shop
  vjcc:   { roof: "#5c1216", roofDark: "#3d0c0f", wall: "#ffffff", trim: "#cf9f3f" }, // VJCC Nhật Bản
  booth:  { roof: "#5c1216", roofDark: "#3d0c0f", wall: "#fffaf0", trim: "#cf9f3f" }, // Bác bảo vệ
  lilac:  { roof: "#8b6cb0", roofDark: "#6e5291", wall: "#faf7ff", trim: "#d3bdf0" }, // Nhà K, H, F
  peach:  { roof: "#e76f51", roofDark: "#cc5234", wall: "#fff8f5", trim: "#f4a261" }  // KTX
};

class WorldMap {
  constructor() {
    this.cols = MAP_COLS;
    this.rows = MAP_ROWS;
    this.tileSize = TILE_SIZE;
    this.width = this.cols * this.tileSize;
    this.height = this.rows * this.tileSize;

    this.grid = [];
    this.solidGrid = [];
    this.preRenderedCanvas = null;
    this.miniMapCanvas = null;

    this.initMap();
  }

  isInsideCampus(c, r) {
    if (c < 2 || c > 57 || r < 2 || r > 37) return false;
    const cx = c < 5 ? 5 : c > 54 ? 54 : c;
    const cy = r < 5 ? 5 : r > 34 ? 34 : r;
    return (c - cx) ** 2 + (r - cy) ** 2 <= 9.5;
  }

  pseudoRandom(x, y) {
    let w = (x * 374761393 + y * 668265263) | 0;
    w = (w ^ (w >>> 13)) * 1274126177;
    return (((w ^ (w >>> 16)) >>> 0) / 4294967296);
  }

  initMap() {
    this.grid = [];
    this.solidGrid = [];

    // 1. Base Bright Green Terrain & Surrounding Water
    for (let r = 0; r < this.rows; r++) {
      this.grid.push([]);
      this.solidGrid.push([]);
      for (let c = 0; c < this.cols; c++) {
        if (this.isInsideCampus(c, r)) {
          this.grid[r].push(this.pseudoRandom(c, r) < 0.15 ? TILE_TYPES.GRASS_LUSH : TILE_TYPES.GRASS);
          this.solidGrid[r].push(0);
        } else {
          this.grid[r].push(TILE_TYPES.WATER);
          this.solidGrid[r].push(1);
        }
      }
    }

    // 2. Sand Beach Borders
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r][c] === TILE_TYPES.WATER) continue;
        let isEdge = false;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (!this.isInsideCampus(c + dc, r + dr)) isEdge = true;
          }
        }
        if (isEdge) this.grid[r][c] = TILE_TYPES.SAND;
      }
    }

    const paint = (startX, startY, w, h, type, isSolid = false) => {
      for (let r = startY; r < startY + h; r++) {
        for (let c = startX; c < startX + w; c++) {
          if (c >= 0 && c < this.cols && r >= 0 && r < this.rows) {
            this.grid[r][c] = type;
            if (isSolid) this.solidGrid[r][c] = 1;
          }
        }
      }
    };

    // 3. Paved Avenues & Pathways
    paint(10, 8, 2, 24, TILE_TYPES.PATH);
    paint(8, 31, 4, 1, TILE_TYPES.PATH);
    paint(10, 9, 39, 2, TILE_TYPES.PATH);
    paint(10, 16, 47, 1, TILE_TYPES.PATH); // Avenue to Dốc Nhà B
    paint(10, 20, 47, 1, TILE_TYPES.PATH);
    paint(10, 28, 24, 1, TILE_TYPES.PATH);
    paint(12, 29, 2, 3, TILE_TYPES.PATH);
    paint(15, 33, 41, 1, TILE_TYPES.PATH);
    paint(31, 28, 3, 6, TILE_TYPES.PATH);
    paint(40, 11, 2, 23, TILE_TYPES.PATH);
    paint(47, 9, 2, 25, TILE_TYPES.PATH); // Path straight to Sân Nhà D
    paint(25, 8, 2, 2, TILE_TYPES.PATH);

    // 4. SÂN NHÀ D (FTU CLUB DAY PLAZA)
    paint(45, 24, 11, 8, TILE_TYPES.FESTIVAL_PLAZA); // Big FCD Plaza in front of Nhà D

    // Special Zones
    paint(21, 3, 8, 5, TILE_TYPES.COURT);
    paint(15, 17, 7, 3, TILE_TYPES.LAWN);
    paint(26, 17, 7, 3, TILE_TYPES.LAWN);
    paint(22, 17, 4, 3, TILE_TYPES.PLAZA);
    paint(5, 33, 9, 4, TILE_TYPES.PLAZA);
    paint(3, 32, 12, 1, TILE_TYPES.FENCE, true);
    paint(14, 32, 1, 5, TILE_TYPES.FENCE, true);
    paint(8, 32, 2, 1, TILE_TYPES.PLAZA);
    paint(35, 22, 4, 9, TILE_TYPES.PARKING);

    // Hedges & Flowerbeds
    paint(34, 21, 1, 11, TILE_TYPES.HEDGE, true);
    paint(39, 21, 1, 11, TILE_TYPES.HEDGE, true);
    paint(35, 31, 4, 1, TILE_TYPES.HEDGE, true);

    const flowerBeds = [
      [12, 18], [12, 19], [33, 18], [34, 18], [36, 18], [37, 18],
      [13, 23], [13, 26], [43, 23], [43, 24], [43, 29], [43, 30],
      [8, 14], [8, 15], [30, 35], [31, 35], [17, 35], [18, 35]
    ];
    flowerBeds.forEach(([fc, fr]) => {
      if (fc >= 0 && fc < this.cols && fr >= 0 && fr < this.rows) {
        this.grid[fr][fc] = TILE_TYPES.FLOWERBED;
        this.solidGrid[fr][fc] = 1;
      }
    });

    // 5. Register Building Collisions
    FTU_BUILDINGS.forEach(b => {
      for (let r = b.y; r < b.y + b.h; r++) {
        for (let c = b.x; c < b.x + b.w; c++) {
          if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
            const isDoor = (r === b.y + b.h - 1) && Math.abs(c - (b.x + Math.floor(b.w / 2))) <= 0;
            if (!isDoor) {
              this.solidGrid[r][c] = 1;
            }
          }
        }
      }
    });

    this.buildPreRenderedCanvas();
    this.buildMiniMap();
  }

  isSolid(worldX, worldY) {
    const col = Math.floor(worldX / this.tileSize);
    const row = Math.floor(worldY / this.tileSize);
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return true;
    return this.solidGrid[row][col] === 1;
  }

  buildPreRenderedCanvas() {
    const c = document.createElement('canvas');
    c.width = this.width;
    c.height = this.height;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = true;

    // A. Render Smooth 2D Vector Tiles
    for (let r = 0; r < this.rows; r++) {
      for (let col = 0; col < this.cols; col++) {
        const type = this.grid[r][col];
        const x = col * this.tileSize;
        const y = r * this.tileSize;

        switch (type) {
          case TILE_TYPES.WATER:
            ctx.fillStyle = '#6ec1e4';
            ctx.fillRect(x, y, this.tileSize, this.tileSize);
            ctx.fillStyle = '#59b2d8';
            ctx.beginPath();
            ctx.ellipse(x + 12, y + 16, 8, 3, 0, 0, Math.PI * 2);
            ctx.fill();
            break;

          case TILE_TYPES.SAND:
            ctx.fillStyle = '#f8e4b7';
            ctx.fillRect(x, y, this.tileSize, this.tileSize);
            break;

          case TILE_TYPES.GRASS:
            ctx.fillStyle = '#8fd68f';
            ctx.fillRect(x, y, this.tileSize, this.tileSize);
            break;

          case TILE_TYPES.GRASS_LUSH:
            ctx.fillStyle = '#7bc87c';
            ctx.fillRect(x, y, this.tileSize, this.tileSize);
            ctx.fillStyle = '#ffccd5';
            ctx.beginPath();
            ctx.arc(x + 14, y + 14, 2, 0, Math.PI * 2);
            ctx.fill();
            break;

          case TILE_TYPES.PATH:
            ctx.fillStyle = '#f4ecd8'; // Warm ivory path
            ctx.fillRect(x, y, this.tileSize, this.tileSize);
            ctx.strokeStyle = '#e2d5bc';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, this.tileSize, this.tileSize);
            break;

          case TILE_TYPES.PLAZA:
            ctx.fillStyle = '#ffe0b2';
            ctx.fillRect(x, y, this.tileSize, this.tileSize);
            ctx.strokeStyle = '#ffcc80';
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 1, y + 1, this.tileSize - 2, this.tileSize - 2);
            break;

          case TILE_TYPES.FESTIVAL_PLAZA:
            // Sân Nhà D FCD with warm festive stone pavers
            ctx.fillStyle = '#ffecd2';
            ctx.fillRect(x, y, this.tileSize, this.tileSize);
            ctx.strokeStyle = '#f8cfad';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
            break;

          case TILE_TYPES.HEDGE:
            ctx.fillStyle = '#388e3c';
            ctx.beginPath();
            ctx.roundRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4, 6);
            ctx.fill();
            break;

          case TILE_TYPES.FENCE:
            ctx.fillStyle = '#a1887f';
            ctx.fillRect(x, y + 10, this.tileSize, 8);
            ctx.fillStyle = '#6d4c41';
            ctx.fillRect(x + 4, y + 2, 6, 26);
            ctx.fillRect(x + 20, y + 2, 6, 26);
            break;

          case TILE_TYPES.COURT:
            ctx.fillStyle = '#80cbc4';
            ctx.fillRect(x, y, this.tileSize, this.tileSize);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, this.tileSize, this.tileSize);
            break;

          case TILE_TYPES.FLOWERBED:
            ctx.fillStyle = '#6d4c41';
            ctx.fillRect(x, y, this.tileSize, this.tileSize);
            // Sakura & gold flowers
            ctx.fillStyle = '#ff80ab';
            ctx.beginPath();
            ctx.arc(x + 8, y + 10, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffd778';
            ctx.beginPath();
            ctx.arc(x + 22, y + 18, 4, 0, Math.PI * 2);
            ctx.fill();
            break;

          case TILE_TYPES.LAWN:
            ctx.fillStyle = '#aed581';
            ctx.fillRect(x, y, this.tileSize, this.tileSize);
            ctx.fillStyle = '#ffccd5';
            ctx.beginPath();
            ctx.ellipse(x + 8, y + 12, 3, 2, 0.4, 0, Math.PI * 2);
            ctx.fill();
            break;

          case TILE_TYPES.PARKING:
            ctx.fillStyle = '#b0bec5';
            ctx.fillRect(x, y, this.tileSize, this.tileSize);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 2, y + 4, this.tileSize - 4, this.tileSize - 8);
            break;
        }
      }
    }

    // B. Draw FTU Buildings with Smooth Modern 2D Vector Styling
    FTU_BUILDINGS.forEach(b => {
      this.drawModernBuilding(ctx, b);
    });

    // C. Draw FCD Festival Elements at Sân Nhà D
    this.drawFCDPlaza(ctx);

    // D. Draw Cổng Chùa Láng FCD Welcome Arch
    this.drawEntranceArch(ctx);

    this.preRenderedCanvas = c;
  }

  // Draw modern 2D building with soft shadows, gradient roofs, and Alviona signage
  drawModernBuilding(ctx, b) {
    const x = b.x * this.tileSize;
    const y = b.y * this.tileSize;
    const w = b.w * this.tileSize;
    const h = b.h * this.tileSize;
    const style = BUILDING_STYLES[b.style] || BUILDING_STYLES.cream;

    const roofHeight = Math.round(h * 0.52);
    const wallHeight = h - roofHeight;

    // 1. Soft Shadow
    ctx.fillStyle = 'rgba(11, 4, 3, 0.2)';
    ctx.beginPath();
    ctx.roundRect(x - 4, y + roofHeight, w + 8, wallHeight + 6, 8);
    ctx.fill();

    // 2. Wall
    ctx.fillStyle = style.wall;
    ctx.beginPath();
    ctx.roundRect(x, y + roofHeight - 2, w, wallHeight + 2, 6);
    ctx.fill();

    // Wall Trim base
    ctx.fillStyle = style.trim;
    ctx.fillRect(x, y + h - 4, w, 4);

    // 3. Smooth Curved Roof with Gradient
    const roofGrad = ctx.createLinearGradient(x, y, x, y + roofHeight);
    roofGrad.addColorStop(0, style.roof);
    roofGrad.addColorStop(1, style.roofDark);

    ctx.fillStyle = roofGrad;
    ctx.beginPath();
    ctx.roundRect(x, y, w, roofHeight, [8, 8, 2, 2]);
    ctx.fill();

    // Eaves trim
    ctx.fillStyle = '#cf9f3f'; // Gold edge
    ctx.fillRect(x, y + roofHeight - 3, w, 3);

    // 4. Windows
    const windowY = y + roofHeight + 8;
    const windowW = 16;
    const windowH = Math.max(10, wallHeight - 18);

    for (let wx = x + 12; wx + windowW <= x + w - 12; wx += windowW + 14) {
      if (Math.abs(wx + windowW / 2 - (x + w / 2)) > 16) {
        ctx.fillStyle = '#b3e5fc';
        ctx.beginPath();
        ctx.roundRect(wx, windowY, windowW, windowH, 3);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    // 5. Entrance Door
    const doorW = 18;
    const doorH = wallHeight - 4;
    const doorX = x + Math.floor(w / 2) - doorW / 2;
    const doorY = y + h - doorH;

    ctx.fillStyle = '#5c1216'; // Crimson frame
    ctx.beginPath();
    ctx.roundRect(doorX - 2, doorY - 2, doorW + 4, doorH + 2, [4, 4, 0, 0]);
    ctx.fill();

    ctx.fillStyle = '#fffdf8';
    ctx.fillRect(doorX, doorY, doorW, doorH);

    ctx.fillStyle = '#cf9f3f'; // Gold handle
    ctx.beginPath();
    ctx.arc(doorX + doorW - 4, doorY + doorH / 2, 2, 0, Math.PI * 2);
    ctx.fill();

    // 6. Signboard with 'Alviona' Font
    const textW = b.name.length * 7 + 18;
    const signX = x + Math.floor(w / 2) - textW / 2;
    const signY = y + roofHeight - 16;

    ctx.fillStyle = 'rgba(34, 7, 10, 0.9)';
    ctx.beginPath();
    ctx.roundRect(signX, signY, textW, 18, 4);
    ctx.fill();
    ctx.strokeStyle = '#ffd778';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#ffd778';
    ctx.font = 'bold 11px "Alviona", "Cinzel", serif';
    ctx.textAlign = 'center';
    ctx.fillText(b.name, signX + textW / 2, signY + 13);
    ctx.textAlign = 'start';
  }

  // Draw FCD Festival Elements at Sân Nhà D (Other club booths & the prominent JPC Booth)
  drawFCDPlaza(ctx) {
    const px = 45 * this.tileSize;
    const py = 24 * this.tileSize;

    // Festival fairy lights hanging across plaza
    ctx.strokeStyle = 'rgba(255, 215, 120, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(px, py + 10);
    ctx.quadraticCurveTo(px + 100, py + 40, px + 200, py + 10);
    ctx.stroke();

    // Little glowing bulbs
    const bulbColors = ['#ff85a1', '#ffd778', '#64b5f6', '#81c784'];
    for (let i = 0; i < 8; i++) {
      const t = (i + 1) / 9;
      const bx = px + t * 200;
      const by = py + 10 + Math.sin(t * Math.PI) * 20;
      ctx.fillStyle = bulbColors[i % bulbColors.length];
      ctx.beginPath();
      ctx.arc(bx, by, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Other Club Booths (Music, Dance, Debate)
    const otherBooths = [
      { name: "CLB Âm Nhạc", x: 46 * this.tileSize, y: 25 * this.tileSize, color: "#5b8fd9" },
      { name: "CLB Nhảy", x: 46 * this.tileSize, y: 29 * this.tileSize, color: "#8b6cb0" },
      { name: "CLB Tình Nguyện", x: 53 * this.tileSize, y: 29 * this.tileSize, color: "#e76f51" }
    ];

    otherBooths.forEach(b => {
      // Canopy
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.roundRect(b.x, b.y, 60, 40, 4);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(b.x + 4, b.y + 36, 52, 4);

      // Label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px "Be Vietnam Pro", sans-serif';
      ctx.fillText(b.name, b.x + 6, b.y + 22);
    });

    // ========================================================================
    // ★ GRAND JPC BOOTH AT SÂN NHÀ D (x: 50, y: 24)
    // Decorated with Torii gate, cherry blossoms, red lanterns & big banner!
    // ========================================================================
    const jpcX = 49 * this.tileSize;
    const jpcY = 24 * this.tileSize;
    const jpcW = 120;
    const jpcH = 75;

    // Soft glow under booth
    ctx.fillStyle = 'rgba(230, 57, 70, 0.25)';
    ctx.beginPath();
    ctx.ellipse(jpcX + jpcW / 2, jpcY + jpcH - 5, jpcW / 1.6, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Crimson & Gold Royal Canopy
    const canopyGrad = ctx.createLinearGradient(jpcX, jpcY, jpcX, jpcY + 36);
    canopyGrad.addColorStop(0, '#e63946');
    canopyGrad.addColorStop(1, '#5c1216');

    ctx.fillStyle = canopyGrad;
    ctx.beginPath();
    ctx.roundRect(jpcX, jpcY, jpcW, 40, [8, 8, 0, 0]);
    ctx.fill();

    // Gold trim
    ctx.fillStyle = '#ffd778';
    ctx.fillRect(jpcX, jpcY + 37, jpcW, 4);

    // Front Table / Reception Desk
    ctx.fillStyle = '#fffdf8';
    ctx.beginPath();
    ctx.roundRect(jpcX + 10, jpcY + 41, jpcW - 20, 28, 4);
    ctx.fill();
    ctx.strokeStyle = '#cf9f3f';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Big Banner: "CLB TIẾNG NHẬT JPC — GEN 22"
    ctx.fillStyle = '#ffd778';
    ctx.font = 'bold 11px "Alviona", "Cinzel", serif';
    ctx.textAlign = 'center';
    ctx.fillText('★ JPC FTU — GEN 22 ★', jpcX + jpcW / 2, jpcY + 24);
    ctx.textAlign = 'start';

    // Hanging Red Lanterns (Chōchin)
    const drawLantern = (lx, ly) => {
      ctx.fillStyle = '#222';
      ctx.fillRect(lx - 1, ly - 4, 2, 4);
      ctx.fillStyle = '#e63946';
      ctx.beginPath();
      ctx.ellipse(lx, ly + 6, 6, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd778';
      ctx.fillRect(lx - 4, ly + 4, 8, 4);
    };
    drawLantern(jpcX + 8, jpcY + 40);
    drawLantern(jpcX + jpcW - 8, jpcY + 40);

    // Torii Gate on the side of JPC Booth
    const toriiX = jpcX - 34;
    const toriiY = jpcY + 10;
    ctx.fillStyle = '#c1121f';
    ctx.fillRect(toriiX, toriiY, 30, 4); // top beam
    ctx.fillRect(toriiX + 2, toriiY + 6, 26, 3);
    ctx.fillRect(toriiX + 5, toriiY + 4, 4, 42); // pillars
    ctx.fillRect(toriiX + 21, toriiY + 4, 4, 42);
  }

  // Draw Welcome Arch at Cổng Chùa Láng
  drawEntranceArch(ctx) {
    const ax = 7 * this.tileSize;
    const ay = 32 * this.tileSize;
    const aw = 96;
    const ah = 44;

    ctx.fillStyle = '#5c1216';
    ctx.fillRect(ax + 4, ay, 8, ah);
    ctx.fillRect(ax + aw - 12, ay, 8, ah);

    // Top Welcome Sign
    ctx.fillStyle = 'linear-gradient(90deg, #b92b45, #5c1216)';
    ctx.fillStyle = '#b92b45';
    ctx.beginPath();
    ctx.roundRect(ax, ay - 8, aw, 22, 6);
    ctx.fill();
    ctx.strokeStyle = '#ffd778';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffd778';
    ctx.font = 'bold 9px "Alviona", "Cinzel", serif';
    ctx.textAlign = 'center';
    ctx.fillText('FTU CLUB DAY (FCD)', ax + aw / 2, ay + 6);
    ctx.textAlign = 'start';
  }

  // Pre-render a sleek Radar Mini-map (120 x 80 px)
  buildMiniMap() {
    const c = document.createElement('canvas');
    c.width = 120;
    c.height = 80;
    const ctx = c.getContext('2d');

    const scaleX = 120 / this.width;
    const scaleY = 80 / this.height;

    // Dark crimson velvet card base
    ctx.fillStyle = '#22070a';
    ctx.fillRect(0, 0, 120, 80);

    // Campus grass shape
    ctx.fillStyle = '#7bc87c';
    ctx.beginPath();
    ctx.roundRect(8, 6, 104, 68, 6);
    ctx.fill();

    // Draw buildings in mini-map
    FTU_BUILDINGS.forEach(b => {
      const bx = b.x * this.tileSize * scaleX;
      const by = b.y * this.tileSize * scaleY;
      const bw = b.w * this.tileSize * scaleX;
      const bh = b.h * this.tileSize * scaleY;
      ctx.fillStyle = (b.id === 'D' || b.id === 'A') ? '#e63946' : '#ffd778';
      ctx.fillRect(bx, by, Math.max(3, bw), Math.max(3, bh));
    });

    // Highlight Sân Nhà D FCD
    ctx.fillStyle = '#ff85a1';
    ctx.beginPath();
    ctx.arc(49 * this.tileSize * scaleX + 8, 25 * this.tileSize * scaleY + 6, 6, 0, Math.PI * 2);
    ctx.fill();

    this.miniMapCanvas = c;
  }

  render(ctx, camera) {
    if (this.preRenderedCanvas) {
      ctx.drawImage(this.preRenderedCanvas, -Math.round(camera.x), -Math.round(camera.y));
    }
  }

  renderMiniMap(ctx, playerX, playerY, questSpot) {
    if (!this.miniMapCanvas) return;
    const mmW = 110;
    const mmH = 74;
    const posX = 16;
    const posY = 64;

    ctx.save();
    ctx.fillStyle = 'rgba(34, 7, 10, 0.9)';
    ctx.beginPath();
    ctx.roundRect(posX - 4, posY - 4, mmW + 8, mmH + 8, 8);
    ctx.fill();
    ctx.strokeStyle = '#cf9f3f';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.drawImage(this.miniMapCanvas, posX, posY, mmW, mmH);

    const scaleX = mmW / this.width;
    const scaleY = mmH / this.height;

    // Quest Target marker (Pulsing Red Heart/Star)
    if (questSpot) {
      const qx = posX + questSpot.x * scaleX;
      const qy = posY + questSpot.y * scaleY;
      ctx.fillStyle = '#e63946';
      ctx.beginPath();
      ctx.arc(qx, qy, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Player Blip (Bright Gold Dot)
    const px = posX + playerX * scaleX;
    const py = posY + playerY * scaleY;
    ctx.fillStyle = '#ffd778';
    ctx.strokeStyle = '#0b0403';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffd778';
    ctx.font = 'bold 8px "Alviona", "Cinzel", serif';
    ctx.fillText('BẢN ĐỒ FTU', posX + 6, posY + mmH - 4);

    ctx.restore();
  }
}

window.worldMap = new WorldMap();
