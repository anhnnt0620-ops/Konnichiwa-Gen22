// ==========================================================================
// FTU 2D CAMPUS MAP GENERATOR (Bright Warm Tone matching jpc-ftu)
// Non-pixelated smooth vector 2D styling according to Official FTU & FCD Blueprint
// ==========================================================================

const TILE_SIZE = 32;
const MAP_COLS = 62;
const MAP_ROWS = 44;

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

// FTU Buildings Definition (Matching Exact User Campus & FCD Blueprint)
const FTU_BUILDINGS = [
  // Dọc mép Tây (hướng phố Chùa Láng, từ dưới lên trên)
  { id: "BV", name: "Bốt bảo vệ", x: 3, y: 37, w: 4, h: 3, style: "booth", small: true },
  { id: "SHOP", name: "FTU SHOP", x: 3, y: 31, w: 4, h: 4, style: "red" },
  { id: "F", name: "NHÀ F", x: 3, y: 22, w: 4, h: 7, style: "lilac" },
  { id: "H", name: "NHÀ H", x: 3, y: 12, w: 4, h: 8, style: "lilac" },
  { id: "K", name: "NHÀ K", x: 3, y: 6, w: 4, h: 4, style: "lilac" },
  { id: "CT", name: "Canteen", x: 3, y: 2, w: 9, h: 3, style: "butter" },

  // Dãy phía Bắc (từ Tây sang Đông)
  { id: "KTX4", name: "KTX 4 tầng", x: 14, y: 2, w: 18, h: 3, style: "peach" },
  { id: "TC", name: "Nhà thể chất", x: 35, y: 2, w: 15, h: 3, style: "mint", door: "bottom" },
  { id: "E", name: "Nhà E", x: 53, y: 2, w: 6, h: 3, style: "sky" },

  // Dãy phía Đông (từ Bắc xuống Nam)
  { id: "TV", name: "Thư viện", x: 55, y: 6, w: 4, h: 7, style: "sky" },
  { id: "D", name: "Nhà D", x: 55, y: 18, w: 4, h: 7, style: "rose", door: "bottom" },

  // Tòa B & Văn Phòng (ngay phía Bắc Sân Trung Tâm)
  { id: "B", name: "Tòa B", x: 18, y: 14, w: 19, h: 3, style: "cream" },
  { id: "VP_DOAN", name: "VP Đoàn", x: 38, y: 14, w: 5, h: 3, style: "red" },
  { id: "VP_CLB", name: "VP các CLB", x: 44, y: 14, w: 12, h: 3, style: "cream" },

  // Sân khấu FCD (đối diện Nhà D, hướng về Sân Trung Tâm)
  { id: "STAGE_FCD", name: "Sân khấu FCD", x: 48, y: 17, w: 5, h: 8, style: "stage" },

  // Dãy phía Nam
  { id: "A", name: "Nhà A", x: 20, y: 28, w: 14, h: 3, style: "cream" },
  { id: "VJCBI", name: "Trường VJCBI", x: 20, y: 33, w: 14, h: 3, style: "vjcc", door: "bottom" },
  { id: "KTX7", name: "KTX 7 tầng", x: 20, y: 38, w: 8, h: 3, style: "peach" }
];

// Warm, bright color palette matching jpc-ftu
const BUILDING_STYLES = {
  cream:  { roof: "#d8434f", roofDark: "#b92b45", wall: "#fffdf8", trim: "#cf9f3f" }, // Nhà A, Tòa B
  mint:   { roof: "#4fa58b", roofDark: "#397d68", wall: "#fafffd", trim: "#8fd68f" }, // Nhà Thể chất
  sky:    { roof: "#5b8fd9", roofDark: "#4373bd", wall: "#f8fbff", trim: "#a9cdf2" }, // Nhà E, Thư viện
  butter: { roof: "#e0a030", roofDark: "#c2841f", wall: "#fffdee", trim: "#ffd778" }, // Canteen
  rose:   { roof: "#b92b45", roofDark: "#8a1c1c", wall: "#fff8fa", trim: "#ffb7c5" }, // Nhà D
  red:    { roof: "#e63946", roofDark: "#ba1826", wall: "#fff3f3", trim: "#ffd778" }, // FTU Shop, VP Đoàn
  vjcc:   { roof: "#5c1216", roofDark: "#3d0c0f", wall: "#ffffff", trim: "#cf9f3f" }, // Trường VJCBI
  booth:  { roof: "#5c1216", roofDark: "#3d0c0f", wall: "#fffaf0", trim: "#cf9f3f" }, // Bác bảo vệ
  lilac:  { roof: "#8b6cb0", roofDark: "#6e5291", wall: "#faf7ff", trim: "#d3bdf0" }, // Nhà K, H, F
  peach:  { roof: "#e76f51", roofDark: "#cc5234", wall: "#fff8f5", trim: "#f4a261" }, // KTX
  stage:  { roof: "#512da8", roofDark: "#311b92", wall: "#263238", trim: "#ffd778" }  // Sân khấu FCD
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
    if (c < 2 || c > 59 || r < 1 || r > 41) return false;
    const cx = c < 5 ? 5 : c > 56 ? 56 : c;
    const cy = r < 4 ? 4 : r > 38 ? 38 : r;
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
            this.solidGrid[r][c] = isSolid ? 1 : 0;
          }
        }
      }
    };

    // 3. Paved Avenues & Pathways (Theo Sơ đồ mặt bằng FTU & FCD)
    // Cổng Chùa Láng Entrance Plaza (Walkable)
    paint(7, 36, 6, 5, TILE_TYPES.PLAZA, false);
    paint(2, 36, 5, 1, TILE_TYPES.FENCE, true); // Hàng rào bên trái bốt bảo vệ

    // Con đường chính mép Tây chạy dọc từ Cổng lên Canteen
    paint(8, 5, 4, 32, TILE_TYPES.PATH, false);

    // Dốc Nhà B (giữa NHÀ H và Tòa B)
    paint(8, 11, 10, 3, TILE_TYPES.PATH, false);

    // Đường trước KTX 4 tầng & Nhà Thể chất
    paint(12, 5, 42, 2, TILE_TYPES.PATH, false);

    // Đường trước Tòa B & VP Đoàn/CLB
    paint(17, 13, 38, 1, TILE_TYPES.PATH, false);

    // 4. SÂN TRUNG TÂM FTU (Courtyard rộng lớn giữa Tòa B và Nhà A)
    paint(14, 17, 34, 10, TILE_TYPES.FESTIVAL_PLAZA, false);

    // Thảm cỏ xanh 2 bên Bia đá FTU
    paint(23, 21, 3, 2, TILE_TYPES.LAWN, false);
    paint(31, 21, 3, 2, TILE_TYPES.LAWN, false);

    // Đại lộ tách biệt giữa Nhà A (hàng 28-30) và Trường VJCBI (hàng 33-35)
    paint(12, 31, 35, 2, TILE_TYPES.PATH, false);

    // Đại lộ tách biệt giữa Trường VJCBI (hàng 33-35) và KTX 7 Tầng (hàng 38-40)
    paint(12, 36, 35, 2, TILE_TYPES.PATH, false);

    // Sân trước Sân khấu FCD & Nhà D
    paint(46, 25, 10, 3, TILE_TYPES.PLAZA, false);

    // Khu vực gửi xe phía Bắc
    paint(33, 7, 20, 2, TILE_TYPES.PARKING, false);

    // Khu vực gửi xe ngõ 84 Chùa Láng (phía Đông KTX 7 tầng)
    paint(29, 38, 20, 3, TILE_TYPES.PARKING, false);

    // Hàng rào hoa / tiểu cảnh ngăn cách dọc dãy booth Tây
    paint(13, 18, 1, 8, TILE_TYPES.FLOWERBED, true);

    const flowerBeds = [
      [12, 18], [12, 19], [33, 18], [34, 18], [36, 18], [37, 18],
      [13, 27], [13, 28], [43, 23], [43, 24], [43, 29], [43, 30],
      [8, 14], [8, 15], [30, 40], [31, 40], [17, 40], [18, 40]
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
    if (b.id === 'STAGE_FCD') {
      this.drawFCDStage(ctx, b);
      return;
    }

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

  // Grand Outdoor FCD 18/10 Festival Stage (facing West towards Central Plaza)
  drawFCDStage(ctx, b) {
    const x = b.x * this.tileSize;
    const y = b.y * this.tileSize;
    const w = b.w * this.tileSize;
    const h = b.h * this.tileSize;

    // 1. Stage Shadow
    ctx.fillStyle = 'rgba(11, 4, 3, 0.35)';
    ctx.beginPath();
    ctx.roundRect(x - 6, y + 8, w + 12, h + 8, 8);
    ctx.fill();

    // 2. High Wooden Platform
    ctx.fillStyle = '#3e2723';
    ctx.beginPath();
    ctx.roundRect(x, y + 16, w, h - 16, 6);
    ctx.fill();

    // Red Carpet on Stage Platform
    ctx.fillStyle = '#b71c1c';
    ctx.fillRect(x + 4, y + 24, w - 8, h - 32);

    // Gold Trim borders
    ctx.fillStyle = '#ffd778';
    ctx.fillRect(x + 4, y + 22, w - 8, 2);
    ctx.fillRect(x + 4, y + h - 10, w - 8, 2);

    // 3. Stage Backdrop Wall (FCD 18/10)
    const bgGrad = ctx.createLinearGradient(x, y, x + w, y);
    bgGrad.addColorStop(0, '#512da8');
    bgGrad.addColorStop(0.5, '#7b1fa2');
    bgGrad.addColorStop(1, '#311b92');
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.roundRect(x + 8, y, w - 16, 26, [6, 6, 0, 0]);
    ctx.fill();
    ctx.strokeStyle = '#ffd778';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 4. Large FCD Concert Lights / Spotlights
    const lightColors = ['#ff4081', '#00e5ff', '#ffd778', '#76ff03', '#ff9100'];
    for (let lx = x + 16, i = 0; lx <= x + w - 24; lx += 22, i++) {
      ctx.fillStyle = lightColors[i % lightColors.length];
      ctx.beginPath();
      ctx.arc(lx, y + 8, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Sound Speakers Towers on West Wings
    ctx.fillStyle = '#212121';
    ctx.fillRect(x - 4, y + 28, 8, h - 40);
    ctx.fillRect(x + w - 4, y + 28, 8, h - 40);

    // 6. Signboard: "★ SÂN KHẤU FCD ★"
    const textW = 108;
    const signX = x + w / 2 - textW / 2;
    const signY = y + 14;

    ctx.fillStyle = 'rgba(34, 7, 10, 0.95)';
    ctx.beginPath();
    ctx.roundRect(signX, signY, textW, 20, 6);
    ctx.fill();
    ctx.strokeStyle = '#ffd778';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffd778';
    ctx.font = 'bold 10px "Alviona", "Cinzel", serif';
    ctx.textAlign = 'center';
    ctx.fillText('★ SÂN KHẤU FCD ★', signX + textW / 2, signY + 14);

    // 7. Front stairs leading West into Central Plaza
    ctx.fillStyle = '#b0bec5';
    ctx.fillRect(x - 8, y + h / 2 - 16, 8, 32);
    ctx.fillStyle = '#78909c';
    ctx.fillRect(x - 8, y + h / 2 - 6, 8, 12);

    ctx.textAlign = 'start';
  }

  // Draw FCD Festival Elements at Central Plaza (Theo sơ đồ chi tiết người dùng cung cấp)
  drawFCDPlaza(ctx) {
    // ========================================================================
    // 1. BIA ĐÁ FTU (Tâm điểm Sân trường giữa Tòa B và Nhà A)
    // ========================================================================
    const biaX = 28 * this.tileSize;
    const biaY = 22 * this.tileSize;

    // Stone base / pedestal
    ctx.fillStyle = '#6c757d';
    ctx.beginPath();
    ctx.roundRect(biaX - 32, biaY + 8, 64, 14, 4);
    ctx.fill();
    ctx.strokeStyle = '#cf9f3f';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Red Circular FTU Stone Emblem
    ctx.fillStyle = '#b92b45';
    ctx.beginPath();
    ctx.arc(biaX, biaY - 2, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffd778';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // FTU Monogram / Crest
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FTU', biaX, biaY + 3);

    // Label: "BIA ĐÁ FTU"
    ctx.fillStyle = '#22070a';
    ctx.beginPath();
    ctx.roundRect(biaX - 42, biaY - 32, 84, 16, 4);
    ctx.fill();
    ctx.strokeStyle = '#ffd778';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#ffd778';
    ctx.font = 'bold 9px "Alviona", "Cinzel", serif';
    ctx.fillText('★ BIA ĐÁ FTU ★', biaX, biaY - 21);
    ctx.textAlign = 'start';

    // ========================================================================
    // 2. DÃY BOOTH KHỐI CLB CHUYÊN MÔN (Dọc phía Bắc Sân Trung Tâm, dưới Tòa B)
    // ========================================================================
    const cmX = 18 * this.tileSize;
    const cmY = 17 * this.tileSize;
    const cmW = 29 * this.tileSize;
    const cmH = 34;

    // Canopy mái bạt dài màu slate blue-grey
    ctx.fillStyle = '#455a64';
    ctx.beginPath();
    ctx.roundRect(cmX, cmY, cmW, cmH, [6, 6, 2, 2]);
    ctx.fill();
    ctx.fillStyle = '#ffd778';
    ctx.fillRect(cmX, cmY + cmH - 3, cmW, 3);

    // Bàn tư vấn dài
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cmX + 6, cmY + cmH - 8, cmW - 12, 6);

    // Banner lớn: "BOOTH KHỐI CLB CHUYÊN MÔN"
    const cmBannerW = 260;
    const cmBannerX = cmX + cmW / 2 - cmBannerW / 2;
    ctx.fillStyle = 'rgba(26, 35, 126, 0.9)';
    ctx.beginPath();
    ctx.roundRect(cmBannerX, cmY + 4, cmBannerW, 20, 5);
    ctx.fill();
    ctx.strokeStyle = '#ffd778';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★ BOOTH KHỐI CLB CHUYÊN MÔN ★', cmBannerX + cmBannerW / 2, cmY + 18);
    ctx.textAlign = 'start';

    // ========================================================================
    // 3. DÃY BOOTH DỌC PHÍA TÂY & GIAN TRẠI JPC (MÀU ĐỎ THẮM NỔI BẬT NHẤT SÂN!)
    // ========================================================================
    const stripX = 14 * this.tileSize;
    const stripY = 18 * this.tileSize;
    const stripW = 2 * this.tileSize;

    // A. Booth phía trên (hàng 18-20)
    ctx.fillStyle = '#5b8fd9';
    ctx.beginPath();
    ctx.roundRect(stripX, stripY, stripW, 2.5 * this.tileSize, [6, 6, 2, 2]);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CLB Âm Nhạc', stripX + stripW / 2, stripY + 28);
    ctx.fillText('& CLB Nhảy', stripX + stripW / 2, stripY + 44);

    // B. ★ GIAN TRẠI JPC ĐẶC BIỆT (hàng 21-23) — NỔI BẬT VỚI MÀU ĐỎ RỰC RỠ THEO SƠ ĐỒ!
    const jpcX = stripX - 4;
    const jpcY = 21 * this.tileSize - 4;
    const jpcW = stripW + 8;
    const jpcH = 68;

    // Ánh hào quang ấm áp dưới gian trại JPC
    ctx.fillStyle = 'rgba(230, 57, 70, 0.38)';
    ctx.beginPath();
    ctx.ellipse(jpcX + jpcW / 2, jpcY + jpcH + 6, 44, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mái vòm đỏ thắm viền vàng kim
    const canopyGrad = ctx.createLinearGradient(jpcX, jpcY, jpcX, jpcY + 36);
    canopyGrad.addColorStop(0, '#e63946');
    canopyGrad.addColorStop(1, '#5c1216');
    ctx.fillStyle = canopyGrad;
    ctx.beginPath();
    ctx.roundRect(jpcX, jpcY, jpcW, 36, [8, 8, 2, 2]);
    ctx.fill();
    ctx.strokeStyle = '#ffd778';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Viền vàng kim
    ctx.fillStyle = '#ffd778';
    ctx.fillRect(jpcX, jpcY + 34, jpcW, 3);

    // Cổng Torii mini trên nóc trại JPC
    ctx.fillStyle = '#e63946';
    ctx.fillRect(jpcX + 16, jpcY - 6, jpcW - 32, 4);
    ctx.fillRect(jpcX + 20, jpcY - 2, 4, 6);
    ctx.fillRect(jpcX + jpcW - 24, jpcY - 2, 4, 6);

    // CHỮ JPC TO TRẮNG TRÊN NỀN ĐỎ — CHUẨN THEO SƠ ĐỒ NGƯỜI DÙNG!
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px "Alviona", "Cinzel", serif';
    ctx.textAlign = 'center';
    ctx.fillText('JPC', jpcX + jpcW / 2, jpcY + 23);

    // Bàn tiếp đón nộp đơn Vòng 1
    ctx.fillStyle = '#fffdf8';
    ctx.beginPath();
    ctx.roundRect(jpcX + 4, jpcY + 38, jpcW - 8, 22, 3);
    ctx.fill();
    ctx.strokeStyle = '#cf9f3f';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#5c1216';
    ctx.font = 'bold 7.5px "Be Vietnam Pro", sans-serif';
    ctx.fillText('VÒNG 1: KHAI NHÃN', jpcX + jpcW / 2, jpcY + 52);

    // Đèn lồng Chōchin 2 bên
    const drawLantern = (lx, ly) => {
      ctx.fillStyle = '#222';
      ctx.fillRect(lx - 1, ly - 3, 2, 3);
      ctx.fillStyle = '#e63946';
      ctx.beginPath();
      ctx.ellipse(lx, ly + 5, 5, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd778';
      ctx.fillRect(lx - 3, ly + 3, 6, 3);
    };
    drawLantern(jpcX + 5, jpcY + 24);
    drawLantern(jpcX + jpcW - 5, jpcY + 24);

    // C. Booth phía dưới (hàng 24-25)
    const btmY = 24 * this.tileSize;
    ctx.fillStyle = '#8b6cb0';
    ctx.beginPath();
    ctx.roundRect(stripX, btmY, stripW, 1.8 * this.tileSize, [2, 2, 6, 6]);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px "Be Vietnam Pro", sans-serif';
    ctx.fillText('CLB Tranh Biện', stripX + stripW / 2, btmY + 24);
    ctx.textAlign = 'start';

    // ========================================================================
    // 4. DÃY BOOTH PHÍA NAM (TRÊN NHÀ A)
    // ========================================================================
    const southY = 25 * this.tileSize;

    // A. Booth Đoàn
    const doanX = 18 * this.tileSize;
    const doanW = 3 * this.tileSize;
    ctx.fillStyle = '#d32f2f';
    ctx.beginPath();
    ctx.roundRect(doanX, southY, doanW, 34, [6, 6, 2, 2]);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(doanX + 4, southY + 28, doanW - 8, 5);
    ctx.fillStyle = '#ffd778';
    ctx.font = 'bold 9px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Booth Đoàn', doanX + doanW / 2, southY + 20);

    // B. Booth HSV (Hội Sinh Viên)
    const hsvX = 21 * this.tileSize + 6;
    const hsvW = 3 * this.tileSize - 6;
    ctx.fillStyle = '#1976d2';
    ctx.beginPath();
    ctx.roundRect(hsvX, southY, hsvW, 34, [6, 6, 2, 2]);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(hsvX + 4, southY + 28, hsvW - 8, 5);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px "Be Vietnam Pro", sans-serif';
    ctx.fillText('Booth HSV', hsvX + hsvW / 2, southY + 20);

    // C. Booth khối CLB sở thích
    const stX = 24 * this.tileSize + 6;
    const stW = 23 * this.tileSize - 6;
    ctx.fillStyle = '#546e7a';
    ctx.beginPath();
    ctx.roundRect(stX, southY, stW, 34, [6, 6, 2, 2]);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(stX + 6, southY + 28, stW - 12, 5);

    const stBannerW = 240;
    const stBannerX = stX + stW / 2 - stBannerW / 2;
    ctx.fillStyle = 'rgba(38, 50, 56, 0.9)';
    ctx.beginPath();
    ctx.roundRect(stBannerX, southY + 4, stBannerW, 20, 5);
    ctx.fill();
    ctx.strokeStyle = '#ffd778';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9.5px "Be Vietnam Pro", sans-serif';
    ctx.fillText('★ BOOTH KHỐI CLB SỞ THÍCH ★', stBannerX + stBannerW / 2, southY + 18);
    ctx.textAlign = 'start';
  }

  // Draw Welcome Arch at Cổng Chùa Láng
  drawEntranceArch(ctx) {
    const ax = 8 * this.tileSize;
    const ay = 38 * this.tileSize;
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
    ctx.fillText('CỔNG CHÙA LÁNG · FTU', ax + aw / 2, ay + 6);
    ctx.textAlign = 'start';
  }

  // Pre-render a sleek Radar Mini-map (120 x 85 px)
  buildMiniMap() {
    const c = document.createElement('canvas');
    c.width = 120;
    c.height = 85;
    const ctx = c.getContext('2d');

    const scaleX = 120 / this.width;
    const scaleY = 85 / this.height;

    // Dark crimson velvet card base
    ctx.fillStyle = '#22070a';
    ctx.fillRect(0, 0, 120, 85);

    // Campus grass shape
    ctx.fillStyle = '#7bc87c';
    ctx.beginPath();
    ctx.roundRect(8, 6, 104, 73, 6);
    ctx.fill();

    // Draw buildings in mini-map
    FTU_BUILDINGS.forEach(b => {
      const bx = b.x * this.tileSize * scaleX;
      const by = b.y * this.tileSize * scaleY;
      const bw = b.w * this.tileSize * scaleX;
      const bh = b.h * this.tileSize * scaleY;
      if (b.id === 'STAGE_FCD') {
        ctx.fillStyle = '#9c27b0';
      } else {
        ctx.fillStyle = (b.id === 'D' || b.id === 'A' || b.id === 'B') ? '#e63946' : '#ffd778';
      }
      ctx.fillRect(bx, by, Math.max(3, bw), Math.max(3, bh));
    });

    // Draw Bia Đá FTU in Mini-map
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(28 * this.tileSize * scaleX, 22 * this.tileSize * scaleY, 3, 0, Math.PI * 2);
    ctx.fill();

    // Highlight West Strip JPC Booth in Mini-map (Bold Red Star Dot)
    ctx.fillStyle = '#e63946';
    ctx.beginPath();
    ctx.arc(15 * this.tileSize * scaleX, 22 * this.tileSize * scaleY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffd778';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    this.miniMapCanvas = c;
  }

  render(ctx, camera) {
    if (this.preRenderedCanvas) {
      // ctx is already camera-translated in game.js, so draw at world origin (0, 0)
      ctx.drawImage(this.preRenderedCanvas, 0, 0);
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
