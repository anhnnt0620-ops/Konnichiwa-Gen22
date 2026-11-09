// ==========================================================================
// FTU OPEN WORLD MAP GENERATOR (60 x 40 Grid)
// Inspired by hanh-trinh-2010.vercel.app with full Foreign Trade University layout
// ==========================================================================

const TILE_SIZE = 32;
const MAP_COLS = 60;
const MAP_ROWS = 40;

const TILE_TYPES = {
  WATER: 0,
  SAND: 1,
  GRASS: 2,
  GRASS_DARK: 3,
  PATH: 4,
  PLAZA: 5,
  HEDGE: 6,
  FENCE: 7,
  COURT: 8,
  FLOWERBED: 9,
  LAWN: 10,
  PARKING: 11
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
  { id: "D", name: "Nhà D", x: 49, y: 22, w: 6, h: 4, style: "rose", door: "bottom" },
  { id: "VJCC", name: "Viện VJCC Nhật Bản", x: 18, y: 29, w: 13, h: 4, style: "vjcc", door: "left" },
  { id: "KTX7", name: "KTX 7 tầng", x: 21, y: 34, w: 8, h: 3, style: "peach" },
  { id: "BV", name: "Cổng Chùa Láng", x: 3, y: 33, w: 3, h: 2, style: "booth", small: true }
];

// Building Color Themes
const BUILDING_STYLES = {
  cream:  { roof: "#f0a582", roofDark: "#d98a6c", wall: "#fff6ee", trim: "#e08060" },
  mint:   { roof: "#9fdcc8", roofDark: "#7cc4ae", wall: "#f3fffa", trim: "#4fa58b" },
  sky:    { roof: "#a9cdf2", roofDark: "#86b2e0", wall: "#f5faff", trim: "#5b8fd9" },
  butter: { roof: "#ffe08f", roofDark: "#f2c868", wall: "#fffbee", trim: "#e0a030" },
  rose:   { roof: "#FB6F92", roofDark: "#E63E6D", wall: "#fff0f5", trim: "#B5121B" },
  red:    { roof: "#d8434f", roofDark: "#B5121B", wall: "#fff3f0", trim: "#B5121B" },
  vjcc:   { roof: "#5f6fb0", roofDark: "#4a5893", wall: "#ffffff", trim: "#E63E6D" },
  booth:  { roof: "#5b8fd9", roofDark: "#4373bd", wall: "#eef5ff", trim: "#25345e" },
  lilac:  { roof: "#b8a0d2", roofDark: "#9d82bd", wall: "#fdf8ff", trim: "#7f5fa6" },
  peach:  { roof: "#f4a261", roofDark: "#e76f51", wall: "#fff4ec", trim: "#d95d39" }
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

  // Check island bounds (soft rounded shape like hanh-trinh-2010)
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
    // 1. Initialize Base Terrain
    this.grid = [];
    this.solidGrid = [];

    for (let r = 0; r < this.rows; r++) {
      this.grid.push([]);
      this.solidGrid.push([]);
      for (let c = 0; c < this.cols; c++) {
        if (this.isInsideCampus(c, r)) {
          this.grid[r].push(this.pseudoRandom(c, r) < 0.12 ? TILE_TYPES.GRASS_DARK : TILE_TYPES.GRASS);
          this.solidGrid[r].push(0);
        } else {
          this.grid[r].push(TILE_TYPES.WATER);
          this.solidGrid[r].push(1); // Water is impassable
        }
      }
    }

    // 2. Sand beach borders around water
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

    // Helper to paint rectangle of tiles
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

    // 3. Roads & Pathways of FTU
    paint(10, 8, 2, 24, TILE_TYPES.PATH);
    paint(8, 31, 4, 1, TILE_TYPES.PATH);
    paint(10, 9, 39, 2, TILE_TYPES.PATH);
    paint(10, 16, 47, 1, TILE_TYPES.PATH); // Middle avenue (Dốc Nhà B)
    paint(10, 20, 47, 1, TILE_TYPES.PATH);
    paint(10, 28, 24, 1, TILE_TYPES.PATH);
    paint(12, 29, 2, 3, TILE_TYPES.PATH);
    paint(15, 33, 41, 1, TILE_TYPES.PATH);
    paint(31, 28, 3, 6, TILE_TYPES.PATH);
    paint(40, 11, 2, 23, TILE_TYPES.PATH);
    paint(47, 9, 2, 25, TILE_TYPES.PATH);
    paint(25, 8, 2, 2, TILE_TYPES.PATH);

    // 4. Special Zones (Courts, Plazas, Lawns, Parking)
    paint(21, 3, 8, 5, TILE_TYPES.COURT);   // Sân thể chất / Basketball
    paint(15, 17, 7, 3, TILE_TYPES.LAWN);   // Bãi cỏ xanh Dốc Nhà B
    paint(26, 17, 7, 3, TILE_TYPES.LAWN);
    paint(22, 17, 4, 3, TILE_TYPES.PLAZA);  // Sân trung tâm nối A-B
    paint(5, 33, 9, 4, TILE_TYPES.PLAZA);   // Tiền sảnh Cổng Chùa Láng
    paint(3, 32, 12, 1, TILE_TYPES.FENCE, true); // Hàng rào cổng
    paint(14, 32, 1, 5, TILE_TYPES.FENCE, true);
    paint(8, 32, 2, 1, TILE_TYPES.PLAZA);   // Lối qua cổng
    paint(35, 22, 4, 9, TILE_TYPES.PARKING); // Bãi gửi xe cạnh Nhà A
    paint(49, 14, 8, 6, TILE_TYPES.PARKING); // Bãi xe phụ

    // Plazas around buildings
    paint(40, 8, 4, 3, TILE_TYPES.PLAZA);
    paint(50, 26, 4, 3, TILE_TYPES.PLAZA);
    paint(28, 21, 5, 3, TILE_TYPES.PLAZA);  // Sân trước Nhà A
    paint(15, 30, 3, 2, TILE_TYPES.PLAZA);  // Sân VJCC

    // 5. Hedges & Flowerbeds
    paint(34, 21, 1, 11, TILE_TYPES.HEDGE, true);
    paint(39, 21, 1, 11, TILE_TYPES.HEDGE, true);
    paint(35, 31, 4, 1, TILE_TYPES.HEDGE, true);
    paint(27, 21, 1, 3, TILE_TYPES.HEDGE, true);
    paint(33, 21, 1, 3, TILE_TYPES.HEDGE, true);

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

    // 6. Register Building Solids (Player cannot walk through building walls)
    FTU_BUILDINGS.forEach(b => {
      for (let r = b.y; r < b.y + b.h; r++) {
        for (let c = b.x; c < b.x + b.w; c++) {
          if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
            // Keep front door open
            const isDoor = (r === b.y + b.h - 1) && Math.abs(c - (b.x + Math.floor(b.w / 2))) <= 0;
            if (!isDoor) {
              this.solidGrid[r][c] = 1;
            }
          }
        }
      }
    });

    // 7. Pre-render Entire World Map to Offscreen Canvas for Max Performance
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
    ctx.imageSmoothingEnabled = false;

    // A. Render Tiles
    for (let r = 0; r < this.rows; r++) {
      for (let col = 0; col < this.cols; col++) {
        const type = this.grid[r][col];
        const x = col * this.tileSize;
        const y = r * this.tileSize;

        switch (type) {
          case TILE_TYPES.WATER:
            ctx.fillStyle = '#64b5f6';
            ctx.fillRect(x, y, this.tileSize, this.tileSize);
            ctx.fillStyle = '#42a5f5';
            ctx.fillRect(x + 4, y + 8, 12, 2);
            ctx.fillRect(x + 16, y + 20, 10, 2);
            break;

          case TILE_TYPES.SAND:
            ctx.fillStyle = '#ffe082';
            ctx.fillRect(x, y, this.tileSize, this.tileSize);
            ctx.fillStyle = '#ffd54f';
            ctx.fillRect(x + 2, y + 2, 4, 4);
            break;

          case TILE_TYPES.GRASS:
            ctx.fillStyle = '#81c784';
            ctx.fillRect(x, y, this.tileSize, this.tileSize);
            ctx.fillStyle = '#66bb6a';
            ctx.fillRect(x + 6, y + 10, 2, 4);
            ctx.fillRect(x + 8, y + 8, 2, 6);
            break;

          case TILE_TYPES.GRASS_DARK:
            ctx.fillStyle = '#66bb6a';
            ctx.fillRect(x, y, this.tileSize, this.tileSize);
            ctx.fillStyle = '#4caf50';
            ctx.fillRect(x + 12, y + 14, 2, 5);
            break;

          case TILE_TYPES.PATH:
            ctx.fillStyle = '#e0e0e0';
            ctx.fillRect(x, y, this.tileSize, this.tileSize);
            ctx.strokeStyle = '#bdbdbd';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, this.tileSize, this.tileSize);
            break;

          case TILE_TYPES.PLAZA:
            ctx.fillStyle = '#ffcc80'; // Warm stone plaza
            ctx.fillRect(x, y, this.tileSize, this.tileSize);
            ctx.strokeStyle = '#ffa726';
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
            break;

          case TILE_TYPES.HEDGE:
            ctx.fillStyle = '#2e7d32';
            ctx.fillRect(x, y, this.tileSize, this.tileSize);
            ctx.fillStyle = '#1b5e20';
            ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
            break;

          case TILE_TYPES.FENCE:
            ctx.fillStyle = '#8d6e63';
            ctx.fillRect(x, y + 10, this.tileSize, 12);
            ctx.fillStyle = '#5d4037';
            ctx.fillRect(x + 4, y + 4, 6, 24);
            ctx.fillRect(x + 20, y + 4, 6, 24);
            break;

          case TILE_TYPES.COURT:
            ctx.fillStyle = '#4db6ac'; // Green/Blue athletic court
            ctx.fillRect(x, y, this.tileSize, this.tileSize);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, this.tileSize, this.tileSize);
            break;

          case TILE_TYPES.FLOWERBED:
            ctx.fillStyle = '#5d4037';
            ctx.fillRect(x, y, this.tileSize, this.tileSize);
            ctx.fillStyle = '#ff80ab';
            ctx.fillRect(x + 4, y + 6, 6, 6);
            ctx.fillStyle = '#ff4081';
            ctx.fillRect(x + 18, y + 14, 6, 6);
            ctx.fillStyle = '#ffd54f';
            ctx.fillRect(x + 12, y + 8, 4, 4);
            break;

          case TILE_TYPES.LAWN:
            ctx.fillStyle = '#aed581';
            ctx.fillRect(x, y, this.tileSize, this.tileSize);
            ctx.fillStyle = '#ffccd5'; // Sakura petals on lawn
            ctx.fillRect(x + 6, y + 6, 4, 3);
            ctx.fillRect(x + 20, y + 18, 3, 3);
            break;

          case TILE_TYPES.PARKING:
            ctx.fillStyle = '#9e9e9e';
            ctx.fillRect(x, y, this.tileSize, this.tileSize);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 2, y + 4, this.tileSize - 4, this.tileSize - 8);
            break;
        }
      }
    }

    // B. Render All FTU Buildings
    FTU_BUILDINGS.forEach(b => {
      this.drawBuilding(ctx, b);
    });

    this.preRenderedCanvas = c;
  }

  // Draw authentic pixel building with 3D roof, windows, door, and signage
  drawBuilding(ctx, b) {
    const x = b.x * this.tileSize;
    const y = b.y * this.tileSize;
    const w = b.w * this.tileSize;
    const h = b.h * this.tileSize;
    const style = BUILDING_STYLES[b.style] || BUILDING_STYLES.cream;

    const roofHeight = Math.round(h * 0.55);
    const wallHeight = h - roofHeight;

    // 1. Soft Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.fillRect(x - 4, y + roofHeight, w + 8, wallHeight + 6);

    // 2. Main Wall
    ctx.fillStyle = style.wall;
    ctx.fillRect(x, y + roofHeight, w, wallHeight);

    // Wall Trim base
    ctx.fillStyle = style.trim;
    ctx.fillRect(x, y + h - 4, w, 4);

    // 3. Roof (3D Gable Roof)
    ctx.fillStyle = style.roof;
    ctx.fillRect(x, y, w, roofHeight);

    // Roof Texture / Slanted ridge lines
    ctx.fillStyle = style.roofDark;
    for (let py = y + 4; py < y + roofHeight - 4; py += 6) {
      ctx.fillRect(x + 2, py, w - 4, 2);
    }
    // Roof Border & Eaves
    ctx.fillRect(x, y + roofHeight - 3, w, 3);
    ctx.fillRect(x, y, 3, roofHeight);
    ctx.fillRect(x + w - 3, y, 3, roofHeight);

    // 4. Windows
    const windowY = y + roofHeight + 6;
    const windowW = 14;
    const windowH = Math.max(8, wallHeight - 16);

    for (let wx = x + 10; wx + windowW <= x + w - 10; wx += windowW + 12) {
      // Don't draw window over central door
      if (Math.abs(wx + windowW / 2 - (x + w / 2)) > 16) {
        ctx.fillStyle = '#90caf9'; // Glass
        ctx.fillRect(wx, windowY, windowW, windowH);
        ctx.fillStyle = '#ffffff'; // White frame
        ctx.strokeRect(wx, windowY, windowW, windowH);
        ctx.fillRect(wx + Math.floor(windowW / 2), windowY, 1, windowH);
      }
    }

    // 5. Central Entrance Door
    const doorW = 16;
    const doorH = wallHeight - 4;
    const doorX = x + Math.floor(w / 2) - doorW / 2;
    const doorY = y + h - doorH;

    ctx.fillStyle = '#5d4037'; // Door frame
    ctx.fillRect(doorX - 2, doorY - 2, doorW + 4, doorH + 2);
    ctx.fillStyle = '#8d6e63'; // Wooden door
    ctx.fillRect(doorX, doorY, doorW, doorH);
    ctx.fillStyle = '#ffd54f'; // Golden handle
    ctx.fillRect(doorX + doorW - 4, doorY + doorH / 2, 2, 3);

    // 6. Building Name Signboard
    const textW = b.name.length * 6 + 14;
    const signX = x + Math.floor(w / 2) - textW / 2;
    const signY = y + roofHeight - 14;

    ctx.fillStyle = style.roofDark;
    ctx.fillRect(signX - 2, signY - 2, textW + 4, 16);
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 1;
    ctx.strokeRect(signX - 2, signY - 2, textW + 4, 16);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText(b.name, signX + 4, signY + 10);
  }

  // Pre-render a radar mini-map (120 x 80 px)
  buildMiniMap() {
    const c = document.createElement('canvas');
    c.width = 120;
    c.height = 80;
    const ctx = c.getContext('2d');

    const scaleX = 120 / this.width;
    const scaleY = 80 / this.height;

    // Draw campus base
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 120, 80);

    ctx.fillStyle = '#81c784';
    ctx.fillRect(8, 6, 104, 68);

    // Draw buildings in mini-map
    FTU_BUILDINGS.forEach(b => {
      const bx = b.x * this.tileSize * scaleX;
      const by = b.y * this.tileSize * scaleY;
      const bw = b.w * this.tileSize * scaleX;
      const bh = b.h * this.tileSize * scaleY;
      ctx.fillStyle = b.id === 'A' || b.id === 'VJCC' ? '#e63946' : '#f59e0b';
      ctx.fillRect(bx, by, Math.max(3, bw), Math.max(3, bh));
    });

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
    const posX = 12;
    const posY = 56;

    // Frame
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(posX - 3, posY - 3, mmW + 6, mmH + 6);
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 2;
    ctx.strokeRect(posX - 3, posY - 3, mmW + 6, mmH + 6);

    ctx.drawImage(this.miniMapCanvas, posX, posY, mmW, mmH);

    const scaleX = mmW / this.width;
    const scaleY = mmH / this.height;

    // Draw Quest Target marker (Pulsing star)
    if (questSpot) {
      const qx = posX + questSpot.x * scaleX;
      const qy = posY + questSpot.y * scaleY;
      ctx.fillStyle = '#ff0055';
      ctx.beginPath();
      ctx.arc(qx, qy, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw Player Blip (Bright Yellow Dot)
    const px = posX + playerX * scaleX;
    const py = posY + playerY * scaleY;
    ctx.fillStyle = '#ffd166';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(px, py, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = '8px sans-serif';
    ctx.fillText('BẢN ĐỒ FTU', posX + 4, posY + mmH - 4);

    ctx.restore();
  }
}

window.worldMap = new WorldMap();
