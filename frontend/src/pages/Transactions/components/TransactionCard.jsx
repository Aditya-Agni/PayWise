const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

function formatDate(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function TransactionCard({ transaction }) {
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

          <span className="rounded border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[10px] uppercase">
            {transaction.type}
          </span>
        </div>

        {transaction.note && (
          <p className="mt-1 text-xs text-neutral-500">
            {transaction.note}
          </p>
        )}
      </div>

      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold tabular-nums text-black sm:text-base">
          {isIncome ? "+" : "-"}
          {formatCurrency(transaction.amount)}
        </p>

        <span className="mt-1 block text-xs text-neutral-400">
          Click to edit
        </span>
      </div>
    </article>
  );
}