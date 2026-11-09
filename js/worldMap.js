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

// FTU Buildings Definition (According to Official Sơ đồ FTU)
const FTU_BUILDINGS = [
  // Dọc mép Tây (hướng phố Chùa Láng)
  { id: "BV", name: "Bốt Bảo Vệ", x: 3, y: 32, w: 4, h: 3, style: "booth", small: true },
  { id: "SHOP", name: "FTU Shop", x: 3, y: 26, w: 5, h: 3, style: "red" },
  { id: "F", name: "Nhà F", x: 3, y: 19, w: 5, h: 5, style: "lilac" },
  { id: "H", name: "Nhà H", x: 3, y: 11, w: 5, h: 6, style: "lilac" },
  { id: "CT", name: "Canteen FTU", x: 3, y: 4, w: 5, h: 5, style: "butter" },

  // Dãy phía Bắc
  { id: "K", name: "Nhà K", x: 10, y: 3, w: 6, h: 4, style: "lilac" },
  { id: "KTX4", name: "KTX 4 tầng", x: 18, y: 3, w: 14, h: 4, style: "peach" },
  { id: "TC", name: "Nhà Thể chất", x: 34, y: 3, w: 12, h: 5, style: "mint", door: "bottom" },

  // Dãy phía Đông
  { id: "E", name: "Nhà E", x: 50, y: 3, w: 6, h: 4, style: "sky" },
  { id: "G", name: "Nhà G", x: 50, y: 8, w: 6, h: 4, style: "sky" },
  { id: "D", name: "Nhà D", x: 48, y: 18, w: 8, h: 8, style: "rose", door: "bottom" },

  // Khu Trung Tâm
  { id: "B", name: "Nhà B (Giảng Đường)", x: 11, y: 10, w: 25, h: 5, style: "cream" },
  { id: "VP_DOAN", name: "VP Đoàn & VP CLB", x: 36, y: 11, w: 10, h: 4, style: "red" },
  { id: "A", name: "Nhà A (Trung Tâm)", x: 11, y: 23, w: 26, h: 5, style: "cream" },
  { id: "VJCC", name: "Viện VJCC (VJCBI)", x: 16, y: 28, w: 14, h: 3, style: "vjcc", door: "bottom" },

  // Dãy phía Nam (Tách biệt hoàn toàn với VJCC bằng đại lộ hàng 31-33!)
  { id: "KTX7", name: "KTX 7 Tầng - Study Space", x: 15, y: 34, w: 15, h: 3, style: "peach" }
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
            this.solidGrid[r][c] = isSolid ? 1 : 0;
          }
        }
      }
    };

    // 3. Paved Avenues & Pathways (Theo Sơ đồ thực tế FTU)
    // Cổng Chùa Láng Entrance Plaza (Walkable)
    paint(7, 31, 7, 6, TILE_TYPES.PLAZA, false);
    paint(2, 31, 5, 1, TILE_TYPES.FENCE, true); // Hàng rào bên trái bốt bảo vệ

    // Đại lộ tách biệt giữa VJCC (hàng 28-30) và KTX 7 Tầng (hàng 34-36)
    paint(12, 31, 35, 3, TILE_TYPES.PATH, false);

    // Con đường chính mép Tây chạy dọc từ Cổng lên Canteen
    paint(8, 8, 3, 27, TILE_TYPES.PATH, false);
    paint(10, 8, 38, 2, TILE_TYPES.PATH, false); // Đường trước KTX 4 tầng & Nhà Thể chất

    // Dốc Nhà B (giữa Nhà H và Nhà B)
    paint(8, 12, 4, 3, TILE_TYPES.PATH, false);

    // Đường kết nối sang Văn phòng đoàn & Nhà D
    paint(36, 15, 12, 3, TILE_TYPES.PATH, false);
    paint(46, 17, 2, 10, TILE_TYPES.PATH, false);

    // 4. SÂN TRUNG TÂM FTU (Giữa Nhà A và Nhà B — Nơi đặt Bia đá FTU & Gian trại FCD)
    paint(11, 15, 25, 8, TILE_TYPES.FESTIVAL_PLAZA, false);

    // Thảm cỏ xanh 2 bên Bia đá FTU
    paint(18, 16, 4, 2, TILE_TYPES.LAWN, false);
    paint(26, 16, 4, 2, TILE_TYPES.LAWN, false);

    // Thảm cây xanh ("Cây" trong Ảnh 2) ngăn giữa dãy trại và Nhà H
    paint(13, 21, 20, 1, TILE_TYPES.FLOWERBED, true);

    // Hàng ghế đá Nhà A ("Ghế nhà A" trong Ảnh 2)
    paint(13, 22, 20, 1, TILE_TYPES.PATH, false);

    // Sân KTX (phía Nam KTX 4 tầng)
    paint(18, 7, 14, 2, TILE_TYPES.COURT, false);

    // Khu vực gửi xe phía Bắc
    paint(34, 8, 14, 2, TILE_TYPES.PARKING, false);

    // Khu vực gửi xe ngõ 84 Chùa Láng (phía Đông KTX 7 tầng)
    paint(31, 33, 16, 4, TILE_TYPES.PARKING, false);

    // Sân Nhà D & Khu vực Backdrop số 13
    paint(46, 26, 10, 5, TILE_TYPES.PLAZA, false);

    // Hedges & Flowerbeds
    paint(34, 21, 1, 6, TILE_TYPES.HEDGE, true);
    paint(39, 21, 1, 6, TILE_TYPES.HEDGE, true);

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

  // Draw FCD Festival Elements at Central Plaza (Bia đá FTU & 6 Gian trại theo Ảnh 2)
  drawFCDPlaza(ctx) {
    // ========================================================================
    // 1. BIA ĐÁ FTU (Tâm điểm Sân trường giữa Nhà A và Nhà B)
    // ========================================================================
    const biaX = 23 * this.tileSize + 16;
    const biaY = 16 * this.tileSize + 16;

    // Stone base / pedestal
    ctx.fillStyle = '#6c757d';
    ctx.beginPath();
    ctx.roundRect(biaX - 28, biaY + 8, 56, 14, 4);
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
    ctx.roundRect(biaX - 38, biaY - 32, 76, 16, 4);
    ctx.fill();
    ctx.strokeStyle = '#ffd778';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#ffd778';
    ctx.font = 'bold 9px "Alviona", "Cinzel", serif';
    ctx.fillText('★ BIA ĐÁ FTU ★', biaX, biaY - 21);
    ctx.textAlign = 'start';

    // ========================================================================
    // 2. DÃY 6 GIAN TRẠI FCD TẠI SÂN TRUNG TÂM (Theo Sơ đồ Ảnh 2)
    // Gian 1, 2, 3, 4, JPC (gian thứ 2 từ bên phải!), Gian 6
    // ========================================================================
    const boothY = 18 * this.tileSize;

    // Các gian khác (Booth 1, 2, 3, 4, 6)
    const otherBooths = [
      { name: "CLB Âm Nhạc", x: 15 * this.tileSize, color: "#5b8fd9" },
      { name: "CLB Nhảy", x: 18 * this.tileSize, color: "#8b6cb0" },
      { name: "CLB Tình Nguyện", x: 21 * this.tileSize, color: "#e76f51" },
      { name: "CLB Tiếng Anh", x: 24 * this.tileSize, color: "#4fa58b" },
      { name: "CLB Tranh Biện", x: 30 * this.tileSize, color: "#e0a030" }
    ];

    otherBooths.forEach(b => {
      // Canopy mái bạt
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.roundRect(b.x, boothY, 68, 40, [6, 6, 2, 2]);
      ctx.fill();

      // Bàn lễ tân đón khách
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(b.x + 4, boothY + 34, 60, 6);

      // Tên CLB
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8.5px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(b.name, b.x + 34, boothY + 22);
      ctx.textAlign = 'start';
    });

    // ========================================================================
    // ★ GIAN TRẠI JPC: GIAN THỨ 2 TỪ BÊN PHẢI (x: 27 * 32, y: 18 * 32)
    // Trang trí Cổng Torii, Đèn lồng đỏ, Mái vòm hoàng gia, Banner JPC!
    // ========================================================================
    const jpcX = 27 * this.tileSize - 4;
    const jpcY = boothY - 6;
    const jpcW = 76;
    const jpcH = 48;

    // Ánh hào quang ấm áp dưới gian trại JPC
    ctx.fillStyle = 'rgba(230, 57, 70, 0.35)';
    ctx.beginPath();
    ctx.ellipse(jpcX + jpcW / 2, jpcY + jpcH + 6, 44, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mái vòm đỏ thắm viền vàng kim
    const canopyGrad = ctx.createLinearGradient(jpcX, jpcY, jpcX, jpcY + 32);
    canopyGrad.addColorStop(0, '#e63946');
    canopyGrad.addColorStop(1, '#5c1216');
    ctx.fillStyle = canopyGrad;
    ctx.beginPath();
    ctx.roundRect(jpcX, jpcY, jpcW, 32, [8, 8, 2, 2]);
    ctx.fill();

    // Viền vàng kim
    ctx.fillStyle = '#ffd778';
    ctx.fillRect(jpcX, jpcY + 30, jpcW, 3);

    // Bàn tư vấn nộp đơn Vòng 1
    ctx.fillStyle = '#fffdf8';
    ctx.beginPath();
    ctx.roundRect(jpcX + 6, jpcY + 33, jpcW - 12, 18, 3);
    ctx.fill();
    ctx.strokeStyle = '#cf9f3f';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Huy hiệu JPC đỏ chữ vàng rực rỡ (Khớp logo JPC trong Ảnh 2)
    ctx.fillStyle = '#b92b45';
    ctx.beginPath();
    ctx.roundRect(jpcX + jpcW / 2 - 20, jpcY + 6, 40, 18, 4);
    ctx.fill();
    ctx.strokeStyle = '#ffd778';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#ffd778';
    ctx.font = 'bold 10px "Alviona", "Cinzel", serif';
    ctx.textAlign = 'center';
    ctx.fillText('JPC', jpcX + jpcW / 2, jpcY + 19);

    // Chú thích: Gian thứ 2 từ bên phải!
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 7.5px "Be Vietnam Pro", sans-serif';
    ctx.fillText('VÒNG 1: KHAI NHÃN', jpcX + jpcW / 2, jpcY + 45);
    ctx.textAlign = 'start';

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
    drawLantern(jpcX + 5, jpcY + 28);
    drawLantern(jpcX + jpcW - 5, jpcY + 28);

    // ========================================================================
    // 3. BACKDROP SỐ 13 TẠI SÂN NHÀ D (Theo Sơ đồ Ảnh 1)
    // ========================================================================
    const bdX = 48 * this.tileSize - 12;
    const bdY = 25 * this.tileSize;
    ctx.fillStyle = '#b92b45';
    ctx.beginPath();
    ctx.roundRect(bdX, bdY, 70, 36, 6);
    ctx.fill();
    ctx.strokeStyle = '#ffd778';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffd778';
    ctx.font = 'bold 8px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BACKDROP #13', bdX + 35, bdY + 16);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('FCD 18/10 FTU', bdX + 35, bdY + 28);
    ctx.textAlign = 'start';
  }

  // Draw Welcome Arch at Cổng Chùa Láng
  drawEntranceArch(ctx) {
    const ax = 7 * this.tileSize;
    const ay = 33 * this.tileSize;
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
      ctx.fillStyle = (b.id === 'D' || b.id === 'A' || b.id === 'B') ? '#e63946' : '#ffd778';
      ctx.fillRect(bx, by, Math.max(3, bw), Math.max(3, bh));
    });

    // Highlight Central Plaza JPC Booth in Mini-map
    ctx.fillStyle = '#ff85a1';
    ctx.beginPath();
    ctx.arc(27 * this.tileSize * scaleX + 8, 19 * this.tileSize * scaleY + 6, 6, 0, Math.PI * 2);
    ctx.fill();

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
