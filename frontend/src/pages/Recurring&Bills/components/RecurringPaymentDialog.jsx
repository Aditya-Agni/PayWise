import { useState } from "react";

const CATEGORIES = [
  "Bills & Utilities",
  "Entertainment",
  "Healthcare",
  "Subscriptions",
  "EMI / Loan",
  "Food & Dining",
  "Transportation",
  "Groceries",
  "Other",
];

const FREQUENCIES = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "weekly", label: "Weekly" },
  { value: "daily", label: "Daily" },
];

const PAYMENT_METHODS = [
  "UPI",
  "Credit Card",
  "Debit Card",
  "Net Banking",
  "Auto-debit",
  "Cash",
  "Other",
];

export default function RecurringPaymentDialog({
  isOpen,
  initialData = null,
  onClose,
  onSubmit,
  onDelete,
  isLoading = false,
}) {
  if (!isOpen) return null;

  const isEditing = Boolean(initialData && (initialData._id || initialData.id));

  const [name, setName] = useState(initialData?.name || initialData?.title || "");
  const [amount, setAmount] = useState(initialData?.amount ?? "");
  const [category, setCategory] = useState(initialData?.category || "Bills & Utilities");
  const [frequency, setFrequency] = useState(initialData?.frequency || "monthly");
  const [nextDueDate, setNextDueDate] = useState(() => {
    if (initialData?.nextDueDate) {
      return new Date(initialData.nextDueDate).toISOString().split("T")[0];
    }
    return new Date().toISOString().split("T")[0];
  });
  const [paymentMethod, setPaymentMethod] = useState(
    initialData?.paymentMethod || "UPI"
  );
  const [autoPay, setAutoPay] = useState(Boolean(initialData?.autoPay));
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const cleanName = name.trim();
    if (!cleanName) {
      setFormError("Please enter a name for the bill or subscription.");
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setFormError("Please enter a valid amount greater than 0.");
      return;
    }

    if (!nextDueDate) {
      setFormError("Please select the next due date.");
      return;
    }

    const payload = {
      name: cleanName,
      title: cleanName,
      amount: numericAmount,
      category,
      frequency,
      nextDueDate: new Date(nextDueDate).toISOString(),
      paymentMethod,
      autoPay,
      notes: notes.trim(),
    };

    try {
      await onSubmit(payload, initialData?._id || initialData?.id);
      onClose();
    } catch (err) {
      setFormError(err.message || "Failed to save recurring payment.");
    }
  };

  const handleDelete = async () => {
    if (!isEditing || !onDelete) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${name || "this item"}"?`
    );
    if (!confirmDelete) return;

    try {
      await onDelete(initialData._id || initialData.id);
      onClose();
    } catch (err) {
      setFormError(err.message || "Failed to delete item.");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <h2 className="text-lg font-bold text-neutral-900">
            {isEditing ? "Edit Commitment" : "Add Commitment / Subscription"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-black"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {formError && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700">
              Name / Service <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Netflix Premium, JioFiber Broadband, Car EMI"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-neutral-700">
                Amount (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="649.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm tabular-nums focus:border-black focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              >
                {FREQUENCIES.map((freq) => (
                  <option key={freq.value} value={freq.value}>
                    {freq.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-neutral-700">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-neutral-700">
                Next Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-700">
                <input
                  type="checkbox"
                  checked={autoPay}
                  onChange={(e) => setAutoPay(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 text-black focus:ring-black"
                />
                Enable Auto-Pay badge
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Shared with family, billed on 25th"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
            {isEditing ? (
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-50 transition-colors"
              >
                {isLoading ? "Saving…" : isEditing ? "Save Changes" : "+ Add Commitment"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
