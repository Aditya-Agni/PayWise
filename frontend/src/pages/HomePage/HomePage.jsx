import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import {
  getTransactions,
  getRecurringPayments,
  markRecurringPaymentPaid,
} from "../../services/api.js";
import FinancialOverview from "./components/FinancialOverview";
import SpendingCategory from "./components/SpendingCategory";
import UpcomingCommitments from "./components/UpcomingCommitments";
import RecentTransactions from "./components/RecentTransactions";
import QuickActions from "./components/QuickActions";

// ─── helpers ────────────────────────────────────────────────────────────────

function isThisMonth(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function dueLabel(nextDueDate) {
  const diff = Math.ceil(
    (new Date(nextDueDate).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) /
      (1000 * 60 * 60 * 24)
  );
  if (diff < 0) return "Overdue";
  if (diff === 0) return "Due Today";
  if (diff === 1) return "Due Tomorrow";
  return `Due in ${diff}d`;
}

// ─── component ──────────────────────────────────────────────────────────────

export default function HomePage({ user, onSignOut }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const profileInitial = (user?.username || user?.email || "P")
    .trim()
    .charAt(0)
    .toUpperCase();

  // ── Data fetching ───────────────────────────────────────────────────────
  const {
    data: transactions = [],
    isLoading: txLoading,
  } = useQuery({
    queryKey: ["transactions"],
    queryFn: getTransactions,
    staleTime: 2 * 60 * 1000,
  });

  const {
    data: recurringPayments = [],
    isLoading: rpLoading,
  } = useQuery({
    queryKey: ["recurringPayments"],
    queryFn: getRecurringPayments,
    staleTime: 2 * 60 * 1000,
  });

  // ── Derived data ────────────────────────────────────────────────────────
  const overviewData = useMemo(() => {
    const monthlyTx = Array.isArray(transactions)
      ? transactions.filter((t) => isThisMonth(t.date))
      : [];

    const totalExpenses = monthlyTx
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + (t.amount ?? 0), 0);

    const totalIncome = monthlyTx
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + (t.amount ?? 0), 0);

    const activeRecurring = Array.isArray(recurringPayments)
      ? recurringPayments.filter((r) => r.status === "active")
      : [];

    // Normalize every recurring to monthly cost for the subscriptions card
    const monthlySubscriptions = activeRecurring.reduce((sum, r) => {
      const amt = r.amount ?? 0;
      switch (r.frequency) {
        case "daily":
          return sum + amt * 30;
        case "weekly":
          return sum + amt * 4;
        case "yearly":
          return sum + amt / 12;
        default:
          return sum + amt;
      }
    }, 0);

    return {
      totalExpenses,
      totalIncome,
      netBalance: totalIncome - totalExpenses,
      monthlySubscriptions: Math.round(monthlySubscriptions),
      transactionCount: monthlyTx.length,
      activeBills: activeRecurring.length,
    };
  }, [transactions, recurringPayments]);

  const categories = useMemo(() => {
    const monthlyExpenses = Array.isArray(transactions)
      ? transactions.filter((t) => t.type === "expense" && isThisMonth(t.date))
      : [];
    const total = monthlyExpenses.reduce((s, t) => s + (t.amount ?? 0), 0);

    const map = {};
    monthlyExpenses.forEach((t) => {
      const cat = t.category || "Other";
      map[cat] = (map[cat] || 0) + (t.amount ?? 0);
    });

    return Object.entries(map)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: total > 0 ? parseFloat(((amount / total) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const recentTransactions = useMemo(() => {
    if (!Array.isArray(transactions)) return [];
    return transactions.slice(0, 5).map((t) => ({
      id: t._id,
      title: t.title,
      category: t.category,
      date: new Date(t.date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      amount: t.type === "expense" ? -(t.amount ?? 0) : t.amount ?? 0,
      type: t.type,
    }));
  }, [transactions]);

  const upcomingCommitments = useMemo(() => {
    if (!Array.isArray(recurringPayments)) return [];
    const now = new Date();
    const weekAhead = new Date(now);
    weekAhead.setDate(weekAhead.getDate() + 7);

    return recurringPayments
      .filter((r) => r.status === "active")
      .filter((r) => new Date(r.nextDueDate) <= weekAhead)
      .sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate))
      .slice(0, 5)
      .map((r) => ({
        id: r._id,
        name: r.name,
        amount: r.amount,
        frequency: r.frequency,
        dueLabel: dueLabel(r.nextDueDate),
        type: r.category?.toLowerCase().includes("internet")
          ? "internet"
          : r.category?.toLowerCase().includes("gym") ||
            r.category?.toLowerCase().includes("fitness")
          ? "gym"
          : "subscription",
      }));
  }, [recurringPayments]);

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleMarkPaid = async (id) => {
    try {
      const rp = recurringPayments.find((r) => r._id === id);
      await markRecurringPaymentPaid(id, rp?.nextDueDate);
      queryClient.invalidateQueries({ queryKey: ["recurringPayments"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    } catch (err) {
      console.error("Mark paid failed:", err);
    }
  };

  const isLoading = txLoading || rpLoading;

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
            <button
              onClick={() => navigate("/recurring-payments")}
              className="hidden rounded-lg border border-neutral-300 px-3 py-2.5 text-sm font-medium hover:bg-neutral-100 sm:block"
            >
              + Bill / Sub
            </button>

            <button
              onClick={() => navigate("/transactions")}
              className="rounded-lg bg-black px-3 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 sm:px-4"
            >
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

          {isLoading && (
            <span className="text-xs text-neutral-400 animate-pulse">Loading…</span>
          )}
        </div>

        <FinancialOverview data={overviewData} />

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.25fr_1fr]">
          {/* Left column */}
          <div className="space-y-5">
            <SpendingCategory
              categories={categories}
              totalExpenses={overviewData.totalExpenses}
            />

            <RecentTransactions
              transactions={recentTransactions}
              onViewAll={() => navigate("/transactions")}
            />
          </div>

          {/* Right column */}
          <div className="space-y-5">
            <UpcomingCommitments
              commitments={upcomingCommitments}
              onMarkPaid={handleMarkPaid}
              onManage={() => navigate("/recurring-payments")}
            />

            <QuickActions
              onAddTransaction={() => navigate("/transactions")}
              onAddRecurring={() => navigate("/recurring-payments")}
              onViewAnalytics={() => navigate("/analytics")}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
