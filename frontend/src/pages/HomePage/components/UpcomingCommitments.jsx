const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

function CommitmentIcon({ type }) {
  if (type === "internet") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <path d="M2 8.8a15 15 0 0 1 20 0" />
        <path d="M5 12a10 10 0 0 1 14 0" />
        <path d="M8.5 15.5a5 5 0 0 1 7 0" />
        <circle cx="12" cy="19" r="1" fill="currentColor" />
      </svg>
    );
  }

  if (type === "gym") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <path d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="13" rx="2" />
      <path d="M8 21h8M12 18v3" />
    </svg>
  );
}

export default function UpcomingCommitments({
  commitments = [],
  onMarkPaid,
  onManage,
}) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Upcoming Commitments
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Due today or in the next 7 days
          </p>
        </div>

        <button
          onClick={onManage}
          className="shrink-0 px-1 py-2 text-sm font-medium hover:underline"
        >
          Manage →
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {commitments.length === 0 ? (
          <p className="rounded-lg bg-neutral-50 p-4 text-sm text-neutral-500">
            No upcoming payments.
          </p>
        ) : (
          commitments.map((item) => (
            <article
              key={item.id}
              className="flex flex-col gap-3 rounded-xl border border-neutral-200 p-3 sm:flex-row sm:items-center sm:gap-4"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
                  <CommitmentIcon type={item.type} />
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-sm text-neutral-500">
                    {formatCurrency(item.amount)} · {item.frequency}
                  </p>
                </div>
              </div>

              <span className="w-fit shrink-0 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium">
                {item.dueLabel}
              </span>

              <button
                onClick={() => onMarkPaid?.(item.id)}
                className="shrink-0 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
              >
                Mark Paid
              </button>
            </article>
          ))
        )}
      </div>
    </section>
  );
}