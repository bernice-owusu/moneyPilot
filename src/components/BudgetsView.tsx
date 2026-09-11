import React, { useState } from 'react';
import { 
  Plus, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  ArrowRight,
  Sparkles,
  Calendar,
  Zap,
  Info,
  Layers
} from 'lucide-react';
import { Budget, Transaction, ExpenseCategory } from '../types';
import { ALL_CATEGORIES, CATEGORY_COLORS } from '../utils/finance';

interface BudgetsViewProps {
  budgets: Budget[];
  transactions: Transaction[];
  currency: string;
  monthlyIncome: number;
  onSaveBudget: (budget: Budget) => void;
  onDeleteBudget: (budgetId: string) => void;
  onNavigateToTab: (tab: any) => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  budgets,
  transactions,
  currency,
  monthlyIncome,
  onSaveBudget,
  onDeleteBudget,
  onNavigateToTab
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory>('Food & Dining');
  const [limitAmount, setLimitAmount] = useState('');
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);

  // Calculate days remaining in current month
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const currentDay = today.getDate();
  const daysRemaining = Math.max(1, daysInMonth - currentDay);

  // Aggregate spending per budget category
  const budgetStats = budgets.map(b => {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category === b.category)
      .reduce((sum, t) => sum + t.amount, 0);

    const percentUsed = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;
    const remaining = b.monthlyLimit - spent;
    const dailyAllowance = remaining > 0 ? (remaining / daysRemaining) : 0;

    return {
      ...b,
      spent,
      percentUsed,
      remaining,
      dailyAllowance,
      isOverspent: spent > b.monthlyLimit,
      isNearLimit: percentUsed >= 80 && percentUsed <= 100
    };
  });

  const totalBudgeted = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const totalSpentAcrossBudgets = budgetStats.reduce((sum, b) => sum + b.spent, 0);
  const totalRemainingAcrossBudgets = Math.max(0, totalBudgeted - totalSpentAcrossBudgets);
  const totalDailyAllowance = totalRemainingAcrossBudgets > 0 ? (totalRemainingAcrossBudgets / daysRemaining) : 0;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(limitAmount);
    if (!num || num <= 0) return;

    const newBudget: Budget = {
      id: editingBudgetId || `b-${Date.now()}`,
      category: selectedCategory,
      monthlyLimit: num,
      period: '2026-08'
    };

    onSaveBudget(newBudget);
    setShowAddModal(false);
    setLimitAmount('');
    setEditingBudgetId(null);
  };

  const handleEdit = (b: Budget) => {
    setEditingBudgetId(b.id);
    setSelectedCategory(b.category);
    setLimitAmount(b.monthlyLimit.toString());
    setShowAddModal(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      
      {/* Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2">
            <span>Category Budget Envelopes</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
              August 2026
            </span>
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Set spending targets per category. Track your live <strong>Daily Safe-Pacing Allowance</strong> to prevent end-of-month cash crunches.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-stretch sm:self-auto">
          <button
            onClick={() => {
              const starterCategories: { cat: ExpenseCategory; ratio: number }[] = [
                { cat: 'Food & Dining', ratio: 0.25 },
                { cat: 'Transport & Fuel', ratio: 0.15 },
                { cat: 'Utilities', ratio: 0.10 },
                { cat: 'Shopping & Goods', ratio: 0.15 },
                { cat: 'Entertainment & Leisure', ratio: 0.10 },
                { cat: 'Airtime & Data', ratio: 0.05 },
                { cat: 'Savings & Investment', ratio: 0.20 }
              ];
              starterCategories.forEach(({ cat, ratio }, idx) => {
                onSaveBudget({
                  id: `b-auto-${Date.now()}-${idx}`,
                  category: cat,
                  monthlyLimit: Math.round(monthlyIncome * ratio),
                  period: '2026-08'
                });
              });
            }}
            className="px-3 sm:px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold flex items-center justify-center space-x-1.5 shadow-2xs transition active:scale-95 touch-manipulation"
            title="Auto-distribute 50% Needs, 30% Wants, 20% Savings"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden sm:inline">Apply 50/30/20 Plan</span>
            <span className="sm:hidden">50/30/20</span>
          </button>

          <button
            onClick={() => {
              setEditingBudgetId(null);
              setLimitAmount('');
              setShowAddModal(true);
            }}
            className="px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition active:scale-95 touch-manipulation"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Envelope</span>
          </button>
        </div>
      </div>

      {/* Budget Top Summary Strip - 4 CARDS INCLUDING PROMINENT DAILY SAFE-PACING ALLOWANCE */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        
        {/* 1. Total Budget */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] sm:text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Budget Limit</p>
          <p className="text-lg sm:text-2xl font-black text-slate-900 mt-1">
            {currency}{totalBudgeted.toLocaleString()}
          </p>
          <p className="text-[10px] sm:text-[11px] text-slate-500 mt-1">
            {((totalBudgeted / Math.max(monthlyIncome, 1)) * 100).toFixed(0)}% of income
          </p>
        </div>

        {/* 2. Spent Across Envelopes */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] sm:text-xs text-slate-500 font-semibold uppercase tracking-wider">Spent Across Envelopes</p>
          <p className="text-lg sm:text-2xl font-black text-rose-500 mt-1">
            {currency}{totalSpentAcrossBudgets.toLocaleString()}
          </p>
          <p className="text-[10px] sm:text-[11px] text-slate-500 mt-1">
            {totalBudgeted > 0 ? ((totalSpentAcrossBudgets / totalBudgeted) * 100).toFixed(0) : 0}% utilized
          </p>
        </div>

        {/* 3. Daily Safe-Pacing Allowance (Highlighted) */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-[10px] sm:text-xs text-emerald-950 font-bold uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>Daily Safe Pacing</span>
            </p>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-400/50 text-slate-950">
              {daysRemaining}d left
            </span>
          </div>
          <div className="mt-1">
            <p className="text-lg sm:text-2xl font-black text-slate-950 tracking-tight">
              {currency}{totalDailyAllowance.toFixed(2)} <span className="text-xs font-bold text-emerald-950">/ day</span>
            </p>
            <p className="text-[10px] sm:text-[11px] text-emerald-950 font-semibold mt-0.5 truncate">
              Safe combined burn rate
            </p>
          </div>
        </div>

        {/* 4. Days Remaining & Remaining Unspent */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] sm:text-xs text-slate-500 font-semibold uppercase tracking-wider">Remaining Buffer</p>
          <p className="text-lg sm:text-2xl font-black text-emerald-600 mt-1">
            {currency}{totalRemainingAcrossBudgets.toLocaleString()}
          </p>
          <p className="text-[10px] sm:text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>{daysRemaining} days remaining in Aug</span>
          </p>
        </div>

      </div>

      {/* Pacing Explanation Banner */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-start space-x-2.5">
          <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 font-bold">
            <Info className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-slate-900">How Daily Safe-Pacing works: </span>
            <span>
              MoneyPilot divides each envelope's remaining balance by the {daysRemaining} days left in this month. As long as you stay at or below this daily rate, you will never overshoot your budget.
            </span>
          </div>
        </div>
      </div>

      {/* Budgets Grid Cards */}
      {budgetStats.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {budgetStats.map((b) => {
          const colors = CATEGORY_COLORS[b.category] || { fill: '#10b981', text: 'text-emerald-700', bg: 'bg-emerald-50' };

          return (
            <div 
              key={b.id}
              className={`p-4 sm:p-5 rounded-2xl bg-white border transition shadow-sm space-y-3.5 ${
                b.isOverspent
                  ? 'border-rose-300 bg-rose-50/15'
                  : b.isNearLimit
                  ? 'border-amber-300 bg-amber-50/15'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Top Row: Category Title & Edit/Delete */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span 
                    className="w-3 h-3 rounded-full shrink-0" 
                    style={{ backgroundColor: colors.fill }} 
                  />
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {b.category}
                  </h3>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleEdit(b)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition touch-manipulation"
                    title="Edit limit"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteBudget(b.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition touch-manipulation"
                    title="Delete budget"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Middle Row: Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 font-semibold">
                    Spent: <strong className="text-slate-900">{currency}{b.spent.toLocaleString()}</strong>
                  </span>
                  <span className="text-slate-500 font-medium">
                    Limit: {currency}{b.monthlyLimit.toLocaleString()}
                  </span>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-200">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      b.isOverspent 
                        ? 'bg-rose-500' 
                        : b.isNearLimit 
                        ? 'bg-amber-400' 
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, b.percentUsed)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className={`font-bold ${
                    b.isOverspent ? 'text-rose-600' : b.isNearLimit ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {b.percentUsed.toFixed(0)}% used
                  </span>

                  {b.isOverspent ? (
                    <span className="text-rose-600 font-bold flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Over by {currency}{(b.spent - b.monthlyLimit).toLocaleString()}</span>
                    </span>
                  ) : (
                    <span className="text-slate-500 font-medium">
                      {currency}{b.remaining.toLocaleString()} left
                    </span>
                  )}
                </div>
              </div>

              {/* Dedicated Prominent Daily Safe-Pacing Block */}
              {!b.isOverspent ? (
                <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 flex items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-1.5 text-emerald-800 font-bold text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Daily Safe-Pacing Allowance</span>
                    </div>
                    <p className="text-xs text-slate-800 font-medium mt-0.5">
                      Spend up to <strong className="text-sm font-black text-emerald-700">{currency}{b.dailyAllowance.toFixed(2)}</strong> / day
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-emerald-700 shrink-0 shadow-2xs">
                    {daysRemaining}d left
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-200/80 flex items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-1.5 text-rose-800 font-bold text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>Daily Safe-Pacing Allowance: {currency}0.00</span>
                    </div>
                    <p className="text-[11px] text-rose-700 mt-0.5">
                      Exceeded monthly envelope by {currency}{(b.spent - b.monthlyLimit).toLocaleString()}. Reallocate from other categories.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 shrink-0">
                    Exceeded
                  </span>
                </div>
              )}

              {/* Bottom Row: Quick Transaction Link */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  {b.monthlyLimit > 0 ? `${((b.spent / b.monthlyLimit) * 100).toFixed(0)}% of envelope` : ''}
                </span>

                <button
                  onClick={() => onNavigateToTab('transactions')}
                  className="text-[11px] text-emerald-600 hover:text-emerald-700 hover:underline flex items-center space-x-1 font-semibold"
                >
                  <span>View Expenses</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

            </div>
          );
        })}
      </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
            <Layers className="w-7 h-7 stroke-[1.5]" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              No Budget Envelopes Created Yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Envelopes give every cedi a job and unlock live Daily Safe-Pacing limits. Create custom categories or generate an initial 50/30/20 starter plan.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                const starterCategories: { cat: ExpenseCategory; ratio: number; note: string }[] = [
                  // 50% Needs
                  { cat: 'Food & Dining', ratio: 0.25, note: 'Needs (25%)' },
                  { cat: 'Transport & Fuel', ratio: 0.15, note: 'Needs (15%)' },
                  { cat: 'Utilities', ratio: 0.10, note: 'Needs (10%)' },
                  // 30% Wants
                  { cat: 'Shopping & Goods', ratio: 0.15, note: 'Wants (15%)' },
                  { cat: 'Entertainment & Leisure', ratio: 0.10, note: 'Wants (10%)' },
                  { cat: 'Airtime & Data', ratio: 0.05, note: 'Wants (5%)' },
                  // 20% Savings & Investment
                  { cat: 'Savings & Investment', ratio: 0.20, note: 'Savings (20%)' }
                ];
                starterCategories.forEach(({ cat, ratio }, idx) => {
                  onSaveBudget({
                    id: `b-auto-${Date.now()}-${idx}`,
                    category: cat,
                    monthlyLimit: Math.round(monthlyIncome * ratio),
                    period: '2026-08'
                  });
                });
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold transition shadow-sm flex items-center justify-center space-x-2 touch-manipulation"
            >
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
              <span>Auto-Generate 50/30/20 Starter Envelopes (Inc. 20% Savings)</span>
            </button>

            <button
              onClick={() => {
                setEditingBudgetId(null);
                setLimitAmount('');
                setShowAddModal(true);
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center justify-center space-x-1.5 touch-manipulation"
            >
              <Plus className="w-4 h-4" />
              <span>Create Custom Envelope</span>
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Budget Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-xl text-slate-900">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {editingBudgetId ? 'Edit Category Budget' : 'Set New Category Budget'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Specify your monthly spending limit for this category.
            </p>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  {ALL_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Monthly Limit ({currency}) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    {currency}
                  </span>
                  <input
                    type="number"
                    step="10"
                    min="10"
                    required
                    value={limitAmount}
                    onChange={(e) => setLimitAmount(e.target.value)}
                    placeholder="850"
                    className="w-full pl-12 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold shadow-sm transition"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

