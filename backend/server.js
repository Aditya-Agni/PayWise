import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleAuthRoute } from './routes/auth.js';
import { handleTransactionRoute } from './routes/transactions.js';
import { handleRecurringPaymentRoute } from './routes/recurringPayments.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storePath = path.join(__dirname, 'data', 'store.json');
const PORT = Number(process.env.PORT || 4000);

if (!existsSync(storePath)) writeFileSync(storePath, JSON.stringify({ users: [], transactions: [], recurringPayments: [] }, null, 2));
let store = JSON.parse(readFileSync(storePath, 'utf8'));
store.users ||= [];
store.transactions ||= [];
store.recurringPayments ||= [];
const sessions = new Map();

function saveStore() {
  writeFileSync(storePath, JSON.stringify(store, null, 2));
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error('Request body is too large.'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); }
      catch { reject(new Error('Request body must be valid JSON.')); }
    });
    req.on('error', reject);
  });
}

const server = createServer(async (req, res) => {
  const origin = req.headers.origin || '';
  if (/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  let body;
  try { body = await readBody(req); }
  catch (error) {
    sendJson(res, 400, { error: error.message || 'Invalid request body.' });
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const userId = token ? sessions.get(token) || null : null;
  const context = { body, store, saveStore, sessions, userId, sendJson: (status, payload) => sendJson(res, status, payload) };

  try {
    const handled = handleAuthRoute(req, url.pathname, context)
      || handleTransactionRoute(req, url.pathname, context)
      || handleRecurringPaymentRoute(req, url.pathname, context);
    if (!handled) sendJson(res, 404, { error: 'API route not found.' });
  } catch (error) {
    console.error(error);
    if (!res.headersSent) sendJson(res, 500, { error: 'An unexpected server error occurred.' });
  }
});

server.listen(PORT, () => {
  console.log(`PayWise backend running at http://localhost:${PORT}`);
  console.log('Data is stored in backend/data/store.json');
});
