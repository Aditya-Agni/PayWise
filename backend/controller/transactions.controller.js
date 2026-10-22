import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrorHandler.js";
import { ApiResponse } from "../utils/ApiResponseHandler.js";
import { Transaction } from "../models/transactions.model.js";

/**
 * @desc    Create a new transaction from form data
 * @route   POST /api/v1/transactions
 * @access  Private (or accepts userId in body for testing)
 */
export const createTransaction = asyncHandler(async (req, res) => {
  const {
    title,
    amount,
    type = "expense",
    category,
    paymentMethod = "UPI",
    date,
    notes = "",
  } = req.body || {};

  // 1. Identify User (from auth middleware or body fallback)
  const userId = req.user?._id || req.body?.userId || req.body?.user;
  if (!userId) {
    throw new ApiError(401, "User authentication is required to create a transaction");
  }

  // 2. Validate Title
  const cleanTitle = typeof title === "string" ? title.trim() : "";
  if (!cleanTitle) {
    throw new ApiError(400, "Transaction title is required");
  }

  // 3. Validate Amount
  const numericAmount = Number(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    throw new ApiError(400, "A valid amount greater than ₹0 is required");
  }

  // 4. Validate Type (income / expense)
  const cleanType = typeof type === "string" ? type.trim().toLowerCase() : "expense";
  if (!["income", "expense"].includes(cleanType)) {
    throw new ApiError(400, "Transaction type must be either 'income' or 'expense'");
  }

  // 5. Validate Category
  const cleanCategory = typeof category === "string" ? category.trim() : "";
  if (!cleanCategory) {
    throw new ApiError(400, "Transaction category is required");
  }

  // 6. Validate Payment Method
  const validMethods = ["UPI", "Credit Card", "Debit Card", "Net Banking", "Cash", "Other"];
  const cleanPaymentMethod = validMethods.includes(paymentMethod)
    ? paymentMethod
    : "UPI";

  // 7. Validate Date
  let transactionDate = new Date();
  if (date) {
    const parsedDate = new Date(date);
    if (!isNaN(parsedDate.getTime())) {
      transactionDate = parsedDate;
    }
  }

  // 8. Create Transaction in Database
  const transaction = await Transaction.create({
    user: userId,
    title: cleanTitle,
    amount: numericAmount,
    type: cleanType,
    category: cleanCategory,
    paymentMethod: cleanPaymentMethod,
    date: transactionDate,
    notes: typeof notes === "string" ? notes.trim() : "",
  });

  if (!transaction) {
    throw new ApiError(500, "Failed to create transaction");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "Transaction created successfully", transaction));
});

// Alias for convenience with frontend/FinanceContext contract
export const addTransaction = createTransaction;

/**
 * @desc    Edit/Update an existing transaction
 * @route   PUT/PATCH /api/v1/transactions/transaction-edit/:id
 * @access  Private
 */
export const editTransaction = asyncHandler(async (req, res) => {
  const transactionId = req.params.id || req.params.transactionId || req.body._id || req.body.id;

  if (!transactionId) {
    throw new ApiError(400, "Transaction ID is required");
  }

  if (!isValidObjectId(transactionId)) {
    throw new ApiError(400, "Invalid transaction ID format");
  }

  const userId = req.user?._id || req.body?.userId || req.body?.user;
  if (!userId) {
    throw new ApiError(401, "User authentication is required");
  }

  // 1. Find transaction and ensure it belongs to the logged-in user
  const transaction = await Transaction.findOne({
    _id: transactionId,
    user: userId,
  });

  if (!transaction) {
    throw new ApiError(404, "Transaction not found or you don't have permission to edit it");
  }

  const { title, amount, type, category, paymentMethod, date, notes } = req.body || {};

  // 2. Conditionally validate and update fields if provided
  if (title !== undefined) {
    const cleanTitle = typeof title === "string" ? title.trim() : "";
    if (!cleanTitle) {
      throw new ApiError(400, "Title cannot be empty");
    }
    transaction.title = cleanTitle;
  }

  if (amount !== undefined) {
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      throw new ApiError(400, "Amount must be a valid number greater than ₹0");
    }
    transaction.amount = numericAmount;
  }

  if (type !== undefined) {
    const cleanType = typeof type === "string" ? type.trim().toLowerCase() : "";
    if (!["income", "expense"].includes(cleanType)) {
      throw new ApiError(400, "Type must be either 'income' or 'expense'");
    }
    transaction.type = cleanType;
  }

  if (category !== undefined) {
    const cleanCategory = typeof category === "string" ? category.trim() : "";
    if (!cleanCategory) {
      throw new ApiError(400, "Category cannot be empty");
    }
    transaction.category = cleanCategory;
  }

  if (paymentMethod !== undefined) {
    const validMethods = ["UPI", "Credit Card", "Debit Card", "Net Banking", "Cash", "Other"];
    if (!validMethods.includes(paymentMethod)) {
      throw new ApiError(400, `Payment method must be one of: ${validMethods.join(", ")}`);
    }
    transaction.paymentMethod = paymentMethod;
  }

  if (date !== undefined) {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new ApiError(400, "Invalid date format");
    }
    transaction.date = parsedDate;
  }

  if (notes !== undefined) {
    transaction.notes = typeof notes === "string" ? notes.trim() : "";
  }

  // 3. Save the updated transaction
  const updatedTransaction = await transaction.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Transaction updated successfully", updatedTransaction));
});

// Alias for convenience
export const updateTransaction = editTransaction;

/**
 * @desc    Delete a transaction by ID
 * @route   DELETE /api/v1/transactions/transaction-delete/:id
 * @access  Private
 */
export const deleteTransaction = asyncHandler(async (req, res) => {
  const transactionId =
    req.params.id || req.params.transactionId || req.body._id || req.body.id;

  if (!transactionId) {
    throw new ApiError(400, "Transaction ID is required");
  }

  if (!isValidObjectId(transactionId)) {
    throw new ApiError(400, "Invalid transaction ID format");
  }

  const userId = req.user?._id || req.body?.userId || req.body?.user;
  if (!userId) {
    throw new ApiError(401, "User authentication is required");
  }

  // Find and delete the transaction ensuring ownership
  const transaction = await Transaction.findOneAndDelete({
    _id: transactionId,
    user: userId,
  });

  if (!transaction) {
    throw new ApiError(
      404,
      "Transaction not found or you don't have permission to delete it"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Transaction deleted successfully", {
        deletedId: transaction._id,
        title: transaction.title,
      })
    );
});

/**
 * @desc    Get all transactions for a user
 * @route   GET /api/v1/transactions
 * @access  Private
 */
export const getAllTransactions = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.body?.userId || req.query?.userId;

  if (!userId) {
    throw new ApiError(401, "User authentication is required");
  }

  const transactions = await Transaction.find({ user: userId }).sort({ date: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, "All transactions fetched successfully", transactions));
});

export default createTransaction;
