import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Handle API errors consistently
async function request(config) {
  try {
    const response = await api.request(config);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
        error.response.data?.error ||
        `Request failed (${error.response.status}).`
      );
    }

    if (error.request) {
      throw new Error(
        `Cannot connect to the PayWise backend at ${API_BASE_URL}. Make sure the backend is running.`
      );
    }

    throw new Error(error.message || "Something went wrong.");
  }
}

// Authentication

export const signUp = async (details) => {
  const result = await request({
    url: "/user/register",
    method: "POST",
    data: {
      username: details.username,
      email: details.email,
      password: details.password,
    },
  });
  return { user: result.data };
};

export const signIn = async (details) => {
  const identifier = (
    details.identifier ??
    details.login ??
    details.username ??
    details.email ??
    ""
  ).trim();

  const result = await request({
    url: "/user/login",
    method: "POST",
    data: { login: identifier, password: details.password },
  });
  return { user: result.data };
};

export const clearSession = () => request({ url: "/user/logout", method: "POST" });

export const getCurrentUser = async () => {
  const result = await request({ url: "/user/current-user", method: "GET" });
  return result.data;
};

// Transactions

export const getTransactions = async () => {
  const result = await request({
    url: "/transactions/get-all-transactions",
    method: "GET",
  });
  return result.data;
};

export const createTransaction = async (details) => {
  const result = await request({
    url: "/transactions/transaction-add",
    method: "POST",
    data: details,
  });
  return result.data;
};

export const updateTransaction = async (id, details) => {
  const result = await request({
    url: `/transactions/transaction-edit/${id}`,
    method: "PUT",
    data: details,
  });
  return result.data;
};

export const deleteTransaction = async (id) => {
  const result = await request({
    url: `/transactions/transaction-delete/${id}`,
    method: "DELETE",
  });
  return result.data;
};

// Recurring payments

export const getRecurringPayments = async () => {
  const result = await request({
    url: "/recurring-payments",
    method: "GET",
  });
  return result?.data ?? result;
};

export const createRecurringPayment = async (details) => {
  const result = await request({
    url: "/recurring-payments",
    method: "POST",
    data: details,
  });
  return result?.data ?? result;
};

export const updateRecurringPayment = async (id, details) => {
  const result = await request({
    url: `/recurring-payments/${id}`,
    method: "PUT",
    data: details,
  });
  return result?.data ?? result;
};

export const deleteRecurringPayment = async (id) => {
  const result = await request({
    url: `/recurring-payments/${id}`,
    method: "DELETE",
  });
  return result?.data ?? result;
};

export const markRecurringPaymentPaid = async (id, expectedDueDate) => {
  const result = await request({
    url: `/recurring-payments/${id}/pay`,
    method: "POST",
    data: { expectedDueDate },
  });
  return result?.data ?? result;
};

export const triggerDueAlerts = async (daysAhead = 3) => {
  const result = await request({
    url: `/recurring-payments/trigger-alerts?daysAhead=${encodeURIComponent(daysAhead)}`,
    method: "POST",
  });
  return result?.data ?? result;
};

// AI / PayWise Intelligence

export const getSpendingAnalysis = async () => {
  const result = await request({ url: "/ai/spending-analysis", method: "POST" });
  return result?.data ?? result;
};

export const getUnusualSpending = async () => {
  const result = await request({ url: "/ai/unusual-spending", method: "POST" });
  return result?.data ?? result;
};

export const getRecurringForecast = async () => {
  const result = await request({ url: "/ai/recurring-forecast", method: "POST" });
  return result?.data ?? result;
};

export const getFinancialHealth = async () => {
  const result = await request({ url: "/ai/financial-health", method: "POST" });
  return result?.data ?? result;
};
