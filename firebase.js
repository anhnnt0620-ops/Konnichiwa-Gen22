// Browser-compatible Firebase Module (works directly in node server.js, Firebase Hosting, & GitHub Pages)
// Unseals multi-layer asymmetrically encrypted credentials in memory via WebCrypto (zero plaintext secrets stored globally).

const FB_CDN = "https://www.gstatic.com/firebasejs/11.0.2";

function b64ToBytes(b64) {
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function bytesToB64(bytes) {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function utf8Bytes(str) {
  return new TextEncoder().encode(str);
}

function concatBytes(parts) {
  let total = 0;
  for (const p of parts) total += p.length;
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const p of parts) {
    merged.set(p, offset);
    offset += p.length;
  }
  return merged;
}

async function unsealFromMasterServer(sealEndpointUrl) {
  if (typeof window === "undefined" || !window.crypto || !window.crypto.subtle) {
    return null;
  }
  const sub = window.crypto.subtle;
  const rsaPair = await sub.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256"
    },
    false,
    ["encrypt", "decrypt"]
  );

  const spkiBuf = await sub.exportKey("spki", rsaPair.publicKey);
  const clientPublicKeySpki = bytesToB64(new Uint8Array(spkiBuf));
  const nonceBytes = new Uint8Array(16);
  window.crypto.getRandomValues(nonceBytes);
  const clientNonce = bytesToB64(nonceBytes);

  const res = await fetch(sealEndpointUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ clientPublicKeySpki, clientNonce })
  });
  if (!res.ok) return null;

  const payload = await res.json();
  const env = payload && payload.envelope;
  if (!env || env.v !== 2 || !env.aad || !env.wrappedKey || !env.ct || !env.serverSignPub || !env.sig) {
    return null;
  }

  const aadParts = String(env.aad).split("|");
  if (aadParts.length !== 4 || aadParts[0] !== "jpc-master-v2" || aadParts[1] !== clientNonce) {
    throw new Error("Master envelope nonce mismatch");
  }
  const expMs = Number(aadParts[3]);
  if (!Number.isFinite(expMs) || Date.now() > expMs + 30000) {
    throw new Error("Master envelope expired");
  }

  const aadBytes = utf8Bytes(env.aad);
  const wrappedKeyBytes = b64ToBytes(env.wrappedKey);
  const ctBytes = b64ToBytes(env.ct);
  const sigPubBytes = b64ToBytes(env.serverSignPub);
  const sigBytes = b64ToBytes(env.sig);

  const verifyKey = await sub.importKey(
    "spki",
    sigPubBytes,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["verify"]
  );
  const sigValid = await sub.verify(
    { name: "ECDSA", hash: "SHA-256" },
    verifyKey,
    sigBytes,
    concatBytes([aadBytes, wrappedKeyBytes, ctBytes])
  );
  if (!sigValid) {
    throw new Error("Master envelope ECDSA signature verification failed");
  }

  const wrappedMat = new Uint8Array(
    await sub.decrypt({ name: "RSA-OAEP" }, rsaPair.privateKey, wrappedKeyBytes)
  );
  const sessionSecret = wrappedMat.slice(0, 32);
  const salt = wrappedMat.slice(32, 64);
  const iv = wrappedMat.slice(64, 76);
  wrappedMat.fill(0);

  const hkdfKey = await sub.importKey("raw", sessionSecret, "HKDF", false, ["deriveKey"]);
  sessionSecret.fill(0);

  const aesKey = await sub.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt,
      info: utf8Bytes("jpc-master-aes-v2")
    },
    hkdfKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  const plainBytes = new Uint8Array(
    await sub.decrypt({ name: "AES-GCM", iv, additionalData: aadBytes }, aesKey, ctBytes)
  );
  const cfg = JSON.parse(new TextDecoder().decode(plainBytes));
  plainBytes.fill(0);
  return cfg;
}

async function resolveFirebaseConfig() {
  // Scrub any legacy plaintext cache in localStorage
  try {
    localStorage.removeItem("jpc_firebase_runtime_cfg");
  } catch (_) {}

  // 1. Live Master Server multi-layer asymmetric RSA-OAEP + ECDSA handshake
  if (typeof window !== "undefined") {
    const masterMeta = window.__MASTER_SERVER_INFO__;
    if (masterMeta && masterMeta.hasSealedVault && masterMeta.sealEndpoint) {
      try {
        const origin = (window.location && window.location.origin) ? window.location.origin : "";
        const sealUrl = masterMeta.sealEndpoint.startsWith("http")
          ? masterMeta.sealEndpoint
          : `${origin}${masterMeta.sealEndpoint}`;
        const cfg = await unsealFromMasterServer(sealUrl);
        if (cfg && cfg.apiKey && cfg.projectId) return cfg;
      } catch (err) {
        console.warn("[Vault] Master asymmetric handshake fallback:", err?.message || err);
      }
    }

    // 2. Remote client linked to an HTTPS / localhost Master Server URL
    try {
      const customMaster = (localStorage.getItem("jpc_gen22_master_url_v1") || "").trim().replace(/\/$/, "");
      if (customMaster) {
        const cfg = await unsealFromMasterServer(`${customMaster}/api/env-seal`);
        if (cfg && cfg.apiKey && cfg.projectId) return cfg;
      }
    } catch (_) {}

    // 3. Static deployment multi-layer ECDH+HKDF+AES256GCM+ECDSA sealed vault (built from GitHub Secrets)
    if (typeof window.__JPC_SEALED_LOADER__ === "function") {
      try {
        const sealedLoader = window.__JPC_SEALED_LOADER__;
        const cfg = await sealedLoader();
        if (cfg && cfg.apiKey && cfg.projectId) return cfg;
      } catch (err) {
        console.warn("[Vault] Static sealed vault failed:", err?.message || err);
      }
    }
  }

  // 4. Firebase Hosting built-in auto config
  try {
    const res = await fetch("/__/firebase/init.json", { cache: "no-store" });
    if (res.ok) {
      const hostingCfg = await res.json();
      if (hostingCfg && hostingCfg.apiKey) return hostingCfg;
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

  const hasMeasurement = Boolean(cfg.measurementId);
  const rtdbUrl = await resolveWorkingDatabaseUrl(cfg);
  if (!rtdbUrl) {
    for (const k of Object.keys(cfg)) cfg[k] = null;
    bridge.statusMessage = "Firebase Project chưa bật Realtime Database — đang chạy qua Máy Chủ Mẹ!";
    if (window.firebaseSync) window.firebaseSync.onFirebaseStateChanged(bridge);
    return bridge;
  }

  cfg.databaseURL = rtdbUrl;

  try {
    const [{ initializeApp }, rtdbMod] = await Promise.all([
      import(`${FB_CDN}/firebase-app.js`),
      import(`${FB_CDN}/firebase-database.js`)
    ]);

    const app = initializeApp(cfg);
    for (const k of Object.keys(cfg)) cfg[k] = null;
    const db = rtdbMod.getDatabase(app);

    bridge.app = app;
    bridge.db = db;
    bridge.sdk = rtdbMod;
    bridge.initialized = true;
    bridge.rtdbReady = true;
    bridge.rtdbWritable = true;
    bridge.statusMessage = "Đã kết nối Firebase RTDB";

    try {
      if (hasMeasurement) {
        const { getAnalytics } = await import(`${FB_CDN}/firebase-analytics.js`);
        getAnalytics(app);
      }
    } catch (_) {}
  } catch (err) {
    for (const k of Object.keys(cfg)) cfg[k] = null;
    bridge.statusMessage = "Firebase SDK không tải được trực tuyến — dùng chế độ Máy Chủ Mẹ dự phòng.";
    console.warn("[Firebase] CDN init fallback:", err?.message || err);
  }

  if (typeof window !== "undefined" && window.firebaseSync) {
    window.firebaseSync.onFirebaseStateChanged(bridge);
  }
  return bridge;
}

export const firebaseReadyPromise = initFirebaseBridge();
