import React from 'react';
import { 
  X, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { FinancialHealthScore } from '../types';

interface HealthScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  healthScore: FinancialHealthScore;
  currency: string;
}

export const HealthScoreModal: React.FC<HealthScoreModalProps> = ({
  isOpen,
  onClose,
  healthScore,
  currency
}) => {
  if (!isOpen) return null;

  const pillars = [
    {
      name: 'Savings Rate & Discipline',
      score: healthScore.metrics.savingsRateScore,
      max: 25,
      description: 'Percentage of income allocated to wealth accumulation.',
      benchmark: 'Target: 20%+ savings rate'
    },
    {
      name: 'Expense Control & Budget Adherence',
      score: healthScore.metrics.budgetAdherenceScore,
      max: 25,
      description: 'Keeping total monthly expenses well below gross earnings.',
      benchmark: 'Target: < 70% burn rate'
    },
    {
      name: 'Debt-to-Income & Leverage Risk',
      score: healthScore.metrics.debtToIncomeScore,
      max: 20,
      description: 'Monthly loan repayments relative to net earnings.',
      benchmark: 'Target: < 20% DTI ratio'
    },
    {
      name: 'Emergency Buffer Cushion',
      score: healthScore.metrics.emergencyBufferScore,
      max: 20,
      description: 'Liquid cash reserves available for unexpected emergencies.',
      benchmark: 'Target: 3-6 months living expenses'
    },
    {
      name: 'Goal Momentum & Spending Consistency',
      score: healthScore.metrics.spendingConsistencyScore,
      max: 10,
      description: 'Consistent funding of active savings targets and stable buffer.',
      benchmark: 'Target: Active on-pace contributions'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs">
      <div 
        className="bg-white border border-ink/10 rounded-sm w-full max-w-lg shadow-2xl overflow-hidden text-ink max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-ink/10 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-sm bg-hero-blue/15 text-deep-blue flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-ink">Financial Health Score</h2>
              <p className="text-[11px] sm:text-xs text-muted-gray">Holistic 5-Pillar Assessment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-sm text-muted-gray hover:text-ink/80 hover:bg-soft-gray transition touch-manipulation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1">
          
          {/* Main Score Dial */}
          <div className="p-5 rounded-sm bg-soft-gray/80 border border-ink/10 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs font-bold text-muted-gray uppercase tracking-wider">
                Overall Financial Wellness
              </span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-4xl font-black text-ink">{healthScore.score}</span>
                <span className="text-sm font-semibold text-muted-gray">/ 100</span>
              </div>
              <p className="text-xs text-deep-blue font-bold mt-1">
                {healthScore.rating} • Stronger than 68% of peers
              </p>
            </div>

            <div className="w-20 h-20 rounded-full border-4 border-hero-blue/20 flex items-center justify-center relative">
              <div 
                className="w-16 h-16 rounded-full border-4 border-hero-blue flex items-center justify-center font-black text-lg text-ink"
              >
                {healthScore.score}
              </div>
            </div>
          </div>

          {/* 5 Pillars Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-muted-gray uppercase tracking-wider">
              Score Breakdown Across 5 Pillars:
            </h3>

            {pillars.map((p, idx) => {
              const percent = (p.score / p.max) * 100;
              return (
                <div key={idx} className="p-3.5 rounded-sm bg-white border border-ink/10 space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-ink">{p.name}</span>
                    <span className="font-extrabold text-deep-blue">
                      {p.score} <span className="text-muted-gray font-normal">/ {p.max} pts</span>
                    </span>
                  </div>

                  <div className="w-full bg-soft-gray rounded-full h-2 overflow-hidden border border-ink/10">
                    <div 
                      className="h-full bg-hero-blue/100 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-muted-gray">
                    <span>{p.description}</span>
                    <span className="text-ink/80 font-semibold">{p.benchmark}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-sm bg-hero-blue/10 border border-hero-blue/25 space-y-1.5 text-xs">
              <div className="flex items-center space-x-1.5 text-deep-blue font-bold">
                <CheckCircle2 className="w-4 h-4 text-deep-blue" />
                <span>Financial Strengths</span>
              </div>
              <ul className="space-y-1 text-[11px] text-ink/80">
                {healthScore.strengths.map((s, i) => (
                  <li key={i} className="flex items-start space-x-1">
                    <span className="text-deep-blue font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-sm bg-amber-50 border border-amber-200 space-y-1.5 text-xs">
              <div className="flex items-center space-x-1.5 text-amber-800 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Areas to Improve</span>
              </div>
              <ul className="space-y-1 text-[11px] text-ink/80">
                {healthScore.improvements.map((imp, i) => (
                  <li key={i} className="flex items-start space-x-1">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-ink/10 bg-soft-gray/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-sm bg-hero-blue/100 hover:bg-hero-blue text-slate-950 text-xs font-bold transition shadow-sm"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
