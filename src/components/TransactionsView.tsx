import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  PiggyBank
} from 'lucide-react';
import { Transaction, ExpenseCategory } from '../types';
import { ALL_CATEGORIES, CATEGORY_COLORS } from '../utils/finance';

interface TransactionsViewProps {
  transactions: Transaction[];
  currency: string;
  onOpenNewTransaction: () => void;
  onUpdateCategory: (txId: string, newCategory: ExpenseCategory) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  currency,
  onOpenNewTransaction,
  onUpdateCategory
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'expense' | 'income' | 'transfer'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filter transactions
  const filtered = transactions.filter(tx => {
    const matchesSearch = 
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.merchant && tx.merchant.toLowerCase().includes(searchTerm.toLowerCase())) ||
      tx.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === 'all' || tx.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || tx.category === selectedCategory;
    const matchesMethod = selectedMethod === 'all' || tx.paymentMethod === selectedMethod;

    return matchesSearch && matchesType && matchesCategory && matchesMethod;
  });

  const totalFilteredExpense = filtered
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFilteredIncome = filtered
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-4 sm:space-y-5 pb-12">
      
      {/* Header & Quick Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-6 dash-card">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-ink flex items-center space-x-2">
            <span>Transaction Ledger</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-soft-gray text-ink/80 font-semibold">
              {transactions.length} records
            </span>
          </h2>
          <p className="text-[11px] sm:text-xs text-muted-gray mt-0.5">
            Auto-synced from Mobile Money (MTN/Telecel), bank transfers, and quick cash records.
          </p>
        </div>

        <button
          onClick={onOpenNewTransaction}
          className="px-3.5 sm:px-4 py-2 rounded-sm bg-hero-blue/100 hover:bg-hero-blue text-slate-950 text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition active:scale-95 touch-manipulation self-stretch sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-5 dash-card bg-white shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          
          {/* Search Input */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-muted-gray absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search description, Papaye, Melcom..."
              className="w-full pl-9 pr-4 py-2 bg-soft-gray/80 border border-ink/10 rounded-sm text-xs text-ink placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="w-full px-3 py-2 bg-soft-gray/80 border border-ink/10 rounded-sm text-xs text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            <option value="all">All Types</option>
            <option value="expense">Expenses Only</option>
            <option value="income">Income Only</option>
            <option value="transfer">Savings Transfers</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-soft-gray/80 border border-ink/10 rounded-sm text-xs text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            <option value="all">All Categories</option>
            {ALL_CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

        </div>

        {/* Filter summary strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 sm:pt-3 border-t border-ink/8 text-[11px] sm:text-xs">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 text-muted-gray">
            <span>Showing <strong className="text-ink">{filtered.length}</strong></span>
            <span>•</span>
            <span>Expenses: <strong className="text-rose-500">{currency}{totalFilteredExpense.toLocaleString()}</strong></span>
            <span>•</span>
            <span>Income: <strong className="text-deep-blue">{currency}{totalFilteredIncome.toLocaleString()}</strong></span>
          </div>

          {(searchTerm || selectedType !== 'all' || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedType('all');
                setSelectedCategory('all');
                setSelectedMethod('all');
              }}
              className="text-xs text-deep-blue hover:underline font-semibold"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Transactions List */}
      <div className="dash-card bg-white overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="p-8 sm:p-12 text-center space-y-2 sm:space-y-3">
            <Search className="w-8 h-8 text-muted-gray mx-auto" />
            <p className="text-sm font-bold text-ink">No transactions found</p>
            <p className="text-xs text-muted-gray">
              Try adjusting your search criteria or add a new transaction.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((tx) => {
              const isIncome = tx.type === 'income';
              const isTransfer = tx.type === 'transfer';
              const isEditing = editingId === tx.id;

              return (
                <div 
                  key={tx.id}
                  className="p-3 sm:p-4 hover:bg-soft-gray/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 text-xs"
                >
                  {/* Left: Icon & Description */}
                  <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 flex-1">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-sm flex items-center justify-center shrink-0 ${
                      isIncome 
                        ? 'bg-hero-blue/15 text-deep-blue' 
                        : isTransfer 
                        ? 'bg-teal-100 text-teal-700' 
                        : 'bg-soft-gray text-ink/80'
                    }`}>
                      {isIncome ? (
                        <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : isTransfer ? (
                        <PiggyBank className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />
                      )}
                    </div>

                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-xs sm:text-sm font-bold text-ink truncate">
                          {tx.description}
                        </p>
                        {tx.isAutoImported && (
                          <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.2 rounded bg-soft-gray text-muted-gray shrink-0">
                            Auto
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-[11px] text-muted-gray font-medium">
                        <span>{tx.date}</span>
                        <span>•</span>
                        <span className="truncate">{tx.paymentMethod}</span>
                        {tx.merchant && (
                          <>
                            <span>•</span>
                            <span className="text-ink/80 truncate max-w-[120px]">{tx.merchant}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Category Picker, Amount & Delete */}
                  <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-3 self-stretch sm:self-auto pl-11 sm:pl-0 pt-1 sm:pt-0">
                    
                    {/* Category editor */}
                    <div className="relative">
                      {isEditing ? (
                        <select
                          autoFocus
                          value={tx.category}
                          onChange={(e) => {
                            onUpdateCategory(tx.id, e.target.value as ExpenseCategory);
                            setEditingId(null);
                          }}
                          onBlur={() => setEditingId(null)}
                          className="text-xs bg-white text-ink border border-hero-blue rounded-lg px-2 py-1 focus:outline-none shadow-xs"
                        >
                          {ALL_CATEGORIES.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      ) : (
                        <button
                          onClick={() => setEditingId(tx.id)}
                          className="text-[10px] sm:text-[11px] font-semibold px-2 sm:px-2.5 py-1 rounded-lg bg-soft-gray text-ink/80 hover:bg-soft-gray transition truncate max-w-[95px] sm:max-w-[130px] touch-manipulation"
                          title="Click to change category"
                        >
                          {tx.category}
                        </button>
                      )}
                    </div>

                    {/* Amount */}
                    <p className={`font-bold text-sm sm:text-base tracking-tight min-w-[75px] sm:min-w-[90px] text-right ${
                      isIncome 
                        ? 'text-deep-blue' 
                        : isTransfer 
                        ? 'text-teal-600' 
                        : 'text-ink'
                    }`}>
                      {isIncome ? '+' : '-'}{currency}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </p>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

