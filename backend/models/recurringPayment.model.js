import mongoose, { Schema } from "mongoose";

const recurringPaymentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recurring payment must belong to a user"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Service or subscription name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be at least ₹0.01"],
    },
    category: {
      type: String,
      trim: true,
      default: "Subscription",
    },
    frequency: {
      type: String,
      required: [true, "Frequency is required"],
      enum: {
        values: ["daily", "weekly", "monthly", "yearly"],
        message: "{VALUE} is not a valid frequency (must be daily, weekly, monthly, or yearly)",
      },
      default: "monthly",
    },
    nextDueDate: {
      type: Date,
      required: [true, "Next due date is required"],
      default: Date.now,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["UPI", "Credit Card", "Debit Card", "Net Banking", "Cash", "Auto-debit", "Other"],
      default: "UPI",
    },
    status: {
      type: String,
      enum: {
        values: ["active", "paused", "cancelled"],
        message: "{VALUE} is not a valid status (must be active, paused, or cancelled)",
      },
      default: "active",
      index: true,
    },
    lastPaidDate: {
      type: Date,
      default: null,
    },
    lastAlertSentDate: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for user upcoming payments & active subscription lookups
recurringPaymentSchema.index({ user: 1, nextDueDate: 1 });
recurringPaymentSchema.index({ user: 1, status: 1 });

export const RecurringPayment = mongoose.model("RecurringPayment", recurringPaymentSchema);
export default RecurringPayment;
