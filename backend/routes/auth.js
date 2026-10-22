import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';

function hashPassword(password, salt) {
  return scryptSync(password, salt, 64).toString('hex');
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

export function handleAuthRoute(req, pathname, ctx) {
  if (req.method !== 'POST' || !['/api/auth/signup', '/api/auth/signin'].includes(pathname)) return false;
  const { body, store, saveStore, sessions, sendJson } = ctx;

  if (pathname === '/api/auth/signup') {
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    if (!name || !email || !email.includes('@') || password.length < 8) {
      sendJson(400, { error: 'Enter a name, a valid email, and a password with at least 8 characters.' });
      return true;
    }
    if (store.users.some((user) => user.email === email)) {
      sendJson(409, { error: 'An account with this email already exists. Please sign in instead.' });
      return true;
    }
    const salt = randomBytes(16).toString('hex');
    const user = { id: randomUUID(), name, email, salt, passwordHash: hashPassword(password, salt), createdAt: new Date().toISOString() };
    store.users.push(user);
    saveStore();
    const token = randomBytes(32).toString('hex');
    sessions.set(token, user.id);
    sendJson(201, { token, user: publicUser(user) });
    return true;
  }

  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const user = store.users.find((item) => item.email === email);
  if (!user || !password) {
    sendJson(401, { error: 'Email or password is incorrect.' });
    return true;
  }
  const submittedHash = Buffer.from(hashPassword(password, user.salt), 'hex');
  const storedHash = Buffer.from(user.passwordHash, 'hex');
  if (submittedHash.length !== storedHash.length || !timingSafeEqual(submittedHash, storedHash)) {
    sendJson(401, { error: 'Email or password is incorrect.' });
    return true;
  }
  const token = randomBytes(32).toString('hex');
  sessions.set(token, user.id);
  sendJson(200, { token, user: publicUser(user) });
  return true;
}
