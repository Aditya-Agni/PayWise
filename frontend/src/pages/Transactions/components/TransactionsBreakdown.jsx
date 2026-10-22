const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

function createPieGradient(items) {
  let currentPercentage = 0;

  const slices = items.map((item) => {
    const start = currentPercentage;
    currentPercentage += item.percentage;

    return `${item.color} ${start}% ${currentPercentage}%`;
  });

  return `conic-gradient(${slices.join(", ")})`;
}

export default function TransactionsBreakdown({
  breakdown = [],
  transactionCount = 0,
}) {
  const chartBackground = createPieGradient(breakdown);

  let previousPercentage = 0;

  const chartLabels = breakdown.map((item) => {
    const middleAngle =
      (previousPercentage + item.percentage / 2) * 3.6 - 90;

    previousPercentage += item.percentage;

    const radius = 31;

    return {
      ...item,
      left: 50 + radius * Math.cos((middleAngle * Math.PI) / 180),
      top: 50 + radius * Math.sin((middleAngle * Math.PI) / 180),
    };
  });

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
      <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[1fr_220px_1.4fr]">
        {/* Heading */}
        <div className="self-start">
          <h2 className="text-xl font-semibold tracking-tight">
            Transactions Breakdown
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Distribution of all transactions ({transactionCount} records)
          </p>
        </div>

        {/* Pie chart */}
        <div className="flex justify-center">
          <div
            role="img"
            aria-label="Pie chart showing transaction amounts by category"
            className="relative h-48 w-48 shrink-0 rounded-full"
            style={{ background: chartBackground }}
          >
            {chartLabels.map((item) =>
              item.percentage >= 5 ? (
                <span
                  key={item.category}
                  className="absolute -translate-x-1/2 -translate-y-1/2 text-xs font-medium text-neutral-800"
                  style={{
                    left: `${item.left}%`,
                    top: `${item.top}%`,
                  }}
                >
                  {item.percentage.toFixed(1)}%
                </span>
              ) : null
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="min-w-0">
          {breakdown.map((item) => (
            <div
              key={item.category}
              className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 border-b border-neutral-100 py-2.5 text-sm last:border-b-0"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className="h-3.5 w-3.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />

                <span className="truncate">{item.category}</span>
              </div>

              <span className="whitespace-nowrap text-right tabular-nums">
                {formatCurrency(item.amount)}
              </span>

              <span className="w-12 text-right text-neutral-500">
                {item.percentage.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}