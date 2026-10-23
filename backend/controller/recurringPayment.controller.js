import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrorHandler.js";
import { ApiResponse } from "../utils/ApiResponseHandler.js";
import { RecurringPayment } from "../models/recurringPayment.model.js";
import { Transaction } from "../models/transactions.model.js";

/**
 * @desc    Create a new recurring payment / subscription
 * @route   POST /api/v1/recurring-payments
 * @access  Private
 */
export const createRecurringPayment = asyncHandler(async (req, res) => {
  const {
    name,
    title,
    amount,
    category = "Subscription",
    frequency = "monthly",
    nextDueDate,
    startDate,
    paymentMethod = "UPI",
    autoPay = false,
    notes = "",
  } = req.body || {};

  const userId = req.user?._id || req.body?.userId;
  if (!userId) {
    throw new ApiError(401, "User authentication is required");
  }

  const serviceName = (name || title || "").trim();
  if (!serviceName) {
    throw new ApiError(400, "Service or subscription name is required");
  }

  const numericAmount = Number(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    throw new ApiError(400, "A valid amount greater than ₹0 is required");
  }

  const validFrequencies = ["daily", "weekly", "monthly", "yearly"];
  const cleanFrequency = validFrequencies.includes(frequency?.toLowerCase())
    ? frequency.toLowerCase()
    : "monthly";

  // Determine initial nextDueDate
  let dueDate = new Date();
  if (nextDueDate || startDate) {
    const parsedDate = new Date(nextDueDate || startDate);
    if (!isNaN(parsedDate.getTime())) {
      dueDate = parsedDate;
    }
  }

  const recurringPayment = await RecurringPayment.create({
    user: userId,
    name: serviceName,
    amount: numericAmount,
    category: typeof category === "string" ? category.trim() : "Subscription",
    frequency: cleanFrequency,
    nextDueDate: dueDate,
    paymentMethod,
    autoPay: Boolean(autoPay),
    notes: typeof notes === "string" ? notes.trim() : "",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Recurring payment created successfully", recurringPayment));
});

/**
 * @desc    Get all recurring payments for the user
 * @route   GET /api/v1/recurring-payments
 * @access  Private
 */
export const getAllRecurringPayments = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.body?.userId || req.query?.userId;

  if (!userId) {
    throw new ApiError(401, "User authentication is required");
  }

  const recurringPayments = await RecurringPayment.find({ user: userId }).sort({
    nextDueDate: 1,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Recurring payments fetched successfully", recurringPayments));
});

export const getRecurringPayments = getAllRecurringPayments;

/**
 * @desc    Update an existing recurring payment
 * @route   PUT /api/v1/recurring-payments/:id
 * @access  Private
 */
export const updateRecurringPayment = asyncHandler(async (req, res) => {
  const recurringId = req.params.id;

  if (!recurringId || !isValidObjectId(recurringId)) {
    throw new ApiError(400, "Invalid recurring payment ID format");
  }

  const userId = req.user?._id || req.body?.userId || req.query?.userId;
  if (!userId) {
    throw new ApiError(401, "User authentication is required");
  }

  const recurring = await RecurringPayment.findOne({
    _id: recurringId,
    user: userId,
  });

  if (!recurring) {
    throw new ApiError(404, "Recurring payment not found");
  }

  const { name, title, amount, category, frequency, nextDueDate, paymentMethod, autoPay, status, notes } =
    req.body || {};

  if (name !== undefined || title !== undefined) {
    const cleanName = (name || title || "").trim();
    if (!cleanName) throw new ApiError(400, "Name cannot be empty");
    recurring.name = cleanName;
  }

  if (amount !== undefined) {
    const num = Number(amount);
    if (isNaN(num) || num <= 0) throw new ApiError(400, "Amount must be greater than ₹0");
    recurring.amount = num;
  }

  if (category !== undefined) {
    recurring.category = typeof category === "string" ? category.trim() : recurring.category;
  }

  if (frequency !== undefined) {
    const validFrequencies = ["daily", "weekly", "monthly", "yearly"];
    if (!validFrequencies.includes(frequency.toLowerCase())) {
      throw new ApiError(400, "Invalid frequency (must be daily, weekly, monthly, or yearly)");
    }
    recurring.frequency = frequency.toLowerCase();
  }

  if (nextDueDate !== undefined) {
    const parsedDate = new Date(nextDueDate);
    if (isNaN(parsedDate.getTime())) throw new ApiError(400, "Invalid nextDueDate format");
    recurring.nextDueDate = parsedDate;
  }

  if (paymentMethod !== undefined) {
    recurring.paymentMethod = paymentMethod;
  }

  if (autoPay !== undefined) {
    recurring.autoPay = Boolean(autoPay);
  }

  if (status !== undefined) {
    const validStatuses = ["active", "paused", "cancelled"];
    if (!validStatuses.includes(status.toLowerCase())) {
      throw new ApiError(400, "Status must be active, paused, or cancelled");
    }
    recurring.status = status.toLowerCase();
  }

  if (notes !== undefined) {
    recurring.notes = typeof notes === "string" ? notes.trim() : "";
  }

  const updated = await recurring.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Recurring payment updated successfully", updated));
});

/**
 * @desc    Delete a recurring payment
 * @route   DELETE /api/v1/recurring-payments/:id
 * @access  Private
 */
export const deleteRecurringPayment = asyncHandler(async (req, res) => {
  const recurringId = req.params.id;

  if (!recurringId || !isValidObjectId(recurringId)) {
    throw new ApiError(400, "Invalid recurring payment ID format");
  }

  const userId = req.user?._id || req.body?.userId || req.query?.userId;
  if (!userId) {
    throw new ApiError(401, "User authentication is required");
  }

  const deleted = await RecurringPayment.findOneAndDelete({
    _id: recurringId,
    user: userId,
  });

  if (!deleted) {
    throw new ApiError(404, "Recurring payment not found");
  }

  return res.status(200).json(
    new ApiResponse(200, "Recurring payment deleted successfully", {
      deletedId: deleted._id,
      name: deleted.name,
    })
  );
});

/**
 * @desc    Mark a recurring payment as paid (creates a Transaction and advances nextDueDate)
 * @route   POST /api/v1/recurring-payments/:id/pay
 * @access  Private
 */
export const markRecurringPaymentPaid = asyncHandler(async (req, res) => {
  const recurringId = req.params.id;

  if (!recurringId || !isValidObjectId(recurringId)) {
    throw new ApiError(400, "Invalid recurring payment ID format");
  }

  const userId = req.user?._id || req.body?.userId || req.query?.userId;
  if (!userId) {
    throw new ApiError(401, "User authentication is required");
  }

  const recurring = await RecurringPayment.findOne({
    _id: recurringId,
    user: userId,
  });

  if (!recurring) {
    throw new ApiError(404, "Recurring payment not found");
  }

  // 1. Create matching expense transaction
  const transaction = await Transaction.create({
    user: userId,
    title: recurring.name,
    amount: recurring.amount,
    type: "expense",
    category: recurring.category || "Subscription",
    paymentMethod: recurring.paymentMethod || "UPI",
    date: new Date(),
    notes: `Recurring payment for ${recurring.name}`,
    recurringPaymentId: recurring._id,
  });

  // 2. Advance nextDueDate to next cycle
  const currentDue = new Date(recurring.nextDueDate || Date.now());
  const nextDue = new Date(currentDue);

  switch (recurring.frequency) {
    case "daily":
      nextDue.setDate(nextDue.getDate() + 1);
      break;
    case "weekly":
      nextDue.setDate(nextDue.getDate() + 7);
      break;
    case "yearly":
      nextDue.setFullYear(nextDue.getFullYear() + 1);
      break;
    case "monthly":
    default:
      nextDue.setMonth(nextDue.getMonth() + 1);
      break;
  }

  recurring.nextDueDate = nextDue;
  recurring.lastPaidDate = new Date();
  recurring.lastAlertSentDate = null; // Reset alert so the next cycle can trigger notifications
  await recurring.save();

  return res.status(200).json(
    new ApiResponse(200, "Recurring payment marked as paid successfully", {
      recurringPayment: recurring,
      transaction,
    })
  );
});

/**
 * @desc    Manually trigger upcoming due alerts check (for testing or admin verification)
 * @route   POST /api/v1/recurring-payments/trigger-alerts
 * @access  Private
 */
export const triggerDueAlerts = asyncHandler(async (req, res) => {
  const daysAhead = Math.min(30, Math.max(0, Number(req.query.daysAhead) || 3));
  const { checkAndSendDueAlerts } = await import("../services/alert.service.js");
  const result = await checkAndSendDueAlerts(daysAhead, req.user?._id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Alerts check executed successfully", result));
});

