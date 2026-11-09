const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

const PORT = process.env.PORT || 3000;

// MIME types dictionary
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
  '.ico': 'image/x-icon'
};

// Get local network IPv4 address for phone testing
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

const server = http.createServer((req, res) => {
  // Decode URL (handles spaces and Vietnamese diacritics)
  let decodedUrl = decodeURIComponent(req.url.split('?')[0]);
  if (decodedUrl === '/' || decodedUrl === '') {
    decodedUrl = '/index.html';
  }

  const filePath = path.join(__dirname, decodedUrl);

  // Security: prevent path traversal
  if (!filePath.startsWith(__dirname)) {
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
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  const localIP = getLocalIP();
  console.log('\n============================================================');
  console.log('🌸 KONNICHIWA GEN 22 - LOCAL DEV SERVER ĐANG CHẠY');
  console.log('============================================================');
  console.log(`💻 Mở trên máy tính (PC):   http://localhost:${PORT}`);
  if (localIP !== 'localhost') {
    console.log(`📱 Mở trên điện thoại:      http://${localIP}:${PORT}`);
    console.log('   (Lưu ý: Điện thoại và máy tính kết nối chung mạng Wi-Fi)');
  }
  console.log('============================================================');
  console.log('💡 Nhấn Ctrl + C để dừng máy chủ.\n');

  // Auto open browser on Windows
  if (process.platform === 'win32') {
    exec(`start http://localhost:${PORT}`);
  }
});
