import React from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  PieChart, 
  Target, 
  Bot, 
  CalendarClock,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export type TabType = 'dashboard' | 'transactions' | 'budgets' | 'goals-debts' | 'ai-advisor' | 'recurring';

interface NavigationProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  insightCount?: number;
  isSidebar?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  activeTab, 
  onChangeTab,
  insightCount = 4,
  isSidebar = false
}) => {
  const navItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', shortLabel: 'Home', icon: LayoutDashboard },
    { id: 'transactions' as TabType, label: 'Transactions', shortLabel: 'Ledger', icon: Receipt },
    { id: 'budgets' as TabType, label: 'Budgets', shortLabel: 'Budgets', icon: PieChart },
    { id: 'goals-debts' as TabType, label: 'Savings Goals', shortLabel: 'Goals', icon: Target },
    { 
      id: 'ai-advisor' as TabType, 
      label: 'AI Advisor', 
      shortLabel: 'AI Advisor',
      icon: Bot, 
      badge: insightCount > 0 ? `${insightCount}` : undefined
    },
    { id: 'recurring' as TabType, label: 'Bills & Subscriptions', shortLabel: 'Bills', icon: CalendarClock },
  ];

  if (isSidebar) {
    return (
      <nav className="flex-1 space-y-1.5 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-nav-${item.id}`}
              onClick={() => onChangeTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-white/10 text-emerald-400 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    );
  }

  return (
    <>
      {/* Tablet Top Horizontal Navigation Tabs (Visible on md screens, hidden on lg where sidebar is shown) */}
      <div className="bg-white/90 border-b border-slate-200/90 backdrop-blur-md sticky top-0 z-20 hidden md:block lg:hidden shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex space-x-1.5 sm:space-x-2 py-2.5 overflow-x-auto no-scrollbar scroll-smooth">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => onChangeTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all touch-manipulation ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-600' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Bottom Floating Navigation Bar (Optimized touch targets, sleek active indicator) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-slate-200/90 backdrop-blur-lg md:hidden px-1 py-1.5 shadow-2xl safe-area-bottom">
        <div className="grid grid-cols-6 gap-0.5 max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={() => onChangeTab(item.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all active:scale-95 touch-manipulation min-h-[46px] ${
                  isActive 
                    ? 'text-emerald-600 bg-emerald-50/70 font-bold' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 ${isActive ? 'scale-110 text-emerald-600 stroke-[2.5]' : 'text-slate-500'}`} />
                  {item.badge && !isActive && (
                    <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                  )}
                </div>
                <span className={`text-[9.5px] mt-1 truncate max-w-full leading-none tracking-tight ${isActive ? 'font-bold text-emerald-700' : 'font-medium text-slate-500'}`}>
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

