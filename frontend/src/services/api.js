const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const TOKEN_KEY = 'paywise_token';
const USER_KEY = 'paywise_user';

export function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
}

async function request(path, options = {}) {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error(`Cannot connect to the PayWise backend at ${API_BASE_URL}. Make sure the backend server is running.`);
  }

  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || `Request failed (${response.status}).`);
  return result;
}

export const signUp = (details) => request('/api/auth/signup', { method: 'POST', body: JSON.stringify(details) });
export const signIn = (details) => request('/api/auth/signin', { method: 'POST', body: JSON.stringify(details) });

export const getTransactions = () => request('/api/transactions');
export const createTransaction = (details) => request('/api/transactions', { method: 'POST', body: JSON.stringify(details) });
export const updateTransaction = (id, details) => request(`/api/transactions/${id}`, { method: 'PUT', body: JSON.stringify(details) });
export const deleteTransaction = (id) => request(`/api/transactions/${id}`, { method: 'DELETE' });

export const getRecurringPayments = () => request('/api/recurring-payments');
export const createRecurringPayment = (details) => request('/api/recurring-payments', { method: 'POST', body: JSON.stringify(details) });
export const updateRecurringPayment = (id, details) => request(`/api/recurring-payments/${id}`, { method: 'PUT', body: JSON.stringify(details) });
export const deleteRecurringPayment = (id) => request(`/api/recurring-payments/${id}`, { method: 'DELETE' });
export const markRecurringPaymentPaid = (id, expectedDueDate) => request(`/api/recurring-payments/${id}/pay`, { method: 'POST', body: JSON.stringify({ expectedDueDate }) });
