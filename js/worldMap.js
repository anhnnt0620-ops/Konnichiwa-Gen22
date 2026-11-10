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
  { id: "KTX7", name: "KTX 7 tầng", x: 18, y: 37.5, w: 9, h: 3, style: "peach" }
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
    this.fcdBoothsCanvas = null;
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
    // Cổng Chùa Láng Entrance Plaza (Walkable - spans from booth bảo vệ across cổng trường)
    paint(7, 36, 6, 6, TILE_TYPES.PLAZA, false);
    paint(8, 41, 4, 3, TILE_TYPES.PATH, false); // Cầu / Lối vào qua cổng trường
    paint(2, 36, 5, 1, TILE_TYPES.FENCE, true); // Hàng rào bên trái bốt bảo vệ

    // Southern boundary wall collision (Solid wall along row 40)
    for (let c = 0; c <= 7; c++) this.solidGrid[40][c] = 1;
    for (let c = 12; c <= 33; c++) this.solidGrid[40][c] = 1;
    // Keep gate opening completely clear & walkable
    for (let r = 39; r <= 43; r++) {
      for (let c = 8; c <= 11; c++) {
        this.solidGrid[r][c] = 0;
      }
    }

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

    // Đại lộ tách biệt giữa Trường VJCBI (hàng 33-35) và KTX 7 Tầng (hàng 37.5-40.5)
    paint(12, 36, 35, 2, TILE_TYPES.PATH, false);
    // Sân trước KTX 7 tầng (sau tường chắn)
    paint(12, 38, 6, 3, TILE_TYPES.PATH, false);

    // Sân trước Sân khấu FCD & Nhà D
    paint(46, 25, 10, 3, TILE_TYPES.PLAZA, false);

    // Khu vực gửi xe phía Bắc
    paint(33, 7, 20, 2, TILE_TYPES.PARKING, false);

    // Khu vực gửi xe ngõ 84 Chùa Láng (phía Đông KTX 7 tầng)
    paint(27, 38, 22, 3, TILE_TYPES.PARKING, false);

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

    // 5. Register Building Collisions (STAGE_FCD is temporary for Stage 1 only)
    FTU_BUILDINGS.forEach(b => {
      if (b.id === 'STAGE_FCD') return; // Do not register STAGE_FCD as permanent collision!
      const startR = Math.floor(b.y);
      const endR = Math.ceil(b.y + b.h);
      for (let r = startR; r < endR; r++) {
        for (let c = b.x; c < b.x + b.w; c++) {
          if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
            const isDoor = (r === endR - 1) && Math.abs(c - (b.x + Math.floor(b.w / 2))) <= 0;
            if (!isDoor) {
              this.solidGrid[r][c] = 1;
            }
          }
        }
      }
    });

    // 6. Register Boundary Wall Collisions (Tường Chắn dọc mặt tiền FTU)
    // Phía Tây Bốt bảo vệ (c = 0..2, r = 41)
    for (let c = 0; c < 3; c++) {
      if (this.solidGrid[41]) this.solidGrid[41][c] = 1;
    }
    // Phía Đông Cổng Trường (c = 12..34, r = 41) - chạy trước KTX 7 tầng
    for (let c = 12; c <= 34; c++) {
      if (this.solidGrid[41]) this.solidGrid[41][c] = 1;
    }

    // 7. Register Bia Đá FTU Pedestal Collision (col 27..28, row 22)
    if (this.solidGrid[22]) {
      this.solidGrid[22][27] = 1;
      this.solidGrid[22][28] = 1;
    }
    // Đảm bảo lối đi qua Cổng trường (c = 7..11, r = 40..42) hoàn toàn thông thoáng
    for (let r = 40; r <= 42; r++) {
      for (let c = 7; c <= 11; c++) {
        if (this.solidGrid[r]) this.solidGrid[r][c] = 0;
      }
    }

    this.buildPreRenderedCanvas();
    this.buildFCDBoothsCanvas();
    this.buildMiniMap();
  }

  isSolid(worldX, worldY, currentStageId = 'stage1') {
    const col = Math.floor(worldX / this.tileSize);
    const row = Math.floor(worldY / this.tileSize);
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return true;

    // Sân khấu FCD chỉ tồn tại và cản trở di chuyển trong Vòng 1 (Stage 1 · FCD 18/10)!
    // Hết vòng 1 là dẹp sân khấu, khu vực này trở thành sân gạch mở!
    if (currentStageId === 'stage1') {
      if (col >= 48 && col < 53 && row >= 17 && row < 25) {
        return true;
      }
    }

    return this.solidGrid[row][col] === 1;
  }

  buildPreRenderedCanvas() {
    const scale = 2; // HiDPI 2x supersampling for razor-sharp text & graphics
    const c = document.createElement('canvas');
    c.width = this.width * scale;
    c.height = this.height * scale;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.scale(scale, scale);

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

    // B. Draw FTU Buildings with Smooth Modern 2D Vector Styling (Except STAGE_FCD which is temporary)
    FTU_BUILDINGS.forEach(b => {
      if (b.id !== 'STAGE_FCD') {
        this.drawModernBuilding(ctx, b, false);
      }
    });

    // C. Draw Permanent Bia Đá FTU
    this.drawBiaDaFTU(ctx, false);

    // D. Draw Boundary Wall (Tường Chắn bao quanh trường & trước KTX 7 tầng)
    this.drawBoundaryWall(ctx);

    // E. Draw Cổng Trường ĐH Ngoại Thương (ngay cạnh Bốt bảo vệ)
    this.drawEntranceArch(ctx, false);

    this.preRenderedCanvas = c;
  }

  // Pre-render temporary FCD Festival Booths & Sân khấu FCD (Only for Stage 1 · FCD 18/10)
  buildFCDBoothsCanvas() {
    const scale = 2; // HiDPI 2x supersampling
    const c = document.createElement('canvas');
    c.width = this.width * scale;
    c.height = this.height * scale;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.scale(scale, scale);
    this.drawFCDBooths(ctx, false);

    // Sân khấu FCD chỉ dựng trong Vòng 1 (Stage 1), hết vòng 1 là dẹp luôn!
    const stageB = FTU_BUILDINGS.find(b => b.id === 'STAGE_FCD');
    if (stageB) {
      this.drawFCDStage(ctx, stageB, false);
    }

    this.fcdBoothsCanvas = c;
  }

  // Draw modern 2D building with soft shadows, gradient roofs, and Alviona signage
  drawModernBuilding(ctx, b, drawSign = true) {
    if (b.id === 'STAGE_FCD') {
      this.drawFCDStage(ctx, b, drawSign);
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

    // 6. Signboard with 'Alviona' Font (rendered live in renderSignboards for 100% crisp vector text)
    if (drawSign) {
      this.renderBuildingSignboard(ctx, b);
    }
  }

  // Live Vector Signboard for Modern Buildings (Razor-sharp, never blurry)
  renderBuildingSignboard(ctx, b) {
    const x = b.x * this.tileSize;
    const y = b.y * this.tileSize;
    const w = b.w * this.tileSize;
    const h = b.h * this.tileSize;
    const roofHeight = Math.round(h * 0.52);

    ctx.font = 'bold 12px "Montserrat", -apple-system, sans-serif';
    const textW = Math.max(50, Math.round(ctx.measureText(b.name).width + 18));
    const signX = x + Math.floor(w / 2) - textW / 2;
    const signY = y + roofHeight - 17;

    ctx.fillStyle = 'rgba(34, 7, 10, 0.9)';
    ctx.beginPath();
    ctx.roundRect(signX, signY, textW, 19, 4);
    ctx.fill();
    ctx.strokeStyle = '#ffd778';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#ffd778';
    ctx.textAlign = 'center';
    ctx.fillText(b.name, signX + textW / 2, signY + 14);
    ctx.textAlign = 'start';
  }

  // Grand Outdoor FCD 18/10 Festival Stage (facing West towards Central Plaza)
  drawFCDStage(ctx, b, drawSign = true) {
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

    // 6. Front stairs leading West into Central Plaza
    ctx.fillStyle = '#b0bec5';
    ctx.fillRect(x - 8, y + h / 2 - 16, 8, 32);
    ctx.fillStyle = '#78909c';
    ctx.fillRect(x - 8, y + h / 2 - 6, 8, 12);

    if (drawSign) {
      this.renderFCDStageSignboard(ctx, b);
    }
  }

  // Live Vector Signboard for FCD Stage
  renderFCDStageSignboard(ctx, b) {
    const x = b.x * this.tileSize;
    const y = b.y * this.tileSize;
    const w = b.w * this.tileSize;
    const textW = 118;
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
    ctx.font = 'bold 10px "Montserrat", -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★ SÂN KHẤU FCD ★', signX + textW / 2, signY + 14);
    ctx.textAlign = 'start';
  }

  // Draw Permanent Bia Đá FTU (Tâm điểm Sân trường giữa Tòa B và Nhà A)
  drawBiaDaFTU(ctx, drawSign = true) {
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

    if (drawSign) {
      this.renderBiaDaSignboard(ctx);
    }
  }

  // Live Vector Signboard & Emblem for Bia Đá FTU
  renderBiaDaSignboard(ctx) {
    const biaX = 28 * this.tileSize;
    const biaY = 22 * this.tileSize;

    // FTU Monogram / Crest
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px "Montserrat", -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FTU', biaX, biaY + 3);

    // Label: "BIA ĐÁ FTU"
    ctx.fillStyle = '#22070a';
    ctx.beginPath();
    ctx.roundRect(biaX - 44, biaY - 32, 88, 16, 4);
    ctx.fill();
    ctx.strokeStyle = '#ffd778';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#ffd778';
    ctx.font = 'bold 9.5px "Montserrat", -apple-system, sans-serif';
    ctx.fillText('★ BIA ĐÁ FTU ★', biaX, biaY - 21);
    ctx.textAlign = 'start';
  }

  // Draw Temporary FCD Festival Booths (Chỉ xuất hiện trong Vòng 1 / FCD 18/10)
  drawFCDBooths(ctx, drawSign = true) {
    // ========================================================================
    // 1. CỔNG CHÀO TÂN SINH VIÊN (BẮC NGANG ĐẠI LỘ · HÀNG 34.5)
    // ========================================================================
    const fcdGateX = 7.5 * this.tileSize;
    const fcdGateY = 34.5 * this.tileSize;
    const fcdGateW = 5 * this.tileSize; // 160px spanning road
    const fcdGateH = 42;

    // A. Thảm đỏ check-in chào đón trên đường
    ctx.fillStyle = 'rgba(230, 57, 70, 0.18)';
    ctx.fillRect(fcdGateX + 16, fcdGateY + 12, fcdGateW - 32, 28);

    // B. Cột cổng chào 2 bên (Màu đỏ thắm viền vàng)
    ctx.fillStyle = '#b92b45';
    ctx.fillRect(fcdGateX + 4, fcdGateY, 10, fcdGateH);
    ctx.fillRect(fcdGateX + fcdGateW - 14, fcdGateY, 10, fcdGateH);

    ctx.fillStyle = '#ffd778';
    ctx.fillRect(fcdGateX + 2, fcdGateY + fcdGateH - 4, 14, 4);
    ctx.fillRect(fcdGateX + fcdGateW - 16, fcdGateY + fcdGateH - 4, 14, 4);
    ctx.fillRect(fcdGateX + 2, fcdGateY, 14, 4);
    ctx.fillRect(fcdGateX + fcdGateW - 16, fcdGateY, 14, 4);

    // C. Chùm bóng bay trang trí 2 bên cột (Pastel hồng & vàng kim)
    const drawBalloonCluster = (bx, by) => {
      const colors = ['#ff8da1', '#ffd778', '#ffccd5', '#e63946', '#ffffff'];
      const offsets = [
        [-5, -6, 4.5], [5, -8, 4.5], [0, -14, 5], [-7, -18, 4.2], [6, -17, 4.2]
      ];
      offsets.forEach(([ox, oy, r], idx) => {
        ctx.fillStyle = colors[idx % colors.length];
        ctx.beginPath();
        ctx.ellipse(bx + ox, by + oy, r, r * 1.25, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });
      // Dây bóng
      ctx.strokeStyle = '#ffd778';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bx, by - 4);
      ctx.lineTo(bx, by + 6);
      ctx.stroke();
    };
    drawBalloonCluster(fcdGateX + 9, fcdGateY - 2);
    drawBalloonCluster(fcdGateX + fcdGateW - 9, fcdGateY - 2);

    // ========================================================================
    // 2. BÀN CHECK-IN FCD (ĐỐI DIỆN FTU SHOP · PHÍA ĐÔNG ĐƯỜNG · HÀNG 29.5)
    // Tách biệt hoàn toàn khỏi Cổng chào, không gian thông thoáng, không bị díu chữ!
    // ========================================================================
    const deskX = 13 * this.tileSize;
    const deskY = 29.5 * this.tileSize;
    const deskW = 54;
    const deskH = 22;

    // A. Mái che / Canopy kẻ sọc đỏ-vàng cho bàn check-in
    ctx.fillStyle = '#b92b45';
    ctx.beginPath();
    ctx.roundRect(deskX - 3, deskY - 16, deskW + 6, 12, [4, 4, 1, 1]);
    ctx.fill();
    ctx.fillStyle = '#ffd778';
    ctx.fillRect(deskX - 3, deskY - 6, deskW + 6, 2.5);

    // 2 cột đỡ mái
    ctx.fillStyle = '#5c1216';
    ctx.fillRect(deskX + 2, deskY - 5, 2.5, 7);
    ctx.fillRect(deskX + deskW - 4.5, deskY - 5, 2.5, 7);

    // B. Mặt bàn Check-in FCD (Khăn trải bàn trắng viền đỏ)
    ctx.fillStyle = '#fffdf8';
    ctx.beginPath();
    ctx.roundRect(deskX, deskY, deskW, deskH, 3);
    ctx.fill();
    ctx.strokeStyle = '#cf9f3f';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Khăn trải bàn đỏ trung tâm
    ctx.fillStyle = '#b92b45';
    ctx.fillRect(deskX + 8, deskY, deskW - 16, deskH);

    // Chữ 'CHECK-IN' in trên mặt khăn trải bàn phía trước
    ctx.fillStyle = '#ffd778';
    ctx.font = 'bold 7px "Montserrat", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CHECK-IN FCD', deskX + deskW / 2, deskY + deskH - 5);
    ctx.textAlign = 'start';

    // C. Laptop check-in & danh sách tân sinh viên
    ctx.fillStyle = '#37474f';
    ctx.fillRect(deskX + 18, deskY + 2, 14, 8);
    ctx.fillStyle = '#90caf9';
    ctx.fillRect(deskX + 19, deskY + 3, 12, 6);

    // Tài liệu & bút check-in
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(deskX + 4, deskY + 4, 10, 11);
    ctx.fillStyle = '#cf9f3f';
    ctx.fillRect(deskX + 6, deskY + 6, 6, 1.5);
    ctx.fillRect(deskX + 6, deskY + 9, 6, 1.5);
    ctx.fillRect(deskX + 6, deskY + 12, 4, 1.5);

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
    ctx.strokeStyle = '#ffd778';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(stripX + 4, stripY + 2.5 * this.tileSize - 6, stripW - 8, 4);

    // B. ★ GIAN TRẠI JPC ĐẶC BIỆT (hàng 21-23) — NỔI BẬT VỚI MÀU ĐỎ RỰC RỠ THEO SƠ ĐỒ!
    const jpcX = stripX - 4;
    const jpcY = 21 * this.tileSize - 4;
    const jpcW = stripW + 8;
    const jpcH = 68;

    // Thảm chào đón dưới gian trại JPC
    ctx.fillStyle = 'rgba(230, 57, 70, 0.16)';
    ctx.beginPath();
    ctx.roundRect(jpcX - 2, jpcY + 36, jpcW + 4, 32, 4);
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

    // Bàn tiếp đón
    ctx.fillStyle = '#fffdf8';
    ctx.beginPath();
    ctx.roundRect(jpcX + 4, jpcY + 38, jpcW - 8, 20, 3);
    ctx.fill();
    ctx.strokeStyle = '#cf9f3f';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Khăn trải bàn đỏ trung tâm bàn
    ctx.fillStyle = '#b92b45';
    ctx.fillRect(jpcX + jpcW / 2 - 10, jpcY + 38, 20, 20);

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
    ctx.strokeStyle = '#ffd778';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(stripX + 4, btmY + 1.8 * this.tileSize - 6, stripW - 8, 4);

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

    // B. Booth HSV (Hội Sinh Viên)
    const hsvX = 21 * this.tileSize + 6;
    const hsvW = 3 * this.tileSize - 6;
    ctx.fillStyle = '#1976d2';
    ctx.beginPath();
    ctx.roundRect(hsvX, southY, hsvW, 34, [6, 6, 2, 2]);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(hsvX + 4, southY + 28, hsvW - 8, 5);

    // C. Booth khối CLB sở thích
    const stX = 24 * this.tileSize + 6;
    const stW = 23 * this.tileSize - 6;
    ctx.fillStyle = '#546e7a';
    ctx.beginPath();
    ctx.roundRect(stX, southY, stW, 34, [6, 6, 2, 2]);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(stX + 6, southY + 28, stW - 12, 5);

    if (drawSign) {
      this.renderFCDBoothsSignboards(ctx);
    }
  }

  // Live Vector Signboard for Cổng Chào Tân Sinh Viên FCD
  renderFCDGateSignboard(ctx) {
    const fcdGateX = 7.5 * this.tileSize;
    const fcdGateY = 34.5 * this.tileSize;
    const fcdGateW = 5 * this.tileSize;

    ctx.fillStyle = '#b92b45';
    ctx.beginPath();
    ctx.roundRect(fcdGateX, fcdGateY - 8, fcdGateW, 22, 6);
    ctx.fill();
    ctx.strokeStyle = '#ffd778';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffd778';
    ctx.font = 'bold 8.5px "Montserrat", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★ CỔNG CHÀO TÂN SINH VIÊN · FCD 2026 ★', fcdGateX + fcdGateW / 2, fcdGateY + 6);
    ctx.textAlign = 'start';
  }

  // Live Vector Signboards for FCD Festival Booths (Razor-sharp, never blurry)
  renderFCDBoothsSignboards(ctx) {
    // 1. Banner khối CLB chuyên môn (Montserrat)
    const cmX = 18 * this.tileSize;
    const cmY = 17 * this.tileSize;
    const cmW = 29 * this.tileSize;
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
    ctx.font = 'bold 10px "Montserrat", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★ BOOTH KHỐI CLB CHUYÊN MÔN ★', cmBannerX + cmBannerW / 2, cmY + 18);

    // 2. Chữ JPC to trắng trên nền đỏ (Alviona)
    const stripX = 14 * this.tileSize;
    const jpcX = stripX - 4;
    const jpcY = 21 * this.tileSize - 4;
    const jpcW = 2 * this.tileSize + 8;

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px "Montserrat", -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('JPC', jpcX + jpcW / 2, jpcY + 24);

    // 3. Dãy booth phía Nam: Đoàn, HSV, Sở thích (Montserrat)
    const southY = 25 * this.tileSize;

    // Booth Đoàn
    const doanX = 18 * this.tileSize;
    const doanW = 3 * this.tileSize;
    ctx.fillStyle = '#ffd778';
    ctx.font = 'bold 9.5px "Montserrat", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Booth Đoàn', doanX + doanW / 2, southY + 20);

    // Booth HSV
    const hsvX = 21 * this.tileSize + 6;
    const hsvW = 3 * this.tileSize - 6;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9.5px "Montserrat", sans-serif';
    ctx.fillText('Booth HSV', hsvX + hsvW / 2, southY + 20);

    // Booth khối CLB sở thích
    const stX = 24 * this.tileSize + 6;
    const stW = 23 * this.tileSize - 6;
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
    ctx.font = 'bold 10px "Montserrat", sans-serif';
    ctx.fillText('★ BOOTH KHỐI CLB SỞ THÍCH ★', stBannerX + stBannerW / 2, southY + 18);
    ctx.textAlign = 'start';
  }

  // Draw Boundary Wall (Tường Chắn bao quanh trường & trước KTX 7 tầng)
  drawBoundaryWall(ctx) {
    const wy = 40.5 * this.tileSize + 12; // 1308px
    const wallH = 20;

    const drawWallSection = (startX, endX) => {
      const w = endX - startX;
      if (w <= 0) return;

      // 1. Soft drop shadow on ground / water
      ctx.fillStyle = 'rgba(11, 4, 3, 0.22)';
      ctx.fillRect(startX - 2, wy + wallH - 2, w + 4, 6);

      // 2. Concrete/Stone Plinth Base
      ctx.fillStyle = '#455a64';
      ctx.fillRect(startX, wy + wallH - 6, w, 6);
      ctx.fillStyle = '#37474f';
      ctx.fillRect(startX, wy + wallH - 1, w, 1.5);

      // 3. Stucco Wall Body (Warm creamy FTU white)
      ctx.fillStyle = '#fffdf8';
      ctx.fillRect(startX, wy + 2, w, wallH - 8);

      // Decorative panel inset line
      ctx.strokeStyle = '#e0d8c3';
      ctx.lineWidth = 1;
      ctx.strokeRect(startX + 2, wy + 4, w - 4, wallH - 12);

      // 4. Terracotta Roof Cap with Gold Trim (Matching FTU architectural red tile)
      ctx.fillStyle = '#b92b45';
      ctx.fillRect(startX - 1, wy - 2, w + 2, 4.5);
      ctx.fillStyle = '#ffd778';
      ctx.fillRect(startX - 1, wy + 2.5, w + 2, 1);

      // 5. Decorative Brick Pillars with Finials every 3.5 tiles (112px)
      const step = 3.5 * this.tileSize;
      for (let px = startX; px <= endX; px += step) {
        const pillarW = 10;
        const pX = Math.min(endX - pillarW, Math.max(startX, px - pillarW / 2));

        // Pillar Body
        ctx.fillStyle = '#5c1216';
        ctx.fillRect(pX, wy - 4, pillarW, wallH + 5);

        // Pillar Gold Cap
        ctx.fillStyle = '#ffd778';
        ctx.fillRect(pX - 1.5, wy - 5.5, pillarW + 3, 3);

        // Ornamental Gold Finial / Crest
        ctx.fillStyle = '#cf9f3f';
        ctx.beginPath();
        ctx.arc(pX + pillarW / 2, wy - 8, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // Phân đoạn Tây: Bên trái Bốt bảo vệ (c = 1.5..3)
    drawWallSection(1.5 * this.tileSize, 3 * this.tileSize);

    // Phân đoạn Đông: Từ cột phải Cổng trường chạy ngang qua toàn bộ KTX 7 tầng & Bãi đỗ xe (c = 11.5..33)
    const rightPillarX = 7 * this.tileSize + 148 - 8; // 364px
    drawWallSection(rightPillarX, 33 * this.tileSize);
  }

  // Draw Gate at Cổng Trường ĐH Ngoại Thương (ngay cạnh Bốt bảo vệ)
  drawEntranceArch(ctx, drawSign = true) {
    const ax = 7 * this.tileSize; // 224px (ngay cạnh Bốt bảo vệ col 3..7)
    const ay = 40.5 * this.tileSize;
    const aw = 148;
    const ah = 44;

    // Gate pillars (Crimson with gold accents)
    ctx.fillStyle = '#5c1216';
    ctx.fillRect(ax + 2, ay, 10, ah);
    ctx.fillRect(ax + aw - 12, ay, 10, ah);

    // Decorative pillar caps & bases
    ctx.fillStyle = '#cf9f3f';
    ctx.fillRect(ax, ay, 14, 4);
    ctx.fillRect(ax + aw - 14, ay, 14, 4);
    ctx.fillRect(ax, ay + ah - 4, 14, 4);
    ctx.fillRect(ax + aw - 14, ay + ah - 4, 14, 4);

    if (drawSign) {
      this.renderEntranceArchSignboard(ctx);
    }
  }

  // Live Vector Signboard for Cổng Trường ĐH Ngoại Thương
  renderEntranceArchSignboard(ctx) {
    const ax = 7 * this.tileSize;
    const ay = 40.5 * this.tileSize;
    const aw = 148;

    // Top Signboard
    ctx.fillStyle = '#b92b45';
    ctx.beginPath();
    ctx.roundRect(ax, ay - 8, aw, 22, 6);
    ctx.fill();
    ctx.strokeStyle = '#ffd778';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffd778';
    ctx.font = 'bold 8.5px "Montserrat", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TRƯỜNG ĐẠI HỌC NGOẠI THƯƠNG', ax + aw / 2, ay + 6);
    ctx.textAlign = 'start';
  }

  // Render All Vector Signboards Live (Ground / Building Level)
  renderAllSignboards(ctx, currentStageId = 'stage1') {
    // 1. Building Name Signboards (Alviona)
    FTU_BUILDINGS.forEach(b => {
      if (b.id === 'STAGE_FCD') {
        // Sân khấu FCD chỉ có ở Vòng 1, hết Vòng 1 là dẹp luôn!
        if (currentStageId === 'stage1') {
          this.renderFCDStageSignboard(ctx, b);
        }
      } else {
        this.renderBuildingSignboard(ctx, b);
      }
    });

    // 2. Bia Đá FTU Signboard (Alviona)
    this.renderBiaDaSignboard(ctx);

    // 3. Temporary FCD Booths Signboards (Stage 1 only)
    if (currentStageId === 'stage1') {
      this.renderFCDBoothsSignboards(ctx);
    }
  }

  // Overhead Arches & Gate Signboards (Drawn OVER player and NPCs so they pass UNDER the arches)
  drawOverheadSignboards(ctx, currentStageId = 'stage1') {
    // A. Cổng Trường ĐH Ngoại Thương
    this.renderEntranceArchSignboard(ctx);

    // B. Cổng Chào Tân Sinh Viên FCD
    if (currentStageId === 'stage1') {
      this.renderFCDGateSignboard(ctx);
    }
  }

  // Pre-render a sleek Radar Mini-map
  buildMiniMap(w = 140, h = 98) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');

    const scaleX = w / this.width;
    const scaleY = h / this.height;

    // Deep crimson background
    ctx.fillStyle = '#1a0508';
    ctx.fillRect(0, 0, w, h);

    // Campus grass base
    ctx.fillStyle = '#68b872';
    ctx.beginPath();
    ctx.roundRect(3, 3, w - 6, h - 6, 4);
    ctx.fill();

    // Central Sân Trung Tâm Plaza
    const sqX = 14 * this.tileSize * scaleX;
    const sqY = 17 * this.tileSize * scaleY;
    const sqW = 34 * this.tileSize * scaleX;
    const sqH = 9 * this.tileSize * scaleY;
    ctx.fillStyle = '#f9e8b2';
    ctx.fillRect(sqX, sqY, sqW, sqH);

    // Main avenues in mini-map
    ctx.fillStyle = '#f0e3cc';
    // West Avenue
    ctx.fillRect(7 * this.tileSize * scaleX, 4, 3 * this.tileSize * scaleX, h - 8);
    // South Avenue
    ctx.fillRect(4, 39 * this.tileSize * scaleY, w - 8, 3 * this.tileSize * scaleY);

    // Draw buildings in mini-map
    FTU_BUILDINGS.forEach(b => {
      const bx = b.x * this.tileSize * scaleX;
      const by = b.y * this.tileSize * scaleY;
      const bw = b.w * this.tileSize * scaleX;
      const bh = b.h * this.tileSize * scaleY;
      if (b.id === 'D' || b.id === 'A' || b.id === 'B') {
        ctx.fillStyle = '#d32f2f'; // Primary buildings: Nhà A, B, D
      } else if (b.id === 'STAGE_FCD') {
        return; // Temporary building for Stage 1 only (drawn dynamically in renderMiniMapToCanvas)
      } else if (b.id === 'VJCBI') {
        ctx.fillStyle = '#e67e22'; // VJCBI
      } else {
        ctx.fillStyle = '#607d8b'; // Secondary buildings: KTX, Canteen...
      }
      ctx.fillRect(bx, by, Math.max(2, bw), Math.max(2, bh));
    });

    // Draw Bia Đá FTU in Mini-map
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(28 * this.tileSize * scaleX, 22 * this.tileSize * scaleY, 2.5, 0, Math.PI * 2);
    ctx.fill();

    this.miniMapCanvas = c;
    return c;
  }

  render(ctx, camera, currentStageId = 'stage1') {
    if (this.preRenderedCanvas) {
      // Draw 2x supersampled canvas with exact world dimensions for razor-sharp rendering
      ctx.drawImage(this.preRenderedCanvas, 0, 0, this.width, this.height);
    }
    // Only draw FCD festival booths during Stage 1 (FTU Club Day · FCD 18/10)!
    if (currentStageId === 'stage1' && this.fcdBoothsCanvas) {
      ctx.drawImage(this.fcdBoothsCanvas, 0, 0, this.width, this.height);
    }

    // Live Vector Text Pass for Razor-Sharp Typography (Never Blurry / Never Pixelated!)
    this.renderAllSignboards(ctx, currentStageId);
  }

  renderMiniMapToCanvas(targetCanvas, playerX, playerY, questSpot, currentStageId = 'stage1') {
    if (!targetCanvas) return;
    const ctx = targetCanvas.getContext('2d');
    const w = targetCanvas.width;
    const h = targetCanvas.height;

    if (!this.miniMapCanvas || this.miniMapCanvas.width !== w || this.miniMapCanvas.height !== h) {
      this.buildMiniMap(w, h);
    }

    // Draw pre-rendered mini map
    ctx.drawImage(this.miniMapCanvas, 0, 0, w, h);

    // Draw Sân khấu FCD marker on minimap ONLY during stage1
    if (currentStageId === 'stage1') {
      const stageB = FTU_BUILDINGS.find(b => b.id === 'STAGE_FCD');
      if (stageB) {
        const scaleX = w / this.width;
        const scaleY = h / this.height;
        ctx.fillStyle = '#8e24aa';
        ctx.fillRect(stageB.x * this.tileSize * scaleX, stageB.y * this.tileSize * scaleY, stageB.w * this.tileSize * scaleX, stageB.h * this.tileSize * scaleY);
      }
    }

    const scaleX = w / this.width;
    const scaleY = h / this.height;

    // Highlight West Strip JPC Booth in Mini-map ONLY during Stage 1!
    if (currentStageId === 'stage1') {
      ctx.fillStyle = '#e63946';
      ctx.beginPath();
      ctx.arc(15 * this.tileSize * scaleX, 22 * this.tileSize * scaleY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffd778';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Quest Target marker (Pulsing glowing beacon)
    if (questSpot) {
      const qx = questSpot.x * scaleX;
      const qy = questSpot.y * scaleY;
      const pulse = 3 + Math.sin(Date.now() / 200) * 2;

      ctx.fillStyle = 'rgba(230, 57, 70, 0.4)';
      ctx.beginPath();
      ctx.arc(qx, qy, pulse + 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#e63946';
      ctx.beginPath();
      ctx.arc(qx, qy, 3.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Player Blip (Bright Gold with expanding radar ping)
    const px = playerX * scaleX;
    const py = playerY * scaleY;

    // Expanding radar ping
    const pingRadius = ((Date.now() % 1400) / 1400) * 10;
    const pingAlpha = Math.max(0, 1 - (pingRadius / 10));
    ctx.strokeStyle = `rgba(255, 215, 120, ${pingAlpha})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(px, py, pingRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Solid player dot
    ctx.fillStyle = '#ffd778';
    ctx.beginPath();
    ctx.arc(px, py, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#22070a';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  // Compatibility fallback
  renderMiniMap(ctx, playerX, playerY, questSpot) {
    // If a DOM canvas #minimap-canvas exists, renderMiniMapToCanvas handles it!
    const domMiniMap = document.getElementById('minimap-canvas');
    if (domMiniMap) {
      this.renderMiniMapToCanvas(domMiniMap, playerX, playerY, questSpot);
    }
  }
}

window.worldMap = new WorldMap();
