const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'drc2024';

app.use(express.json());

// Serve static files except admin.html
app.use(express.static('.', {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('admin.html')) {
      res.statusCode = 403;
      res.end('Forbidden');
    }
  }
}));

function basicAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).set('WWW-Authenticate', 'Basic').send('Authentication required');
  const [scheme, encoded] = auth.split(' ');
  if (scheme !== 'Basic') return res.status(400).send('Invalid authentication scheme');
  const [user, pass] = Buffer.from(encoded, 'base64').toString().split(':');
  if (user === ADMIN_USER && pass === ADMIN_PASS) return next();
  return res.status(403).send('Forbidden');
}

// Serve admin.html only with Basic Auth
app.get('/admin.html', basicAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Get produk list
app.get('/data/barang.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'data/barang.json'));
});

// Update produk list (admin only)
app.post('/data/barang.json', basicAuth, (req, res) => {
  fs.writeFileSync(path.join(__dirname, 'data/barang.json'), JSON.stringify(req.body, null, 2));
  res.json({ ok: true });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
