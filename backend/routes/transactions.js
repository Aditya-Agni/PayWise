import { randomUUID } from 'node:crypto';

function publicTransaction(transaction) {
  const { userId, ...visible } = transaction;
  return visible;
}

export function handleTransactionRoute(req, pathname, ctx) {
  if (!pathname.startsWith('/api/transactions')) return false;
  const { body, store, saveStore, userId, sendJson } = ctx;
  if (!userId) {
    sendJson(401, { error: 'Please sign in to manage transactions.' });
    return true;
  }

  if (pathname === '/api/transactions' && req.method === 'GET') {
    sendJson(200, store.transactions.filter((item) => item.userId === userId).map(publicTransaction));
    return true;
  }

  if (pathname === '/api/transactions' && req.method === 'POST') {
    const title = String(body.title || '').trim();
    const amount = Number(body.amount);
    const category = String(body.category || '').trim();
    const paymentMethod = String(body.paymentMethod || '').trim();
    const date = String(body.date || '');
    if (!title || !Number.isFinite(amount) || amount <= 0 || !category || !paymentMethod || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      sendJson(400, { error: 'Enter a title, positive amount, category, payment method, and valid date.' });
      return true;
    }
    const item = { id: randomUUID(), userId, title, amount, category, paymentMethod, date, recurringPaymentId: body.recurringPaymentId || null, createdAt: new Date().toISOString() };
    store.transactions.unshift(item);
    saveStore();
    sendJson(201, publicTransaction(item));
    return true;
  }

  const match = pathname.match(/^\/api\/transactions\/([^/]+)$/);
  if (!match) return false;
  const item = store.transactions.find((transaction) => transaction.id === match[1] && transaction.userId === userId);
  if (!item) {
    sendJson(404, { error: 'Transaction not found.' });
    return true;
  }

  if (req.method === 'PUT') {
    const title = body.title === undefined ? item.title : String(body.title).trim();
    const amount = body.amount === undefined ? item.amount : Number(body.amount);
    const category = body.category === undefined ? item.category : String(body.category).trim();
    const paymentMethod = body.paymentMethod === undefined ? item.paymentMethod : String(body.paymentMethod).trim();
    const date = body.date === undefined ? item.date : String(body.date);
    if (!title || !Number.isFinite(amount) || amount <= 0 || !category || !paymentMethod || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      sendJson(400, { error: 'Transaction details are invalid.' });
      return true;
    }
    Object.assign(item, { title, amount, category, paymentMethod, date });
    saveStore();
    sendJson(200, publicTransaction(item));
    return true;
  }

  if (req.method === 'DELETE') {
    store.transactions = store.transactions.filter((transaction) => transaction.id !== item.id);
    saveStore();
    sendJson(200, { message: 'Transaction deleted.' });
    return true;
  }
  return false;
}
