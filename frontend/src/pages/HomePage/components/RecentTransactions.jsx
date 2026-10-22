const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));

export default function RecentTransactions({
  transactions = [],
  onViewAll,
}) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Recent Transactions
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Latest activity from your ledger
          </p>
        </div>

        <button
          onClick={onViewAll}
          className="shrink-0 px-1 py-2 text-sm font-medium hover:underline"
        >
          View all →
        </button>
      </div>

      <div className="mt-4">
        {transactions.length === 0 ? (
          <p className="py-6 text-sm text-neutral-500">
            No transactions recorded yet.
          </p>
        ) : (
          transactions.map((transaction) => {
            const isIncome = transaction.type === "income";

            return (
              <article
                key={transaction.id}
                className="flex items-center gap-3 border-b border-neutral-200 py-4 last:border-b-0 last:pb-0"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xl">
                  {isIncome ? "↑" : "↓"}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold">
                    {transaction.title}
                  </h3>

                  <p className="mt-1 text-sm text-neutral-500">
                    {transaction.category} · {transaction.date}
                  </p>
                </div>

                <p className="shrink-0 text-right text-sm font-semibold tabular-nums sm:text-base">
                  {isIncome ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </p>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}