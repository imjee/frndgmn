import fs from 'fs';
import path from 'path';

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'drc2024';

function checkBasicAuth(req) {
  const auth = req.headers.authorization || req.headers.Authorization;
  if (!auth) return false;
  const [scheme, encoded] = auth.split(' ');
  if (scheme !== 'Basic') return false;
  const [user, pass] = Buffer.from(encoded, 'base64').toString().split(':');
  return user === ADMIN_USER && pass === ADMIN_PASS;
}

export default async function handler(req, res) {
  const filePath = path.join(process.cwd(), 'data/barang.json');

  if (req.method === 'GET') {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      res.status(200).setHeader('Content-Type', 'application/json').send(data);
    } catch (e) {
      res.status(500).send({ error: 'Gagal membaca data' });
    }
    return;
  }

  if (req.method === 'POST') {
    if (!checkBasicAuth(req)) {
      res.setHeader('WWW-Authenticate', 'Basic');
      res.status(401).send('Authentication required');
      return;
    }
    try {
      fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));
      res.status(200).json({ ok: true });
    } catch (e) {
      res.status(500).send({ error: 'Gagal menyimpan data' });
    }
    return;
  }

  res.status(405).send('Method Not Allowed');
}
