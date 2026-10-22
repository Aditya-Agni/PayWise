import TransactionsBreakdown from "./components/TransactionsBreakdown";
import AllTransactions from "./components/AllTransactions";

import {
  sampleTransactions,
  sampleBreakdown,
} from "./components/transactionsData";

export default function Transactions() {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navbar */}
      <header className="border-b border-neutral-200">
        <nav className="mx-auto flex min-h-[68px] max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
          <div className="flex shrink-0 items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-sm font-bold text-white">
              PW
            </span>

            <span className="text-xl font-bold tracking-tight">
              PayWise
            </span>

            <select
              aria-label="Currency"
              className="hidden rounded-lg border border-neutral-200 bg-white px-2 py-2 text-xs sm:block"
              defaultValue="INR"
            >
              <option value="INR">INR (₹)</option>
            </select>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <button className="rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100">
              Dashboard
            </button>

            <button className="rounded-lg border border-black px-4 py-2 text-sm font-semibold">
              Transactions
            </button>

            <button className="rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100">
              Recurring & Bills
            </button>

            <button className="rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100">
              Analytics
            </button>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button className="hidden rounded-lg border border-neutral-300 px-3 py-2 text-xs font-medium hover:bg-neutral-100 sm:block">
              + Bill / Sub
            </button>

            <button className="rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white hover:bg-neutral-800 sm:px-4">
              + Add Transaction
            </button>

            <button
              aria-label="User profile"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-800 text-sm text-white"
            >
              A
            </button>
          </div>
        </nav>
      </header>

      {/* Transactions content */}
      <main className="mx-auto max-w-[1240px] space-y-4 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <TransactionsBreakdown
          breakdown={sampleBreakdown}
          transactionCount={sampleTransactions.length}
        />

        <AllTransactions transactions={sampleTransactions} />
      </main>
    </div>
  );
}