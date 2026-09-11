import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Navigation, TabType } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { BudgetsView } from './components/BudgetsView';
import { GoalsAndDebtsView } from './components/GoalsAndDebtsView';
import { AiAssistantView } from './components/AiAssistantView';
import { RecurringBillsView } from './components/RecurringBillsView';
import { TransactionModal } from './components/TransactionModal';
import { HealthScoreModal } from './components/HealthScoreModal';

import { 
  UserProfile, 
  Transaction, 
  Budget, 
  SavingsGoal, 
  DebtItem, 
  RecurringItem, 
  FinancialInsight, 
  ExpenseCategory 
} from './types';

import { 
  loadUserProfile, 
  saveUserProfile, 
  loadTransactions, 
  saveTransactions, 
  loadBudgets, 
  saveBudgets, 
  loadSavingsGoals, 
  saveSavingsGoals, 
  loadDebts, 
  saveDebts, 
  loadRecurringItems, 
  saveRecurringItems, 
  loadInsights, 
  saveInsights,
  applyPersonaPreset 
} from './utils/storage';

import { 
  calculateFinancialHealth, 
  generateProactiveInsights 
} from './utils/finance';

export const App: React.FC = () => {
  // Main State
  const [profile, setProfile] = useState<UserProfile>(loadUserProfile);
  const [transactions, setTransactions] = useState<Transaction[]>(loadTransactions);
  const [budgets, setBudgets] = useState<Budget[]>(loadBudgets);
  const [goals, setGoals] = useState<SavingsGoal[]>(loadSavingsGoals);
  const [debts, setDebts] = useState<DebtItem[]>(loadDebts);
  const [recurringItems, setRecurringItems] = useState<RecurringItem[]>(loadRecurringItems);
  const [insights, setInsights] = useState<FinancialInsight[]>(loadInsights);

  // Active View Tab
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Modals
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isHealthScoreModalOpen, setIsHealthScoreModalOpen] = useState(false);
  const [isRefreshingInsights, setIsRefreshingInsights] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Sync to localStorage
  useEffect(() => {
    saveUserProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveBudgets(budgets);
  }, [budgets]);

  useEffect(() => {
    saveSavingsGoals(goals);
  }, [goals]);

  useEffect(() => {
    saveDebts(debts);
  }, [debts]);

  useEffect(() => {
    saveRecurringItems(recurringItems);
  }, [recurringItems]);

  useEffect(() => {
    saveInsights(insights);
  }, [insights]);

  // Compute live Health Score
  const healthScore = calculateFinancialHealth(profile, transactions, budgets, goals, debts);

  // Persona Switching Handler
  const handleSelectPersona = (personaId: string) => {
    const loadedData = applyPersonaPreset(personaId);
    setProfile(loadedData.profile);
    setTransactions(loadedData.transactions);
    setBudgets(loadedData.budgets);
    setGoals(loadedData.goals);
    setDebts(loadedData.debts);
    setRecurringItems(loadedData.recurring);
    setInsights(loadedData.insights);
    showToast(`Switched profile to ${loadedData.profile.name} (${personaId})`);
  };

  // Currency Change Handler
  const handleChangeCurrency = (newCurrency: string) => {
    setProfile(prev => ({ ...prev, currency: newCurrency }));
    showToast(`Currency updated to ${newCurrency}`);
  };

  // Add Transaction Handler - immediately updates transaction list, balances, and savings
  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions(prev => [newTx, ...prev]);

    // Update connected accounts balance if applicable
    setProfile(prev => {
      if (!prev.connectedAccounts || prev.connectedAccounts.length === 0) return prev;
      
      const updatedAccounts = prev.connectedAccounts.map(acc => {
        const matchesMethod = 
          (newTx.paymentMethod === 'MTN MoMo' && acc.type === 'MTN MoMo') ||
          (newTx.paymentMethod === 'Telecel Cash' && acc.type === 'Telecel Cash') ||
          (newTx.paymentMethod === 'AT Money' && acc.type === 'Telecel Cash') ||
          (newTx.paymentMethod === 'Bank Account' && acc.type === 'Bank Account') ||
          (newTx.paymentMethod === 'Debit Card' && acc.type === 'Bank Account') ||
          (newTx.paymentMethod === 'Cash Wallet' && acc.type === 'Cash Wallet');

        if (matchesMethod || prev.connectedAccounts.length === 1) {
          const delta = newTx.type === 'income' ? newTx.amount : -newTx.amount;
          return {
            ...acc,
            balance: Math.max(0, acc.balance + delta),
            lastSynced: 'Just now'
          };
        }
        return acc;
      });

      return { ...prev, connectedAccounts: updatedAccounts };
    });

    // If category is Savings & Investment or transfer to savings, update goal progress
    if (newTx.category === 'Savings & Investment' || newTx.type === 'transfer') {
      setGoals(prev => {
        if (prev.length === 0) return prev;
        // Allocate to first active goal
        const firstGoal = prev[0];
        return prev.map(g => g.id === firstGoal.id ? { ...g, currentAmount: g.currentAmount + newTx.amount } : g);
      });
    }

    showToast(`Added ${newTx.type === 'income' ? 'income' : 'expense'}: ${profile.currency}${newTx.amount.toLocaleString()} (${newTx.category})`);
  };

  // Update Transaction Category Handler (Teaches AI)
  const handleUpdateTransactionCategory = (txId: string, newCategory: ExpenseCategory) => {
    setTransactions(prev => prev.map(tx => {
      if (tx.id === txId) {
        return { ...tx, category: newCategory };
      }
      return tx;
    }));
    showToast(`Category updated to ${newCategory}. MoneyPilot learned this rule!`);
  };

  // Budget Handlers
  const handleSaveBudget = (budget: Budget) => {
    setBudgets(prev => {
      const existing = prev.findIndex(b => b.id === budget.id || b.category === budget.category);
      if (existing >= 0) {
        const copy = [...prev];
        copy[existing] = budget;
        return copy;
      }
      return [...prev, budget];
    });
    showToast(`Budget for ${budget.category} set to ${profile.currency}${budget.monthlyLimit.toLocaleString()}`);
  };

  const handleDeleteBudget = (budgetId: string) => {
    setBudgets(prev => prev.filter(b => b.id !== budgetId));
    showToast('Budget envelope deleted');
  };

  // Goals Handlers
  const handleSaveGoal = (goal: SavingsGoal) => {
    setGoals(prev => {
      const index = prev.findIndex(g => g.id === goal.id);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = goal;
        return copy;
      }
      return [...prev, goal];
    });
    showToast(`Savings target "${goal.name}" saved!`);
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
    showToast('Savings goal deleted');
  };

  const handleDepositGoal = (goalId: string, amount: number) => {
    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        return { ...g, currentAmount: g.currentAmount + amount };
      }
      return g;
    }));

    // Also record transaction as savings transfer
    const goalObj = goals.find(g => g.id === goalId);
    if (goalObj) {
      const savingsTx: Transaction = {
        id: `tx-goal-${Date.now()}`,
        amount,
        type: 'transfer',
        category: 'Savings & Investment',
        description: `Deposit to ${goalObj.name}`,
        paymentMethod: 'MTN MoMo',
        date: new Date().toISOString().split('T')[0]
      };
      setTransactions(prev => [savingsTx, ...prev]);
    }

    showToast(`Deposited ${profile.currency}${amount.toLocaleString()} into savings! 🎉`);
  };

  // Debts Handlers
  const handleSaveDebt = (debt: DebtItem) => {
    setDebts(prev => {
      const index = prev.findIndex(d => d.id === debt.id);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = debt;
        return copy;
      }
      return [...prev, debt];
    });
    showToast(`Debt record "${debt.lender}" saved`);
  };

  const handleDeleteDebt = (debtId: string) => {
    setDebts(prev => prev.filter(d => d.id !== debtId));
    showToast('Debt item removed');
  };

  const handlePayDebt = (debtId: string, amount: number) => {
    setDebts(prev => prev.map(d => {
      if (d.id === debtId) {
        return { ...d, currentBalance: Math.max(0, d.currentBalance - amount) };
      }
      return d;
    }));

    const debtObj = debts.find(d => d.id === debtId);
    if (debtObj) {
      const debtTx: Transaction = {
        id: `tx-debt-${Date.now()}`,
        amount,
        type: 'expense',
        category: 'Debt Repayment',
        description: `Payment to ${debtObj.lender}`,
        merchant: debtObj.lender,
        paymentMethod: 'MTN MoMo',
        date: new Date().toISOString().split('T')[0]
      };
      setTransactions(prev => [debtTx, ...prev]);
    }

    showToast(`Paid ${profile.currency}${amount.toLocaleString()} towards debt! Step closer to debt-free.`);
  };

  // Recurring Bills Handlers
  const handleSaveRecurringItem = (item: RecurringItem) => {
    setRecurringItems(prev => {
      const index = prev.findIndex(r => r.id === item.id);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = item;
        return copy;
      }
      return [...prev, item];
    });
    showToast(`Recurring bill "${item.name}" configured`);
  };

  const handleDeleteRecurringItem = (itemId: string) => {
    setRecurringItems(prev => prev.filter(r => r.id !== itemId));
    showToast('Recurring bill removed');
  };

  const handleMarkBillAsPaid = (item: RecurringItem) => {
    setRecurringItems(prev => prev.map(r => {
      if (r.id === item.id) {
        return { ...r, isPaidThisPeriod: true };
      }
      return r;
    }));

    // Also auto-log transaction
    const billTx: Transaction = {
      id: `tx-bill-${Date.now()}`,
      amount: item.amount,
      type: 'expense',
      category: item.category,
      description: `Monthly Bill: ${item.name}`,
      merchant: item.name,
      paymentMethod: item.paymentMethod,
      date: new Date().toISOString().split('T')[0]
    };
    setTransactions(prev => [billTx, ...prev]);

    showToast(`Marked "${item.name}" as paid and logged expense!`);
  };

  // Refresh AI Insights from Backend
  const handleRefreshInsights = async () => {
    setIsRefreshingInsights(true);
    try {
      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthlyIncome: profile.monthlyIncome,
          currency: profile.currency,
          transactions: transactions.slice(0, 30),
          budgets,
          goals,
          debts
        })
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.insights) && data.insights.length > 0) {
        setInsights(data.insights);
        showToast('AI financial analysis refreshed with Gemini intelligence!');
      } else {
        // Fallback local heuristic generator
        const localInsights = generateProactiveInsights(transactions, profile.monthlyIncome, budgets, goals, debts);
        setInsights(localInsights);
        showToast('AI financial analysis updated');
      }
    } catch (err) {
      console.warn('Backend insight generation error, using fallback:', err);
      const localInsights = generateProactiveInsights(transactions, profile.monthlyIncome, budgets, goals, debts);
      setInsights(localInsights);
      showToast('AI financial analysis updated');
    } finally {
      setIsRefreshingInsights(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F1F5F9] font-sans text-slate-900 selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Sleek Dark Navy Aside Sidebar (Desktop lg+) */}
      <aside className="w-64 bg-[#0F172A] text-white hidden lg:flex flex-col p-6 shrink-0 h-screen sticky top-0 border-r border-slate-800">
        
        {/* Brand Logo Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-bold text-xl text-slate-950 shadow-md">
            M
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white block">MoneyPilot</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">Personal Finance</span>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <Navigation
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          insightCount={insights.length}
          isSidebar={true}
        />

        {/* Bottom AI Pro Feature Card */}
        <div className="mt-auto p-4 bg-slate-800/90 rounded-2xl border border-slate-700/60 text-white shadow-md">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">AI Advisor Active</p>
          </div>
          <p className="text-sm font-semibold mb-3">Gemini 2.5 Intelligence</p>
          <button 
            onClick={() => setActiveTab('ai-advisor')}
            className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition shadow-sm"
          >
            Open Advisor
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Navbar */}
        <Navbar
          profile={profile}
          onSelectPersona={handleSelectPersona}
          onOpenNewTransaction={() => setIsTxModalOpen(true)}
        />

        {/* Tablet Horizontal Tab Navigation */}
        <Navigation
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          insightCount={insights.length}
          isSidebar={false}
        />

        {/* Main View Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-12">
          {activeTab === 'dashboard' && (
            <DashboardView
              profile={profile}
              transactions={transactions}
              budgets={budgets}
              goals={goals}
              debts={debts}
              insights={insights}
              healthScore={healthScore}
              onOpenNewTransaction={() => setIsTxModalOpen(true)}
              onOpenHealthScoreModal={() => setIsHealthScoreModalOpen(true)}
              onNavigateToTab={(tab) => setActiveTab(tab)}
              onUpdateTransactionCategory={handleUpdateTransactionCategory}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsView
              transactions={transactions}
              currency={profile.currency}
              onOpenNewTransaction={() => setIsTxModalOpen(true)}
              onUpdateCategory={handleUpdateTransactionCategory}
            />
          )}

          {activeTab === 'budgets' && (
            <BudgetsView
              budgets={budgets}
              transactions={transactions}
              currency={profile.currency}
              monthlyIncome={profile.monthlyIncome}
              onSaveBudget={handleSaveBudget}
              onDeleteBudget={handleDeleteBudget}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'goals-debts' && (
            <GoalsAndDebtsView
              goals={goals}
              debts={debts}
              transactions={transactions}
              monthlyIncome={profile.monthlyIncome}
              currency={profile.currency}
              onSaveGoal={handleSaveGoal}
              onDeleteGoal={handleDeleteGoal}
              onSaveDebt={handleSaveDebt}
              onDeleteDebt={handleDeleteDebt}
              onDepositGoal={handleDepositGoal}
              onPayDebt={handlePayDebt}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'ai-advisor' && (
            <AiAssistantView
              profile={profile}
              transactions={transactions}
              budgets={budgets}
              goals={goals}
              debts={debts}
              insights={insights}
              healthScore={healthScore}
              onRefreshInsights={handleRefreshInsights}
              isRefreshingInsights={isRefreshingInsights}
            />
          )}

          {activeTab === 'recurring' && (
            <RecurringBillsView
              recurringItems={recurringItems}
              currency={profile.currency}
              onSaveRecurringItem={handleSaveRecurringItem}
              onDeleteRecurringItem={handleDeleteRecurringItem}
              onMarkAsPaid={handleMarkBillAsPaid}
            />
          )}
        </main>
      </div>

      {/* Quick Add Transaction Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onAddTransaction={handleAddTransaction}
        currency={profile.currency}
      />

      {/* 5-Pillar Health Score Modal */}
      <HealthScoreModal
        isOpen={isHealthScoreModalOpen}
        onClose={() => setIsHealthScoreModalOpen(false)}
        healthScore={healthScore}
        currency={profile.currency}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 md:bottom-6 right-4 z-50 bg-slate-900 border border-emerald-500/50 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};

export default App;

