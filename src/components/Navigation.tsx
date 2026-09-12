import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Target,
  Bot,
  CalendarClock,
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'transactions'
  | 'budgets'
  | 'goals-debts'
  | 'ai-advisor'
  | 'recurring';

interface NavigationProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  insightCount?: number;
  isSidebar?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onChangeTab,
  insightCount = 0,
  isSidebar = false,
}) => {
  const navItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', shortLabel: 'Home', icon: LayoutDashboard },
    { id: 'transactions' as TabType, label: 'Transactions', shortLabel: 'Ledger', icon: Receipt },
    { id: 'budgets' as TabType, label: 'Budgets', shortLabel: 'Budgets', icon: PieChart },
    { id: 'goals-debts' as TabType, label: 'Savings Goals', shortLabel: 'Goals', icon: Target },
    {
      id: 'ai-advisor' as TabType,
      label: 'AI Advisor',
      shortLabel: 'AI',
      icon: Bot,
      badge: insightCount > 0 ? `${insightCount}` : undefined,
    },
    { id: 'recurring' as TabType, label: 'Bills & Subscriptions', shortLabel: 'Bills', icon: CalendarClock },
  ];

  if (isSidebar) {
    return (
      <nav className="flex-1 space-y-1 py-4" aria-label="App">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-nav-${item.id}`}
              type="button"
              onClick={() => onChangeTab(item.id)}
              className={`dash-nav-item ${isActive ? 'is-active' : ''}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`dash-nav-icon h-4.5 w-4.5 shrink-0 ${isActive ? '' : 'text-white/45'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge ? (
                <span className="rounded-full bg-hero-blue/25 px-2 py-0.5 text-[10px] font-bold text-[#9ec8ff] border border-hero-blue/30">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>
    );
  }

  return (
    <>
      <div className="sticky top-0 z-20 hidden border-b border-ink/8 bg-paper/90 backdrop-blur-md md:block lg:hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <nav className="no-scrollbar flex gap-1.5 overflow-x-auto py-2.5" aria-label="App tabs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  type="button"
                  onClick={() => onChangeTab(item.id)}
                  className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold transition touch-manipulation ${
                    isActive
                      ? 'bg-ink text-white'
                      : 'bg-white text-ink/70 border border-ink/10 hover:bg-soft-gray'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                  {item.badge ? (
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-hero-blue/15 text-deep-blue'
                    }`}>
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-ink/10 bg-paper/95 px-1 py-1.5 backdrop-blur-lg md:hidden safe-area-bottom">
        <div className="mx-auto grid max-w-md grid-cols-6 gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                type="button"
                onClick={() => onChangeTab(item.id)}
                className={`flex min-h-[46px] flex-col items-center justify-center rounded-xl px-0.5 py-1.5 transition touch-manipulation active:scale-95 ${
                  isActive ? 'bg-hero-blue/10 text-deep-blue' : 'text-muted-gray hover:text-ink'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                  {item.badge && !isActive ? (
                    <span className="absolute -right-1.5 -top-1 h-2 w-2 rounded-full bg-hero-blue ring-2 ring-paper" />
                  ) : null}
                </div>
                <span className={`mt-1 max-w-full truncate text-[9.5px] leading-none tracking-tight ${
                  isActive ? 'font-bold text-deep-blue' : 'font-medium'
                }`}>
                  {item.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
