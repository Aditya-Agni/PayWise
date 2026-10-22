import { randomUUID } from 'node:crypto';

const frequencies = ['Weekly', 'Monthly', 'Yearly'];
const types = ['Subscription', 'EMI', 'Bill'];

function publicPayment(payment) {
  const { userId, ...visible } = payment;
  return visible;
}

function addFrequency(dateString, frequency) {
  const [year, month, day] = dateString.split('-').map(Number);
  if (frequency === 'Weekly') {
    const date = new Date(Date.UTC(year, month - 1, day + 7));
    return date.toISOString().slice(0, 10);
  }
  let targetMonth = frequency === 'Yearly' ? month - 1 : month;
  let targetYear = frequency === 'Yearly' ? year + 1 : year;
  if (frequency === 'Monthly' && month === 12) {
    targetMonth = 0;
    targetYear += 1;
  }
  const lastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  const nextDate = new Date(Date.UTC(targetYear, targetMonth, Math.min(day, lastDay)));
  return nextDate.toISOString().slice(0, 10);
}

export function handleRecurringPaymentRoute(req, pathname, ctx) {
  if (!pathname.startsWith('/api/recurring-payments')) return false;
  const { body, store, saveStore, userId, sendJson } = ctx;
  if (!userId) {
    sendJson(401, { error: 'Please sign in to manage recurring payments.' });
    return true;
  }

  if (pathname === '/api/recurring-payments' && req.method === 'GET') {
    sendJson(200, store.recurringPayments.filter((item) => item.userId === userId).map(publicPayment));
    return true;
  }

  if (pathname === '/api/recurring-payments' && req.method === 'POST') {
    const title = String(body.title || '').trim();
    const amount = Number(body.amount);
    const type = String(body.type || 'Bill');
    const frequency = String(body.frequency || 'Monthly');
    const nextDueDate = String(body.nextDueDate || '');
    if (!title || !Number.isFinite(amount) || amount <= 0 || !types.includes(type) || !frequencies.includes(frequency) || !/^\d{4}-\d{2}-\d{2}$/.test(nextDueDate)) {
      sendJson(400, { error: 'Enter a title, positive amount, valid type, frequency, and due date.' });
      return true;
    }
    const item = { id: randomUUID(), userId, title, amount, type, frequency, nextDueDate, active: body.active !== false, createdAt: new Date().toISOString() };
    store.recurringPayments.push(item);
    saveStore();
    sendJson(201, publicPayment(item));
    return true;
  }

  const payMatch = pathname.match(/^\/api\/recurring-payments\/([^/]+)\/pay$/);
  if (payMatch && req.method === 'POST') {
    const item = store.recurringPayments.find((payment) => payment.id === payMatch[1] && payment.userId === userId);
    if (!item) {
      sendJson(404, { error: 'Recurring payment not found.' });
      return true;
    }
    if (!item.active) {
      sendJson(400, { error: 'This recurring payment is inactive.' });
      return true;
    }
    if (body.expectedDueDate && body.expectedDueDate !== item.nextDueDate) {
      sendJson(409, { error: 'The next due date has changed. Refresh the list and try again.' });
      return true;
    }
    const dueDate = item.nextDueDate;
    const today = new Date().toISOString().slice(0, 10);
    const transaction = {
      id: randomUUID(), userId, title: item.title, amount: item.amount,
      category: item.type, paymentMethod: 'Other', date: today,
      recurringPaymentId: item.id, createdAt: new Date().toISOString(),
    };
    item.nextDueDate = addFrequency(item.nextDueDate, item.frequency);
    item.lastPaidDueDate = dueDate;
    store.transactions.unshift(transaction);
    saveStore();
    sendJson(200, { recurringPayment: publicPayment(item), transaction: (({ userId: ignored, ...visible }) => visible)(transaction) });
    return true;
  }

  const match = pathname.match(/^\/api\/recurring-payments\/([^/]+)$/);
  if (!match) return false;
  const item = store.recurringPayments.find((payment) => payment.id === match[1] && payment.userId === userId);
  if (!item) {
    sendJson(404, { error: 'Recurring payment not found.' });
    return true;
  }

  if (req.method === 'PUT') {
    const title = body.title === undefined ? item.title : String(body.title).trim();
    const amount = body.amount === undefined ? item.amount : Number(body.amount);
    const type = body.type === undefined ? item.type : String(body.type);
    const frequency = body.frequency === undefined ? item.frequency : String(body.frequency);
    const nextDueDate = body.nextDueDate === undefined ? item.nextDueDate : String(body.nextDueDate);
    const active = body.active === undefined ? item.active : Boolean(body.active);
    if (!title || !Number.isFinite(amount) || amount <= 0 || !types.includes(type) || !frequencies.includes(frequency) || !/^\d{4}-\d{2}-\d{2}$/.test(nextDueDate)) {
      sendJson(400, { error: 'Recurring payment details are invalid.' });
      return true;
    }
    Object.assign(item, { title, amount, type, frequency, nextDueDate, active });
    saveStore();
    sendJson(200, publicPayment(item));
    return true;
  }

  if (req.method === 'DELETE') {
    store.recurringPayments = store.recurringPayments.filter((payment) => payment.id !== item.id);
    saveStore();
    sendJson(200, { message: 'Recurring payment deleted.' });
    return true;
  }
  return false;
}
