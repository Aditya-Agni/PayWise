import FinancialOverview from "./components/FinancialOverview";
import SpendingCategory from "./components/SpendingCategory";
import UpcomingCommitments from "./components/UpcomingCommitments";
import RecentTransactions from "./components/RecentTransactions";
import QuickActions from "./components/QuickActions";
import { Link } from "react-router-dom";

// Dummy data for now; later this can come from the backend.
const overviewData = {
  totalExpenses: 28630,
  totalIncome: 100000,
  netBalance: 71370,
  monthlySubscriptions: 17578,
  transactionCount: 6,
  activeBills: 4,
};

const sampleCategories = [
  { name: "Bills & Utilities", amount: 22000, percentage: 76.8 },
  { name: "Groceries", amount: 3450, percentage: 12.1 },
  { name: "Transportation", amount: 2500, percentage: 8.7 },
  { name: "Food & Dining", amount: 680, percentage: 2.4 },
];

const sampleCommitments = [
  {
    id: 1,
    name: "Netflix Premium (4K UHD)",
    amount: 649,
    frequency: "monthly",
    dueLabel: "Due in 3d",
    type: "subscription",
  },
  {
    id: 2,
    name: "JioFiber Broadband Gigabit",
    amount: 1179,
    frequency: "monthly",
    dueLabel: "Due Today",
    type: "internet",
  },
  {
    id: 3,
    name: "Cult.fit Gym & Fitness Pass",
    amount: 1250,
    frequency: "monthly",
    dueLabel: "Overdue",
    type: "gym",
  },
];

const sampleTransactions = [
  {
    id: 1,
    title: "Freelance UI Design",
    category: "Salary / Income",
    date: "21 Oct 2026",
    amount: 15000,
    type: "income",
  },
  {
    id: 2,
    title: "Fuel - Shell Petrol Pump",
    category: "Transportation",
    date: "20 Oct 2026",
    amount: -2500,
    type: "expense",
  },
  {
    id: 3,
    title: "Blue Tokai Coffee & Bakery",
    category: "Food & Dining",
    date: "18 Oct 2026",
    amount: -680,
    type: "expense",
  },
];

export default function HomePage({ user, onSignOut }) {
  const profileInitial = (user?.username || user?.email || "P").trim().charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navbar */}
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex min-h-[72px] max-w-[1440px] items-center justify-between gap-4 px-5 lg:px-10">
          <Link to="/home" className="flex shrink-0 items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-sm font-bold text-white">
              PW
            </span>
            <span className="text-2xl font-bold tracking-tight">
              PayWise
            </span>
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            <Link to="/home" className="rounded-xl bg-neutral-100 px-5 py-3 text-sm font-semibold">
              Dashboard
            </Link>
            <Link to="/transactions" className="rounded-xl px-4 py-3 text-sm text-neutral-600 hover:bg-neutral-100 hover:text-black">
              Transactions
            </Link>
            <Link to="/recurring-payments" className="rounded-xl px-4 py-3 text-sm text-neutral-600 hover:bg-neutral-100 hover:text-black">
              Recurring & Bills
            </Link>
            <Link to="/analytics" className="rounded-xl px-4 py-3 text-sm text-neutral-600 hover:bg-neutral-100 hover:text-black">
              Analytics
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            <button className="hidden rounded-lg border border-neutral-300 px-3 py-2.5 text-sm font-medium hover:bg-neutral-100 sm:block">
              + Bill / Sub
            </button>

            <button className="rounded-lg bg-black px-3 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 sm:px-4">
              + <span className="hidden sm:inline">Add Transaction</span>
              <span className="sm:hidden">Add</span>
            </button>

            <span
              title={user?.username || user?.email || "PayWise user"}
              aria-label="User profile"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-white"
            >
              {profileInitial}
            </span>
            <button
              type="button"
              onClick={onSignOut}
              className="rounded-lg border border-neutral-300 px-3 py-2.5 text-sm font-medium hover:bg-neutral-100"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-[1440px] space-y-6 px-5 py-7 lg:px-10">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Financial Overview
          </h1>

          <button className="hidden text-sm text-neutral-500 underline underline-offset-4 hover:text-black sm:block">
            Reset Sample Data
          </button>
        </div>

        <FinancialOverview data={overviewData} />

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.25fr_1fr]">
          {/* Left column */}
          <div className="space-y-5">
            <SpendingCategory
              categories={sampleCategories}
              totalExpenses={overviewData.totalExpenses}
            />

            <RecentTransactions transactions={sampleTransactions} />
          </div>

          {/* Right column */}
          <div className="space-y-5">
            <UpcomingCommitments commitments={sampleCommitments} />

            <QuickActions />
          </div>
        </div>
      </main>
    </div>
  );
}
