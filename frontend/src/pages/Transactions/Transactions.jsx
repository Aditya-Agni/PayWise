import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import TransactionsBreakdown from "./components/TransactionsBreakdown";
import AllTransactions from "./components/AllTransactions";
import CreateTransactionForm from "./components/CreateTransactionForm";
import { deleteTransaction, getTransactions } from "../../services/api.js";

const chartColors = ["#C9D0FA", "#F3B29D", "#B9E2F3", "#EDE7D9", "#BDF0D9", "#D9C7F0"];

function createBreakdown(transactions) {
  const totals = transactions.reduce((result, transaction) => {
    const category = transaction.category || transaction.title || "Other";
    result[category] = (result[category] || 0) + Math.abs(Number(transaction.amount) || 0);
    return result;
  }, {});
  const total = Object.values(totals).reduce((sum, amount) => sum + amount, 0);
  return Object.entries(totals).map(([category, amount], index) => ({
    category,
    amount,
    percentage: total ? (amount / total) * 100 : 0,
    color: chartColors[index % chartColors.length],
  }));
}

export default function Transactions({ user, onSignOut }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const queryClient = useQueryClient();
  const transactionsQuery = useQuery({
    queryKey: ["transactions"],
    queryFn: getTransactions,
    retry: false,
  });
  const transactions = transactionsQuery.data || [];
  const profileInitial = (user?.username || user?.email || "P").trim().charAt(0).toUpperCase();
  const chartTransactions = typeFilter === "all" ? transactions : transactions.filter((transaction) => transaction.type === typeFilter);
  const breakdown = createBreakdown(chartTransactions);

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: (_, id) => {
      queryClient.setQueryData(["transactions"], (current = []) => current.filter((transaction) => (transaction._id || transaction.id) !== id));
    },
  });

  const handleCreated = (transaction) => {
    queryClient.setQueryData(["transactions"], (current = []) => {
      const id = transaction._id || transaction.id;
      return editingTransaction ? current.map((item) => (item._id || item.id) === id ? transaction : item) : [transaction, ...current];
    });
    setShowCreateForm(false);
    setEditingTransaction(null);
  };

  const handleDelete = (transaction) => {
    const id = transaction._id || transaction.id;
    if (window.confirm(`Delete “${transaction.title}”? This cannot be undone.`)) deleteMutation.mutate(id);
  };

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
            <Link to="/home" className="rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100">
              Dashboard
            </Link>

            <Link to="/transactions" className="rounded-lg border border-black px-4 py-2 text-sm font-semibold">
              Transactions
            </Link>

            <Link to="/recurring-payments" className="rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100">
              Recurring & Bills
            </Link>

            <Link to="/analytics" className="rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100">
              Analytics
            </Link>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button className="hidden rounded-lg border border-neutral-300 px-3 py-2 text-xs font-medium hover:bg-neutral-100 sm:block">
              + Bill / Sub
            </button>

            <button type="button" onClick={() => setShowCreateForm((visible) => !visible)} className="rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white hover:bg-neutral-800 sm:px-4">
              {showCreateForm ? "Close form" : "+ Add Transaction"}
            </button>

            <span
              title={user?.username || user?.email || "PayWise user"}
              aria-label="User profile"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-800 text-sm text-white"
            >
              {profileInitial}
            </span>
            <button type="button" onClick={onSignOut} className="rounded-lg border border-neutral-300 px-3 py-2 text-xs font-medium hover:bg-neutral-100">
              Log out
            </button>
          </div>
        </nav>
      </header>

      {/* Transactions content */}
      <main className="mx-auto max-w-[1240px] space-y-4 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        {(showCreateForm || editingTransaction) && <CreateTransactionForm transaction={editingTransaction} onCreated={handleCreated} onClose={() => { setShowCreateForm(false); setEditingTransaction(null); }} />}

        <TransactionsBreakdown
          breakdown={breakdown}
          transactionCount={chartTransactions.length}
          animationKey={typeFilter}
        />

        {transactionsQuery.isPending ? (
          <p className="rounded-xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600">Loading transactions…</p>
        ) : transactionsQuery.error ? (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{transactionsQuery.error.message}</p>
        ) : (
          <AllTransactions transactions={transactions} typeFilter={typeFilter} onTypeFilterChange={setTypeFilter} onEdit={setEditingTransaction} onDelete={handleDelete} />
        )}
      </main>
    </div>
  );
}
