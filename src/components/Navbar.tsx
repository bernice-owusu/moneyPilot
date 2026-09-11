import React, { useState } from 'react';
import { 
  Bell, 
  Plus, 
  User, 
  ChevronDown, 
  Check
} from 'lucide-react';
import { UserProfile, AppNotification } from '../types';

interface NavbarProps {
  profile: UserProfile;
  onSelectPersona: (personaKey: 'busy_pro' | 'saver' | 'debt_manager' | 'new_user') => void;
  onOpenNewTransaction: () => void;
  onOpenNotifications?: () => void;
  onOpenOnboarding?: () => void;
  notifications?: AppNotification[];
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  onSelectPersona,
  onOpenNewTransaction,
  onOpenNotifications,
  onOpenOnboarding,
  notifications = []
}) => {
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-white/90 border-b border-slate-200 text-slate-900 shadow-xs backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 py-2 sm:py-3">
          
          {/* Mobile / Tablet Logo (visible only on screens where desktop sidebar is hidden) */}
          <div className="flex items-center space-x-2.5 sm:space-x-3 lg:hidden">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500 flex items-center justify-center font-bold text-base sm:text-xl text-white shadow-sm shrink-0">
              M
            </div>
            <div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900">
                  MoneyPilot
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                AI Financial Assistant
              </p>
            </div>
          </div>

          {/* Desktop Left Title (on lg screens with sidebar) */}
          <div className="hidden lg:block">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Hello, {profile.name.split(' ')[0]}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Here is your financial overview for August 2026.
            </p>
          </div>

          {/* Center / Right actions */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            
            {/* Persona Switcher Dropdown */}
            <div className="relative">
              <button
                id="persona-switcher-btn"
                onClick={() => {
                  setShowPersonaMenu(!showPersonaMenu);
                }}
                className="flex items-center space-x-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold border border-slate-200 shadow-xs transition touch-manipulation"
                title="Switch demo persona"
              >
                <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="hidden sm:inline font-semibold">{profile.name}</span>
                <span className="sm:hidden text-xs">Profile</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showPersonaMenu && (
                <div 
                  className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onClick={() => setShowPersonaMenu(false)}
                >
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Active Profile</p>
                    <p className="text-sm font-bold text-slate-900">{profile.name}</p>
                    <p className="text-xs text-slate-500 font-medium">Income: {profile.currency}{profile.monthlyIncome.toLocaleString()}/month</p>
                  </div>

                  <div className="py-1">
                    <p className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Preset Scenarios</p>
                    
                    <button
                      onClick={() => onSelectPersona('busy_pro')}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${profile.selectedPersona === 'busy_pro' ? 'text-emerald-700 font-bold bg-emerald-50/60' : 'text-slate-700'}`}
                    >
                      <div>
                        <p className="font-semibold text-slate-900">Kwame Mensah</p>
                        <p className="text-[11px] text-slate-500">The Busy Pro (6,000/mo, MoMo active)</p>
                      </div>
                      {profile.selectedPersona === 'busy_pro' && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>

                    <button
                      onClick={() => onSelectPersona('saver')}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${profile.selectedPersona === 'saver' ? 'text-emerald-700 font-bold bg-emerald-50/60' : 'text-slate-700'}`}
                    >
                      <div>
                        <p className="font-semibold text-slate-900">Akua Serwaa</p>
                        <p className="text-[11px] text-slate-500">The Goal Saver (4,000/mo, laptop target)</p>
                      </div>
                      {profile.selectedPersona === 'saver' && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>

                    <button
                      onClick={() => onSelectPersona('debt_manager')}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${profile.selectedPersona === 'debt_manager' ? 'text-emerald-700 font-bold bg-emerald-50/60' : 'text-slate-700'}`}
                    >
                      <div>
                        <p className="font-semibold text-slate-900">Kofi Boateng</p>
                        <p className="text-[11px] text-slate-500">Debt Manager (5,500/mo, multi-debt payoff)</p>
                      </div>
                      {profile.selectedPersona === 'debt_manager' && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>

                    <button
                      onClick={() => onSelectPersona('new_user')}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 border-t border-slate-100 ${profile.selectedPersona === 'new_user' ? 'text-emerald-700 font-bold bg-emerald-50/60' : 'text-slate-700'}`}
                    >
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <p className="font-semibold text-slate-900">Ama Asante</p>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 uppercase">New Starter</span>
                        </div>
                        <p className="text-[11px] text-slate-500">Clean Slate (3,500/mo, no budgets/records)</p>
                      </div>
                      {profile.selectedPersona === 'new_user' && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications Button */}
            {onOpenNotifications && (
              <button
                id="notifications-toggle-btn"
                onClick={onOpenNotifications}
                className="relative p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs transition touch-manipulation"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* + Add Transaction Button */}
            <button
              id="add-transaction-primary-btn"
              onClick={onOpenNewTransaction}
              className="flex items-center gap-1 sm:gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition active:scale-95 touch-manipulation"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Add Transaction</span>
              <span className="sm:hidden font-bold">Add</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};

