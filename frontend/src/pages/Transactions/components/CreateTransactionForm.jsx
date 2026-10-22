import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createTransaction, updateTransaction } from '../../../services/api.js';
import { expenseCategories, incomeCategories, paymentMethods } from './transactionOptions.js';
const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = () => ({ title: '', amount: '', type: 'expense', category: '', paymentMethod: 'UPI', date: today(), notes: '' });
const formFromTransaction = (transaction) => transaction ? {
  title: transaction.title || '', amount: String(transaction.amount ?? ''), type: transaction.type || 'expense',
  category: transaction.category || '', paymentMethod: transaction.paymentMethod || 'UPI',
  date: transaction.date ? new Date(transaction.date).toISOString().slice(0, 10) : today(), notes: transaction.notes || '',
} : emptyForm();

function SelectField({ children, ...props }) {
  return <div className="group relative"><select {...props} className="w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 py-2.5 pr-11 text-sm font-medium text-neutral-800 shadow-sm outline-none transition hover:border-neutral-400 focus:border-black focus:ring-2 focus:ring-black/10">{children}</select><span aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md bg-neutral-100 text-neutral-600 transition group-hover:bg-neutral-200"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5"><path d="m4 6 4 4 4-4" /></svg></span></div>;
}

export default function CreateTransactionForm({ transaction, onCreated, onClose }) {
  const dialogRef = useRef(null);
  const isEditing = Boolean(transaction);
  const [form, setForm] = useState(() => formFromTransaction(transaction));
  const categories = form.type === 'income' ? incomeCategories : expenseCategories;
  const saveMutation = useMutation({
    mutationFn: (details) => isEditing ? updateTransaction(transaction._id || transaction.id, details) : createTransaction(details),
    onSuccess: onCreated,
  });

  useEffect(() => { if (dialogRef.current && !dialogRef.current.open) dialogRef.current.showModal(); }, []);

  const updateField = ({ target: { name, value } }) => setForm((current) => ({ ...current, [name]: value, ...(name === 'type' ? { category: '' } : {}) }));
  const handleSubmit = (event) => { event.preventDefault(); saveMutation.mutate({ ...form, amount: Number(form.amount) }); };

  return (
    <dialog ref={dialogRef} onClose={onClose} className="w-[calc(100%-2rem)] max-w-2xl rounded-2xl border border-neutral-200 bg-white p-0 text-black shadow-2xl backdrop:bg-black/40">
      <section className="max-h-[calc(100vh-4rem)] overflow-y-auto p-5 sm:p-6">
        <div className="mb-6 flex items-start justify-between gap-4"><div><h1 className="text-xl font-bold tracking-tight">{isEditing ? 'Edit transaction' : 'Add transaction'}</h1><p className="mt-1 text-sm text-neutral-600">{isEditing ? 'Update the details of this transaction.' : 'Record an income or expense for your account.'}</p></div><button type="button" onClick={onClose} aria-label="Close transaction form" className="grid h-9 w-9 place-items-center rounded-lg text-xl leading-none text-neutral-600 hover:bg-neutral-100 hover:text-black">×</button></div>
        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
          <label className="block md:col-span-2"><span className="mb-1.5 block text-sm font-medium">Title</span><input name="title" value={form.title} onChange={updateField} maxLength={100} required placeholder="e.g. Grocery shopping" className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black" /></label>
          <label className="block"><span className="mb-1.5 block text-sm font-medium">Amount</span><div className="flex rounded-lg border border-neutral-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black"><span className="border-r border-neutral-300 px-3 py-2.5 text-sm text-neutral-600">₹</span><input name="amount" type="number" min="0.01" step="0.01" value={form.amount} onChange={updateField} required placeholder="0.00" className="min-w-0 flex-1 rounded-r-lg px-3 py-2.5 text-sm outline-none" /></div></label>
          <fieldset><legend className="mb-1.5 text-sm font-medium">Type</legend><div className="grid grid-cols-2 rounded-lg border border-neutral-300 p-1">{['expense', 'income'].map((type) => <label key={type} className={`cursor-pointer rounded-md px-3 py-2 text-center text-sm font-medium capitalize ${form.type === type ? 'bg-black text-white' : 'text-neutral-600'}`}><input className="sr-only" type="radio" name="type" value={type} checked={form.type === type} onChange={updateField} />{type}</label>)}</div></fieldset>
          <label className="block"><span className="mb-1.5 block text-sm font-medium">Category</span><SelectField name="category" value={form.category} onChange={updateField} required><option value="" disabled>Select a category</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</SelectField></label>
          <label className="block"><span className="mb-1.5 block text-sm font-medium">Payment method</span><SelectField name="paymentMethod" value={form.paymentMethod} onChange={updateField}>{paymentMethods.map((method) => <option key={method} value={method}>{method}</option>)}</SelectField></label>
          <label className="block"><span className="mb-1.5 block text-sm font-medium">Date</span><input name="date" type="date" value={form.date} onChange={updateField} required style={{ colorScheme: 'light' }} className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black" /></label>
          <label className="block md:col-span-2"><span className="mb-1.5 block text-sm font-medium">Notes <span className="font-normal text-neutral-500">(optional)</span></span><textarea name="notes" value={form.notes} onChange={updateField} maxLength={500} rows={3} placeholder="Add any useful details" className="w-full resize-y rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black" /></label>
          {saveMutation.error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 md:col-span-2">{saveMutation.error.message}</p>}
          <div className="flex flex-wrap justify-end gap-3 md:col-span-2"><button type="button" onClick={onClose} disabled={saveMutation.isPending} className="rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-semibold hover:bg-neutral-100 disabled:opacity-60">Cancel</button>{!isEditing && <button type="button" onClick={() => setForm(emptyForm())} disabled={saveMutation.isPending} className="rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-semibold hover:bg-neutral-100 disabled:opacity-60">Clear</button>}<button type="submit" disabled={saveMutation.isPending} className="rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60">{saveMutation.isPending ? 'Saving…' : isEditing ? 'Save changes' : 'Save transaction'}</button></div>
        </form>
      </section>
    </dialog>
  );
}
