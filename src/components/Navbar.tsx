import React, { useState } from 'react';
import { Bell, Plus, User, ChevronDown, Check, ArrowLeft } from 'lucide-react';
import { BrandWordmark } from './ui/BrandWordmark';
import { Button } from './ui/Button';
import { UserProfile, AppNotification } from '../types';

interface NavbarProps {
  profile: UserProfile;
  onSelectPersona: (personaKey: 'busy_pro' | 'saver' | 'debt_manager' | 'new_user') => void;
  onOpenNewTransaction: () => void;
  onOpenNotifications?: () => void;
  onOpenOnboarding?: () => void;
  onBackToLanding?: () => void;
  notifications?: AppNotification[];
  variant?: 'default' | 'hero';
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  onSelectPersona,
  onOpenNewTransaction,
  onOpenNotifications,
  onBackToLanding,
  notifications = [],
  variant = 'default',
}) => {
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const isHero = variant === 'hero';
  const firstName = profile.name.split(' ')[0];

  return (
    <header
      className={`sticky top-0 z-30 ${
        isHero
          ? 'bg-transparent border-b-0 text-white'
          : 'border-b border-ink/8 bg-paper/90 text-ink backdrop-blur-md'
      }`}
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3 py-2 sm:h-[4.5rem] sm:py-3">
          <div className="flex min-w-0 items-center gap-3 lg:hidden">
            {onBackToLanding ? (
              <button
                type="button"
                onClick={onBackToLanding}
                className="rounded-full border border-ink/10 bg-white p-2 text-ink transition hover:bg-soft-gray"
                aria-label="Back to landing"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            ) : null}
            <div className="min-w-0">
              <BrandWordmark variant={isHero ? 'light' : 'dark'} className="!text-[28px] sm:!text-[32px]" />
              <p className={`hidden text-[11px] sm:block ${isHero ? 'text-white/70' : 'text-muted-gray'}`}>
                AI Financial Assistant
              </p>
            </div>
          </div>

          <div className="hidden min-w-0 items-center gap-4 lg:flex">
            <div>
              <p className="dash-kicker">Overview</p>
              <h1 className="font-display text-[28px] leading-none tracking-tight text-ink uppercase">
                Hello, {firstName}
              </h1>
              <p className="mt-1 text-xs text-muted-gray">
                Your financial overview for August 2026.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <div className="relative">
              <button
                id="persona-switcher-btn"
                type="button"
                onClick={() => setShowPersonaMenu(!showPersonaMenu)}
                className="flex items-center gap-1.5 rounded-full border border-ink/10 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink transition hover:bg-soft-gray sm:px-3.5 sm:py-2"
                title="Switch demo persona"
              >
                <User className="h-3.5 w-3.5 shrink-0 text-deep-blue" />
                <span className="hidden font-semibold sm:inline">{profile.name}</span>
                <span className="sm:hidden">Profile</span>
                <ChevronDown className="h-3 w-3 text-muted-gray" />
              </button>

              {showPersonaMenu ? (
                <div
                  className="absolute right-0 z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-sm border border-ink/10 bg-white py-2 shadow-[0_12px_32px_rgba(20,40,70,0.12)]"
                  onClick={() => setShowPersonaMenu(false)}
                >
                  <div className="border-b border-ink/8 px-3.5 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-gray">Active Profile</p>
                    <p className="text-sm font-bold text-ink">{profile.name}</p>
                    <p className="text-xs font-medium text-muted-gray">
                      Income: {profile.currency}{profile.monthlyIncome.toLocaleString()}/month
                    </p>
                  </div>

                  {(
                    [
                      {
                        key: 'busy_pro' as const,
                        name: 'Kwame Mensah',
                        blurb: 'Busy Pro (6,000/mo, dual accounts)',
                      },
                      {
                        key: 'saver' as const,
                        name: 'Abena Owusu',
                        blurb: 'Focused Saver (4,800/mo, high savings)',
                      },
                      {
                        key: 'debt_manager' as const,
                        name: 'Kofi Boateng',
                        blurb: 'Debt Manager (5,500/mo, multi-debt payoff)',
                      },
                      {
                        key: 'new_user' as const,
                        name: 'Ama Asante',
                        blurb: 'Clean Slate (3,500/mo, no budgets/records)',
                        badge: 'New Starter',
                      },
                    ] as const
                  ).map((persona) => (
                    <button
                      key={persona.key}
                      type="button"
                      onClick={() => onSelectPersona(persona.key)}
                      className={`flex w-full items-center justify-between px-3.5 py-2 text-left text-xs hover:bg-soft-gray ${
                        profile.selectedPersona === persona.key ? 'bg-hero-blue/8 font-bold text-deep-blue' : 'text-ink'
                      } ${persona.key === 'new_user' ? 'border-t border-ink/8' : ''}`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-ink">{persona.name}</p>
                          {'badge' in persona && persona.badge ? (
                            <span className="rounded bg-hero-blue/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-deep-blue">
                              {persona.badge}
                            </span>
                          ) : null}
                        </div>
                        <p className="text-[11px] text-muted-gray">{persona.blurb}</p>
                      </div>
                      {profile.selectedPersona === persona.key ? (
                        <Check className="h-4 w-4 text-deep-blue" />
                      ) : null}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {onOpenNotifications ? (
              <button
                id="notifications-toggle-btn"
                type="button"
                onClick={onOpenNotifications}
                className="relative rounded-full border border-ink/10 bg-white p-2 text-ink transition hover:bg-soft-gray"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 ? (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-hero-blue text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                ) : null}
              </button>
            ) : null}

            <Button
              id="add-transaction-primary-btn"
              variant="primary"
              size="md"
              onClick={onOpenNewTransaction}
              className="!h-9 !px-3 sm:!h-10 sm:!px-4"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span className="hidden sm:inline">Add Transaction</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
