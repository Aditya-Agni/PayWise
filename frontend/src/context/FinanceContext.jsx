import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  getTransactions,
  createTransaction as apiCreateTransaction,
  updateTransaction as apiUpdateTransaction,
  deleteTransaction as apiDeleteTransaction,
  getRecurringPayments,
  createRecurringPayment as apiCreateRecurringPayment,
  updateRecurringPayment as apiUpdateRecurringPayment,
  deleteRecurringPayment as apiDeleteRecurringPayment,
  markRecurringPaymentPaid,
} from '../services/api.js';

const FinanceContext = createContext(null);

export function FinanceProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [recurringPayments, setRecurringPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refreshFinanceData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [transactionData, recurringData] = await Promise.all([getTransactions(), getRecurringPayments()]);
      setTransactions(transactionData);
      setRecurringPayments(recurringData);
    } catch (err) {
      setError(err.message || 'Could not load finance data.');
    } finally {
      setLoading(false);
    }
  }, []);

  const addTransaction = useCallback(async (details) => {
    const created = await apiCreateTransaction(details);
    setTransactions((current) => [created, ...current]);
    return created;
  }, []);

  const changeTransaction = useCallback(async (id, details) => {
    const updated = await apiUpdateTransaction(id, details);
    setTransactions((current) => current.map((item) => item.id === id ? updated : item));
    return updated;
  }, []);

  const removeTransaction = useCallback(async (id) => {
    await apiDeleteTransaction(id);
    setTransactions((current) => current.filter((item) => item.id !== id));
  }, []);

  const addRecurringPayment = useCallback(async (details) => {
    const created = await apiCreateRecurringPayment(details);
    setRecurringPayments((current) => [...current, created]);
    return created;
  }, []);

  const changeRecurringPayment = useCallback(async (id, details) => {
    const updated = await apiUpdateRecurringPayment(id, details);
    setRecurringPayments((current) => current.map((item) => item.id === id ? updated : item));
    return updated;
  }, []);

  const removeRecurringPayment = useCallback(async (id) => {
    await apiDeleteRecurringPayment(id);
    setRecurringPayments((current) => current.filter((item) => item.id !== id));
  }, []);

  const markRecurringPaid = useCallback(async (id, expectedDueDate) => {
    const result = await markRecurringPaymentPaid(id, expectedDueDate);
    setRecurringPayments((current) => current.map((item) => item.id === id ? result.recurringPayment : item));
    setTransactions((current) => [result.transaction, ...current]);
    return result;
  }, []);

  const value = useMemo(() => ({
    transactions,
    recurringPayments,
    loading,
    error,
    refreshFinanceData,
    addTransaction,
    updateTransaction: changeTransaction,
    deleteTransaction: removeTransaction,
    addRecurringPayment,
    updateRecurringPayment: changeRecurringPayment,
    deleteRecurringPayment: removeRecurringPayment,
    markRecurringPaid,
  }), [transactions, recurringPayments, loading, error, refreshFinanceData, addTransaction, changeTransaction, removeTransaction, addRecurringPayment, changeRecurringPayment, removeRecurringPayment, markRecurringPaid]);

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used inside FinanceProvider.');
  return context;
}
