import mongoose, { Schema } from "mongoose";

const transactionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Transaction must belong to a user"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be at least ₹0.01"],
    },
    type: {
      type: String,
      required: [true, "Transaction type is required"],
      enum: {
        values: ["income", "expense"],
        message: "{VALUE} is not a valid transaction type (must be 'income' or 'expense')",
      },
      default: "expense",
      index: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      default: "Other",
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["UPI", "Credit Card", "Debit Card", "Net Banking", "Cash", "Auto-debit", "Other"],
      default: "UPI",
    },
    date: {
      type: Date,
      default: Date.now,
      required: [true, "Transaction date is required"],
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    recurringPaymentId: {
      type: Schema.Types.ObjectId,
      ref: "RecurringPayment",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for frequent query patterns (user dashboard, date filtering, type filtering)
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, type: 1 });
transactionSchema.index({ user: 1, category: 1 });

export const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
