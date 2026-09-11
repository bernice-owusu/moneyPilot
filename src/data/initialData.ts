import { 
  UserProfile, 
  Transaction, 
  Budget, 
  SavingsGoal, 
  DebtItem, 
  RecurringExpense,
  AppNotification
} from '../types';

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Kwame Mensah',
  email: 'kwame.mensah@example.com',
  phone: '+233 24 123 4567',
  monthlyIncome: 6000,
  payFrequency: 'Monthly',
  currency: '',
  selectedPersona: 'busy_pro',
  connectedAccounts: [
    {
      id: 'acc-1',
      name: 'MTN Mobile Money',
      type: 'MTN MoMo',
      balance: 1420.50,
      accountNumberMask: '024 •••• 4567',
      lastSynced: 'Just now'
    },
    {
      id: 'acc-2',
      name: 'Stanbic Salary Account',
      type: 'Bank Account',
      balance: 4850.00,
      accountNumberMask: '904 •••• 8821',
      lastSynced: '10 mins ago'
    },
    {
      id: 'acc-3',
      name: 'Physical Cash Wallet',
      type: 'Cash Wallet',
      balance: 380.00,
      accountNumberMask: 'Wallet',
      lastSynced: 'Today'
    }
  ],
  notificationPreferences: {
    budgetAlerts: true,
    billReminders: true,
    savingsMilestones: true,
    weeklyInsights: true
  }
};

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    amount: 6000,
    type: 'income',
    category: 'Income & Salary',
    description: 'Monthly Salary Deposit - TechCorp Ghana',
    merchant: 'Stanbic Bank Direct',
    paymentMethod: 'Bank Account',
    date: '2026-08-01',
    isAutoImported: true
  },
  {
    id: 'tx-2',
    amount: 350,
    type: 'expense',
    category: 'Utilities',
    description: 'ECG Electricity Prepaid Power',
    merchant: 'Electricity Company of Ghana',
    paymentMethod: 'MTN MoMo',
    date: '2026-08-02',
    isAutoImported: true
  },
  {
    id: 'tx-3',
    amount: 280,
    type: 'expense',
    category: 'Airtime & Data',
    description: 'MTN Fibre Broadband 100GB Bundle',
    merchant: 'MTN Ghana',
    paymentMethod: 'MTN MoMo',
    date: '2026-08-03',
    isAutoImported: true
  },
  {
    id: 'tx-4',
    amount: 145,
    type: 'expense',
    category: 'Food & Dining',
    description: 'Lunch & Drinks at Papaye Osu',
    merchant: 'Papaye Fast Foods',
    paymentMethod: 'MTN MoMo',
    date: '2026-08-05',
    isAutoImported: false
  },
  {
    id: 'tx-5',
    amount: 450,
    type: 'expense',
    category: 'Shopping & Goods',
    description: 'Monthly Household Groceries',
    merchant: 'Melcom Plus Accra',
    paymentMethod: 'Debit Card',
    date: '2026-08-06',
    isAutoImported: true
  },
  {
    id: 'tx-6',
    amount: 120,
    type: 'expense',
    category: 'Transport & Fuel',
    description: 'Bolt rides to East Legon & Airport',
    merchant: 'Bolt Ghana',
    paymentMethod: 'MTN MoMo',
    date: '2026-08-08',
    isAutoImported: true
  },
  {
    id: 'tx-7',
    amount: 380,
    type: 'expense',
    category: 'Transport & Fuel',
    description: 'Total Petroleum Fuel Station fill-up',
    merchant: 'TotalEnergies Ghana',
    paymentMethod: 'Debit Card',
    date: '2026-08-10',
    isAutoImported: true
  },
  {
    id: 'tx-8',
    amount: 220,
    type: 'expense',
    category: 'Food & Dining',
    description: 'Dinner & grilled tilapia at Buka Restaurant',
    merchant: 'Buka Restaurant',
    paymentMethod: 'Cash Wallet',
    date: '2026-08-12',
    isAutoImported: false
  },
  {
    id: 'tx-9',
    amount: 500,
    type: 'expense',
    category: 'Family & Support',
    description: 'Momo upkeep transfer for Mother',
    merchant: 'MTN Mobile Money Transfer',
    paymentMethod: 'MTN MoMo',
    date: '2026-08-14',
    isAutoImported: true
  },
  {
    id: 'tx-10',
    amount: 485,
    type: 'expense',
    category: 'Food & Dining',
    description: 'Weekly office lunches & coffee',
    merchant: 'Local Chop Bars & Cafes',
    paymentMethod: 'MTN MoMo',
    date: '2026-08-17',
    isAutoImported: false
  },
  {
    id: 'tx-11',
    amount: 270,
    type: 'expense',
    category: 'Utilities',
    description: 'Ghana Water Company Bill (GWCL)',
    merchant: 'Ghana Water Co',
    paymentMethod: 'MTN MoMo',
    date: '2026-08-19',
    isAutoImported: true
  },
  {
    id: 'tx-12',
    amount: 150,
    type: 'expense',
    category: 'Shopping & Goods',
    description: 'Pharmacy vitamins & toiletries',
    merchant: 'Top Up Pharmacy',
    paymentMethod: 'Cash Wallet',
    date: '2026-08-20',
    isAutoImported: false
  },
  {
    id: 'tx-13',
    amount: 500,
    type: 'expense',
    category: 'Debt Repayment',
    description: 'Bank Loan A Monthly Installment',
    merchant: 'Stanbic Loan Services',
    paymentMethod: 'Bank Account',
    date: '2026-08-21',
    isAutoImported: true
  },
  {
    id: 'tx-14',
    amount: 1000,
    type: 'transfer',
    category: 'Savings & Investment',
    description: 'Auto-transfer to High Yield Emergency Fund',
    merchant: 'Databank / Treasury Vault',
    paymentMethod: 'Bank Account',
    date: '2026-08-02',
    isAutoImported: true
  },
  {
    id: 'tx-15',
    amount: 380,
    type: 'expense',
    category: 'Entertainment & Leisure',
    description: 'Weekend Cinema & Drinks with friends',
    merchant: 'Silverbird Cinemas',
    paymentMethod: 'MTN MoMo',
    date: '2026-08-22',
    isAutoImported: false
  }
];

export const INITIAL_BUDGETS: Budget[] = [
  {
    id: 'b-1',
    category: 'Food & Dining',
    monthlyLimit: 850,
    period: '2026-08'
  },
  {
    id: 'b-2',
    category: 'Transport & Fuel',
    monthlyLimit: 500,
    period: '2026-08'
  },
  {
    id: 'b-3',
    category: 'Utilities',
    monthlyLimit: 900,
    period: '2026-08'
  },
  {
    id: 'b-4',
    category: 'Shopping & Goods',
    monthlyLimit: 600,
    period: '2026-08'
  },
  {
    id: 'b-5',
    category: 'Entertainment & Leisure',
    monthlyLimit: 400,
    period: '2026-08'
  },
  {
    id: 'b-6',
    category: 'Airtime & Data',
    monthlyLimit: 300,
    period: '2026-08'
  }
];

export const INITIAL_GOALS: SavingsGoal[] = [
  {
    id: 'g-1',
    name: 'Emergency Buffer Fund',
    targetAmount: 5000,
    currentAmount: 2000,
    targetDate: '2026-12-31',
    category: 'Safety Net',
    monthlyContributionTarget: 600,
    isCompleted: false
  },
  {
    id: 'g-2',
    name: 'New MacBook Pro / Work Laptop',
    targetAmount: 8000,
    currentAmount: 3200,
    targetDate: '2026-12-15',
    category: 'Career & Tech',
    monthlyContributionTarget: 800,
    isCompleted: false
  }
];

export const INITIAL_DEBTS: DebtItem[] = [
  {
    id: 'd-1',
    lender: 'Stanbic Personal Loan A',
    originalAmount: 8000,
    currentBalance: 5000,
    interestRate: 18.5,
    minimumMonthlyPayment: 500,
    dueDate: '25th of month',
    startDate: '2025-10-01',
    notes: 'Payroll deduction for initial home furnishings'
  },
  {
    id: 'd-2',
    lender: 'Device Installment Plan (iStore GH)',
    originalAmount: 4500,
    currentBalance: 3200,
    interestRate: 12.0,
    minimumMonthlyPayment: 400,
    dueDate: '15th of month',
    startDate: '2026-02-01',
    notes: 'Phone purchase plan'
  }
];

export const INITIAL_RECURRING: RecurringExpense[] = [
  {
    id: 'rec-1',
    name: 'ECG Electricity Token',
    amount: 350,
    category: 'Utilities',
    billingCycle: 'monthly',
    nextDueDate: '2026-09-02',
    paymentMethod: 'MTN MoMo',
    autoDeduct: false
  },
  {
    id: 'rec-2',
    name: 'MTN Home Fibre Internet',
    amount: 280,
    category: 'Airtime & Data',
    billingCycle: 'monthly',
    nextDueDate: '2026-09-03',
    paymentMethod: 'MTN MoMo',
    autoDeduct: true
  },
  {
    id: 'rec-3',
    name: 'Apartment Maintenance & Water Levy',
    amount: 250,
    category: 'Housing & Rent',
    billingCycle: 'monthly',
    nextDueDate: '2026-08-30',
    paymentMethod: 'Bank Account',
    autoDeduct: true
  },
  {
    id: 'rec-4',
    name: 'Netflix & Spotify Family Subscriptions',
    amount: 110,
    category: 'Entertainment & Leisure',
    billingCycle: 'monthly',
    nextDueDate: '2026-08-28',
    paymentMethod: 'Debit Card',
    autoDeduct: true
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Food Budget Alert (90% Used)',
    message: 'You have spent 850 of your 850 Food & Dining budget this month.',
    type: 'budget',
    date: '1 hour ago',
    read: false
  },
  {
    id: 'notif-2',
    title: 'Upcoming Bill: MTN Fibre',
    message: '280 subscription payment due in 3 days on MTN MoMo.',
    type: 'bill',
    date: '5 hours ago',
    read: false
  },
  {
    id: 'notif-3',
    title: 'Goal Progress',
    message: 'You are 1,800 away from your MacBook Pro savings target milestone!',
    type: 'savings',
    date: 'Yesterday',
    read: true
  },
  {
    id: 'notif-4',
    title: 'Weekly Financial Insight',
    message: 'Your transport spending was 23% higher this week compared to last month average.',
    type: 'insight',
    date: '2 days ago',
    read: true
  }
];

// Presets for the 3 user personas outlined in the PRD:
export const PERSONA_PRESETS = {
  busy_pro: {
    profile: {
      name: 'Kwame Mensah',
      email: 'kwame.mensah@example.com',
      phone: '+233 24 123 4567',
      monthlyIncome: 6000,
      payFrequency: 'Monthly' as const,
      currency: '',
      selectedPersona: 'busy_pro' as const,
    },
    goals: [
      {
        id: 'g-1',
        name: 'Emergency Fund (3 Months)',
        targetAmount: 12000,
        currentAmount: 4500,
        targetDate: '2027-04-01',
        category: 'Safety Net',
        monthlyContributionTarget: 1000,
        isCompleted: false
      }
    ],
    debts: [
      {
        id: 'd-1',
        lender: 'Car Maintenance Loan',
        originalAmount: 4000,
        currentBalance: 1800,
        interestRate: 15.0,
        minimumMonthlyPayment: 450,
        dueDate: '20th of month',
        startDate: '2026-01-10'
      }
    ]
  },
  saver: {
    profile: {
      name: 'Akua Serwaa',
      email: 'akua.serwaa@example.com',
      phone: '+233 50 987 6543',
      monthlyIncome: 4000,
      payFrequency: 'Monthly' as const,
      currency: '',
      selectedPersona: 'saver' as const,
    },
    goals: [
      {
        id: 'g-1',
        name: 'New Business / Laptop Fund',
        targetAmount: 10000,
        currentAmount: 3200,
        targetDate: '2026-12-20',
        category: 'Tech & Career',
        monthlyContributionTarget: 850,
        isCompleted: false
      },
      {
        id: 'g-2',
        name: 'Holiday Trip to Cape Coast',
        targetAmount: 2500,
        currentAmount: 1800,
        targetDate: '2026-11-01',
        category: 'Leisure',
        monthlyContributionTarget: 350,
        isCompleted: false
      }
    ],
    debts: []
  },
  debt_manager: {
    profile: {
      name: 'Kofi Boateng',
      email: 'kofi.boateng@example.com',
      phone: '+233 27 555 4321',
      monthlyIncome: 5500,
      payFrequency: 'Monthly' as const,
      currency: '',
      selectedPersona: 'debt_manager' as const,
    },
    goals: [
      {
        id: 'g-1',
        name: 'Starter Emergency Buffer',
        targetAmount: 2000,
        currentAmount: 500,
        targetDate: '2026-10-30',
        category: 'Safety Net',
        monthlyContributionTarget: 300,
        isCompleted: false
      }
    ],
    debts: [
      {
        id: 'd-1',
        lender: 'Commercial Bank Loan A',
        originalAmount: 8000,
        currentBalance: 5000,
        interestRate: 18.5,
        minimumMonthlyPayment: 500,
        dueDate: '25th of month',
        startDate: '2025-11-01'
      },
      {
        id: 'd-2',
        lender: 'Family Support Obligation',
        originalAmount: 4500,
        currentBalance: 3200,
        interestRate: 0.0,
        minimumMonthlyPayment: 400,
        dueDate: '1st of month',
        startDate: '2026-01-01'
      },
      {
        id: 'd-3',
        lender: 'Microfinance Credit Line',
        originalAmount: 5000,
        currentBalance: 4300,
        interestRate: 24.0,
        minimumMonthlyPayment: 600,
        dueDate: '10th of month',
        startDate: '2026-03-01'
      }
    ]
  },
  new_user: {
    profile: {
      name: 'Ama Asante',
      email: 'ama.asante@example.com',
      phone: '+233 20 876 5432',
      monthlyIncome: 3500,
      payFrequency: 'Monthly' as const,
      currency: '',
      selectedPersona: 'new_user' as const,
      connectedAccounts: [
        {
          id: 'acc-new-1',
          name: 'MTN Mobile Money',
          type: 'MTN MoMo' as const,
          balance: 350.00,
          accountNumberMask: '020 •••• 5432',
          lastSynced: 'Just now'
        }
      ]
    },
    goals: [] as SavingsGoal[],
    debts: [] as DebtItem[],
    budgets: [] as Budget[],
    transactions: [] as Transaction[],
    recurring: [] as RecurringExpense[],
    notifications: [
      {
        id: 'notif-welcome',
        title: '👋 Welcome to MoneyPilot, Ama!',
        message: 'Your account is ready with a clean slate. Set up your monthly category budgets, create a savings target, or add your first transaction.',
        type: 'insight' as const,
        date: 'Just now',
        read: false
      }
    ]
  }
};
