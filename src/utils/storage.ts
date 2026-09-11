import { 
  UserProfile, 
  Transaction, 
  Budget, 
  SavingsGoal, 
  DebtItem, 
  RecurringExpense, 
  AppNotification,
  ExpenseCategory,
  FinancialInsight
} from '../types';
import { 
  DEFAULT_USER_PROFILE, 
  INITIAL_TRANSACTIONS, 
  INITIAL_BUDGETS, 
  INITIAL_GOALS, 
  INITIAL_DEBTS, 
  INITIAL_RECURRING, 
  INITIAL_NOTIFICATIONS,
  PERSONA_PRESETS 
} from '../data/initialData';

const STORAGE_KEYS = {
  PROFILE: 'moneypilot_user_profile_v1',
  TRANSACTIONS: 'moneypilot_transactions_v1',
  BUDGETS: 'moneypilot_budgets_v1',
  GOALS: 'moneypilot_goals_v1',
  DEBTS: 'moneypilot_debts_v1',
  RECURRING: 'moneypilot_recurring_v1',
  NOTIFICATIONS: 'moneypilot_notifications_v1',
  CATEGORY_RULES: 'moneypilot_category_rules_v1',
  ONBOARDING_DONE: 'moneypilot_onboarding_completed_v1'
};

export function loadSavedProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...parsed, currency: '' };
    }
  } catch (e) {
    console.error('Failed to load profile from storage', e);
  }
  return { ...DEFAULT_USER_PROFILE, currency: '' };
}

export function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

export function loadSavedTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load transactions from storage', e);
  }
  return INITIAL_TRANSACTIONS;
}

export function saveTransactions(txs: Transaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
  } catch (e) {
    console.error('Failed to save transactions', e);
  }
}

export function loadSavedBudgets(): Budget[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load budgets', e);
  }
  return INITIAL_BUDGETS;
}

export function saveBudgets(budgets: Budget[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  } catch (e) {
    console.error('Failed to save budgets', e);
  }
}

export function loadSavedGoals(): SavingsGoal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load goals', e);
  }
  return INITIAL_GOALS;
}

export function saveGoals(goals: SavingsGoal[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  } catch (e) {
    console.error('Failed to save goals', e);
  }
}

export function loadSavedDebts(): DebtItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DEBTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load debts', e);
  }
  return INITIAL_DEBTS;
}

export function saveDebts(debts: DebtItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts));
  } catch (e) {
    console.error('Failed to save debts', e);
  }
}

export function loadSavedRecurring(): RecurringExpense[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECURRING);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load recurring bills', e);
  }
  return INITIAL_RECURRING;
}

export function saveRecurring(recurring: RecurringExpense[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(recurring));
  } catch (e) {
    console.error('Failed to save recurring', e);
  }
}

export function loadSavedNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load notifications', e);
  }
  return INITIAL_NOTIFICATIONS;
}

export function saveNotifications(notifs: AppNotification[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  } catch (e) {
    console.error('Failed to save notifications', e);
  }
}

// Category learning rules (merchant keyword -> category mapping)
export function loadCategoryRules(): Record<string, ExpenseCategory> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORY_RULES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load category rules', e);
  }
  return {
    'melcom': 'Shopping & Goods',
    'papaye': 'Food & Dining',
    'buka': 'Food & Dining',
    'ecg': 'Utilities',
    'gwcl': 'Utilities',
    'bolt': 'Transport & Fuel',
    'uber': 'Transport & Fuel',
    'total': 'Transport & Fuel'
  };
}

export function learnCategoryRule(merchantOrKeyword: string, category: ExpenseCategory): void {
  try {
    const key = merchantOrKeyword.toLowerCase().trim();
    if (!key || key.length < 3) return;
    const current = loadCategoryRules();
    current[key] = category;
    localStorage.setItem(STORAGE_KEYS.CATEGORY_RULES, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to learn category rule', e);
  }
}

export function loadSavedInsights(): FinancialInsight[] {
  try {
    const raw = localStorage.getItem('moneypilot_insights_v1');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load insights', e);
  }
  return [];
}

export function saveInsights(insights: FinancialInsight[]): void {
  try {
    localStorage.setItem('moneypilot_insights_v1', JSON.stringify(insights));
  } catch (e) {
    console.error('Failed to save insights', e);
  }
}

export const loadUserProfile = loadSavedProfile;
export const saveUserProfile = saveProfile;
export const loadTransactions = loadSavedTransactions;
export const loadBudgets = loadSavedBudgets;
export const loadSavingsGoals = loadSavedGoals;
export const saveSavingsGoals = saveGoals;
export const loadDebts = loadSavedDebts;
export const loadRecurringItems = loadSavedRecurring;
export const saveRecurringItems = saveRecurring;
export const loadInsights = loadSavedInsights;

export function resetToPersona(personaKey: 'busy_pro' | 'saver' | 'debt_manager' | 'new_user') {
  const preset = PERSONA_PRESETS[personaKey];
  if (!preset) return;
  
  const newProfile: UserProfile = {
    ...DEFAULT_USER_PROFILE,
    ...preset.profile
  };

  const presetTxs = 'transactions' in preset ? (preset.transactions as Transaction[]) : INITIAL_TRANSACTIONS;
  const presetBudgets = 'budgets' in preset ? (preset.budgets as Budget[]) : INITIAL_BUDGETS;
  const presetRecurring = 'recurring' in preset ? (preset.recurring as RecurringExpense[]) : INITIAL_RECURRING;
  const presetNotifs = 'notifications' in preset ? (preset.notifications as AppNotification[]) : INITIAL_NOTIFICATIONS;

  saveProfile(newProfile);
  saveGoals(preset.goals as SavingsGoal[]);
  saveDebts(preset.debts as DebtItem[]);
  saveTransactions(presetTxs);
  saveBudgets(presetBudgets);
  saveRecurring(presetRecurring);
  saveNotifications(presetNotifs);
  saveInsights([]);
}

export function applyPersonaPreset(personaKey: string) {
  const key = (personaKey === 'busy_pro' || personaKey === 'saver' || personaKey === 'debt_manager' || personaKey === 'new_user') 
    ? personaKey 
    : 'busy_pro';
  
  resetToPersona(key);

  const preset = PERSONA_PRESETS[key] || PERSONA_PRESETS['busy_pro'];
  const presetTxs = 'transactions' in preset ? (preset.transactions as Transaction[]) : INITIAL_TRANSACTIONS;
  const presetBudgets = 'budgets' in preset ? (preset.budgets as Budget[]) : INITIAL_BUDGETS;
  const presetRecurring = 'recurring' in preset ? (preset.recurring as RecurringExpense[]) : INITIAL_RECURRING;
  const presetNotifs = 'notifications' in preset ? (preset.notifications as AppNotification[]) : INITIAL_NOTIFICATIONS;

  return {
    profile: { ...DEFAULT_USER_PROFILE, ...preset.profile } as UserProfile,
    transactions: presetTxs,
    budgets: presetBudgets,
    goals: preset.goals as SavingsGoal[],
    debts: preset.debts as DebtItem[],
    recurring: presetRecurring,
    notifications: presetNotifs,
    insights: []
  };
}
