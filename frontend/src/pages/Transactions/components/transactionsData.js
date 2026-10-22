export const sampleTransactions = [
  {
    id: 1,
    title: "Freelance UI Design",
    category: "Salary / Income",
    date: "2026-10-21",
    paymentMethod: "Bank Transfer",
    type: "income",
    amount: 15000,
    note: "Mobile app mockup milestone",
  },
  {
    id: 2,
    title: "Fuel - Shell Petrol Pump",
    category: "Transportation",
    date: "2026-10-20",
    paymentMethod: "Debit Card",
    type: "expense",
    amount: 2500,
    note: "Car full tank",
  },
  {
    id: 3,
    title: "Blue Tokai Coffee & Bakery",
    category: "Food & Dining",
    date: "2026-10-18",
    paymentMethod: "UPI",
    type: "expense",
    amount: 680,
    note: "Team coffee hangout",
  },
  {
    id: 4,
    title: "Nature Basket Supermarket",
    category: "Groceries",
    date: "2026-10-12",
    paymentMethod: "Credit Card",
    type: "expense",
    amount: 3450,
    note: "Bi-weekly groceries",
  },
  {
    id: 5,
    title: "Apartment Rent",
    category: "Bills & Utilities",
    date: "2026-10-05",
    paymentMethod: "UPI",
    type: "expense",
    amount: 22000,
    note: "House rent paid via UPI",
  },
  {
    id: 6,
    title: "Monthly Salary Credit",
    category: "Salary / Income",
    date: "2026-10-01",
    paymentMethod: "Net Banking",
    type: "income",
    amount: 85000,
    note: "October company payroll",
  },
];

const categoryColors = {
  "Bills & Utilities": "#C9D0FA",
  Groceries: "#F3B29D",
  Transportation: "#B9E2F3",
  "Food & Dining": "#EDE7D9",
  Income: "#BDF0D9",
};

const categoryOrder = [
  "Bills & Utilities",
  "Groceries",
  "Transportation",
  "Food & Dining",
  "Income",
];

// Calculate the breakdown automatically from the transactions.
export const sampleBreakdown = (() => {
  const totals = {};

  sampleTransactions.forEach((transaction) => {
    const category =
      transaction.type === "income"
        ? "Income"
        : transaction.category;

    totals[category] =
      (totals[category] || 0) + Math.abs(transaction.amount);
  });

  const totalAmount = Object.values(totals).reduce(
    (sum, amount) => sum + amount,
    0
  );

  return categoryOrder
    .filter((category) => totals[category] !== undefined)
    .map((category) => ({
      category,
      amount: totals[category],
      percentage:
        totalAmount > 0 ? (totals[category] / totalAmount) * 100 : 0,
      color: categoryColors[category],
    }));
})();