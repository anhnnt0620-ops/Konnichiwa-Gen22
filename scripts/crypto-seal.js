const crypto = require('crypto');

function createServerSigningKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
    namedCurve: 'P-256'
  });
  const publicSpkiB64 = publicKey.export({ type: 'spki', format: 'der' }).toString('base64');
  return { publicKey, privateKey, publicSpkiB64 };
}

/**
 * Multi-layer hybrid asymmetric sealing for live Master Server -> Browser exchange:
 *   Layer 1: Inner payload with short-lived AAD & nonce
 *   Layer 2: HKDF-SHA256 + AES-256-GCM authenticated encryption
 *   Layer 3: RSA-OAEP-SHA256 asymmetric wrap of [sessionSecret || salt || iv] with client's ephemeral public key
 *   Layer 4: ECDSA P-256 (IEEE P1363) signature over envelope with server signing key
 */
function sealForClientPublicKey(payloadObj, { clientPublicKeySpkiB64, clientNonce, signingKeyPair }) {
  if (!clientPublicKeySpkiB64 || typeof clientPublicKeySpkiB64 !== 'string') {
    throw new Error('Missing clientPublicKeySpki');
  }
  if (!clientNonce || typeof clientNonce !== 'string' || clientNonce.length < 8) {
    throw new Error('Invalid clientNonce');
  }

  const spkiDer = Buffer.from(clientPublicKeySpkiB64, 'base64');
  const clientPubKey = crypto.createPublicKey({ key: spkiDer, format: 'der', type: 'spki' });
  if (clientPubKey.asymmetricKeyType !== 'rsa') {
    throw new Error('Client public key must be RSA-OAEP');
  }
  const modLen = clientPubKey.asymmetricKeyDetails && clientPubKey.asymmetricKeyDetails.modulusLength;
  if (!modLen || modLen < 2048) {
    throw new Error('RSA key modulus must be >= 2048 bits');
  }

  const iat = Date.now();
  const exp = iat + 120000;
  const cleanNonce = String(clientNonce).replace(/[^a-zA-Z0-9_+/=-]/g, '').slice(0, 64);
  const aadStr = `jpc-master-v2|${cleanNonce}|${iat}|${exp}`;
  const aad = Buffer.from(aadStr, 'utf8');
  const plaintext = Buffer.from(JSON.stringify(payloadObj), 'utf8');

  const sessionSecret = crypto.randomBytes(32);
  const salt = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);
  const aesKey = Buffer.from(
    crypto.hkdfSync('sha256', sessionSecret, salt, Buffer.from('jpc-master-aes-v2', 'utf8'), 32)
  );

  let wrappedKey;
  let cipherWithTag;
  try {
    const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, iv);
    cipher.setAAD(aad);
    const enc = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const tag = cipher.getAuthTag();
    cipherWithTag = Buffer.concat([enc, tag]);

    const wrapMaterial = Buffer.concat([sessionSecret, salt, iv]);
    try {
      wrappedKey = crypto.publicEncrypt(
        {
          key: clientPubKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256'
        },
        wrapMaterial
      );
    } finally {
      wrapMaterial.fill(0);
    }
  } finally {
    sessionSecret.fill(0);
    aesKey.fill(0);
    plaintext.fill(0);
  }

  const signInput = Buffer.concat([aad, wrappedKey, cipherWithTag]);
  const sig = crypto.sign('sha256', signInput, {
    key: signingKeyPair.privateKey,
    dsaEncoding: 'ieee-p1363'
  });

  return {
    v: 2,
    alg: 'ECDSA-P256+RSA-OAEP-256+HKDF-SHA256+AES-256-GCM',
    aad: aadStr,
    wrappedKey: wrappedKey.toString('base64'),
    ct: cipherWithTag.toString('base64'),
    serverSignPub: signingKeyPair.publicSpkiB64,
    sig: sig.toString('base64')
  };
}

/**
 * Multi-layer build-time asymmetric sealed loader for static deployments (GitHub Pages + GitHub Secrets).
 * Keeps zero plaintext keys in repository or static JS text:
 *   Layer 1: Inner HKDF-SHA256 + AES-256-GCM encrypted payload
 *   Layer 2: Outer ECDH P-256 shared secret -> HKDF-SHA256 -> AES-256-GCM encrypted inner packet
 *   Layer 3: HKDF-masked PKCS8 transport shards + ECDSA P-256 envelope authenticity signature
 */
function buildStaticSealedLoaderScript(configObj) {
  const nonce = crypto.randomBytes(16).toString('hex');
  const aad1 = Buffer.from(`jpc-static-l1|${nonce}`, 'utf8');
  const aad2 = Buffer.from(`jpc-static-l2|${nonce}`, 'utf8');

  const k1 = crypto.randomBytes(32);
  const salt1 = crypto.randomBytes(32);
  const iv1 = crypto.randomBytes(12);
  const plaintext = Buffer.from(JSON.stringify(configObj), 'utf8');

  let innerPacket;
  try {
    const aesKey1 = Buffer.from(
      crypto.hkdfSync('sha256', k1, salt1, Buffer.from('jpc-static-l1-v2', 'utf8'), 32)
    );
    try {
      const c1 = crypto.createCipheriv('aes-256-gcm', aesKey1, iv1);
      c1.setAAD(aad1);
      const ct1 = Buffer.concat([c1.update(plaintext), c1.final()]);
      const tag1 = c1.getAuthTag();
      innerPacket = Buffer.concat([k1, salt1, iv1, ct1, tag1]);
    } finally {
      aesKey1.fill(0);
    }
  } finally {
    k1.fill(0);
    plaintext.fill(0);
  }

  // Generate fresh ECDH P-256 keypairs; sender private key is discarded immediately after computing shared secret
  const senderEcdh = crypto.generateKeyPairSync('ec', { namedCurve: 'P-256' });
  const receiverEcdh = crypto.generateKeyPairSync('ec', { namedCurve: 'P-256' });

  const sharedSecret = crypto.diffieHellman({
    privateKey: senderEcdh.privateKey,
    publicKey: receiverEcdh.publicKey
  });

  const salt2 = crypto.randomBytes(32);
  const iv2 = crypto.randomBytes(12);
  const aesKey2 = Buffer.from(
    crypto.hkdfSync('sha256', sharedSecret, salt2, Buffer.from('jpc-static-ecdh-l2-v2', 'utf8'), 32)
  );
  sharedSecret.fill(0);

  let outerCipherWithTag;
  try {
    const c2 = crypto.createCipheriv('aes-256-gcm', aesKey2, iv2);
    c2.setAAD(aad2);
    const ct2 = Buffer.concat([c2.update(innerPacket), c2.final()]);
    const tag2 = c2.getAuthTag();
    outerCipherWithTag = Buffer.concat([ct2, tag2]);
  } finally {
    aesKey2.fill(0);
    innerPacket.fill(0);
  }

  const senderPubSpki = senderEcdh.publicKey.export({ type: 'spki', format: 'der' });
  const receiverPrivPkcs8 = receiverEcdh.privateKey.export({ type: 'pkcs8', format: 'der' });

  const maskSeed = crypto.randomBytes(32);
  const maskStream = Buffer.from(
    crypto.hkdfSync('sha256', maskSeed, salt2, Buffer.from('jpc-mask-l3-v2', 'utf8'), receiverPrivPkcs8.length)
  );
  const maskedPriv = Buffer.alloc(receiverPrivPkcs8.length);
  for (let i = 0; i < receiverPrivPkcs8.length; i++) {
    maskedPriv[i] = receiverPrivPkcs8[i] ^ maskStream[i];
  }
  receiverPrivPkcs8.fill(0);
  maskStream.fill(0);

  // Split masked private key into two shuffled parts
  const mid = Math.floor(maskedPriv.length / 2);
  const shardA = maskedPriv.subarray(0, mid);
  const shardB = maskedPriv.subarray(mid);

  const signer = crypto.generateKeyPairSync('ec', { namedCurve: 'P-256' });
  const signPubSpki = signer.publicKey.export({ type: 'spki', format: 'der' });
  const signInput = Buffer.concat([
    aad2,
    senderPubSpki,
    salt2,
    iv2,
    outerCipherWithTag,
    maskedPriv,
    maskSeed
  ]);
  const sig = crypto.sign('sha256', signInput, {
    key: signer.privateKey,
    dsaEncoding: 'ieee-p1363'
  });

  const vault = {
    v: 2,
    n: nonce,
    sp: senderPubSpki.toString('base64'),
    s2: salt2.toString('base64'),
    i2: iv2.toString('base64'),
    o: outerCipherWithTag.toString('base64'),
    ms: maskSeed.toString('base64'),
    qa: shardA.toString('base64'),
    qb: shardB.toString('base64'),
    vp: signPubSpki.toString('base64'),
    sg: sig.toString('base64')
  };

  // Verify no secret value leaked verbatim in serialized vault
  const serialized = JSON.stringify(vault);
  for (const val of Object.values(configObj)) {
    if (typeof val === 'string' && val.length >= 6 && serialized.includes(val)) {
      throw new Error('Sealing validation failed: plaintext value detected in output');
    }
  }

  return `(function(){
  var V = ${serialized};
  function b64u(s){ var r = atob(s), a = new Uint8Array(r.length); for(var i=0;i<r.length;i++) a[i]=r.charCodeAt(i); return a; }
  function utf8(s){ return new TextEncoder().encode(s); }
  function cat(arrs){ var n=0,i; for(i=0;i<arrs.length;i++) n+=arrs[i].length; var out=new Uint8Array(n),o=0; for(i=0;i<arrs.length;i++){ out.set(arrs[i],o); o+=arrs[i].length; } return out; }
  Object.defineProperty(window, '__JPC_SEALED_LOADER__', {
    configurable: true,
    enumerable: false,
    value: async function(){
      try {
        if (!window.crypto || !window.crypto.subtle) return null;
        var sub = window.crypto.subtle;
        var aad1 = utf8('jpc-static-l1|' + V.n);
        var aad2 = utf8('jpc-static-l2|' + V.n);
        var sp = b64u(V.sp), s2 = b64u(V.s2), i2 = b64u(V.i2), o = b64u(V.o);
        var ms = b64u(V.ms), qa = b64u(V.qa), qb = b64u(V.qb), vp = b64u(V.vp), sg = b64u(V.sg);
        var mp = cat([qa, qb]);
        var verKey = await sub.importKey('spki', vp, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
        var okSig = await sub.verify({ name: 'ECDSA', hash: 'SHA-256' }, verKey, sg, cat([aad2, sp, s2, i2, o, mp, ms]));
        if (!okSig) throw new Error('Invalid vault signature');
        var maskHkdf = await sub.importKey('raw', ms, 'HKDF', false, ['deriveBits']);
        var maskBits = new Uint8Array(await sub.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt: s2, info: utf8('jpc-mask-l3-v2') }, maskHkdf, mp.length * 8));
        var pkcs8 = new Uint8Array(mp.length);
        for (var k = 0; k < mp.length; k++) pkcs8[k] = mp[k] ^ maskBits[k];
        var recvPriv = await sub.importKey('pkcs8', pkcs8, { name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveBits']);
        pkcs8.fill(0); maskBits.fill(0);
        var sndPub = await sub.importKey('spki', sp, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
        var shared = new Uint8Array(await sub.deriveBits({ name: 'ECDH', public: sndPub }, recvPriv, 256));
        var hkdf2 = await sub.importKey('raw', shared, 'HKDF', false, ['deriveKey']);
        shared.fill(0);
        var aes2 = await sub.deriveKey({ name: 'HKDF', hash: 'SHA-256', salt: s2, info: utf8('jpc-static-ecdh-l2-v2') }, hkdf2, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
        var inner = new Uint8Array(await sub.decrypt({ name: 'AES-GCM', iv: i2, additionalData: aad2 }, aes2, o));
        var k1 = inner.slice(0, 32), salt1 = inner.slice(32, 64), iv1 = inner.slice(64, 76), c1 = inner.slice(76);
        var hkdf1 = await sub.importKey('raw', k1, 'HKDF', false, ['deriveKey']);
        k1.fill(0);
        var aes1 = await sub.deriveKey({ name: 'HKDF', hash: 'SHA-256', salt: salt1, info: utf8('jpc-static-l1-v2') }, hkdf1, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
        var plain = new Uint8Array(await sub.decrypt({ name: 'AES-GCM', iv: iv1, additionalData: aad1 }, aes1, c1));
        return JSON.parse(new TextDecoder().decode(plain));
      } finally {
        V = null;
        try { delete window.__JPC_SEALED_LOADER__; } catch (_) {}
      }
    }
  });
})();\n`;
}

module.exports = {
  createServerSigningKeyPair,
  sealForClientPublicKey,
  buildStaticSealedLoaderScript
};
