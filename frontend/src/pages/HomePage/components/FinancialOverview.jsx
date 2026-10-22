const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

export default function FinancialOverview({ data }) {
  const cards = [
    {
      title: "Total Expenses",
      value: data.totalExpenses,
      label: "Outflow",
      description: `${data.transactionCount} transactions recorded`,
    },
    {
      title: "Total Income",
      value: data.totalIncome,
      label: "Inflow",
      description: "Across salaries & freelance earnings",
    },
    {
      title: "Net Balance",
      value: data.netBalance,
      label: "Current",
      description: "Income minus recorded expenses",
    },
    {
      title: "Monthly Subscriptions",
      value: data.monthlySubscriptions,
      label: "Commitments",
      description: `${data.activeBills} active bills & EMIs`,
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.title}
          className="rounded-xl border border-neutral-200 bg-white p-5"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm text-neutral-600">{card.title}</h2>

            <span className="rounded-lg bg-neutral-100 px-3 py-1.5 text-xs text-neutral-700">
              {card.label}
            </span>
          </div>

          <p className="mt-3 text-2xl font-bold tracking-tight tabular-nums sm:text-3xl">
            {formatCurrency(card.value)}
          </p>

          <p className="mt-2 text-sm text-neutral-500">
            {card.description}
          </p>
        </article>
      ))}
    </section>
  );
}