import React, { useState, useMemo } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  PiggyBank, 
  Wallet, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Sparkles, 
  ChevronRight, 
  Plus, 
  Bot, 
  PieChart as PieChartIcon, 
  ShieldCheck, 
  Info,
  Clock,
  ArrowRight,
  Filter,
  CheckCircle2,
  Zap,
  CalendarDays
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ComposedChart,
  Line
} from 'recharts';
import { 
  UserProfile, 
  Transaction, 
  Budget, 
  SavingsGoal, 
  DebtItem, 
  FinancialInsight,
  FinancialHealthScore,
  ExpenseCategory 
} from '../types';
import { calculateSummary, CATEGORY_COLORS, ALL_CATEGORIES } from '../utils/finance';

interface DashboardViewProps {
  profile: UserProfile;
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  debts: DebtItem[];
  insights: FinancialInsight[];
  healthScore: FinancialHealthScore;
  onOpenNewTransaction: () => void;
  onOpenHealthScoreModal: () => void;
  onNavigateToTab: (tab: any) => void;
  onUpdateTransactionCategory: (txId: string, newCategory: ExpenseCategory) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  transactions,
  budgets,
  goals,
  debts,
  insights,
  healthScore,
  onOpenNewTransaction,
  onOpenHealthScoreModal,
  onNavigateToTab,
  onUpdateTransactionCategory
}) => {
  const [editingCategoryTxId, setEditingCategoryTxId] = useState<string | null>(null);

  const currency = profile.currency || '';
  const summary = calculateSummary(transactions, profile.monthlyIncome);

  // Prepare chart data
  const chartData = summary.spendingList.slice(0, 6).map(item => ({
    name: item.category,
    value: item.amount,
    color: CATEGORY_COLORS[item.category]?.fill || '#94a3b8'
  }));

  // Cash flow bar data
  const cashFlowData = [
    { name: 'Income', amount: summary.effectiveIncome, fill: '#10b981' },
    { name: 'Expenses', amount: summary.totalExpenses, fill: '#f43f5e' },
    { name: 'Savings', amount: summary.totalSavings, fill: '#06b6d4' },
    { name: 'Remaining', amount: Math.max(0, summary.remaining), fill: '#6366f1' }
  ];

  // Calculate days remaining and daily safe pacing
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const currentDay = today.getDate();
  const daysRemaining = Math.max(1, daysInMonth - currentDay);
  const totalBudgeted = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const remainingBudgetOrCash = totalBudgeted > 0 
    ? Math.max(0, totalBudgeted - summary.totalExpenses) 
    : Math.max(0, summary.remaining);
  const dailySafePacing = remainingBudgetOrCash > 0 ? (remainingBudgetOrCash / daysRemaining) : 0;

  // 7-day spending vs ideal pacing calculation
  const sevenDayPacingData = useMemo(() => {
    const list = [];
    const now = new Date();
    // Ideal daily rate from budget or monthly income standard
    const idealRate = totalBudgeted > 0 
      ? Math.round(totalBudgeted / daysInMonth) 
      : Math.round((summary.effectiveIncome * 0.7) / daysInMonth);

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      const label = `${weekday} ${dayNum}`;

      // Sum all expenses for this day
      const dayExpenses = transactions
        .filter(t => t.type === 'expense' && t.date && t.date.startsWith(dateStr))
        .reduce((sum, t) => sum + t.amount, 0);

      list.push({
        date: dateStr,
        day: label,
        weekday,
        dayNum,
        actualSpend: dayExpenses,
        idealPace: idealRate,
        isUnder: dayExpenses <= idealRate,
        diff: dayExpenses - idealRate
      });
    }

    const underCount = list.filter(item => item.isUnder).length;
    const total7DaySpend = list.reduce((sum, item) => sum + item.actualSpend, 0);
    const avgDailySpend = Math.round(total7DaySpend / 7);

    return {
      list,
      idealRate,
      underCount,
      total7DaySpend,
      avgDailySpend
    };
  }, [transactions, totalBudgeted, daysInMonth, summary.effectiveIncome]);

  const recentTransactions = transactions.slice(0, 7);

  // Top highlight insight
  const featuredInsight = insights[0] || {
    id: 'ins-default',
    title: 'Your finances are actively tracked',
    observation: 'Recording daily Mobile Money and cash expenses gives you 100% visibility over your cash flow.',
    whyExplanation: 'People who track small routine expenses save on average 15-20% more each month.',
    actionableStep: 'Keep recording expenses with AI as they happen.',
    categoryTag: 'General' as const,
    impactType: 'positive' as const
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
    if (score >= 65) return 'text-teal-400 bg-teal-500/15 border-teal-500/30';
    if (score >= 45) return 'text-amber-400 bg-amber-500/15 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/15 border-rose-500/30';
  };

  return (
    <div className="space-y-6">
      
      {/* 4 CORE METRIC CARDS (3 White Clean Cards + 1 Dark Health Score Card) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        
        {/* 1. Income Card */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Income</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
              <ArrowDownLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <p className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
              {currency}{summary.effectiveIncome.toLocaleString()}
            </p>
            <p className="text-[10px] sm:text-xs text-emerald-600 mt-0.5 sm:mt-1 font-semibold flex items-center gap-1">
              <span>{profile.payFrequency}</span>
            </p>
          </div>
        </div>

        {/* 2. Expenses Card */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Expenses</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center font-bold shrink-0">
              <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <p className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
              {currency}{summary.totalExpenses.toLocaleString()}
            </p>
            <p className="text-[10px] sm:text-xs text-rose-500 mt-0.5 sm:mt-1 font-semibold truncate">
              {summary.burnRatePercent.toFixed(0)}% spent
            </p>
          </div>
        </div>

        {/* 3. Savings Card */}
        <div 
          onClick={() => onNavigateToTab('goals-debts')}
          className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between cursor-pointer hover:border-emerald-300 transition group"
          title="Click to view Savings Goals & Audit Trail"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Verified Saved</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition">
              <PiggyBank className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <p className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
              {currency}{summary.totalSavings.toLocaleString()}
            </p>
            <p className="text-[10px] sm:text-xs text-emerald-600 mt-0.5 sm:mt-1 font-semibold flex items-center justify-between">
              <span>{summary.savingsRate.toFixed(0)}% saved</span>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">Proof & Audit →</span>
            </p>
          </div>
        </div>

        {/* 4. Health Score Card (Dark Sleek Style) */}
        <div 
          onClick={onOpenHealthScoreModal}
          className="bg-[#0F172A] p-3.5 sm:p-5 rounded-2xl text-white shadow-md relative overflow-hidden group cursor-pointer hover:ring-2 hover:ring-emerald-500/40 transition flex flex-col justify-between active:scale-98 touch-manipulation"
        >
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Health</span>
            <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {healthScore.rating}
            </span>
          </div>

          <div className="mt-2 sm:mt-3 z-10">
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-3xl font-black text-emerald-400 tracking-tight">{healthScore.score}</span>
              <span className="text-xs sm:text-sm font-semibold text-slate-400">/100</span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-300 mt-0.5 sm:mt-1 flex items-center justify-between font-medium">
              <span className="truncate">{healthScore.score >= 70 ? 'Optimal' : 'Needs attention'}</span>
              <span className="text-emerald-400 group-hover:translate-x-0.5 transition text-[10px] sm:text-[11px] font-bold shrink-0 ml-1">Details →</span>
            </p>
          </div>

          {/* Subtle decorative glow */}
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
        </div>

      </div>

      {/* FEATURED AI INSIGHT HERO CARD (Sleek Emerald Glass Style) */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50/70 to-emerald-50 border border-emerald-200/80 rounded-2xl p-4 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                AI Financial Observation
              </span>
              {featuredInsight.metricHighlight && (
                <span className="px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold bg-emerald-200/60 text-emerald-900">
                  {featuredInsight.metricHighlight}
                </span>
              )}
            </div>

            <h3 className="text-sm sm:text-lg font-bold text-slate-900">
              {featuredInsight.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
              {featuredInsight.observation}
            </p>

            <div className="pt-1 sm:pt-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-700 font-medium">
              <span className="font-bold text-emerald-800">Why this matters:</span>
              <span className="text-slate-600">{featuredInsight.whyExplanation}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2 shrink-0 pt-2 md:pt-0">
            <button
              onClick={() => onNavigateToTab('ai-advisor')}
              className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 touch-manipulation"
            >
              <span>Explore AI Advisor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium">
              Action: {featuredInsight.actionableStep}
            </span>
          </div>
        </div>
      </div>

      {/* CHARTS ROW (Spending Breakdown Donut + Monthly Cash Flow Architecture) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Spending Breakdown Donut Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <PieChartIcon className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Spending Breakdown</h3>
              </div>
              <span className="text-xs text-slate-500 font-semibold">
                {currency}{summary.totalExpenses.toLocaleString()}
              </span>
            </div>

            {chartData.length > 0 ? (
              <>
                <div className="h-44 sm:h-48 w-full my-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={44}
                        outerRadius={68}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(val: any) => [`${currency}${Number(val).toLocaleString()}`, 'Spent']}
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Category Ranking List */}
                <div className="space-y-1.5 mt-2 max-h-36 overflow-y-auto pr-1">
                  {summary.spendingList.slice(0, 4).map((item) => (
                    <div key={item.category} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                      <div className="flex items-center space-x-2 min-w-0 pr-2">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0" 
                          style={{ backgroundColor: CATEGORY_COLORS[item.category]?.fill || '#94a3b8' }} 
                        />
                        <span className="text-slate-700 font-medium truncate max-w-[110px] sm:max-w-[150px]">
                          {item.category}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 font-semibold shrink-0">
                        <span className="text-slate-400 text-[11px]">{item.percentage.toFixed(0)}%</span>
                        <span className="text-slate-900">{currency}{item.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                No expense records for this month yet.
              </div>
            )}
          </div>
        </div>

        {/* Cash Flow Distribution & Active Goal/Debt */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Monthly Cash Flow Architecture</h3>
                <p className="text-[11px] sm:text-xs text-slate-500">Income vs Expenses vs Savings vs Leftover Buffer</p>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  onClick={() => onNavigateToTab('budgets')}
                  className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-1 cursor-pointer transition touch-manipulation shadow-2xs"
                  title="View Daily Safe-Pacing Breakdown in Budgets"
                >
                  <Zap className="w-3 h-3 text-emerald-600 fill-emerald-600 shrink-0" />
                  <span>Safe Pace: {currency}{dailySafePacing.toFixed(1)}/day</span>
                </div>
                <button
                  onClick={() => onNavigateToTab('budgets')}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1 shrink-0"
                >
                  <span className="hidden sm:inline">Budgets</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="h-44 sm:h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(v) => `${currency}${v}`} />
                  <Tooltip 
                    formatter={(val: any) => [`${currency}${Number(val).toLocaleString()}`, 'Amount']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                    {cashFlowData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

            {/* Quick Active Goal & Debt Snippet */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-3 border-t border-slate-100 mt-2">
            {goals[0] ? (
              <div 
                onClick={() => onNavigateToTab('goals-debts')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 cursor-pointer transition active:scale-98 touch-manipulation"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 truncate pr-2">🎯 {goals[0].name}</span>
                  <span className="font-semibold text-emerald-600 shrink-0">
                    {Math.round((goals[0].currentAmount / goals[0].targetAmount) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full" 
                    style={{ width: `${Math.min(100, (goals[0].currentAmount / goals[0].targetAmount) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5 font-medium">
                  {currency}{goals[0].currentAmount.toLocaleString()} of {currency}{goals[0].targetAmount.toLocaleString()}
                </p>
              </div>
            ) : (
              <div 
                onClick={() => onNavigateToTab('goals-debts')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-dashed border-emerald-300 cursor-pointer transition flex items-center justify-between active:scale-98 touch-manipulation"
              >
                <div>
                  <p className="text-xs font-bold text-emerald-800">🎯 Set Your First Savings Goal</p>
                  <p className="text-[11px] text-slate-500">Emergency fund, laptop, or house rent</p>
                </div>
                <Plus className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
            )}

            {debts[0] ? (
              <div 
                onClick={() => onNavigateToTab('goals-debts')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 cursor-pointer transition active:scale-98 touch-manipulation"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 truncate pr-2">⚖️ {debts[0].lender}</span>
                  <span className="font-semibold text-rose-500 shrink-0">
                    {currency}{debts[0].currentBalance.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div 
                    className="h-full bg-rose-500 rounded-full" 
                    style={{ width: `${Math.min(100, (debts[0].currentBalance / debts[0].originalAmount) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5 font-medium">
                  Min: {currency}{debts[0].minimumMonthlyPayment}/mo @ {debts[0].interestRate}%
                </p>
              </div>
            ) : (
              <div 
                onClick={() => onNavigateToTab('goals-debts')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 cursor-pointer transition flex items-center justify-between active:scale-98 touch-manipulation"
              >
                <div>
                  <p className="text-xs font-bold text-emerald-700">✨ Debt-Free Status</p>
                  <p className="text-[11px] text-slate-500">No active debts registered</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 7-DAY SPENDING VS IDEAL DAILY PACING CHART */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CalendarDays className="w-4 h-4" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Last 7 Days: Spending vs Ideal Daily Pacing
              </h3>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Compare actual daily spending against your target daily pacing ceiling ({currency}{sevenDayPacingData.idealRate.toLocaleString()}/day)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{sevenDayPacingData.underCount} of 7 days on pace</span>
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
              7-Day Avg: <strong>{currency}{sevenDayPacingData.avgDailySpend.toLocaleString()}/day</strong>
            </span>
          </div>
        </div>

        {/* Recharts ComposedChart: Bar for Actual Daily Spend, Dashed Line for Ideal Daily Pace Target */}
        <div className="h-52 sm:h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={sevenDayPacingData.list} margin={{ top: 15, right: 10, left: -15, bottom: 0 }}>
              <XAxis 
                dataKey="day" 
                stroke="#94a3b8" 
                fontSize={11} 
                tickLine={false} 
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={10} 
                tickFormatter={(v) => `${currency}${v}`} 
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const isOver = data.actualSpend > data.idealPace;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs space-y-1.5 min-w-[180px]">
                        <div className="font-bold text-slate-200 pb-1 border-b border-slate-800 flex items-center justify-between">
                          <span>{label}</span>
                          <span className="text-[10px] text-slate-400">{data.date}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Actual Spend:</span>
                          <span className="font-bold text-white">{currency}{data.actualSpend.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Ideal Daily Pace:</span>
                          <span className="font-bold text-sky-400">{currency}{data.idealPace.toLocaleString()}</span>
                        </div>
                        <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Status:</span>
                          {isOver ? (
                            <span className="font-bold text-rose-400">+{currency}{Math.abs(data.diff).toLocaleString()} over pace</span>
                          ) : (
                            <span className="font-bold text-emerald-400">
                              {data.actualSpend === 0 ? 'No expenses 🎉' : `${currency}${Math.abs(data.diff).toLocaleString()} within pace`}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="actualSpend" 
                name="Actual Spend" 
                radius={[6, 6, 0, 0]} 
                maxBarSize={40}
              >
                {sevenDayPacingData.list.map((entry, idx) => (
                  <Cell 
                    key={`bar-cell-${idx}`} 
                    fill={entry.actualSpend > entry.idealPace ? '#f43f5e' : '#10b981'} 
                  />
                ))}
              </Bar>
              <Line 
                type="monotone" 
                dataKey="idealPace" 
                name="Ideal Daily Target" 
                stroke="#0284c7" 
                strokeWidth={2.5} 
                strokeDasharray="4 4"
                dot={{ r: 3.5, fill: '#0284c7' }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Legend & Summary Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-500 shrink-0" />
              <span className="text-slate-600 font-medium text-[11px]">Under Target</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-xs bg-rose-500 shrink-0" />
              <span className="text-slate-600 font-medium text-[11px]">Over Target</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-4 h-0.5 bg-sky-600 border-b border-dashed border-sky-600 shrink-0" />
              <span className="text-slate-600 font-medium text-[11px]">Ideal Target Line ({currency}{sevenDayPacingData.idealRate.toLocaleString()}/day)</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 font-medium">
            {sevenDayPacingData.underCount >= 4 
              ? '✨ Consistent discipline: More than half the week stayed below the pacing ceiling.'
              : '💡 High spend spikes detected. Staying within the daily pacing line keeps monthly savings intact.'}
          </p>
        </div>
      </div>

      {/* RECENT TRANSACTIONS TABLE & QUICK CATEGORY CORRECTOR */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Transactions</h3>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Tap category pill to reassign. MoneyPilot learns your preference.
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('transactions')}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1 shrink-0 ml-2"
          >
            <span>All ({transactions.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTransactions.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {recentTransactions.map((tx) => {
              const isIncome = tx.type === 'income';
              const isTransfer = tx.type === 'transfer';
              const isEditing = editingCategoryTxId === tx.id;

              return (
                <div 
                  key={tx.id} 
                  className="py-2.5 sm:py-3 flex items-center justify-between text-xs hover:bg-slate-50 px-1 sm:px-2 rounded-xl transition gap-2"
                >
                  <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 flex-1">
                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isIncome 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : isTransfer 
                        ? 'bg-teal-100 text-teal-700' 
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {isIncome ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : isTransfer ? (
                        <PiggyBank className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-rose-500" />
                      )}
                    </div>

                    <div className="space-y-0.5 min-w-0 flex-1">
                      <p className="font-semibold text-slate-900 truncate max-w-[130px] sm:max-w-[280px]">
                        {tx.description}
                      </p>
                      <div className="flex items-center space-x-1.5 text-[10px] sm:text-[11px] text-slate-500">
                        <span>{tx.date}</span>
                        <span>•</span>
                        <span className="truncate">{tx.paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
                    {/* Category Pill with inline editor */}
                    <div className="relative">
                      {isEditing ? (
                        <select
                          autoFocus
                          value={tx.category}
                          onChange={(e) => {
                            onUpdateTransactionCategory(tx.id, e.target.value as ExpenseCategory);
                            setEditingCategoryTxId(null);
                          }}
                          onBlur={() => setEditingCategoryTxId(null)}
                          className="text-xs bg-white text-slate-900 border border-emerald-500 rounded-lg px-1.5 py-1 focus:outline-none shadow-xs"
                        >
                          {ALL_CATEGORIES.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      ) : (
                        <button
                          onClick={() => setEditingCategoryTxId(tx.id)}
                          className="text-[10px] sm:text-[11px] font-semibold px-2 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition truncate max-w-[80px] sm:max-w-[120px] touch-manipulation"
                          title="Click to change category"
                        >
                          {tx.category}
                        </button>
                      )}
                    </div>

                    {/* Amount */}
                    <p className={`font-bold text-xs sm:text-sm tracking-tight text-right min-w-[65px] sm:min-w-[75px] ${
                      isIncome 
                        ? 'text-emerald-600' 
                        : isTransfer 
                        ? 'text-teal-600' 
                        : 'text-slate-900'
                    }`}>
                      {isIncome ? '+' : '-'}{currency}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 sm:py-10 text-center space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900">No transactions recorded yet</p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-0.5">
                Log your cash, bank, or Mobile Money spend to activate AI learning & daily safe-pacing.
              </p>
            </div>
            <button
              onClick={onOpenNewTransaction}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold transition shadow-xs touch-manipulation"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Add First Transaction</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
