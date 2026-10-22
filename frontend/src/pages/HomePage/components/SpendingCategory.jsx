const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

export default function SpendingCategory({
  categories = [],
  totalExpenses = 0,
}) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
      <h2 className="text-xl font-semibold tracking-tight">
        Spending by Category
      </h2>

      <p className="mt-1 text-sm text-neutral-500">
        Distribution of {formatCurrency(totalExpenses)} in total expenses
      </p>

      <div className="mt-6 space-y-5">
        {categories.map((category) => (
          <div key={category.name}>
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="font-medium">{category.name}</span>

              <div className="flex items-center gap-3">
                <span className="font-medium tabular-nums">
                  {formatCurrency(category.amount)}
                </span>
                <span className="w-14 text-right text-neutral-500">
                  {category.percentage}%
                </span>
              </div>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-black"
                style={{
                  width: `${Math.min(category.percentage, 100)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}