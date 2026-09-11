export type TransactionType = 'expense' | 'income' | 'transfer';

export type PaymentMethod = 
  | 'MTN MoMo'
  | 'Telecel Cash'
  | 'AT Money'
  | 'Bank Account'
  | 'Debit Card'
  | 'Cash Wallet';

export type ExpenseCategory =
  | 'Food & Dining'
  | 'Transport & Fuel'
  | 'Housing & Rent'
  | 'Utilities'
  | 'Airtime & Data'
  | 'Shopping & Goods'
  | 'Entertainment & Leisure'
  | 'Health & Medical'
  | 'Education'
  | 'Family & Support'
  | 'Debt Repayment'
  | 'Savings & Investment'
  | 'Income & Salary'
  | 'Freelance & Business'
  | 'Other';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: ExpenseCategory;
  description: string;
  merchant?: string;
  paymentMethod: PaymentMethod;
  date: string; // ISO string YYYY-MM-DD or full
  isAutoImported?: boolean;
  notes?: string;
}

export interface Budget {
  id: string;
  category: ExpenseCategory;
  monthlyLimit: number;
  period: string; // e.g. '2026-08'
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  category?: string;
  monthlyContributionTarget?: number;
  isCompleted?: boolean;
}

export interface DebtItem {
  id: string;
  lender: string;
  originalAmount: number;
  currentBalance: number;
  interestRate: number; // percentage, e.g. 18
  minimumMonthlyPayment: number;
  dueDate: string; // Day of month or YYYY-MM-DD
  startDate: string;
  notes?: string;
}

export interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  billingCycle: 'monthly' | 'weekly' | 'annual' | 'yearly';
  nextDueDate?: string; // YYYY-MM-DD
  dueDay?: number;
  paymentMethod: PaymentMethod;
  autoDeduct?: boolean;
  isAutoDeduct?: boolean;
  isPaidThisPeriod?: boolean;
}

export type RecurringItem = RecurringExpense;

export interface FinancialHealthScore {
  score: number; // 0 - 100
  rating: 'Critical' | 'Fair' | 'Good' | 'Excellent';
  metrics: {
    savingsRateScore: number; // 0-25
    budgetAdherenceScore: number; // 0-25
    debtToIncomeScore: number; // 0-20
    emergencyBufferScore: number; // 0-20
    spendingConsistencyScore: number; // 0-10
  };
  strengths: string[];
  improvements: string[];
  summary: string;
}

export interface FinancialInsight {
  id: string;
  title: string;
  observation: string;
  whyExplanation: string;
  actionableStep: string;
  categoryTag: ExpenseCategory | 'General' | 'Goal' | 'Debt' | 'Budget';
  impactType: 'positive' | 'warning' | 'opportunity' | 'alert';
  metricHighlight?: string; // e.g. "+23% vs last month"
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  actionableSuggestion?: string;
  suggestedPrompts?: string[];
  financialBreakdown?: {
    label: string;
    value: string;
  }[];
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  monthlyIncome: number;
  payFrequency: 'Monthly' | 'Bi-weekly' | 'Weekly' | 'Irregular';
  currency: string;
  selectedPersona: 'busy_pro' | 'saver' | 'debt_manager' | 'new_user' | 'custom';
  connectedAccounts: {
    id: string;
    name: string;
    type: PaymentMethod;
    balance: number;
    accountNumberMask: string;
    lastSynced: string;
  }[];
  notificationPreferences: {
    budgetAlerts: boolean;
    billReminders: boolean;
    savingsMilestones: boolean;
    weeklyInsights: boolean;
  };
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'budget' | 'bill' | 'savings' | 'insight';
  date: string;
  read: boolean;
}
