// Cross-Server & Firebase Realtime Database Sync + Stage 3.1 Matchmaking Coordinator
class FirebaseSyncManager {
  constructor() {
    this.PLAYER_ID_KEY = 'jpc_gen22_player_id_v1';
    this.MASTER_URL_KEY = 'jpc_gen22_master_url_v1';
    this.playerId = this.getOrCreatePlayerId();
    this.masterServerUrl = this.detectMasterServerUrl();
    this.serverInfo = this.detectCurrentServerNode();
    this.channel = (typeof BroadcastChannel !== 'undefined')
      ? new BroadcastChannel('jpc_gen22_cross_server_bus')
      : null;

    this.cachedTelemetry = {
      master: {
        isMaster: this.serverInfo.isMaster,
        serverLabel: this.serverInfo.serverLabel
      },
      servers: {},
      players: {},
      stageCompletions: {},
      bossRooms: {}
    };

    this.localRooms = {};
    this.activeRoomCallbacks = new Map();
    this.syncTimer = null;

    this.setupBroadcastListener();
    this.probeMasterHealth();
  }

  getOrCreatePlayerId() {
    try {
      let existing = localStorage.getItem(this.PLAYER_ID_KEY);
      if (!existing) {
        existing = 'p_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
        localStorage.setItem(this.PLAYER_ID_KEY, existing);
      }
      return existing;
    } catch (_) {
      return 'p_' + Math.random().toString(36).slice(2, 10);
    }
  }

  detectMasterServerUrl() {
    try {
      const override = localStorage.getItem(this.MASTER_URL_KEY);
      if (override) return override.replace(/\/$/, '');
    } catch (_) {}

    if (typeof window !== 'undefined' && window.__MASTER_SERVER_INFO__) {
      return window.location.origin;
    }
    if (typeof window !== 'undefined' && window.location && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return window.location.origin;
    }
    return '';
  }

  setCustomMasterServerUrl(url) {
    const clean = (url || '').trim().replace(/\/$/, '');
    this.masterServerUrl = clean;
    try {
      if (clean) localStorage.setItem(this.MASTER_URL_KEY, clean);
      else localStorage.removeItem(this.MASTER_URL_KEY);
    } catch (_) {}
    this.probeMasterHealth();
  }

  detectCurrentServerNode() {
    const masterMeta = (typeof window !== 'undefined' && window.__MASTER_SERVER_INFO__)
      ? window.__MASTER_SERVER_INFO__
      : null;

    const host = (typeof window !== 'undefined' && window.location && window.location.host)
      ? window.location.host
      : 'local-offline';
    const hostname = (typeof window !== 'undefined' && window.location && window.location.hostname)
      ? window.location.hostname
      : 'localhost';

    const isMaster = hostname === 'localhost' || hostname === '127.0.0.1' || !!(masterMeta && masterMeta.clientIsMaster === true);
    const rawKey = (isMaster && masterMeta && masterMeta.serverKey)
      ? masterMeta.serverKey
      : ('sv_' + host.toLowerCase().replace(/[^a-z0-9_-]/g, '_'));

    let serverLabel = (isMaster && masterMeta && masterMeta.serverLabel) ? masterMeta.serverLabel : `Máy Khách (${host})`;
    if (hostname.includes('github.io')) serverLabel = 'Máy Chủ GitHub Pages';
    else if (hostname.includes('web.app') || hostname.includes('firebaseapp.com')) serverLabel = 'Máy Chủ Firebase Hosting';
    else if (isMaster && (!masterMeta || !masterMeta.serverLabel)) serverLabel = `Máy Chủ Mẹ (${host})`;

    return {
      serverKey: rawKey,
      serverLabel,
      origin: (typeof window !== 'undefined' && window.location) ? window.location.origin : '',
      isMaster,
      status: 'online'
    };
  }

  async probeMasterHealth() {
    if (this.masterServerUrl) {
      try {
        const res = await fetch(`${this.masterServerUrl}/api/health`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data && data.master) {
            this.masterOnline = true;
            this.masterMeta = data.master;
            this.updateHudPill();
            return;
          }
        }
      } catch (_) {}
    }
    this.masterOnline = false;
    this.updateHudPill();
  }

  onFirebaseStateChanged(fbState) {
    this.fbState = fbState;
    this.updateHudPill();
  }

  updateHudPill() {
    const pill = document.getElementById('hud-server-pill');
    if (!pill) return;

    const fbReady = !!(window.JPCFirebase && window.JPCFirebase.rtdbReady);
    if (this.serverInfo.isMaster && this.masterOnline && fbReady) {
      pill.textContent = '👑 Máy Chủ Mẹ · Firebase ON';
      pill.className = 'hud-server-pill master online';
    } else if (this.serverInfo.isMaster && this.masterOnline) {
      pill.textContent = '👑 Máy Chủ Mẹ · LAN/Local';
      pill.className = 'hud-server-pill master';
    } else if (fbReady) {
      pill.textContent = '🔥 Firebase Đã Liên Kết';
      pill.className = 'hud-server-pill online';
    } else if (this.masterOnline) {
      pill.textContent = '🌐 Liên Kết Máy Chủ Mẹ';
      pill.className = 'hud-server-pill online';
    } else {
      pill.textContent = '📡 Chế Độ Cục Bộ';
      pill.className = 'hud-server-pill offline';
    }
  }

  setupBroadcastListener() {
    if (!this.channel) return;
    this.channel.onmessage = (event) => {
      const msg = event.data;
      if (!msg || !msg.type) return;
      if (msg.type === 'room_update' && msg.room) {
        this.localRooms[msg.room.roomId] = msg.room;
        const cb = this.activeRoomCallbacks.get(msg.room.roomId);
        if (cb) cb(msg.room);
      } else if (msg.type === 'player_sync' && msg.player) {
        this.cachedTelemetry.players[msg.player.playerId] = msg.player;
        if (msg.server) this.cachedTelemetry.servers[msg.server.serverKey] = msg.server;
      }
    };
  }

  buildPlayerPayload(game) {
    if (!game) return null;
    return {
      playerId: this.playerId,
      playerName: game.playerName || 'Kouhai Gen 22',
      selectedDept: game.player?.selectedDept || 'chuyenmon',
      selectedDeptName: game.player?.selectedDeptName || 'Ban Chuyên Môn',
      currentStageId: game.currentStageId || 'stage1',
      currentZone: game.currentZone || 'campus',
      unlockedStages: Array.isArray(game.unlockedStages) ? [...game.unlockedStages] : ['stage1'],
      completedStages: Array.isArray(game.completedStages) ? [...game.completedStages] : [],
      stageProgress: game.stageProgress || {},
      playerX: Math.round(game.player?.x || 0),
      playerY: Math.round(game.player?.y || 0),
      memoriesCount: Array.isArray(game.memories) ? game.memories.length : 0,
      serverKey: this.serverInfo.serverKey,
      serverLabel: this.serverInfo.serverLabel,
      isMasterNode: this.serverInfo.isMaster,
      updatedAt: Date.now()
    };
  }

  syncGameProgress(game, immediate = false) {
    const playerPayload = this.buildPlayerPayload(game);
    if (!playerPayload) return;

    this.serverInfo.lastSeen = Date.now();
    this.cachedTelemetry.players[playerPayload.playerId] = playerPayload;
    this.cachedTelemetry.servers[this.serverInfo.serverKey] = { ...this.serverInfo };

    if (this.channel) {
      try {
        this.channel.postMessage({
          type: 'player_sync',
          player: playerPayload,
          server: this.serverInfo
        });
      } catch (_) {}
    }

    const doPush = async () => {
      // 1. Push to Firebase Realtime Database SDK if active
      const fb = window.JPCFirebase;
      if (fb && fb.rtdbReady && fb.db && fb.sdk) {
        try {
          const { ref, set } = fb.sdk;
          await set(ref(fb.db, `jpc_gen22/players/${playerPayload.playerId}`), playerPayload);
          await set(ref(fb.db, `jpc_gen22/servers/${this.serverInfo.serverKey}`), this.serverInfo);

          for (const stageId of playerPayload.completedStages) {
            await set(ref(fb.db, `jpc_gen22/stageCompletions/${stageId}/${playerPayload.playerId}`), {
              playerName: playerPayload.playerName,
              dept: playerPayload.selectedDept,
              deptName: playerPayload.selectedDeptName,
              serverKey: playerPayload.serverKey,
              serverLabel: playerPayload.serverLabel,
              completedAt: playerPayload.updatedAt
            });
          }

          if (this.serverInfo.isMaster) {
            await set(ref(fb.db, 'jpc_gen22/masterServer'), {
              ...this.serverInfo,
              heartbeatAt: Date.now()
            });
          }
        } catch (err) {
          console.warn('[FirebaseSync] RTDB sync note:', err?.message || err);
        }
      }

      // 2. Push to Master Server Node ("Máy Chủ Mẹ") if configured/reachable
      if (this.masterServerUrl) {
        try {
          await fetch(`${this.masterServerUrl}/api/sync/player`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              player: playerPayload,
              server: this.serverInfo
            })
          });
        } catch (_) {}
      }
    };

    if (immediate) {
      doPush();
    } else {
      if (this.syncTimer) clearTimeout(this.syncTimer);
      this.syncTimer = setTimeout(doPush, 500);
    }
  }

  async fetchGlobalTelemetry() {
    // Merge Master Server + Firebase RTDB + local cache
    if (this.masterServerUrl) {
      try {
        const res = await fetch(`${this.masterServerUrl}/api/sync/state`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data) {
            this.cachedTelemetry.master = data.master || this.cachedTelemetry.master;
            this.cachedTelemetry.servers = { ...this.cachedTelemetry.servers, ...(data.servers || {}) };
            this.cachedTelemetry.players = { ...this.cachedTelemetry.players, ...(data.players || {}) };
            this.cachedTelemetry.stageCompletions = {
              ...this.cachedTelemetry.stageCompletions,
              ...(data.stageCompletions || {})
            };
            this.cachedTelemetry.bossRooms = { ...this.cachedTelemetry.bossRooms, ...(data.bossRooms || {}) };
          }
        }
      } catch (_) {}
    }

    const fb = window.JPCFirebase;
    if (fb && fb.rtdbReady && fb.db && fb.sdk) {
      try {
        const { ref, get } = fb.sdk;
        const snap = await get(ref(fb.db, 'jpc_gen22'));
        if (snap.exists()) {
          const val = snap.val() || {};
          if (val.masterServer) this.cachedTelemetry.master = val.masterServer;
          if (val.servers) this.cachedTelemetry.servers = { ...this.cachedTelemetry.servers, ...val.servers };
          if (val.players) this.cachedTelemetry.players = { ...this.cachedTelemetry.players, ...val.players };
          if (val.stageCompletions) {
            this.cachedTelemetry.stageCompletions = { ...this.cachedTelemetry.stageCompletions, ...val.stageCompletions };
          }
          if (val.bossRooms) {
            this.cachedTelemetry.bossRooms = { ...this.cachedTelemetry.bossRooms, ...val.bossRooms };
          }
        }
      } catch (_) {}
    }

    return this.cachedTelemetry;
  }

  // =========================================================================
  // STAGE 3.1: CROSS-SERVER 5-BAN RANDOM MATCHMAKING & TENGU BOSS ROOM SYNC
  // =========================================================================
  async joinStage31Room(playerProfile) {
    const profile = {
      playerId: this.playerId,
      playerName: playerProfile.playerName || 'Kouhai Gen 22',
      dept: playerProfile.dept || 'chuyenmon',
      deptName: playerProfile.deptName || 'Ban Chuyên Môn',
      serverKey: this.serverInfo.serverKey,
      serverLabel: this.serverInfo.serverLabel,
      isHuman: true
    };

    // 1. Try Firebase Realtime Database shared queue/rooms
    const fb = window.JPCFirebase;
    if (fb && fb.rtdbReady && fb.db && fb.sdk) {
      try {
        const { ref, get, set } = fb.sdk;
        const roomsSnap = await get(ref(fb.db, 'jpc_gen22/bossRooms'));
        let targetRoom = null;
        const now = Date.now();

        if (roomsSnap.exists()) {
          const rooms = Object.values(roomsSnap.val() || {});
          for (const room of rooms) {
            if (room && room.status === 'matching' && now - (room.updatedAt || 0) < 600000) {
              if (room.slots && room.slots[profile.dept]?.playerId === profile.playerId) {
                targetRoom = room;
                break;
              }
            }
          }
          if (!targetRoom) {
            for (const room of rooms) {
              if (room && room.status === 'matching' && now - (room.updatedAt || 0) < 600000) {
                if (!room.slots || !room.slots[profile.dept]) {
                  targetRoom = room;
                  break;
                }
              }
            }
          }
        }

        if (!targetRoom) {
          const roomId = 'room_' + now.toString(36) + '_' + Math.random().toString(36).slice(2, 6);
          targetRoom = {
            roomId,
            status: 'matching',
            hostId: profile.playerId,
            masterServerKey: this.serverInfo.isMaster ? this.serverInfo.serverKey : 'firebase-cloud',
            masterReady: false,
            createdAt: now,
            updatedAt: now,
            tenguHp: 100,
            currentQIdx: 0,
            questionStartedAt: now,
            slots: {},
            history: []
          };
        }

        if (!targetRoom.slots) targetRoom.slots = {};
        const prevReady = !!(targetRoom.slots[profile.dept]?.playerId === profile.playerId && targetRoom.slots[profile.dept]?.ready);
        targetRoom.slots[profile.dept] = { ...profile, ready: prevReady, joinedAt: targetRoom.slots[profile.dept]?.joinedAt || now };
        if (this.serverInfo.isMaster) targetRoom.masterServerKey = this.serverInfo.serverKey;
        targetRoom.updatedAt = now;

        await set(ref(fb.db, `jpc_gen22/bossRooms/${targetRoom.roomId}`), targetRoom);
        this.localRooms[targetRoom.roomId] = targetRoom;
        return { mode: 'firebase', room: targetRoom };
      } catch (err) {
        console.warn('[Stage3.1 Matchmaking] Firebase fallback:', err?.message || err);
      }
    }

    // 2. Try Master Server ("Máy Chủ Mẹ") API
    if (this.masterServerUrl) {
      try {
        const res = await fetch(`${this.masterServerUrl}/api/matchmaking/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profile)
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.room) {
            this.localRooms[data.room.roomId] = data.room;
            return { mode: 'master', room: data.room };
          }
        }
      } catch (_) {}
    }

    // 3. Fallback local / multi-tab room
    const now = Date.now();
    const roomId = 'local_room_' + now.toString(36);
    const room = {
      roomId,
      status: 'matching',
      hostId: profile.playerId,
      masterServerKey: this.serverInfo.serverKey,
      masterReady: false,
      createdAt: now,
      updatedAt: now,
      tenguHp: 100,
      currentQIdx: 0,
      questionStartedAt: now,
      slots: { [profile.dept]: { ...profile, ready: false, joinedAt: now } },
      history: []
    };
    this.localRooms[roomId] = room;
    return { mode: 'local', room };
  }

  subscribeBossRoom(roomId, mode, onUpdate) {
    this.activeRoomCallbacks.set(roomId, onUpdate);
    let fbUnsub = null;
    let pollTimer = null;

    if (mode === 'firebase' && window.JPCFirebase?.rtdbReady && window.JPCFirebase?.sdk) {
      const { ref, onValue } = window.JPCFirebase.sdk;
      const roomRef = ref(window.JPCFirebase.db, `jpc_gen22/bossRooms/${roomId}`);
      fbUnsub = onValue(roomRef, (snap) => {
        if (snap.exists()) {
          const room = snap.val();
          this.localRooms[roomId] = room;
          onUpdate(room);
        }
      });
    } else if (mode === 'master' && this.masterServerUrl) {
      pollTimer = setInterval(async () => {
        try {
          const res = await fetch(`${this.masterServerUrl}/api/matchmaking/room?roomId=${encodeURIComponent(roomId)}`, {
            cache: 'no-store'
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.room) {
              this.localRooms[roomId] = data.room;
              onUpdate(data.room);
            }
          }
        } catch (_) {}
      }, 650);
    }

    return () => {
      this.activeRoomCallbacks.delete(roomId);
      if (fbUnsub) fbUnsub();
      if (pollTimer) clearInterval(pollTimer);
    };
  }

  async pushRoomUpdate(room, mode, actionType = '', payload = null) {
    if (!room) return room;
    const now = Date.now();

    if (actionType === 'toggle_ready' && payload && room.slots && room.slots[payload.dept]) {
      room.slots[payload.dept].ready = !!payload.ready;
    } else if (actionType === 'start_battle' && payload) {
      room.status = 'fighting';
      room.masterReady = true;
      room.slots = payload.slots || room.slots;
      room.questions = payload.questions || room.questions;
      room.tenguHp = 100;
      room.currentQIdx = 0;
      room.questionStartedAt = now;
      room.history = [];
    } else if (actionType === 'solve_question' && payload && room.status === 'fighting' && room.currentQIdx === payload.qIdx) {
      room.tenguHp = Math.max(0, (room.tenguHp ?? 100) - 20);
      room.history = Array.isArray(room.history) ? room.history : [];
      room.history.push({ ...payload, isFinalBlow: payload.qIdx === 4, ok: true });
      if (payload.qIdx >= 4) {
        room.status = room.tenguHp <= 0 ? 'victory' : 'failed';
      } else {
        room.currentQIdx += 1;
        room.questionStartedAt = now;
      }
    } else if (actionType === 'timeout_question' && payload && room.status === 'fighting' && room.currentQIdx === payload.qIdx) {
      room.history = Array.isArray(room.history) ? room.history : [];
      room.history.push({ ...payload, isFinalBlow: payload.qIdx === 4, ok: false });
      if (payload.qIdx >= 4) {
        room.status = 'failed';
      } else {
        room.currentQIdx += 1;
        room.questionStartedAt = now;
      }
    }

    room.updatedAt = now;
    this.localRooms[room.roomId] = room;

    if (this.channel) {
      try {
        this.channel.postMessage({ type: 'room_update', room });
      } catch (_) {}
    }

    if ((mode === 'firebase' || window.JPCFirebase?.rtdbReady) && window.JPCFirebase?.rtdbReady && window.JPCFirebase?.sdk) {
      try {
        const { ref, set } = window.JPCFirebase.sdk;
        await set(ref(window.JPCFirebase.db, `jpc_gen22/bossRooms/${room.roomId}`), room);
      } catch (_) {}
    }

    if (this.masterServerUrl && actionType && mode !== 'local') {
      try {
        const res = await fetch(`${this.masterServerUrl}/api/matchmaking/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId: room.roomId, type: actionType, payload })
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.room) {
            this.localRooms[room.roomId] = data.room;
            return data.room;
          }
        }
      } catch (_) {}
    }

    return room;
  }
}

window.firebaseSync = new FirebaseSyncManager();
