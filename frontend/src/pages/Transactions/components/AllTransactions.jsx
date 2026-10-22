import { useEffect, useMemo, useState } from "react";
import TransactionCard from "./TransactionCard";
import { expenseCategories, incomeCategories, transactionCategories } from "./transactionOptions.js";

export default function AllTransactions({ transactions = [], typeFilter, onTypeFilterChange, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");
  const categories = useMemo(() => [
    "All",
    ...(typeFilter === "income" ? incomeCategories : typeFilter === "expense" ? expenseCategories : transactionCategories),
  ], [typeFilter]);

  useEffect(() => {
    if (!categories.includes(categoryFilter)) setCategoryFilter("All");
  }, [categoryFilter, categories]);

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = transactions.filter((transaction) => {
      const matchesSearch = [
        transaction.title,
        transaction.note,
        transaction.paymentMethod,
        transaction.category,
      ].some((value) => value?.toLowerCase().includes(query));

      const matchesType =
        typeFilter === "all" || transaction.type === typeFilter;

      const matchesCategory =
        categoryFilter === "All" ||
        transaction.category === categoryFilter;

      return matchesSearch && matchesType && matchesCategory;
    });

    return [...filtered].sort((a, b) => {
      const dateDifference =
        new Date(a.date).getTime() - new Date(b.date).getTime();

      if (sortOrder === "newest") return -dateDifference;
      if (sortOrder === "oldest") return dateDifference;

      return 0;
    });
  }, [transactions, search, typeFilter, categoryFilter, sortOrder]);

  const filterButtonClass = (active) =>
    `rounded-lg px-4 py-2 text-xs font-medium transition-colors ${
      active
        ? "border border-black bg-black text-white"
        : "border border-neutral-200 bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
    }`;

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          All Transactions ({filteredTransactions.length})
        </h2>

        <p className="mt-1 text-sm text-neutral-500">
          Filter, search, or click any record to edit details
        </p>
      </div>

      {/* Search, type filter and sorting */}
      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[1.5fr_1fr_1fr]">
        <div className="relative">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m16 16 4 4" />
          </svg>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, note, method..."
            aria-label="Search transactions"
            className="w-full rounded-lg border border-neutral-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
          />
        </div>

        <div className="flex rounded-lg border border-neutral-200 p-0.5">
          {["all", "expense", "income"].map((type) => (
            <button
              key={type}
              onClick={() => onTypeFilterChange(type)}
              className={`flex-1 rounded-md px-2 py-2 text-xs capitalize transition-colors ${
                typeFilter === type
                  ? "bg-neutral-100 font-semibold text-black"
                  : "text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {type === "all" ? "All" : type}
            </button>
          ))}
        </div>

        <select
          value={sortOrder}
          onChange={(event) => setSortOrder(event.target.value)}
          aria-label="Sort transactions"
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
        >
          <option value="newest">Date (Newest first)</option>
          <option value="oldest">Date (Oldest first)</option>
        </select>
      </div>

      {/* Category filters */}
      <div className="mt-4 flex flex-wrap gap-2 border-b border-neutral-200 pb-3">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setCategoryFilter(category)}
            className={filterButtonClass(categoryFilter === category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Reusable transaction cards */}
      <div className="mt-2 overflow-hidden rounded-lg border border-neutral-200">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction) => (
            <TransactionCard
              key={transaction._id || transaction.id}
              transaction={transaction}
              onEdit={() => onEdit(transaction)}
              onDelete={() => onDelete(transaction)}
            />
          ))
        ) : (
          <p className="p-8 text-center text-sm text-neutral-500">
            No transactions match your filters.
          </p>
        )}
      </div>
    </section>
  );
}
