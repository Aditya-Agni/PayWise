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

export const getTransactions = () =>
  request({
    url: "/transactions",
    method: "GET",
  });

export const createTransaction = (details) =>
  request({
    url: "/transactions",
    method: "POST",
    data: details,
  });

export const updateTransaction = (id, details) =>
  request({
    url: `/transactions/${id}`,
    method: "PUT",
    data: details,
  });

export const deleteTransaction = (id) =>
  request({
    url: `/transactions/${id}`,
    method: "DELETE",
  });

// Recurring payments

export const getRecurringPayments = () =>
  request({
    url: "/recurring-payments",
    method: "GET",
  });

export const createRecurringPayment = (details) =>
  request({
    url: "/recurring-payments",
    method: "POST",
    data: details,
  });

export const updateRecurringPayment = (id, details) =>
  request({
    url: `/recurring-payments/${id}`,
    method: "PUT",
    data: details,
  });

export const deleteRecurringPayment = (id) =>
  request({
    url: `/recurring-payments/${id}`,
    method: "DELETE",
  });

export const markRecurringPaymentPaid = (id, expectedDueDate) =>
  request({
    url: `/recurring-payments/${id}/pay`,
    method: "POST",
    data: { expectedDueDate },
  });
