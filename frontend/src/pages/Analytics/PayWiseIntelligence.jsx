import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  getSpendingAnalysis,
  getUnusualSpending,
  getRecurringForecast,
  getFinancialHealth,
} from "../../services/api.js";

// ─── formatters ────────────────────────────────────────────────────────────

const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n ?? 0);

const formatINRDecimal = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n ?? 0);

function daysFromNow(dateStr) {
  const diff = Math.ceil((new Date(dateStr) - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return `In ${diff} days`;
}

// ─── sub-components ─────────────────────────────────────────────────────────

function SparkLine({ value, max, color }) {
  const pct = Math.min(100, Math.max(0, ((value ?? 0) / (max || 1)) * 100));
  return (
    <div className="h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

function InsightCard({ icon, label, value, sub, color = "#000", pulse = false }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 flex flex-col gap-2 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-xl text-xl"
          style={{ background: color + "15" }}
        >
          {icon}
        </span>
        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">{label}</span>
        {pulse && (
          <span className="ml-auto flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
          </span>
        )}
      </div>
      <p className="text-2xl font-bold tracking-tight" style={{ color }}>
        {value}
      </p>
      {sub && <p className="text-xs text-neutral-500 leading-relaxed">{sub}</p>}
    </div>
  );
}

function AIExplanationBubble({ text, loading, error }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-white p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-black text-white text-sm font-bold">
            AI
          </div>
          <span className="text-sm font-medium text-neutral-600">PayWise Intelligence is thinking…</span>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-neutral-200 rounded animate-pulse w-full" />
          <div className="h-3 bg-neutral-200 rounded animate-pulse w-5/6" />
          <div className="h-3 bg-neutral-200 rounded animate-pulse w-4/6" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
        <p className="text-sm text-red-600">
          ⚠️ Could not generate AI insight. Make sure the backend is running with a valid Gemini API key.
        </p>
      </div>
    );
  }

  // Split into paragraphs on double newlines
  const paragraphs = (text || "").split(/\n\n+/).filter(Boolean);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-white p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-black text-white text-sm font-bold">
          AI
        </div>
        <span className="text-sm font-semibold text-black">PayWise Intelligence</span>
        <span className="ml-auto flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
          Live
        </span>
      </div>
      <div className="space-y-2">
        {paragraphs.map((para, i) => (
          <p key={i} className="text-sm text-neutral-700 leading-relaxed">{para.trim()}</p>
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-xl">
        {icon}
      </span>
      <div>
        <h2 className="text-base font-bold text-black">{title}</h2>
        {subtitle && <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function HealthScoreRing({ score, label }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 80 ? "#10b981" : score >= 65 ? "#3b82f6" : score >= 45 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg width="128" height="128" viewBox="0 0 128 128" className="-rotate-90">
          <circle cx="64" cy="64" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="10" />
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-black">{score}</span>
          <span className="text-[10px] text-neutral-500 font-medium">/ 100</span>
        </div>
      </div>
      <span
        className="rounded-full px-3 py-1 text-xs font-semibold"
        style={{ background: color + "18", color }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function PayWiseIntelligence({ user, onSignOut }) {
  const [activeTab, setActiveTab] = useState("health");

  const profileInitial = (user?.username || user?.email || "P")
    .trim()
    .charAt(0)
    .toUpperCase();

  const healthQuery = useQuery({
    queryKey: ["ai", "financial-health"],
    queryFn: getFinancialHealth,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const spendingQuery = useQuery({
    queryKey: ["ai", "spending-analysis"],
    queryFn: getSpendingAnalysis,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    enabled: activeTab === "spending" || activeTab === "health",
  });

  const unusualQuery = useQuery({
    queryKey: ["ai", "unusual-spending"],
    queryFn: getUnusualSpending,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    enabled: activeTab === "unusual",
  });

  const forecastQuery = useQuery({
    queryKey: ["ai", "recurring-forecast"],
    queryFn: getRecurringForecast,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    enabled: activeTab === "forecast",
  });

  const tabs = [
    { id: "health", label: "Health Score", icon: "🏅" },
    { id: "spending", label: "Spending Analyst", icon: "📊" },
    { id: "unusual", label: "Unusual Activity", icon: "🔍" },
    { id: "forecast", label: "Recurring Forecast", icon: "📅" },
  ];

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
              <span className="text-2xl font-bold tracking-tight">PayWise</span>
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
              className="rounded-xl px-4 py-3 text-sm text-neutral-600 hover:bg-neutral-100 hover:text-black transition-colors"
            >
              Recurring &amp; Bills
            </Link>
            <Link
              to="/analytics"
              className="rounded-xl bg-neutral-100 px-5 py-3 text-sm font-semibold text-black"
            >
              Analytics
            </Link>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <span
              title={user?.username || user?.email || "PayWise user"}
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

      {/* Page content */}
      <main className="mx-auto max-w-[1440px] px-5 py-8 lg:px-10">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white text-sm font-bold">
              AI
            </div>
            <h1 className="text-2xl font-bold tracking-tight">PayWise Intelligence</h1>
            <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600">
              Powered by Gemini
            </span>
          </div>
          <p className="text-sm text-neutral-500 ml-[52px]">
            AI-powered insights built from your actual financial data
          </p>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 rounded-2xl bg-neutral-100 p-1 mb-8 w-fit flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-white text-black shadow-sm"
                  : "text-neutral-500 hover:text-black"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── HEALTH SCORE TAB ─────────────────────────────────────────────── */}
        {activeTab === "health" && (
          <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
            {/* Left: score ring + quick stats */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 flex flex-col items-center gap-6">
                <SectionHeader icon="🏅" title="Financial Health Score" />
                {healthQuery.isLoading ? (
                  <div className="h-32 w-32 rounded-full bg-neutral-100 animate-pulse" />
                ) : healthQuery.isError ? (
                  <p className="text-sm text-red-500">Could not load score</p>
                ) : (
                  <HealthScoreRing
                    score={healthQuery.data?.score ?? 0}
                    label={healthQuery.data?.healthLabel ?? "—"}
                  />
                )}

                {healthQuery.data && (
                  <div className="w-full space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-neutral-500">Income</span>
                        <span className="font-semibold">{formatINR(healthQuery.data.income)}</span>
                      </div>
                      <SparkLine value={healthQuery.data.income} max={healthQuery.data.income} color="#10b981" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-neutral-500">Expenses</span>
                        <span className="font-semibold">{formatINR(healthQuery.data.expenses)}</span>
                      </div>
                      <SparkLine value={healthQuery.data.expenses} max={healthQuery.data.income || healthQuery.data.expenses} color="#ef4444" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-neutral-500">Monthly Recurring</span>
                        <span className="font-semibold">{formatINR(healthQuery.data.monthlyRecurring)}</span>
                      </div>
                      <SparkLine value={healthQuery.data.monthlyRecurring} max={healthQuery.data.income || healthQuery.data.monthlyRecurring} color="#f59e0b" />
                    </div>
                  </div>
                )}
              </div>

              {/* Quick KPIs */}
              <div className="grid grid-cols-2 gap-3">
                <InsightCard
                  icon="💰"
                  label="Savings Rate"
                  value={healthQuery.data ? `${healthQuery.data.savingsRate}%` : "—"}
                  sub="of income saved this month"
                  color={
                    (healthQuery.data?.savingsRate ?? 0) > 20
                      ? "#10b981"
                      : (healthQuery.data?.savingsRate ?? 0) > 0
                      ? "#f59e0b"
                      : "#ef4444"
                  }
                />
                <InsightCard
                  icon="🔁"
                  label="Fixed Costs"
                  value={healthQuery.data ? `${healthQuery.data.recurringAsPercentOfIncome}%` : "—"}
                  sub="of income in recurring payments"
                  color={(healthQuery.data?.recurringAsPercentOfIncome ?? 0) < 40 ? "#3b82f6" : "#f59e0b"}
                />
              </div>
            </div>

            {/* Right: AI explanation */}
            <div className="space-y-4">
              <SectionHeader
                icon="🤖"
                title="AI Assessment"
                subtitle="Personalized analysis of your financial position"
              />
              <AIExplanationBubble
                text={healthQuery.data?.explanation}
                loading={healthQuery.isLoading}
                error={healthQuery.isError}
              />

              {/* Spending overview mini-card from spending query */}
              {spendingQuery.data && (
                <div className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-black">This Month's Top Categories</h3>
                  <div className="space-y-3">
                    {(spendingQuery.data.topCategories ?? []).slice(0, 5).map((cat) => (
                      <div key={cat.category}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-neutral-700 font-medium">{cat.category}</span>
                          <span className="text-neutral-500 flex items-center gap-1">
                            {formatINR(cat.current)}
                            {cat.change !== null && (
                              <span
                                className={`ml-1 ${cat.change > 0 ? "text-red-500" : "text-emerald-600"}`}
                              >
                                {cat.change > 0 ? "▲" : "▼"} {Math.abs(cat.change).toFixed(0)}%
                              </span>
                            )}
                          </span>
                        </div>
                        <SparkLine
                          value={cat.current}
                          max={spendingQuery.data.topCategories[0]?.current || cat.current}
                          color="#6366f1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SPENDING ANALYST TAB ─────────────────────────────────────────── */}
        {activeTab === "spending" && (
          <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
            <div className="space-y-5">
              <SectionHeader
                icon="📊"
                title="Monthly Spending Analyst"
                subtitle={`${spendingQuery.data?.currentMonth?.name ?? "Current"} vs ${spendingQuery.data?.previousMonth?.name ?? "Previous"} month`}
              />

              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-3">
                <InsightCard
                  icon="📉"
                  label={`${spendingQuery.data?.currentMonth?.name ?? "This Month"}`}
                  value={spendingQuery.data ? formatINR(spendingQuery.data.currentMonth.totalExpenses) : "—"}
                  sub="Total expenses"
                  color="#ef4444"
                />
                <InsightCard
                  icon="📆"
                  label={`${spendingQuery.data?.previousMonth?.name ?? "Last Month"}`}
                  value={spendingQuery.data ? formatINR(spendingQuery.data.previousMonth.totalExpenses) : "—"}
                  sub="Total expenses"
                  color="#6366f1"
                />
                <InsightCard
                  icon="💵"
                  label="Income"
                  value={spendingQuery.data ? formatINR(spendingQuery.data.currentMonth.totalIncome) : "—"}
                  sub="This month"
                  color="#10b981"
                />
                <InsightCard
                  icon="🔢"
                  label="Transactions"
                  value={spendingQuery.data?.currentMonth?.transactionCount ?? "—"}
                  sub="This month"
                  color="#f59e0b"
                  pulse={false}
                />
              </div>

              {/* Month-over-month change */}
              {spendingQuery.data?.changePercent !== null && spendingQuery.data?.changePercent !== undefined && (
                <div
                  className={`rounded-2xl border p-4 flex items-center gap-3 ${
                    spendingQuery.data.changePercent > 0
                      ? "border-red-100 bg-red-50"
                      : "border-emerald-100 bg-emerald-50"
                  }`}
                >
                  <span className="text-2xl">
                    {spendingQuery.data.changePercent > 0 ? "📈" : "📉"}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-black">
                      {spendingQuery.data.changePercent > 0 ? "Up" : "Down"}{" "}
                      {Math.abs(spendingQuery.data.changePercent).toFixed(1)}% vs last month
                    </p>
                    <p className="text-xs text-neutral-500">
                      {spendingQuery.data.changePercent > 0
                        ? "Your spending increased this month"
                        : "You spent less than last month — well done!"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-5">
              <AIExplanationBubble
                text={spendingQuery.data?.explanation}
                loading={spendingQuery.isLoading}
                error={spendingQuery.isError}
              />

              {/* Category breakdown */}
              {spendingQuery.data?.topCategories?.length > 0 && (
                <div className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-black">Category Breakdown</h3>
                  <div className="space-y-3">
                    {spendingQuery.data.topCategories.map((cat) => (
                      <div key={cat.category} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-neutral-800">{cat.category}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-neutral-500">{formatINR(cat.previous)} prev</span>
                            <span className="font-semibold text-black">{formatINR(cat.current)}</span>
                            {cat.change !== null && (
                              <span
                                className={`font-medium ${
                                  cat.change > 0 ? "text-red-500" : "text-emerald-600"
                                }`}
                              >
                                {cat.change > 0 ? "+" : ""}{cat.change.toFixed(0)}%
                              </span>
                            )}
                          </div>
                        </div>
                        <SparkLine
                          value={cat.current}
                          max={spendingQuery.data.topCategories[0]?.current || 1}
                          color="#6366f1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── UNUSUAL ACTIVITY TAB ─────────────────────────────────────────── */}
        {activeTab === "unusual" && (
          <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
            <div className="space-y-5">
              <SectionHeader
                icon="🔍"
                title="Unusual Spending Detection"
                subtitle="Transactions that stand out vs your historical patterns"
              />

              {unusualQuery.isLoading && (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 rounded-2xl bg-neutral-100 animate-pulse" />
                  ))}
                </div>
              )}

              {unusualQuery.isError && (
                <p className="text-sm text-red-500 rounded-2xl border border-red-100 bg-red-50 p-4">
                  ⚠️ Could not analyze transactions. Ensure the backend is running.
                </p>
              )}

              {unusualQuery.data && !unusualQuery.data.hasEnoughData && (
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 text-center">
                  <p className="text-3xl mb-2">📝</p>
                  <p className="text-sm font-medium text-neutral-600">
                    Not enough transaction history yet. Add more transactions to unlock this feature.
                  </p>
                </div>
              )}

              {unusualQuery.data?.hasEnoughData && unusualQuery.data.anomalies.length === 0 && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 text-center">
                  <p className="text-3xl mb-2">✅</p>
                  <p className="text-sm font-medium text-emerald-700">
                    No unusual spending detected this month. Your patterns look normal!
                  </p>
                </div>
              )}

              {unusualQuery.data?.anomalies?.map((anomaly) => (
                <div
                  key={anomaly._id}
                  className="rounded-2xl border border-amber-100 bg-amber-50 p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-neutral-800">{anomaly.title}</p>
                      <p className="text-xs text-neutral-500">{anomaly.category}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-amber-700">{formatINRDecimal(anomaly.amount)}</p>
                      <p className="text-xs text-red-500 font-medium">+{anomaly.overByPercent}% above avg</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <span>Usual avg: {formatINR(anomaly.historicalAvg)}</span>
                    <span>·</span>
                    <span>{new Date(anomaly.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <AIExplanationBubble
                text={unusualQuery.data?.explanation}
                loading={unusualQuery.isLoading}
                error={unusualQuery.isError}
              />
              {unusualQuery.data?.analyzedCount !== undefined && (
                <p className="text-xs text-neutral-400 px-1">
                  Analyzed {unusualQuery.data.analyzedCount} transactions from the last 90 days.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── RECURRING FORECAST TAB ──────────────────────────────────────── */}
        {activeTab === "forecast" && (
          <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
            <div className="space-y-5">
              <SectionHeader
                icon="📅"
                title="Recurring Payment Forecast"
                subtitle="Upcoming commitments and monthly cost breakdown"
              />

              <div className="grid grid-cols-2 gap-3">
                <InsightCard
                  icon="🔁"
                  label="Monthly Total"
                  value={forecastQuery.data ? formatINR(forecastQuery.data.totalMonthly) : "—"}
                  sub="Estimated monthly outflow"
                  color="#6366f1"
                />
                <InsightCard
                  icon="📋"
                  label="Active"
                  value={forecastQuery.data?.totalCount ?? "—"}
                  sub="Recurring commitments"
                  color="#3b82f6"
                />
              </div>

              {forecastQuery.data?.overdueCount > 0 && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex items-center gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <p className="text-sm font-semibold text-red-700">
                      {forecastQuery.data.overdueCount} overdue payment{forecastQuery.data.overdueCount !== 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-red-500">Action required to avoid late fees</p>
                  </div>
                </div>
              )}

              {forecastQuery.isLoading && (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 rounded-2xl bg-neutral-100 animate-pulse" />
                  ))}
                </div>
              )}

              {forecastQuery.data?.dueThisWeek?.length === 0 && !forecastQuery.isLoading && (
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 text-center">
                  <p className="text-3xl mb-1">🎉</p>
                  <p className="text-sm text-neutral-500">Nothing due this week!</p>
                </div>
              )}

              {forecastQuery.data?.dueThisWeek?.map((item) => (
                <div
                  key={item._id}
                  className="rounded-2xl border border-neutral-200 bg-white p-4 flex items-center gap-3 hover:shadow-sm transition-shadow"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl">
                    📅
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-800 truncate">{item.name}</p>
                    <p className="text-xs text-neutral-500">
                      {daysFromNow(item.nextDueDate)}
                      {item.autoPay && (
                        <span className="ml-2 rounded-full bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[10px] text-emerald-700 font-medium">
                          Auto-Pay
                        </span>
                      )}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-black shrink-0">{formatINRDecimal(item.amount)}</p>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <AIExplanationBubble
                text={forecastQuery.data?.explanation}
                loading={forecastQuery.isLoading}
                error={forecastQuery.isError}
              />

              {forecastQuery.data && (
                <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                  <h3 className="text-sm font-semibold mb-4">Quick Tips</h3>
                  <ul className="space-y-3 text-sm text-neutral-600">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">✓</span>
                      Enable auto-pay for regular EMIs and subscriptions to avoid late charges.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">✓</span>
                      Keep{" "}
                      {formatINR(Math.round(forecastQuery.data.totalMonthly * 1.1))} in your account
                      as a buffer for upcoming commitments.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">✓</span>
                      Review annual subscriptions — paying yearly often saves 15–20%.
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
