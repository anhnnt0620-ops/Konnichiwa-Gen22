const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
const { createServerSigningKeyPair, sealForClientPublicKey } = require('./scripts/crypto-seal');

const SERVER_SIGNING_KEYS = createServerSigningKeyPair();

// Load .env cleanly without external dependencies
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');
  const parsed = {};
  try {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) continue;
        const eqIdx = line.indexOf('=');
        if (eqIdx === -1) continue;
        const key = line.slice(0, eqIdx).trim();
        let val = line.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        parsed[key] = val;
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  } catch (err) {
    console.warn('[MasterServer] Khong the doc .env:', err.message);
  }
  return parsed;
}

const ENV_VARS = loadEnvFile();
const PORT = Number(process.env.PORT || 3000);
const STATE_FILE = path.join(__dirname, '.master-state.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.mov': 'video/quicktime',
  '.mp4': 'video/mp4'
};

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const MASTER_INFO = {
  isMaster: true,
  serverKey: 'master_' + os.hostname().toLowerCase().replace(/[^a-z0-9_-]/g, '_'),
  serverLabel: 'Máy Chủ Mẹ (' + os.hostname() + ')',
  host: getLocalIP(),
  port: PORT,
  startedAt: new Date().toISOString()
};

// Master persistence store (all servers & all stages)
let masterStore = {
  master: MASTER_INFO,
  servers: {},
  players: {},
  stageCompletions: {
    stage1: {},
    stage2: {},
    stage3_1: {},
    stage3_2: {},
    stage_final: {}
  },
  matchmakingQueue: {},
  bossRooms: {}
};

function loadMasterStore() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const data = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
      if (data && typeof data === 'object') {
        masterStore = {
          master: MASTER_INFO,
          servers: data.servers || {},
          players: data.players || {},
          stageCompletions: {
            stage1: {},
            stage2: {},
            stage3_1: {},
            stage3_2: {},
            stage_final: {},
            ...(data.stageCompletions || {})
          },
          matchmakingQueue: {},
          bossRooms: {}
        };
      }
    }
  } catch (err) {
    console.warn('[MasterServer] Khoi tao state moi:', err.message);
  }
  masterStore.servers[MASTER_INFO.serverKey] = {
    serverKey: MASTER_INFO.serverKey,
    serverLabel: MASTER_INFO.serverLabel,
    origin: `http://${MASTER_INFO.host}:${PORT}`,
    isMaster: true,
    lastSeen: Date.now(),
    status: 'online'
  };
}

let persistTimer = null;
function schedulePersist() {
  if (persistTimer) return;
  persistTimer = setTimeout(() => {
    persistTimer = null;
    try {
      const snapshot = {
        master: MASTER_INFO,
        servers: masterStore.servers,
        players: masterStore.players,
        stageCompletions: masterStore.stageCompletions,
        updatedAt: Date.now()
      };
      fs.writeFile(STATE_FILE, JSON.stringify(snapshot, null, 2), () => {});
    } catch (e) {}
  }, 400);
}

// Optional mirror to Firebase RTDB REST when configured
function getFirebaseDatabaseUrl() {
  if (ENV_VARS.VITE_FIREBASE_DATABASE_URL) {
    return ENV_VARS.VITE_FIREBASE_DATABASE_URL.replace(/\/$/, '');
  }
  if (ENV_VARS.VITE_FIREBASE_PROJECT_ID) {
    return `https://${ENV_VARS.VITE_FIREBASE_PROJECT_ID}-default-rtdb.asia-southeast1.firebasedatabase.app`;
  }
  return '';
}

async function mirrorToFirebaseRTDB(subPath, payload) {
  const baseUrl = getFirebaseDatabaseUrl();
  if (!baseUrl) return false;
  try {
    const res = await fetch(`${baseUrl}/${subPath}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

function sendJSON(res, statusCode, obj) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=UTF-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(obj));
}

function readJsonBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 2 * 1024 * 1024) raw = raw.slice(0, 2 * 1024 * 1024);
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

// Matchmaking cleanup & helper
const ALL_DEPTS = ['chuyenmon', 'doingoai', 'tochuc', 'thongtin', 'nhansu'];

function pruneStaleQueueAndRooms() {
  const now = Date.now();
  for (const [pid, entry] of Object.entries(masterStore.matchmakingQueue)) {
    if (!entry || now - (entry.updatedAt || 0) > 45000) {
      delete masterStore.matchmakingQueue[pid];
    }
  }
  for (const [rid, room] of Object.entries(masterStore.bossRooms)) {
    if (!room || now - (room.updatedAt || 0) > 10 * 60 * 1000) {
      delete masterStore.bossRooms[rid];
    }
  }
}

function handleApiRequest(req, res, pathname, urlObj) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return true;
  }

  if (pathname === '/env-config.js') {
    const remoteAddr = (req.socket && req.socket.remoteAddress) || '';
    const isLocalLoopback = remoteAddr === '127.0.0.1' || remoteAddr === '::1' || remoteAddr === '::ffff:127.0.0.1';
    const hasSealedVault = Boolean(ENV_VARS.VITE_FIREBASE_API_KEY && ENV_VARS.VITE_FIREBASE_PROJECT_ID);
    const jsBody =
      `window.__MASTER_SERVER_INFO__ = ${JSON.stringify({
        ...MASTER_INFO,
        clientIsMaster: isLocalLoopback,
        hasSealedVault,
        sealEndpoint: hasSealedVault ? '/api/env-seal' : null,
        serverTime: Date.now()
      })};\n`;
    res.writeHead(200, {
      'Content-Type': 'application/javascript; charset=UTF-8',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(jsBody);
    return true;
  }

  if (pathname === '/api/env-seal' && req.method === 'POST') {
    readJsonBody(req).then((body) => {
      if (!ENV_VARS.VITE_FIREBASE_API_KEY || !ENV_VARS.VITE_FIREBASE_PROJECT_ID) {
        sendJSON(res, 404, { ok: false, error: 'Firebase vault not configured on Master Server' });
        return;
      }
      const firebaseClientConfig = {
        apiKey: ENV_VARS.VITE_FIREBASE_API_KEY || '',
        authDomain: ENV_VARS.VITE_FIREBASE_AUTH_DOMAIN || '',
        projectId: ENV_VARS.VITE_FIREBASE_PROJECT_ID || '',
        storageBucket: ENV_VARS.VITE_FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: ENV_VARS.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
        appId: ENV_VARS.VITE_FIREBASE_APP_ID || '',
        measurementId: ENV_VARS.VITE_FIREBASE_MEASUREMENT_ID || '',
        databaseURL: ENV_VARS.VITE_FIREBASE_DATABASE_URL || getFirebaseDatabaseUrl()
      };
      try {
        const envelope = sealForClientPublicKey(firebaseClientConfig, {
          clientPublicKeySpkiB64: body.clientPublicKeySpki,
          clientNonce: body.clientNonce,
          signingKeyPair: SERVER_SIGNING_KEYS
        });
        sendJSON(res, 200, { ok: true, envelope });
      } catch (err) {
        sendJSON(res, 400, { ok: false, error: err.message || 'Invalid sealing request' });
      }
    });
    return true;
  }

  if (pathname === '/api/health') {
    sendJSON(res, 200, {
      ok: true,
      master: MASTER_INFO,
      hasFirebase: Boolean(ENV_VARS.VITE_FIREBASE_API_KEY && ENV_VARS.VITE_FIREBASE_PROJECT_ID),
      serversCount: Object.keys(masterStore.servers).length,
      playersCount: Object.keys(masterStore.players).length,
      serverTime: Date.now()
    });
    return true;
  }

  if (pathname === '/api/sync/state' && req.method === 'GET') {
    pruneStaleQueueAndRooms();
    const now = Date.now();
    masterStore.servers[MASTER_INFO.serverKey].lastSeen = now;
    sendJSON(res, 200, {
      ok: true,
      master: MASTER_INFO,
      servers: masterStore.servers,
      players: masterStore.players,
      stageCompletions: masterStore.stageCompletions,
      bossRooms: masterStore.bossRooms,
      serverTime: now
    });
    return true;
  }

  if (pathname === '/api/sync/player' && req.method === 'POST') {
    readJsonBody(req).then((body) => {
      const now = Date.now();
      const player = body.player;
      const server = body.server;

      if (server && server.serverKey) {
        masterStore.servers[server.serverKey] = {
          ...(masterStore.servers[server.serverKey] || {}),
          ...server,
          lastSeen: now
        };
      }
      masterStore.servers[MASTER_INFO.serverKey].lastSeen = now;

      if (player && player.playerId) {
        masterStore.players[player.playerId] = {
          ...(masterStore.players[player.playerId] || {}),
          ...player,
          updatedAt: now
        };

        if (Array.isArray(player.completedStages)) {
          for (const stId of player.completedStages) {
            if (!masterStore.stageCompletions[stId]) {
              masterStore.stageCompletions[stId] = {};
            }
            masterStore.stageCompletions[stId][player.playerId] = {
              playerName: player.playerName,
              dept: player.selectedDept,
              deptName: player.selectedDeptName,
              serverKey: player.serverKey,
              serverLabel: player.serverLabel,
              completedAt: now
            };
          }
        }

        mirrorToFirebaseRTDB(`jpc_gen22/players/${player.playerId}`, masterStore.players[player.playerId]);
        if (server && server.serverKey) {
          mirrorToFirebaseRTDB(`jpc_gen22/servers/${server.serverKey}`, masterStore.servers[server.serverKey]);
        }
      }

      schedulePersist();
      sendJSON(res, 200, { ok: true, master: MASTER_INFO, serverTime: now });
    });
    return true;
  }

  if (pathname === '/api/matchmaking/join' && req.method === 'POST') {
    readJsonBody(req).then((body) => {
      pruneStaleQueueAndRooms();
      const now = Date.now();
      const { playerId, playerName, dept, deptName, serverKey, serverLabel } = body;
      if (!playerId || !ALL_DEPTS.includes(dept)) {
        sendJSON(res, 400, { ok: false, error: 'Missing playerId or valid dept' });
        return;
      }

      masterStore.matchmakingQueue[playerId] = {
        playerId,
        playerName: playerName || 'Kouhai Gen 22',
        dept,
        deptName: deptName || dept,
        serverKey: serverKey || MASTER_INFO.serverKey,
        serverLabel: serverLabel || MASTER_INFO.serverLabel,
        isHuman: true,
        updatedAt: now
      };

      // First check if player already sits in an active waiting room, else find open slot for this dept
      let assignedRoom = null;
      for (const room of Object.values(masterStore.bossRooms)) {
        if (room.status === 'matching' && room.slots && room.slots[dept]?.playerId === playerId) {
          assignedRoom = room;
          break;
        }
      }
      if (!assignedRoom) {
        for (const room of Object.values(masterStore.bossRooms)) {
          if (room.status === 'matching' && room.slots && !room.slots[dept]) {
            assignedRoom = room;
            break;
          }
        }
      }

      if (!assignedRoom) {
        const roomId = 'room_' + now.toString(36) + '_' + Math.random().toString(36).slice(2, 6);
        assignedRoom = {
          roomId,
          status: 'matching', // matching | fighting | victory | failed
          hostId: playerId,
          masterServerKey: MASTER_INFO.serverKey,
          masterReady: false,
          createdAt: now,
          updatedAt: now,
          tenguHp: 100,
          currentQIdx: 0,
          questionStartedAt: now,
          slots: {},
          history: []
        };
        masterStore.bossRooms[roomId] = assignedRoom;
      }

      const prevReady = !!(assignedRoom.slots[dept]?.playerId === playerId && assignedRoom.slots[dept]?.ready);
      assignedRoom.slots[dept] = {
        playerId,
        playerName: playerName || 'Kouhai Gen 22',
        dept,
        deptName: deptName || dept,
        serverKey: serverKey || MASTER_INFO.serverKey,
        serverLabel: serverLabel || MASTER_INFO.serverLabel,
        isHuman: true,
        ready: prevReady,
        joinedAt: assignedRoom.slots[dept]?.joinedAt || now
      };
      assignedRoom.updatedAt = now;

      sendJSON(res, 200, { ok: true, room: assignedRoom, serverTime: now });
    });
    return true;
  }

  if (pathname === '/api/matchmaking/room' && req.method === 'GET') {
    const roomId = urlObj.searchParams.get('roomId');
    const room = roomId ? masterStore.bossRooms[roomId] : null;
    if (!room) {
      sendJSON(res, 404, { ok: false, error: 'Room not found' });
      return true;
    }
    sendJSON(res, 200, { ok: true, room, serverTime: Date.now() });
    return true;
  }

  if (pathname === '/api/matchmaking/action' && req.method === 'POST') {
    readJsonBody(req).then((body) => {
      const now = Date.now();
      const { roomId, type, payload } = body;
      const room = roomId ? masterStore.bossRooms[roomId] : null;
      if (!room) {
        sendJSON(res, 404, { ok: false, error: 'Room not found' });
        return;
      }

      if (type === 'toggle_ready' && payload && ALL_DEPTS.includes(payload.dept)) {
        if (room.slots && room.slots[payload.dept]) {
          room.slots[payload.dept].ready = !!payload.ready;
        }
      } else if (type === 'start_battle' && payload) {
        room.status = 'fighting';
        room.masterReady = true;
        room.slots = payload.slots || room.slots;
        room.questions = payload.questions || room.questions;
        room.tenguHp = 100;
        room.currentQIdx = 0;
        room.questionStartedAt = now;
        room.history = [];
      } else if (type === 'solve_question' && payload) {
        if (room.currentQIdx === payload.qIdx && room.status === 'fighting') {
          room.tenguHp = Math.max(0, room.tenguHp - 20);
          room.history.push({
            qIdx: payload.qIdx,
            solvedBy: payload.solvedBy,
            solvedDept: payload.solvedDept,
            sourceDept: payload.sourceDept,
            answer: payload.answer,
            timeUsed: payload.timeUsed,
            isFinalBlow: payload.qIdx === 4,
            ok: true
          });
          if (payload.qIdx >= 4) {
            room.status = room.tenguHp <= 0 ? 'victory' : 'failed';
          } else {
            room.currentQIdx += 1;
            room.questionStartedAt = now;
          }
        }
      } else if (type === 'timeout_question' && payload) {
        if (room.currentQIdx === payload.qIdx && room.status === 'fighting') {
          room.history.push({
            qIdx: payload.qIdx,
            solvedBy: payload.assignedName,
            solvedDept: payload.assignedDept,
            sourceDept: payload.sourceDept,
            answer: payload.correctAnswer,
            timeUsed: 10,
            isFinalBlow: payload.qIdx === 4,
            ok: false
          });
          if (payload.qIdx >= 4) {
            room.status = 'failed';
          } else {
            room.currentQIdx += 1;
            room.questionStartedAt = now;
          }
        }
      }

      room.updatedAt = now;
      mirrorToFirebaseRTDB(`jpc_gen22/bossRooms/${room.roomId}`, room);
      sendJSON(res, 200, { ok: true, room, serverTime: now });
    });
    return true;
  }

  return false;
}

loadMasterStore();

const server = http.createServer((req, res) => {
  const reqUrl = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = decodeURIComponent(reqUrl.pathname);

  if (handleApiRequest(req, res, pathname, reqUrl)) {
    return;
  }

  let decodedUrl = pathname;
  if (decodedUrl === '/' || decodedUrl === '') {
    decodedUrl = '/index.html';
  }

  const filePath = path.join(__dirname, decodedUrl);

  // Security: prevent path traversal & never expose .env, server state, scripts, git metadata, or config over HTTP
  const relPath = path.relative(__dirname, filePath).replace(/\\/g, '/');
  const baseName = path.basename(filePath);
  const blockedExact = new Set([
    '.master-state.json',
    'server.js',
    'package.json',
    'package-lock.json',
    'firebase-config.json',
    'firebase.json',
    '.firebaserc',
    'database.rules.json'
  ]);
  const isBlocked =
    !filePath.startsWith(__dirname) ||
    relPath.startsWith('..') ||
    baseName.startsWith('.env') ||
    blockedExact.has(baseName) ||
    relPath.startsWith('.git/') ||
    relPath.startsWith('.github/') ||
    relPath.startsWith('scripts/') ||
    relPath.startsWith('node_modules/');

  if (isBlocked) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=UTF-8' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
      res.end('404 Not Found: ' + decodedUrl);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Access-Control-Allow-Origin': '*'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    const localIP = getLocalIP();
    console.log('\n============================================================');
    console.log('🌸 KONNICHIWA GEN 22 - MÁY CHỦ MẸ (MASTER SERVER) ĐANG CHẠY');
    console.log('============================================================');
    console.log(`👑 Máy Chủ Mẹ (PC):        http://localhost:${PORT}`);
    if (localIP !== 'localhost') {
      console.log(`📱 Mở trên điện thoại:     http://${localIP}:${PORT}`);
      console.log('   (Các thiết bị & máy chủ kết nối chung LAN hoặc Firebase)');
    }
    console.log(`🔥 Firebase Project:       ${ENV_VARS.VITE_FIREBASE_PROJECT_ID || 'Chưa cấu hình .env'}`);
    console.log('============================================================');
    console.log('💡 Nhấn Ctrl + C để dừng máy chủ.\n');

    if (process.platform === 'win32') {
      exec(`start http://localhost:${PORT}`);
    }
  });
}

module.exports = { server, masterStore, MASTER_INFO, loadEnvFile };
