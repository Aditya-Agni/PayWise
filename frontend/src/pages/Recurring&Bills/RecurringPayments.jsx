import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import OverviewCard from "./components/OverviewCard";
import RecurringPaymentsList from "./components/RecurringPaymentsList";
import RecurringPaymentDialog from "./components/RecurringPaymentDialog";
import {
  getRecurringPayments,
  createRecurringPayment,
  updateRecurringPayment,
  deleteRecurringPayment,
  markRecurringPaymentPaid,
  triggerDueAlerts,
} from "../../services/api.js";

// Baseline sample data if backend has no records yet (matching screenshot)
const INITIAL_SAMPLE_PAYMENTS = [
  {
    _id: "sample-1",
    name: "Netflix Premium (4K UHD)",
    amount: 649,
    category: "Entertainment",
    frequency: "monthly",
    nextDueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Due in 2d
    paymentMethod: "Credit Card",
    autoPay: true,
    status: "active",
  },
  {
    _id: "sample-2",
    name: "JioFiber Broadband Gigabit",
    amount: 1179,
    category: "Bills & Utilities",
    frequency: "monthly",
    nextDueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Overdue
    paymentMethod: "UPI",
    autoPay: false,
    status: "active",
  },
  {
    _id: "sample-3",
    name: "HDFC Car Loan EMI",
    amount: 14500,
    category: "Bills & Utilities",
    frequency: "monthly",
    nextDueDate: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString(), // In 13d
    paymentMethod: "Net Banking",
    autoPay: true,
    status: "active",
  },
  {
    _id: "sample-4",
    name: "Cult.fit Gym & Fitness Pass",
    amount: 1250,
    category: "Healthcare",
    frequency: "monthly",
    nextDueDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // Overdue
    paymentMethod: "Credit Card",
    autoPay: false,
    status: "active",
  },
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

function getDueDayDiff(dateString) {
  if (!dateString) return 999;
  const target = new Date(dateString);
  if (isNaN(target.getTime())) return 999;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDate = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.round((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function RecurringPayments({ user, onSignOut }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const [filter, setFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [payingId, setPayingId] = useState(null);
  const [alertFeedback, setAlertFeedback] = useState("");
  const [localFallback, setLocalFallback] = useState(() => {
    const saved = localStorage.getItem("paywise_recurring_fallback");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return INITIAL_SAMPLE_PAYMENTS;
  });

  // Check if URL has ?action=new to automatically open dialog
  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setSelectedPayment(null);
      setIsDialogOpen(true);
      // clean up query param without refreshing
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Fetch from API
  const {
    data: apiPayments = [],
    isLoading,
    isSuccess,
    isError,
  } = useQuery({
    queryKey: ["recurring-payments"],
    queryFn: getRecurringPayments,
    retry: 1,
  });

  // Save local fallback changes to localStorage
  const updateFallback = (items) => {
    setLocalFallback(items);
    localStorage.setItem("paywise_recurring_fallback", JSON.stringify(items));
  };

  // Determine active dataset (prefer backend data if query succeeded, otherwise fallback)
  const payments = useMemo(() => {
    if (isSuccess && Array.isArray(apiPayments)) {
      return apiPayments;
    }
    if (Array.isArray(apiPayments) && apiPayments.length > 0) {
      return apiPayments;
    }
    if (isError) {
      return localFallback;
    }
    return Array.isArray(apiPayments) ? apiPayments : localFallback;
  }, [apiPayments, isSuccess, isError, localFallback]);

  // Calculations for Overview Cards
  const stats = useMemo(() => {
    let monthlyTotal = 0;
    let overdueCount = 0;
    let thisWeekCount = 0;

    payments.forEach((item) => {
      const amount = Number(item.amount) || 0;
      const freq = (item.frequency || "monthly").toLowerCase();

      // Normalize to monthly baseline
      if (freq === "yearly") {
        monthlyTotal += amount / 12;
      } else if (freq === "weekly") {
        monthlyTotal += amount * 4.33;
      } else if (freq === "daily") {
        monthlyTotal += amount * 30;
      } else {
        monthlyTotal += amount;
      }

      const diffDays = getDueDayDiff(item.nextDueDate);
      if (diffDays < 0) {
        overdueCount += 1;
      } else if (diffDays <= 7) {
        thisWeekCount += 1;
      }
    });

    const attentionCount = overdueCount + thisWeekCount;

    return {
      monthlyTotal,
      activeCount: payments.length,
      attentionCount,
      overdueCount,
      thisWeekCount,
    };
  }, [payments]);

  // Filtered payments list
  const filteredPayments = useMemo(() => {
    if (filter === "all") return payments;

    return payments.filter((item) => {
      const diffDays = getDueDayDiff(item.nextDueDate);
      if (filter === "overdue") {
        return diffDays < 0;
      }
      if (filter === "due_soon") {
        return diffDays >= 0 && diffDays <= 7;
      }
      return true;
    });
  }, [payments, filter]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: createRecurringPayment,
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: ["recurring-payments"] });
      queryClient.setQueryData(["recurring-payments"], (old = []) => [
        ...(Array.isArray(old) ? old : []),
        newItem,
      ]);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateRecurringPayment(id, data),
    onSuccess: (updatedItem) => {
      queryClient.invalidateQueries({ queryKey: ["recurring-payments"] });
      queryClient.setQueryData(["recurring-payments"], (old = []) =>
        (Array.isArray(old) ? old : []).map((item) =>
          (item._id || item.id) === (updatedItem._id || updatedItem.id)
            ? updatedItem
            : item
        )
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRecurringPayment,
    onSuccess: (res, deletedId) => {
      const idToDelete = res?.deletedId || deletedId;
      queryClient.invalidateQueries({ queryKey: ["recurring-payments"] });
      queryClient.setQueryData(["recurring-payments"], (old = []) =>
        (Array.isArray(old) ? old : []).filter(
          (item) => (item._id || item.id) !== idToDelete
        )
      );
    },
  });

  const payMutation = useMutation({
    mutationFn: ({ id, expectedDueDate }) =>
      markRecurringPaymentPaid(id, expectedDueDate),
    onSuccess: (result) => {
      // Invalidate both recurring payments and transactions so all screens stay synchronized!
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["recurring-payments"] });
      if (result?.recurringPayment) {
        queryClient.setQueryData(["recurring-payments"], (old = []) =>
          (Array.isArray(old) ? old : []).map((item) =>
            (item._id || item.id) ===
            (result.recurringPayment._id || result.recurringPayment.id)
              ? result.recurringPayment
              : item
          )
        );
      }
    },
  });

  const alertsMutation = useMutation({
    mutationFn: () => triggerDueAlerts(3),
    onSuccess: (result) => {
      const sent = result?.sentCount ?? 0;
      const found = result?.totalFound ?? 0;
      const results = result?.results ?? [];
      const failed = results.filter((item) => item.status === "failed");
      const skipped = results.filter((item) => item.status === "skipped");
      if (sent) {
        setAlertFeedback(`Sent ${sent} due alert${sent === 1 ? "" : "s"} by email${failed.length ? `; ${failed.length} failed (${failed[0].error})` : ""}.`);
      } else if (failed.length) {
        setAlertFeedback(`Found ${found} due bill${found === 1 ? "" : "s"}, but email delivery failed: ${failed[0].error}`);
      } else if (skipped.length) {
        setAlertFeedback(skipped[0].reason);
      } else {
        setAlertFeedback("No real bills are due in the next 3 days. Sample fallback bills do not send email alerts.");
      }
    },
    onError: (error) => setAlertFeedback(error.message || "Could not trigger due alerts."),
  });

  // Handlers
  const handleAddNew = () => {
    setSelectedPayment(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (payment) => {
    setSelectedPayment(payment);
    setIsDialogOpen(true);
  };

  const isMongoId = (id) => typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);

  const handleSubmitDialog = async (formData, editId) => {
    if (editId && isMongoId(editId)) {
      try {
        await updateMutation.mutateAsync({ id: editId, data: formData });
      } catch (err) {
        updateFallback(
          localFallback.map((item) =>
            (item._id || item.id) === editId ? { ...item, ...formData } : item
          )
        );
        throw err;
      }
    } else {
      try {
        await createMutation.mutateAsync(formData);
        // If this was converted from a sample item, remove it from fallback
        if (editId) {
          updateFallback(localFallback.filter((item) => (item._id || item.id) !== editId));
        }
      } catch (err) {
        const newItem = {
          ...formData,
          _id: "local-" + Date.now(),
          status: "active",
        };
        updateFallback([...localFallback, newItem]);
        throw err;
      }
    }
  };

  const handleDeleteDialog = async (id) => {
    if (isMongoId(id)) {
      await deleteMutation.mutateAsync(id);
    } else {
      updateFallback(localFallback.filter((item) => (item._id || item.id) !== id));
    }
  };

  const handleDeleteItem = async (id, payment) => {
    const name = payment?.name || payment?.title || "this commitment";
    if (window.confirm(`Delete “${name}”?`)) {
      await handleDeleteDialog(id);
    }
  };

  const handleMarkPaid = async (id, payment) => {
    setPayingId(id);
    try {
      if (isMongoId(id)) {
        await payMutation.mutateAsync({
          id,
          expectedDueDate: payment?.nextDueDate,
        });
      } else {
        // Local advance nextDueDate for sample fallback items
        const currentDue = new Date(payment.nextDueDate || Date.now());
        const nextDue = new Date(currentDue);
        const freq = (payment.frequency || "monthly").toLowerCase();

        if (freq === "yearly") nextDue.setFullYear(nextDue.getFullYear() + 1);
        else if (freq === "weekly") nextDue.setDate(nextDue.getDate() + 7);
        else if (freq === "daily") nextDue.setDate(nextDue.getDate() + 1);
        else nextDue.setMonth(nextDue.getMonth() + 1);

        updateFallback(
          localFallback.map((item) =>
            (item._id || item.id) === id
              ? { ...item, nextDueDate: nextDue.toISOString() }
              : item
          )
        );
      }
    } finally {
      setPayingId(null);
    }
  };

  const profileInitial = (user?.username || user?.email || "P")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navbar */}
      <header className="border-b border-neutral-200">
        <nav className="mx-auto flex min-h-[72px] max-w-[1440px] items-center justify-between gap-4 px-5 lg:px-10">
          <div className="flex shrink-0 items-center gap-3">
            <Link to="/home" className="flex shrink-0 items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-sm font-bold text-white">
                PW
              </span>
              <span className="text-2xl font-bold tracking-tight">
                PayWise
              </span>
            </Link>

            <span className="hidden rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 sm:inline-block">
              INR (₹)
            </span>
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <Link
              to="/home"
              className="rounded-xl px-4 py-3 text-sm text-neutral-600 hover:bg-neutral-100 hover:text-black transition-colors"
            >
              Dashboard
            </Link>

            <Link
              to="/transactions"
              className="rounded-xl px-4 py-3 text-sm text-neutral-600 hover:bg-neutral-100 hover:text-black transition-colors"
            >
              Transactions
            </Link>

            <Link
              to="/recurring-payments"
              className="rounded-xl bg-neutral-100 px-5 py-3 text-sm font-semibold text-black"
            >
              Recurring & Bills
            </Link>

            <button
              type="button"
              className="rounded-xl px-4 py-3 text-sm text-neutral-600 hover:bg-neutral-100 hover:text-black transition-colors"
            >
              Analytics
            </button>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={handleAddNew}
              className="rounded-lg bg-black px-3.5 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors"
            >
              + Add Commitment
            </button>

            <button
              type="button"
              onClick={() => { setAlertFeedback(""); alertsMutation.mutate(); }}
              disabled={alertsMutation.isPending}
              className="rounded-lg border border-neutral-300 px-3.5 py-2 text-xs font-semibold text-neutral-800 hover:bg-neutral-100 disabled:cursor-wait disabled:opacity-60 transition-colors"
            >
              {alertsMutation.isPending ? "Sending…" : "Test Due Alerts"}
            </button>

            <span
              title={user?.username || user?.email || "PayWise user"}
              aria-label="User profile"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-800 text-sm font-medium text-white"
            >
              {profileInitial}
            </span>

            <button
              type="button"
              onClick={onSignOut}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-xs font-medium hover:bg-neutral-100 transition-colors"
            >
              Log out
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-[1440px] space-y-6 px-5 py-7 lg:px-10">
        {alertFeedback && (
          <p role="status" className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
            {alertFeedback}
          </p>
        )}
        {/* Overview Stats Cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <OverviewCard
            title="Monthly Commitments"
            value={formatCurrency(stats.monthlyTotal)}
            description="Estimated monthly baseline"
          />

          <OverviewCard
            title="Active Subscriptions & EMIs"
            value={stats.activeCount}
            description="Across utilities, entertainment, loans"
          />

          <OverviewCard
            title="Attention Required"
            value={stats.attentionCount}
            extra={`(${stats.overdueCount} overdue, ${stats.thisWeekCount} this week)`}
            description="Keep track to avoid late fees"
          />
        </section>

        {/* Commitments List Card */}
        <RecurringPaymentsList
          payments={filteredPayments}
          filter={filter}
          onFilterChange={setFilter}
          onAddNew={handleAddNew}
          onMarkPaid={handleMarkPaid}
          onEdit={handleEdit}
          onDelete={handleDeleteItem}
          payingId={payingId}
        />
      </main>

      {/* Dialog for Add / Edit */}
      <RecurringPaymentDialog
        isOpen={isDialogOpen}
        initialData={selectedPayment}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleSubmitDialog}
        onDelete={handleDeleteDialog}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
