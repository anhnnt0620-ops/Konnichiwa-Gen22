const fs = require('fs');
const path = require('path');
const { buildStaticSealedLoaderScript } = require('./crypto-seal');

function resolveConfigFromEnv(env = process.env) {
  if (env.VITE_FIREBASE_CONFIG_JSON) {
    try {
      const parsed = JSON.parse(env.VITE_FIREBASE_CONFIG_JSON);
      if (parsed && parsed.apiKey && parsed.projectId) {
        return {
          apiKey: parsed.apiKey || '',
          authDomain: parsed.authDomain || '',
          projectId: parsed.projectId || '',
          storageBucket: parsed.storageBucket || '',
          messagingSenderId: parsed.messagingSenderId || '',
          appId: parsed.appId || '',
          measurementId: parsed.measurementId || '',
          databaseURL: parsed.databaseURL || (parsed.projectId ? `https://${parsed.projectId}-default-rtdb.asia-southeast1.firebasedatabase.app` : '')
        };
      }
    } catch (err) {
      throw new Error('VITE_FIREBASE_CONFIG_JSON is not valid JSON: ' + err.message);
    }
  }

  const projectId = (env.VITE_FIREBASE_PROJECT_ID || '').trim();
  const apiKey = (env.VITE_FIREBASE_API_KEY || '').trim();
  if (!apiKey || !projectId) {
    return null;
  }

  return {
    apiKey,
    authDomain: (env.VITE_FIREBASE_AUTH_DOMAIN || '').trim(),
    projectId,
    storageBucket: (env.VITE_FIREBASE_STORAGE_BUCKET || '').trim(),
    messagingSenderId: (env.VITE_FIREBASE_MESSAGING_SENDER_ID || '').trim(),
    appId: (env.VITE_FIREBASE_APP_ID || '').trim(),
    measurementId: (env.VITE_FIREBASE_MEASUREMENT_ID || '').trim(),
    databaseURL: (env.VITE_FIREBASE_DATABASE_URL || '').trim() ||
      `https://${projectId}-default-rtdb.asia-southeast1.firebasedatabase.app`
  };
}

if (require.main === module) {
  const outPath = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(process.cwd(), '_site/env-config.js');
  const cfg = resolveConfigFromEnv(process.env);
  if (!cfg) {
    console.log('[seal-env] No Firebase secrets configured in environment; skipped generating sealed env-config.js.');
    process.exit(0);
  }
  const script = buildStaticSealedLoaderScript(cfg);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, script, 'utf8');
  console.log('[seal-env] Sealed Firebase config written cleanly with multi-layer ECDH+ECDSA+AES-256-GCM.');
}

module.exports = { resolveConfigFromEnv };

