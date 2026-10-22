import RecurringPaymentCard from "./RecurringPaymentCard";

export default function RecurringPaymentsList({
  payments = [],
  filter = "all",
  onFilterChange,
  onAddNew,
  onMarkPaid,
  onEdit,
  onDelete,
  payingId = null,
}) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white">
      {/* Section Header */}
      <div className="flex flex-col gap-4 border-b border-neutral-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-neutral-900 sm:text-xl">
            Recurring Payments & Subscriptions ({payments.length})
          </h2>
          <p className="mt-1 text-xs text-neutral-500 sm:text-sm">
            Manage automatic commitments, due dates, and mark bills paid
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filters */}
          <div className="flex items-center rounded-xl bg-neutral-100 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => onFilterChange("all")}
              className={`rounded-lg px-3 py-1.5 transition-all ${
                filter === "all"
                  ? "bg-white text-black shadow-xs"
                  : "text-neutral-600 hover:text-black"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => onFilterChange("due_soon")}
              className={`rounded-lg px-3 py-1.5 transition-all ${
                filter === "due_soon"
                  ? "bg-white text-black shadow-xs"
                  : "text-neutral-600 hover:text-black"
              }`}
            >
              Due Soon
            </button>
            <button
              type="button"
              onClick={() => onFilterChange("overdue")}
              className={`rounded-lg px-3 py-1.5 transition-all ${
                filter === "overdue"
                  ? "bg-white text-black shadow-xs"
                  : "text-neutral-600 hover:text-black"
              }`}
            >
              Overdue
            </button>
          </div>
        </div>
      </div>

      {/* Info Note Banner */}
      <div className="p-4 sm:px-6">
        <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-3.5 text-xs text-neutral-600">
          <strong className="font-semibold text-neutral-900">Note:</strong> Clicking “Mark as Paid” records the transaction in your expense history and advances the due date to the next cycle. (PayWise tracks expenses; it does not transfer actual money).
        </div>
      </div>

      {/* List items */}
      <div className="divide-y divide-neutral-100">
        {payments.length === 0 ? (
          <div className="p-8 text-center sm:p-12">
            <p className="text-sm font-medium text-neutral-600">
              {filter === "all"
                ? "No recurring commitments found."
                : `No ${filter === "overdue" ? "overdue" : "due soon"} commitments.`}
            </p>
            <p className="mt-1 text-xs text-neutral-400">
              Add your subscriptions, EMIs, or utility bills to start tracking them.
            </p>
            {filter === "all" && (
              <button
                type="button"
                onClick={onAddNew}
                className="mt-4 rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
              >
                + Add Commitment
              </button>
            )}
          </div>
        ) : (
          payments.map((payment) => (
            <RecurringPaymentCard
              key={payment._id || payment.id}
              payment={payment}
              onMarkPaid={onMarkPaid}
              onEdit={onEdit}
              onDelete={onDelete}
              isPaying={payingId === (payment._id || payment.id)}
            />
          ))
        )}
      </div>
    </section>
  );
}
