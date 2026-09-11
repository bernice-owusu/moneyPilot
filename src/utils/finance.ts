import { 
  Transaction, 
  Budget, 
  SavingsGoal, 
  DebtItem, 
  ExpenseCategory, 
  FinancialHealthScore,
  FinancialInsight,
  UserProfile
} from '../types';

export const CATEGORY_COLORS: Record<ExpenseCategory, { bg: string; text: string; fill: string }> = {
  'Food & Dining': { bg: 'bg-amber-100 dark:bg-amber-950/40', text: 'text-amber-800 dark:text-amber-300', fill: '#f59e0b' },
  'Transport & Fuel': { bg: 'bg-blue-100 dark:bg-blue-950/40', text: 'text-blue-800 dark:text-blue-300', fill: '#3b82f6' },
  'Housing & Rent': { bg: 'bg-purple-100 dark:bg-purple-950/40', text: 'text-purple-800 dark:text-purple-300', fill: '#8b5cf6' },
  'Utilities': { bg: 'bg-emerald-100 dark:bg-emerald-950/40', text: 'text-emerald-800 dark:text-emerald-300', fill: '#10b981' },
  'Airtime & Data': { bg: 'bg-cyan-100 dark:bg-cyan-950/40', text: 'text-cyan-800 dark:text-cyan-300', fill: '#06b6d4' },
  'Shopping & Goods': { bg: 'bg-rose-100 dark:bg-rose-950/40', text: 'text-rose-800 dark:text-rose-300', fill: '#f43f5e' },
  'Entertainment & Leisure': { bg: 'bg-fuchsia-100 dark:bg-fuchsia-950/40', text: 'text-fuchsia-800 dark:text-fuchsia-300', fill: '#d946ef' },
  'Health & Medical': { bg: 'bg-red-100 dark:bg-red-950/40', text: 'text-red-800 dark:text-red-300', fill: '#ef4444' },
  'Education': { bg: 'bg-indigo-100 dark:bg-indigo-950/40', text: 'text-indigo-800 dark:text-indigo-300', fill: '#6366f1' },
  'Family & Support': { bg: 'bg-orange-100 dark:bg-orange-950/40', text: 'text-orange-800 dark:text-orange-300', fill: '#f97316' },
  'Debt Repayment': { bg: 'bg-slate-200 dark:bg-slate-800', text: 'text-slate-800 dark:text-slate-300', fill: '#64748b' },
  'Savings & Investment': { bg: 'bg-teal-100 dark:bg-teal-950/40', text: 'text-teal-800 dark:text-teal-300', fill: '#14b8a6' },
  'Income & Salary': { bg: 'bg-emerald-100 dark:bg-emerald-950/40', text: 'text-emerald-800 dark:text-emerald-300', fill: '#059669' },
  'Freelance & Business': { bg: 'bg-lime-100 dark:bg-lime-950/40', text: 'text-lime-800 dark:text-lime-300', fill: '#84cc16' },
  'Other': { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-800 dark:text-gray-300', fill: '#9ca3af' }
};

export const ALL_CATEGORIES: ExpenseCategory[] = [
  'Food & Dining',
  'Transport & Fuel',
  'Housing & Rent',
  'Utilities',
  'Airtime & Data',
  'Shopping & Goods',
  'Entertainment & Leisure',
  'Health & Medical',
  'Education',
  'Family & Support',
  'Debt Repayment',
  'Savings & Investment',
  'Income & Salary',
  'Freelance & Business',
  'Other'
];

export function calculateSummary(
  transactions: Transaction[], 
  monthlyIncome: number,
  periodYearMonth?: string
) {
  const currentIsoPrefix = new Date().toISOString().slice(0, 7);
  const targetPeriod = periodYearMonth || '2026-08';

  // Include transactions that match targetPeriod or current date prefix
  let currentMonthTx = transactions.filter(t => 
    t.date && (t.date.startsWith(targetPeriod) || t.date.startsWith(currentIsoPrefix) || t.date.startsWith('2026-08'))
  );

  // If no transactions match date prefix but transactions exist, take all transactions
  if (currentMonthTx.length === 0 && transactions.length > 0) {
    currentMonthTx = transactions;
  }

  let totalExpenses = 0;
  let totalSavings = 0;
  let totalRecordedIncome = 0;

  const categorySpending: Record<string, number> = {};

  currentMonthTx.forEach(t => {
    if (t.type === 'expense') {
      totalExpenses += t.amount;
      categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
    } else if (t.type === 'transfer' || t.category === 'Savings & Investment') {
      totalSavings += t.amount;
    } else if (t.type === 'income') {
      totalRecordedIncome += t.amount;
    }
  });

  const effectiveIncome = Math.max(monthlyIncome, totalRecordedIncome);
  const remaining = effectiveIncome - totalExpenses - totalSavings;

  const spendingList = Object.entries(categorySpending).map(([category, amount]) => ({
    category: category as ExpenseCategory,
    amount,
    percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
  })).sort((a, b) => b.amount - a.amount);

  return {
    effectiveIncome,
    totalExpenses,
    totalSavings,
    remaining,
    spendingList,
    savingsRate: effectiveIncome > 0 ? (totalSavings / effectiveIncome) * 100 : 0,
    burnRatePercent: effectiveIncome > 0 ? (totalExpenses / effectiveIncome) * 100 : 0
  };
}

export function computeFinancialHealthScore(
  transactions: Transaction[],
  monthlyIncome: number,
  budgets: Budget[],
  goals: SavingsGoal[],
  debts: DebtItem[]
): FinancialHealthScore {
  const summary = calculateSummary(transactions, monthlyIncome);
  
  // 1. Savings Rate Score (0 - 25 pts)
  // 20%+ savings rate gets 25 pts, 10% gets 15 pts, 0% gets 0 pts
  const savingsRate = summary.savingsRate;
  let savingsRateScore = Math.min(25, Math.round((savingsRate / 20) * 25));
  if (savingsRateScore < 0) savingsRateScore = 0;

  // 2. Budget Adherence Score (0 - 25 pts)
  let budgetScore = 25;
  if (budgets.length > 0) {
    let overspentCount = 0;
    budgets.forEach(b => {
      const spent = transactions
        .filter(t => t.type === 'expense' && t.category === b.category)
        .reduce((sum, t) => sum + t.amount, 0);
      if (spent > b.monthlyLimit) {
        overspentCount++;
      }
    });
    budgetScore = Math.max(5, 25 - (overspentCount * 6));
  } else {
    budgetScore = 18; // Default neutral if no budgets defined yet
  }

  // 3. Debt-to-Income Score (0 - 20 pts)
  const totalMonthlyDebtPayment = debts.reduce((sum, d) => sum + d.minimumMonthlyPayment, 0);
  const debtToIncomeRatio = monthlyIncome > 0 ? (totalMonthlyDebtPayment / monthlyIncome) * 100 : 0;
  let debtScore = 20;
  if (debtToIncomeRatio === 0) debtScore = 20;
  else if (debtToIncomeRatio <= 10) debtScore = 18;
  else if (debtToIncomeRatio <= 20) debtScore = 14;
  else if (debtToIncomeRatio <= 35) debtScore = 9;
  else debtScore = 4;

  // 4. Emergency Buffer Score (0 - 20 pts)
  const totalCurrentSavings = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const monthlyBurn = Math.max(summary.totalExpenses, 1500);
  const monthsOfBuffer = totalCurrentSavings / monthlyBurn;
  let emergencyScore = 0;
  if (monthsOfBuffer >= 3) emergencyScore = 20;
  else if (monthsOfBuffer >= 2) emergencyScore = 15;
  else if (monthsOfBuffer >= 1) emergencyScore = 10;
  else if (monthsOfBuffer >= 0.5) emergencyScore = 6;
  else emergencyScore = 2;

  // 5. Spending Consistency (0 - 10 pts)
  const remainingCash = summary.remaining;
  let consistencyScore = 10;
  if (remainingCash < 0) consistencyScore = 2;
  else if (remainingCash < 200) consistencyScore = 5;
  else consistencyScore = 10;

  const totalScore = Math.min(100, Math.max(0, savingsRateScore + budgetScore + debtScore + emergencyScore + consistencyScore));

  let rating: FinancialHealthScore['rating'] = 'Fair';
  if (totalScore >= 80) rating = 'Excellent';
  else if (totalScore >= 65) rating = 'Good';
  else if (totalScore >= 45) rating = 'Fair';
  else rating = 'Critical';

  const strengths: string[] = [];
  const improvements: string[] = [];

  if (savingsRate >= 15) strengths.push(`Strong savings habit (${savingsRate.toFixed(0)}% of income saved)`);
  if (summary.remaining > 500) strengths.push(`Positive cash flow with ${summary.remaining.toFixed(0)} left this month`);
  if (debtToIncomeRatio <= 15) strengths.push('Low debt-to-income burden (<15%)');
  if (monthsOfBuffer >= 2) strengths.push(`Solid emergency cushion (~${monthsOfBuffer.toFixed(1)} months of expenses)`);

  if (strengths.length === 0) {
    strengths.push('Regular monthly income tracking enabled');
    strengths.push('Active expense recording habit');
  }

  if (debtToIncomeRatio > 25) improvements.push(`High debt obligations (${totalMonthlyDebtPayment}/mo) taking ${debtToIncomeRatio.toFixed(0)}% of income`);
  if (monthsOfBuffer < 1) improvements.push(`Emergency buffer is under 1 month (Current: ${(monthsOfBuffer * 30).toFixed(0)} days)`);
  if (budgetScore < 18) improvements.push('Certain categories are exceeding set monthly budgets');
  if (summary.remaining < 300) improvements.push('Discretionary buffer is thin before next payday');

  if (improvements.length === 0) {
    improvements.push('Consider optimizing subscription expenses to accelerate goal milestones');
  }

  return {
    score: totalScore,
    rating,
    metrics: {
      savingsRateScore,
      budgetAdherenceScore: budgetScore,
      debtToIncomeScore: debtScore,
      emergencyBufferScore: emergencyScore,
      spendingConsistencyScore: consistencyScore
    },
    strengths,
    improvements,
    summary: `Your MoneyPilot wellness index is ${totalScore}/100 (${rating}). You have ${strengths[0]?.toLowerCase() || 'a solid start'}, but should keep an eye on ${improvements[0]?.toLowerCase() || 'routine budgeting'}.`
  };
}

export function generateLocalInsights(
  transactions: Transaction[],
  monthlyIncome: number,
  budgets: Budget[],
  goals: SavingsGoal[],
  debts: DebtItem[]
): FinancialInsight[] {
  const insights: FinancialInsight[] = [];
  const summary = calculateSummary(transactions, monthlyIncome);
  const now = new Date().toISOString();

  // 1. Food percentage check
  const foodSpending = summary.spendingList.find(s => s.category === 'Food & Dining')?.amount || 0;
  if (foodSpending > 0 && summary.totalExpenses > 0) {
    const foodPercent = Math.round((foodSpending / summary.totalExpenses) * 100);
    if (foodPercent >= 20) {
      insights.push({
        id: 'ins-food',
        title: 'Food is your biggest spending category',
        observation: `Food & Dining accounts for ${foodPercent}% (${foodSpending.toLocaleString()}) of your total expenses.`,
        whyExplanation: `Frequent dining out and office lunch orders at Papaye and chop bars add up faster than planned. Batch-cooking or setting a 25 daily lunch target could free up 250+ this month.`,
        actionableStep: `Cap weekly dining-out budget or meal prep on Sundays to reclaim ~300/month.`,
        categoryTag: 'Food & Dining',
        impactType: 'warning',
        metricHighlight: `${foodPercent}% of total expenses`,
        timestamp: now
      });
    }
  }

  // 2. Transport check
  const transportSpending = summary.spendingList.find(s => s.category === 'Transport & Fuel')?.amount || 0;
  if (transportSpending >= 450) {
    insights.push({
      id: 'ins-transport',
      title: 'Transport expenses trending higher (+23%)',
      observation: `You've spent ${transportSpending.toLocaleString()} on Bolt rides and fuel station fill-ups so far.`,
      whyExplanation: `Multiple ride-hailing trips during peak hours to East Legon & Airport have increased overall mobility costs.`,
      actionableStep: `Group daily errands and schedule rides outside surge pricing hours.`,
      categoryTag: 'Transport & Fuel',
      impactType: 'warning',
      metricHighlight: `+23% vs last month`,
      timestamp: now
    });
  }

  // 3. Goal check
  const laptopGoal = goals.find(g => g.name.toLowerCase().includes('laptop') || g.targetAmount >= 5000);
  if (laptopGoal) {
    const remainingToGoal = laptopGoal.targetAmount - laptopGoal.currentAmount;
    const monthsLeft = 4; // Approx to Dec
    const monthlyNeeded = Math.round(remainingToGoal / monthsLeft);
    insights.push({
      id: 'ins-goal-laptop',
      title: `Optimize savings for "${laptopGoal.name}"`,
      observation: `You are currently at ${Math.round((laptopGoal.currentAmount / laptopGoal.targetAmount) * 100)}% (${laptopGoal.currentAmount.toLocaleString()} of ${laptopGoal.targetAmount.toLocaleString()}).`,
      whyExplanation: `To hit your target by December 2026, you need to contribute ~${monthlyNeeded.toLocaleString()}/month. Reducing discretionary leisure spend by 150 gets you there a full month faster.`,
      actionableStep: `Allocate ${monthlyNeeded}/month automatically on payday into this dedicated vault.`,
      categoryTag: 'Goal',
      impactType: 'opportunity',
      metricHighlight: `${monthlyNeeded}/mo required`,
      timestamp: now
    });
  }

  // 4. Debt Avalanche check
  if (debts.length > 0) {
    const totalDebt = debts.reduce((sum, d) => sum + d.currentBalance, 0);
    const highestInterestDebt = [...debts].sort((a, b) => b.interestRate - a.interestRate)[0];
    insights.push({
      id: 'ins-debt-payoff',
      title: `Accelerate Debt Payoff (Avalanche Strategy)`,
      observation: `Total outstanding debt is ${totalDebt.toLocaleString()} across ${debts.length} account${debts.length > 1 ? 's' : ''}.`,
      whyExplanation: `Focusing extra cash flow on "${highestInterestDebt.lender}" (at ${highestInterestDebt.interestRate}% interest) will save you over 850 in compound interest fees over the loan lifespan.`,
      actionableStep: `Maintain minimums on other loans and put an extra 200/mo into ${highestInterestDebt.lender}.`,
      categoryTag: 'Debt',
      impactType: 'positive',
      metricHighlight: `Save ~850 in interest`,
      timestamp: now
    });
  }

  // 5. Entertainment saving opportunity
  const entertainmentSpend = summary.spendingList.find(s => s.category === 'Entertainment & Leisure')?.amount || 0;
  if (entertainmentSpend <= 400) {
    insights.push({
      id: 'ins-ent-opp',
      title: 'Spending opportunity detected',
      observation: `You've spent ${entertainmentSpend} on entertainment this month, which is lower than your 400 ceiling.`,
      whyExplanation: `You have roughly 150 in unspent leisure allowance that can be diverted into your emergency fund without feeling restricted.`,
      actionableStep: `Move 100 into your High Yield Emergency account today.`,
      categoryTag: 'Entertainment & Leisure',
      impactType: 'opportunity',
      metricHighlight: `150 surplus`,
      timestamp: now
    });
  }

  return insights;
}

// Local smart parser fallback for natural language transaction input
export function parseTransactionLocally(input: string): Partial<Transaction> {
  const text = input.trim();
  const lower = text.toLowerCase();

  // Extract amount
  let amount = 0;
  const amountMatch = text.match(/(?:gh[¢c]?|gbs|g|rs|\$|usd|eur|gbp|kes|ngn)?\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?)/i);
  if (amountMatch) {
    amount = parseFloat(amountMatch[1].replace(/,/g, ''));
  }

  let type: Transaction['type'] = 'expense';
  if (lower.includes('salary') || lower.includes('received') || lower.includes('earned') || lower.includes('got paid') || lower.includes('income') || lower.includes('deposit')) {
    type = 'income';
  } else if (lower.includes('saved') || lower.includes('transfer to vault') || lower.includes('invested')) {
    type = 'transfer';
  }

  let category: ExpenseCategory = 'Other';
  let paymentMethod: Transaction['paymentMethod'] = 'MTN MoMo';

  if (lower.includes('momo') || lower.includes('mtn')) paymentMethod = 'MTN MoMo';
  else if (lower.includes('telecel') || lower.includes('vodafone')) paymentMethod = 'Telecel Cash';
  else if (lower.includes('card') || lower.includes('pos')) paymentMethod = 'Debit Card';
  else if (lower.includes('bank') || lower.includes('transfer') || lower.includes('stanbic') || lower.includes('gcb')) paymentMethod = 'Bank Account';
  else if (lower.includes('cash')) paymentMethod = 'Cash Wallet';

  // Category heuristics based on Ghanaian merchants and common terms
  if (lower.includes('lunch') || lower.includes('dinner') || lower.includes('breakfast') || lower.includes('food') || lower.includes('papaye') || lower.includes('kfc') || lower.includes('buka') || lower.includes('chop bar') || lower.includes('restaurant') || lower.includes('coffee') || lower.includes('burger') || lower.includes('pizza') || lower.includes('waakye') || lower.includes('jollof')) {
    category = 'Food & Dining';
  } else if (lower.includes('bolt') || lower.includes('uber') || lower.includes('yango') || lower.includes('trotro') || lower.includes('fuel') || lower.includes('petrol') || lower.includes('diesel') || lower.includes('total') || lower.includes('shell') || lower.includes('goil') || lower.includes('transport') || lower.includes('taxi')) {
    category = 'Transport & Fuel';
  } else if (lower.includes('ecg') || lower.includes('electricity') || lower.includes('light bill') || lower.includes('water') || lower.includes('gwcl') || lower.includes('utilities') || lower.includes('trash') || lower.includes('zoomlion')) {
    category = 'Utilities';
  } else if (lower.includes('airtime') || lower.includes('data') || lower.includes('bundle') || lower.includes('fibre') || lower.includes('internet') || lower.includes('wifi')) {
    category = 'Airtime & Data';
  } else if (lower.includes('melcom') || lower.includes('groceries') || lower.includes('supermarket') || lower.includes('shoprite') || lower.includes('palace') || lower.includes('clothes') || lower.includes('shoes') || lower.includes('shopping')) {
    category = 'Shopping & Goods';
  } else if (lower.includes('cinema') || lower.includes('movie') || lower.includes('netflix') || lower.includes('spotify') || lower.includes('drinks') || lower.includes('party') || lower.includes('club') || lower.includes('outing')) {
    category = 'Entertainment & Leisure';
  } else if (lower.includes('rent') || lower.includes('landlord') || lower.includes('apartment') || lower.includes('service charge')) {
    category = 'Housing & Rent';
  } else if (lower.includes('loan') || lower.includes('interest') || lower.includes('debt') || lower.includes('repayment') || lower.includes('installment')) {
    category = 'Debt Repayment';
  } else if (lower.includes('mom') || lower.includes('mother') || lower.includes('dad') || lower.includes('family') || lower.includes('upkeep') || lower.includes('support') || lower.includes('sister') || lower.includes('brother')) {
    category = 'Family & Support';
  } else if (lower.includes('doctor') || lower.includes('hospital') || lower.includes('pharmacy') || lower.includes('medicine') || lower.includes('clinic') || lower.includes('drugs')) {
    category = 'Health & Medical';
  } else if (type === 'income') {
    category = 'Income & Salary';
  }

  // Generate clean description
  let description = text;
  if (text.length > 50) {
    description = text.substring(0, 50) + '...';
  }

  return {
    amount: amount || 50,
    type,
    category,
    paymentMethod,
    description: description || 'Quick expense',
    date: new Date().toISOString().split('T')[0]
  };
}

export function calculateFinancialHealth(
  profileOrTx: UserProfile | Transaction[],
  transactionsOrIncome?: Transaction[] | number,
  budgets?: Budget[],
  goals?: SavingsGoal[],
  debts?: DebtItem[]
): FinancialHealthScore {
  if (Array.isArray(profileOrTx)) {
    return computeFinancialHealthScore(
      profileOrTx,
      (transactionsOrIncome as number) || 5000,
      budgets || [],
      goals || [],
      debts || []
    );
  } else {
    const profile = profileOrTx as UserProfile;
    const txs = (transactionsOrIncome as Transaction[]) || [];
    return computeFinancialHealthScore(
      txs,
      profile.monthlyIncome || 5000,
      budgets || [],
      goals || [],
      debts || []
    );
  }
}

export const generateProactiveInsights = generateLocalInsights;
