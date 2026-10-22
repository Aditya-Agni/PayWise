import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrorHandler.js";
import { ApiResponse } from "../utils/ApiResponseHandler.js";
import { Transaction } from "../models/transactions.model.js";
import { RecurringPayment } from "../models/recurringPayment.model.js";
import { generateText } from "../services/gemini.service.js";

// ─── helpers ────────────────────────────────────────────────────────────────

function formatINR(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function getCurrentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

function getPreviousMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  return { start, end };
}

function groupByCategory(transactions) {
  const result = {};
  for (const t of transactions) {
    const cat = t.category || "Other";
    result[cat] = (result[cat] || 0) + (t.amount || 0);
  }
  return result;
}

/**
 * Strip all markdown formatting from AI output so it renders as clean plain text.
 */
function cleanText(raw) {
  if (!raw || typeof raw !== "string") return "";
  return raw
    // Remove bold/italic markers (**text**, *text*, __text__, _text_)
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    // Remove heading markers (# ## ###)
    .replace(/^#{1,6}\s+/gm, "")
    // Remove bullet/list markers (- item, * item, • item)
    .replace(/^[\-\*•]\s+/gm, "")
    // Remove numbered list markers (1. item)
    .replace(/^\d+\.\s+/gm, "")
    // Remove backtick code spans
    .replace(/`([^`]+)`/g, "$1")
    // Remove link markdown [text](url)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Collapse multiple newlines into two max
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const PLAIN_TEXT_INSTRUCTION =
  "IMPORTANT: Respond in plain prose only. Do NOT use markdown, bullet points, bold, italics, headers, numbered lists, or any special formatting characters. Write naturally flowing sentences as if speaking to someone.";

// ─── controllers ────────────────────────────────────────────────────────────

/**
 * @desc    AI spending analyst: explains current-month spending vs previous month
 * @route   POST /api/v1/ai/spending-analysis
 * @access  Private
 */
export const spendingAnalysis = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw new ApiError(401, "Authentication required");

  const { start: currStart, end: currEnd } = getCurrentMonthRange();
  const { start: prevStart, end: prevEnd } = getPreviousMonthRange();

  const [currTxns, prevTxns] = await Promise.all([
    Transaction.find({ user: userId, date: { $gte: currStart, $lte: currEnd } }).lean(),
    Transaction.find({ user: userId, date: { $gte: prevStart, $lte: prevEnd } }).lean(),
  ]);

  const currExpenses = currTxns.filter((t) => t.type === "expense");
  const prevExpenses = prevTxns.filter((t) => t.type === "expense");

  const currTotal = currExpenses.reduce((s, t) => s + (t.amount || 0), 0);
  const prevTotal = prevExpenses.reduce((s, t) => s + (t.amount || 0), 0);
  const currIncome = currTxns.filter((t) => t.type === "income").reduce((s, t) => s + (t.amount || 0), 0);

  const currCategories = groupByCategory(currExpenses);
  const prevCategories = groupByCategory(prevExpenses);

  const topCategories = Object.entries(currCategories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat, amount]) => ({
      category: cat,
      current: amount,
      previous: prevCategories[cat] || 0,
      change: prevCategories[cat] ? ((amount - prevCategories[cat]) / prevCategories[cat]) * 100 : null,
    }));

  const now = new Date();
  const monthName = now.toLocaleString("en-IN", { month: "long" });
  const prevMonthName = new Date(now.getFullYear(), now.getMonth() - 1, 1).toLocaleString("en-IN", { month: "long" });

  const changeStr =
    prevTotal > 0
      ? `${((currTotal - prevTotal) / prevTotal * 100).toFixed(1)}% compared to last month`
      : "no prior month data to compare";

  const catSummary = topCategories
    .map((c) => `${c.category}: ${formatINR(c.current)}${c.change !== null ? ` (${c.change > 0 ? "up" : "down"} ${Math.abs(c.change).toFixed(0)}% vs last month)` : ""}`)
    .join(", ");

  const prompt = `${PLAIN_TEXT_INSTRUCTION}

You are PayWise Intelligence, a friendly personal finance assistant for Indian users.

The user's ${monthName} spending data:
- Total expenses: ${formatINR(currTotal)} (${changeStr})
- Total income recorded: ${formatINR(currIncome)}
- Previous month (${prevMonthName}) expenses: ${formatINR(prevTotal)}
- Number of expense transactions: ${currExpenses.length}
- Top categories: ${catSummary || "no category data yet"}

Write 3 short sentences. Briefly explain the spending pattern, highlight the biggest change, and give one specific savings tip relevant to India (like UPI cashback, avoiding convenience fees, etc.). Keep the tone warm and conversational.`;

  const rawText = await generateText(prompt, {
    temperature: 0.65,
    maxOutputTokens: 700,
    systemInstruction: "You are a financial assistant. Always respond in plain prose only — no markdown, no asterisks, no bullet points, no bold, no numbered lists, no special characters. Write in complete, natural sentences.",
  });

  const explanation = cleanText(rawText);

  return res.status(200).json(
    new ApiResponse(200, "Spending analysis generated", {
      currentMonth: {
        name: monthName,
        totalExpenses: currTotal,
        totalIncome: currIncome,
        transactionCount: currExpenses.length,
      },
      previousMonth: {
        name: prevMonthName,
        totalExpenses: prevTotal,
      },
      topCategories,
      changePercent: prevTotal > 0 ? parseFloat(((currTotal - prevTotal) / prevTotal * 100).toFixed(1)) : null,
      explanation,
    })
  );
});

/**
 * @desc    Detect unusual/anomalous transactions using AI
 * @route   POST /api/v1/ai/unusual-spending
 * @access  Private
 */
export const unusualSpending = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw new ApiError(401, "Authentication required");

  const since = new Date();
  since.setDate(since.getDate() - 90);

  const transactions = await Transaction.find({
    user: userId,
    date: { $gte: since },
    type: "expense",
  })
    .sort({ date: -1 })
    .lean();

  if (transactions.length < 3) {
    return res.status(200).json(
      new ApiResponse(200, "Not enough data", {
        anomalies: [],
        explanation: "Add more transactions to get unusual spending insights. You need at least a few weeks of data for pattern detection to work.",
        hasEnoughData: false,
      })
    );
  }

  const now = new Date();
  const currMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const historicalTxns = transactions.filter((t) => new Date(t.date) < currMonthStart);
  const currentTxns = transactions.filter((t) => new Date(t.date) >= currMonthStart);

  const catHistory = {};
  for (const t of historicalTxns) {
    const cat = t.category || "Other";
    if (!catHistory[cat]) catHistory[cat] = [];
    catHistory[cat].push(t.amount || 0);
  }

  const catStats = {};
  for (const [cat, amounts] of Object.entries(catHistory)) {
    const avg = amounts.reduce((s, a) => s + a, 0) / amounts.length;
    const stdDev = Math.sqrt(amounts.reduce((s, a) => s + Math.pow(a - avg, 2), 0) / amounts.length);
    catStats[cat] = { avg, stdDev, count: amounts.length };
  }

  const anomalies = [];
  for (const t of currentTxns) {
    const cat = t.category || "Other";
    const stats = catStats[cat];
    if (!stats) continue;
    const zScore = stats.stdDev > 0 ? (t.amount - stats.avg) / stats.stdDev : 0;
    if (zScore > 1.5 || t.amount > stats.avg * 2.5) {
      anomalies.push({
        _id: t._id,
        title: t.title,
        amount: t.amount,
        category: cat,
        date: t.date,
        historicalAvg: Math.round(stats.avg),
        zScore: zScore.toFixed(1),
        overByPercent: Math.round(((t.amount - stats.avg) / stats.avg) * 100),
      });
    }
  }

  anomalies.sort((a, b) => b.amount - a.amount);
  const topAnomalies = anomalies.slice(0, 5);

  let explanation = "No unusual spending detected this month. Your spending looks consistent with your normal patterns — great discipline!";

  if (topAnomalies.length > 0) {
    const listStr = topAnomalies
      .map((a) => `${a.title} (${a.category}): ${formatINR(a.amount)}, which is ${a.overByPercent}% above your usual ${formatINR(a.historicalAvg)}`)
      .join("; ");

    const prompt = `${PLAIN_TEXT_INSTRUCTION}

You are PayWise Intelligence, a friendly AI financial assistant for Indian users.

These transactions appear unusually high compared to the user's historical spending: ${listStr}.

Write 2 to 3 natural sentences. Name which transactions look unusual, give a possible reason (like a one-time purchase or seasonal expense), and suggest one practical action. Keep the tone calm and helpful, not alarming.`;

    const rawText = await generateText(prompt, {
      temperature: 0.6,
      maxOutputTokens: 600,
      systemInstruction: "You are a financial assistant. Always respond in plain prose only — no markdown, no asterisks, no bullet points, no bold, no numbered lists, no special characters. Write in complete, natural sentences.",
    });
    explanation = cleanText(rawText);
  }

  return res.status(200).json(
    new ApiResponse(200, "Unusual spending analysis complete", {
      anomalies: topAnomalies,
      explanation,
      hasEnoughData: true,
      analyzedCount: transactions.length,
    })
  );
});

/**
 * @desc    Predict upcoming recurring payment costs and give advice
 * @route   POST /api/v1/ai/recurring-forecast
 * @access  Private
 */
export const recurringForecast = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw new ApiError(401, "Authentication required");

  const recurringPayments = await RecurringPayment.find({ user: userId, status: "active" })
    .sort({ nextDueDate: 1 })
    .lean();

  if (recurringPayments.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, "No recurring payments", {
        totalMonthly: 0,
        dueThisWeek: [],
        explanation: "No active recurring payments found. Go to Recurring & Bills to add your subscriptions, EMIs, and utility bills so PayWise can track and forecast them for you.",
        hasData: false,
      })
    );
  }

  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const dueThisWeek = recurringPayments.filter((p) => {
    const due = new Date(p.nextDueDate);
    return due >= now && due <= nextWeek;
  });

  const overduePayments = recurringPayments.filter((p) => new Date(p.nextDueDate) < now);

  let totalMonthly = 0;
  for (const p of recurringPayments) {
    const amount = p.amount || 0;
    const freq = (p.frequency || "monthly").toLowerCase();
    if (freq === "yearly") totalMonthly += amount / 12;
    else if (freq === "weekly") totalMonthly += amount * 4.33;
    else if (freq === "daily") totalMonthly += amount * 30;
    else totalMonthly += amount;
  }

  const thisWeekTotal = dueThisWeek.reduce((s, p) => s + (p.amount || 0), 0);

  const dueSoonStr = dueThisWeek.length > 0
    ? dueThisWeek.map((p) => {
        const diff = Math.ceil((new Date(p.nextDueDate) - now) / (1000 * 60 * 60 * 24));
        return `${p.name} (${formatINR(p.amount)}) in ${diff} day${diff !== 1 ? "s" : ""}`;
      }).join(", ")
    : "nothing due this week";

  const overdueStr = overduePayments.length > 0
    ? overduePayments.map((p) => `${p.name} (${formatINR(p.amount)})`).join(", ")
    : "no overdue payments";

  const prompt = `${PLAIN_TEXT_INSTRUCTION}

You are PayWise Intelligence, a friendly AI financial assistant for Indian users.

The user has ${recurringPayments.length} active recurring commitments totaling ${formatINR(Math.round(totalMonthly))} per month.
Due this week: ${dueSoonStr}. Total due this week: ${formatINR(thisWeekTotal)}.
Overdue: ${overdueStr}.

Write 2 to 3 natural sentences. Mention the monthly commitment total, flag anything urgent this week, and give one practical tip such as enabling auto-pay or keeping a buffer in the account.`;

  const rawText = await generateText(prompt, {
    temperature: 0.65,
    maxOutputTokens: 600,
    systemInstruction: "You are a financial assistant. Always respond in plain prose only — no markdown, no asterisks, no bullet points, no bold, no numbered lists, no special characters. Write in complete, natural sentences.",
  });
  const explanation = cleanText(rawText);

  return res.status(200).json(
    new ApiResponse(200, "Recurring forecast generated", {
      totalMonthly: Math.round(totalMonthly),
      totalCount: recurringPayments.length,
      dueThisWeek: dueThisWeek.map((p) => ({
        _id: p._id,
        name: p.name,
        amount: p.amount,
        nextDueDate: p.nextDueDate,
        autoPay: p.autoPay,
        daysUntilDue: Math.ceil((new Date(p.nextDueDate) - now) / (1000 * 60 * 60 * 24)),
      })),
      overdueCount: overduePayments.length,
      explanation,
      hasData: true,
    })
  );
});

/**
 * @desc    Generate a complete financial health summary
 * @route   POST /api/v1/ai/financial-health
 * @access  Private
 */
export const financialHealth = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw new ApiError(401, "Authentication required");

  const { start: currStart, end: currEnd } = getCurrentMonthRange();

  const [currTxns, recurringPayments] = await Promise.all([
    Transaction.find({ user: userId, date: { $gte: currStart, $lte: currEnd } }).lean(),
    RecurringPayment.find({ user: userId, status: "active" }).lean(),
  ]);

  const income = currTxns.filter((t) => t.type === "income").reduce((s, t) => s + (t.amount || 0), 0);
  const expenses = currTxns.filter((t) => t.type === "expense").reduce((s, t) => s + (t.amount || 0), 0);
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

  let monthlyRecurring = 0;
  for (const p of recurringPayments) {
    const freq = (p.frequency || "monthly").toLowerCase();
    const amt = p.amount || 0;
    if (freq === "yearly") monthlyRecurring += amt / 12;
    else if (freq === "weekly") monthlyRecurring += amt * 4.33;
    else if (freq === "daily") monthlyRecurring += amt * 30;
    else monthlyRecurring += amt;
  }

  const recurringAsPercentOfIncome = income > 0 ? (monthlyRecurring / income) * 100 : 0;

  // Heuristic score 0–100
  let score = 50;
  if (savingsRate > 30) score += 20;
  else if (savingsRate > 20) score += 15;
  else if (savingsRate > 10) score += 8;
  else if (savingsRate < 0) score -= 20;

  if (recurringAsPercentOfIncome < 30) score += 15;
  else if (recurringAsPercentOfIncome > 60) score -= 15;

  if (currTxns.length > 5) score += 5;

  score = Math.max(0, Math.min(100, score));

  let healthLabel = "Fair";
  if (score >= 80) healthLabel = "Excellent";
  else if (score >= 65) healthLabel = "Good";
  else if (score >= 45) healthLabel = "Fair";
  else healthLabel = "Needs Attention";

  const now = new Date();
  const monthName = now.toLocaleString("en-IN", { month: "long" });

  const prompt = `${PLAIN_TEXT_INSTRUCTION}

You are PayWise Intelligence, a friendly AI financial coach for Indian users.

The user's ${monthName} snapshot:
- Income: ${formatINR(income)}
- Expenses: ${formatINR(expenses)}
- Savings rate: ${savingsRate.toFixed(1)}%
- Monthly recurring commitments: ${formatINR(Math.round(monthlyRecurring))} (${recurringAsPercentOfIncome.toFixed(1)}% of income)
- Active recurring payments: ${recurringPayments.length}
- Financial health score: ${score} out of 100 (${healthLabel})

Write 3 natural sentences as a warm, encouraging financial coach. Comment on the savings rate and recurring cost burden, then give one specific actionable suggestion relevant to India such as starting a SIP, building an emergency fund of 3 to 6 months of expenses, or switching to annual billing for subscriptions.`;

  const rawText = await generateText(prompt, {
    temperature: 0.65,
    maxOutputTokens: 800,
    systemInstruction: "You are a financial assistant. Always respond in plain prose only — no markdown, no asterisks, no bullet points, no bold, no numbered lists, no special characters. Write in complete, natural sentences.",
  });

  const explanation = cleanText(rawText);

  return res.status(200).json(
    new ApiResponse(200, "Financial health report generated", {
      score,
      healthLabel,
      income,
      expenses,
      savingsRate: parseFloat(savingsRate.toFixed(1)),
      monthlyRecurring: Math.round(monthlyRecurring),
      recurringAsPercentOfIncome: parseFloat(recurringAsPercentOfIncome.toFixed(1)),
      explanation,
    })
  );
});
