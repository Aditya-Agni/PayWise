export default function QuickActions({
  onAddTransaction,
  onAddRecurring,
  onViewAnalytics,
}) {
  const actions = [
    {
      title: "Add Transaction",
      symbol: "+",
      onClick: onAddTransaction,
      primary: true,
    },
    {
      title: "Add Recurring Subscription / EMI",
      symbol: "▣",
      onClick: onAddRecurring,
      primary: false,
    },
    {
      title: "View Analytics & Insights",
      symbol: "▥",
      onClick: onViewAnalytics,
      primary: false,
    },
  ];

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
      <h2 className="text-xl font-semibold tracking-tight">
        Quick Actions
      </h2>

      <p className="mt-1 text-sm text-neutral-500">
        Record a quick entry to keep your financial ledger synchronized.
      </p>

      <div className="mt-5 space-y-3">
        {actions.map((action) => (
          <button
            key={action.title}
            onClick={action.onClick}
            className={`flex w-full items-center gap-4 rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors ${
              action.primary
                ? "border-black bg-black text-white hover:bg-neutral-800"
                : "border-neutral-200 bg-white text-black hover:bg-neutral-50"
            }`}
          >
            <span className="w-5 text-center text-xl" aria-hidden="true">
              {action.symbol}
            </span>

            <span className="flex-1">{action.title}</span>

            <span className="text-lg" aria-hidden="true">
              →
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}