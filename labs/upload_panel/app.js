// Secure upload panel using only express + multer (no extra npm packages)
// - randomized filenames (crypto)
// - whitelist MIME/extension checks + size limit (multer)
// - manual security headers (basic Helmet-like headers implemented inline)
// - safe file listing and controlled download/streaming
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = 3000;
const UPLOAD_DIR = path.join(__dirname, 'uploads');

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Basic security headers (small subset of Helmet)
app.use((req, res, next) => {
  // Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Clickjacking protection
  res.setHeader('X-Frame-Options', 'DENY');
  // Basic XSS protection (legacy but harmless)
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Restrict referrer information
  res.setHeader('Referrer-Policy', 'no-referrer');
  // Minimal CSP to limit inline scripts/styles (adjust for your index.html if needed)
  res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data:; object-src 'none'");
  next();
});

// Simple in-memory rate limiter for upload POSTs (per-IP)
const rateWindowMs = 60 * 1000; // 1 minute
const maxRequestsPerWindow = 10;
const ipTimestamps = new Map();

function rateLimiter(req, res, next) {
  if (req.method !== 'POST' || req.path !== '/upload') return next();
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const timestamps = ipTimestamps.get(ip) || [];
  // keep only timestamps within window
  const recent = timestamps.filter(ts => now - ts < rateWindowMs);
  recent.push(now);
  ipTimestamps.set(ip, recent);
  if (recent.length > maxRequestsPerWindow) {
    return res.status(429).send('Too many uploads from this IP, please try again later.');
  }
  next();
}
app.use(rateLimiter);

// Multer storage: randomized filename, preserve extension
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = crypto.randomBytes(12).toString('hex') + ext;
    cb(null, name);
  }
});

// Allowed MIME types and extensions
const ALLOWED_MIMES = new Set([
  'image/gif',
  'image/png',
  'image/jpeg',
  'image/webp',
  'text/plain',
  'application/pdf'
]);
const ALLOWED_EXTS = new Set(['.gif', '.png', '.jpg', '.jpeg', '.webp', '.txt', '.pdf']);

// fileFilter checks both reported mimetype and extension
function fileFilter(req, file, cb) {
  const mimetype = (file.mimetype || '').toLowerCase();
  const ext = path.extname(file.originalname || '').toLowerCase();
  if (ALLOWED_MIMES.has(mimetype) && ALLOWED_EXTS.has(ext)) {
    return cb(null, true);
  }
  // reject the file
  const err = new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'file');
  return cb(err, false);
}

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter
});

// Serve UI
app.get('/', (req, res) => {
  const idx = path.join(__dirname, 'index.html');
  if (fs.existsSync(idx)) return res.sendFile(idx);
  // fallback simple form
  res.send(`<!doctype html>
<html>
  <head><meta charset="utf-8"><title>Upload</title></head>
  <body>
    <h1>Upload</h1>
    <form method="POST" action="/upload" enctype="multipart/form-data">
      <input type="file" name="file" accept=".gif,.png,.jpg,.jpeg,.webp,.txt,.pdf"><br><br>
      <button type="submit">Upload</button>
    </form>
    <hr>
    <a href="/files">View uploaded files</a>
  </body>
</html>`);
});

// Upload handler (with rate limiter middleware applied globally above)
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded or invalid file type.' });
  }

  // Extra check: ensure extension of original file is allowed (enforce .gif if you want originally)
  // Example: if you want .gif-only, uncomment below:
  // if (path.extname(req.file.originalname).toLowerCase() !== '.gif') {
  //   fs.unlink(req.file.path, () => {});
  //   return res.status(400).json({ success: false, message: 'Invalid file type. GIF only allowed.' });
  // }

  return res.json({
    success: true,
    message: 'File uploaded successfully',
    file: req.file.filename
  });
});

// List uploaded files (links point to controlled download route)
app.get('/files', (req, res) => {
  fs.readdir(UPLOAD_DIR, (err, files) => {
    if (err) return res.status(500).send('Unable to read uploads.');
    const listHtml = files.map(f => {
      const ext = path.extname(f).slice(1);
      // link to safe route
      return `<div><a href="/files/${encodeURIComponent(f)}" target="_blank">${f}</a> (${ext})</div>`;
    }).join('\n') || '<div>No files</div>';
    res.send(`<h1>Uploaded Files</h1>${listHtml}<hr><a href="/">Upload again</a>`);
  });
});

// Simple content-type mapping (no mime-types package)
const SIMPLE_MIME = {
  '.html': 'text/html',
  '.htm': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain'
};

// Controlled download/streaming route (prevents path traversal)
app.get('/files/:fn', (req, res) => {
  const filename = path.basename(req.params.fn); // removes any path components
  const filePath = path.join(UPLOAD_DIR, filename);
  // Ensure resolved path starts with UPLOAD_DIR
  if (!filePath.startsWith(UPLOAD_DIR)) return res.status(400).send('Invalid filename.');
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) return res.status(404).send('Not found');
    const ext = path.extname(filePath).toLowerCase();
    const contentType = SIMPLE_MIME[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    // stream file
    const stream = fs.createReadStream(filePath);
    stream.on('error', () => res.status(500).end());
    stream.pipe(res);
  });
});

// Multer error handling + generic error handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).send('File too large.');
    if (err.code === 'LIMIT_UNEXPECTED_FILE') return res.status(400).send('Invalid file type.');
    return res.status(400).send(err.message);
  }
  console.error(err && err.stack ? err.stack : err);
  res.status(500).send('Server error.');
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));