export const paymentMethods = ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cash', 'Other'];

export const expenseCategories = [
  'Food & Dining',
  'Groceries',
  'Transport',
  'Bills & Utilities',
  'Shopping',
  'Health',
  'Entertainment',
  'Other',
];

export const incomeCategories = ['Salary', 'Freelance', 'Business', 'Investment', 'Other'];

export const transactionCategories = [...new Set([...expenseCategories, ...incomeCategories])];
