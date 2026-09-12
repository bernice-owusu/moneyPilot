import React, { useState } from 'react';
import { 
  CalendarClock, 
  Plus, 
  Check, 
  Trash2, 
  Sparkles, 
  AlertCircle, 
  Clock, 
  Building2, 
  Smartphone, 
  Tv, 
  Wifi, 
  Zap,
  CheckCircle2
} from 'lucide-react';
import { RecurringItem, ExpenseCategory, PaymentMethod, Transaction } from '../types';
import { ALL_CATEGORIES } from '../utils/finance';

interface RecurringBillsViewProps {
  recurringItems: RecurringItem[];
  currency: string;
  onSaveRecurringItem: (item: RecurringItem) => void;
  onDeleteRecurringItem: (itemId: string) => void;
  onMarkAsPaid: (item: RecurringItem) => void;
}

export const RecurringBillsView: React.FC<RecurringBillsViewProps> = ({
  recurringItems,
  currency,
  onSaveRecurringItem,
  onDeleteRecurringItem,
  onMarkAsPaid
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Utilities');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');
  const [dueDay, setDueDay] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('MTN MoMo');
  const [isAutoDeduct, setIsAutoDeduct] = useState(false);

  const totalMonthlyCommitment = recurringItems.reduce((sum, item) => {
    if (item.billingCycle === 'monthly') return sum + item.amount;
    if (item.billingCycle === 'weekly') return sum + (item.amount * 4.33);
    if (item.billingCycle === 'yearly' || item.billingCycle === 'annual') return sum + (item.amount / 12);
    return sum + item.amount;
  }, 0);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || !name.trim()) return;

    const newItem: RecurringItem = {
      id: `rec-${Date.now()}`,
      name: name.trim(),
      amount: num,
      category,
      billingCycle,
      dueDay: Number(dueDay) || 1,
      paymentMethod,
      isAutoDeduct,
      isPaidThisPeriod: false
    };

    onSaveRecurringItem(newItem);
    setShowAddModal(false);
    setName('');
    setAmount('');
  };

  const getIconForCategory = (cat: ExpenseCategory) => {
    if (cat === 'Utilities') return <Zap className="w-4 h-4 text-amber-500" />;
    if (cat === 'Entertainment & Leisure') return <Tv className="w-4 h-4 text-purple-500" />;
    if (cat === 'Housing & Rent') return <Building2 className="w-4 h-4 text-cyan-500" />;
    if (cat === 'Airtime & Data') return <Wifi className="w-4 h-4 text-deep-blue" />;
    return <Smartphone className="w-4 h-4 text-muted-gray" />;
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 dash-card">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-ink flex flex-wrap items-center gap-2">
            <span>Recurring Bills & Subscriptions</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-soft-gray text-ink/80 border border-ink/10 font-semibold">
              {recurringItems.length} active bills
            </span>
          </h2>
          <p className="text-[11px] sm:text-xs text-muted-gray mt-0.5">
            Fixed monthly obligations (Rent, ECG Power, MTN Fibre, Netflix, Tithes) automatically forecasted.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-sm bg-hero-blue/100 hover:bg-hero-blue text-slate-950 text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition touch-manipulation"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Recurring Bill</span>
        </button>
      </div>

      {/* Summary Card */}
      <div className="p-4 sm:p-6 dash-card bg-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] sm:text-xs font-bold text-deep-blue uppercase tracking-wider">
            Total Fixed Monthly Burn Rate
          </p>
          <p className="text-2xl sm:text-3xl font-black text-ink mt-1">
            {currency}{totalMonthlyCommitment.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-sm font-semibold text-muted-gray">/ mo</span>
          </p>
          <p className="text-[11px] sm:text-xs text-muted-gray mt-1">
            Pre-allocated before discretionary spending and personal savings.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:space-x-4 text-xs pt-2 sm:pt-0 border-t sm:border-0 border-ink/8">
          <div className="p-3 sm:p-3.5 rounded-sm bg-soft-gray/80 border border-ink/10">
            <span className="text-muted-gray block text-[10px] font-semibold">Paid this month:</span>
            <span className="text-xs sm:text-sm font-bold text-deep-blue">
              {recurringItems.filter(r => r.isPaidThisPeriod).length} of {recurringItems.length}
            </span>
          </div>
          <div className="p-3 sm:p-3.5 rounded-sm bg-soft-gray/80 border border-ink/10">
            <span className="text-muted-gray block text-[10px] font-semibold">Pending:</span>
            <span className="text-xs sm:text-sm font-bold text-amber-600">
              {recurringItems.filter(r => !r.isPaidThisPeriod).length} bills
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Bills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {recurringItems.map((item) => {
          return (
            <div 
              key={item.id}
              className={`p-4 sm:p-5 rounded-sm bg-white border transition shadow-sm space-y-3.5 ${
                item.isPaidThisPeriod ? 'border-hero-blue/30 bg-hero-blue/10/20' : 'border-ink/10 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3 min-w-0 pr-2">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-sm bg-soft-gray flex items-center justify-center border border-ink/10 shrink-0">
                    {getIconForCategory(item.category)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-ink flex items-center space-x-1.5 truncate">
                      <span className="truncate">{item.name}</span>
                      {item.isPaidThisPeriod && (
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-hero-blue/15 text-deep-blue border border-hero-blue/25 font-semibold shrink-0">
                          Paid
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-muted-gray truncate">
                      Due: <span className="font-semibold text-ink/80">Day {item.dueDay}</span> • {item.paymentMethod}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteRecurringItem(item.id)}
                  className="p-1.5 text-muted-gray hover:text-rose-500 hover:bg-rose-50 rounded-lg transition touch-manipulation shrink-0"
                  title="Remove recurring bill"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-ink/8 text-xs">
                <div>
                  <span className="text-muted-gray text-[11px]">Monthly Amount:</span>
                  <p className="text-sm sm:text-base font-black text-ink">
                    {currency}{item.amount.toLocaleString()}
                  </p>
                </div>

                {item.isPaidThisPeriod ? (
                  <div className="flex items-center space-x-1 text-deep-blue text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Settled</span>
                  </div>
                ) : (
                  <button
                    onClick={() => onMarkAsPaid(item)}
                    className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-sm bg-hero-blue/100 hover:bg-hero-blue text-slate-950 text-xs font-bold shadow-sm flex items-center space-x-1.5 transition active:scale-98 touch-manipulation"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Mark Paid</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs">
          <div className="bg-white border border-ink/10 rounded-sm w-full max-w-md p-6 shadow-xl text-ink">
            <h3 className="text-base font-bold text-ink mb-1">Add Recurring Bill / Sub</h3>
            <p className="text-xs text-muted-gray mb-4">Add your fixed rent, ECG token, internet or gym subscription.</p>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink/80 mb-1">Bill Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. ECG Power Prepaid, MTN Fibre Broadband, Rent"
                  className="w-full px-3 py-2 bg-soft-gray/80 border border-ink/10 rounded-sm text-xs text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">Amount ({currency}) *</label>
                  <input
                    type="number"
                    step="10"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="300"
                    className="w-full px-3 py-2 bg-soft-gray/80 border border-ink/10 rounded-sm text-xs text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">Due Day of Month</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={dueDay}
                    onChange={(e) => setDueDay(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-soft-gray/80 border border-ink/10 rounded-sm text-xs text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 bg-soft-gray/80 border border-ink/10 rounded-sm text-xs text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    {ALL_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-soft-gray/80 border border-ink/10 rounded-sm text-xs text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    <option value="MTN MoMo">MTN MoMo</option>
                    <option value="Telecel Cash">Telecel Cash</option>
                    <option value="Bank Account">Stanbic Bank / Bank</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Cash Wallet">Cash</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-sm text-xs font-semibold text-muted-gray hover:bg-soft-gray"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-sm bg-hero-blue/100 hover:bg-hero-blue text-slate-950 text-xs font-bold shadow-sm"
                >
                  Save Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

