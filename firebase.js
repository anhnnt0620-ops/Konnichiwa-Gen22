// Browser-compatible Firebase Module (works directly in node server.js, Firebase Hosting, & static hosts)
// Reads credentials from /env-config.js (generated from .env on Master Server) or /__/firebase/init.json

const FB_CDN = "https://www.gstatic.com/firebasejs/11.0.2";

async function resolveFirebaseConfig() {
  if (typeof window !== "undefined" && window.__FIREBASE_ENV__ && window.__FIREBASE_ENV__.apiKey) {
    return { ...window.__FIREBASE_ENV__ };
  }

  try {
    const res = await fetch("/__/firebase/init.json", { cache: "no-store" });
    if (res.ok) {
      const hostingCfg = await res.json();
      if (hostingCfg && hostingCfg.apiKey) return hostingCfg;
    }
  } catch (_) {}

  try {
    const savedRaw = localStorage.getItem("jpc_firebase_runtime_cfg");
    if (savedRaw) {
      const parsed = JSON.parse(savedRaw);
      if (parsed && parsed.apiKey) return parsed;
    }
  } catch (_) {}

  return null;
}

async function resolveWorkingDatabaseUrl(cfg) {
  if (!cfg || !cfg.projectId) return "";
  if (cfg.databaseURL) {
    try {
      const probe = await fetch(cfg.databaseURL.replace(/\/$/, "") + "/.json?shallow=true");
      if (probe.status !== 404) return cfg.databaseURL.replace(/\/$/, "");
    } catch (_) {}
  }

  const candidates = [
    `https://${cfg.projectId}-default-rtdb.asia-southeast1.firebasedatabase.app`,
    `https://${cfg.projectId}-default-rtdb.firebaseio.com`,
    `https://${cfg.projectId}-default-rtdb.europe-west1.firebasedatabase.app`
  ];

  for (const url of candidates) {
    try {
      const res = await fetch(`${url}/.json?shallow=true`);
      if (res.status === 200 || res.status === 401 || res.status === 403) {
        return url;
      }
    } catch (_) {}
  }

  return "";
}

async function initFirebaseBridge() {
  const bridge = {
    initialized: false,
    rtdbReady: false,
    rtdbWritable: false,
    projectId: null,
    databaseURL: null,
    statusMessage: "Đang khởi tạo kết nối Firebase...",
    app: null,
    db: null,
    sdk: null
  };

  if (typeof window !== "undefined") {
    window.JPCFirebase = bridge;
  }

  const cfg = await resolveFirebaseConfig();
  if (!cfg || !cfg.apiKey || !cfg.projectId) {
    bridge.statusMessage = "Chưa có cấu hình Firebase client (đồng bộ qua Máy Chủ Mẹ cục bộ).";
    return bridge;
  }

  bridge.projectId = cfg.projectId;

  const rtdbUrl = await resolveWorkingDatabaseUrl(cfg);
  if (!rtdbUrl) {
    bridge.statusMessage = `Firebase Project "${cfg.projectId}" chưa bật Realtime Database — đang chạy qua Máy Chủ Mẹ!`;
    if (window.firebaseSync) window.firebaseSync.onFirebaseStateChanged(bridge);
    return bridge;
  }

  cfg.databaseURL = rtdbUrl;
  bridge.databaseURL = rtdbUrl;

  try {
    const [{ initializeApp }, rtdbMod] = await Promise.all([
      import(`${FB_CDN}/firebase-app.js`),
      import(`${FB_CDN}/firebase-database.js`)
    ]);

    const app = initializeApp(cfg);
    const db = rtdbMod.getDatabase(app);

    bridge.app = app;
    bridge.db = db;
    bridge.sdk = rtdbMod;
    bridge.initialized = true;
    bridge.rtdbReady = true;
    bridge.rtdbWritable = true;
    bridge.statusMessage = `Đã kết nối Firebase RTDB (${cfg.projectId})`;

    try {
      if (cfg.measurementId) {
        const { getAnalytics } = await import(`${FB_CDN}/firebase-analytics.js`);
        getAnalytics(app);
      }
    } catch (_) {}
  } catch (err) {
    bridge.statusMessage = "Firebase SDK không tải được trực tuyến — dùng chế độ Máy Chủ Mẹ dự phòng.";
    console.warn("[Firebase] CDN init fallback:", err?.message || err);
  }

  if (typeof window !== "undefined" && window.firebaseSync) {
    window.firebaseSync.onFirebaseStateChanged(bridge);
  }
  return bridge;
}

export const firebaseReadyPromise = initFirebaseBridge();
