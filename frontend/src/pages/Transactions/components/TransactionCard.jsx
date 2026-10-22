const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function TransactionCard({ transaction, onEdit, onDelete }) {
  const isIncome = transaction.type === "income";

  return (
    <article className="flex items-center justify-between gap-4 border-b border-neutral-200 px-3 py-4 last:border-b-0">
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-black">
          {transaction.title}
        </h3>

        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
          <span>{transaction.category}</span>
          <span>•</span>
          <span>{formatDate(transaction.date)}</span>
          <span>•</span>
          <span>{transaction.paymentMethod}</span>

          <span className={`rounded border px-2 py-0.5 text-[10px] uppercase ${isIncome ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
            {transaction.type}
          </span>
        </div>

        {transaction.notes && (
          <p className="mt-1 text-xs text-neutral-500">
            {transaction.notes}
          </p>
        )}
      </div>

      <div className="shrink-0 text-right">
        <p className={`text-sm font-semibold tabular-nums sm:text-base ${isIncome ? "text-emerald-600" : "text-red-600"}`}>
          {isIncome ? "+" : "-"}
          {formatCurrency(transaction.amount)}
        </p>

        <div className="mt-2 flex justify-end gap-2">
          <button type="button" onClick={onEdit} aria-label={`Edit ${transaction.title}`} title="Edit" className="grid h-7 w-7 place-items-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-black">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true"><path d="m4 20 4.2-1 9.5-9.5a2.1 2.1 0 0 0-3-3L5.2 16 4 20Z" /><path d="m13.5 7.5 3 3" /></svg>
          </button>
          <button type="button" onClick={onDelete} aria-label={`Delete ${transaction.title}`} title="Delete" className="grid h-7 w-7 place-items-center rounded-md text-neutral-400 hover:bg-red-50 hover:text-red-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true"><path d="M4 7h16M10 11v5m4-5v5M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>
          </button>
        </div>
      </div>
    </article>
  );
}
