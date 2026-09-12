import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Sparkles,
  Wallet,
  Shield,
  Bot as BotIcon,
} from 'lucide-react';

import allAccountsCard from '../design/assets/cards/all_accounts_card.png';
import brighterTomorrowCard from '../design/assets/cards/build_brighter_tomorrows.png';
import smarterSpendingCard from '../design/assets/cards/smarter_spending_happier_living.png';
import savingsVaultCard from '../design/assets/cards/savings_vault_card.png';

import { BrandWordmark } from './components/ui/BrandWordmark';
import { EditorialHeroHeading } from './components/ui/EditorialHeroHeading';
import { EditorialPhoto } from './components/ui/EditorialPhoto';
import { Button } from './components/ui/Button';
import PhoneMockupBasic from './components/ui/phone-mockups-1';

import { Navigation, TabType } from './components/Navigation';
import { Navbar } from './components/Navbar';
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
  ExpenseCategory,
  AppNotification,
} from './types';

import {
  loadUserProfile,
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
  applyPersonaPreset,
  loadSavedNotifications,
  saveNotifications,
} from './utils/storage';

import {
  calculateFinancialHealth,
  generateProactiveInsights,
} from './utils/finance';

const lifestylePhotos = {
  market:
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80',
  city:
    'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=800&q=80',
  cafe:
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80',
};

type AppMode = 'landing' | 'app';

export const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('landing');
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [openFaq, setOpenFaq] = useState(0);
  const [email, setEmail] = useState('');

  const [profile, setProfile] = useState<UserProfile>(() =>
    loadUserProfile()
  );

  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    loadTransactions()
  );

  const [budgets, setBudgets] = useState<Budget[]>(() =>
    loadBudgets()
  );

  const [goals, setGoals] = useState<SavingsGoal[]>(() =>
    loadSavingsGoals()
  );

  const [debts, setDebts] = useState<DebtItem[]>(() =>
    loadDebts()
  );

  const [recurringItems, setRecurringItems] = useState<RecurringItem[]>(() =>
    loadRecurringItems()
  );

  const [insights, setInsights] = useState<FinancialInsight[]>(() =>
    loadInsights()
  );

  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    loadSavedNotifications()
  );

  const [showTxModal, setShowTxModal] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [isRefreshingInsights, setIsRefreshingInsights] = useState(false);

  const healthScore = useMemo(
    () =>
      calculateFinancialHealth(
        profile,
        transactions,
        budgets,
        goals,
        debts
      ),
    [profile, transactions, budgets, goals, debts]
  );

  useEffect(() => {
    if (insights.length === 0) {
      const generated = generateProactiveInsights(
        transactions,
        profile.monthlyIncome,
        budgets,
        goals,
        debts
      );

      setInsights(generated);
      saveInsights(generated);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currency = profile.currency || 'GHS ';

  const enterApp = (tab: TabType = 'dashboard') => {
    setActiveTab(tab);
    setMode('app');
    window.scrollTo(0, 0);
  };

  const backToLanding = () => {
    setMode('landing');
    window.scrollTo(0, 0);
  };

  const handleSelectPersona = (
    personaKey:
      | 'busy_pro'
      | 'saver'
      | 'debt_manager'
      | 'new_user'
  ) => {
    const preset = applyPersonaPreset(personaKey);

    setProfile(preset.profile);
    setTransactions(preset.transactions);
    setBudgets(preset.budgets);
    setGoals(preset.goals);
    setDebts(preset.debts);
    setRecurringItems(preset.recurring);
    setNotifications(preset.notifications);

    const generated = generateProactiveInsights(
      preset.transactions,
      preset.profile.monthlyIncome,
      preset.budgets,
      preset.goals,
      preset.debts
    );

    setInsights(generated);
    saveInsights(generated);
  };

  const handleAddTransaction = (tx: Transaction) => {
    const next = [tx, ...transactions];

    setTransactions(next);
    saveTransactions(next);
    setShowTxModal(false);
  };

  const handleUpdateTransactionCategory = (
    txId: string,
    newCategory: ExpenseCategory
  ) => {
    const next = transactions.map((t) =>
      t.id === txId
        ? {
            ...t,
            category: newCategory,
          }
        : t
    );

    setTransactions(next);
    saveTransactions(next);
  };

  const handleSaveBudget = (budget: Budget) => {
    const exists = budgets.some((b) => b.id === budget.id);

    const next = exists
      ? budgets.map((b) =>
          b.id === budget.id ? budget : b
        )
      : [...budgets, budget];

    setBudgets(next);
    saveBudgets(next);
  };

  const handleDeleteBudget = (budgetId: string) => {
    const next = budgets.filter(
      (b) => b.id !== budgetId
    );

    setBudgets(next);
    saveBudgets(next);
  };

  const handleSaveGoal = (goal: SavingsGoal) => {
    const exists = goals.some(
      (g) => g.id === goal.id
    );

    const next = exists
      ? goals.map((g) =>
          g.id === goal.id ? goal : g
        )
      : [...goals, goal];

    setGoals(next);
    saveSavingsGoals(next);
  };

  const handleDeleteGoal = (goalId: string) => {
    const next = goals.filter(
      (g) => g.id !== goalId
    );

    setGoals(next);
    saveSavingsGoals(next);
  };

  const handleDepositGoal = (
    goalId: string,
    amount: number
  ) => {
    const next = goals.map((g) =>
      g.id === goalId
        ? {
            ...g,
            currentAmount: Math.min(
              g.targetAmount,
              g.currentAmount + amount
            ),
          }
        : g
    );

    setGoals(next);
    saveSavingsGoals(next);
  };

  const handleSaveDebt = (debt: DebtItem) => {
    const exists = debts.some(
      (d) => d.id === debt.id
    );

    const next = exists
      ? debts.map((d) =>
          d.id === debt.id ? debt : d
        )
      : [...debts, debt];

    setDebts(next);
    saveDebts(next);
  };

  const handleDeleteDebt = (debtId: string) => {
    const next = debts.filter(
      (d) => d.id !== debtId
    );

    setDebts(next);
    saveDebts(next);
  };

  const handlePayDebt = (
    debtId: string,
    amount: number
  ) => {
    const next = debts.map((d) =>
      d.id === debtId
        ? {
            ...d,
            currentBalance: Math.max(
              0,
              d.currentBalance - amount
            ),
          }
        : d
    );

    setDebts(next);
    saveDebts(next);
  };

  const handleSaveRecurring = (
    item: RecurringItem
  ) => {
    const exists = recurringItems.some(
      (r) => r.id === item.id
    );

    const next = exists
      ? recurringItems.map((r) =>
          r.id === item.id ? item : r
        )
      : [...recurringItems, item];

    setRecurringItems(next);
    saveRecurringItems(next);
  };

  const handleDeleteRecurring = (
    itemId: string
  ) => {
    const next = recurringItems.filter(
      (r) => r.id !== itemId
    );

    setRecurringItems(next);
    saveRecurringItems(next);
  };

  const handleMarkRecurringPaid = (
    item: RecurringItem
  ) => {
    const nextDate = item.nextDueDate
      ? new Date(
          new Date(item.nextDueDate).getTime() +
            30 * 86400000
        )
          .toISOString()
          .slice(0, 10)
      : item.nextDueDate;

    handleSaveRecurring({
      ...item,
      nextDueDate: nextDate,
    });
  };

  const handleRefreshInsights = async () => {
    setIsRefreshingInsights(true);

    await new Promise((r) =>
      setTimeout(r, 500)
    );

    const generated = generateProactiveInsights(
      transactions,
      profile.monthlyIncome,
      budgets,
      goals,
      debts
    );

    setInsights(generated);
    saveInsights(generated);
    setIsRefreshingInsights(false);
  };

  const featureCards = [
    {
      title: 'Track Bank & MoMo Together',
      description:
        'Unify your bank accounts, mobile money (MoMo), and cash in one clear view — no more app-hopping.',
      icon: Wallet,
      image: allAccountsCard,
    },
    {
      title: 'Safe Daily Pace',
      description:
        'Know exactly how much you can safely spend before payday, so you stay in control every day.',
      icon: Sparkles,
      image: smarterSpendingCard,
    },
    {
      title: 'Verified Savings Vaults',
      description:
        'Save with purpose and build proof through intentional, trackable transfers you can actually stick to.',
      icon: Shield,
      image: savingsVaultCard,
    },
    {
      title: 'AI Financial Advisor',
      description:
        'Get realistic advice, affordability checks, and smarter next steps tailored to your life in Ghana.',
      icon: BotIcon,
      image: brighterTomorrowCard,
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Connect your money',
      body:
        'Link Absa bank and MTN MoMo securely, then see your full picture in seconds.',
    },
    {
      step: '02',
      title: 'Set your pace',
      body:
        'MoneyPilot maps income, bills, and goals into a safe daily spend you can trust.',
    },
    {
      step: '03',
      title: 'Grow with guidance',
      body:
        'Use vaults, debt plans, and AI advice to move from surviving to building.',
    },
  ];

  const faqs = [
    {
      title:
        'Can I track my bank and MoMo in one place?',
      answer:
        'Yes. MoneyPilot brings your Absa bank account and MTN MoMo together so you can see total balance, track spending, and get personalised insights — all in one secure app.',
    },
    {
      title:
        'How does Safe Daily Pace work?',
      answer:
        'It calculates how much you can safely spend each day based on your income, fixed obligations, and upcoming bills, helping you stay in control without stressing about every purchase.',
    },
    {
      title:
        'What counts as Verified Savings?',
      answer:
        'Verified Savings are money you intentionally move into a protected goal or vault with a clear purpose, so your progress is visible and easier to stick to.',
    },
    {
      title:
        'Can MoneyPilot help me clear debt?',
      answer:
        'Absolutely. It helps you prioritise repayments, forecast the impact of your choices, and show a clearer route to becoming debt-free without sacrificing essentials.',
    },
  ];

  if (mode === 'app') {
    return (
      <div className="dash-shell flex min-h-screen">
        <aside className="dash-sidebar fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col px-4 py-5 lg:flex">
          <div className="mb-6 px-2">
            <button
              type="button"
              onClick={backToLanding}
              className="text-left"
            >
              <BrandWordmark
                variant="light"
                className="!text-[36px]"
              />
            </button>

            <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white/40">
              Pilot console
            </p>
          </div>

          <Navigation
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            insightCount={insights.length}
            isSidebar
          />

          <div className="mt-auto space-y-3 px-1 pb-2">
            <div className="rounded-sm border border-white/10 bg-white/5 p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
                Health score
              </p>

              <p className="font-display mt-1 text-3xl leading-none text-white">
                {Math.round(healthScore.score)}
              </p>

              <button
                type="button"
                onClick={() =>
                  setShowHealthModal(true)
                }
                className="mt-2 text-xs font-semibold text-[#9ec8ff] transition hover:text-white"
              >
                View breakdown →
              </button>
            </div>

            <Button
              variant="primary"
              className="w-full !bg-hero-blue hover:!bg-deep-blue"
              onClick={() =>
                setShowTxModal(true)
              }
            >
              Add transaction
            </Button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col lg:pl-[260px]">
          <Navbar
            profile={profile}
            onSelectPersona={
              handleSelectPersona
            }
            onOpenNewTransaction={() =>
              setShowTxModal(true)
            }
            onOpenNotifications={() => {
              const next = notifications.map(
                (n) => ({
                  ...n,
                  read: true,
                })
              );

              setNotifications(next);
              saveNotifications(next);
            }}
            onBackToLanding={
              backToLanding
            }
            notifications={
              notifications
            }
          />

          <Navigation
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            insightCount={insights.length}
          />

          <main className="flex-1 px-3 pb-24 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pb-10">
            <div className="mx-auto max-w-7xl">
              {activeTab === 'dashboard' && (
                <DashboardView
                  profile={profile}
                  transactions={transactions}
                  budgets={budgets}
                  goals={goals}
                  debts={debts}
                  insights={insights}
                  healthScore={healthScore}
                  onOpenNewTransaction={() =>
                    setShowTxModal(true)
                  }
                  onOpenHealthScoreModal={() =>
                    setShowHealthModal(true)
                  }
                  onNavigateToTab={
                    setActiveTab
                  }
                  onUpdateTransactionCategory={
                    handleUpdateTransactionCategory
                  }
                />
              )}

              {activeTab ===
                'transactions' && (
                <TransactionsView
                  transactions={
                    transactions
                  }
                  currency={currency}
                  onOpenNewTransaction={() =>
                    setShowTxModal(true)
                  }
                  onUpdateCategory={
                    handleUpdateTransactionCategory
                  }
                />
              )}

              {activeTab ===
                'budgets' && (
                <BudgetsView
                  budgets={budgets}
                  transactions={
                    transactions
                  }
                  currency={currency}
                  monthlyIncome={
                    profile.monthlyIncome
                  }
                  onSaveBudget={
                    handleSaveBudget
                  }
                  onDeleteBudget={
                    handleDeleteBudget
                  }
                  onNavigateToTab={
                    setActiveTab
                  }
                />
              )}

              {activeTab ===
                'goals-debts' && (
                <GoalsAndDebtsView
                  goals={goals}
                  debts={debts}
                  transactions={
                    transactions
                  }
                  monthlyIncome={
                    profile.monthlyIncome
                  }
                  currency={currency}
                  onSaveGoal={
                    handleSaveGoal
                  }
                  onDeleteGoal={
                    handleDeleteGoal
                  }
                  onSaveDebt={
                    handleSaveDebt
                  }
                  onDeleteDebt={
                    handleDeleteDebt
                  }
                  onDepositGoal={
                    handleDepositGoal
                  }
                  onPayDebt={
                    handlePayDebt
                  }
                  onNavigateToTab={
                    setActiveTab
                  }
                />
              )}

              {activeTab ===
                'ai-advisor' && (
                <AiAssistantView
                  profile={profile}
                  transactions={
                    transactions
                  }
                  budgets={budgets}
                  goals={goals}
                  debts={debts}
                  insights={insights}
                  healthScore={
                    healthScore
                  }
                  onRefreshInsights={
                    handleRefreshInsights
                  }
                  isRefreshingInsights={
                    isRefreshingInsights
                  }
                />
              )}

              {activeTab ===
                'recurring' && (
                <RecurringBillsView
                  recurringItems={
                    recurringItems
                  }
                  currency={currency}
                  onSaveRecurringItem={
                    handleSaveRecurring
                  }
                  onDeleteRecurringItem={
                    handleDeleteRecurring
                  }
                  onMarkAsPaid={
                    handleMarkRecurringPaid
                  }
                />
              )}
            </div>
          </main>
        </div>

        <TransactionModal
          isOpen={showTxModal}
          onClose={() =>
            setShowTxModal(false)
          }
          onAddTransaction={
            handleAddTransaction
          }
          currency={currency}
        />

        <HealthScoreModal
          isOpen={showHealthModal}
          onClose={() =>
            setShowHealthModal(false)
          }
          healthScore={healthScore}
          currency={currency}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <a
        href="#main"
        className="skip-link"
      >
        Skip to content
      </a>

      {/* HERO */}
      <section className="hero-print min-h-[100svh]">
        <div
          className="hero-cloud"
          aria-hidden="true"
        />

        <header className="page-shell pt-5 sm:pt-6">
          <div className="flex items-center justify-between gap-4">
            <BrandWordmark
              as="a"
              href="#"
              variant="light"
            />

            <nav
              className="hidden items-center gap-8 md:flex"
              aria-label="Primary"
            >
              <a
                href="#features"
                className="ui-nav-link"
              >
                Features
              </a>

              <a
                href="#how-it-works"
                className="ui-nav-link"
              >
                How it works
              </a>

              <a
                href="#faq"
                className="ui-nav-link"
              >
                FAQs
              </a>

              <a
                href="#community"
                className="ui-nav-link"
              >
                Community
              </a>
            </nav>

            <Button
              variant="primary"
              size="md"
              className="shrink-0"
              onClick={() =>
                enterApp()
              }
            >
              Try MoneyPilot

              <ArrowRight
                className="h-4 w-4"
                aria-hidden="true"
              />
            </Button>
          </div>
        </header>

        <div
          id="main"
          className="page-shell relative overflow-hidden pb-10 pt-10 sm:pb-14 sm:pt-14 lg:pb-16 lg:pt-16"
        >
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10 xl:gap-14">

            {/* LEFT — COPY */}
            <div className="relative z-20 flex flex-col items-start text-left lg:col-span-6 xl:col-span-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/90">
                <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-bold text-ink">
                  ABSA
                </span>

                <span className="text-white/70">
                  ×
                </span>

                <span className="rounded bg-ink px-1.5 py-0.5 text-[10px] font-bold text-white">
                  MTN
                </span>

                <span className="hidden text-white/80 sm:inline">
                  Ghana Hackathon Concept
                </span>
              </div>

              <EditorialHeroHeading
                className="mt-7 max-w-[20ch] sm:mt-9 sm:max-w-[24ch] lg:max-w-none"
                align="left"
                setup="The time machine for"
                emphasis="modern day finance in Africa."
              />

              <p className="mt-6 max-w-[440px] text-[16px] font-medium leading-relaxed text-white/90 sm:mt-7 sm:text-[18px]">
                An intelligent personal finance app for everyday
                Ghanaians. Track your bank and MoMo, spend smarter,
                save with confidence, and get real AI guidance for a
                brighter tomorrow.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() =>
                    enterApp()
                  }
                >
                  Get started free

                  <ArrowRight
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                </Button>

                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() =>
                    document
                      .getElementById(
                        'how-it-works'
                      )
                      ?.scrollIntoView({
                        behavior:
                          'smooth',
                      })
                  }
                >
                  See how it works
                </Button>
              </div>
            </div>

            {/* RIGHT — PHONE */}
            <div className="relative z-10 min-w-0 overflow-hidden lg:col-span-6 xl:col-span-6">
              <PhoneMockupBasic />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="paper-section border-t border-ink/5 py-20 sm:py-24"
      >
        <div className="page-shell">
          <div className="max-w-[720px]">
            <p className="section-kicker">
              Core features
            </p>

            <h2 className="editorial-heading mt-4 text-[clamp(40px,5vw,72px)] text-ink">
              Everything you can do

              <span className="mt-1 block text-deep-blue">
                with MoneyPilot
              </span>
            </h2>

            <p className="mt-5 max-w-[560px] text-[17px] leading-relaxed text-muted-gray sm:text-lg">
              An all-in-one personal finance app for everyday
              Ghanaians. Track, plan, save and grow — with local
              support, intelligent tools, and guidance for a brighter
              tomorrow.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {featureCards.map(
              (feature) => {
                const Icon =
                  feature.icon;

                return (
                  <article
                    key={feature.title}
                    className="feature-card flex flex-col overflow-hidden rounded-[4px]"
                  >
                    <div className="aspect-[5/4] overflow-hidden bg-soft-gray">
                      <img
                        src={
                          feature.image
                        }
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-hero-blue/10 text-deep-blue">
                        <Icon
                          className="h-5 w-5"
                          aria-hidden="true"
                        />
                      </div>

                      <h3 className="text-lg font-semibold tracking-tight text-ink">
                        {
                          feature.title
                        }
                      </h3>

                      <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted-gray">
                        {
                          feature.description
                        }
                      </p>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="warm-section py-20 sm:py-24"
      >
        <div className="page-shell">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
            <div>
              <p className="section-kicker">
                How it works
              </p>

              <h2 className="editorial-heading mt-4 text-[clamp(36px,4.5vw,64px)] text-ink">
                Three steps to

                <span className="mt-1 block">
                  clearer money
                </span>
              </h2>

              <p className="mt-5 max-w-[480px] text-[17px] leading-relaxed text-muted-gray">
                Built for real Ghanaian money flows — salary,
                MoMo, side hustles, family support, and the bills
                that never wait.
              </p>

              <ol className="mt-10 space-y-6">
                {steps.map(
                  (item) => (
                    <li
                      key={item.step}
                      className="flex gap-4"
                    >
                      <span className="font-display text-3xl leading-none text-hero-blue">
                        {item.step}
                      </span>

                      <div>
                        <h3 className="text-lg font-semibold text-ink">
                          {
                            item.title
                          }
                        </h3>

                        <p className="mt-1 max-w-[400px] text-[15px] leading-relaxed text-muted-gray">
                          {
                            item.body
                          }
                        </p>
                      </div>
                    </li>
                  )
                )}
              </ol>

              <div className="mt-10">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() =>
                    enterApp()
                  }
                >
                  Start your pilot

                  <ArrowRight
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                </Button>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[520px]">
              <div className="absolute -left-6 -top-6 hidden w-[160px] sm:block">
                <EditorialPhoto
                  src={
                    lifestylePhotos.cafe
                  }
                  alt="Planning a weekly budget over coffee"
                  caption="weekly check-in"
                  rotation={-7}
                  aspect="square"
                  className="w-full"
                />
              </div>

              <div className="relative z-10 overflow-hidden rounded-sm border border-ink/10 bg-white p-3 shadow-[0_8px_20px_rgba(20,40,70,0.1)]">
                <img
                  src={
                    brighterTomorrowCard
                  }
                  alt="Build brighter tomorrows with MoneyPilot"
                  className="w-full object-cover"
                  loading="lazy"
                />
              </div>

              <div className="absolute -bottom-5 -right-4 hidden w-[150px] rotate-[5deg] border border-ink/10 bg-white p-2 shadow-[0_8px_20px_rgba(20,40,70,0.12)] sm:block">
                <img
                  src={
                    savingsVaultCard
                  }
                  alt="Savings vault preview"
                  className="w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BUILT FOR GHANA */}
      <section className="hero-print py-16 sm:py-20">
        <div className="page-shell">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/70">
                Built for Ghana
              </p>

              <h2 className="editorial-heading mt-4 text-[clamp(36px,4.8vw,68px)] text-white">
                Bank. MoMo.

                <span className="mt-1 block">
                  One pilot.
                </span>
              </h2>

              <p className="mt-5 max-w-[520px] text-[17px] leading-relaxed text-white/90 sm:text-lg">
                MoneyPilot is designed around how money actually
                moves — between Absa, MTN MoMo, cash, family,
                and goals that matter.
              </p>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2">
              {[
                'Unified bank + MoMo balances',
                'Safe Daily Pace budgeting',
                'Verified savings vaults',
                'AI advice that fits real life',
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-sm border border-white/20 bg-white/10 px-4 py-3 text-white"
                >
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />

                  <span className="text-sm font-medium leading-snug">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        className="paper-section py-20 sm:py-24"
      >
        <div className="page-shell">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="section-kicker">
                FAQs
              </p>

              <h2 className="editorial-heading mt-4 text-[clamp(36px,4.5vw,60px)] text-ink">
                Questions,

                <span className="mt-1 block text-deep-blue">
                  answered
                </span>
              </h2>

              <p className="mt-5 max-w-[400px] text-[16px] leading-relaxed text-muted-gray">
                Straight answers about tracking, pacing, saving,
                and getting out of debt with MoneyPilot.
              </p>
            </div>

            <div>
              {faqs.map(
                (faq, index) => {
                  const isOpen =
                    openFaq === index;

                  return (
                    <div
                      key={faq.title}
                      className="faq-item"
                    >
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-4 py-5 text-left transition-opacity duration-150 hover:opacity-80"
                        aria-expanded={
                          isOpen
                        }
                        onClick={() =>
                          setOpenFaq(
                            isOpen
                              ? -1
                              : index
                          )
                        }
                      >
                        <span className="text-[17px] font-semibold tracking-tight text-ink sm:text-lg">
                          {
                            faq.title
                          }
                        </span>

                        <ChevronDown
                          className={`h-5 w-5 shrink-0 text-muted-gray transition-transform duration-200 ${
                            isOpen
                              ? 'rotate-180'
                              : ''
                          }`}
                          aria-hidden="true"
                        />
                      </button>

                      {isOpen ? (
                        <p className="max-w-[560px] pb-5 text-[15px] leading-relaxed text-muted-gray sm:text-base">
                          {
                            faq.answer
                          }
                        </p>
                      ) : null}
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>
      </section>

      {/* COMMUNITY */}
      <section
        id="community"
        className="ink-section py-20 sm:py-24"
      >
        <div className="page-shell">
          <div className="grid items-end gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/55">
                Join the community
              </p>

              <h2 className="editorial-heading mt-4 text-[clamp(36px,5vw,68px)] text-white">
                Stay ahead with

                <span className="mt-1 block text-bright-blue">
                  smarter money moves.
                </span>
              </h2>

              <p className="mt-5 max-w-[520px] text-[17px] leading-relaxed text-white/75">
                Get practical money tips, product updates, and
                financial insights made for everyday Ghanaians —
                straight to your inbox.
              </p>
            </div>

            <form
              className="flex flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                enterApp();
              }}
            >
              <label
                htmlFor="email"
                className="sr-only"
              >
                Email address
              </label>

              <div className="flex flex-col gap-3 rounded-full border border-white/15 bg-white/5 p-1.5 sm:flex-row sm:items-center">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  placeholder="Enter your email address"
                  className="h-12 flex-1 rounded-full bg-transparent px-5 text-[15px] text-white outline-none placeholder:text-white/45"
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="sm:shrink-0"
                >
                  Open app

                  <ArrowRight
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                </Button>
              </div>

              <p className="px-2 text-sm text-white/50">
                No spam. Jump straight into your pilot console.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-ink pb-10 pt-14 text-white">
        <div className="page-shell">
          <div className="grid gap-10 border-b border-white/10 pb-12 md:grid-cols-2 lg:grid-cols-[1.3fr_0.7fr_0.7fr_0.9fr]">
            <div>
              <BrandWordmark variant="light" />

              <p className="mt-5 max-w-[380px] text-[15px] leading-relaxed text-white/65">
                An intelligent personal finance app for everyday
                Ghanaians. Track your bank and MoMo, budget better,
                use savings vaults, and get real AI guidance for a
                brighter tomorrow.
              </p>

              <p className="font-caption mt-6 text-2xl text-white/90">
                More financial freedom for a brighter Ghana.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/50">
                Product
              </h3>

              <ul className="mt-4 space-y-2.5 text-[15px] text-white/70">
                <li>
                  <a href="#features">
                    Features
                  </a>
                </li>

                <li>
                  <a href="#how-it-works">
                    How it Works
                  </a>
                </li>

                <li>
                  <button
                    type="button"
                    onClick={() =>
                      enterApp()
                    }
                    className="hover:text-white"
                  >
                    Open App
                  </button>
                </li>

                <li>
                  Security
                </li>

                <li>
                  Pricing
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/50">
                Resources
              </h3>

              <ul className="mt-4 space-y-2.5 text-[15px] text-white/70">
                <li>
                  Money Tips
                </li>

                <li>
                  Blog
                </li>

                <li>
                  Help Center
                </li>

                <li>
                  <a href="#faq">
                    FAQs
                  </a>
                </li>

                <li>
                  Financial Literacy
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/50">
                Company
              </h3>

              <ul className="mt-4 space-y-2.5 text-[15px] text-white/70">
                <li>
                  About Us
                </li>

                <li>
                  Our Mission
                </li>

                <li>
                  Careers
                </li>

                <li>
                  Contact Us
                </li>

                <li>
                  Privacy Policy
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-white/45">
              © 2026 MoneyPilot. All rights reserved.
            </p>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
              <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-bold text-ink">
                absa
              </span>

              <span className="text-white/40">
                ×
              </span>

              <span className="rounded bg-hero-blue px-1.5 py-0.5 text-[10px] font-bold text-white">
                MTN
              </span>

              <span>
                Ghana Hackathon
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;