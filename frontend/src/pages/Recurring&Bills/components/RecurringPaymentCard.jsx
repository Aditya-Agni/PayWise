import EditIconButton from "./EditIconButton";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

function formatDueDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getDueStatus(dateString) {
  if (!dateString) return { label: "", type: "normal" };
  const target = new Date(dateString);
  if (isNaN(target.getTime())) return { label: "", type: "normal" };

  const now = new Date();
  // Strip time for clean day diff
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDate = new Date(target.getFullYear(), target.getMonth(), target.getDate());

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: "Overdue", type: "overdue" };
  }
  if (diffDays === 0) {
    return { label: "Due Today", type: "due_soon" };
  }
  if (diffDays === 1) {
    return { label: "Due in 1d", type: "due_soon" };
  }
  if (diffDays <= 7) {
    return { label: `Due in ${diffDays}d`, type: "due_soon" };
  }
  return { label: `In ${diffDays}d`, type: "upcoming" };
}

function formatFrequency(freq = "monthly") {
  const f = freq.toLowerCase();
  if (f === "monthly") return "Per Month";
  if (f === "yearly") return "Per Year";
  if (f === "weekly") return "Per Week";
  if (f === "daily") return "Per Day";
  return `Per ${freq}`;
}

function capitalizeFirst(text = "") {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export default function RecurringPaymentCard({
  payment,
  onMarkPaid,
  onEdit,
  onDelete,
  isPaying = false,
}) {
  const id = payment._id || payment.id;
  const dueStatus = payment.dueStatus || getDueStatus(payment.nextDueDate);
  const dueLabel = payment.dueLabel || dueStatus.label;
  const isOverdue = dueStatus.type === "overdue" || dueLabel.toLowerCase().includes("overdue");
  const isAutoPay = payment.autoPay || payment.paymentMethod === "Auto-debit";

  return (
    <article className="flex flex-col justify-between gap-4 border-b border-neutral-100 p-4 transition-colors last:border-b-0 hover:bg-neutral-50/60 sm:flex-row sm:items-center sm:px-6 sm:py-5">
      {/* Left Details */}
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold text-neutral-900 truncate">
            {payment.name || payment.title}
          </h3>

          {dueLabel && (
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                isOverdue
                  ? "border border-neutral-900 bg-neutral-900 text-white"
                  : "border border-neutral-300 bg-white text-neutral-700"
              }`}
            >
              {dueLabel}
            </span>
          )}

          {isAutoPay && (
            <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
              Auto-Pay
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
          <span>{payment.category || "General"}</span>
          <span>•</span>
          <span>{capitalizeFirst(payment.frequency || "Monthly")}</span>
          <span>•</span>
          <span>Next due: {formatDueDate(payment.nextDueDate)}</span>
          {payment.paymentMethod && (
            <>
              <span>•</span>
              <span>{payment.paymentMethod}</span>
            </>
          )}
        </div>
      </div>

      {/* Right Pricing & Actions */}
      <div className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-2">
        <div className="text-left sm:text-right">
          <p className="text-base font-bold tabular-nums text-neutral-900">
            {formatCurrency(payment.amount)}
          </p>
          <p className="text-xs text-neutral-400">
            {formatFrequency(payment.frequency)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isPaying}
            onClick={() => onMarkPaid?.(id, payment)}
            className="rounded-lg bg-black px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPaying ? "Recording…" : "Mark as Paid"}
          </button>

          <EditIconButton onClick={() => onEdit?.(payment)} />

          <button
            type="button"
            onClick={() => onDelete?.(id, payment)}
            aria-label={`Delete ${payment.name || payment.title}`}
            title="Delete"
            className="grid h-7 w-7 place-items-center rounded-lg border border-neutral-300 text-neutral-400 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-3.5 w-3.5"
              aria-hidden="true"
            >
              <path d="M4 7h16M10 11v5m4-5v5M6 7l1 13h10l1-13M9 7V4h6v3" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
